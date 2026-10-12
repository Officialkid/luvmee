/**
 * Generates a URL-safe, unique slug for public recipient experiences.
 * Example: "for-alika-a7x9q2"
 */
export function generateSlug(recipientName: string, prefix = 'for'): string {
  const cleanName = recipientName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);

  const base = cleanName ? `${prefix}-${cleanName}` : 'special-surprise';
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
 */
export function interpolatePlaceholders(
  text: string | undefined,
  creatorName: string,
  recipientName: string
): string {
  if (!text) return '';
  return text
    .replace(/{recipientName}/g, recipientName)
    .replace(/{creatorName}/g, creatorName);
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
