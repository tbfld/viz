const applyActiveState = (theme: "light" | "dark") => {
  const lightBtn = document.getElementById("mode-light")
  const darkBtn = document.getElementById("mode-dark")
  lightBtn?.classList.toggle("active", theme === "light")
  darkBtn?.classList.toggle("active", theme === "dark")
}

const userPref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
const currentTheme = (localStorage.getItem("theme") as "light" | "dark" | null) ?? userPref
document.documentElement.setAttribute("saved-theme", currentTheme)

const emitThemeChangeEvent = (theme: "light" | "dark") => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  })
  document.dispatchEvent(event)
}

document.addEventListener("nav", () => {
  const savedTheme = document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "light"
  applyActiveState(savedTheme)

  const setTheme = (theme: "light" | "dark") => {
    document.documentElement.setAttribute("saved-theme", theme)
    localStorage.setItem("theme", theme)
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

  const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  const themeChange = (e: MediaQueryListEvent) => {
    setTheme(e.matches ? "dark" : "light")
  }
  colorSchemeMediaQuery.addEventListener("change", themeChange)
  window.addCleanup(() => colorSchemeMediaQuery.removeEventListener("change", themeChange))
})
