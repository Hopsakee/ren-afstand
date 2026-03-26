import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard } from "lucide-react";
import { Plus, RotateCcw } from "lucide-react";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import { Segment, createSegment, calcTotalDistance, calcTotalDuration, formatDurationFromSec } from "@/lib/workout";
import SegmentCard from "@/components/SegmentCard";

const Index = () => {
  const [segments, setSegments] = useState<Segment[]>([createSegment()]);
  const [focusRequest, setFocusRequest] = useState<{ segmentId: string; target: "name" | "phaseDuration"; phaseId?: string } | null>(null);

  const totalDistance = calcTotalDistance(segments);
  const totalDuration = calcTotalDuration(segments);

  const updateSegment = (idx: number, seg: Segment) => {
    const next = [...segments];
    next[idx] = seg;
    setSegments(next);
  };

  const removeSegment = (idx: number) => {
    setSegments(segments.filter((_, i) => i !== idx));
  };

  const addSegment = useCallback(() => {
    const seg = createSegment();
    setSegments((prev) => [...prev, seg]);
    setFocusRequest({ segmentId: seg.id, target: "name" });
  }, []);

  const resetAll = () => {
    setSegments([createSegment()]);
  };

  const handleFocusConsumed = useCallback(() => {
    setFocusRequest(null);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Run Calculator</h1>
            <p className="text-xs text-muted-foreground">Estimate workout distance & time</p>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <motion.div
                key={formatDurationFromSec(totalDuration)}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-extrabold tabular-nums text-foreground"
              >
                {formatDurationFromSec(totalDuration)}
              </motion.div>
              <span className="text-xs text-muted-foreground">time</span>
            </div>
            <div>
              <motion.div
                key={totalDistance.toFixed(2)}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-3xl font-extrabold tabular-nums text-primary"
              >
                {totalDistance.toFixed(2)}
              </motion.div>
              <span className="text-xs text-muted-foreground">km total</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-3 pb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Keyboard size={13} className="shrink-0" />
        <span>
          <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">Enter</kbd> new segment
          <span className="mx-1.5">·</span>
          <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">Alt+Enter</kbd> new phase
          <span className="mx-1.5">·</span>
         <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">Ctrl+D</kbd> delete segment
          <span className="mx-1.5">·</span>
          <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">Alt+M</kbd> toggle time/distance
         </span>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {segments.map((seg, idx) => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              onChange={(s) => updateSegment(idx, s)}
              onRemove={() => removeSegment(idx)}
              onAddSegment={addSegment}
              focusRequest={focusRequest?.segmentId === seg.id ? focusRequest : null}
              onFocusConsumed={handleFocusConsumed}
            />
          ))}
        </AnimatePresence>

        {segments.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No segments yet. Add one below.
          </p>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 z-10 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex gap-3">
          <button
            onClick={addSegment}
            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <Plus size={18} /> Add Segment
          </button>
          <button
            onClick={resetAll}
            className="h-14 w-14 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors active:scale-[0.98]"
            aria-label="Reset all"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
