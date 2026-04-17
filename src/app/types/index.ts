export type Language = "en" | "es";

export interface SheetRow {
  experienceType: string;
  panelName: string;
  itemName: string;
  en: string;
  es: string;
}

export type PanelCopyMap = Record<string, string>;

export type AmbientCondition = "calm" | "winter" | "storm" | "cruiseShip";

export type ConditionCardNumber = 1 | 2 | 3 | 4;

export interface AmbientConditionInfo {
  /**
   * Position of this condition in the `Select Context` panel of the Google
   * Sheet; used to resolve `Option N`, `Card N subtitle`, and
   * `Card N description` copy keys.
   */
  cardNumber: ConditionCardNumber;
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
  /**
   * `Item name` under the `Select Listener` panel for this participant.
   * `undefined` for participants that are not available as a listener.
   */
  listenerCopyKey?: string;
  /**
   * `Item name` under the `Select Sound` panel for this participant.
   * `undefined` for participants that are not available as a sound source.
   */
  sourceCopyKey?: string;
  icon: string;
  scientificName: string;
  source: boolean;
  listener: boolean;
  noise: Noise;
  listens_to: AudioParticipant[];
  detections: Record<string, DetectionData>;
  audioVolumeAdjustmentFactor?: number;
}
