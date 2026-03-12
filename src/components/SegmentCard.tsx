import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Segment, createPhase, calcSegmentDistance } from "@/lib/workout";
import PhaseInput from "./PhaseInput";

interface Props {
  segment: Segment;
  onChange: (segment: Segment) => void;
  onRemove: () => void;
  onAddSegment: () => void;
  focusRequest: { target: "name" | "phaseDuration"; phaseId?: string } | null;
  onFocusConsumed: () => void;
}

export default function SegmentCard({ segment, onChange, onRemove, onAddSegment, focusRequest, onFocusConsumed }: Props) {
  const distance = calcSegmentDistance(segment);
  const nameRef = useRef<HTMLInputElement>(null);
  const [phaseFocusId, setPhaseFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusRequest) return;
    if (focusRequest.target === "name") {
      // Small delay to let animation render
      requestAnimationFrame(() => {
        nameRef.current?.focus();
        onFocusConsumed();
      });
    } else if (focusRequest.target === "phaseDuration" && focusRequest.phaseId) {
      setPhaseFocusId(focusRequest.phaseId);
      onFocusConsumed();
    }
  }, [focusRequest, onFocusConsumed]);

  const updatePhase = (idx: number, phase: typeof segment.phases[0]) => {
    const phases = [...segment.phases];
    phases[idx] = phase;
    onChange({ ...segment, phases });
  };

  const removePhase = (idx: number) => {
    onChange({ ...segment, phases: segment.phases.filter((_, i) => i !== idx) });
  };

  const addPhase = useCallback(() => {
    const phase = createPhase();
    onChange({ ...segment, phases: [...segment.phases, phase] });
    setPhaseFocusId(phase.id);
  }, [segment, onChange]);

  const handlePhaseFocusConsumed = useCallback(() => {
    setPhaseFocusId(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.altKey && !e.ctrlKey) {
      e.preventDefault();
      onAddSegment();
    }
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault();
      addPhase();
    }
    if (e.key === "d" && e.ctrlKey) {
      e.preventDefault();
      onRemove();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between gap-2">
        <input
          ref={nameRef}
          type="text"
          placeholder="Segment name (e.g. Warm-up)"
          value={segment.name}
          onChange={(e) => onChange({ ...segment, name: e.target.value })}
          tabIndex={0}
          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Reps</label>
          <input
            type="number"
            min="1"
            value={segment.repetitions}
            onChange={(e) => onChange({ ...segment, repetitions: e.target.value })}
            tabIndex={0}
            className="w-14 h-10 text-center rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={onRemove}
          tabIndex={-1}
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
            shouldFocusDuration={phaseFocusId === phase.id}
            onFocusConsumed={handlePhaseFocusConsumed}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addPhase}
          tabIndex={-1}
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
