# Ivora Clinic Suite — Dashboard

A dental practice management dashboard built with **HTML, Bootstrap 5 and vanilla JavaScript**
(ES modules). Converted from the `Ivora Clinic Suite.html` React design bundle into a
dependency-free, framework-free front end.

16 screens, 3 auth screens, 7 modals, a drag-and-drop appointment board, a small
marketing-site CMS, light/dark themes and a translated English/Arabic RTL interface.
Responsive from 360px up.

---

## Running it

**Double-click `index.html`.**

That is the whole story. No server, no install, no build step, no Node. Every file
under `pages/` opens the same way.

Bootstrap is vendored into `css/vendor/`, so the only thing fetched from the network
is the Google Fonts stylesheet. Offline, type falls back to system fonts and
everything else still works.

**To change something**, edit the file and refresh the browser. That's it.

---

## Architecture

Three top-level folders — `pages/`, `js/`, `css/` — plus `index.html` as the entry point.

```
index.html                  The dashboard. Open this.
│
├── pages/                  One HTML file per screen — real, openable, linkable
│   ├── reservations.html   Each declares its start screen, then loads the same
│   ├── patients.html       scripts. Navigation after load is client-side.
│   ├── staff.html          … 14 dashboard screens …
│   ├── profile.html        My Profile — details, password, preferences
│   ├── login.html          Auth screens. These load only three scripts and
│   ├── forgot-password.html  sit outside the app shell.
│   └── reset-password.html
│
├── css/                    Presentation only. No CSS-in-JS for anything reusable.
│   ├── vendor/             Bootstrap 5.3.3, vendored so the app works offline
│   │   ├── bootstrap-reboot.min.css
│   │   └── bootstrap-utilities.min.css
│   ├── tokens.css          ← every colour in the product; the only place hex lives
│   ├── base.css            Reset, typography, icon font, animations, RTL
│   ├── bootstrap-overrides.css   Re-points Bootstrap's variables at our tokens
│   ├── layout.css          The app shell: sidebar, header, content well
│   ├── components.css      Buttons, badges, tables, forms, tabs, avatars…
│   ├── charts.css          Chart chrome
│   ├── calendar.css        Reservation board
│   ├── odontogram.css      Dental chart
│   ├── builder.css         Website Settings editor
│   ├── auth.css            Sign-in / password-recovery screens
│   └── overlays.css        Modals, drawers, panels, z-index ladder
│
└── js/
    ├── ivora.js            Module registry — MUST be the first script on every page
    ├── app.js              Entry point: subscribes to the store, renders the shell
    ├── auth.js             Sign in, forgot password, reset password
    │
    ├── core/               Framework-free primitives
    │   ├── dom.js          ~90-line hyperscript helper — `h('div.card', {...}, …)`
    │   ├── store.js        One state object + setState + subscribers
    │   ├── router.js       Hash routing (`#/patients`), page titles
    │   ├── theme.js        data-theme / dir / lang on <html>, persisted
    │   ├── format.js       Dates, money, initials, hour labels — pure functions
    │   ├── i18n.js         Arabic dictionary + post-render translation pass
    │   ├── session.js      The signed-in user, sign-out, path resolution
    │   └── scheduling.js   Appointment availability rules (single source of truth)
    │
    ├── data/               Demo fixtures, one module per domain, re-exported by index.js
    │   ├── clinic.js       Navigation, staff, schedules, the appointment book
    │   ├── patients.js     Roster, visits, the FDI dental chart model
    │   ├── treatments.js   Service catalogue + chairside clinical vocabulary
    │   ├── finance.js      Accounts, bills, purchases, chart series
    │   ├── inventory.js    Stock, orders, equipment
    │   ├── website.js      The marketing site's content model
    │   ├── analytics.js    Traffic, geography, conversions
    │   └── support.js      Reports and the support inbox
    │
    ├── components/         Reusable UI
    │   ├── ui.js           Element factories: button, badge, table, select, toggle…
    │   ├── charts.js       Hand-rolled SVG line / bar / donut charts
    │   ├── sidebar.js      Navigation (overlay drawer under 1024px)
    │   ├── header.js       Title, global search, language, theme, user
    │   ├── search.js       Cross-entity global search
    │   ├── odontogram.js   Grid dental chart (patient Medical Record tab)
    │   ├── dental-arch.js  Anatomical arch — 32 teeth on an oval, by type
    │   ├── reservation-panel.js   Reservation rail + its four side panels
    │   ├── bill-drawer.js  Take a payment
    │   ├── site-preview.js Full-screen marketing-site preview
    │   ├── overlays.js     Single host for everything that floats
    │   └── modals/         shell.js + 7 dialogs
    │
    └── pages/              One module per screen, registered in pages/index.js
