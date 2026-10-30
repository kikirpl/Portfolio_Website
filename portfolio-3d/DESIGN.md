---
name: Night Gallery
description: A dark gallery where the websites he built are the only light sources.
colors:
  ink: "#07080b"
  ink-raised: "#0b0d12"
  ink-surface: "#11141b"
  ink-high: "#1a1e27"
  horizon: "#0b0d13"
  bezel-metal: "#14161c"
  porcelain: "#eef1f7"
  mist: "#b4bac8"
  dusk: "#858b9c"
  moonlight: "#a9bbff"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.4rem + 4.6vw, 5.6rem)"
    fontWeight: 720
    lineHeight: 0.94
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 116"
  headline:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.6vw, 3.6rem)"
    fontWeight: 680
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.2vw, 2.35rem)"
    fontWeight: 660
    lineHeight: 1.04
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 114"
  lead:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.02rem + 0.35vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.03em"
  data:
    fontFamily: "Martian Mono Variable, Martian Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.01em"
    fontFeature: "'tnum' 1"
rounded:
  control: "4px"
  frame: "6px"
  sheet: "8px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 5.5rem)"
  header: "4.25rem"
  column: "min(32rem, 34vw)"
  rail-space: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.moonlight}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 1.15rem"
    height: "2.875rem"
  button-primary-hover:
    backgroundColor: "{colors.porcelain}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.porcelain}"
    rounded: "{rounded.control}"
    padding: "0 1.15rem"
    height: "2.875rem"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.porcelain}"
    rounded: "{rounded.control}"
    padding: "0.3rem 0.65rem"
  nav-link:
    textColor: "{colors.mist}"
    typography: "{typography.body}"
  nav-link-active:
    textColor: "{colors.porcelain}"
---

# Design System: Night Gallery

## Overview

**Creative North Star: "The Night Gallery"**

A gallery after closing time: graphite dark, cool moonlight from above, a polished obsidian floor, and the work itself as the only real light. Each website preview is a screen in a dark brushed-metal bezel that lights the floor in its own colour, and the interface borrows that colour while the project is in view. Everything else stays quiet, porcelain type on near-black, so the screens carry the page.

The page is one long walk: a ring of every preview around a faceted glass core, a corridor of screens, a tunnel of lit portals for the experience timeline, and a beacon at the end. Text lives in an HTML column beside a 3D stage; the camera frames each object clear of the text at every aspect ratio. Motion is weighted and cinematic, never bouncy, and every moving thing stops for reduced motion.

**Key Characteristics:**
- Near-black graphite ground with a cool fill; no pure black, no pure white.
- One accent at a time, and it is the colour of the work in view.
- Wide, heavy Archivo for names and headings; normal-width Archivo for reading; Martian Mono only for data.
- Light sources are fixtures set into dark metal, never free-floating neon.
- A 2D version of the same page exists for no-WebGL, software rendering, reduced motion by choice, and no JavaScript.

## Colors

Restrained and cool: graphite neutrals tinted toward blue, one moonlight accent that hands over to the colour of each project.

