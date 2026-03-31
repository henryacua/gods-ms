export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
}

/** Normalise "HH:MM" → "HH:MM:00" so comparisons work uniformly */
export function normalizeTime(t: string): string {
  return t.length === 5 ? `${t}:00` : t;
}
