## ADDED Requirements

### Requirement: Design token palette

The application SHALL expose the Wake Up Zine palette as CSS custom properties on `:root`, with these exact values: `--paper: #f3e9c4`, `--paper-2: #ecddaa`, `--ink: #181410`, `--hot: #ff2e63`, `--hot-2: #e51a4d`, `--punch: #ffd400`, `--cool: #1d4d8a`. The same tokens MUST be available as Tailwind theme colors so `bg-hot`, `text-ink`, `border-paper-2` resolve correctly.

#### Scenario: A new component uses palette tokens
- **WHEN** a developer writes `<div className="bg-hot text-paper">…</div>` or `<div style={{ background: 'var(--hot)' }}>…</div>`
- **THEN** the rendered background is hex `#ff2e63` and the text color is `#f3e9c4`

#### Scenario: Dark mode inverts background and text
- **WHEN** `html.dark` is present
- **THEN** `body` background is `var(--ink)` and `body` text color is `var(--paper)`
- **AND** `--hot`, `--punch`, `--cool` retain their light-mode hex values

### Requirement: Display + body + hand type pairing

The application SHALL load three Google Fonts via `next/font/google` with self-hosting: **Anton** (display, single weight), **Space Grotesk** (body, weights 400/500/600/700), and **Permanent Marker** (hand, single weight). The fonts MUST expose CSS custom properties `--font-display`, `--font-body`, `--font-hand` so the existing `font-display: var(--font-display)` Tailwind class continues to work.

#### Scenario: Page loads without external font request
- **WHEN** any page is requested
- **THEN** the HTML response does NOT include `<link rel="stylesheet" href="https://fonts.googleapis.com/...">`
- **AND** font files are served from the same origin as the page

#### Scenario: Display headings render in Anton
- **WHEN** the home page renders the H1
- **THEN** the computed font-family on the H1 element starts with the Anton family

### Requirement: Fluid type scale

The application SHALL define a fluid type scale using `clamp()` exposed as CSS custom properties on `:root`: `--t-scream-xl: clamp(56px, 8.5vw, 86px)`, `--t-scream-lg: clamp(40px, 5.5vw, 62px)`, `--t-scream-md: clamp(34px, 4.5vw, 54px)`, `--t-scream-sm: clamp(26px, 3vw, 42px)`, `--t-scream-xs: clamp(20px, 2.2vw, 28px)`, `--t-body-lg: clamp(16px, 1.6vw, 19px)`, `--t-body: clamp(14px, 1.3vw, 17px)`, `--t-body-sm: 13px`, `--t-label: 11px`.

#### Scenario: H1 scales with viewport
- **WHEN** the landing page H1 renders at viewport widths 360px, 768px, and 1280px
- **THEN** the H1's computed font size is approximately 56px, 65px, and 86px respectively (clamp lower bound, fluid midrange, upper bound)

### Requirement: Geometry tokens — rules, shadows, radii

The application SHALL define geometry tokens on `:root`: `--rule: 2.5px solid var(--ink)`, `--rule-bold: 3px solid var(--ink)`, `--shadow: 6px 6px 0 var(--ink)`, `--shadow-lg: 8px 8px 0 var(--ink)`, `--shadow-xl: 12px 12px 0 var(--ink)`. Border-radius is NOT defined as a token — zine cards are hard-edged and SHALL NOT have `border-radius` applied.

#### Scenario: A pulpcard renders with the offset hard shadow
- **WHEN** a `<PulpCard>` is rendered without overrides
- **THEN** the computed `box-shadow` is `rgb(24, 20, 16) 6px 6px 0px 0px`
- **AND** the computed `border-radius` is `0px`

### Requirement: Newsprint halftone + photocopy scan line background

The `body` element SHALL render a fixed background composed of (a) two stacked radial-dot patterns at 5px and 11px periods using `rgba(20,16,12,0.04–0.05)`, and (b) a `body::before` overlay of `repeating-linear-gradient` scan lines at 4px period with `mix-blend-mode: multiply`. Both layers MUST use `background-attachment: fixed` (where applicable) so they do not scroll with content.

#### Scenario: Background persists during scroll
- **WHEN** the user scrolls a long page
- **THEN** the halftone dots and scan lines remain pinned to the viewport, not the document

