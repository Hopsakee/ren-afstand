import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Segment, createPhase, calcSegmentDistance, formatDuration, formatPace } from "@/lib/workout";
import PhaseInput from "./PhaseInput";

interface Props {
  segment: Segment;
  onChange: (segment: Segment) => void;
  onRemove: () => void;
}

export default function SegmentCard({ segment, onChange, onRemove }: Props) {
  const distance = calcSegmentDistance(segment);

  const updatePhase = (idx: number, phase: typeof segment.phases[0]) => {
    const phases = [...segment.phases];
    phases[idx] = phase;
    onChange({ ...segment, phases });
  };

  const removePhase = (idx: number) => {
    onChange({ ...segment, phases: segment.phases.filter((_, i) => i !== idx) });
  };

  const addPhase = () => {
    onChange({ ...segment, phases: [...segment.phases, createPhase()] });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="Segment name (e.g. Warm-up)"
          value={segment.name}
          onChange={(e) => onChange({ ...segment, name: e.target.value })}
          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Reps</label>
          <input
            type="number"
            min="1"
            value={segment.repetitions}
            onChange={(e) => onChange({ ...segment, repetitions: e.target.value })}
            className="w-14 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={onRemove}
          className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove segment"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {segment.phases.map((phase, idx) => (
          <PhaseInput
            key={phase.id}
            phase={phase}
            index={idx}
            showRemove={segment.phases.length > 1}
            onChange={(p) => updatePhase(idx, p)}
            onRemove={() => removePhase(idx)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addPhase}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
        >
          <Plus size={14} /> Add phase
        </button>
        <div className="text-right">
          <span className="text-xs text-muted-foreground mr-1">≈</span>
          <span className="text-lg font-bold tabular-nums">
            {distance > 0 ? distance.toFixed(2) : "0.00"}
          </span>
          <span className="text-xs text-muted-foreground ml-1">km</span>
        </div>
      </div>
    </motion.div>
  );
}
