// Ljudet till testvideon: spåret "What About Action?" (Diego Nava, Mixkit, se musik/LICENS.md)
// klippt på takterna i src/tid.ts, och ljudeffekter syntetiserade på samma tider som bilden.
// Kör: npm run ljud

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SCENER, SLAG, SPAR, TAKT, takt, videoTid } from '../src/tid';

const SR = 48000;
const LANGD = 30;
const N = SR * LANGD;

const L = new Float32Array(N);
const R = new Float32Array(N);
const REV_IN = new Float32Array(N); // sänd till efterklangen (pad och markering)

const db = (d: number) => Math.pow(10, d / 20);
const hz = (not: string) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(not);
  if (!m) throw new Error(not);
  const bas: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const halvton = bas[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * Math.pow(2, halvton / 12);
};

// Slumptal med frö, så att varje körning blir identisk.
let fro = 1234567;
const slump = () => {
  fro = (fro * 1664525 + 1013904223) >>> 0;
  return fro / 4294967296;
};

/** RBJ-biquad. */
class Biquad {
  b0 = 1; b1 = 0; b2 = 0; a1 = 0; a2 = 0;
  x1 = 0; x2 = 0; y1 = 0; y2 = 0;
  constructor(public typ: 'lp' | 'bp' | 'hp', f: number, q = 0.707) {
    this.satt(f, q);
  }
  satt(f: number, q = 0.707) {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const cos = Math.cos(w);
    const alfa = Math.sin(w) / (2 * q);
    let b0: number, b1: number, b2: number;
    if (this.typ === 'lp') {
      b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = (1 - cos) / 2;
    } else if (this.typ === 'hp') {
      b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = (1 + cos) / 2;
    } else {
      b0 = alfa; b1 = 0; b2 = -alfa;
    }
    const a0 = 1 + alfa;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = (-2 * cos) / a0; this.a2 = (1 - alfa) / a0;
  }
  steg(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

const tri = (fas: number) => {
  const p = fas - Math.floor(fas);
  return 4 * Math.abs(p - 0.5) - 1;
};

/** Lägger in en mono-signal med panorering (-1 vänster, 1 höger). */
const lagg = (start: number, data: Float32Array, niva: number, pan = 0, rev = 0) => {
  const i0 = Math.round(start * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let i = 0; i < data.length; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    const v = data[i] * niva;
    L[j] += v * gl;
    R[j] += v * gr;
    if (rev) REV_IN[j] += v * rev;
  }
};

const buffert = (sek: number) => new Float32Array(Math.round(sek * SR));

// ---------------------------------------------------------------------------
// Ljudeffekter

/** Träklick: triangel med fallande tonhöjd och en kort brusknäpp i ansatsen. */
const traklick = (t: number, hog: boolean, niva = -20, f0?: number) => {
  const b = buffert(0.09);
  const fa = f0 ?? (hog ? 900 : 400);
  const fb = hog ? fa * 0.67 : fa * 0.75;
  const lp = new Biquad('lp', 3000);
  let fas = 0;
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    const f = fb + (fa - fb) * Math.exp(-s / 0.015);
    fas += f / SR;
    const env = Math.min(1, s / 0.001) * Math.exp(-s / 0.018);
    const knapp = s < 0.004 ? (slump() * 2 - 1) * (1 - s / 0.004) * 0.3 : 0;
    b[i] = lp.steg(tri(fas) * env + knapp);
  }
  lagg(t, b, db(niva));
};

/** Brus som glider: filtret rör sig från f0 till f1. */
const glid = (t: number, sek: number, f0: number, f1: number, niva = -28) => {
  const b = buffert(sek + 0.05);
  const bp = new Biquad('bp', f0, 0.9);
  let rosa = 0;
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    const p = Math.min(1, s / sek);
    if (i % 64 === 0) bp.satt(f0 * Math.pow(f1 / f0, p), 0.9);
    rosa = 0.97 * rosa + 0.03 * (slump() * 2 - 1);
    const env = Math.sin(Math.PI * Math.min(1, s / sek)) ** 1.5;
    b[i] = bp.steg(rosa * 6) * env;
  }
  lagg(t, b, db(niva), 0.1);
};

