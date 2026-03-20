export type AmbientCondition = "calm" | "winter" | "storm" | "cruiseShip";

export interface AmbientConditionInfo {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export interface Noise {
  audioFile: string;
  spectrogram: string;
}

export interface DetectionData {
  peakFrequency: number;
  thirdOctaveBand: number;
  calm: number;
  winter: number;
  storm: number;
  cruiseShip: number;
}

export interface AudioParticipant {
  id: string;
  name: string;
  icon: string;
  scientificName: string;
  source: boolean;
  listener: boolean;
  noise: Noise;
  listens_to: AudioParticipant[];
  detections: Record<string, DetectionData>;
  audioVolumeAdjustmentFactor?: number;
}
