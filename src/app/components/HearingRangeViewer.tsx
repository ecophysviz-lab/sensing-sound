import { useSoundStore } from "../store/useSoundStore";

const hearingRanges = [
  {
    key: "bottlenose-dolphin",
    name: "Bottlenose Dolphin",
    highHz: 146000,
    lowHz: 400,
    highLabel: "146 kHz",
    lowLabel: "400 Hz",
  },
  {
    key: "killer-whale",
    name: "Killer Whale",
    highHz: 140000,
    lowHz: 200,
    highLabel: "140 kHz",
    lowLabel: "200 Hz",
  },
  {
    key: "harbor-seal",
    name: "Harbor Seal",
    highHz: 79000,
    lowHz: 90,
    highLabel: "79 kHz",
    lowLabel: "<100 Hz",
  },
  {
    key: "human-air",
    name: "Human (In Air)",
    highHz: 20000,
    lowHz: 20,
    highLabel: "20 kHz",
    lowLabel: "20 Hz",
  },
  {
    key: "human-water",
    name: "Human (In Water)",
    highHz: 10000,
    lowHz: 100,
    highLabel: "10 kHz",
    lowLabel: "100 Hz",
  },
] as const;

const axisTicks = [146000, 100000, 20000, 10000, 1000, 400, 200, 100, 20] as const;

const MIN_HZ = 20;
const MAX_HZ = 146000;

function toLogPercent(hz: number): number {
  const minLog = Math.log(MIN_HZ);
  const maxLog = Math.log(MAX_HZ);
  return ((Math.log(MAX_HZ) - Math.log(hz)) / (maxLog - minLog)) * 100;
}

function formatTick(hz: number): string {
  if (hz >= 1000) {
    const khz = hz / 1000;
    return Number.isInteger(khz) ? `${khz} kHz` : `${khz.toFixed(1)} kHz`;
  }
  return `${hz} Hz`;
}

export default function HearingRangeViewer() {
  const listener = useSoundStore((s) => s.listener);

  return (
    <div className="h-full w-full rounded-2xl border border-white/15 bg-black/20 backdrop-blur-sm px-4 py-4 text-white">
      <div className="ss-accent-text text-sm font-bold tracking-wider uppercase mb-5">Hearing Ranges</div>

      <div className="grid grid-cols-[52px_1fr] gap-2 h-[calc(100%-64px)]">
        <div className="relative h-full">
          <div className="absolute inset-x-0 top-4 bottom-7">
            {axisTicks.map((tick) => {
              const y = toLogPercent(tick);
              return (
                <div key={tick} className="absolute left-0 right-0" style={{ top: `${y}%`, transform: "translateY(-50%)" }}>
                  <div className="text-[10px] leading-none text-white/75">{formatTick(tick)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative h-full">
          <div className="absolute left-0 top-4 bottom-7 w-px bg-white/25" />

          <div className="absolute left-0 right-0 top-4 bottom-7 grid grid-cols-5 gap-2 pl-3">
            {hearingRanges.map((item) => {
              const top = toLogPercent(item.highHz);
              const bottom = toLogPercent(item.lowHz);
              const height = Math.max(1, bottom - top);
              const isActive = item.key === listener.id;

              return (
                <div key={item.key} className="relative h-full">
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-3 rounded-full border ${
                      isActive ? "border-white ring-2 ring-white/50" : "border-white/40"
                    }`}
                    style={{
                      top: `${top}%`,
                      height: `${height}%`,
                      background:
                        "linear-gradient(to bottom, color-mix(in srgb, var(--ss-accent-secondary), white 10%), color-mix(in srgb, var(--ss-accent-primary), transparent 10%), rgba(255,255,255,0.95))",
                    }}
                  />

                  <div
                    className={`absolute whitespace-nowrap rounded-full border bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      isActive ? "border-white text-white" : "border-white/20 text-white/90"
                    }`}
                    style={{
                      left: "calc(50% - 8px)",
                      top: `${(top + bottom) / 2}%`,
                      transform: "translate(-58%, -50%) rotate(-90deg)",
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 text-[11px] italic text-white/80">No rockfish audiometry data.</div>
    </div>
  );
}
