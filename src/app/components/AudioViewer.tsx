import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useSoundStore } from "../store/useSoundStore";
import { usePanelCopy } from "../hooks/useSheetCopy";
import { formatAudioTime } from "../utils/formatting";

const SOUND_FALLBACK: Record<string, string> = {
  "Option 1": "Rockfish Grunt",
  "Option 2": "Harbor Seal Roar",
  "Option 3": "Dolphin Whistle",
  "Option 4": "Killer Whale Call",
};

const AUDIO_PANEL_FALLBACK: Record<string, string> = {
  "Button state - muted": "Muted",
  "Button state - unmuted": "Unmuted",
  "Button - play": "Play",
  "Button - pause": "Pause",
};

export default function AudioViewer() {
  const source = useSoundStore((s) => s.source);
  const { copy: soundCopy } = usePanelCopy("Select Sound");
  const { copy: audioCopy } = usePanelCopy("Audio Panel");
  const audioT = (key: string) =>
    audioCopy[key] || AUDIO_PANEL_FALLBACK[key] || "";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioFile = source.noise.audioFile;
  const spectrogram = source.noise.spectrogram;
  const soundKey = source.sourceCopyKey ?? "";
  const soundName = soundCopy[soundKey] || SOUND_FALLBACK[soundKey] || "";

  useEffect(() => {
    const saved = window.localStorage.getItem("ss-audio-muted");
    if (saved === "1") setIsMuted(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ss-audio-muted", isMuted ? "1" : "0");
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioCtxRef.current) return;

    const ctx = new AudioContext();
    const mediaSource = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    mediaSource.connect(gain);
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gain;
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = source.audioVolumeAdjustmentFactor ?? 1;
    }
  }, [source.audioVolumeAdjustmentFactor]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration || Number.isNaN(audio.duration)) return;
      setProgress(audio.currentTime / audio.duration);
    };
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
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
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => setIsPlaying(false));
    }
  }, [source.id, audioFile]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => setIsPlaying(false));
      }
    } else {
      audio.pause();
    }
  };

  return (
    <div className="ss-panel-soft rounded-lg p-4 border border-white/20 h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="ss-accent-text text-sm uppercase tracking-wider font-bold">
          {soundName}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>
              {isMuted ? audioT("Button state - muted") : audioT("Button state - unmuted")}
            </span>
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white text-xs transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>
              {isPlaying ? audioT("Button - pause") : audioT("Button - play")}
            </span>
          </button>
        </div>
      </div>

      {spectrogram ? (
        <div className="relative rounded-md overflow-hidden border border-white/20 bg-black/35 flex-1 min-h-0">
          <img src={spectrogram} alt={`${soundName} spectrogram`} className="w-full h-full object-fill" />
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)] transition-[left] duration-75 ease-linear"
            style={{ left: `${Math.max(0, Math.min(100, progress * 100))}%` }}
          />
        </div>
      ) : (
        <div className="rounded-md border border-white/20 bg-black/35 flex-1 min-h-0 flex items-center justify-center text-white/70 text-xs">
          {soundName} audio
        </div>
      )}

      <div className="mt-2 flex justify-between text-[10px] text-white/75 flex-shrink-0">
        <span>{formatAudioTime((duration || 0) * progress)}</span>
        <span>{formatAudioTime(duration)}</span>
      </div>

      <audio ref={audioRef} src={audioFile} preload="metadata" muted={isMuted} />
    </div>
  );
}
