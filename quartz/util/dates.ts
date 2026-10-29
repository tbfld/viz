/** Parse a frontmatter date. Accepts anything `new Date()` accepts, plus the
 * vault's own long timestamp format, e.g. "2026-10-04-Sun-9:55pm" (the
 * Obsidian Linter format `YYYY-MM-DD-ddd-h:mma`), which `new Date()` rejects.
 *
 * Time zones: the long format is what Obsidian writes on the author's own
 * machine, so it is read as America/New_York wall-clock time (DST handled).
 * The Instagram importer writes "YYYY-MM-DD HH:MM" in UTC, which `new Date()`
 * reads as local time of the build machine; deploy.yml pins that to UTC...
 * see the `TZ` setting on the build step there. Net effect: hand-written and imported posts sort on
 * one real timeline.
 * Returns an Invalid Date (NaN time) for anything unparseable. */
const LONG_FORMAT = /^(\d{4})-(\d{2})-(\d{2})-[A-Za-z]{3}-(\d{1,2}):(\d{2})\s*([ap]m)$/i
const AUTHOR_TZ = "America/New_York"

/** Milliseconds that AUTHOR_TZ is ahead of UTC at the given instant
 * (negative for New York). */
function tzOffsetMs(instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: AUTHOR_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant))
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
  return asUtc - Math.floor(instant / 1000) * 1000
}

export function parseLooseDate(value: unknown): Date {
  if (typeof value === "string") {
    const m = value.trim().match(LONG_FORMAT)
    if (m) {
      const [, y, mo, d, h, mi, ap] = m
      let hour = Number(h) % 12
      if (ap.toLowerCase() === "pm") hour += 12
      const wall = Date.UTC(Number(y), Number(mo) - 1, Number(d), hour, Number(mi))
      // wall-clock in AUTHOR_TZ -> UTC instant (two passes cover DST edges)
      let utc = wall - tzOffsetMs(wall)
      utc = wall - tzOffsetMs(utc)
      return new Date(utc)
    }
  }
  return new Date(value as string | number | Date)
}
