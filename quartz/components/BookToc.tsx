import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { classNames } from "../util/lang"
import { parsePosition } from "../util/book"
import style from "./styles/bookToc.scss"

// A book_position is a dot-separated path of integers, e.g. "2000.100.400".
// Depth has no fixed meaning -- it's just nesting. A node's label always
// comes from its own page's title; there is no hardcoded name/number
// lookup here, so renaming, regrouping, or adding a new level (a "Part",
// say) is purely a frontmatter edit, never a code change.
//
interface BookNode {
  segment: number
  path: number[]
  page?: QuartzPluginData
  children: Map<number, BookNode>
}

function getOrCreateChild(node: BookNode, segment: number, path: number[]): BookNode {
  let child = node.children.get(segment)
  if (!child) {
    child = { segment, path, children: new Map() }
    node.children.set(segment, child)
  }
  return child
}

// Groups with more than this many direct children (e.g. a holding-pen
// with dozens of posts) render folded, so a big pen doesn't swamp the
// TOC. The branch containing the current page is always open.
const FOLD_THRESHOLD = 8

function containsActive(node: BookNode, fileData: QuartzPluginData): boolean {
  if (node.page?.slug === fileData.slug) return true
  for (const c of node.children.values()) if (containsActive(c, fileData)) return true
  return false
}

function renderNode(node: BookNode, fileData: QuartzPluginData) {
  const sortedChildren = [...node.children.values()].sort((a, b) => a.segment - b.segment)
  if (sortedChildren.length === 0) return null

  return (
    <ul>
      {sortedChildren.map((child) => {
        const title = child.page?.frontmatter?.title as string | undefined
        // Fallback for a grouping node with no page of its own yet: show
        // the raw path rather than nothing, so a gap in the structure is
        // visible (and fixable) rather than silently swallowed.
        const label = title ?? child.path.join(".")
        const active = child.page?.slug === fileData.slug

        return (
          <li class={active ? "active" : undefined}>
            {child.page ? (
              <a href={resolveRelative(fileData.slug!, child.page.slug!)} class="internal">
                {label}
              </a>
            ) : (
              <span class="book-toc-heading">{label}</span>
            )}
            {child.children.size > FOLD_THRESHOLD ? (
              <details open={containsActive(child, fileData)}>
                <summary>{child.children.size} entries</summary>
                {renderNode(child, fileData)}
              </details>
            ) : (
              renderNode(child, fileData)
            )}
          </li>
        )
      })}
    </ul>
  )
}

const BookToc: QuartzComponent = ({ allFiles, fileData, displayClass }: QuartzComponentProps) => {
  const root: BookNode = { segment: -1, path: [], children: new Map() }

  for (const f of allFiles) {
    if (f.frontmatter?.book !== true) continue
    const path = parsePosition(f.frontmatter?.book_position)
    if (!path) continue

    let node = root
    for (let i = 0; i < path.length; i++) {
      node = getOrCreateChild(node, path[i], path.slice(0, i + 1))
    }
    node.page = f
  }

  const hasContent = root.children.size > 0

  return (
    <nav class={classNames(displayClass, "book-toc")}>
      <h3>
        <a href={resolveRelative(fileData.slug!, "book" as FullSlug)} class="internal">
          Book
        </a>
      </h3>
      {hasContent ? (
        renderNode(root, fileData)
      ) : (
        <p class="book-toc-empty">Nothing's been added to the book yet.</p>
      )}
    </nav>
  )
}

BookToc.css = style

export default (() => BookToc) satisfies QuartzComponentConstructor
