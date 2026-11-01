import { courseState, scheduleLabel, type Course } from '@/lib/courseLogic';
import { esc } from '@/lib/pdf';

function when(ts: number) {
  return new Date(ts).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function courseHtml(course: Course, babyName: string, now: number): string {
  const state = courseState(course, now);
  const log = [...course.log].sort((a, b) => a.at - b.at);
  const notes = [...course.notes].sort((a, b) => a.at - b.at);
  const rows = log
    .map((l) => {
      const flags = [l.slot === null ? 'unscheduled' : '', l.early ? 'earlier than scheduled' : '', l.vomited ? 'vomited after dose' : '']
        .filter(Boolean)
        .join(', ');
      return `<tr><td>${esc(when(l.at))}</td><td>${esc(l.by || 'not noted')}</td><td>${esc(flags)}</td></tr>`;
    })
    .join('');
  const missed = state.missed.map((i) => `<li>Scheduled ${esc(when(state.slots[i]))}</li>`).join('');
  const noteItems = notes.map((n) => `<li><b>${esc(when(n.at))}</b>: ${esc(n.text)}</li>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
 body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1c2e36;padding:28px;font-size:13px;line-height:1.45}
 h1{font-size:22px;margin:0 0 4px} h2{font-size:15px;margin:20px 0 6px;border-bottom:1px solid #ccd;padding-bottom:3px}
 table{width:100%;border-collapse:collapse} td,th{text-align:left;padding:5px 6px;border-bottom:1px solid #e3e8ea;font-size:12px}
 .box{background:#f4f6f3;border:1px solid #d9e0d8;border-radius:8px;padding:10px 12px} .small{color:#5c7270;font-size:11px}
</style></head><body>
<h1>Medicine course record</h1>
<div class="small">${babyName ? `For ${esc(babyName)} · ` : ''}Created ${esc(new Date(now).toLocaleString())} with Lulla</div>
<h2>Prescription details (entered by the parent from the label)</h2>
<div class="box">
 <div><b>Medicine:</b> ${esc(course.medName)}</div>
 <div><b>Dose as written on the label:</b> ${esc(course.doseText)}</div>
 <div><b>Schedule:</b> ${esc(scheduleLabel(course.schedule))}</div>
 <div><b>Started:</b> ${esc(when(course.startAt))}</div>
 <div><b>Course length:</b> ${course.days} day${course.days === 1 ? '' : 's'} (${state.total} scheduled doses)</div>
 <div><b>Doses logged as given:</b> ${state.given} of ${state.total}${state.skipped ? ` · ${state.skipped} marked skipped` : ''}${state.stopped ? ` · stopped ${esc(when(course.stoppedAt as number))}` : ''}</div>
</div>
<h2>Dose log</h2>
${log.length ? `<table><tr><th>Time given</th><th>Given by</th><th>Notes</th></tr>${rows}</table>` : '<div class="small">No doses logged.</div>'}
<h2>Missed doses</h2>
${state.missed.length ? `<ul>${missed}</ul>` : '<div class="small">None.</div>'}
<h2>Side effects and notes</h2>
${notes.length ? `<ul>${noteItems}</ul>` : '<div class="small">None recorded.</div>'}
<p class="small" style="margin-top:22px">This is a parent-kept record. Lulla does not calculate, suggest, or verify doses. Follow the pharmacy label and your pharmacist or pediatrician.</p>
</body></html>`;
}
