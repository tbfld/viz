import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { classNames } from "../util/lang"
import style from "./styles/bookToc.scss"

// Canonical section order, matching the `order` frontmatter already used on
// the section folder notes under `content/2 main/` (2100..2800), plus front
// and back matter as bookends. Anything not listed here sorts alphabetically
// after these, so new sections don't require a code change.
const SECTION_ORDER: Record<string, number> = {
  "front matter": 1000,
  anecdata: 2100,
  isotype: 2200,
  spaces: 2300,
  fields: 2400,
  bodies: 2500,
  worlds: 2600,
  interiors: 2700,
  ends: 2800,
  "back matter": 3000,
}

function sectionRank(name: string): number {
  return SECTION_ORDER[name.trim().toLowerCase()] ?? 9999
}

function bookOrderOf(f: QuartzPluginData): number {
  const raw = f.frontmatter?.book_order
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw) : NaN
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
}

const BookToc: QuartzComponent = ({ allFiles, fileData, displayClass }: QuartzComponentProps) => {
  const entries = allFiles.filter(
    (f) => f.frontmatter?.book === true && typeof f.frontmatter?.book_section === "string",
  )

  const bySection = new Map<string, QuartzPluginData[]>()
  for (const f of entries) {
    const section = (f.frontmatter!.book_section as string).trim()
    if (section === "") continue
    if (!bySection.has(section)) bySection.set(section, [])
    bySection.get(section)!.push(f)
  }

  const sections = [...bySection.keys()].sort((a, b) => {
    const rankDiff = sectionRank(a) - sectionRank(b)
    return rankDiff !== 0 ? rankDiff : a.localeCompare(b)
  })

  return (
    <nav class={classNames(displayClass, "book-toc")}>
      <h3>
        <a href={resolveRelative(fileData.slug!, "book" as FullSlug)} class="internal">
          Book
        </a>
      </h3>
      {sections.length === 0 && (
        <p class="book-toc-empty">Nothing's been added to the book yet.</p>
      )}
      <ul class="book-toc-sections">
        {sections.map((section) => {
          const items = bySection.get(section)!.sort((a, b) => {
            const orderDiff = bookOrderOf(a) - bookOrderOf(b)
            if (orderDiff !== 0) return orderDiff
            const at = (a.frontmatter?.title as string) ?? ""
            const bt = (b.frontmatter?.title as string) ?? ""
            return at.localeCompare(bt)
          })
          return (
            <li class="book-toc-section">
              <span class="book-toc-section-title">{section}</span>
              <ul class="book-toc-entries">
                {items.map((item) => {
                  const active = item.slug === fileData.slug
                  return (
                    <li class={active ? "active" : undefined}>
                      <a href={resolveRelative(fileData.slug!, item.slug!)} class="internal">
                        {(item.frontmatter?.title as string) ?? item.slug}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

BookToc.css = style

export default (() => BookToc) satisfies QuartzComponentConstructor
