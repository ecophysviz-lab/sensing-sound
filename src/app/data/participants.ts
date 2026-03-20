import type { AudioParticipant } from "../types";

import harborSealIcon from "@/assets/ae6420e7e13fdb75fda431bbe0983f9edfff3ba0.png";
import dolphinIcon from "@/assets/6e437c4de464e8599fcd42edacd7e3b7aa527daf.png";
import killerWhaleIcon from "@/assets/7286e0f12e79234dbb73ab313c5a7334a01234ad.png";
import rockfishIcon from "@/assets/1a59581f38678f44d8c992e8f18dd3d6d87706f7.png";

import rockfishGruntAudio from "@/assets/Bocaccio-Rockfish_Grunt.wav";
import killerWhaleCallAudio from "@/assets/Killer-whale_call.m4a";
import dolphinWhistleAudio from "@/assets/Dolphin-whistle.m4a";
import harborSealRoarAudio from "@/assets/Harbor-seal_roar_06062016_Project 006_sprouts.wav";

import rockfishGruntSpectrogram from "@/assets/Bocaccio-Rockfish_Grunt_spectrogram.png";
import dolphinWhistleSpectrogram from "@/assets/Dolphin-whistle_spectrogram.png";
import killerWhaleCallSpectrogram from "@/assets/Killer-whale_call_spectrogram.png";
import harborSealRoarSpectrogram from "@/assets/Harbor-seal_roar_spectrogram.png";

export const rockfish: AudioParticipant = {
  id: "rockfish",
  name: "Rockfish",
  icon: rockfishIcon,
  scientificName: "Sebastes spp.",
  source: true,
  listener: false,
  noise: { audioFile: rockfishGruntAudio, spectrogram: rockfishGruntSpectrogram },
  listens_to: [],
  detections: {},
};

export const harborSeal: AudioParticipant = {
  id: "harbor-seal",
  name: "Harbor Seal",
  icon: harborSealIcon,
  scientificName: "Phoca vitulina",
  source: true,
  listener: true,
  noise: { audioFile: harborSealRoarAudio, spectrogram: harborSealRoarSpectrogram },
  listens_to: [],
  detections: {},
  audioVolumeAdjustmentFactor: 2,
};

export const bottlenoseDolphin: AudioParticipant = {
  id: "bottlenose-dolphin",
  name: "Bottlenose Dolphin",
  icon: dolphinIcon,
  scientificName: "Tursiops truncatus",
  source: true,
  listener: true,
  noise: { audioFile: dolphinWhistleAudio, spectrogram: dolphinWhistleSpectrogram },
  listens_to: [],
  detections: {},
};

export const killerWhale: AudioParticipant = {
  id: "killer-whale",
  name: "Killer Whale",
  icon: killerWhaleIcon,
  scientificName: "Orcinus orca",
  source: true,
  listener: true,
  noise: { audioFile: killerWhaleCallAudio, spectrogram: killerWhaleCallSpectrogram },
  listens_to: [],
  detections: {},
};

// Wire up listens_to and detections from the original soundData.

harborSeal.listens_to = [rockfish, harborSeal, killerWhale, bottlenoseDolphin];
harborSeal.detections = {
  [rockfish.id]: {
    peakFrequency: 160,
    thirdOctaveBand: 107,
    calm: 0.05,
    winter: 0.07,
    storm: 0.05,
    cruiseShip: 0.02,
  },
  [harborSeal.id]: {
    peakFrequency: 500,
    thirdOctaveBand: 138,
    calm: 12.37,
    winter: 9.6,
    storm: 5.43,
    cruiseShip: 2.15,
  },
  [killerWhale.id]: {
    peakFrequency: 2500,
    thirdOctaveBand: 150,
    calm: 73.48,
    winter: 66.06,
    storm: 37.67,
    cruiseShip: 23.71,
  },
  [bottlenoseDolphin.id]: {
    peakFrequency: 10000,
    thirdOctaveBand: 136,
    calm: 8.99,
    winter: 7.49,
    storm: 4.15,
    cruiseShip: 2.05,
  },
};

bottlenoseDolphin.listens_to = [killerWhale, bottlenoseDolphin];
bottlenoseDolphin.detections = {
  [killerWhale.id]: {
    peakFrequency: 2500,
    thirdOctaveBand: 150,
    calm: 39.11,
    winter: 34.57,
    storm: 15.39,
    cruiseShip: 8.34,
  },
  [bottlenoseDolphin.id]: {
    peakFrequency: 10000,
    thirdOctaveBand: 136,
    calm: 7.82,
    winter: 6.47,
    storm: 3.45,
    cruiseShip: 1.62,
  },
};

killerWhale.listens_to = [harborSeal, killerWhale, bottlenoseDolphin];
killerWhale.detections = {
  [harborSeal.id]: {
    peakFrequency: 500,
    thirdOctaveBand: 138,
    calm: 0.22,
    winter: 0.22,
    storm: 0.22,
    cruiseShip: 0.22,
  },
  [killerWhale.id]: {
    peakFrequency: 2500,
    thirdOctaveBand: 150,
    calm: 31.62,
    winter: 31.62,
    storm: 23.71,
    cruiseShip: 13.99,
  },
  [bottlenoseDolphin.id]: {
    peakFrequency: 10000,
    thirdOctaveBand: 136,
    calm: 8.86,
    winter: 7.42,
    storm: 4.15,
    cruiseShip: 2.06,
  },
};

export const allParticipants: AudioParticipant[] = [
  rockfish,
  harborSeal,
  bottlenoseDolphin,
  killerWhale,
];

export const listeners: AudioParticipant[] = allParticipants.filter((p) => p.listener);
export const sources: AudioParticipant[] = allParticipants.filter((p) => p.source);
