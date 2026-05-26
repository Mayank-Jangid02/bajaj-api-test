/**
 * SLA thresholds in minutes
 */
export const SLA_LIMITS = {
  urgent: 60,       // 1 hour
  high: 240,        // 4 hours
  medium: 1440,     // 24 hours
  low: 4320         // 72 hours
};

/**
 * Calculates SLA information for a ticket
 * @param {string|Date} createdAt - Ticket creation time
 * @param {string|Date|null} resolvedAt - Ticket resolution time, or null if open
 * @param {string} priority - 'low', 'medium', 'high', or 'urgent'
 * @returns {object} SLA stats containing text description, breach status, and percentage elapsed
 */
export function calculateSlaStatus(createdAt, resolvedAt, priority) {
  const createdDate = new Date(createdAt);
  const resolvedDate = resolvedAt ? new Date(resolvedAt) : new Date();
  const limitMinutes = SLA_LIMITS[priority] || 1440;

  const ageMs = Math.max(0, resolvedDate - createdDate);
  const ageMinutes = Math.floor(ageMs / (1000 * 60));

  const isBreached = ageMinutes > limitMinutes;
  const isResolved = !!resolvedAt;

  // Percentage of SLA limit consumed
  const percent = Math.min(100, Math.max(0, Math.floor((ageMinutes / limitMinutes) * 100)));

  // Format dynamic display string
  const formatDuration = (mins) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  let text;
  if (isResolved) {
    const elapsedText = formatDuration(ageMinutes);
    if (isBreached) {
      const overdueText = formatDuration(ageMinutes - limitMinutes);
      text = `Resolved in ${elapsedText} (Breached by ${overdueText})`;
    } else {
      text = `Resolved in ${elapsedText}`;
    }
  } else {
    if (isBreached) {
      const overdueText = formatDuration(ageMinutes - limitMinutes);
      text = `${overdueText} overdue`;
    } else {
      const remainingText = formatDuration(limitMinutes - ageMinutes);
      text = `${remainingText} remaining`;
    }
  }

  return {
    isBreached,
    isResolved,
    ageMinutes,
    limitMinutes,
    percent,
    text
  };
}
