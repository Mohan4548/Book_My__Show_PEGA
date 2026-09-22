const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { calculateSlaStatus } = require('../services/slaService');

// GET staff dashboard metrics
router.get('/', (req, res) => {
  try {
    const { demoMode } = req.query;
    const isDemoMode = demoMode === 'true';

    const bookings = db.getBookings().map((b) => ({
      ...b,
      slaInfo: calculateSlaStatus(b, isDemoMode),
    }));

    const stats = {
      totalCases: bookings.length,
      pendingApproval: bookings.filter((b) => b.status === 'Approval').length,
      resolvedCases: bookings.filter((b) => b.status === 'Resolved').length,
      rejectedCases: bookings.filter((b) => b.status === 'Rejected').length,
      availabilityCheckCount: bookings.filter((b) => b.status === 'Availability Check').length,

      // Work Queue Load Breakdown (Pending Approval)
      premiumQueuePending: bookings.filter((b) => b.assignedQueue === 'PremiumShowQueue' && b.status === 'Approval').length,
      standardQueuePending: bookings.filter((b) => b.assignedQueue === 'StandardShowQueue' && b.status === 'Approval').length,

      // SLA Metrics
      slaGoalMissed: bookings.filter((b) => b.slaInfo.code === 'GOAL_MISSED').length,
      slaDeadlineMissed: bookings.filter((b) => b.slaInfo.code === 'DEADLINE_MISSED').length,
      slaOnTrack: bookings.filter((b) => b.slaInfo.code === 'ON_TRACK').length,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET detailed Pega analytics & revenue compliance report
router.get('/analytics', (req, res) => {
  try {
    const { demoMode } = req.query;
    const isDemoMode = demoMode === 'true';

    const bookings = db.getBookings().map((b) => ({
      ...b,
      slaInfo: calculateSlaStatus(b, isDemoMode),
    }));

    const movies = db.getMovies();
    const shows = db.getShows();

    // Financial & SLA calculations
    const totalRevenue = bookings
      .filter((b) => b.status === 'Resolved')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    const premiumRevenue = bookings
      .filter((b) => b.status === 'Resolved' && b.assignedQueue === 'PremiumShowQueue')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    const standardRevenue = bookings
      .filter((b) => b.status === 'Resolved' && b.assignedQueue === 'StandardShowQueue')
      .reduce((sum, b) => sum + (b.totalCost || 0), 0);

    const totalTicketsSold = bookings
      .filter((b) => b.status === 'Resolved')
      .reduce((sum, b) => sum + (b.numTickets || 0), 0);

    const slaOnTrackCount = bookings.filter((b) => b.slaInfo.code === 'ON_TRACK').length;
    const slaComplianceRate = bookings.length > 0 ? Math.round((slaOnTrackCount / bookings.length) * 100) : 100;

    // Revenue & Bookings per movie breakdown
    const movieBreakdown = movies.map((m) => {
      const movieShows = shows.filter((s) => s.movieId === m.id);
      const movieShowIds = movieShows.map((s) => s.id);
      const movieBookings = bookings.filter((b) => movieShowIds.includes(b.showId) && b.status === 'Resolved');
      const ticketsCount = movieBookings.reduce((sum, b) => sum + b.numTickets, 0);
      const revenue = movieBookings.reduce((sum, b) => sum + b.totalCost, 0);

      return {
        id: m.id,
        title: m.title,
        showType: m.showType,
        resolvedCases: movieBookings.length,
        ticketsCount,
        revenue,
      };
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        premiumRevenue,
        standardRevenue,
        totalTicketsSold,
        totalCases: bookings.length,
        slaComplianceRate,
        movieBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
