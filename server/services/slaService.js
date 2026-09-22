/**
 * SLA Service - Calculates Pega SLA status for booking cases
 * 
 * Rules:
 * Standard Mode:
 *   - Goal Missed: Unresolved after 1 day (24 hours)
 *   - Deadline Missed: Unresolved after 2 days (48 hours)
 * 
 * Fast Demo Mode:
 *   - Goal Missed: Unresolved after 1 minute (60,000 ms)
 *   - Deadline Missed: Unresolved after 2 minutes (120,000 ms)
 */

function calculateSlaStatus(booking, isDemoMode = false) {
  // Resolved or Rejected cases have fulfilled their lifecycle
  if (booking.status === 'Resolved' || booking.status === 'Rejected') {
    return {
      code: 'COMPLETED',
      label: booking.status === 'Resolved' ? 'Resolved' : 'Rejected',
      badgeColor: booking.status === 'Resolved' ? 'green' : 'gray',
      hoursElapsed: 0,
    };
  }

  const createdAtTime = new Date(booking.createdAt).getTime();
  const now = Date.now();
  const diffMs = now - createdAtTime;
  const diffMinutes = diffMs / (1000 * 60);
  const diffHours = diffMs / (1000 * 60 * 60);

  const goalThreshold = isDemoMode ? 1 : 24; // minutes vs hours
  const deadlineThreshold = isDemoMode ? 2 : 48; // minutes vs hours

  const elapsedValue = isDemoMode ? diffMinutes : diffHours;

  if (elapsedValue >= deadlineThreshold) {
    return {
      code: 'DEADLINE_MISSED',
      label: 'SLA Deadline Missed',
      badgeColor: 'red',
      elapsedFormatted: isDemoMode ? `${Math.floor(diffMinutes)}m elapsed` : `${Math.floor(diffHours)}h elapsed`,
      isBreached: true,
      severity: 'high',
    };
  } else if (elapsedValue >= goalThreshold) {
    return {
      code: 'GOAL_MISSED',
      label: 'SLA Goal Missed',
      badgeColor: 'amber',
      elapsedFormatted: isDemoMode ? `${Math.floor(diffMinutes)}m elapsed` : `${Math.floor(diffHours)}h elapsed`,
      isBreached: true,
      severity: 'medium',
    };
  } else {
    return {
      code: 'ON_TRACK',
      label: 'On Track',
      badgeColor: 'emerald',
      elapsedFormatted: isDemoMode ? `${Math.floor(diffMinutes)}m elapsed` : `${Math.floor(diffHours)}h elapsed`,
      isBreached: false,
      severity: 'low',
    };
  }
}

module.exports = {
  calculateSlaStatus,
};
