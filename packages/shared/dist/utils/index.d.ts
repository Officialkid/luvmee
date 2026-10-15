/**
 * Generates a URL-safe, unique slug for public recipient experiences.
 * Example: "for-alika-a7x9q2"
 */
export declare function generateSlug(recipientName: string, prefix?: string): string;
/**
 * Sanitizes plain text input against XSS / script injection.
 */
export declare function sanitizeText(input: string): string;
/**
 * Interpolates variables such as {recipientName} and {creatorName} into template text.
 * Falls back to "Someone Special" if a variable is blank.
 */
export declare function interpolatePlaceholders(text: string | undefined, creatorName?: string, recipientName?: string): string;
/**
 * Formats an ISO date into a localized sweet romantic date string.
 */
export declare function formatExperienceDate(isoString: string): string;
/**
 * Normalizes user-entered partner code to canonical uppercase "LUV-XXXX".
 * Supports inputs like "4b92", "4B92", "luv-4b92", "LUV-4B92".
 */
export declare function normalizePartnerCode(input: string): string;
/**
 * Calculates elapsed full days between connection date and now.
 * Returns 0 for today or negative/invalid inputs.
 */
export declare function calculateDaysInLove(connectedAt: string | Date | null | undefined): number;
/**
 * Normalizes username input to lowercase and trims surrounding whitespace.
 */
export declare function normalizeUsername(input: string): string;
/**
 * Generates a clean, unique-friendly fallback username from user metadata (e.g., Google full name or email prefix).
 * Never exposes full email domains or sensitive characters.
 */
export declare function generateUsernameFromMetadata(metadata: {
    name?: string | null;
    fullName?: string | null;
    email?: string | null;
}): string;
/**
 * Evaluates whether an authenticated session has been inactive for more than two months (60 days).
 */
export declare function isSessionInactiveTwoMonths(lastActiveAt: string | number | Date | null | undefined, nowMs?: number): boolean;
/**
 * Safely constructs a public recipient experience URL.
 * Enforces protocol, trims trailing slashes, and ensures non-empty slug.
 */
export declare function buildRecipientExperienceUrl(slug: string, baseUrl?: string): string;
export * from './calendar.js';
//# sourceMappingURL=index.d.ts.map