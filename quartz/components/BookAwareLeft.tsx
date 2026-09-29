import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import Explorer from "./Explorer"
import BookToc from "./BookToc"

// Left-column navigation, book-view only: the book table of contents shows
// for any page tagged `book: true` in its frontmatter; every other page
// (the blog, individual posts, everything else) gets nothing here. This
// means a single note can move between blog and book context just by
// flipping that one field, with no duplicated files and no separate
// per-page layout wiring.
//
// Explorer (the whole-site file/folder tree) used to fill this slot on
// non-book pages, but the content folders are already named like book
// sections (2.1 anecdata, 2.2 isotype, ...), so it read as a second,
// unintended table of contents on every page -- including new top-level
// files like book.md/changelog.md showing up in it as if they were
// chapters. Kept imported/instantiated so its styles and interactive
// script still ship for the pages that do use it (any page tagged book:
// true renders BookToc, not Explorer, so Explorer itself is currently
// unused as a rendered component -- left wired up in case folder
// browsing is wanted back later, e.g. scoped to just the book pages).
export default (() => {
  const ExplorerComponent = Explorer()
  const BookTocComponent = BookToc()

  const BookAwareLeft: QuartzComponent = (props: QuartzComponentProps) => {
    const inBook = props.fileData.frontmatter?.book === true
    return inBook ? <BookTocComponent {...props} /> : null
  }

  BookAwareLeft.css = [ExplorerComponent.css, BookTocComponent.css].filter(Boolean).join("\n")
  BookAwareLeft.beforeDOMLoaded = ExplorerComponent.beforeDOMLoaded
  BookAwareLeft.afterDOMLoaded = ExplorerComponent.afterDOMLoaded

  return BookAwareLeft
}) satisfies QuartzComponentConstructor
