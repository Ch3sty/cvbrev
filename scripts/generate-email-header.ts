// scripts/generate-email-header.ts
// Genererar public/email/email-header-jobbcoach.png (1200x240, visas 560 px
// brett i mailen). Ordmärket i vitt på varm orange gradient.
// Kör: npx tsx scripts/generate-email-header.ts

import { createCanvas } from '@napi-rs/canvas';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const WIDTH = 1200;
const HEIGHT = 240;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
gradient.addColorStop(0, '#FB923C');
gradient.addColorStop(0.55, '#EA580C');
gradient.addColorStop(1, '#DC2626');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
ctx.font = '600 64px Arial, Helvetica, sans-serif';
ctx.fillStyle = '#FFFFFF';

const label = 'Jobbcoach';
const suffix = '.ai';
const labelWidth = ctx.measureText(label).width;
const suffixWidth = ctx.measureText(suffix).width;
const startX = (WIDTH - (labelWidth + suffixWidth)) / 2;

ctx.fillText(label, startX, HEIGHT / 2);
ctx.globalAlpha = 0.75;
ctx.fillText(suffix, startX + labelWidth, HEIGHT / 2);
ctx.globalAlpha = 1;

const outDir = path.join(process.cwd(), 'public', 'email');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'email-header-jobbcoach.png');
writeFileSync(outFile, canvas.toBuffer('image/png'));

console.log(`Skrev ${outFile}`);
