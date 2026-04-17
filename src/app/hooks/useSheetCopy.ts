import { useQuery } from "@tanstack/react-query";
import Papa from "papaparse";
import { useMemo } from "react";
import { localRows } from "../data/localCopy";
import { useSoundStore } from "../store/useSoundStore";
import type { Language, PanelCopyMap, SheetRow } from "../types";

const SHEET_ID = "127xJ85ehcJ7Yf7WLv7Um6MxauauDKJ3RwJSGiCjrXOk";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// U+241F (SYMBOL FOR UNIT SEPARATOR) is not expected in editorial text,
// so it makes a safe composite-key delimiter.
const KEY_DELIMITER = "\u241f";

/**
 * Composite keys whose sheet rows are known to be duplicated with no way to
 * disambiguate editorially (the sheet is frozen). Their values are driven
 * from `localCopy` under disambiguated keys instead, so warning about these
 * duplicates is just console noise.
 */
const SILENCED_DUPLICATE_KEYS: ReadonlySet<string> = new Set([
  compositeKey("Listening Scene", "Toggle"),
  compositeKey("Audio Panel", "Button state"),
  compositeKey("Audio Panel", "Button"),
]);

export interface SheetCopyData {
  rows: SheetRow[];
  byKey: Map<string, SheetRow>;
}

function compositeKey(panelName: string, itemName: string): string {
  return `${panelName}${KEY_DELIMITER}${itemName}`;
}

function findColumn(headers: string[], substring: string): number {
  return headers.findIndex((h) =>
    h.toLowerCase().includes(substring.toLowerCase())
  );
}

function parseSheetRows(text: string): SheetRow[] {
  const { data } = Papa.parse<string[]>(text, { header: false });
  if (data.length < 2) return [];

  const headers = data[0];
  const colType = findColumn(headers, "experience type");
  const colPanel = findColumn(headers, "panel name");
  const colItem = findColumn(headers, "item name");
  const colEn = findColumn(headers, "english text");
  const colEs = findColumn(headers, "spanish text");

  if ([colType, colPanel, colItem, colEn, colEs].includes(-1)) {
    throw new Error("Could not locate required columns in sheet");
  }

  return data
    .slice(1)
    .filter((row) => row[colType]?.trim() === "Website")
    .map((row) => ({
      experienceType: row[colType]?.trim() ?? "",
      panelName: row[colPanel]?.trim() ?? "",
      itemName: row[colItem]?.trim() ?? "",
      en: row[colEn]?.trim() ?? "",
      es: row[colEs]?.trim() ?? "",
    }));
}

/**
 * Merge sheet rows over local rows. Local seeds the map; every sheet row
 * then overrides any local entry with the same composite key.
 * - Local-only keys pass through unchanged.
 * - Sheet-only keys pass through unchanged.
 * - Sheet row overriding a local row is expected; not warned.
 * - Two sheet rows colliding still warns (caller cannot correct the sheet
 *   unless it's in SILENCED_DUPLICATE_KEYS, in which case we stay quiet).
 */
function mergeWithLocal(sheetRows: SheetRow[]): SheetCopyData {
  const byKey = new Map<string, SheetRow>();

  for (const row of localRows) {
    if (!row.panelName || !row.itemName) continue;
    byKey.set(compositeKey(row.panelName, row.itemName), row);
  }

  const seenSheetKeys = new Set<string>();
  for (const row of sheetRows) {
    if (!row.panelName || !row.itemName) continue;
    const key = compositeKey(row.panelName, row.itemName);
    if (seenSheetKeys.has(key) && !SILENCED_DUPLICATE_KEYS.has(key)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[useSheetCopy] Duplicate row for ("${row.panelName}", "${row.itemName}"); later row wins.`,
      );
    }
    seenSheetKeys.add(key);
    byKey.set(key, row);
  }

  return { rows: Array.from(byKey.values()), byKey };
}

// Validate at module load that our local rows themselves are unique.
// This is a developer-time invariant: a dupe here is always a bug.
(function assertLocalRowsUnique() {
  const seen = new Set<string>();
  for (const row of localRows) {
    const key = compositeKey(row.panelName, row.itemName);
    if (seen.has(key)) {
      throw new Error(
        `[useSheetCopy] Duplicate local row for ("${row.panelName}", "${row.itemName}").`,
      );
    }
    seen.add(key);
  }
})();

const LOCAL_ONLY: SheetCopyData = mergeWithLocal([]);

async function fetchSheetCopy(): Promise<SheetRow[]> {
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const text = await res.text();
  return parseSheetRows(text);
}

export function useSheetCopy(): {
  data: SheetCopyData;
  isLoading: boolean;
  isError: boolean;
} {
  const q = useQuery({
    queryKey: ["sheet-copy"],
    queryFn: fetchSheetCopy,
    staleTime: 5 * 60 * 1000,
    select: mergeWithLocal,
  });
  return {
    data: q.data ?? LOCAL_ONLY,
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

function resolveCell(row: SheetRow, language: Language): string {
  return row[language] || row.en;
}

export function usePanelCopy(panelName: string): {
  copy: PanelCopyMap;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, isLoading, isError } = useSheetCopy();
  const language = useSoundStore((s) => s.language);

  const copy = useMemo(() => {
    const map: PanelCopyMap = {};
    for (const row of data.rows) {
      if (row.panelName !== panelName) continue;
      map[row.itemName] = resolveCell(row, language);
    }
    return map;
  }, [data, panelName, language]);

  return { copy, isLoading, isError };
}

/**
 * Look up a single (panel, item) directly from the composite-keyed map.
 * Returns the active-language text, falling back to EN. Returns an empty
 * string if the row is missing (including any local fallback).
 */
export function useSheetItem(panelName: string, itemName: string): string {
  const { data } = useSheetCopy();
  const language = useSoundStore((s) => s.language);

  return useMemo(() => {
    const row = data.byKey.get(compositeKey(panelName, itemName));
    return row ? resolveCell(row, language) : "";
  }, [data, panelName, itemName, language]);
}
