import type { AmbientCondition, AmbientConditionInfo } from "../types";

import calmIcon from "@/assets/e65a9047f4f935b712f1a005b183ec3f059d51e1.png";
import stormIcon from "@/assets/5b3d7954d5b036202934c5a13a0ba824127398df.png";
import cruiseShipIcon from "@/assets/fb96a261a239fa7f23f5d07c3a46c921e5be61bd.png";
import winterIcon from "@/assets/12f4059262a1e4783417b0a59b00d843925de4c3.png";

export const conditionOrder: AmbientCondition[] = ["calm", "winter", "storm", "cruiseShip"];
export const conditionDisplayOrder: AmbientCondition[] = [...conditionOrder].reverse();

export const conditionPillColor: Record<AmbientCondition, string> = {
  calm: "var(--ss-state-calm)",
  winter: "var(--ss-state-winter)",
  storm: "var(--ss-state-storm)",
  cruiseShip: "var(--ss-state-cruise-ship)",
};

// Actual rgba values for SVG/canvas contexts where CSS variables are unavailable
export const conditionBarColor: Record<AmbientCondition, string> = {
  calm: "rgba(45, 212, 191, 0.9)",
  winter: "rgba(234, 179, 8, 0.9)",
  storm: "rgba(220, 38, 38, 0.9)",
  cruiseShip: "rgba(127, 29, 29, 0.9)",
};

export const conditionBarColorDim: Record<AmbientCondition, string> = {
  calm: "rgba(45, 212, 191, 0.3)",
  winter: "rgba(234, 179, 8, 0.3)",
  storm: "rgba(220, 38, 38, 0.3)",
  cruiseShip: "rgba(127, 29, 29, 0.3)",
};

export const conditionSelectedClass: Record<AmbientCondition, string> = {
  calm: "ss-selected-calm",
  winter: "ss-selected-winter",
  storm: "ss-selected-storm",
  cruiseShip: "ss-selected-cruise",
};

// Card numbers mirror the `Select Context` panel in the Google Sheet:
//   Option 1 / Card 1 ... = Calm Seas (summer)
//   Option 2 / Card 2 ... = Wind & Waves (winter)
//   Option 3 / Card 3 ... = Storm
//   Option 4 / Card 4 ... = Cruise Ship
export const conditionInfo: Record<AmbientCondition, AmbientConditionInfo> = {
  calm: { cardNumber: 1, icon: calmIcon },
  winter: { cardNumber: 2, icon: winterIcon },
  storm: { cardNumber: 3, icon: stormIcon },
  cruiseShip: { cardNumber: 4, icon: cruiseShipIcon },
};
