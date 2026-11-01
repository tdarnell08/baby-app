export type TempMethod = 'rectal' | 'oral' | 'ear' | 'forehead' | 'underarm';
export type TempUnit = 'F' | 'C';
export type EntryKind = 'temp' | 'fluids' | 'diapers' | 'sleep' | 'behavior' | 'note';

export const tempMethods: { id: TempMethod; label: string }[] = [
  { id: 'rectal', label: 'Rectal' },
  { id: 'oral', label: 'Mouth' },
  { id: 'ear', label: 'Ear' },
  { id: 'forehead', label: 'Forehead' },
  { id: 'underarm', label: 'Underarm' },
];

export type SymptomEntry = {
  id: string;
  at: number;
  kind: EntryKind;
  tempC: number | null;
  method: TempMethod | null;
  count: number | null;
  text: string;
};

export type Episode = {
  id: string;
  title: string;
  startedAt: number;
  endedAt: number | null;
  entries: SymptomEntry[];
};

export type IllnessData = { episodes: Episode[]; unit: TempUnit };

export const HOUR = 3600 * 1000;
export const DAY = 24 * HOUR;
export const MAX_EPISODES = 20;
export const MAX_ENTRIES = 300;
export const MIN_TEMP_C = 32;
export const MAX_TEMP_C = 43;

export function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '';
}

export function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

export function toC(value: number, unit: TempUnit) {
  const c = unit === 'F' ? ((value - 32) * 5) / 9 : value;
  return Math.round(c * 10) / 10;
}

export function fmtTemp(c: number, unit: TempUnit) {
  if (unit === 'C') return `${c.toFixed(1)}°C`;
  return `${(Math.round(((c * 9) / 5 + 32) * 10) / 10).toFixed(1)}°F`;
}

export function fmtBoth(c: number) {
  return `${fmtTemp(c, 'F')} (${fmtTemp(c, 'C')})`;
}

export function validTemp(c: number) {
  return Number.isFinite(c) && c >= MIN_TEMP_C && c <= MAX_TEMP_C;
}

export function methodLabel(method: TempMethod | null) {
  return tempMethods.find((m) => m.id === method)?.label ?? '';
}

export function sanitizeEntry(raw: unknown, now: number): SymptomEntry | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const kinds: EntryKind[] = ['temp', 'fluids', 'diapers', 'sleep', 'behavior', 'note'];
  const kind = kinds.find((k) => k === r.kind);
  if (!kind || typeof r.id !== 'string' || r.id.length > 60) return null;
  if (typeof r.at !== 'number' || !Number.isFinite(r.at) || r.at > now + 5 * 60 * 1000) return null;
  const tempC = typeof r.tempC === 'number' && validTemp(r.tempC) ? Math.round(r.tempC * 10) / 10 : null;
  if (kind === 'temp' && tempC === null) return null;
  const method = tempMethods.find((m) => m.id === r.method)?.id ?? null;
  const count = typeof r.count === 'number' && Number.isInteger(r.count) && r.count >= 0 && r.count <= 30 ? r.count : null;
  const text = clean(r.text, 200);
  if (kind === 'diapers' && count === null) return null;
  if ((kind === 'note' || kind === 'behavior' || kind === 'fluids' || kind === 'sleep') && !text) return null;
  return { id: r.id, at: r.at, kind, tempC: kind === 'temp' ? tempC : null, method: kind === 'temp' ? method : null, count: kind === 'diapers' ? count : null, text };
}

export function sanitizeIllness(raw: unknown, now: number): IllnessData {
  const out: IllnessData = { episodes: [], unit: 'F' };
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  out.unit = r.unit === 'C' ? 'C' : 'F';
  if (!Array.isArray(r.episodes)) return out;
  const seen = new Set<string>();
  for (const item of r.episodes.slice(0, MAX_EPISODES * 2)) {
    if (typeof item !== 'object' || item === null) continue;
    const e = item as Record<string, unknown>;
    if (typeof e.id !== 'string' || e.id.length > 60 || seen.has(e.id)) continue;
    if (typeof e.startedAt !== 'number' || !Number.isFinite(e.startedAt) || e.startedAt > now + 5 * 60 * 1000) continue;
    const title = clean(e.title, 40) || 'Sick day';
    let endedAt: number | null = null;
    if (typeof e.endedAt === 'number' && Number.isFinite(e.endedAt) && e.endedAt >= e.startedAt) endedAt = Math.min(e.endedAt, now);
    const ids = new Set<string>();
    const entries: SymptomEntry[] = [];
    for (const entry of (Array.isArray(e.entries) ? e.entries : []).slice(0, MAX_ENTRIES * 2)) {
      const s = sanitizeEntry(entry, now);
      if (!s || ids.has(s.id)) continue;
      ids.add(s.id);
      entries.push(s);
    }
    entries.sort((a, b) => b.at - a.at);
    seen.add(e.id);
    out.episodes.push({ id: e.id, title, startedAt: e.startedAt, endedAt, entries: entries.slice(0, MAX_ENTRIES) });
  }
  out.episodes.sort((a, b) => b.startedAt - a.startedAt);
  out.episodes = out.episodes.filter((e) => (e.endedAt ?? now) > now - 365 * DAY).slice(0, MAX_EPISODES);
  return out;
}

