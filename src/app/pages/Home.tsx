import { useEffect, useRef, useState } from "react";
import { Map as MapIcon, Image as ImageIcon } from "lucide-react";
import ConditionSelector from "../components/ConditionSelector";
import AudioParticipantSelector from "../components/AudioParticipantSelector";
import SceneViewer from "../components/SceneViewer";
import ListeningRangeMap from "../components/ListeningRangeMap";
import AudioViewer from "../components/AudioViewer";
import HearingRangeViewer from "../components/HearingRangeViewer";
import DetectionRanges from "../components/DetectionRanges";
import Navigation from "../components/Navigation";

import MobileFooter from "../components/MobileFooter";
import { useIsMobile } from "../components/ui/use-mobile";
import { useSoundStore } from "../store/useSoundStore";

type ScenePanel = "map" | "scene";

// Minimum width the SceneViewer needs alongside a square map for the
// side-by-side layout to feel usable. Below this, the row collapses to a
// single-panel toggle (the same pattern used on mobile viewports).
const MIN_SCENE_VIEWER_WIDTH = 320;

function ScenePanelToggle({
  panel,
  onToggle,
}: {
  panel: ScenePanel;
  onToggle: () => void;
}) {
  const nextLabel = panel === "scene" ? "Show map" : "Show scene";
  const Icon = panel === "scene" ? MapIcon : ImageIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={nextLabel}
      title={nextLabel}
      className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-black/55 hover:bg-black/75 text-white backdrop-blur-sm shadow-lg border border-white/15 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function SceneRow({ flex }: { flex: string }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [scenePanel, setScenePanel] = useState<ScenePanel>("scene");
  const toggleScenePanel = () =>
    setScenePanel((p) => (p === "scene" ? "map" : "scene"));

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const squareSide = size.height;
  const canFitSideBySide =
    squareSide > 0 && size.width >= squareSide + MIN_SCENE_VIEWER_WIDTH;

  return (
    <div
      ref={rowRef}
      style={{ flex }}
      className="min-h-0 flex flex-row gap-4"
    >
      {canFitSideBySide ? (
        <>
          <div
            className="h-full min-h-0 shrink-0"
            style={{ width: squareSide }}
          >
            <ListeningRangeMap />
          </div>
          <div className="flex-1 h-full min-h-0">
            <SceneViewer />
          </div>
        </>
      ) : scenePanel === "map" ? (
        <div className="w-full h-full min-h-0">
          <ListeningRangeMap
            mobileToggle={
              <ScenePanelToggle panel={scenePanel} onToggle={toggleScenePanel} />
            }
          />
        </div>
      ) : (
        <div className="w-full h-full min-h-0">
          <SceneViewer
            mobileToggle={
              <ScenePanelToggle panel={scenePanel} onToggle={toggleScenePanel} />
            }
          />
        </div>
      )}
    </div>
  );
}

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
        <div className="hidden md:flex w-1/4 flex-col gap-4 p-4 overflow-y-auto overflow-x-hidden" style={{ minWidth: 265 }}>
          <ConditionSelector />
          <AudioParticipantSelector variant="listener" />
          <AudioParticipantSelector variant="source" />
        </div>

        {/* MainContent */}
        <div className="flex-1 flex flex-col gap-4 p-4 min-h-0" style={{ flex: "1 1 0%" }}>
          {(!isMobile || mobileView === "scene") && (
            <>
              <SceneRow flex={isMobile ? "45 1 0%" : "50 1 0%"} />
              {isMobile && (
                <div style={{ flex: "15 1 0%" }} className="min-h-0">
                  <AudioViewer />
                </div>
              )}
            </>
          )}

          {(!isMobile || mobileView === "range") && (
            <div
              style={!isMobile ? { flex: "50 1 0%" } : { flex: "1 1 0%" }}
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