#### Scenario: Pulpcard inherits a milder scan-line texture
- **WHEN** a `<PulpCard>` renders
- **THEN** the card's own background includes a faint repeating-linear-gradient at 3px period with `rgba(20,16,12,0.015)` so the card reads as scanned paper

### Requirement: Btn primitive with four variants

The application SHALL expose a `<Btn>` React component with variants `ink` (default), `hot`, `punch`, `ghost`, and a size modifier `sm`. Each variant uses display-font, uppercase letterspacing, hard offset shadow, and a `translate(-2px, -2px)` hover lift. All variants MUST have a minimum 44px tap target.

#### Scenario: Default variant
- **WHEN** `<Btn onClick={fn}>Start</Btn>` is rendered
- **THEN** the button has `background: var(--ink)`, `color: var(--paper)`, `border: 3px solid var(--ink)`, `box-shadow: 6px 6px 0 var(--ink)`, and `min-height: 44px`

#### Scenario: Hover lift
- **WHEN** the user hovers a default Btn
- **THEN** the button's transform is `translate(-2px, -2px)` and the shadow grows to `8px 8px 0 var(--ink)`

#### Scenario: Active press
- **WHEN** the user presses (mousedown) a Btn
- **THEN** the transform is `translate(2px, 2px)` and the shadow collapses to `2px 2px 0 var(--ink)`

### Requirement: Sticker primitive in four colors

The application SHALL expose a `<Sticker color={'hot'|'yellow'|'blue'|'ink'} tilt={number}>` React component. The sticker renders as display-font, uppercase, 2px ink border, 3px offset ink shadow, and a `transform: rotate(...)` controlled by the `tilt` prop (degrees). Text inside a sticker MUST NOT wrap (`white-space: nowrap`).

#### Scenario: Yellow sticker with negative tilt
- **WHEN** `<Sticker color="yellow" tilt={-2}>Step 1 of 3</Sticker>` renders
- **THEN** the sticker has `background: var(--punch)`, `color: var(--ink)`, and `transform: rotate(-2deg)`

#### Scenario: Long sticker text does not wrap
- **WHEN** a sticker contains a long phrase that would wrap in a parent grid cell
- **THEN** the sticker renders as a single line and may overflow the cell rather than wrap

### Requirement: PulpCard primitive

The application SHALL expose a `<PulpCard tilt={number} hoverNote={string|null} onClick={fn}>` React component used wherever a content card appears in the picker grid or recipe-tile context. The card renders with `var(--paper)` background, `var(--rule)` border, `var(--shadow)` box-shadow, rotated by the `tilt` prop, with a hover state that reduces the rotation to 30%, translates `(-3px, -3px)`, grows the shadow to `--shadow-lg`, and shifts the background to `var(--punch)`. When `hoverNote` is non-null, the card MUST contain a `<HoverMark note={hoverNote}>` that becomes visible on hover.

#### Scenario: A card hover triggers the colorshift and lift
- **WHEN** the user hovers a `<PulpCard tilt={-1.4} hoverNote="PROOF???">`
- **THEN** the card's background animates to `var(--punch)`
- **AND** the card's transform changes to `rotate(-0.42deg) translate(-3px, -3px)`
- **AND** the `HoverMark` opacity animates from 0 to 1

#### Scenario: Mobile disables tilts and hover-lift
- **WHEN** the viewport is below 640px
- **THEN** the card's `--tilt` is forced to `0deg`
- **AND** the hover transform is `translate(0, 0)`

### Requirement: MarkUnderline primitive — per-line red wobbly underline

The application SHALL expose a `<MarkUnderline>` React component that renders its children inside a `<span class="marked">…</span>`. The `.marked` class MUST use a `background-image` of an inline SVG wobbly stroke colored `var(--hot-2)`, with `box-decoration-break: clone` (with vendor prefix) so multi-line spans underline every line, not just the bounding-box bottom.

#### Scenario: Single-line marker
- **WHEN** `<MarkUnderline>the anomaly</MarkUnderline>` renders
- **THEN** a wobbly red underline appears directly below the text

#### Scenario: Multi-line marker
- **WHEN** a marker span wraps across two lines in a paragraph
- **THEN** each line has its own underline (verified by inspecting the computed `background-position` repeats)

### Requirement: HoverMark primitive — dashed pencil-circle + handwritten note

