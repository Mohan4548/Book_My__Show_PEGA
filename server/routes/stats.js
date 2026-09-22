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

module.exports = router;
