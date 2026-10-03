import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? {}
    return (
      <footer class={`site-footer ${displayClass ?? ""}`}>
        <div class="footer-copy">viz.counter.ink — all images © the author unless noted</div>
        <nav class="footer-nav">
          {Object.entries(links).map(([text, link]) => (
            <a href={link}>{text}</a>
          ))}
        </nav>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
