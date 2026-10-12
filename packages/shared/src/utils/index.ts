/**
 * Generates a URL-safe, unique slug for public recipient experiences.
 * Example: "for-alika-a7x9q2"
 */
export function generateSlug(recipientName: string, prefix = 'for'): string {
  const cleanName = (recipientName || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);

  const base = cleanName ? `${prefix}-${cleanName}` : `${prefix}-special-one`;
  const randomChars = Math.random().toString(36).substring(2, 8);
  return `${base}-${randomChars}`;
}

/**
 * Sanitizes plain text input against XSS / script injection.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Interpolates variables such as {recipientName} and {creatorName} into template text.
 * Falls back to "Someone Special" if a variable is blank.
 */
export function interpolatePlaceholders(
  text: string | undefined,
  creatorName?: string,
  recipientName?: string
): string {
  if (!text) return '';
  const finalRecipient = recipientName && recipientName.trim() ? recipientName.trim() : 'Someone Special';
  const finalCreator = creatorName && creatorName.trim() ? creatorName.trim() : 'Someone Special';
  return text
    .replace(/{recipientName}/g, finalRecipient)
    .replace(/{creatorName}/g, finalCreator);
}

/**
 * Formats an ISO date into a localized sweet romantic date string.
 */
export function formatExperienceDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Normalizes user-entered partner code to canonical uppercase "LUV-XXXX".
 * Supports inputs like "4b92", "4B92", "luv-4b92", "LUV-4B92".
 */
export function normalizePartnerCode(input: string): string {
  const trimmed = (input || '').trim().toUpperCase();
  if (!trimmed) return '';
  if (trimmed.startsWith('LUV-')) {
    return trimmed;
  }
  return `LUV-${trimmed}`;
}

/**
 * Calculates elapsed full days between connection date and now.
 * Returns 0 for today or negative/invalid inputs.
 */
export function calculateDaysInLove(connectedAt: string | Date | null | undefined): number {
  if (!connectedAt) return 0;
  try {
    const start = new Date(connectedAt).getTime();
    const now = Date.now();
    if (isNaN(start) || start > now) return 0;
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}
