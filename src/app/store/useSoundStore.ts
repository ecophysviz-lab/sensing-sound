import { create } from "zustand";
import type { AmbientCondition, AudioParticipant, DetectionData } from "../types";
import { harborSeal, rockfish } from "../data/participants";

export type MobileView = "scene" | "range";
export type MobileMenuTarget = "condition" | "listener" | "source" | null;

interface SoundStore {
  oceanCondition: AmbientCondition;
  listener: AudioParticipant;
  source: AudioParticipant;
  mobileView: MobileView;
  mobileMenuTarget: MobileMenuTarget;

  setOceanCondition: (condition: AmbientCondition) => void;
  setListener: (participant: AudioParticipant) => void;
  setSource: (participant: AudioParticipant) => void;
  setMobileView: (view: MobileView) => void;
  setMobileMenuTarget: (target: MobileMenuTarget) => void;

  getSoundData: () => DetectionData | null;
  getDistance: () => number;
}

export const useSoundStore = create<SoundStore>()((set, get) => ({
  oceanCondition: "winter",
  listener: harborSeal,
  source: rockfish,
  mobileView: "scene",
  mobileMenuTarget: null,

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
}));
