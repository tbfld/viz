import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Explorer from "./Explorer"
import BookToc from "./BookToc"

// Swaps the left-column navigation per page: the normal file Explorer for
// everything, or the book table of contents for any page tagged `book: true`
// in its frontmatter. This means a single note can move between blog and
// book context just by flipping that one field, with no duplicated files
// and no separate per-page layout wiring.
export default (() => {
  const ExplorerComponent = Explorer()
  const BookTocComponent = BookToc()

  const BookAwareLeft: QuartzComponent = (props: QuartzComponentProps) => {
    const inBook = props.fileData.frontmatter?.book === true
    return inBook ? <BookTocComponent {...props} /> : <ExplorerComponent {...props} />
  }

  BookAwareLeft.css = [ExplorerComponent.css, BookTocComponent.css].filter(Boolean).join("\n")
  BookAwareLeft.beforeDOMLoaded = ExplorerComponent.beforeDOMLoaded
  BookAwareLeft.afterDOMLoaded = ExplorerComponent.afterDOMLoaded

  return BookAwareLeft
}) satisfies QuartzComponentConstructor
