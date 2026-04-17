# Localization via Google Sheets (with a local overlay)

Website copy for English and Spanish is managed primarily in a shared Google Sheet and fetched at runtime. The sheet is frozen for editorial changes, so a small code-side **local copy** file fills in the gaps and disambiguates a few items the sheet cannot express.

**Sheet URL:** https://docs.google.com/spreadsheets/d/127xJ85ehcJ7Yf7WLv7Um6MxauauDKJ3RwJSGiCjrXOk/edit?gid=0#gid=0

## How it works

1. The sheet is fetched as CSV via the public `gviz` endpoint (no API key).
2. Rows are filtered to `Experience Type = "Website"`.
3. Those rows are **merged** with `src/app/data/localCopy.ts` at the hook layer. Seed = local rows; sheet rows then overlay the same `(Panel name, Item name)` keys. **Sheet always wins.**
4. `usePanelCopy(panelName)` returns `Record<itemName, text>` for the active language. `useSheetItem(panelName, itemName)` returns a single resolved string.
5. Language preference lives in `useSoundStore` (`language: "en" | "es"`) and is persisted to `localStorage` under `sensing-sound-language`. Initial language is detected from `navigator.language` (`es*` → Spanish, anything else → English).
6. `useSheetCopy` always returns defined `data` — before the sheet resolves (or if it fails), the local rows alone serve as a synchronous bilingual source. Each component still keeps a small English `FALLBACK` map as a belt-and-braces safety net.
7. If the sheet fetch fails, `Navigation.tsx` renders a one-line banner from the `App Errors / Sheet unavailable` row.

### Relevant sheet columns

| Column | Header | Purpose |
|--------|--------|---------|
| C | Experience Type | Filter — only `"Website"` rows are used |
| D | Panel name | Groups items by UI section |
| E | Item name | Identifies a specific text element within a panel |
| F | English Text | English copy |
| G | Spanish Text | Spanish copy |

### Keying rule: `(Panel name, Item name)` must be unique

Internally the hook builds a composite map keyed on `panelName + "\u241F" + itemName`. If two rows resolve to the same `(Panel name, Item name)`, the hook emits a `console.warn` at fetch time and the later row silently wins. To avoid collisions, every `Item name` must be unique within its `Panel name`. When a panel needs to express multiple "states" of the same concept (e.g. a toggle that reads either "Show" or "Hide"), encode the state in the item name itself, for example `Toggle - show` and `Toggle - hide`.

### Participant and condition copy

Bilingual strings are not embedded in `src/app/data/participants.ts` or `src/app/data/conditions.ts`. Each participant carries a `listenerCopyKey` and/or `sourceCopyKey` pointing at the matching `Item name` in `Select Listener` / `Select Sound`. Each condition carries a `cardNumber` (1..4) that resolves `Option N`, `Card N subtitle`, and `Card N description` in `Select Context`.

## Local copy overlay

The sheet is frozen, so any residual UI string that lacks a sheet row — plus a few strings the sheet can't disambiguate — lives in [`src/app/data/localCopy.ts`](src/app/data/localCopy.ts) as `SheetRow[]`. UI code never distinguishes local from sheet rows; the merge happens inside `useSheetCopy`.

Rules of thumb:

- Prefer adding a row here over introducing a hardcoded bilingual string anywhere else.
- Local rows are validated for uniqueness at module load (a duplicate throws).
- If editorial ever unfreezes the sheet and adds a row with the same `(panel, item)` key, the sheet will transparently override the local row — no code change required.

### Known sheet duplicates (silenced, bypassed)

The sheet contains three unresolvable duplicates. We do not rename them (sheet is frozen). Instead the UI uses new disambiguated keys supplied by local copy and the duplicate-warning is silenced for these specific composite keys to reduce console noise:

| Panel | Duplicate item (ignored) | Disambiguated keys served from local copy |
|---|---|---|
| Listening Scene | `Toggle` (×2) | `Toggle - show`, `Toggle - hide` |
| Audio Panel | `Button state` (×2) | `Button state - muted`, `Button state - unmuted` |
| Audio Panel | `Button` (×2) | `Button - play`, `Button - pause` |

## Panel implementation status

