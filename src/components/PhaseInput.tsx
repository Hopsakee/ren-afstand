import { useEffect, useRef } from "react";
import { Phase, togglePhaseMode, calcPhaseDistance, calcPhaseDuration, formatDurationFromSec } from "@/lib/workout";
import { X, ArrowLeftRight } from "lucide-react";

interface Props {
  phase: Phase;
  index: number;
  showRemove: boolean;
  onChange: (phase: Phase) => void;
  onRemove: () => void;
  shouldFocusDuration?: boolean;
  onFocusConsumed?: () => void;
}

function PaceField({
  label,
  min,
  sec,
  onMinChange,
  onSecChange,
}: {
  label: string;
  min: string;
  sec: string;
  onMinChange: (v: string) => void;
  onSecChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5">
        <input
          type="number"
          min="0"
          max="59"
          placeholder="m"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className="w-10 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-muted-foreground font-bold">:</span>
        <input
          type="number"
          min="0"
          max="59"
          placeholder="s"
          value={sec}
          onChange={(e) => onSecChange(e.target.value)}
          className="w-10 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export default function PhaseInput({ phase, index, showRemove, onChange, onRemove, shouldFocusDuration, onFocusConsumed }: Props) {
  const update = (patch: Partial<Phase>) => onChange({ ...phase, ...patch });
  const durationMinRef = useRef<HTMLInputElement>(null);
  const distanceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocusDuration) {
      requestAnimationFrame(() => {
        if (phase.mode === "time") {
          durationMinRef.current?.focus();
        } else {
          distanceRef.current?.focus();
        }
        onFocusConsumed?.();
      });
    }
  }, [shouldFocusDuration, onFocusConsumed, phase.mode]);

  const handleToggleMode = () => {
    onChange(togglePhaseMode(phase));
  };

  // Computed result for display
  const result = phase.mode === "time"
    ? calcPhaseDistance(phase)
    : calcPhaseDuration(phase);

  return (
    <div data-phase-id={phase.id} className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-muted/50 relative">
      {showRemove && (
        <button
          onClick={onRemove}
          tabIndex={-1}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove phase"
        >
          <X size={14} />
        </button>
      )}

      {/* Mode toggle button */}
      <button
        onClick={handleToggleMode}
        tabIndex={-1}
        className="absolute top-2 right-8 p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle calculation mode"
        title={phase.mode === "time" ? "Switch to: know distance, calc time" : "Switch to: know time, calc distance"}
      >
        <ArrowLeftRight size={14} />
      </button>

      {phase.mode === "time" ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Duration {index > 0 ? `(phase ${index + 1})` : ""}
          </span>
          <div className="flex items-center gap-1">
            <input
              ref={durationMinRef}
              type="number"
              min="0"
              placeholder="min"
              value={phase.durationMin}
              onChange={(e) => update({ durationMin: e.target.value })}
              className="w-14 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">m</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="sec"
              value={phase.durationSec}
              onChange={(e) => update({ durationSec: e.target.value })}
              className="w-14 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">s</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Distance {index > 0 ? `(phase ${index + 1})` : ""}
          </span>
          <div className="flex items-center gap-1">
            <input
              ref={distanceRef}
              type="number"
              min="0"
              step="0.01"
              placeholder="km"
              value={phase.distanceKm}
              onChange={(e) => update({ distanceKm: e.target.value })}
              className="w-20 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">km</span>
          </div>
        </div>
      )}

      <PaceField
        label="Slow pace /km"
        min={phase.paceMinMin}
        sec={phase.paceMinSec}
        onMinChange={(v) => update({ paceMinMin: v })}
        onSecChange={(v) => update({ paceMinSec: v })}
      />

      <PaceField
        label="Fast pace /km"
        min={phase.paceMaxMin}
        sec={phase.paceMaxSec}
        onMinChange={(v) => update({ paceMaxMin: v })}
        onSecChange={(v) => update({ paceMaxSec: v })}
      />

      {/* Show computed result */}
      {result > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            {phase.mode === "time" ? "≈ distance" : "≈ time"}
          </span>
          <div className="h-10 flex items-center text-sm font-semibold text-primary">
            {phase.mode === "time"
              ? `${result.toFixed(3)} km`
              : formatDurationFromSec(result)
            }
          </div>
        </div>
      )}
    </div>
  );
}
