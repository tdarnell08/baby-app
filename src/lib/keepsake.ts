import { milestones } from '@/data/milestones';
import { photoForPdf } from '@/lib/media';
import type { Memory } from '@/lib/memoryStore';
import { esc } from '@/lib/pdf';

export const MAX_PDF_PHOTOS = 48;

export type KeepsakeScope = { kind: 'month'; year: number; month: number } | { kind: 'year'; year: number };

export function monthName(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function inScope(date: string, scope: KeepsakeScope) {
  const [y, m] = date.split('-').map(Number);
  return scope.kind === 'year' ? y === scope.year : y === scope.year && m === scope.month;
}

export function milestonesInScope(achieved: Record<string, string>, scope: KeepsakeScope) {
  return Object.entries(achieved)
    .filter(([, date]) => inScope(date, scope))
    .map(([id, date]) => ({ date, text: milestones.find((m) => m.id === id)?.text ?? null }))
    .filter((m): m is { date: string; text: string } => m.text !== null)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function prettyDate(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export async function buildKeepsakeHtml(args: {
  scope: KeepsakeScope;
  memories: Memory[];
  achieved: Record<string, string>;
  babyName: string;
}): Promise<{ html: string; photoCount: number; skippedPhotos: number }> {
  const { scope, achieved, babyName } = args;
  const chosen = args.memories.filter((m) => inScope(m.date, scope)).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt));
  const wins = milestonesInScope(achieved, scope);

  const images = new Map<string, string>();
  let budget = MAX_PDF_PHOTOS;
  let skipped = 0;
  for (const memory of chosen) {
    for (const ref of memory.photos) {
      if (budget <= 0) {
        skipped += 1;
        continue;
      }
      const data = await photoForPdf(ref);
      if (data) {
        images.set(ref, data);
        budget -= 1;
      }
    }
  }

  const who = babyName.trim();
  const title =
    scope.kind === 'month'
      ? `${who ? `${who}’s ` : ''}${monthName(scope.year, scope.month)}`
      : `${who ? `${who}’s ` : ''}${scope.year}`;

  const groups = new Map<string, Memory[]>();
  for (const memory of chosen) {
    const key = memory.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), memory]);
  }
  const winGroups = new Map<string, { date: string; text: string }[]>();
  for (const w of wins) winGroups.set(w.date.slice(0, 7), [...(winGroups.get(w.date.slice(0, 7)) ?? []), w]);
  const monthKeys = Array.from(new Set([...groups.keys(), ...winGroups.keys()])).sort();

  const sections = monthKeys
    .map((key) => {
      const [y, m] = key.split('-').map(Number);
      const cards = (groups.get(key) ?? [])
        .map((memory) => {
          const imgs = memory.photos
            .map((p) => images.get(p))
            .filter((x): x is string => !!x)
            .map((src) => `<img src="${src}" class="p${Math.min(3, memory.photos.length)}">`)
            .join('');
          return `<div class="card">
  <div class="meta">${esc(prettyDate(memory.date))}${memory.ageLabel ? ` · ${esc(memory.ageLabel)}` : ''}</div>
  <h3>${esc(memory.title)}</h3>
  ${memory.note ? `<p>${esc(memory.note)}</p>` : ''}
  ${imgs ? `<div class="photos">${imgs}</div>` : ''}
  ${memory.voice ? '<div class="voice">🎙 A voice clip for this memory is saved in Lulla</div>' : ''}
</div>`;
        })
        .join('');
      const mileList = (winGroups.get(key) ?? [])
        .map((w) => `<li>${esc(w.text)} <span class="meta">· ${esc(prettyDate(w.date))}</span></li>`)
        .join('');
      return `<section><h2>${esc(monthName(y, m))}</h2>
${mileList ? `<div class="card miles"><div class="meta">Milestones reached</div><ul>${mileList}</ul></div>` : ''}
${cards}</section>`;
    })
    .join('');

  const photoCount = images.size;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
 *{box-sizing:border-box}
 body{margin:0;padding:32px;font-family:Georgia,'Times New Roman',serif;color:#2b3a40;background:#fffdf7}
 .cover{text-align:center;padding:150px 20px 120px;page-break-after:always}
 .cover .kicker{letter-spacing:4px;text-transform:uppercase;font-size:12px;color:#6f9083}
 .cover h1{font-size:42px;margin:18px 0 10px;color:#1c2e36}
 .cover .sub{font-size:16px;color:#5c7270}
 .cover .count{margin-top:40px;font-size:14px;color:#8a7a3a}
 section{page-break-before:always} section:first-of-type{page-break-before:avoid}
 h2{font-size:26px;border-bottom:2px solid #e6c96a;padding-bottom:6px;margin:0 0 16px;color:#1c2e36}
 .card{background:#fff;border:1px solid #ece6d2;border-radius:12px;padding:14px 16px;margin:0 0 14px;page-break-inside:avoid}
 .miles{background:#f4f8f5;border-color:#d6e4dc} .miles ul{margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.5}
 .meta{font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.5px;color:#7a8b88;text-transform:uppercase}
 h3{font-size:19px;margin:4px 0 6px;color:#1c2e36} p{font-size:14px;line-height:1.55;margin:0 0 8px}
 .photos{display:flex;gap:8px;margin-top:8px} .photos img{border-radius:8px;object-fit:cover;max-height:300px}
 .p1{width:100%} .p2{width:calc(50% - 4px)} .p3{width:calc(33.3% - 6px);max-height:170px}
 .voice{margin-top:8px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;color:#5c7270}
 .foot{margin-top:28px;text-align:center;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:#9aa9a6}
 .empty{padding:60px 0;text-align:center;color:#7a8b88}
</style></head><body>
<div class="cover"><div class="kicker">A Lulla keepsake</div><h1>${esc(title)}</h1>
<div class="sub">${scope.kind === 'month' ? 'Our month in moments' : 'Our year in moments'}</div>
<div class="count">${chosen.length} memor${chosen.length === 1 ? 'y' : 'ies'} · ${wins.length} milestone${wins.length === 1 ? '' : 's'} · ${photoCount} photo${photoCount === 1 ? '' : 's'}</div></div>
${sections || '<div class="empty">No memories saved for this period yet.</div>'}
<div class="foot">Made on-device with Lulla. Nothing was uploaded to create this book.</div>
</body></html>`;
  return { html, photoCount, skippedPhotos: skipped };
}
