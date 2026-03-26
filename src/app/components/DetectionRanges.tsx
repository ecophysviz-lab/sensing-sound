import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AmbientCondition, AudioParticipant } from "../types";
import { useSoundStore } from "../store/useSoundStore";
import { listeners } from "../data/participants";
import { conditionBarColor, conditionBarColorDim } from "../data/conditions";
import { formatDistance } from "../utils/formatting";
import { useIsMobile } from "./ui/use-mobile";

const DOMAIN_MIN = 0.01;
const DOMAIN_MAX = 100;
const LOG_MIN = Math.log(DOMAIN_MIN);
const LOG_RANGE = Math.log(DOMAIN_MAX) - LOG_MIN;
const Y_TICKS = [0.01, 0.1, 1, 10, 100];

interface BarEntry {
  key: string;
  listener: AudioParticipant;
  source: AudioParticipant;
  calm: number;
  winter: number;
  storm: number;
  cruiseShip: number;
}

interface ChartRecord {
  key: string;
  listener: AudioParticipant;
  source: AudioParticipant;
  calmDistance: number;
  currentDistance: number;
  maxDistance: number;
}

function formatYTick(value: number): string {
  if (value >= 1) return `${value}km`;
  return `${value * 1000}m`;
}

function buildBarData(): BarEntry[] {
  const listenerSortOrder: Record<string, number> = {
    "harbor-seal": 0,
    "bottlenose-dolphin": 1,
    "killer-whale": 2,
  };
  const sourceSortOrder: Record<string, number> = {
    rockfish: 0,
    "harbor-seal": 1,
    "bottlenose-dolphin": 2,
    "killer-whale": 3,
  };

  const entries: BarEntry[] = [];
  for (const l of listeners) {
    for (const s of l.listens_to) {
      const detection = l.detections[s.id];
      if (!detection) continue;
      entries.push({
        key: `${l.id}/${s.id}`,
        listener: l,
        source: s,
        calm: detection.calm,
        winter: detection.winter,
        storm: detection.storm,
        cruiseShip: detection.cruiseShip,
      });
    }
  }

  entries.sort((a, b) => {
    const ld = (listenerSortOrder[a.listener.id] ?? 99) - (listenerSortOrder[b.listener.id] ?? 99);
    if (ld !== 0) return ld;
    return (sourceSortOrder[a.source.id] ?? 99) - (sourceSortOrder[b.source.id] ?? 99);
  });

  return entries;
}

const layeredData = buildBarData();

function getPairsForListener(listenerId: string): BarEntry[] {
  return layeredData.filter((e) => e.listener.id === listenerId);
}

function DetectionRangesHeader() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [iconRect, setIconRect] = useState<DOMRect | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (iconRef.current) {
      setIconRect(iconRef.current.getBoundingClientRect());
    }
  };

  return (
    <div className="px-4 py-4 flex-shrink-0 flex items-center gap-2">
      <div className="ss-accent-text text-sm font-bold tracking-wider uppercase">
        Detection Ranges
      </div>
      <div
        ref={iconRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Info className="w-4 h-4 text-white/60 hover:text-white/90 cursor-help transition-colors" />
        {showTooltip && iconRect && createPortal(
          <div
            className="fixed bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-[9999] shadow-lg border border-white/10 pointer-events-none"
            style={{
              left: iconRect.left + iconRect.width / 2,
              top: iconRect.bottom + 8,
              transform: "translateX(-50%)",
            }}
          >
            Maximum distance for sound perception under selected ocean conditions
          </div>,
          document.body,
        )}
      </div>
    </div>
  );
}

