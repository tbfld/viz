import { Element, ElementContent, Root } from "hast"
import { visit } from "unist-util-visit"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, normalizeHastElement, resolveRelative } from "../util/path"
import { htmlToJsx } from "../util/jsx"
import { bookDescendants, entryAnchor, parsePosition } from "../util/book"
import style from "./styles/bookReader.scss"

// The reading view of a book group: under the group's own text (and the
// BookIndex list), shows the full content of everything beneath it, in
// book_position order, as one scrolling page. Each entry gets a heading
// (linked to its own page) whose level follows how deep it sits.
//
// Embedded pages keep relative image/link URLs that only make sense from
// their own location, so each is rebased for this page with Quartz's
// normalizeHastElement (the same helper transcludes use), which also works
// on a copy, so the original page is untouched.
const ymd = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const day = (d: Date | undefined) => (d && !isNaN(d.getTime()) ? ymd.format(d) : null)

const BookReader: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
  const entries = bookDescendants(fileData, allFiles)
  if (entries.length === 0) return null
  const base = parsePosition(fileData.frontmatter?.book_position)!.length

  return (
    <div class={`book-reader ${displayClass ?? ""}`}>
      {entries.map((f) => {
        const depth = parsePosition(f.frontmatter?.book_position)!.length - base
        const Heading = `h${Math.min(depth + 1, 6)}` as "h2"
        const title = (f.frontmatter?.title as string | undefined) ?? f.slug ?? ""
        const added = day(f.dates?.created)
        const updated = day(f.dates?.modified)

        let body = null
        const ast = f.htmlAst as Root | undefined
        if (ast && ast.children.length > 0) {
          const children = ast.children.map((c) =>
            normalizeHastElement(c as Element, fileData.slug! as FullSlug, f.slug! as FullSlug),
          ) as ElementContent[]
          const root: Root = { type: "root", children }
          // many images on one page: don't fetch them all up front
          visit(root, "element", (el) => {
            if (el.tagName === "img" && el.properties?.loading === undefined) {
              el.properties = { ...el.properties, loading: "lazy" }
            }
          })
          body = htmlToJsx(f.filePath!, root)
        }

        return (
          <section class="book-reader-entry" id={entryAnchor(f.slug!)}>
            <Heading>
              <a href={resolveRelative(fileData.slug!, f.slug!)} class="internal">
                {title}
              </a>
            </Heading>
            {(added || updated) && (
              <p class="book-reader-meta">
                {added && <>Added {added}</>}
                {added && updated && " · "}
                {updated && <>Updated {updated}</>}
              </p>
            )}
            {body}
          </section>
        )
      })}
    </div>
  )
}

BookReader.css = style

export default (() => BookReader) satisfies QuartzComponentConstructor
