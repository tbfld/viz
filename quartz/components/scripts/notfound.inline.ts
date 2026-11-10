import { tokenize, rank, IndexEntry } from "../../util/notFoundSearch"

// 404 page: instead of "gee, thanks", treat the dead URL as a search query.
// Words from the path are matched against titles, slugs and text from the
// site's own contentIndex.json; the best matches are listed, with a link to
// something at random if nothing fits. Everything is built with textContent
// (titles are page content, not trusted HTML).

let indexPromise: Promise<IndexEntry[]> | null = null

function loadIndex(base: string): Promise<IndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch(`${base}static/contentIndex.json`)
      .then((r) => r.json())
      .then((d: Record<string, { title: string; content?: string }>) =>
        Object.entries(d).map(([slug, v]) => ({
          slug: slug.replace(/\/index$/, ""),
          title: v.title,
          content: v.content,
        })),
      )
  }
  return indexPromise
}

const el = (tag: string, text?: string, cls?: string) => {
  const e = document.createElement(tag)
  if (text !== undefined) e.textContent = text
  if (cls) e.className = cls
  return e
}

// "5-to-file/5.2-charts-graphs-and-diagrams/foo" -> "5-to-file / 5.2-charts-graphs-and-diagrams"
const where = (slug: string) => slug.split("/").slice(0, -1).join(" / ")

async function run() {
  const root = document.querySelector<HTMLElement>("article.not-found")
  const out = document.getElementById("nf-results")
  if (!root || !out) return
  const base = root.dataset.base?.endsWith("/") ? root.dataset.base : `${root.dataset.base ?? ""}/`

  const path = decodeURIComponent(window.location.pathname).replace(base, "").replace(/^\/+|\/+$/g, "")
  const terms = [...new Set(tokenize(path))]
  const pathEl = document.getElementById("nf-path")
  if (pathEl) pathEl.textContent = `/${path}`
  document.getElementById("nf-static")?.setAttribute("hidden", "")
  document.getElementById("nf-lede")?.removeAttribute("hidden")

  let entries: IndexEntry[] = []
  try {
    entries = await loadIndex(base)
  } catch {
    return // no index: leave the plain message and home link
  }

  const hits = rank(terms, entries).slice(0, 12)
  out.textContent = ""

  if (terms.length > 0) {
    const chips = el("p", undefined, "nf-terms")
    chips.append("Searched for: ")
    for (const t of terms) chips.append(el("span", t, "nf-chip"))
    out.append(chips)
  }

  if (hits.length === 0) {
    const clause = document.getElementById("nf-clause")
    if (clause) clause.textContent = "."
    out.append(el("p", "Nothing close. Try the links below, or the search box (/).", "nf-none"))
  } else {
    const list = el("ol", undefined, "nf-list")
    hits.forEach((h, i) => {
      const li = el("li", undefined, i === 0 ? "nf-top" : undefined)
      const a = el("a", h.title, "internal") as HTMLAnchorElement
      a.href = `${base}${h.slug}`
      li.append(a)
      const meta = [where(h.slug), `matched: ${h.matched.join(", ")}`].filter(Boolean).join(" · ")
      li.append(el("div", meta, "nf-meta"))
      list.append(li)
    })
    out.append(list)
  }

  const rnd = document.getElementById("nf-random") as HTMLAnchorElement | null
  if (rnd) {
    const pool = entries.filter((e) => /^(posts|5-to-file)\//.test(e.slug) || e.slug.includes("to-file/"))
    const pick = (pool.length ? pool : entries)[Math.floor(Math.random() * (pool.length || entries.length))]
    if (pick) {
      rnd.href = `${base}${pick.slug}`
      document.getElementById("nf-lucky")?.removeAttribute("hidden")
    }
  }
}

document.addEventListener("nav", run)