/** Zip: tråden som löper, bandpass 300 till 1 200 Hz. */
const zip = (t: number, sek: number, niva = -26) => glid(t, sek, 300, 1200, niva + 2);

const vridning = (t: number) => {
  const b = buffert(0.05);
  const bp = new Biquad('bp', 1200, 2);
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    if (i % 32 === 0) bp.satt(1200 + 1000 * (s / 0.04), 2);
    b[i] = bp.steg(slump() * 2 - 1) * Math.sin(Math.PI * Math.min(1, s / 0.04));
  }
  lagg(t, b, db(-30), -0.15);
};

const tick = (t: number, niva = -22) => {
  const b = buffert(0.02);
  const bp = new Biquad('bp', 4000, 3);
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    b[i] = bp.steg(slump() * 2 - 1) * Math.exp(-s / 0.002) * 3;
  }
  lagg(t, b, db(niva), 0.45);
};

const rim = (t: number) => {
  const b = buffert(0.03);
  const bp = new Biquad('bp', 2400, 4);
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    b[i] = bp.steg(slump() * 2 - 1) * Math.exp(-s / 0.005) * 3;
  }
  lagg(t, b, db(-26), -0.2);
};

const dab = (t: number, niva = -32) => {
  const b = buffert(0.1);
  let fas = 0;
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    fas += (200 + 100 * Math.exp(-s / 0.02)) / SR;
    b[i] = tri(fas) * Math.min(1, s / 0.002) * Math.exp(-s / 0.03);
  }
  lagg(t, b, db(niva));
};

/** Markeringen: två sinustoner som en mjuk marimba. */
const markering = (t: number, toner: [number, number] = [hz('D5'), hz('A5')], niva = -18) => {
  const b = buffert(0.9);
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    const env = Math.min(1, s / 0.008) * Math.exp(-s / 0.22);
    let v = 0;
    for (const f of toner) {
      v += Math.sin(2 * Math.PI * f * s) + 0.18 * Math.sin(2 * Math.PI * f * 4 * s) * Math.exp(-s / 0.03);
    }
    b[i] = (v / 2) * env;
  }
  lagg(t, b, db(niva), 0, 0.35);
};

const kick = (t: number, niva = -24) => {
  const b = buffert(0.2);
  let fas = 0;
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    fas += (50 + 60 * Math.exp(-s / 0.02)) / SR;
    b[i] = Math.sin(2 * Math.PI * fas) * Math.min(1, s / 0.002) * Math.exp(-s / 0.06);
  }
  lagg(t, b, db(niva));
};

const bas = (t: number, f: number, sek = 0.9, niva = -21) => {
  const b = buffert(sek + 0.2);
  for (let i = 0; i < b.length; i++) {
    const s = i / SR;
    const env = Math.min(1, s / 0.01) * (s < sek ? Math.exp(-s / 0.6) : Math.exp(-sek / 0.6) * Math.exp(-(s - sek) / 0.04));
    b[i] = (Math.sin(2 * Math.PI * f * s) + 0.1 * tri(f * s)) * env;
  }
  lagg(t, b, db(niva));
};

/** Plock: Karplus-Strong, låter som en nylonsträng. */
const plock = (t: number, f: number, niva = -14, pan = 0, sek = 1.2) => {
  const b = buffert(sek);
  const period = Math.round(SR / f);
  const linje = new Float32Array(period);
  for (let i = 0; i < period; i++) linje[i] = slump() * 2 - 1;
  const lp = new Biquad('lp', 2500);
  let idx = 0;
  for (let i = 0; i < b.length; i++) {
    const nasta = (idx + 1) % period;
    const v = linje[idx];
    linje[idx] = 0.4985 * (v + linje[nasta]);
    idx = nasta;
    const s = i / SR;
    b[i] = lp.steg(v) * Math.exp(-s / 0.35);
  }
  lagg(t, b, db(niva), pan, 0.08);
};

