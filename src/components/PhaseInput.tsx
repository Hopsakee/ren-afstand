import { Phase } from "@/lib/workout";
import { X } from "lucide-react";

interface Props {
  phase: Phase;
  index: number;
  showRemove: boolean;
  onChange: (phase: Phase) => void;
  onRemove: () => void;
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

export default function PhaseInput({ phase, index, showRemove, onChange, onRemove }: Props) {
  const update = (patch: Partial<Phase>) => onChange({ ...phase, ...patch });

  return (
    <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg bg-muted/50 relative">
      {showRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove phase"
        >
          <X size={14} />
        </button>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Duration {index > 0 ? `(phase ${index + 1})` : ""}
        </span>
        <div className="flex items-center gap-1">
          <input
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
    </div>
  );
}
