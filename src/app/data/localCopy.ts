import type { SheetRow } from "../types";

/**
 * Code-bundled bilingual rows for UI copy that is not present in the Google
 * Sheet. Merged with sheet rows in `useSheetCopy`; sheet rows with the same
 * composite `(panelName, itemName)` key override the local entry.
 *
 * Every row is shaped exactly like a sheet row so `usePanelCopy` /
 * `useSheetItem` treat local and sheet copy uniformly. All new residual UI
 * strings should land here rather than as hardcoded literals in components.
 *
 * Uniqueness rule (mirrors the sheet): `(panelName, itemName)` must be unique
 * across this array. Duplicates are a bug and will be surfaced at load time.
 */
export const localRows: readonly SheetRow[] = [
  {
    experienceType: "Website",
    panelName: "Mobile Footer",
    itemName: "Scene tab",
    en: "Scene View",
    es: "Escena",
  },
  {
    experienceType: "Website",
    panelName: "Mobile Footer",
    itemName: "Range tab",
    en: "Range View",
    es: "Alcance",
  },

  {
    experienceType: "Website",
    panelName: "Mobile Menu",
    itemName: "Tab - condition",
    en: "Condition",
    es: "Condición",
  },
  {
    experienceType: "Website",
    panelName: "Mobile Menu",
    itemName: "Tab - listener",
    en: "Listener",
    es: "Oyente",
  },
  {
    experienceType: "Website",
    panelName: "Mobile Menu",
    itemName: "Tab - source",
    en: "Source",
    es: "Fuente",
  },

  {
    experienceType: "Website",
    panelName: "Select Listener",
    itemName: "Swipe hint",
    en: "Swipe to rotate",
    es: "Desliza para girar",
  },
  {
    experienceType: "Website",
    panelName: "Select Sound",
    itemName: "Swipe hint",
    en: "Swipe to rotate",
    es: "Desliza para girar",
  },

  {
    experienceType: "Website",
    panelName: "Select Context",
    itemName: "Volume control aria",
    en: "Context volume control",
    es: "Control de volumen del contexto",
  },

  {
    experienceType: "Website",
    panelName: "About Hero",
    itemName: "Explore CTA",
    en: "Explore",
    es: "Explorar",
  },
  {
    experienceType: "Website",
    panelName: "About the Project",
    itemName: "Sprouts caption",
    en: "Sprouts the harbor seal",
    es: "Sprouts, la foca de puerto",
  },

  {
    experienceType: "Website",
    panelName: "Hearing Ranges",
    itemName: "Human - in air",
    en: "Human (In Air)",
    es: "Humano (en aire)",
  },
  {
    experienceType: "Website",
    panelName: "Hearing Ranges",
    itemName: "Human - in water",
    en: "Human (In Water)",
    es: "Humano (en agua)",
  },

  {
    experienceType: "Website",
    panelName: "Detection Ranges",
    itemName: "From calm suffix",
    en: "from calm",
    es: "respecto a la calma",
  },

  // Listening Scene: the sheet has two rows named `Toggle` that cannot be
  // disambiguated, so we ignore those and drive the toggle from these
  // disambiguated keys instead.
  {
    experienceType: "Website",
    panelName: "Listening Scene",
    itemName: "Toggle - show",
    en: "Show Hearing Ranges",
    es: "Mostrar rangos auditivos",
  },
  {
    experienceType: "Website",
    panelName: "Listening Scene",
    itemName: "Toggle - hide",
    en: "Hide Hearing Ranges",
    es: "Ocultar rangos auditivos",
  },

  // Audio Panel: the sheet has duplicate `Button state` and `Button` rows we
  // cannot disambiguate. These disambiguated keys are the authoritative ones.
  {
    experienceType: "Website",
    panelName: "Audio Panel",
    itemName: "Button state - muted",
    en: "Muted",
    es: "Silenciado",
  },
  {
    experienceType: "Website",
    panelName: "Audio Panel",
    itemName: "Button state - unmuted",
    en: "Unmuted",
    es: "Con sonido",
  },
  {
    experienceType: "Website",
    panelName: "Audio Panel",
    itemName: "Button - play",
    en: "Play",
    es: "Reproducir",
  },
  {
    experienceType: "Website",
    panelName: "Audio Panel",
    itemName: "Button - pause",
    en: "Pause",
    es: "Pausar",
  },

  {
    experienceType: "Website",
    panelName: "App Errors",
    itemName: "Sheet unavailable",
    en: "Text is showing in English — we couldn't reach the translation sheet.",
    es: "El texto se muestra en inglés — no pudimos conectar con la hoja de traducciones.",
  },
];
