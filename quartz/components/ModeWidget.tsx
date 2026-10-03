// @ts-ignore: this is safe, we don't want to actually make modewidget.inline.ts a module as
// modules are automatically deferred and we don't want that to happen for critical beforeDOMLoads
// see: https://v8.dev/features/modules#defer
import modeWidgetScript from "./scripts/modewidget.inline"
import style from "./styles/modeWidget.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"
import { classNames } from "../util/lang"

const ModeWidget: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const inBook = fileData.frontmatter?.book === true
  const slug = fileData.slug!

  return (
    <div class={classNames(displayClass, "mode-widget")}>
      <a href={resolveRelative(slug, "index" as FullSlug)} class={`cell${!inBook ? " active" : ""}`}>
        Blog
      </a>
      <a href={resolveRelative(slug, "book" as FullSlug)} class={`cell${inBook ? " active" : ""}`}>
        Book
      </a>
      <button type="button" class="cell" id="mode-light">
        Light
      </button>
      <button type="button" class="cell" id="mode-dark">
        Dark
      </button>
    </div>
  )
}

ModeWidget.beforeDOMLoaded = modeWidgetScript
ModeWidget.css = style

export default (() => ModeWidget) satisfies QuartzComponentConstructor
