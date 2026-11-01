// Run with: npm run legal  (Node 22.6+ strips types natively)
import { mkdir, writeFile } from 'node:fs/promises';
import { legalDocs, legalToMarkdown } from '../src/data/legal.ts';

const files = { privacy: 'PRIVACY_POLICY.md', terms: 'TERMS_OF_USE.md', medical: 'MEDICAL_DISCLAIMER.md' };
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
for (const [id, name] of Object.entries(files)) {
  await writeFile(new URL(`../docs/${name}`, import.meta.url), legalToMarkdown(legalDocs[id]));
  console.log('wrote docs/' + name);
}
