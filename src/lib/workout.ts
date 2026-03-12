export interface Phase {
  id: string;
  durationMin: string;
  durationSec: string;
  paceMinMin: string;
  paceMinSec: string;
  paceMaxMin: string;
  paceMaxSec: string;
}

export interface Segment {
  id: string;
  name: string;
  repetitions: string;
  phases: Phase[];
}

export function createPhase(): Phase {
  return {
    id: crypto.randomUUID(),
    durationMin: "",
    durationSec: "",
    paceMinMin: "",
    paceMinSec: "",
    paceMaxMin: "",
    paceMaxSec: "",
  };
}

export function createSegment(): Segment {
  return {
    id: crypto.randomUUID(),
    name: "",
    repetitions: "1",
    phases: [createPhase()],
  };
}

/** Convert pace (min:sec per km) to km/s speed */
function paceToKmPerSec(min: number, sec: number): number {
  const totalSec = min * 60 + sec;
  if (totalSec <= 0) return 0;
  return 1 / totalSec; // km per second
}

export function calcPhaseDistance(phase: Phase): number {
  const durSec =
    (parseInt(phase.durationMin) || 0) * 60 +
    (parseInt(phase.durationSec) || 0);
  if (durSec <= 0) return 0;

  const minPaceMin = parseInt(phase.paceMinMin) || 0;
  const minPaceSec = parseInt(phase.paceMinSec) || 0;
  const maxPaceMin = parseInt(phase.paceMaxMin) || 0;
  const maxPaceSec = parseInt(phase.paceMaxSec) || 0;

  const speed1 = paceToKmPerSec(minPaceMin, minPaceSec);
  const speed2 = paceToKmPerSec(maxPaceMin, maxPaceSec);

  if (speed1 === 0 && speed2 === 0) return 0;

  // If only one pace provided, use it; otherwise average
  const avgSpeed =
    speed1 > 0 && speed2 > 0
      ? (speed1 + speed2) / 2
      : speed1 > 0
      ? speed1
      : speed2;

  return durSec * avgSpeed;
}

export function calcSegmentDistance(segment: Segment): number {
  const reps = parseInt(segment.repetitions) || 1;
  const phaseTotal = segment.phases.reduce(
    (sum, p) => sum + calcPhaseDistance(p),
    0
  );
  return phaseTotal * reps;
}

export function calcTotalDistance(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + calcSegmentDistance(s), 0);
}

export function formatPace(min: string, sec: string): string {
  if (!min && !sec) return "—";
  return `${min || "0"}:${(sec || "0").padStart(2, "0")}`;
}

export function formatDuration(min: string, sec: string): string {
  const m = parseInt(min) || 0;
  const s = parseInt(sec) || 0;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  if (s > 0) return `${s}s`;
  return "—";
}