export default function DetectionRanges() {
  const condition = useSoundStore((s) => s.oceanCondition);
  const listener = useSoundStore((s) => s.listener);
  const source = useSoundStore((s) => s.source);
  const setListener = useSoundStore((s) => s.setListener);
  const setSource = useSoundStore((s) => s.setSource);
  const isMobile = useIsMobile();

  const currentKey = `${listener.id}/${source.id}`;

  const allGroups = listeners.map((l) => ({
    listener: l,
    data: getPairsForListener(l.id).map((item): ChartRecord => {
      const currentDistance = item[condition];
      return {
        key: item.key,
        listener: item.listener,
        source: item.source,
        calmDistance: item.calm,
        currentDistance,
        maxDistance: Math.max(item.calm, currentDistance),
      };
    }),
  }));

  const chartGroups = isMobile
    ? allGroups.filter((g) => g.listener.id === listener.id)
    : allGroups;

  const handleBarClick = useCallback(
    (data: any) => {
      const record = data?.payload ?? data;
      if (record?.listener && record?.source) {
        setListener(record.listener);
        setSource(record.source);
      }
    },
    [setListener, setSource],
  );

  const renderBarShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload || !width || height <= 0) return null;

    const { calmDistance, currentDistance, maxDistance, key } = payload;
    const isActive = key === currentKey;
    const baseline = y + height;

    const maxLogFrac = (Math.log(Math.max(maxDistance, DOMAIN_MIN)) - LOG_MIN) / LOG_RANGE;
    const calmLogFrac = (Math.log(Math.max(calmDistance, DOMAIN_MIN)) - LOG_MIN) / LOG_RANGE;
    const currentLogFrac = (Math.log(Math.max(currentDistance, DOMAIN_MIN)) - LOG_MIN) / LOG_RANGE;

    const scale = maxLogFrac > 0 ? height / maxLogFrac : 0;
    const calmH = Math.max(0, scale * calmLogFrac);
    const currentH = Math.max(0, scale * currentLogFrac);
    const barColor = conditionBarColor[condition];

    let percentLabel = null;
    if (condition !== "calm" && calmDistance > currentDistance) {
      const pct = (((calmDistance - currentDistance) / calmDistance) * 100).toFixed(0);
      const labelY = baseline - 8;
      percentLabel = (
        <text
          x={x + width / 2}
          y={labelY}
          textAnchor="middle"
          fill="white"
          fontSize={10}
          fontWeight="bold"
        >
          -{pct}%
        </text>
      );
    }

    return (
      <g style={{ cursor: "pointer" }}>
        <rect x={x} y={baseline - calmH} width={width} height={calmH} fill={conditionBarColorDim.calm} rx={3} ry={3} />
        <rect x={x} y={baseline - currentH} width={width} height={currentH} fill={barColor} rx={3} ry={3} />
        {isActive && (
          <rect
            x={x}
            y={baseline - currentH}
            width={width}
            height={currentH}
            fill="none"
            stroke="white"
            strokeWidth={2}
            rx={3}
            ry={3}
          />
        )}
        {percentLabel}
      </g>
    );
  };

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload as ChartRecord | undefined;
    if (!data) return null;
    const pct = data.calmDistance > 0
      ? (((data.calmDistance - data.currentDistance) / data.calmDistance) * 100).toFixed(0)
      : null;
    return (
      <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-white/10">
        <div className="font-semibold">{data.source.name}</div>
        <div>{formatDistance(data.currentDistance)}</div>
        {condition !== "calm" && pct !== null && (
          <div className="text-teal-300 text-[9px] mt-0.5">
            -{pct}% from calm
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ss-panel-gradient backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden flex h-full flex-col">
      <div className="basis-[15%] shrink-0">
        <DetectionRangesHeader />
      </div>

      <div className="basis-[85%] min-h-0 flex px-5 pb-5 gap-2">
        {chartGroups.map((group, groupIndex) => {
          if (group.data.length === 0) return null;
          const showAxis = groupIndex === 0;
          return (
            <div
              key={group.listener.id}
              className="flex flex-col min-h-0"
              style={{ flex: group.data.length, paddingTop: 12 }}
            >
              <div
                className="shrink-0 flex justify-around py-1"
                style={showAxis ? { marginLeft: 50 } : undefined}
              >
                {group.data.map((d) => (
                  <img
                    key={d.key}
                    src={d.source.icon}
                    alt={d.source.name}
                    className={`object-contain transition-all duration-200 ${isMobile ? "w-10 h-10" : "w-7 h-7"} ${d.source.id === source.id ? "opacity-100 scale-110" : "opacity-40"}`}
                  />
                ))}
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={group.data} barCategoryGap="20%" margin={{ top: 18 }}>
                    <XAxis dataKey="key" hide />
                    <YAxis
                      scale="log"
                      domain={[DOMAIN_MIN, DOMAIN_MAX]}
                      allowDataOverflow
                      ticks={Y_TICKS}
                      tickFormatter={formatYTick}
                      axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                      tickLine={{ stroke: "rgba(255,255,255,0.5)" }}
                      tick={{ fill: "rgba(255,255,255,0.9)", fontSize: 10 }}
                      width={showAxis ? 50 : 0}
                      hide={!showAxis}
                    />
                    <Tooltip
                      content={renderTooltip}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                    <Bar
                      dataKey="maxDistance"
                      shape={renderBarShape}
                      onClick={handleBarClick}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className="shrink-0 flex justify-center py-2 bg-white/12 border border-white/20 rounded-xl"
                style={showAxis ? { marginLeft: 50 } : undefined}
              >
                <img
                  src={group.listener.icon}
                  alt={group.listener.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
