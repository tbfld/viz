import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { classNames } from "../util/lang"
import style from "./styles/bookToc.scss"

// Human labels for the first two segments of a book_position path, matching
// the section folders already under `content/2 main/` (and their `order`
// frontmatter: 2100..2800). Anything deeper than this is an individual
// entry, labeled by its own title -- no lookup needed.
const KNOWN_NAMES: Record<string, string> = {
  "1": "front matter",
  "2": "main",
  "2.1": "anecdata",
  "2.2": "isotype",
  "2.3": "spaces",
  "2.4": "fields",
  "2.5": "bodies",
  "2.6": "worlds",
  "2.7": "interiors",
  "2.8": "ends",
  "3": "back matter",
}

// A book_position is a dot-separated path of integers, e.g. "2.3.400".
// YAML may hand this to us as a string (the normal case) or, for a bare
// two-segment value like `2.3`, as a number -- handle both.
function parsePosition(raw: unknown): number[] | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null
  const str = String(raw).trim()
  if (str === "") return null
  const parts = str.split(".").map((p) => parseInt(p, 10))
  if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) return null
  return parts
}

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

function renderNode(node: BookNode, fileData: QuartzPluginData) {
  const sortedChildren = [...node.children.values()].sort((a, b) => a.segment - b.segment)
  if (sortedChildren.length === 0) return null

  return (
    <ul>
      {sortedChildren.map((child) => {
        const key = child.path.join(".")
        const name = KNOWN_NAMES[key]
        const title = child.page?.frontmatter?.title as string | undefined
        const label = title ?? name ?? key
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
            {renderNode(child, fileData)}
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