The application SHALL expose a `<HoverMark note={string}>` React component. The component renders an absolutely-positioned SVG (an elliptical dashed stroke colored `var(--hot-2)`, slightly tilted, with a short tail line) plus a rotated handwritten `note` label in Permanent Marker. The component MUST be visually `opacity: 0` by default and transition to `opacity: 1` when its parent (typically a `<PulpCard>`) is hovered. The component MUST be `aria-hidden="true"`.

#### Scenario: A picker card hover reveals the mark
- **WHEN** a user hovers a story picker card with `hoverNote="SUSPICIOUS!"`
- **THEN** the dashed ellipse and the "SUSPICIOUS!" label fade in within `var(--t-base)` duration
- **AND** the label appears top-left of the card, slightly outside its border

#### Scenario: Screen reader skips the hover annotation
- **WHEN** a screen reader navigates a picker card
- **THEN** the hover-mark SVG and label are NOT announced (the wrapper has `aria-hidden="true"`)

### Requirement: RedStrings primitive — corkboard SVG connectors

The application SHALL expose a `<RedStrings headlineRef={ref} moveRefs={ref[]}>` React client component. The component MUST measure the headline card and each move card via `getBoundingClientRect()` inside `useLayoutEffect`, compute bezier paths with a slight downward sag, and render them as SVG `path` elements colored `var(--hot-2)` with stroke width 2.5px and `stroke-linecap: round`. Each endpoint MUST have a pin dot rendered as an SVG `circle`. The component MUST recompute on `window` resize and once 60ms after initial layout (font-shift compensation). The SVG MUST be `aria-hidden="true"` and `pointer-events: none`. Below 640px viewport, the strings MUST NOT render.

#### Scenario: Strings draw from headline to each move card
- **WHEN** a `FinalBoard` mounts with 4 move card refs and 1 headline ref on a desktop viewport
- **THEN** 4 SVG path elements exist, each starting near the headline card's right edge and ending near a move card's left edge
- **AND** each path has 2 pin-dot `<circle>` elements at its endpoints

#### Scenario: Mobile suppresses the strings
- **WHEN** the viewport is 360px wide
- **THEN** no `RedStrings` SVG is mounted in the DOM (or it renders empty paths)

#### Scenario: Window resize recomputes the paths
- **WHEN** the user resizes the window from 1280px to 800px
- **THEN** the path `d` attribute values recompute to new coordinates within one animation frame

### Requirement: DebunkSlam primitive — overlay drop-in with rotation overshoot

The application SHALL expose a `<DebunkSlam open={bool} onClose={fn}>` React component. When `open` becomes true, the overlay MUST animate from `translateY(-120%) rotate(-4deg) scale(1.04)` to `translateY(0) rotate(-1deg) scale(1)` over `var(--t-slow)` (600ms) with overshoot keyframes at 55% and 78%. When `open` becomes false, the overlay MUST animate up and out over 260ms via the `snatch` keyframe. The overlay container MUST trap focus and respond to ESC.

#### Scenario: Open animation
- **WHEN** `open` toggles from false to true
- **THEN** the overlay's computed transform passes through `rotate(1.5deg) scale(1.02)` near the 55% mark
- **AND** settles at `rotate(-1deg) scale(1)`

#### Scenario: ESC closes
- **WHEN** the overlay is open and the user presses Escape
- **THEN** `onClose` is invoked
- **AND** the overlay plays the snatch animation, then unmounts

### Requirement: Topbar component replaces the previous Masthead

The application SHALL render a sticky `<Topbar>` at the top of every page with: a star-clipped `--hot`-on-`--ink` brand mark, the title "Conspiracy Generator", an "Issue #…" tag (hidden on mobile), and a nav cluster containing — at minimum — a "Recipe" button, a "Lesson plan" button, a "Start over" button (conditional on having an active session), the locale toggle, and the theme toggle. The Topbar MUST have `position: sticky; top: 0; z-index: 50` and use `var(--ink)` background with `var(--paper)` text.

#### Scenario: Topbar present on every page
- **WHEN** any non-modal page renders
- **THEN** a sticky `<Topbar>` is the first visible element in the viewport

#### Scenario: Mobile collapses to a tighter layout
- **WHEN** the viewport is below 640px
- **THEN** the "Issue #…" tag and the "Design specs ↗" link (if present) are hidden
- **AND** nav buttons shrink to 11px font and 5px×8px padding

