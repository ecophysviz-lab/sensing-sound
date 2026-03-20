import type { AmbientCondition, AmbientConditionInfo } from "../types";

import calmIcon from "@/assets/e65a9047f4f935b712f1a005b183ec3f059d51e1.png";
import winterIcon from "@/assets/5b3d7954d5b036202934c5a13a0ba824127398df.png";
import stormIcon from "@/assets/fb96a261a239fa7f23f5d07c3a46c921e5be61bd.png";
import cruiseShipIcon from "@/assets/12f4059262a1e4783417b0a59b00d843925de4c3.png";

export const conditionOrder: AmbientCondition[] = ["calm", "winter", "storm", "cruiseShip"];
export const conditionDisplayOrder: AmbientCondition[] = [...conditionOrder].reverse();

export const conditionPillColor: Record<AmbientCondition, string> = {
  calm: "var(--ss-state-calm)",
  winter: "var(--ss-state-winter)",
  storm: "var(--ss-state-storm)",
  cruiseShip: "var(--ss-state-cruise-ship)",
};

export const conditionSelectedClass: Record<AmbientCondition, string> = {
  calm: "ss-selected-calm",
  winter: "ss-selected-winter",
  storm: "ss-selected-storm",
  cruiseShip: "ss-selected-cruise",
};

export const conditionInfo: Record<AmbientCondition, AmbientConditionInfo> = {
  calm: { title: "CALM", subtitle: "Summer", description: "Quiet seas maximize listening distance.", icon: calmIcon },
  winter: { title: "WIND & WAVES", subtitle: "Winter", description: "Surface chop masks distant calls.", icon: winterIcon },
  storm: { title: "STORM", subtitle: "Heavy wind and waves", description: "High intensity ambient noise masks noise.", icon: stormIcon },
  cruiseShip: { title: "CRUISE SHIP", subtitle: "Ship noise", description: "Engine hum narrows hearing range.", icon: cruiseShipIcon },
};
