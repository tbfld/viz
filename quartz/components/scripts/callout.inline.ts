function toggleCallout(this: HTMLElement) {
  const outerBlock = this.parentElement!
  outerBlock.classList.toggle("is-collapsed")
  const collapsed = outerBlock.classList.contains("is-collapsed")
  const height = collapsed ? this.scrollHeight : outerBlock.scrollHeight
  outerBlock.style.maxHeight = height + "px"

  // walk and adjust height of all parents
  let current = outerBlock
  let parent = outerBlock.parentElement
  while (parent) {
    if (!parent.classList.contains("callout")) {
      return
    }

    const collapsed = parent.classList.contains("is-collapsed")
    const height = collapsed ? parent.scrollHeight : parent.scrollHeight + current.scrollHeight
    parent.style.maxHeight = height + "px"

    current = parent
    parent = parent.parentElement
  }
}

function setupCallout() {
  const collapsible = document.getElementsByClassName(
    `callout is-collapsible`,
  ) as HTMLCollectionOf<HTMLElement>
  for (const div of collapsible) {
    const title = div.firstElementChild

    if (title) {
      title.addEventListener("click", toggleCallout)
      window.addCleanup(() => title.removeEventListener("click", toggleCallout))

      const collapsed = div.classList.contains("is-collapsed")
      const height = collapsed ? title.scrollHeight : div.scrollHeight
      div.style.maxHeight = height + "px"
    }
  }
}

document.addEventListener("nav", setupCallout)
window.addEventListener("resize", setupCallout)

// ---- Open folds automatically when something inside them is the target ----
// A `[!fold]` section (see custom.scss) hides its content while collapsed, so
// a link, heading anchor, footnote or search hit that points inside one would
// otherwise land on nothing. These helpers open every collapsed fold around a
// target element.

const isCollapsedFold = (el: Element | null): el is HTMLElement =>
  !!el && el.matches('.callout[data-callout="fold"].is-collapsed')

/** Open every collapsed fold containing `el`; true if any was opened. */
function openFoldsAround(el: Element | null): boolean {
  let opened = false
  for (let node = el?.parentElement ?? null; node; node = node.parentElement) {
    if (isCollapsedFold(node)) {
      node.classList.remove("is-collapsed")
      opened = true
    }
  }
  return opened
}

// Search stores the term it was used with when a result is clicked, so the
// destination page can find the match inside a closed fold.
const SEARCH_TERM_KEY = "viz-search-term"

function takeSearchTerm(): string {
  try {
    const term = sessionStorage.getItem(SEARCH_TERM_KEY) ?? ""
    sessionStorage.removeItem(SEARCH_TERM_KEY)
    return term.trim()
  } catch {
    return ""
  }
}

/** First element in the article whose own text contains `term` and that sits
 * inside a collapsed fold. Matches outside folds are ignored on purpose: an
 * ordinary page keeps its normal scroll position. */
function findMatchInsideFold(term: string): Element | null {
  const article = document.querySelector("article")
  if (!article || !term) return null
  const needle = term.toLowerCase()
  const tokens = needle.split(/\s+/).filter(Boolean)
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = (n.textContent ?? "").toLowerCase()
    if (!(text.includes(needle) || (tokens.length > 0 && tokens.every((t) => text.includes(t)))))
      continue
    const parent = n.parentElement
    if (parent && parent.closest('.callout[data-callout="fold"].is-collapsed')) return parent
  }
  return null
}

function revealTarget() {
  const term = takeSearchTerm()
  let target: Element | null = null
  if (location.hash.length > 1) {
    try {
      target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    } catch {
      target = null
    }
  }
  if (target) {
    if (openFoldsAround(target)) target.scrollIntoView({ block: "start" })
    return
  }
  const match = findMatchInsideFold(term)
  if (match) {
    openFoldsAround(match)
    match.scrollIntoView({ block: "center" })
  }
}

document.addEventListener("nav", revealTarget)
// Same-page anchor clicks (table of contents, footnotes) don't fire "nav".
window.addEventListener("hashchange", revealTarget)
