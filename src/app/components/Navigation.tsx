import { Link } from "react-router";
import { Info, ChevronUp } from "lucide-react";
import logoImage from "@/assets/9962ff5db39642ae80b1efdc857274dd2ff0055a.png";
import type { AudioParticipant } from "../types";
import { useSoundStore } from "../store/useSoundStore";
import { conditionInfo, conditionOrder } from "../data/conditions";
import { listeners, sources } from "../data/participants";
import { usePanelCopy, useSheetCopy } from "../hooks/useSheetCopy";
import type { MobileMenuTarget } from "../store/useSoundStore";
import LanguageToggle from "./LanguageToggle";

const NAVIGATION_FALLBACK: Record<string, string> = {
  About: "About",
  Home: "HOME",
};

const MOBILE_MENU_TAB_KEY: Record<Exclude<MobileMenuTarget, null>, string> = {
  condition: "Tab - condition",
  listener: "Tab - listener",
  source: "Tab - source",
};

const selectorButtons: { target: Exclude<MobileMenuTarget, null> }[] = [
  { target: "condition" },
  { target: "listener" },
  { target: "source" },
];

const CONTEXT_OPTION_FALLBACK: Record<number, string> = {
  1: "Calm Seas",
  2: "Wind & Waves",
  3: "Storm",
  4: "Cruise Ship",
};

const LISTENER_OPTION_FALLBACK: Record<string, string> = {
  "Option 1": "Harbor Seal",
  "Option 2": "Bottlenose Dolphin",
  "Option 3": "Killer Whale",
};

const SOUND_OPTION_FALLBACK: Record<string, string> = {
  "Option 1": "Rockfish Grunt",
  "Option 2": "Harbor Seal Roar",
  "Option 3": "Dolphin Whistle",
  "Option 4": "Killer Whale Call",
};

export default function Navigation() {
  const oceanCondition = useSoundStore((s) => s.oceanCondition);
  const listener = useSoundStore((s) => s.listener);
  const source = useSoundStore((s) => s.source);
  const mobileMenuTarget = useSoundStore((s) => s.mobileMenuTarget);
  const setMobileMenuTarget = useSoundStore((s) => s.setMobileMenuTarget);
  const setOceanCondition = useSoundStore((s) => s.setOceanCondition);
  const setListener = useSoundStore((s) => s.setListener);
  const setSource = useSoundStore((s) => s.setSource);

  const { copy: navCopy } = usePanelCopy("Navigation");
  const { copy: contextCopy } = usePanelCopy("Select Context");
  const { copy: listenerCopy } = usePanelCopy("Select Listener");
  const { copy: soundCopy } = usePanelCopy("Select Sound");
  const { copy: mobileMenuCopy } = usePanelCopy("Mobile Menu");
  const { copy: appErrorsCopy } = usePanelCopy("App Errors");
  const { isError: sheetIsError } = useSheetCopy();

  const navT = (key: string) => navCopy[key] || NAVIGATION_FALLBACK[key] || "";

  const conditionLabel = (c: typeof conditionOrder[number]): string => {
    const cardNumber = conditionInfo[c].cardNumber;
    const itemKey = `Option ${cardNumber}`;
    return contextCopy[itemKey] || CONTEXT_OPTION_FALLBACK[cardNumber] || "";
  };

  const listenerLabel = (p: AudioParticipant): string => {
    if (!p.listenerCopyKey) return "";
    return listenerCopy[p.listenerCopyKey] || LISTENER_OPTION_FALLBACK[p.listenerCopyKey] || "";
  };

  const sourceLabel = (p: AudioParticipant): string => {
    if (!p.sourceCopyKey) return "";
    return soundCopy[p.sourceCopyKey] || SOUND_OPTION_FALLBACK[p.sourceCopyKey] || "";
  };

  const selectorIcons: Record<string, string> = {
    condition: conditionInfo[oceanCondition].icon,
    listener: listener.icon,
    source: source.icon,
  };

  const toggleTarget = (target: MobileMenuTarget) => {
    setMobileMenuTarget(mobileMenuTarget === target ? null : target);
  };

  const optionIcons = (() => {
    if (mobileMenuTarget === "condition") {
      return conditionOrder
        .filter((c) => c !== oceanCondition)
        .map((c) => ({ key: c, icon: conditionInfo[c].icon, label: conditionLabel(c), onSelect: () => { setOceanCondition(c); setMobileMenuTarget(null); } }));
    }
    if (mobileMenuTarget === "listener") {
      return listeners
        .filter((p) => p.id !== listener.id)
        .map((p) => ({ key: p.id, icon: p.icon, label: listenerLabel(p), onSelect: () => { setListener(p); setMobileMenuTarget(null); } }));
    }
    if (mobileMenuTarget === "source") {
      return sources
        .filter((p) => p.id !== source.id)
        .map((p) => ({ key: p.id, icon: p.icon, label: sourceLabel(p), onSelect: () => { setSource(p); setMobileMenuTarget(null); } }));
    }
    return [];
  })();

  return (
    <header className="flex-none z-20 bg-teal-900/60 backdrop-blur-sm">
      {sheetIsError && (
        <div
          role="status"
          className="px-4 md:px-6 py-1 text-center text-xs text-amber-100 bg-amber-900/40"
        >
          {appErrorsCopy["Sheet unavailable"] ||
            "Text is showing in English — we couldn't reach the translation sheet."}
        </div>
      )}
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <img src={logoImage} alt="Sensing Sound" className="h-8 md:h-10 w-auto" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Info className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium">{navT("About")}</span>
          </Link>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-around px-4 pb-2">
        {selectorButtons.map(({ target }) => {
          const isActive = mobileMenuTarget === target;
          const label = mobileMenuCopy[MOBILE_MENU_TAB_KEY[target]] || "";
          return (
            <button
              key={target}
              type="button"
              onClick={() => toggleTarget(target)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "bg-white/20 ring-1 ring-white/40"
                  : "bg-white/5 hover:bg-white/15"
              }`}
            >
              <img
                src={selectorIcons[target]}
                alt=""
                className="w-8 h-8 object-contain"
              />
              <span className="text-white/70 text-[10px] uppercase tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>

      <div
        className="md:hidden grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: mobileMenuTarget ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="flex items-center justify-center gap-3 px-4 pt-1">
            {optionIcons.map(({ key, icon, label, onSelect }) => (
              <button
                key={key}
                type="button"
                onClick={onSelect}
                className="flex flex-col items-center gap-1 rounded-lg bg-white/10 hover:bg-white/25 p-1.5 transition-colors"
              >
                <img src={icon} alt="" className="w-10 h-10 object-contain" />
                <span className="text-white/70 text-[10px] uppercase tracking-wide leading-tight">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuTarget(null)}
            className="w-full flex items-center justify-center py-1 pb-2 text-white/50 hover:text-white/80 transition-colors"
          >
            <ChevronUp className="w-5 h-5 scale-x-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
}
