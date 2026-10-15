/**
 * LUVMEE Date & Recurrence Engine (Phase C)
 *
 * Provides pure, timezone-safe date-only calculations for annual recurring occasions,
 * leap year handling, and countdowns.
 */
/**
 * Calculates the next calendar occurrence for an occasion.
 * Handles annual recurrence, leap years (Feb 29 -> Feb 28 on common years),
 * and dates where the year is unknown.
 */
export function calculateNextOccurrence(month, // 1 - 12
day, // 1 - 31
referenceDate = new Date()) {
    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth() + 1;
    const refDay = referenceDate.getDate();
    // Create date for this year
    let targetYear = refYear;
    // If occasion has already passed this year, it happens next year
    if (month < refMonth || (month === refMonth && day < refDay)) {
        targetYear = refYear + 1;
    }
    // Handle leap year edge case: Feb 29
    let adjustedDay = day;
    if (month === 2 && day === 29) {
        const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
        if (!isLeapYear) {
            adjustedDay = 28; // Standard recurrence fallback
        }
    }
    const nextDate = new Date(targetYear, month - 1, adjustedDay, 0, 0, 0, 0);
    const todayDate = new Date(refYear, refMonth - 1, refDay, 0, 0, 0, 0);
    const diffMs = nextDate.getTime() - todayDate.getTime();
    const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const isToday = daysRemaining === 0;
    const isTomorrow = daysRemaining === 1;
    let formattedCountdown = `In ${daysRemaining} days`;
    if (isToday)
        formattedCountdown = 'Today! 🎉';
    else if (isTomorrow)
        formattedCountdown = 'Tomorrow 💌';
    return {
        nextDate,
        daysRemaining,
        isToday,
        isTomorrow,
        formattedCountdown
    };
}
/**
 * Returns days in a given month of a given year.
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
/**
 * Generates calendar grid cells for a given month (Sunday-first).
 */
export function generateMonthGrid(year, month) {
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 6 = Sat
    const totalDays = getDaysInMonth(year, month);
    const cells = [];
    // Pad previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push({ day: null, isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= totalDays; d++) {
        cells.push({ day: d, isCurrentMonth: true });
    }
    // Pad to complete week rows (multiples of 7)
    while (cells.length % 7 !== 0) {
        cells.push({ day: null, isCurrentMonth: false });
    }
    return cells;
}
//# sourceMappingURL=calendar.js.map