// ---------------------------------------------------------------------------
// Efterklang: kort plåt (Schroeder) på sändbussen

const efterklang = () => {
  const kammar = [1557, 1617, 1491, 1422].map((d) => ({ buf: new Float32Array(Math.round((d * SR) / 44100)), i: 0, f: 0 }));
  const allpass = [225, 556].map((d) => ({ buf: new Float32Array(Math.round((d * SR) / 44100)), i: 0 }));
  const aterkoppling = 0.78;
  const dampning = 0.3;
  for (let j = 0; j < N; j++) {
    const x = REV_IN[j] * 0.25;
    let y = 0;
    for (const k of kammar) {
      const ut = k.buf[k.i];
      k.f = ut * (1 - dampning) + k.f * dampning;
      k.buf[k.i] = x + k.f * aterkoppling;
      k.i = (k.i + 1) % k.buf.length;
      y += ut;
    }
    for (const a of allpass) {
      const ut = a.buf[a.i];
      const inn = y + ut * 0.5;
      a.buf[a.i] = inn;
      a.i = (a.i + 1) % a.buf.length;
      y = ut - inn * 0.5;
    }
    L[j] += y * db(-6);
    R[j] += y * db(-6) * 0.96;
  }
};

// ---------------------------------------------------------------------------
// Spåret: klippen läggs efter varandra med 12 ms övertoning i skarvarna

const ffmpeg = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const lasSpar = () => {
  const tmp = path.resolve('musik/tmp/spar.wav');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', path.resolve(SPAR.fil), '-ac', '2', '-ar', String(SR), '-c:a', 'pcm_s16le', tmp]);
  const b = fs.readFileSync(tmp);
  const d = b.indexOf('data') + 8;
  const n = (b.length - d) >> 2;
  const l = new Float32Array(n);
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    l[i] = b.readInt16LE(d + 4 * i) / 32768;
    r[i] = b.readInt16LE(d + 4 * i + 2) / 32768;
  }
  return { l, r };
};

const MUSIK_L = new Float32Array(N);
const MUSIK_R = new Float32Array(N);

const musik = () => {
  const { l, r } = lasSpar();
  const skarv = Math.round(0.012 * SR);
  let ut = 0;
  SPAR.klipp.forEach((k, nr) => {
    const fran = Math.round((SPAR.forstaSlag + k.franTakt * TAKT) * SR);
    const langd = Math.round((k.takter * TAKT + (k.svans ?? 0)) * SR);
    for (let i = -skarv; i < langd + skarv; i++) {
      const j = ut + i;
      if (j < 0 || j >= N || fran + i < 0 || fran + i >= l.length) continue;
      // Övertoning i skarvarna, och en mjuk start på första klippet.
      let g = 1;
      if (i < skarv) g = nr === 0 ? Math.min(1, Math.max(0, i) / (0.25 * SR)) : (i + skarv) / (2 * skarv);
      if (i > langd - skarv && nr < SPAR.klipp.length - 1) g = Math.min(g, (langd + skarv - i) / (2 * skarv));
      MUSIK_L[j] += l[fran + i] * g;
      MUSIK_R[j] += r[fran + i] * g;
    }
    ut += langd;
  });
};

// ---------------------------------------------------------------------------
// Ljudeffekterna, på samma tider som bilden (src/tid.ts och scenernas interna tider)

const D5 = hz('D#5');
const A5 = hz('A#5');
const ratt = (t: number) => markering(t, [D5, A5], -20);

/** Sus vid klippen: brus som stiger in i klippet. */
const sus = (klipp: number, niva = -30) => glid(klipp - 0.16, 0.2, 600, 3000, niva);

