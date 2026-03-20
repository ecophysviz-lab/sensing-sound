import type { AmbientCondition, AudioParticipant } from "../types";
import { useSoundStore } from "../store/useSoundStore";
import { formatDistance, formatAnimalLabel } from "../utils/formatting";
import underwaterBg from "@/assets/58cf7a0f771955415ed9a0900074952ee2c8a1f7.png";

const contextPillColorOpaque: Record<AmbientCondition, string> = {
  calm: "var(--ss-state-calm-solid)",
  winter: "var(--ss-state-winter-solid)",
  storm: "var(--ss-state-storm-solid)",
  cruiseShip: "var(--ss-state-cruise-ship-solid)",
};

const sideConfig = {
  left: {
    position: "left-1/3",
    align: "",
    label: "Listener",
    ringPrefix: "listener-ring",
    borderColor: "var(--ss-signal-listener-stroke)",
    innerClass: "relative",
  },
  right: {
    position: "left-2/3",
    align: "text-right",
    label: "Sound Producer",
    ringPrefix: "source-ring",
    borderColor: "var(--ss-signal-source-stroke)",
    innerClass: "relative inline-block",
  },
} as const;

function ParticipantIcon({ participant, side }: { participant: AudioParticipant; side: "left" | "right" }) {
  const cfg = sideConfig[side];
  return (
    <div className={`absolute ${cfg.position} top-1/3 md:top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${cfg.align}`}>
      <div className="text-white text-xs uppercase tracking-wider font-bold mb-2">{cfg.label}</div>
      <div className={cfg.innerClass}>
        <span className={`${cfg.ringPrefix} ${cfg.ringPrefix}-1`} />
        <span className={`${cfg.ringPrefix} ${cfg.ringPrefix}-2`} />
        <span className={`${cfg.ringPrefix} ${cfg.ringPrefix}-3`} />
        <div
          className="w-[8.8rem] h-[8.8rem] md:w-44 md:h-44 rounded-full border-8 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 shadow-2xl"
          style={{ borderColor: cfg.borderColor }}
        >
          <img src={participant.icon} alt={participant.name} className="w-full h-full object-contain drop-shadow-lg" />
        </div>
      </div>
      <div className="mt-3 text-white text-xl drop-shadow-lg">{formatAnimalLabel(participant.name)}</div>
      <div className="text-white/90 text-sm italic drop-shadow">{participant.scientificName}</div>
    </div>
  );
}

export default function SceneViewer() {
  const listener = useSoundStore((s) => s.listener);
  const source = useSoundStore((s) => s.source);
  const condition = useSoundStore((s) => s.oceanCondition);
  const distance = useSoundStore((s) => s.getDistance());

  return (
    <div className="relative h-full bg-white/5 rounded-lg overflow-hidden">
      <img
        src={underwaterBg}
        alt="Underwater scene"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />

      <div className="absolute inset-0 ss-home-overlay" />

      <div className="relative h-full p-8">
        <ParticipantIcon participant={listener} side="left" />

        {/* Distance pill */}
        <div
          className="absolute left-1/2 bottom-6 transform -translate-x-1/2 px-4 py-2 rounded-lg font-bold text-white text-center shadow-lg border z-10"
          style={{ background: contextPillColorOpaque[condition], borderColor: "var(--ss-accent-secondary)" }}
        >
          <div className="text-[11px] uppercase tracking-wide text-white/90">Sound Perception Distance</div>
          <div className="text-xl leading-tight">{formatDistance(distance)}</div>
        </div>

        <ParticipantIcon participant={source} side="right" />
      </div>
    </div>
  );
}