| Panel name | Items | Source | Location |
|---|---|---|---|
| About Hero | Subtitle | Sheet | `About.tsx` (hero) |
| About Hero | Explore CTA | Local | `About.tsx` (hero CTA) |
| About the Project | Title, Body 1, Body 2 - emphasized text, Body 3 | Sheet | `About.tsx` → `AboutTheProject` |
| About the Project | Sprouts caption | Local | `About.tsx` (harbor seal photo card) |
| About the Experience | Title, Body 1, Body 2, Body - emphasized central question | Sheet | `About.tsx` → `AboutTheExperience` |
| About the Science | Title + all bodies | Sheet | `About.tsx` → `AboutTheScience` |
| The Impact of Human Noise | Title, Body 1, Emphasis line, Body 2 | Sheet | `About.tsx` → `ImpactOfHumanNoise` |
| How to Explore | Title, Step 1–4 | Sheet | `About.tsx` → `HowToExplore` |
| Funders | Title, Description | Sheet | `About.tsx` (funders section) |
| Footer | Copyright, Collaboration line, Credit 1–2 | Sheet | `About.tsx` (footer) |
| Navigation | About | Sheet | `Navigation.tsx` |
| Mobile Menu | Tab - condition/listener/source | Local | `Navigation.tsx` (mobile selector buttons) |
| Mobile Footer | Scene tab, Range tab | Local | `MobileFooter.tsx` |
| Select Listener | Title, Option 1–3 | Sheet | `AudioParticipantSelector.tsx`; labels resolved via `listenerCopyKey` across `Navigation.tsx`, `SceneViewer.tsx`, `HearingRangeViewer.tsx` |
| Select Listener | Swipe hint | Local | `AudioParticipantSelector.tsx` (touch hint) |
| Select Sound | Title, Option 1–4 | Sheet | `AudioParticipantSelector.tsx`; labels resolved via `sourceCopyKey` across `AudioViewer.tsx`, `Navigation.tsx`, `SceneViewer.tsx`, `DetectionRanges.tsx` |
| Select Sound | Swipe hint | Local | `AudioParticipantSelector.tsx` (touch hint) |
| Select Context | Title, Volume label, Option 1–4, Card 1–4 subtitle, Card 1–4 description | Sheet | `ConditionSelector.tsx` |
| Select Context | Volume control aria | Local | `ConditionSelector.tsx` (slider `aria-label`) |
| Distance Comparison | Title, Field label 1–2, Pill 1–2 | Sheet | `SceneViewer.tsx` (distance pill labels use Pill 1 / Pill 2) |
| Listening Scene | Center label | Sheet | `SceneViewer.tsx` (distance pill caption) |
| Listening Scene | Toggle - show, Toggle - hide | Local | Copy is ready; UI toggle not yet designed (deferred) |
| Audio Panel | Button state - muted/unmuted, Button - play/pause | Local | `AudioViewer.tsx`, `SceneViewer.tsx` (desktop inline controls) |
| Detection Ranges | Title, Subtitle, Axis label | Sheet | `DetectionRanges.tsx` |
| Detection Ranges | From calm suffix | Local | `DetectionRanges.tsx` (tooltip `-N% from calm`) |
| Hearing Ranges | Title, Note | Sheet | `HearingRangeViewer.tsx` |
| Hearing Ranges | Human - in air, Human - in water | Local | `HearingRangeViewer.tsx` |
| App Errors | Sheet unavailable | Local | `Navigation.tsx` (fetch-error banner) |
| Invalid Selection Modal | Title/Subtitle/Detail patterns | Deferred — requires `{Listener}` interpolation helper | — |
| About Page | Back button | Deferred — no back control exists yet | — |

## Deferred / out of scope

- **Invalid Selection Modal** interpolation helper.
- **About > Back button** UI.
- **Listening Scene toggle UI** — copy is wired via local rows (`Toggle - show` / `Toggle - hide`); the button itself is a design decision that has not landed.
- **`formatDistance` locale-aware grouping** (`1,000 m` vs `1.000 m`) — intentionally not localized.

## Language persistence

- Stored in `localStorage` under key `sensing-sound-language`.
- Only the `language` field is persisted; everything else in `useSoundStore` (`oceanCondition`, `listener`, `source`, mobile UI state) resets per session.
- Initial language: `navigator.language?.toLowerCase().startsWith("es")` → `"es"`, else `"en"`.
