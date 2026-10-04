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
          <a href={aboutPath}>about</a> / everything © <a href="https://counter.ink/">Ted Byfield</a> unless otherwise noted
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
