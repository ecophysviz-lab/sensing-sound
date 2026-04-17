import type { AudioParticipant, AmbientCondition } from "../types";
import { allParticipants } from "../data/participants";

export function formatDistance(dist: number): string {
  if (dist >= 1) {
    return `${dist.toFixed(2)} km`;
  }
  return `${(dist * 1000).toFixed(0)} m`;
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function findParticipantById(id: string): AudioParticipant | undefined {
  return allParticipants.find((p) => p.id === id);
}

export function getDetectionDistance(
  listener: AudioParticipant,
  source: AudioParticipant,
  condition: AmbientCondition,
): number {
  const detection = listener.detections[source.id];
  if (!detection) return 0;
  return detection[condition];
}
