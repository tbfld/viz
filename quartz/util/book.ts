import { QuartzPluginData } from "../plugins/vfile"

// A book_position is a dot-separated path of integers, e.g. "2000.100.400".
// YAML may hand it over as a string (normal) or, for a bare value like
// `2000`, as a number -- handle both.
export function parsePosition(raw: unknown): number[] | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null
  const str = String(raw).trim()
  if (str === "") return null
  const parts = str.split(".").map((p) => parseInt(p, 10))
  if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) return null
  return parts
}

/** Pages sitting exactly one level below `page` in the book, in book order. */
export function bookChildren(
  page: QuartzPluginData,
  allFiles: QuartzPluginData[],
): QuartzPluginData[] {
  if (page.frontmatter?.book !== true) return []
  const me = parsePosition(page.frontmatter?.book_position)
  if (!me) return []
  const kids: { f: QuartzPluginData; pos: number[] }[] = []
  for (const f of allFiles) {
    if (f.slug === page.slug || f.frontmatter?.book !== true) continue
    const pos = parsePosition(f.frontmatter?.book_position)
    if (pos && pos.length === me.length + 1 && me.every((n, i) => pos[i] === n)) kids.push({ f, pos })
  }
  return kids.sort((a, b) => a.pos[me.length] - b.pos[me.length]).map((k) => k.f)
}

/** A folder note: <dir>/<dir>.md, whose slug ends in the same segment twice.
 * These name a book group; they aren't content, so they aren't counted. */
export function isFolderNote(slug: string | undefined): boolean {
  const segs = (slug ?? "").split("/")
  return segs.length > 1 && segs[segs.length - 1] === segs[segs.length - 2]
}

/** Every page anywhere below `page` in the book, in reading order (a group
 * comes before its own entries). */
export function bookDescendants(
  page: QuartzPluginData,
  allFiles: QuartzPluginData[],
): QuartzPluginData[] {
  if (page.frontmatter?.book !== true) return []
  const me = parsePosition(page.frontmatter?.book_position)
  if (!me) return []
  const out: { f: QuartzPluginData; pos: number[] }[] = []
  for (const f of allFiles) {
    if (f.slug === page.slug || f.frontmatter?.book !== true) continue
    const pos = parsePosition(f.frontmatter?.book_position)
    if (pos && pos.length > me.length && me.every((n, i) => pos[i] === n)) out.push({ f, pos })
  }
  out.sort((a, b) => {
    for (let i = 0; i < Math.min(a.pos.length, b.pos.length); i++) {
      if (a.pos[i] !== b.pos[i]) return a.pos[i] - b.pos[i]
    }
    return a.pos.length - b.pos.length
  })
  return out.map((o) => o.f)
}

/** In-page anchor id for an entry in a group's reading view. */
export function entryAnchor(slug: string): string {
  return "entry-" + slug.replace(/[^a-zA-Z0-9]+/g, "-")
}
