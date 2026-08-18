/**
 * Date helpers — the 'drop' aesthetic uses ISO-ish numeric stamps.
 */
export function stamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function iso(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

export function readable(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Estimate reading time in minutes from a body of text. */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Slugify a tag for URL use. */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}
