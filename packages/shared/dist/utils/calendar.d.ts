/**
 * LUVMEE Date & Recurrence Engine (Phase C)
 *
 * Provides pure, timezone-safe date-only calculations for annual recurring occasions,
 * leap year handling, and countdowns.
 */
export interface NextOccurrenceResult {
    nextDate: Date;
    daysRemaining: number;
    isToday: boolean;
    isTomorrow: boolean;
    formattedCountdown: string;
}
/**
 * Calculates the next calendar occurrence for an occasion.
 * Handles annual recurrence, leap years (Feb 29 -> Feb 28 on common years),
 * and dates where the year is unknown.
 */
export declare function calculateNextOccurrence(month: number, // 1 - 12
day: number, // 1 - 31
referenceDate?: Date): NextOccurrenceResult;
/**
 * Returns days in a given month of a given year.
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * Generates calendar grid cells for a given month (Sunday-first).
 */
export declare function generateMonthGrid(year: number, month: number): Array<{
    day: number | null;
    isCurrentMonth: boolean;
}>;
//# sourceMappingURL=calendar.d.ts.map