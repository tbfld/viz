import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/notFound.scss"
// @ts-ignore
import script from "../scripts/notfound.inline"

// The dead URL is turned into a search over the site's own content index
// (see scripts/notfound.inline.ts and util/notFoundSearch.ts). Without
// JavaScript, the plain message and home link below are all that shows.
const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  // If baseUrl contains a pathname after the domain, use this as the home link
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = url.pathname

  return (
    <article class="popover-hint not-found" data-base={baseDir}>
      <h1>404</h1>
      <p id="nf-static">{i18n(cfg.locale).pages.error.notFound}</p>
      <p id="nf-lede" hidden>
        There’s no page at <code id="nf-path"></code>
        <span id="nf-clause">, but based on the URL the following page(s) may be relevant:</span>
      </p>
      <div id="nf-results" aria-live="polite"></div>
      <p class="nf-fallback">
        Alternatively: <a href={baseDir}>go home</a>
        <span id="nf-lucky" hidden>
          {" "}
          <em>or</em> (as Google used to say){" "}
          <a id="nf-random" href={baseDir}>
            I’m feeling lucky
          </a>
        </span>
      </p>
    </article>
  )
}

NotFound.css = style
NotFound.afterDOMLoaded = script

export default (() => NotFound) satisfies QuartzComponentConstructor