export type FeverAdvice = { level: 'now' | 'call'; message: string } | null;

export function ageWindow(months: number) {
  if (months < 3) return 'under 3 months';
  if (months < 6) return '3 to 6 months';
  return '6 months and older';
}

export function feverThresholdC(months: number) {
  if (months < 3) return 38.0;
  if (months < 6) return 38.3;
  return 39.4;
}

export function latestTemp(episode: Episode) {
  return episode.entries.find((e) => e.kind === 'temp') ?? null;
}

export function highestTemp(episode: Episode) {
  let best: SymptomEntry | null = null;
  for (const e of episode.entries) if (e.kind === 'temp' && e.tempC !== null && (best === null || e.tempC > (best.tempC as number))) best = e;
  return best;
}

export function feverHours(episode: Episode, now: number) {
  const temps = episode.entries.filter((e) => e.kind === 'temp' && e.tempC !== null).sort((a, b) => a.at - b.at);
  if (temps.length === 0) return 0;
  const last = temps[temps.length - 1];
  if ((last.tempC as number) < 38.0) return 0;
  let startIdx = temps.length - 1;
  while (startIdx > 0 && (temps[startIdx - 1].tempC as number) >= 38.0) startIdx--;
  return (Math.max(now, last.at) - temps[startIdx].at) / HOUR;
}

export function feverAdvice(episode: Episode, ageMonths: number, now: number): FeverAdvice {
  const last = latestTemp(episode);
  if (!last || last.tempC === null) return null;
  const c = last.tempC;
  if (ageMonths < 3 && c >= 38.0) {
    return {
      level: 'now',
      message: `${fmtBoth(c)} in a baby under 3 months. Call your pediatrician right away, day or night, even if your baby seems fine. Do not give fever medicine until you have spoken to them.`,
    };
  }
  if (ageMonths < 3 && last.method === 'underarm' && c >= 37.5) {
    return {
      level: 'call',
      message: `${fmtBoth(c)} underarm in a baby under 3 months. Underarm readings can be lower than the real temperature. If your baby feels hot, call your pediatrician now.`,
    };
  }
  const high = highestTemp(episode);
  const threshold = feverThresholdC(ageMonths);
  if (c >= 40) return { level: 'call', message: `${fmtBoth(c)} is above 104°F (40°C). Call your pediatrician now.` };
  if (high && (high.tempC as number) >= 40 && episode.entries.filter((e) => e.kind === 'temp' && (e.tempC as number) >= 40).length >= 2) {
    return { level: 'call', message: 'A temperature above 104°F (40°C) has been recorded more than once. Call your pediatrician now.' };
  }
  if (ageMonths >= 3 && c >= threshold) {
    return {
      level: 'call',
      message: `${fmtBoth(c)} is at or above ${fmtBoth(threshold)}, the level where the American Academy of Pediatrics suggests calling for a baby ${ageWindow(ageMonths)}.`,
    };
  }
  const hours = feverHours(episode, now);
  if (ageMonths < 24 && hours >= 24) {
    return { level: 'call', message: `Fever has been recorded for about ${Math.floor(hours)} hours. For a child under 2, call your pediatrician if a fever lasts more than 24 hours.` };
  }
  if (ageMonths >= 24 && hours >= 72) {
    return { level: 'call', message: `Fever has been recorded for about ${Math.floor(hours / 24)} days. Call your pediatrician if a fever lasts more than 3 days.` };
  }
  return null;
}

export function diaperCount(episode: Episode, from: number, to: number) {
  return episode.entries.filter((e) => e.kind === 'diapers' && e.at >= from && e.at <= to).reduce((n, e) => n + (e.count ?? 0), 0);
}

export function wetDiapersLast24(episode: Episode, now: number) {
  return diaperCount(episode, now - DAY, now);
}

export function lastWetDiaper(episode: Episode) {
  return episode.entries.find((e) => e.kind === 'diapers' && (e.count ?? 0) > 0) ?? null;
}

export function entryLabel(e: SymptomEntry, unit: TempUnit) {
  switch (e.kind) {
    case 'temp':
      return `Temperature ${fmtTemp(e.tempC as number, unit)}${e.method ? `, ${methodLabel(e.method).toLowerCase()}` : ''}`;
    case 'fluids':
      return `Fluids: ${e.text}`;
    case 'diapers':
      return e.count === 0 ? `Dry diaper${e.text ? `: ${e.text}` : ''}` : `${e.count} wet diaper${e.count === 1 ? '' : 's'}${e.text ? `: ${e.text}` : ''}`;
    case 'sleep':
      return `Sleep: ${e.text}`;
    case 'behavior':
      return `Behavior and symptoms: ${e.text}`;
    default:
      return `Note: ${e.text}`;
  }
}

