// Lägger kontrollbilderna i ett kontaktark per format (puppeteer från repots rot).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from '../../node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const dir = path.resolve('out/stills');
const [prefix, kolumner = '3', bredd = '640'] = process.argv.slice(2);
const filer = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith('.png')).sort();
const kort = filer.map((f) => `<div><img src="${pathToFileURL(path.join(dir, f)).href}" style="width:${bredd}px;display:block"><div>${f}</div></div>`);
const html = `<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${kolumner},${bredd}px);gap:6px;padding:6px;font:14px sans-serif;color:#ccc">${kort.join('')}</body>`;
const sida = path.resolve(`out/ark-${prefix}.html`);
fs.writeFileSync(sida, html);
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: Number(kolumner) * (Number(bredd) + 6) + 6, height: 400 });
await page.goto(pathToFileURL(sida).href, { waitUntil: 'load' });
await page.screenshot({ path: path.resolve(`out/ark-${prefix}.png`), fullPage: true });
await browser.close();
console.log(`out/ark-${prefix}.png`);
