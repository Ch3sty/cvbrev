// Renderar PDF-sidor till PNG med pdfjs-dist + @napi-rs/canvas.
// Användning: node scripts/pdf-to-png.mjs <pdf-path> <out-dir> [scale]
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const [pdfPath, outDir, scaleArg] = process.argv.slice(2);
const scale = parseFloat(scaleArg || '2');
mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data, disableWorker: true }).promise;
console.log('Sidor:', doc.numPages);

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const out = path.join(outDir, `page-${String(i).padStart(2, '0')}.png`);
  writeFileSync(out, canvas.toBuffer('image/png'));
  console.log('Skrev', out, `${Math.round(viewport.width)}x${Math.round(viewport.height)}`);
}