### Primary
- **Moonlight** (#a9bbff): the scene's own light and the UI accent whenever no project is in view: primary buttons, active nav underline, rail tick, focus rings, the core lattice, gate strips, the beacon.

### Neutral
- **Ink** (#07080b): the page ground and scene background.
- **Ink Raised / Surface / High** (#0b0d12, #11141b, #1a1e27): 2D sheets, screen frames in the 2D version, scrollbar thumb.
- **Horizon** (#0b0d13): fog and the sky dome's horizon, so the floor dissolves into the night.
- **Bezel Metal** (#14161c): screen bezels, gate portals and the beacon ring (metalness 0.9, roughness ≈0.32).
- **Porcelain** (#eef1f7): headings, names, primary text on dark.
- **Mist** (#b4bac8): body copy and secondary text.
- **Dusk** (#858b9c): labels, counters, quiet metadata (5:1 on Ink).
- Lines are Porcelain-tinted at 13% (hairlines) and 26% (control borders).

### Named Rules
**The Work Is The Light Rule.** Interface colour comes from the project in view: its preview's sampled accent, lifted in OKLCH to lightness 0.80 and chroma 0.11–0.17 so every project glows with equal weight. When no project is in view the accent is Moonlight. No other accent colours exist.

**The One Accent Rule.** Only one accent is visible at a time; it transitions (900 ms) rather than mixing with another.

## Typography

**Display Font:** Archivo Variable (width and weight axes), with system-ui
**Body Font:** Archivo Variable at normal width
**Data Font:** Martian Mono Variable, with ui-monospace

**Character:** One grotesk family stretched for the voice and relaxed for reading: expanded and heavy on names and headings, normal width in paragraphs. The mono is a measuring instrument, used only where something is counted or dated.

### Hierarchy
- **Display** (720, clamp 2.6–5.6rem, 0.94, width 116%): the name in the hero only.
- **Headline** (680, clamp 2–3.6rem, 1.0, width 118%): section headings and the open project's title.
- **Title** (650–660, clamp 1.5–2.35rem, 1.04–1.08, width 112–114%): project names and experience roles.
- **Lead** (400, clamp 1.125–1.3rem, 1.55): hero sentence, section subheadings, roles line, project descriptions in the detail view.
- **Body** (400, 1.0625rem, 1.6): paragraphs, capped at 52–62ch.
- **Label** (500, 0.75rem, +0.03em): UI labels: rail marks, contact row names, skills groups, Previous/Next, the scroll cue.
- **Data** (Martian Mono 400, 0.75rem, tabular figures): dates, counters ("01 / 10"), tech stacks, file sizes, the code-style signature.

### Named Rules
**The Data-Only Mono Rule.** Martian Mono marks data and code, never interface labels. A label in mono is a costume.

**The No-Eyebrow Rule.** Nothing small sits above a heading: counters go beside it, dates go below it.

## Layout

A single scrolling page. On wide screens (aspect ratio above 17/20) the viewport splits into a 3D stage and a text column: panels are `min(32rem, 34vw)` wide (About and Contact slightly wider), inside the gutter (`clamp(1.25rem, 5vw, 5.5rem)`), and right-hand panels keep 3rem clear for the position rail. Panels alternate sides with the screens they describe. On portrait screens the 3D focal object takes the upper part of the viewport and the panel sits below it.

Each section is a scroll track: a panel or intro block per camera stop (projects ~86svh, experience entries ~80svh, intros ~80svh). A panel taller than the viewport anchors its stop near its own top so the heading is always visible. The header is 4.25rem; the rail is fixed at the right edge (a thin progress line under the header on narrow screens).

### Named Rules
**The Column Rule.** The camera never puts a focal object under text: framing reserves the column, the column never grows into the stage.

## Elevation & Depth

Depth belongs to the scene: fog, a reflective floor, soft PCF shadows from a moonlight that follows the camera, bloom on light sources, a vignette and fine grain. The HTML layer is flat; text over the scene sits on a soft local shade (a radial gradient of Ink at 82% fading out), never a card or a blur. In the 2D version, preview screens are framed sheets lifted by one deep soft shadow plus a glow in the project's colour.

### Shadow Vocabulary
- **Screen lift** (`0 40px 80px -40px rgb(0 0 0 / 0.9), 0 0 120px -50px <project colour>`): 2D preview frames.
- **Stack lift** (`0 30px 60px -20px rgb(0 0 0 / 0.8), 0 0 70px -30px <project colour>`): the 2D hero preview stack.

### Named Rules
**The Material Light Rule.** Light in the scene comes from fixtures set into dark metal (screens, gate strips, the beacon ring) or from the work itself; free-floating neon outlines are out.

## Shapes

Precise and nearly square. Controls and chips use a 4px radius, preview frames 6px, the 2D detail sheet 8px; 3D screens have a 2.5cm display radius inside a 3cm bevelled bezel. Lines are 1px. Circles appear only in the reactive cursor and the beacon.

## Components

### Buttons
- **Shape:** gently squared (4px), 2.875rem tall, Archivo 560 at 108% width.
- **Primary:** filled with the current accent (Moonlight, or the project's colour inside a project panel), Ink text.
- **Ghost:** transparent with a 26% Porcelain border; the border brightens to Mist on hover.
- **Hover / Focus:** primary turns Porcelain; icons slide 3px in their direction; focus is a 2px accent outline offset 3px.

### Chips
- **Style:** 1px hairline border, 4px radius, Porcelain text at 0.875rem; used for the skills list only.

### Navigation
- **Header:** RM1 brand in expanded Archivo 800; section links in Mist turning Porcelain, the active one underlined by a 1px accent line drawn left to right; a bordered CV button. On phones: an opaque bar with the current section name and a Menu disclosure that opens a full-width list in title size.
- **Rail:** a tick per section on the right edge, the active tick longer and in the accent with its label shown, plus a 1px progress line.

### Project panel (signature)
Title-size project name with its "01 / 10" counter beside it, description in Body, tech stack in Data tinted with the project's colour, a primary "View project" button in that colour and ghost buttons for links. Hovering or focusing the button lights up its screen in the scene.

### Project detail (signature)
A native dialog: on wide screens a right-hand panel over a darkening gradient while the camera flies to frame the screen in the remaining space; on portrait screens a bottom sheet under the framed screen; in 2D a centred sheet with the full preview. Close (Esc) at the top, Previous / counter / Next at the bottom, arrow keys step between projects.

### Contact rows
Full-width rows separated by hairlines: icon, label, value in Lead size, and an action arrow that lifts on hover; email has a separate Copy control that confirms in place.

## Do's and Don'ts

### Do:
- **Do** take colour from the work: use the project's lifted accent while it is in view, Moonlight otherwise.
- **Do** keep every word in HTML beside the scene, inside the text column on wide screens.
- **Do** use Martian Mono only for dates, counters, tech stacks, sizes and code.
- **Do** give every 3D action an HTML control (each screen has its "View project" button).
- **Do** stop all decorative motion under reduced motion; the camera snaps instead of flying.

### Don't:
- **Don't** add a second accent colour or a gradient on text.
- **Don't** put a counter, date or label above a heading.
- **Don't** draw light as free-floating neon outlines; set it into metal or let the work emit it.
- **Don't** put text on cards, glass or blur over the scene; use the soft local shade.
- **Don't** let a panel grow into the 3D stage on wide screens.
