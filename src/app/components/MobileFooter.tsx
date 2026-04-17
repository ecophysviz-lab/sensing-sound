import { Eye, BarChart3 } from "lucide-react";
import { useSoundStore } from "../store/useSoundStore";
import type { MobileView } from "../store/useSoundStore";
import { usePanelCopy } from "../hooks/useSheetCopy";

const tabs: { id: MobileView; itemKey: string; fallback: string; icon: typeof Eye }[] = [
  { id: "scene", itemKey: "Scene tab", fallback: "Scene View", icon: Eye },
  { id: "range", itemKey: "Range tab", fallback: "Range View", icon: BarChart3 },
];

export default function MobileFooter() {
  const mobileView = useSoundStore((s) => s.mobileView);
  const setMobileView = useSoundStore((s) => s.setMobileView);
  const { copy } = usePanelCopy("Mobile Footer");

  return (
    <footer className="md:hidden flex-none z-20 flex bg-teal-900/60 backdrop-blur-sm">
      {tabs.map((tab) => {
        const active = mobileView === tab.id;
        const label = copy[tab.itemKey] || tab.fallback;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileView(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              active
                ? "text-[var(--ss-accent-primary)] border-t-2 border-[var(--ss-accent-primary)]"
                : "text-white/60 border-t-2 border-transparent hover:text-white/80"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </footer>
  );
}
