export type PhaseMode = "time" | "distance";

export interface Phase {
  id: string;
  mode: PhaseMode;
  durationMin: string;
  durationSec: string;
  distanceKm: string;
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
    mode: "time",
    durationMin: "",
    durationSec: "",
    distanceKm: "",
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
  return 1 / totalSec;
}

function getAvgSpeed(phase: Phase): number {
  const speed1 = paceToKmPerSec(parseInt(phase.paceMinMin) || 0, parseInt(phase.paceMinSec) || 0);
  const speed2 = paceToKmPerSec(parseInt(phase.paceMaxMin) || 0, parseInt(phase.paceMaxSec) || 0);
  if (speed1 === 0 && speed2 === 0) return 0;
  return speed1 > 0 && speed2 > 0 ? (speed1 + speed2) / 2 : speed1 > 0 ? speed1 : speed2;
}

/** Calculate distance in km for a time-mode phase */
export function calcPhaseDistance(phase: Phase): number {
  if (phase.mode === "distance") {
    return parseFloat(phase.distanceKm) || 0;
  }
  const durSec = (parseInt(phase.durationMin) || 0) * 60 + (parseInt(phase.durationSec) || 0);
  if (durSec <= 0) return 0;
  const avgSpeed = getAvgSpeed(phase);
  if (avgSpeed === 0) return 0;
  return durSec * avgSpeed;
}

/** Calculate duration in seconds for a distance-mode phase */
export function calcPhaseDuration(phase: Phase): number {
  if (phase.mode === "time") {
    return (parseInt(phase.durationMin) || 0) * 60 + (parseInt(phase.durationSec) || 0);
  }
  const dist = parseFloat(phase.distanceKm) || 0;
  if (dist <= 0) return 0;
  const avgSpeed = getAvgSpeed(phase);
  if (avgSpeed === 0) return 0;
  return dist / avgSpeed;
}

export function calcSegmentDistance(segment: Segment): number {
  const reps = parseInt(segment.repetitions) || 1;
  const phaseTotal = segment.phases.reduce((sum, p) => sum + calcPhaseDistance(p), 0);
  return phaseTotal * reps;
}

export function calcSegmentDuration(segment: Segment): number {
  const reps = parseInt(segment.repetitions) || 1;
  const phaseTotal = segment.phases.reduce((sum, p) => sum + calcPhaseDuration(p), 0);
  return phaseTotal * reps;
}

export function calcTotalDistance(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + calcSegmentDistance(s), 0);
}

export function calcTotalDuration(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + calcSegmentDuration(s), 0);
}

/** Toggle phase mode, converting filled data */
export function togglePhaseMode(phase: Phase): Phase {
  if (phase.mode === "time") {
    // time → distance: calculate distance from duration+pace, put in distanceKm
    const dist = calcPhaseDistance(phase);
    return {
      ...phase,
      mode: "distance",
      distanceKm: dist > 0 ? dist.toFixed(3) : "",
      durationMin: "",
      durationSec: "",
    };
  } else {
    // distance → time: calculate duration from distance+pace, put in duration fields
    const durSec = calcPhaseDuration(phase);
    const mins = Math.floor(durSec / 60);
    const secs = Math.round(durSec % 60);
    return {
      ...phase,
      mode: "time",
      durationMin: durSec > 0 ? String(mins) : "",
      durationSec: durSec > 0 ? String(secs) : "",
      distanceKm: "",
    };
  }
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

export function formatDurationFromSec(totalSec: number): string {
  if (totalSec <= 0) return "—";
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
