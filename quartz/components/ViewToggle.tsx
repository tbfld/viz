import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"
import { classNames } from "../util/lang"
import style from "./styles/viewToggle.scss"

const ViewToggle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const inBook = fileData.frontmatter?.book === true
  const slug = fileData.slug!

  return (
    <div class={classNames(displayClass, "view-toggle")}>
      <a
        href={resolveRelative(slug, "index" as FullSlug)}
        class={`internal${!inBook ? " active" : ""}`}
      >
        Blog
      </a>
      <span class="view-toggle-sep">·</span>
      <a
        href={resolveRelative(slug, "book" as FullSlug)}
        class={`internal${inBook ? " active" : ""}`}
      >
        Book
      </a>
    </div>
  )
}

ViewToggle.css = style

export default (() => ViewToggle) satisfies QuartzComponentConstructor
