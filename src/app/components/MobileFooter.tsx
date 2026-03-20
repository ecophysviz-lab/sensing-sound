import { Eye, BarChart3 } from "lucide-react";
import { useSoundStore } from "../store/useSoundStore";
import type { MobileView } from "../store/useSoundStore";

const tabs: { id: MobileView; label: string; icon: typeof Eye }[] = [
  { id: "scene", label: "Scene View", icon: Eye },
  { id: "range", label: "Range View", icon: BarChart3 },
];

export default function MobileFooter() {
  const mobileView = useSoundStore((s) => s.mobileView);
  const setMobileView = useSoundStore((s) => s.setMobileView);

  return (
    <footer className="md:hidden flex-none z-20 flex bg-teal-900/60 backdrop-blur-sm">
      {tabs.map((tab) => {
        const active = mobileView === tab.id;
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
            {tab.label}
          </button>
        );
      })}
    </footer>
  );
}
