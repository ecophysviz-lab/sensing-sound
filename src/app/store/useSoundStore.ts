import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AmbientCondition, AudioParticipant, DetectionData, Language } from "../types";
import { harborSeal, rockfish } from "../data/participants";

export type MobileView = "scene" | "range";
export type MobileMenuTarget = "condition" | "listener" | "source" | null;

interface SoundStore {
  language: Language;
  oceanCondition: AmbientCondition;
  listener: AudioParticipant;
  source: AudioParticipant;
  mobileView: MobileView;
  mobileMenuTarget: MobileMenuTarget;

  setLanguage: (lang: Language) => void;
  setOceanCondition: (condition: AmbientCondition) => void;
  setListener: (participant: AudioParticipant) => void;
  setSource: (participant: AudioParticipant) => void;
  setMobileView: (view: MobileView) => void;
  setMobileMenuTarget: (target: MobileMenuTarget) => void;

  getSoundData: () => DetectionData | null;
  getDistance: () => number;
}

const detectLanguage = (): Language =>
  typeof navigator !== "undefined" &&
  navigator.language?.toLowerCase().startsWith("es")
    ? "es"
    : "en";

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      language: detectLanguage(),
      oceanCondition: "winter",
      listener: harborSeal,
      source: rockfish,
      mobileView: "scene",
      mobileMenuTarget: null,

      setLanguage: (lang) => set({ language: lang }),
      setOceanCondition: (condition) => set({ oceanCondition: condition }),
      setListener: (participant) => set({ listener: participant }),
      setSource: (participant) => set({ source: participant }),
      setMobileView: (view) => set({ mobileView: view }),
      setMobileMenuTarget: (target) => set({ mobileMenuTarget: target }),

      getSoundData: () => {
        const { listener, source } = get();
        return listener.detections[source.id] ?? null;
      },

      getDistance: () => {
        const { oceanCondition } = get();
        const soundData = get().getSoundData();
        if (!soundData) return 0;
        return soundData[oceanCondition];
      },
    }),
    {
      name: "sensing-sound-language",
      storage: createJSONStorage(() => localStorage),
      // Persist only the language preference. Ocean condition, listener,
      // source, and mobile UI state remain per-session.
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
