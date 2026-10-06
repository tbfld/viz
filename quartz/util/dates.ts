/** Parse a frontmatter date. Accepts anything `new Date()` accepts, plus the
 * vault's own long timestamp format, e.g. "2026-10-04-Sun-9:55pm" (the
 * Obsidian Linter format `YYYY-MM-DD-ddd-h:mma`), which `new Date()` rejects.
 * The long format has no time zone, so the wall-clock time is read as UTC;
 * that keeps the displayed day equal to the day written in the note.
 * Returns an Invalid Date (NaN time) for anything unparseable. */
const LONG_FORMAT = /^(\d{4})-(\d{2})-(\d{2})-[A-Za-z]{3}-(\d{1,2}):(\d{2})\s*([ap]m)$/i

export function parseLooseDate(value: unknown): Date {
  if (typeof value === "string") {
    const m = value.trim().match(LONG_FORMAT)
    if (m) {
      const [, y, mo, d, h, mi, ap] = m
      let hour = Number(h) % 12
      if (ap.toLowerCase() === "pm") hour += 12
      return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), hour, Number(mi)))
    }
  }
  return new Date(value as string | number | Date)
}
