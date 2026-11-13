import type { Element, Root } from "hast"
import { QuartzTransformerPlugin } from "../types"

// TB ADDED 2026-11-12: image captions.
//
// Convention: an image alone in its paragraph, then (after a blank line) a
// paragraph that is entirely italic:
//
//     ![[some-image.jpg]]
//
//     *A caption, written as one italic paragraph.*
//
// CSS alone can't tell that apart from ordinary prose with one italic phrase
// in it (`:only-child` ignores text nodes), so this tags the pair at build
// time: the image paragraph gets .image-with-caption and the caption
// paragraph gets .image-caption. Styling lives in styles/custom.scss.

const isWs = (n: any) => n?.type === "text" && !String(n.value).trim()
const isEl = (n: any, tag: string): n is Element => n?.type === "element" && n.tagName === tag
const content = (el: Element) => el.children.filter((c) => !isWs(c))

// <p> whose only content is an <img> (or a link around one)
function isImageOnly(p: Element): boolean {
  const kids = content(p)
  if (kids.length !== 1) return false
  const k = kids[0]
  if (isEl(k, "img")) return true
  if (isEl(k, "a")) {
    const inner = content(k)
    return inner.length === 1 && isEl(inner[0], "img")
  }
  return false
}

// <p> whose only content is a single <em>
function isItalicOnly(p: Element): boolean {
  const kids = content(p)
  return kids.length === 1 && isEl(kids[0], "em")
}

function addClass(el: Element, cls: string) {
  el.properties ??= {}
  const cur = el.properties.className
  const list = Array.isArray(cur) ? cur.map(String) : cur ? [String(cur)] : []
  if (!list.includes(cls)) list.push(cls)
  el.properties.className = list
}

function walk(node: any) {
  const kids = node?.children
  if (!Array.isArray(kids)) return
  for (let i = 0; i < kids.length; i++) {
    const a = kids[i]
    if (isEl(a, "p") && isImageOnly(a)) {
      let j = i + 1
      while (j < kids.length && isWs(kids[j])) j++
      const b = kids[j]
      if (isEl(b, "p") && isItalicOnly(b)) {
        addClass(a, "image-with-caption")
        addClass(b, "image-caption")
      }
    }
    walk(a)
  }
}

export const ImageCaption: QuartzTransformerPlugin = () => ({
  name: "ImageCaption",
  htmlPlugins() {
    return [
      () => (tree: Root) => {
        walk(tree)
      },
    ]
  },
})
