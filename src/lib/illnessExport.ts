import { type Course } from '@/lib/courseLogic';
import {
  entryLabel,
  episodeEnd,
  episodeSummary,
  fmtBoth,
  highestTemp,
  methodLabel,
  sleepHoursInWindow,
  wetDiapersLast24,
  whenLabel,
  DAY,
  type Episode,
  type MedGiven,
  type SleepSpan,
  type TempUnit,
} from '@/lib/illnessLogic';
import { esc } from '@/lib/pdf';

export function medsInEpisode(courses: Course[], episode: Episode, now: number): MedGiven[] {
  const end = episodeEnd(episode, now);
  const out: MedGiven[] = [];
  for (const c of courses) {
    for (const l of c.log) {
      if (l.at >= episode.startedAt - 60 * 1000 && l.at <= end + 60 * 1000) {
        out.push({ medName: c.medName, doseText: c.doseText, at: l.at, by: l.by, vomited: l.vomited });
      }
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

export type SummaryOpts = { babyName: string; ageLabel: string; unit: TempUnit; courses: Course[]; sleep: SleepSpan[]; now: number };

export function summaryText(episode: Episode, o: SummaryOpts) {
  return episodeSummary(episode, { babyName: o.babyName, ageLabel: o.ageLabel, unit: o.unit, meds: medsInEpisode(o.courses, episode, o.now), sleep: o.sleep, now: o.now });
}

export function summaryHtml(episode: Episode, o: SummaryOpts): string {
  const { babyName, ageLabel, unit, courses, sleep, now } = o;
  const meds = medsInEpisode(courses, episode, now);
  const end = episodeEnd(episode, now);
  const asc = (kind: string) => episode.entries.filter((e) => e.kind === kind).sort((a, b) => a.at - b.at);
  const temps = asc('temp');
  const high = highestTemp(episode);
  const medRows = meds
    .map((m) => `<tr><td>${esc(whenLabel(m.at))}</td><td>${esc(m.medName)}</td><td>${esc(m.doseText)}</td><td>${esc(m.by || 'not noted')}${m.vomited ? ' · vomited after dose' : ''}</td></tr>`)
    .join('');
  const tempRows = temps
    .map((t) => `<tr><td>${esc(whenLabel(t.at))}</td><td>${esc(fmtBoth(t.tempC as number))}</td><td>${esc(methodLabel(t.method))}</td></tr>`)
    .join('');
  const list = (items: ReturnType<typeof asc>) =>
    items.length ? `<ul>${items.map((e) => `<li><b>${esc(whenLabel(e.at))}</b>: ${esc(entryLabel(e, unit).replace(/^[^:]+: /, ''))}</li>`).join('')}</ul>` : '<div class="small">None recorded.</div>';
  const sleepHours = sleep.length ? sleepHoursInWindow(sleep, Math.max(episode.startedAt, end - DAY), end) : null;
  const sleepNotes = asc('sleep');
  const notes = episode.entries.filter((e) => e.kind === 'behavior' || e.kind === 'note').sort((a, b) => a.at - b.at);
  const diapers = asc('diapers');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
 body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1c2e36;padding:28px;font-size:13px;line-height:1.45}
 h1{font-size:22px;margin:0 0 4px} h2{font-size:15px;margin:20px 0 6px;border-bottom:1px solid #ccd;padding-bottom:3px}
 table{width:100%;border-collapse:collapse} td,th{text-align:left;padding:5px 6px;border-bottom:1px solid #e3e8ea;font-size:12px}
 .box{background:#f4f6f3;border:1px solid #d9e0d8;border-radius:8px;padding:10px 12px} .small{color:#5c7270;font-size:11px}
</style></head><body>
<h1>Sick day record${babyName ? ` for ${esc(babyName)}` : ''}</h1>
<div class="small">Created ${esc(new Date(now).toLocaleString())} with Lulla</div>
<h2>Overview</h2>
<div class="box">
 <div><b>Illness:</b> ${esc(episode.title)}</div>
 ${ageLabel ? `<div><b>Age:</b> ${esc(ageLabel)}</div>` : ''}
 <div><b>Started:</b> ${esc(whenLabel(episode.startedAt))}${episode.endedAt ? ` · ended ${esc(whenLabel(episode.endedAt))}` : ' · ongoing'}</div>
 ${high ? `<div><b>Highest temperature:</b> ${esc(fmtBoth(high.tempC as number))} (${esc(whenLabel(high.at))})</div>` : ''}
 <div><b>Wet diapers logged in the last 24 hours:</b> ${wetDiapersLast24(episode, now)}</div>
 ${sleepHours !== null ? `<div><b>Sleep from the Lulla sleep log, last 24 hours:</b> ${sleepHours.toFixed(1)} hours</div>` : ''}
</div>
<h2>Temperatures</h2>
${temps.length ? `<table><tr><th>Time</th><th>Temperature</th><th>Method</th></tr>${tempRows}</table>` : '<div class="small">None recorded.</div>'}
<h2>Medicines given (as logged by the parent; doses as written on the label)</h2>
${meds.length ? `<table><tr><th>Time</th><th>Medicine</th><th>Dose on label</th><th>Given by</th></tr>${medRows}</table>` : '<div class="small">None logged.</div>'}
<h2>Fluids and feeding</h2>${list(asc('fluids'))}
<h2>Diapers</h2>${diapers.length ? `<ul>${diapers.map((e) => `<li><b>${esc(whenLabel(e.at))}</b>: ${esc(entryLabel(e, unit))}</li>`).join('')}</ul>` : '<div class="small">None recorded.</div>'}
<h2>Sleep notes</h2>${list(sleepNotes)}
<h2>Behavior, symptoms, and notes</h2>${list(notes)}
<p class="small" style="margin-top:22px">This is a parent-kept record. Lulla does not diagnose, calculate doses, or give medical advice. Temperatures and medicine details are as entered by the parent.</p>
</body></html>`;
}
