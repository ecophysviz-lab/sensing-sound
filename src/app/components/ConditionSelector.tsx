import { useState } from "react";
import { Info } from "lucide-react";
import type { AmbientCondition, PanelCopyMap } from "../types";
import { useSoundStore } from "../store/useSoundStore";
import { usePanelCopy } from "../hooks/useSheetCopy";
import {
  conditionOrder,
  conditionDisplayOrder,
  conditionPillColor,
  conditionSelectedClass,
  conditionInfo,
} from "../data/conditions";
import contextIcon from "@/assets/784a77a0f0c0038971397b6e6f7015e9b7c234e7.png";

const CONTEXT_FALLBACK = {
  Title: "SELECT CONTEXT",
  "Volume label": "Volume",
  "Volume control aria": "Context volume control",
  "Option 1": "Calm Seas",
  "Option 2": "Wind & Waves",
  "Option 3": "Storm",
  "Option 4": "Cruise Ship",
  "Card 1 subtitle": "Summer",
  "Card 2 subtitle": "Winter",
  "Card 3 subtitle": "Heavy wind and waves",
  "Card 4 subtitle": "Ship noise",
  "Card 1 description": "Quiet seas increase the listening range",
  "Card 2 description": "Wind and waves decrease the listening range",
  "Card 3 description": "Loud environmental noise constrains hearing.",
  "Card 4 description": "Ship noise restricts listening space.",
};

function makeT(copy: PanelCopyMap) {
  return (key: string) =>
    copy[key] || CONTEXT_FALLBACK[key as keyof typeof CONTEXT_FALLBACK] || "";
}

function ConditionPill({
  conditionType,
  isSelected,
  onSelect,
  t,
}: {
  conditionType: AmbientCondition;
  isSelected: boolean;
  onSelect: () => void;
  t: (key: string) => string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const info = conditionInfo[conditionType];
  const title = t(`Option ${info.cardNumber}`);
  const subtitle = t(`Card ${info.cardNumber} subtitle`);
  const description = t(`Card ${info.cardNumber} description`);

  return (
    <button
      onClick={onSelect}
      className={`h-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
        isSelected
          ? `${conditionSelectedClass[conditionType]} ring-2 ring-white shadow-lg`
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      <img
        src={info.icon}
        alt=""
        className={`w-8 h-8 object-contain ${isSelected ? "scale-110" : ""}`}
      />
      <div className="text-left leading-tight flex-1">
        <div className={`text-white text-xs font-semibold uppercase ${isSelected ? "font-bold" : ""}`}>
          {title}
        </div>
        {subtitle && (
          <div className="text-white/60 text-[10px] leading-tight">{subtitle}</div>
        )}
      </div>
      <div
        className="relative"
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        <Info className="w-4 h-4 text-white/60 hover:text-white/90 cursor-help transition-colors" />
        {showInfo && (
          <div className="absolute right-0 top-full mt-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-lg border border-white/10">
            {description}
          </div>
        )}
      </div>
    </button>
  );
}

export default function ConditionSelector() {
  const condition = useSoundStore((s) => s.oceanCondition);
  const setCondition = useSoundStore((s) => s.setOceanCondition);
  const currentContextIndex = conditionOrder.indexOf(condition);

  const { copy } = usePanelCopy("Select Context");
  const t = makeT(copy);

  return (
    <div className="ss-panel-soft rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center gap-2 ss-accent-text text-sm uppercase tracking-wider font-bold" style={{ flex: "0 0 20%" }}>
        <img src={contextIcon} alt="" className="w-5 h-5 object-contain opacity-80" />
        <span>{t("Title")}</span>
      </div>
      <div className="flex gap-3 items-stretch" style={{ flex: "0 0 80%" }}>
        <div className="w-10 flex flex-col items-center">
          <div className="text-[9px] uppercase tracking-wide text-white/70 mb-1">{t("Volume label")}</div>
          <div className="relative flex-1 w-full">
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={currentContextIndex}
              onChange={(e) => setCondition(conditionOrder[Number(e.target.value)])}
              className="context-knob absolute left-1/2 -translate-x-1/2 top-[11.375%] h-[77.25%]"
              style={{ ["--context-slider-color" as string]: conditionPillColor[condition] }}
              aria-label={t("Volume control aria")}
            />
          </div>
        </div>
        <div className="grid grid-rows-4 gap-2 flex-1">
          {conditionDisplayOrder.map((conditionType) => (
            <ConditionPill
              key={conditionType}
              conditionType={conditionType}
              isSelected={condition === conditionType}
              onSelect={() => setCondition(conditionType)}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
