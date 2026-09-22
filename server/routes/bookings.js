const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { calculateSlaStatus } = require('../services/slaService');
const { sendBookingResolvedEmail } = require('../services/emailService');

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET all booking cases with filtering and SLA calculation
router.get('/', (req, res) => {
  try {
    const { queue, status, sla, search, demoMode } = req.query;
    const isDemoMode = demoMode === 'true';

    let bookings = db.getBookings();

    // Map SLA status onto each booking
    bookings = bookings.map((b) => ({
      ...b,
      caseType: 'Movie Ticket Request',
      slaInfo: calculateSlaStatus(b, isDemoMode),
    }));

    // Filter by Work Queue
    if (queue && queue !== 'all') {
      bookings = bookings.filter((b) => b.assignedQueue === queue);
    }

    // Filter by Status / Stage
    if (status && status !== 'all') {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Filter by SLA status
    if (sla && sla !== 'all') {
      bookings = bookings.filter((b) => b.slaInfo.code === sla);
    }

    // Filter by search query (Case ID or Customer Name or Email)
    if (search) {
      const queryLower = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.id.toLowerCase().includes(queryLower) ||
          b.customerName.toLowerCase().includes(queryLower) ||
          b.customerEmail.toLowerCase().includes(queryLower)
      );
    }

    // Sort by newest first
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Ticket Verification Endpoint
router.get('/verify/:id', (req, res) => {
  try {
    const caseId = req.params.id.trim();
    const booking = db.getBookingById(caseId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: `Invalid Ticket: Booking Case ${caseId} does not exist in Movexa records.`,
      });
    }

    if (booking.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: `Invalid Ticket: Booking Case ${caseId} is currently at stage "${booking.status}" and has not been resolved.`,
        data: {
          id: booking.id,
          status: booking.status,
          customerName: booking.customerName,
        },
      });
    }

    const slaInfo = calculateSlaStatus(booking, false);

    res.json({
      success: true,
      isValid: true,
      message: 'Valid Movexa Digital Movie Ticket verified successfully.',
      data: {
        ...booking,
        caseType: 'Movie Ticket Request',
        slaInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, isValid: false, message: error.message });
  }
});