```

### How it works

**State → view, in one direction.** `store.js` holds one mutable state object.
`setState()` shallow-merges a patch and schedules a notification on a microtask, so a
burst of updates in one handler produces exactly one render. `app.js` subscribes once
and rebuilds the whole tree.

**No virtual DOM.** A change re-renders wholesale. At this data volume that is simpler
to reason about than diffing and fast enough — the content well's scroll position is
captured and restored across renders so typing in a filter box stays stable.

**Pages are functions.** Each page module exports `somethingPage()` returning a DOM
node. It reads from `state` and calls `setState`. It never touches the shell, the
router internals, or another page.

**Adding a screen** = write `js/pages/thing.js`, add one line to `pages/index.js`, and
add its route to `ROUTES`/`TITLES` in `core/router.js`.

### Conventions

- **Colour lives in `tokens.css`.** Components reference `var(--brand)`, never a hex.
  Re-theming is one file.
- **Repeated visual patterns get a class**, not an inline style. Inline styles are used
  only for one-off geometry (a specific grid template, a computed bar width).
- **Icons** are Material Symbols ligatures rendered through a bare `<i>`: `icon('groups')`.
- **Logical CSS properties** (`inset-inline-start`, `padding-inline`, `border-inline-end`)
  throughout, so Arabic RTL works without a mirrored stylesheet.
- **Charts always render left-to-right**, even under RTL — their containers carry `.ltr`.

---

## Feature notes

**Reservation board** (`pages/reservations.js`) — hour rows × on-duty dentists.
Cards use native HTML5 drag and drop. A drop is only accepted when the target slot
passes `core/scheduling.js`, the same rules the booking form uses, so the board and the
form can never disagree about availability.

**Booking validation** — the New Appointment modal blocks its confirm button and
explains why: the dentist doesn't work that day, the slot is taken, it falls outside
the shift, or it straddles the lunch break.

**Chairside check-up** (`components/modals/checkup-modal.js`) — a six-screen wizard
across four numbered steps. Findings are stored per patient in `state.clinical`, keyed
by name, so reopening a reservation resumes where the dentist left off. Approved teeth
flow into the treatment summary as billable work.

**Website Settings** (`pages/website.js`) — a small CMS. Sections carry fields and,
where relevant, a repeater. Sections and items can be reordered, shown and hidden;
the full-screen preview renders `state.site` live at three viewport widths.

**Analytics** — every figure derives from one `metrics()` function, so changing the
range picker moves the whole page consistently rather than card by card.

---

## Design fidelity

Ported verbatim from the source design: the complete two-theme token set, the type
scale, all component geometry (radii, paddings, border weights), every dataset, and
the chart maths — the donut is drawn in a 42-unit viewBox so each arc's dash length is
literally its percentage, matching the original arc-for-arc.

## Browser support

Modern evergreen browsers. Uses ES modules, CSS custom properties, CSS logical
properties, `:has()`-free selectors, and `structuredClone`-free JSON cloning.

## How the scripts fit together

The app is ~50 plain `<script>` files, listed in **dependency order** in every HTML
page. There is no bundler and no `type="module"` — ES modules are subject to a CORS
check that `file://` cannot satisfy, so a module build would only run behind a web
server.

Instead, `js/ivora.js` provides a ten-line registry:

```js
// at the top of each file
var { h, icon } = Ivora.require('core/dom');

// at the bottom
Ivora.define('components/ui', { button: button, badge: badge /* … */ });
```

Each file wraps its body in an IIFE, so it keeps its **own scope**. That matters: several
modules legitimately declare the same local names (`COLS`, `HEAD`, `label`, `save`), and
at shared global scope those would be fatal redeclarations.

Two rules when editing:

1. **`js/ivora.js` stays first.**
2. **A file must be listed after everything it requires.** The order interleaves folders
   on purpose — `core/store` needs `data/index`, so all of `data/` loads before it.
   Get it wrong and `Ivora.require` throws immediately naming the missing module,
   rather than failing later with a confusing `undefined`.

Adding a file means adding one `<script>` tag to the pages that need it.

---

## Responsive

Verified with no horizontal bleed at 360, 390, 768 and 1024px on every screen.

| Breakpoint | What changes |
|---|---|
| ≤ 1024px | Sidebar becomes an overlay drawer behind a hamburger |
| ≤ 900px  | Tighter content padding; auth drops its brand panel |
| ≤ 720px  | **Tables become stacked cards** — the header row is hidden and each cell draws its own caption. Search moves to its own row; language labels reduce to flags |
| ≤ 400px  | The header's new-item shortcut is dropped (every page has one in its own toolbar) |

The table transformation is automatic: `components/ui.js` `table()` stamps each cell
with a `data-label` from the column heading, and CSS renders it via
`content: attr(data-label)`. All seven tables get it without page changes.

> Testing note: Chrome on Windows refuses window widths below ~500px, so
> `--window-size=390` silently lays out at 504 and crops the screenshot. Narrow-viewport
> checks have to run inside an iframe, or they quietly measure the wrong thing.

---

## Auth screens

`pages/login.html`, `pages/forgot-password.html`, `pages/reset-password.html`.

They sit outside the app shell and load only three scripts — the registry, the DOM
helper and `js/auth.js`. They deliberately do **not** pull in the store, which would
drag the whole data layer onto a login page.