### Requirement: Modal primitive — paper modal with overshot drop-in

The application SHALL expose a `<Modal title eyebrow color onClose>` component that renders a centered paper card with `var(--shadow-xl)` shadow, an offset close button positioned `top: -16px; right: -16px`, a sticker eyebrow at the top, and a display-font title. The modal MUST drop in from above with a rotation overshoot via the `dropIn` keyframe, MUST close on backdrop click or ESC, and MUST lock body scroll while open.

#### Scenario: Modal opens with drop-in animation
- **WHEN** `<Modal>` mounts
- **THEN** the modal animates from `translateY(-30px) rotate(-1deg) opacity 0` to `translateY(0) rotate(0) opacity 1`

#### Scenario: Backdrop click closes
- **WHEN** the user clicks the dimmed backdrop outside the modal card
- **THEN** `onClose` is invoked
- **AND** body scroll is restored

### Requirement: Responsive breakpoints — 640px and 900px

The application SHALL define exactly two responsive breakpoints for the zine layout: 640px (mobile) and 900px (tablet). Picker grids MUST be 3 columns above 900px, 2 columns from 640–900px, and 1 column below 640px. Two-column layouts (landing, final board) MUST collapse to 1 column below 640px. Below 640px, card tilts and hover-lift transforms MUST be disabled, the `Topbar`'s issue tag and the secondary nav links MUST be hidden, modal padding MUST tighten to `22px 18px`, and `RedStrings` MUST NOT render.

#### Scenario: Picker grid at three breakpoints
- **WHEN** the news picker page renders at viewport widths 1280px, 800px, and 360px
- **THEN** the grid uses 3, 2, and 1 columns respectively

#### Scenario: Mobile drops the hover-lift
- **WHEN** the viewport is 360px and the user taps a `PulpCard`
- **THEN** the card's transform remains `translate(0, 0)` (no lift)

### Requirement: Reduced motion path

The application SHALL respect the `prefers-reduced-motion: reduce` media query. When set, all keyframe animations (`slam`, `snatch`, `dropIn`, `fadeIn`) MUST be replaced with an instant opacity cross-fade of duration ≤80ms. Pulpcard tilts MUST be forced to `0deg`. Hover-lift transforms MUST be suppressed.

#### Scenario: Reduced motion disables slam
- **WHEN** the OS / browser is set to "Reduce motion" and the user opens the debunk overlay
- **THEN** the overlay appears via opacity cross-fade only — no translateY, no rotate, no scale

#### Scenario: Reduced motion flattens tilts
- **WHEN** "Reduce motion" is active
- **THEN** every `PulpCard` and `Sticker` renders with `transform: rotate(0deg)` regardless of `tilt` props

### Requirement: Classroom mode hides marginalia

When `body[data-classroom="1"]` is set (classroom mode active), the application MUST hide `<HoverMark>` annotations, `<RedStrings>` connectors, and the "RECEIPTS!" marker stamp via CSS rules. The base zine typography, palette, and pulpcard frames MUST remain visible. This rule SHALL be in addition to the existing classroom-mode rule that hides all external share affordances.

#### Scenario: Classroom-on
- **WHEN** classroom mode is enabled and the permalink page renders
- **THEN** no red strings, no hover marks, and no "RECEIPTS!" stamp are present in the rendered DOM
- **AND** pulpcards, stickers, and the zine palette remain visible

### Requirement: Accessibility — contrast and keyboard navigation for new primitives

Every text/background pairing introduced by the zine palette SHALL meet WCAG 2.1 AA contrast. All interactive primitives (`Btn`, `PulpCard`, `Modal` close button, debunk close button) MUST be reachable and activatable by keyboard with a visible focus ring colored `var(--hot)` or `var(--ink)` (whichever has contrast against the focused element's background).

#### Scenario: Contrast check on hot-pink-on-paper button
- **WHEN** an axe-core scan runs on a page containing `<Btn variant="hot">`
- **THEN** the contrast ratio between `var(--paper)` text and `var(--hot)` background is at least 4.5:1

#### Scenario: Keyboard nav through the wizard
- **WHEN** a keyboard-only user tabs through the news picker, culprit picker, and motive picker
- **THEN** each `<PulpCard>` receives a visible focus ring
- **AND** Enter activates the card's onClick handler