// GET single booking case by ID with full Pega audit history
router.get('/:id', (req, res) => {
  try {
    const { demoMode } = req.query;
    const isDemoMode = demoMode === 'true';

    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: `Booking Case ${req.params.id} not found` });
    }

    const slaInfo = calculateSlaStatus(booking, isDemoMode);

    res.json({
      success: true,
      data: {
        ...booking,
        caseType: 'Movie Ticket Request',
        slaInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST submit new booking request (with Seat Selection & Concurrency Checks)
router.post('/', (req, res) => {
  try {
    const { customerName, customerEmail, showId, numTickets, selectedSeats } = req.body;

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    if (!customerEmail || !EMAIL_REGEX.test(customerEmail.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
    }

    if (!showId) {
      return res.status(400).json({ success: false, message: 'Show selection is required' });
    }

    // Step 1: Fetch Show details
    const show = db.getShowById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Selected show not found' });
    }

    // Determine seat array and ticket count
    let seats = Array.isArray(selectedSeats) && selectedSeats.length > 0 ? selectedSeats : [];
    let ticketsCount = seats.length > 0 ? seats.length : Number(numTickets || 1);

    if (isNaN(ticketsCount) || ticketsCount <= 0) {
      return res.status(400).json({ success: false, message: 'Must select at least 1 seat' });
    }

    // Requirement #9: Concurrency check for selected seats against bookedSeats
    const alreadyBooked = db.getBookedSeatsForShow(show.id);
    const conflicts = seats.filter((s) => alreadyBooked.includes(s));

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `One or more selected seats (${conflicts.join(', ')}) are no longer available. Please select different seats.`,
        conflictSeats: conflicts,
      });
    }

    // Seat Availability Check against overall count
    const seatsAvailable = Math.max(0, show.totalSeats - alreadyBooked.length);
    if (seatsAvailable < ticketsCount) {
      return res.status(400).json({
        success: false,
        message: `Sorry, only ${seatsAvailable} seats are available for this show.`,
        seatsAvailable,
      });
    }

    // Backend Total Cost Calculation (Never trust client value)
    const totalCost = ticketsCount * show.pricePerSeat;

    // Automatic Queue Routing based on Show.showType
    const assignedQueue = show.showType === 'Premium' ? 'PremiumShowQueue' : 'StandardShowQueue';

    // Create Case record in "Initial Stage"
    const newCase = db.createBookingCase({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      showId: Number(showId),
      numTickets: ticketsCount,
      selectedSeats: seats,
      totalCost,
      status: 'Initial Stage',
      confirmed: false,
      assignedQueue,
    });

    const fullCase = db.getBookingById(newCase.id);

    res.status(201).json({
      success: true,
      message: 'Booking request case created. Pending customer confirmation.',
      data: {
        ...fullCase,
        caseType: 'Movie Ticket Request',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirmation handler function for PUT / POST /:id/confirm
const handleConfirmBooking = (req, res) => {
  try {
    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking Case not found' });
    }

    if (booking.status !== 'Initial Stage' && booking.status !== 'Availability Check') {
      return res.status(400).json({
        success: false,
        message: `Case cannot be confirmed from current stage "${booking.status}". Expected: "Initial Stage"`,
      });
    }

    // Re-verify seat availability & collisions on backend before advancing
    const show = db.getShowById(booking.showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const alreadyBooked = db.getBookedSeatsForShow(show.id);
    // Check if other booking (excluding current) booked any of these seats
    const currentSeats = Array.isArray(booking.selectedSeats) ? booking.selectedSeats : [];
    const otherBooked = alreadyBooked.filter((s) => !currentSeats.includes(s));
    const conflicts = currentSeats.filter((s) => otherBooked.includes(s));

    if (conflicts.length > 0) {
      db.updateBookingCase(
        booking.id,
        {
          status: 'Rejected',
          rejectionReason: `Seats (${conflicts.join(', ')}) were taken by another user before confirmation`,
        },
        {
          stage: 'Rejected',
          action: 'Auto-Rejected at Confirmation',
          performedBy: 'System',
          details: `Seats (${conflicts.join(', ')}) were reserved by another customer prior to confirmation.`,
        }
      );
      return res.status(400).json({
        success: false,
        message: `Confirmation failed: One or more selected seats (${conflicts.join(', ')}) are no longer available.`,
      });
    }

    // Customer Confirmation (Initial Stage -> Availability Check -> Approval)
    const updatedCase = db.updateBookingCase(
      booking.id,
      {
        confirmed: 1,
        status: 'Approval',
      },
      {
        stage: 'Approval',
        action: 'Customer Confirmed Booking',
        performedBy: `Customer (${booking.customerName})`,
        details: `Customer explicitly confirmed booking request for seats [${currentSeats.join(', ') || 'N/A'}]. Case routed to Work Queue [${booking.assignedQueue}] for Staff Approval.`,
      }
    );

    res.json({
      success: true,
      message: `Booking Case ${booking.id} confirmed and routed to ${booking.assignedQueue} for Staff Approval.`,
      data: {
        ...db.getBookingById(booking.id),
        caseType: 'Movie Ticket Request',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT & POST /api/bookings/:id/confirm
router.put('/:id/confirm', handleConfirmBooking);
router.post('/:id/confirm', handleConfirmBooking);

// Approve Handler for PUT & POST /api/bookings/:id/approve
const handleApproveBooking = async (req, res) => {
  try {
    const { staffName } = req.body;
    const reviewer = staffName || 'Staff Agent';

    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking Case not found' });
    }

    if (!booking.confirmed) {
      return res.status(400).json({
        success: false,
        message: 'Approval failed: Customer has not confirmed the booking request.',
      });
    }

    if (booking.status !== 'Approval') {
      return res.status(400).json({
        success: false,
        message: `Case cannot be approved from current stage "${booking.status}". Required stage: "Approval"`,
      });
    }

    const show = db.getShowById(booking.showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Deduct numTickets safely from Show.seatsAvailable
    const newSeatsAvailable = Math.max(0, show.seatsAvailable - booking.numTickets);
    db.updateShow(show.id, { seatsAvailable: newSeatsAvailable });

    db.addAuditLog(
      booking.id,
      'Booking Execution',
      'Deduct Seats & Execute Booking',
      reviewer,
      `Deducted ${booking.numTickets} ticket(s) [Seats: ${booking.selectedSeats?.join(', ') || 'N/A'}] from Show ${show.id}. Remaining seats: ${newSeatsAvailable}.`
    );

    const nowIso = new Date().toISOString();
    const updatedCase = db.updateBookingCase(
      booking.id,
      {
        confirmed: 1,
        status: 'Resolved',
        resolvedAt: nowIso,
      },
      {
        stage: 'Resolved',
        action: 'Case Resolved',
        performedBy: reviewer,
        details: 'Booking execution completed successfully. Ticket correspondence sent to customer.',
      }
    );

    const movie = db.getMovieById(show.movieId);
    let emailResult = null;
    try {
      emailResult = await sendBookingResolvedEmail(booking, show, movie || { title: 'Movie', showType: 'Standard' });
    } catch (emailErr) {
      console.warn('⚠️ Nodemailer correspondence warning (handled safely):', emailErr.message);
    }

    res.json({
      success: true,
      message: `Booking Case ${booking.id} approved and resolved successfully!`,
      data: {
        ...db.getBookingById(booking.id),
        caseType: 'Movie Ticket Request',
      },
      emailResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT & POST /api/bookings/:id/approve
router.put('/:id/approve', handleApproveBooking);
router.post('/:id/approve', handleApproveBooking);

// Reject Handler for PUT & POST /api/bookings/:id/reject
const handleRejectBooking = (req, res) => {
  try {
    const { staffName, reason } = req.body;
    const reviewer = staffName || 'Staff Agent';
    const rejectionReason = reason || 'Request rejected during staff review';

    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking Case not found' });
    }

    if (booking.status === 'Resolved' || booking.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: `Case is already in final state "${booking.status}"`,
      });
    }

    const updatedCase = db.updateBookingCase(
      booking.id,
      {
        status: 'Rejected',
        rejectionReason,
        resolvedAt: new Date().toISOString(),
      },
      {
        stage: 'Rejected',
        action: 'Case Rejected',
        performedBy: reviewer,
        details: `Reason: ${rejectionReason}`,
      }
    );

    res.json({
      success: true,
      message: `Booking Case ${booking.id} has been rejected.`,
      data: {
        ...db.getBookingById(booking.id),
        caseType: 'Movie Ticket Request',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT & POST /api/bookings/:id/reject
router.put('/:id/reject', handleRejectBooking);
router.post('/:id/reject', handleRejectBooking);

module.exports = router;