There is no backend: a valid submission shows a pending state and continues to the
dashboard. What is real is the interface behaviour — inline validation (email format,
password length, confirmation match), errors that clear as you correct them, a
password reveal toggle, and the sent/success states of the recovery flow.

---

## Arabic and RTL

Switching to AR does three things: flips `dir` to `rtl`, swaps the typeface, and
translates the interface.

**Weight.** Arabic strokes read thinner than Latin at the same nominal weight, so the
whole interface steps up one notch under `[lang='ar']` — body copy to 500, bold text
to 700/800. Without it the Arabic UI looks faint beside the English one.

**Default.** English/LTR always starts a session. Language is deliberately *not*
persisted — theme is, because it is a device preference, whereas returning to a
stuck RTL layout is disorienting. Arabic is a per-session choice from the header.

**Font.** Plus Jakarta Sans has no Arabic glyphs, so Arabic would otherwise fall back
to whatever the OS chose. `--font-ar` (IBM Plex Sans Arabic) is applied under
`[lang='ar']`. Letter-spacing and `text-transform` are neutralised there too — Arabic
has no uppercase, and letter-spacing breaks the cursive joins between glyphs.

**Translation.** `core/i18n.js` holds an English → Arabic dictionary and translates the
*rendered DOM* after each render, rather than requiring a `t()` call at every site.
With no build step and a full re-render on every state change, a post-render pass is
both cheap and total: it covers every screen, modal, panel and the auth pages without
any page module knowing that languages exist.

Deliberate consequences:

- Only dictionary phrases translate; anything missing falls back to English rather
  than showing a raw key.
- The dictionary holds **interface copy only**. Patient names, dentists, vendors,
  cities and SKUs stay in Latin — which is what a real clinic wants, since they are
  proper nouns.
- Icon elements are skipped. Material Symbols renders ligature *names* as glyphs, so
  translating `calendar_month` would break every icon on the page.

---

## Account, profile and sign-out

The header's user chip opens an account menu with **My profile**, **Change password**
and **Sign out**. It closes on an outside click via an invisible full-screen catcher —
the same pattern the navigation drawer uses, and steadier than a document listener that
a full re-render would have to keep re-attaching.

`pages/profile.html` (route `#/profile`) has three tabs:

- **Account details** — name, job title, email, phone. Editing the name updates the
  header avatar immediately, since both read from `core/session.js`.
- **Security** — change password with real validation (current required, 8+ characters,
  must differ from the current one, confirmation must match), a strength meter, and
  two-factor / last sign-in / active sessions.
- **Preferences** — theme and language, mirroring the header controls.

Profile is registered as a route but deliberately **absent from the sidebar** — it is
reached from the account menu, not primary navigation.

`core/session.js` holds the account and resolves paths. The app runs from two depths
(`index.html` at the root, and `pages/*.html`), so sign-out computes its link rather
than hard-coding one that would break at one of them. Signing out leaves theme and
language in localStorage: they are device preferences, not credentials, and clearing
them would flash a dark-mode user back to light on the login screen.

---

## The dental chart

Two charts, matching the source design:

- **Grid** (`components/odontogram.js`) — four rows of numbered boxes, used on the
  patient Medical Record tab where the job is scanning history.
- **Anatomical arch** (`components/dental-arch.js`) — used in the chairside check-up,
  where a dentist is looking at the actual mouth. 32 teeth positioned on an oval, each
  rotated perpendicular to the curve and drawn with the silhouette of its own type:
  molar, premolar, canine or incisor.

The arch geometry is a table, not a computation — it is anatomy, so the coordinates,
rotations and per-tooth shapes are lifted directly from the Ivora Clinic Suite design.

The container is pinned to `direction: ltr`. The arch is a picture of a mouth, and
mirroring it under RTL would swap the patient's left and right — a clinical error, not
a layout preference.

---

## Third-party

Bootstrap 5.3.3, vendored in `css/vendor/` — **`bootstrap-reboot` + `bootstrap-utilities`,
not the full bundle.** Google Fonts for Plus Jakarta Sans, IBM Plex Mono and Material
Symbols Rounded. Zero JavaScript dependencies: the charts, router, state layer and DOM
helper are all local.

### Why not the full `bootstrap.min.css`

Bootstrap's component layer defines `.card`, `.row` and `.modal` — three of this app's
own component names. Its versions actively break them:

| Bootstrap rule | Effect on this app |
|---|---|
| `.row > * { width: 100% }` | every child of a `.row` forced full width, so inline rows wrapped |
| `.modal { height: 100% }` | dialogs stretched to the viewport instead of hugging content |
| `.card { display: flex; margin-bottom: … }` | unwanted flex context and spacing on every card |

Loading the modular builds removes the collision structurally instead of fighting it
with specificity — and still gives the full Bootstrap utilities API plus reboot. The
grid build is skipped too; layout is CSS Grid and flexbox throughout. See the note at
the top of `bootstrap-overrides.css` if you ever swap the full bundle back in.
