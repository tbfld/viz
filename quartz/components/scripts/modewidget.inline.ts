type Theme = "light" | "dark"
type Section = "blog" | "book"

// Default theme per section, used until a reader picks one themselves.
// This deliberately replaces "follow the OS color scheme" — the two
// sections are meant to look different out of the box.
const SECTION_DEFAULTS: Record<Section, Theme> = {
  blog: "dark",
  book: "light",
}

// Set server-side by Head.tsx from the page's `book` frontmatter flag.
const getSection = (): Section =>
  document.querySelector('meta[name="mode-section"]')?.getAttribute("content") === "book"
    ? "book"
    : "blog"

// A reader's explicit Light/Dark choice is remembered per section, so
// switching the book to dark doesn't also flip the blog (and vice versa).
const storageKey = (section: Section) => `theme-${section}`

const resolveTheme = (section: Section): Theme => {
  const stored = localStorage.getItem(storageKey(section))
  return stored === "light" || stored === "dark" ? stored : SECTION_DEFAULTS[section]
}

const applyActiveState = (theme: Theme) => {
  const lightBtn = document.getElementById("mode-light")
  const darkBtn = document.getElementById("mode-dark")
  lightBtn?.classList.toggle("active", theme === "light")
  darkBtn?.classList.toggle("active", theme === "dark")
}

const emitThemeChangeEvent = (theme: Theme) => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  })
  document.dispatchEvent(event)
}

// Runs in <head> before first paint, so the right theme is on <html>
// before any content renders.
document.documentElement.setAttribute("saved-theme", resolveTheme(getSection()))

document.addEventListener("nav", () => {
  // Navigating between blog and book pages (client-side, no reload) can
  // land in a section with a different theme.
  const section = getSection()
  const desired = resolveTheme(section)
  if (document.documentElement.getAttribute("saved-theme") !== desired) {
    document.documentElement.setAttribute("saved-theme", desired)
    emitThemeChangeEvent(desired)
  }
  applyActiveState(desired)

  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute("saved-theme", theme)
    localStorage.setItem(storageKey(section), theme)
    applyActiveState(theme)
    emitThemeChangeEvent(theme)
  }

  const lightBtn = document.getElementById("mode-light") as HTMLButtonElement | null
  const darkBtn = document.getElementById("mode-dark") as HTMLButtonElement | null
  const onLight = () => setTheme("light")
  const onDark = () => setTheme("dark")
  lightBtn?.addEventListener("click", onLight)
  darkBtn?.addEventListener("click", onDark)
  window.addCleanup(() => lightBtn?.removeEventListener("click", onLight))
  window.addCleanup(() => darkBtn?.removeEventListener("click", onDark))
})