export function whenLabel(ts: number) {
  return new Date(ts).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export type MedGiven = { medName: string; doseText: string; at: number; by: string; vomited: boolean };

export type SleepSpan = { start: number; end: number | null };

export function sleepHoursInWindow(sessions: SleepSpan[], from: number, to: number) {
  let ms = 0;
  for (const s of sessions) {
    const end = s.end ?? to;
    const a = Math.max(s.start, from);
    const b = Math.min(end, to);
    if (b > a) ms += b - a;
  }
  return ms / HOUR;
}

export function episodeEnd(episode: Episode, now: number) {
  return episode.endedAt ?? now;
}

export function episodeSummary(
  episode: Episode,
  opts: { babyName: string; ageLabel: string; unit: TempUnit; meds: MedGiven[]; sleep: SleepSpan[]; now: number },
): string {
  const { babyName, ageLabel, unit, meds, sleep, now } = opts;
  const end = episodeEnd(episode, now);
  const lines: string[] = [];
  lines.push(`Sick day record${babyName ? ` for ${babyName}` : ''} (from Lulla)`);
  lines.push(`Created ${new Date(now).toLocaleString()}`);
  if (ageLabel) lines.push(`Age: ${ageLabel}`);
  lines.push(`Illness: ${episode.title}`);
  lines.push(`Started: ${whenLabel(episode.startedAt)}${episode.endedAt ? ` · ended ${whenLabel(episode.endedAt)}` : ' · ongoing'}`);
  lines.push('');
  const temps = episode.entries.filter((e) => e.kind === 'temp').sort((a, b) => a.at - b.at);
  lines.push('Temperatures');
  if (temps.length === 0) lines.push('  (none recorded)');
  for (const t of temps) lines.push(`  ${whenLabel(t.at)}: ${fmtBoth(t.tempC as number)}${t.method ? `, ${methodLabel(t.method).toLowerCase()}` : ''}`);
  const high = highestTemp(episode);
  if (high) lines.push(`  Highest: ${fmtBoth(high.tempC as number)} on ${whenLabel(high.at)}`);
  lines.push('');
  lines.push('Medicines given (as logged by the parent, doses as written on the label)');
  const givenSorted = [...meds].sort((a, b) => a.at - b.at);
  if (givenSorted.length === 0) lines.push('  (none logged)');
  for (const m of givenSorted) lines.push(`  ${whenLabel(m.at)}: ${m.medName}, ${m.doseText}, given by ${m.by || 'not noted'}${m.vomited ? ' (vomited after dose)' : ''}`);
  lines.push('');
  const fluids = episode.entries.filter((e) => e.kind === 'fluids').sort((a, b) => a.at - b.at);
  lines.push('Fluids and feeding');
  if (fluids.length === 0) lines.push('  (none recorded)');
  for (const f of fluids) lines.push(`  ${whenLabel(f.at)}: ${f.text}`);
  lines.push('');
  const diapers = episode.entries.filter((e) => e.kind === 'diapers').sort((a, b) => a.at - b.at);
  lines.push('Diapers');
  if (diapers.length === 0) lines.push('  (none recorded)');
  for (const d of diapers) lines.push(`  ${whenLabel(d.at)}: ${entryLabel(d, unit).replace(/^/, '')}`);
  lines.push(`  Wet diapers recorded in the last 24 hours: ${wetDiapersLast24(episode, now)}`);
  lines.push('');
  lines.push('Sleep');
  const sleepEntries = episode.entries.filter((e) => e.kind === 'sleep').sort((a, b) => a.at - b.at);
  for (const s of sleepEntries) lines.push(`  ${whenLabel(s.at)}: ${s.text}`);
  if (sleep.length > 0) lines.push(`  Total sleep from the Lulla sleep log in the last 24 hours: ${sleepHoursInWindow(sleep, Math.max(episode.startedAt, end - DAY), end).toFixed(1)} hours`);
  if (sleepEntries.length === 0 && sleep.length === 0) lines.push('  (none recorded)');
  lines.push('');
  const behavior = episode.entries.filter((e) => e.kind === 'behavior' || e.kind === 'note').sort((a, b) => a.at - b.at);
  lines.push('Behavior, symptoms, and notes');
  if (behavior.length === 0) lines.push('  (none recorded)');
  for (const b of behavior) lines.push(`  ${whenLabel(b.at)}: ${b.text}`);
  lines.push('');
  lines.push('This is a parent-kept record. Lulla does not diagnose, calculate doses, or give medical advice. Temperatures are as entered by the parent.');
  return lines.join('\n');
}
