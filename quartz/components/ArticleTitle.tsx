import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  // Root blog index and book index are navigational landing pages — the
  // sidebar logo + breadcrumb trail already identify them, so the H1 is
  // redundant there.
  const isLandingPage = fileData.slug === "index" || fileData.slug === "book"
  if (title && !isLandingPage) {
    return <h1 class={classNames(displayClass, "article-title")}>{title}</h1>
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
