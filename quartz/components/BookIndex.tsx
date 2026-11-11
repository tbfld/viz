import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { bookChildren, entryAnchor } from "../util/book"
import style from "./styles/bookIndex.scss"

// On any book page that has entries directly beneath it (a Part, a chapter,
// a "to file" pen), lists those entries automatically: Title (linked),
// Image (only if it has one), Added, Updated; each title jumps to that
// entry in the reading view below (see BookReader). Nothing to maintain: the list
// is derived from book positions, so filing a note updates it on the next
// build.
const ymd = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const day = (d: Date | undefined) => (d && !isNaN(d.getTime()) ? ymd.format(d) : null)

const BookIndex: QuartzComponent = ({ fileData, allFiles, displayClass }: QuartzComponentProps) => {
  const kids = bookChildren(fileData, allFiles)
  if (kids.length === 0) return null

  return (
    <section class={`book-index ${displayClass ?? ""}`}>
      {kids.map((f) => {
        const title = (f.frontmatter?.title as string | undefined) ?? f.slug ?? ""
        const added = day(f.dates?.created)
        const updated = day(f.dates?.modified)
        return (
          <dl class="book-index-entry">
            <dt>Title</dt>
            <dd>
              <a href={`#${entryAnchor(f.slug!)}`}>{title}</a>
            </dd>
            {f.hasImage && (
              <>
                <dt>Image</dt>
                <dd>Yes</dd>
              </>
            )}
            {added && (
              <>
                <dt>Added</dt>
                <dd>{added}</dd>
              </>
            )}
            {updated && (
              <>
                <dt>Updated</dt>
                <dd>{updated}</dd>
              </>
            )}
          </dl>
        )
      })}
    </section>
  )
}

BookIndex.css = style

export default (() => BookIndex) satisfies QuartzComponentConstructor
