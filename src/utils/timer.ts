export interface TimerRecord {
  start: number;
  end?: number;
}

const timers: Record<string, TimerRecord> = {};

export function startTimer(key = 'default') {
  timers[key] = { start: Date.now() };
}

export function stopTimer(key = 'default') {
  const rec = timers[key];
  if (!rec) return undefined;
  rec.end = Date.now();
  return rec.end - rec.start;
}

export function getTimer(key = 'default') {
  return timers[key];
}

export function formatDuration(ms?: number) {
  if (ms === undefined) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function nowIso() {
  return new Date().toISOString();
}