const effekter = () => {
  // Introt
  glid(takt(1) - 0.2, 0.5, 400, 2400, -28);
  traklick(takt(1) + 2 * SLAG, false, -22);
  traklick(takt(1) + 3 * SLAG, true, -24);

  // Klippen
  for (const s of SCENER.slice(2)) sus(s.fran);

  // Logiktest: pilens hopp och svaret
  for (let i = 1; i < 8; i++) vridning(videoTid('logik', 3.5 + 0.25 * i));
  for (let k = 0; k < 6; k++) traklick(videoTid('logik', 5.25 + 0.125 * k), false, -27);
  ratt(videoTid('logik', 6.0));

  // Verbalt
  for (let k = 0; k < 3; k++) traklick(videoTid('verbalt', 8.0 + 0.125 * k), false, -26, 300 + 40 * k);
  ratt(videoTid('verbalt', 8.75));

  // Numeriskt
  for (let k = 0; k < 4; k++) traklick(videoTid('numeriskt', 10.75 + 0.125 * k), false, -27);
  ratt(videoTid('numeriskt', 12.25));

  // Resultatet: ringen fylls och nivån stiger
  zip(videoTid('resultat', 13.3), 0.3, -26);
  markering(videoTid('resultat', 13.5), [hz('F#5'), hz('C#6')], -19);

  // Genomgången
  ratt(videoTid('genomgang', 16.25));

  // Hemvyn: kurvan ritas, dagens pass landar
  zip(videoTid('hemvy', 18.2), 0.68, -27);
  traklick(videoTid('hemvy', 20.0), false, -24);

  // Övningsprovet: klockan
  tick(videoTid('provet', 23.0), -20);

  // Personligheten
  dab(videoTid('personlighet', 25.0), -24);
  [26.25, 26.375, 26.5, 26.625, 26.75].forEach((s) => traklick(videoTid('personlighet', s), true, -32));

  // Avslutet: knappen poppar
  traklick(takt(14), false, -20);
};

// ---------------------------------------------------------------------------
// Mix och normalisering

musik();
effekter();
efterklang();

// Effekterna normaliseras inte för sig; musiken bär nivån och effekterna ligger under.
const hpL = new Biquad('hp', 25);
const hpR = new Biquad('hp', 25);
let kvadrat = 0;
for (let j = 0; j < N; j++) {
  L[j] = hpL.steg(MUSIK_L[j] * db(-4) + L[j] * db(6));
  R[j] = hpR.steg(MUSIK_R[j] * db(-4) + R[j] * db(6));
  kvadrat += L[j] * L[j] + R[j] * R[j];
}
// Ungefär -14 LUFS för webb och sociala medier: RMS -14 dBFS, mjuk begränsning, topp -1 dBFS.
const rms = Math.sqrt(kvadrat / (2 * N));
const forst = db(-14) / rms;
const tak = db(-1);
const begrans = (x: number) => (Math.abs(x) < tak * 0.7 ? x : Math.sign(x) * (tak * 0.7 + tak * 0.3 * Math.tanh((Math.abs(x) - tak * 0.7) / (tak * 0.3))));
let topp = 0;
for (let j = 0; j < N; j++) {
  L[j] = begrans(L[j] * forst);
  R[j] = begrans(R[j] * forst);
  topp = Math.max(topp, Math.abs(L[j]), Math.abs(R[j]));
}
// Kort uttoning sista 60 ms så att loopen inte klickar.
for (let j = N - Math.round(0.06 * SR); j < N; j++) {
  const g = (N - j) / (0.06 * SR);
  L[j] *= g;
  R[j] *= g;
}

const wav = Buffer.alloc(44 + N * 4);
wav.write('RIFF', 0);
wav.writeUInt32LE(36 + N * 4, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(SR, 24);
wav.writeUInt32LE(SR * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(N * 4, 40);
for (let j = 0; j < N; j++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[j])) * 32767), 44 + j * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[j])) * 32767), 46 + j * 4);
}
const utfil = path.resolve('public/ljud.wav');
fs.writeFileSync(utfil, wav);
console.log(`${utfil}  förstärkning ${(20 * Math.log10(forst)).toFixed(1)} dB, topp ${(20 * Math.log10(topp)).toFixed(1)} dBFS`);
