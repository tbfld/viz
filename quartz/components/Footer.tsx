import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

interface Options {
  aboutPath: string
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const aboutPath = opts?.aboutPath ?? "/1-front-matter/1.1-about"
    return (
      <footer class={`site-footer ${displayClass ?? ""}`}>
        <div class="footer-copy">
          viz.counter.ink — everything © Ted Byfield unless otherwise noted — <a href={aboutPath}>about</a>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
