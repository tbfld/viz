// Ranking for the 404 page: turn the dead URL into words and find the pages
// that look most like it. Pure functions (no DOM) so they can be tested.

export interface IndexEntry {
  slug: string
  title: string
  content?: string
}

export interface Hit {
  slug: string
  title: string
  score: number
  matched: string[]
}

const STOP = new Set([
  "a", "an", "the", "of", "and", "or", "to", "in", "on", "for", "ig", "md", "html", "htm",
  "posts", "post", "index", "www", "com", "http", "https", "book", "blog",
])

/** Lowercase, strip accents, split on anything that isn't a letter/digit. */
export function tokenize(raw: string): string[] {
  let s = raw
  try {
    s = decodeURIComponent(raw)
  } catch {}
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    // short numbers (a bare year, "2") match too much; keep date-like ones (260923)
    .filter((w) => w.length >= 2 && !STOP.has(w) && !(/^\d+$/.test(w) && w.length < 5))
}

/** true if a and b differ by at most one insertion, deletion or substitution */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else {
      i++
      j++
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

const isNumber = (w: string) => /^\d+$/.test(w)

/** Score one term against a list of words: exact > prefix > one typo. */
function wordScore(term: string, words: string[], exact: number): [number, boolean] {
  if (words.includes(term)) return [exact, true]
  if (term.length >= 3 && words.some((w) => w.startsWith(term) || (w.length >= 4 && term.startsWith(w))))
    return [exact * 0.66, true]
  if (term.length >= 5 && !isNumber(term) && words.some((w) => withinOneEdit(term, w))) return [exact * 0.5, true]
  return [0, false]
}

export function rank(terms: string[], entries: IndexEntry[], minScore = 1.5): Hit[] {
  const hits: Hit[] = []
  for (const e of entries) {
    if (e.slug === "404") continue
    const titleWords = tokenize(e.title ?? "")
    const slugWords = tokenize(e.slug)
    const text = (e.content ?? "").toLowerCase()
    let score = 0
    const matched: string[] = []
    for (const t of terms) {
      let best = 0
      const [ts, tOk] = wordScore(t, titleWords, 3)
      const [ss, sOk] = wordScore(t, slugWords, isNumber(t) ? 1 : 2)
      best = Math.max(ts, ss)
      if (best === 0 && t.length >= 4 && !isNumber(t) && text.includes(t)) best = 0.5
      if (best > 0) {
        score += best
        matched.push(t)
      }
      void tOk
      void sOk
    }
    // reward covering more of the dead URL's words, not just one strong word
    if (terms.length > 1 && matched.length > 1) score *= 1 + matched.length / terms.length / 2
    if (score >= minScore) hits.push({ slug: e.slug, title: e.title || e.slug, score, matched })
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}
