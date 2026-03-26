import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import type { AmbientCondition, AudioParticipant } from "../types";
import { useSoundStore } from "../store/useSoundStore";
import { formatDistance, formatAnimalLabel, formatAudioTime } from "../utils/formatting";
import { useIsMobile } from "./ui/use-mobile";
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

function ParticipantIcon({
  participant,
  side,
  spectrogram,
  isPlaying,
  isMuted,
  progress,
  duration,
  onTogglePlayback,
  onToggleMute,
}: {
  participant: AudioParticipant;
  side: "left" | "right";
  spectrogram?: string;
  isPlaying?: boolean;
  isMuted?: boolean;
  progress?: number;
  duration?: number;
  onTogglePlayback?: () => void;
  onToggleMute?: () => void;
}) {
  const cfg = sideConfig[side];

  const label = (
    <div className="text-white text-xs uppercase tracking-wider font-bold mb-2">{cfg.label}</div>
  );

  const circle = (
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
  );

  const nameBlock = (
    <>
      <div className="mt-3 text-white text-xl drop-shadow-lg">{formatAnimalLabel(participant.name)}</div>
      <div className="text-white/90 text-sm italic drop-shadow">{participant.scientificName}</div>
    </>
  );

  if (!spectrogram) {
    return (
      <div className={`absolute ${cfg.position} top-1/3 md:top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${cfg.align}`}>
        {label}
        {circle}
        {nameBlock}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: standard icon only */}
      <div className={`md:hidden absolute ${cfg.position} top-1/3 transform -translate-x-1/2 -translate-y-1/2 ${cfg.align}`}>
        {label}
        {circle}
        {nameBlock}
      </div>

      {/* Desktop: icon + spectrogram combo */}
      <div
        className="hidden md:block absolute top-1/2 -translate-y-1/2 text-right"
        style={{ left: "48%", right: "1rem" }}
      >
        <div className="text-white text-xs uppercase tracking-wider font-bold mb-2">{cfg.label}</div>

        <div className="flex items-center">
          <div className="relative z-10 flex-shrink-0">
            {circle}
          </div>
          <div
            className="@container relative rounded-md overflow-hidden border-2 bg-black/35 h-28 flex-1"
            style={{ borderColor: cfg.borderColor, transform: "translateX(-10%)" }}
          >
            <img src={spectrogram} alt="Spectrogram" className="w-full h-full object-fill" />
            {progress !== undefined && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)] transition-[left] duration-75 ease-linear pointer-events-none"
                style={{ left: `${Math.max(0, Math.min(100, progress * 100))}%` }}
              />
            )}
            {onTogglePlayback && (
              <div className="absolute top-2 right-2 flex flex-row gap-1.5 z-10">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 hover:bg-black/70 text-white text-xs transition-colors backdrop-blur-sm"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="hidden @[12rem]:inline">{isMuted ? "Muted" : "Unmuted"}</span>
                </button>
                <button
                  type="button"
                  onClick={onTogglePlayback}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 hover:bg-black/70 text-white text-xs transition-colors backdrop-blur-sm"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden @[12rem]:inline">{isPlaying ? "Pause" : "Play"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {duration !== undefined && (
          <div
            className="mt-1 flex justify-between text-[10px] text-white/75 tabular-nums"
            style={{ transform: "translateX(-10%)" }}
          >
            <span>{formatAudioTime((duration || 0) * (progress ?? 0))}</span>
            <span>{formatAudioTime(duration || 0)}</span>
          </div>
        )}

        {nameBlock}
      </div>
    </>
  );
}

export default function SceneViewer() {
  const listener = useSoundStore((s) => s.listener);
  const source = useSoundStore((s) => s.source);
  const condition = useSoundStore((s) => s.oceanCondition);
  const distance = useSoundStore((s) => s.getDistance());
  const isMobile = useIsMobile();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioFile = source.noise.audioFile;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return;
      setProgress(audio.currentTime / audio.duration);
    };
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => { setIsPlaying(false); setProgress(0); };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
    const p = audio.play();
    if (p && typeof p.catch === "function") p.catch(() => setIsPlaying(false));
  }, [source.id, audioFile]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const p = audio.play();
      if (p && typeof p.catch === "function") p.catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const toggleMute = () => setIsMuted((v) => !v);

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

        <ParticipantIcon
          participant={source}
          side="right"
          spectrogram={source.noise.spectrogram}
          {...(!isMobile && {
            isPlaying,
            isMuted,
            progress,
            duration,
            onTogglePlayback: togglePlayback,
            onToggleMute: toggleMute,
          })}
        />
      </div>

      {!isMobile && <audio ref={audioRef} src={audioFile} preload="metadata" muted={isMuted} />}
    </div>
  );
}
