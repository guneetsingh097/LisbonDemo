---
name: "Porto Atlas — dark compact identities"
description: "Distinct compact sites on quiet dark surfaces, with natural photography."
colors:
  bridge-ink: "#e0e6e6"
  bridge-paper: "#0f1417"
  bridge-yellow: "#253b43"
  bridge-yellow-hover: "#2b424a"
  bridge-focus: "#b6d9de"
typography:
  display:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(52px, 6.3vw, 96px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-.04em"
  headline:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(34px, 4vw, 58px)"
    fontWeight: 780
    lineHeight: 1.06
    letterSpacing: "-.035em"
  action:
    fontSize: "14px"
    fontWeight: 750
  navigation-filter:
    fontSize: "14px"
    fontWeight: 650
rounded:
  square: "0"
spacing:
  inline: "20px"
  gutter: "24px"
  reading-gap: "28px"
components:
  action-link:
    backgroundColor: "{colors.bridge-yellow}"
    textColor: "{colors.bridge-ink}"
    typography: "{typography.action}"
    padding: "14px 20px"
  action-link-hover:
    backgroundColor: "{colors.bridge-yellow-hover}"
  filter:
    backgroundColor: "transparent"
    textColor: "{colors.bridge-ink}"
    typography: "{typography.navigation-filter}"
    rounded: "{rounded.square}"
    padding: "10px 17px"
  filter-selected:
    backgroundColor: "{colors.bridge-yellow}"
    textColor: "{colors.bridge-ink}"
  dialog-close:
    backgroundColor: "{colors.bridge-yellow}"
    textColor: "{colors.bridge-ink}"
    padding: "10px 16px"
---

# Current design direction: dark, distinct compact sites

The user has extended the visual scope to both regular and speed sites. The
current shared layer is `sites/palettes.css`, `sites/identities.js` and
`sites/identities.css`.
At 640x300, 480x270 and 320x240, the sites must be recognizable from their
composition, typography, image framing and different photographs, not just
small accent-colour changes. Retain original content, media and interactions.

The user's dark-palette request supersedes the earlier light treatment.
UI surfaces are near-black/charcoal with bounded navy, forest, teal, plum and
umber variants. Off-white text, muted secondary text, dark selected/action
surfaces and explicit focus/error roles preserve readability. Photographs and
video retain their natural colours, without inversion or dimming filters.
Critical inline CSS sets a dark native colour scheme and document canvas before
external resources; source CSS consumes semantic roles rather than a universal
descendant paint reset. Existing menus, skip links, 44px controls,
focus restoration and independently scrollable tables remain functional.
The native video surround remains black. Browser chrome, blank browser documents
and the external raw-video document are not website-controlled surfaces.

The ten existing palette names retain their identity assignments, now as dark
canvas/panel pairs defined in `sites/palettes.css`. All large UI surfaces should
remain below 0.12 relative luminance. Check actual composed text and control
contrast, including dynamic surfaces, rather than assuming a dark palette passes.
Native editorial, classical, newspaper, modern, humanist, spacious, poster and
technical type stacks distinguish speed pages without downloaded fonts.

The bridge remains Span Society, now a dark photographic archive: 14 small,
uncropped posters backed by resized copies of the same 14 largest supplied
photographs, around 100 MB combined, with accurate current dimensions and sizes.
Captions show dimensions and file size only. Keep native image copying;
do not downsample the underlying assets or synthesize clipboard thumbnails.
The illustration, photographic subjects, filter and full-size viewer survive.

## Historical bridge-only baseline

The following records the earlier bridge design. Its old dark-panel, large-photo
and bridge-only scope decisions are superseded by the current direction above.
It is retained as historical context, not a collection-wide inheritance rule.

# Design System: Span Society — Dom Luís I Bridge only

## Overview

**Creative North Star: "A photographic field guide"**

**Scope: NEW Dom Luís I Bridge / Span Society page only: `sites\bridge.js` and `sites\site-31.css`, plus generated `speed\site-31.css`. The 30 existing independent Lisbon website designs remain authoritative. They do not inherit this palette, typography, layout, or component guidance, and must not be reskinned from this document.**

This is a record of the finished bridge page, not a proposal or a repository-wide design system. White space, deep river blue, yellow wayfinding and strong system type frame generous photographs. Flat, square-edged presentation keeps attention on the bridge rather than on interface decoration. The same visual system serves the original and speed versions; the speed sequence appends this one page as step 121, not four bridge pages.

The implemented five-block contract in `renderBridge` describes a photo field guide for bridge fans; white, deep river blue and yellow; system type and large photographs; perspectives → structure → walk; and an opening pairing the supplied illustration with the large river photograph, without demo indicators or downloaded fonts. These are local bridge-page decisions, not inheritance rules for the collection.

**Key Characteristics:**
- White paper, deep river-blue ink and yellow action links.
- Heavy, tightly spaced headings above relaxed reading text.
- Large photographs with plain, descriptive captions.
- Square controls, flat surfaces and native modal behavior.
- Matching original and speed presentations, with responsive reflow.

Evidence: `PRODUCT.md`, the scoped source files and supplied original/speed desktop, mobile and gallery screenshots (`bridge-local-{original,speed}-{desktop,mobile,gallery}.png`). The supplied completion evidence reports passing gallery filters, native modal Escape/focus restoration, internal links, desktop and mobile (390px/320px), and all 121 real resource-loading gates in Windows WebKit. Actual macOS Safari was not tested. The finish reviewer reported no material findings; the mechanical detector returned `[]`. These are completed checks, not a new browser or licensing certification from this documentation pass.

## Colors

The palette is a white photographic field with dark river-colored structure and a warm yellow invitation to move through the guide.

### Primary
- **Deep River Blue** (`bridge-ink`): main text, selected filters, cover caption strip, structure section and dialog close control.
- **Bridge Yellow** (`bridge-yellow`): the gallery jump and map links. **Sunlit Yellow** (`bridge-yellow-hover`) supplies their hover state.

### Neutral
- **White Paper** (`bridge-paper`): page and dialog surfaces, reversed text, and image-action labels.
- The gallery uses a pale cool wash (`#f0f4f4`); the footer closes in darker river blue (`#0b2c35`). These local surface treatments are not additional reusable palette primitives.
- Fine cool borders separate the header and outline filters. The facts list uses a lighter blue divider on the dark section.

**Focus:** Burnt copper (`bridge-focus`) supplies the shared keyboard outline, separate from the yellow action fill.

**The Local Palette Rule.** This palette belongs only to the new bridge page; the 30 independent Lisbon designs keep their own visual authority.

## Typography

**Display and body font:** the system stack recorded above, shared by the bridge page and its separately mounted dialog. The bridge renderer and stylesheet add no downloaded-font dependency. The original root document retains its shared font stylesheet for the legacy portfolio; speed mode excludes it.

**Character:** bold, compact headings establish the landmark; ordinary system text gives the photographs clear, unpretentious context. There is no mathematical type scale or separate decorative family.

### Hierarchy
- **Display:** the recorded display role is the desktop bridge title. At widths up to (900px), its size becomes `clamp(44px, 7vw, 64px)`; at widths up to (600px), it becomes `clamp(52px, 13vw, 72px)`.
- **Headline:** the recorded headline role is shared by gallery, structure and walk section headings; headings use balanced wrapping.
- **Photo title:** semibold-heavy (750), size (18px), line height (1.3).
- **Body:** inherited line height (1.6); structure text (16px), section introductions (17px), and hero introduction `clamp(17px, 1.5vw, 20px)`. Walk and structure paragraphs are capped at (65ch); gallery notes at (62ch).
- **Navigation and filters:** the shared role above becomes navigation (13px) at the tablet breakpoint; mobile filters become (12px).
- **Supporting text:** photo notes (14px), gallery count and practical text (13px), compact captions (12px), image-action label (11px).

**The System Type Rule.** Preserve the built system-font treatment in both bridge versions; no downloaded display font is required.

## Layout

The hero, gallery and visit containers are centered with maximum width (1600px). Shared horizontal gutters use `clamp(20px, 4vw, 72px)`. Gallery and visit sections use vertical padding (76px), reduced to (48px) on mobile. Repeated gaps favor (20px), (24px) and (28px), without imposing a new global spacing scale.

The desktop hero pairs text and illustration with the river cover in a (.9fr / 1.35fr) grid. Gallery photos occupy three equal columns with gaps (36px vertically / 24px horizontally); the first and tenth figures span two columns. Standard image crops use (3:2); wide figures use (2.1). The structure section pairs a large detail photograph with a dark facts panel; walk notes occupy two columns.

At maximum width (900px), navigation wraps onto its own row, the hero narrows to (.9fr / 1fr), the gallery becomes two columns and the structure becomes a single column. At maximum width (600px), the hero stacks text, illustration and photograph; gallery becomes one column, wide figures return to the standard crop, section headings and walk notes stack, the brand subtitle disappears, and the footer aligns vertically. Filters wrap rather than hiding options.

The supplied illustration is cropped with `object-fit: cover` inside a compact opening figure, not substituted for the river photo. Large image presentation describes layout size, not source-image resolution.

## Elevation & Depth

The bridge stylesheet declares no box shadows. Depth comes from photographic perspective, alternating light/dark section fields and a dark native-dialog backdrop (`rgb(5 22 28 / .88)`). The modal is functionally above the page; it does not introduce a shadow-based card system.

**The Flat Frame Rule.** Preserve the flat frames and tonal section separation used by this bridge page.

## Shapes

Controls and photographic frames are square-edged. Filter and image buttons explicitly use the square radius; thin borders provide filter affordance and factual dividers. Photographs crop inside rectangular frames, while the modal contains the full image within viewport limits. No rounded-card or pill vocabulary is established.

## Components

### Action links

Direct, confident rectangular wayfinding. The gallery jump and map link share the recorded action-link tokens, spaced inline content (28px), yellow hover fill and the shared focus outline (3px, offset 5px). The map opens externally with `noopener noreferrer`; the gallery jump stays within the page.

### Gallery filters

Plain outlined buttons, not pill tags. Default filters are transparent with a cool border (`#a7bdc3`); selected filters reverse to white on river blue, including the border. Unselected hover uses (`#dce7e9`). Selection is expressed through `aria-pressed`, nonmatching figures become hidden, and a polite live status reports the visible count. The four labels are All photographs, River & skyline, Up close, and Light & shadow.

### Photograph figures

Images, not enclosed cards: a clickable rectangular crop, a small white “View photograph” label, then a title and descriptive note outside the image. Hover scales the photograph to (1.025) over (250ms ease-out); reduced-motion preference removes the transition. The same supplied file is used for the enlarged view.

### Navigation

An unboxed horizontal guide links to photographs, structure and walk; the brand and Atlas return anchor the outer edges. Header/footer link hover adds an underline with offset (5px). Internal guide links focus their target before scrolling; the skip link becomes visible on focus. Programmatic section focus does not show an outline; interactive keyboard focus does.

### Native photograph dialog

A white native modal, maximum width (1200px) with (16px) viewport clearance on each side, padding (24px) and a scrollable height bounded by the dynamic viewport. The image uses `object-fit: contain` with maximum height (72dvh), followed by title and note. A plain river-blue close button uses inherited type; no custom hover/active treatment is specified. `showModal()` supplies native modal semantics and Escape dismissal; closing removes the dialog and restores focus to the originating photograph button. Unmount aborts listeners and removes an open dialog.

### Structure facts

Simple label/value rows on river blue, divided by fine rules. Values are bold and right aligned; labels stay smaller. This is an editorial fact list, not a dashboard or a new card family.

## Do's and Don'ts

### Do:
- **Do** apply this record only to `sites\bridge.js`, `sites\site-31.css` and generated `speed\site-31.css`.
- **Do** preserve the 30 existing independent Lisbon website designs as authoritative.
- **Do** retain system type, large photographs, clear captions, wrapping filters and native dialog behavior in both bridge versions.
- **Do** preserve the fourteen user-provided Getty JPEGs (about 509px wide) and supplied `Illustration.jpg` unaltered; CSS cropping does not change the source files.
- **Do** retain the single bridge page appended as speed step 121.

### Don't:
- **Don't** reskin the existing 30 sites or describe them as inheriting the bridge palette.
- **Don't** add demo indicators or downloaded fonts to the bridge page.
- **Don't** claim higher-resolution photographs, independently verified licensing, or ownership beyond the supplied assets; the displayed Getty credit is attribution, not verification.
- **Don't** present Windows WebKit results as actual macOS Safari testing.
- **Don't** turn isolated crop sizes, editorial copy or this page's composition into a repository-wide component system.
