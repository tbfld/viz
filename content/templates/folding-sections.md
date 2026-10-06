---
title: folding sections
publish: false
draft: false
disabled rules: [yaml-title]
---

Foldable sections in body text are `fold` callouts. They work in Obsidian and Quartz, on Mac and iOS.

```
> [!fold]- Title of a closed section
> Text that is hidden until the reader opens it.

> [!fold]+ Title of a section that starts open
> Text.
```

The `-` after `[!fold]` starts it closed; `+` starts it open.

**Nesting.** Quote again for each level:

```
> [!fold]- Level one
> Text.
>
> > [!fold]- Level two
> > Text.
> >
> > > [!fold]- Level three
> > > Text.
```

**Look.** A tint with no border (10% of the text colour; nested folds stack, so deeper levels get a little stronger), a chevron at the left of the title. Styles are at the end of `quartz/styles/custom.scss`. An ordinary callout (`[!note]`, `[!warning]`, ...) keeps its boxed look.

**Notes.**
- Put a blank quoted line (`>`) between paragraphs inside a fold.
- Folds open and close instantly (no slide animation), because Quartz's animation breaks when folds are nested.
- Not yet done: opening a fold automatically when a link or search result points to text inside it.
