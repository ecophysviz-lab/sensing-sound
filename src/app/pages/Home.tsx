import ConditionSelector from "../components/ConditionSelector";
import AudioParticipantSelector from "../components/AudioParticipantSelector";
import SceneViewer from "../components/SceneViewer";
import AudioViewer from "../components/AudioViewer";
import HearingRangeViewer from "../components/HearingRangeViewer";
import DetectionRanges from "../components/DetectionRanges";
import Navigation from "../components/Navigation";

import MobileFooter from "../components/MobileFooter";
import { useIsMobile } from "../components/ui/use-mobile";
import { useSoundStore } from "../store/useSoundStore";

export default function Home() {
  const isMobile = useIsMobile();
  const mobileView = useSoundStore((s) => s.mobileView);

  return (
    <div
      className="relative flex flex-col h-screen"
      style={{
        background:
          "linear-gradient(180deg, var(--ss-surface-panel-end) 0%, var(--ss-surface-panel-start) 50%, var(--ss-surface-panel-end) 100%)",
      }}
    >
      <Navigation />

      <div className="flex flex-row flex-1 overflow-hidden">
        {/* LeftPanel -- desktop only */}
        <div className="hidden md:flex w-1/4 flex-col gap-4 p-4 overflow-y-auto">
          <ConditionSelector />
          <AudioParticipantSelector variant="listener" />
          <AudioParticipantSelector variant="source" />
        </div>

        {/* MainContent */}
        <div className="flex-1 flex flex-col gap-4 p-4 min-h-0" style={{ flex: "1 1 0%" }}>
          {(!isMobile || mobileView === "scene") && (
            <>
              <div style={{ flex: "45 1 0%" }} className="min-h-0">
                <SceneViewer />
              </div>
              <div style={{ flex: "15 1 0%" }} className="min-h-0">
                <AudioViewer />
              </div>
            </>
          )}

          {(!isMobile || mobileView === "range") && (
            <div
              style={!isMobile ? { flex: "40 1 0%" } : { flex: "1 1 0%" }}
              className="flex flex-col md:flex-row gap-4 min-h-0"
            >
              <div className="w-full md:w-3/4 min-h-0 flex-1">
                <DetectionRanges />
              </div>
              <div className="hidden md:block w-full md:w-1/4 min-h-0">
                <HearingRangeViewer />
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileFooter />
    </div>
  );
}
