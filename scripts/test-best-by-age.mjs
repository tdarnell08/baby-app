import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ageItems } from '../src/data/bestByAge.ts';
import {
  bands,
  bandForMonths,
  itemsFor,
  categoryCounts,
  parseAgeInput,
  validateItems,
  categories,
} from '../src/lib/bestByAgeLogic.ts';

assert.deepEqual(validateItems(ageItems), [], 'seed data passes validation');

assert.equal(bandForMonths(0)?.id, '0-3m');
assert.equal(bandForMonths(2)?.id, '0-3m');
assert.equal(bandForMonths(3)?.id, '3-6m');
assert.equal(bandForMonths(11)?.id, '6-12m');
assert.equal(bandForMonths(12)?.id, '1y');
assert.equal(bandForMonths(35)?.id, '2y');
assert.equal(bandForMonths(60)?.id, '4-5y');
assert.equal(bandForMonths(72), null);
assert.equal(bandForMonths(-1), null);

assert.deepEqual(parseAgeInput('18', 'months'), { ok: true, months: 18 });
assert.deepEqual(parseAgeInput('1.5', 'years'), { ok: true, months: 18 });
assert.deepEqual(parseAgeInput('2', 'years'), { ok: true, months: 24 });
assert.deepEqual(parseAgeInput('1,5', 'years'), { ok: true, months: 18 });
assert.deepEqual(parseAgeInput('', 'years'), { ok: false, reason: 'empty' });
assert.deepEqual(parseAgeInput('abc', 'years'), { ok: false, reason: 'invalid' });
assert.deepEqual(parseAgeInput('-2', 'years'), { ok: false, reason: 'invalid' });
assert.deepEqual(parseAgeInput('6', 'years'), { ok: false, reason: 'too-old' });
assert.deepEqual(parseAgeInput('72', 'months'), { ok: false, reason: 'too-old' });

for (const band of bands) {
  const all = itemsFor(ageItems, band, 'all');
  assert.ok(all.length > 0, `band ${band.id} has items`);
  const counts = categoryCounts(ageItems, band);
  assert.equal(counts.all, all.length);
  let sum = 0;
  for (const c of categories) {
    sum += counts[c.id];
    assert.equal(itemsFor(ageItems, band, c.id).length, counts[c.id]);
  }
  assert.equal(sum, counts.all);
  for (const item of all) {
    assert.ok(band.toMonths > item.officialMinMonths, `${item.id} shown in ${band.id} but its label starts later`);
  }
}

const newborn = itemsFor(ageItems, bandForMonths(1), 'all').map((i) => i.id);
assert.ok(!newborn.includes('lego-duplo-brick-box'), 'no DUPLO for a newborn');
assert.ok(!newborn.includes('magna-tiles-classic'), 'no magnetic tiles for a newborn');
const toddlerSmallParts = itemsFor(ageItems, bandForMonths(14), 'all').map((i) => i.id);
assert.ok(!toddlerSmallParts.includes('lego-classic-large-brick-box'), 'no 4+ LEGO for a 14-month-old');

const bad = validateItems([
  { ...ageItems[0], id: 'x', listFromMonths: 0, officialMinMonths: 6 },
  { ...ageItems[0], id: 'y', why: 'A non-toxic swaddle', green: { level: 'brand', note: '' } },
  { ...ageItems[0], id: 'z', why: 'Rated 5 stars', safety: ['ok'] },
  { ...ageItems[0], id: 'v', green: { level: 'verified', note: '' }, sources: [{ label: 'brand', url: 'https://example.com' }] },
]);
assert.equal(bad.length, 4);

const configText = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8');
const envText = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
for (const item of ageItems) {
  const envName = 'EXPO_PUBLIC_AFFILIATE_' + item.id.toUpperCase().replace(/-/g, '_');
  assert.ok(configText.includes(`'${item.id}': process.env.${envName} ?? ''`), `${item.id} missing from src/config.ts`);
  assert.ok(envText.includes(`${envName}=`), `${envName} missing from .env.example`);
}

console.log(`best-by-age: ${ageItems.length} items OK`);
