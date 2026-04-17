import { useState, useRef, useEffect } from "react";
import type { AudioParticipant } from "../types";
import { useSoundStore } from "../store/useSoundStore";
import { listeners } from "../data/participants";
import { usePanelCopy } from "../hooks/useSheetCopy";
import listenerIcon from "@/assets/ca9fb87cf475c6320024953a6c99f360a8bb7fa4.png";
import soundIcon from "@/assets/fdfd2fb83371a16d3a6b5ce24d5901f66d00b810.png";

const LISTENER_FALLBACK: Record<string, string> = {
  Title: "SELECT LISTENER",
  "Option 1": "Harbor Seal",
  "Option 2": "Bottlenose Dolphin",
  "Option 3": "Killer Whale",
  "Swipe hint": "Swipe to rotate",
};
const SOUND_FALLBACK: Record<string, string> = {
  Title: "SELECT SOUND",
  "Option 1": "Rockfish Grunt",
  "Option 2": "Harbor Seal Roar",
  "Option 3": "Dolphin Whistle",
  "Option 4": "Killer Whale Call",
  "Swipe hint": "Swipe to rotate",
};

interface AudioParticipantSelectorProps {
  variant: "listener" | "source";
}

const WHEEL_SWITCH_THRESHOLD = 55;
const WHEEL_OFFSET_DAMPING = 0.14;
const WHEEL_MAX_OFFSET = 18;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getWrappedIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

function getCarouselWindow<T>(items: T[], centerIndex: number, radius = 2): T[] {
  if (items.length === 0) return [];
  const window: T[] = [];
  for (let offset = -radius; offset <= radius; offset += 1) {
    window.push(items[getWrappedIndex(centerIndex + offset, items.length)]);
  }
  return window;
}

export default function AudioParticipantSelector({ variant }: AudioParticipantSelectorProps) {
  const selected = useSoundStore((s) => (variant === "listener" ? s.listener : s.source));
  const setSelected = useSoundStore((s) => (variant === "listener" ? s.setListener : s.setSource));
  const listener = useSoundStore((s) => s.listener);

  const panelName = variant === "listener" ? "Select Listener" : "Select Sound";
  const fallback = variant === "listener" ? LISTENER_FALLBACK : SOUND_FALLBACK;
  const { copy, isLoading } = usePanelCopy(panelName);
  const t = (key: string) => copy[key] || fallback[key] || "";

  const items = variant === "listener" ? listeners : listener.listens_to;
  const icon = variant === "listener" ? listenerIcon : soundIcon;
  const selectedClass = variant === "listener" ? "ss-selected-listener" : "ss-selected-sound";

  const [scrollOffset, setScrollOffset] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const wheelRemainderRef = useRef(0);
  const snapTimerRef = useRef<number | null>(null);

  const centerIndex = Math.max(0, items.findIndex((p) => p.id === selected.id));
  const carousel = getCarouselWindow(items, centerIndex);

  const cycle = (step: number) => {
    if (items.length === 0) return;
    const current = items.findIndex((p) => p.id === selected.id);
    const next = getWrappedIndex((current < 0 ? 0 : current) + step, items.length);
    setSelected(items[next]);
  };

  const scheduleOffsetReset = () => {
    if (snapTimerRef.current !== null) {
      window.clearTimeout(snapTimerRef.current);
    }
    snapTimerRef.current = window.setTimeout(() => {
      setScrollOffset(0);
      wheelRemainderRef.current = 0;
      snapTimerRef.current = null;
    }, 110);
  };

  const handleWheel = (deltaY: number) => {
    wheelRemainderRef.current += deltaY;
    const visualOffset = clamp(wheelRemainderRef.current * WHEEL_OFFSET_DAMPING, -WHEEL_MAX_OFFSET, WHEEL_MAX_OFFSET);
    setScrollOffset(visualOffset);

    while (Math.abs(wheelRemainderRef.current) >= WHEEL_SWITCH_THRESHOLD) {
      const step = wheelRemainderRef.current > 0 ? 1 : -1;
      cycle(step);
      wheelRemainderRef.current -= step * WHEEL_SWITCH_THRESHOLD;
      setScrollOffset(clamp(wheelRemainderRef.current * WHEEL_OFFSET_DAMPING, -WHEEL_MAX_OFFSET, WHEEL_MAX_OFFSET));
    }

    scheduleOffsetReset();
  };

  useEffect(() => {
    if (variant === "source" && !items.some((p) => p.id === selected.id)) {
      if (items.length > 0) setSelected(items[0]);
    }
  }, [listener, variant, items, selected.id, setSelected]);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    return () => {
      if (snapTimerRef.current !== null) {
        window.clearTimeout(snapTimerRef.current);
      }
    };
  }, []);

  const getItemLabel = (item: AudioParticipant): string => {
    const key = variant === "source" ? item.sourceCopyKey : item.listenerCopyKey;
    return key ? t(key) : "";
  };

  if (isLoading) {
    return (
      <div className="ss-panel-soft rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-white/20 rounded w-1/2 mb-4" />
        <div className="bg-white/5 border border-white/20 rounded-xl p-2 h-24" />
      </div>
    );
  }

  return (
    <div className="ss-panel-soft rounded-lg p-4">
      <div className="flex items-center gap-2 ss-accent-text text-base uppercase tracking-wider mb-4 font-bold">
        <img src={icon} alt="" className="w-5 h-5 object-contain opacity-80" />
        <span>{t("Title")}</span>
      </div>
      <div
        className="bg-white/5 border border-white/20 rounded-xl p-2 overflow-hidden"
        onWheel={isTouchDevice ? (e) => { e.preventDefault(); handleWheel(e.deltaY); } : undefined}
      >
        <div
          className="flex items-center justify-center gap-1 transition-transform duration-100 ease-out"
          style={{ transform: `translateX(${scrollOffset}px)` }}
        >
          {carousel.map((item, i) => {
            const isCenter = i === 2;
            const distanceFromCenter = Math.abs(i - 2);
            return (
              <button
                key={`${variant}-carousel-${i}-${item.id}`}
                type="button"
                onClick={() => setSelected(item)}
                className={`shrink-0 rounded-lg transition-all duration-200 ${
                  isCenter
                    ? `${selectedClass} ring-2 ring-white shadow-lg px-2 py-1.5`
                    : "bg-white/10 hover:bg-white/20 px-1.5 py-1"
                }`}
                style={{
                  opacity: distanceFromCenter === 0 ? 1 : distanceFromCenter === 1 ? 0.75 : 0.45,
                  transform: `scale(${distanceFromCenter === 0 ? 1 : distanceFromCenter === 1 ? 0.86 : 0.74})`,
                }}
              >
                <img src={item.icon} alt="" className="w-20 h-20 object-contain mx-auto" />
                {isCenter && (
                  <div className={`text-white text-xs mt-1 text-center ${variant === "source" ? "italic" : ""}`}>
                    {getItemLabel(item)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {isTouchDevice && (
          <div className="text-[10px] text-white/65 text-center mt-1">{t("Swipe hint")}</div>
        )}
      </div>
    </div>
  );
}
