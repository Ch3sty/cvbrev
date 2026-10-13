// Ljudet till version 3: "Gotta Go Fast" (bombinsound, Pixabay) klippt på takterna i
// src/v3/tid3.ts. Introt går genom ett lågpassfilter som öppnas på dropen, musiken
// ligger lägre än effekterna, och effekterna sitter på samma tider som bilden.
// Kör: npx tsx scripts/ljud3.ts

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DROP, MORF, SLAG, SPAR3, T, TAKT, takt } from '../src/v3/tid3';

const SR = 48000;
const LANGD = 30;
const N = SR * LANGD;
const L = new Float32Array(N);
const R = new Float32Array(N);
const REV = new Float32Array(N);
const db = (d: number) => Math.pow(10, d / 20);

let fro = 99;
const slump = () => {
  fro = (fro * 1664525 + 1013904223) >>> 0;
  return fro / 4294967296;
};
const brus = () => slump() * 2 - 1;

class Biquad {
  b0 = 1; b1 = 0; b2 = 0; a1 = 0; a2 = 0; x1 = 0; x2 = 0; y1 = 0; y2 = 0;
  constructor(public typ: 'lp' | 'hp' | 'bp', f: number, q = 0.707) {
    this.satt(f, q);
  }
  satt(f: number, q = 0.707) {
    const w = (2 * Math.PI * Math.min(Math.max(f, 10), SR * 0.45)) / SR;
    const c = Math.cos(w);
    const a = Math.sin(w) / (2 * q);
    let b0: number, b1: number, b2: number;
    if (this.typ === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
    else if (this.typ === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
    else { b0 = a; b1 = 0; b2 = -a; }
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0;
  }
  steg(x: number) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

/** Lägger in en signal. `pan` kan vara en funktion av tiden i ljudet (för panorering i rörelse). */
const lagg = (start: number, sek: number, gen: (s: number, i: number) => number, niva: number, pan: number | ((s: number) => number) = 0, rev = 0) => {
  const i0 = Math.round(start * SR);
  const n = Math.round(sek * SR);
  const g = db(niva);
  for (let i = 0; i < n; i++) {
    const j = i0 + i;
    if (j < 0 || j >= N) continue;
    const s = i / SR;
    const v = gen(s, i) * g;
    const p = typeof pan === 'function' ? pan(s) : pan;
    L[j] += v * Math.cos(((p + 1) * Math.PI) / 4) * Math.SQRT2;
    R[j] += v * Math.sin(((p + 1) * Math.PI) / 4) * Math.SQRT2;
    if (rev) REV[j] += v * rev;
  }
};

// ---------------------------------------------------------------------------
// Effekter

/** Smäll: sub som faller 95 till 38 Hz, en kropp av filtrerat brus och ett knäpp. */
const small = (t: number, niva = -6) => {
  const lp = new Biquad('lp', 1600);
  const hp = new Biquad('hp', 4000);
  let fas = 0;
  lagg(t, 0.45, (s) => {
    fas += (38 + 57 * Math.exp(-s / 0.04)) / SR;
    const sub = Math.sin(2 * Math.PI * fas) * Math.exp(-s / 0.16);
    const kropp = lp.steg(brus()) * Math.exp(-s / 0.045) * 0.9;
    const knapp = hp.steg(brus()) * Math.exp(-s / 0.004) * 0.6;
    return Math.tanh((sub * 1.2 + kropp + knapp) * 1.3);
  }, niva, 0, 0.15);
};

/** Riser: brus som öppnas uppåt och en ton som stiger, allt växer in i dropen. */
const riser = (start: number, slut: number, niva = -12) => {
  const sek = slut - start;
  const hp = new Biquad('hp', 300);
  const bp = new Biquad('bp', 800, 1.2);
  let fas = 0;
  lagg(start, sek, (s, i) => {
    const p = s / sek;
    if (i % 32 === 0) {
      hp.satt(300 * Math.pow(8000 / 300, p));
      bp.satt(600 * Math.pow(6000 / 600, p), 1.5);
    }
    const f = 180 * Math.pow(1400 / 180, p * p);
    fas += (f * (1 + 0.01 * Math.sin(2 * Math.PI * 6 * s))) / SR;
    const ton = (Math.sin(2 * Math.PI * fas) + 0.4 * Math.sin(4 * Math.PI * fas)) * 0.35;
    const env = Math.pow(p, 2.2);
    return (hp.steg(brus()) * 0.7 + bp.steg(brus()) * 0.6 + ton) * env;
  }, niva, (s) => Math.sin(s * 9) * 0.3 * (s / sek), 0.3);
};

/** Impact: djup boom, brusig krasch och en lång efterklang. */
const impact = (t: number, niva = -4) => {
  const hp = new Biquad('hp', 2500);
  const lp = new Biquad('lp', 9000);
  let fas = 0;
  lagg(t, 2.2, (s) => {
    fas += (30 + 30 * Math.exp(-s / 0.12)) / SR;
    const boom = Math.sin(2 * Math.PI * fas) * Math.exp(-s / 0.55);
    const krasch = lp.steg(hp.steg(brus())) * Math.exp(-s / 0.45) * 0.7;
    return Math.tanh((boom * 1.4 + krasch) * 1.2);
  }, niva, 0, 0.35);
};

/** Sus: bandpass-brus som sveper upp och ner, panoreras från vänster till höger. */
const sus = (t: number, sek: number, niva = -14, fran = -0.7, till = 0.7) => {
  const bp = new Biquad('bp', 500, 0.8);
  lagg(t, sek, (s, i) => {
    const p = s / sek;
    if (i % 32 === 0) bp.satt(400 + 3200 * Math.sin(Math.PI * p), 0.8);
    return bp.steg(brus()) * Math.pow(Math.sin(Math.PI * p), 1.6) * 2.2;
  }, niva, (s) => fran + (till - fran) * (s / sek), 0.2);
};

/** Bakvänd svällning in i ett klipp. */
const svall = (slut: number, sek: number, niva = -12) => {
  const lp = new Biquad('lp', 6000);
  lagg(slut - sek, sek, (s) => lp.steg(brus()) * Math.pow(s / sek, 3), niva, 0, 0.2);
};

/** Tick: högt, torrt knäpp. */
const tick = (t: number, niva = -16, pan = 0) => {
  const bp = new Biquad('bp', 3200, 2.5);
  lagg(t, 0.03, (s) => bp.steg(brus()) * Math.exp(-s / 0.004) * 4, niva, pan);
};

/** Pop: kort tonhöjd uppåt med knäpp, som en bricka som landar. */
const pop = (t: number, niva = -14, pan = 0) => {
  let fas = 0;
  lagg(t, 0.09, (s) => {
    fas += (520 + 420 * (1 - Math.exp(-s / 0.012))) / SR;
    return Math.sin(2 * Math.PI * fas) * Math.exp(-s / 0.03) + (s < 0.002 ? brus() * 0.4 : 0);
  }, niva, pan);
};

/** Klang: glasaktig, ojämna deltoner, för rätt svar. */
const klang = (t: number, grund = 880, niva = -10) => {
  const deltoner = [1, 2.0, 2.76, 4.07, 5.4];
  const styrka = [1, 0.45, 0.5, 0.25, 0.18];
  lagg(t, 1.6, (s) => {
    let v = 0;
    deltoner.forEach((d, k) => {
      v += Math.sin(2 * Math.PI * grund * d * s) * styrka[k] * Math.exp(-s / (0.9 / (1 + k * 0.7)));
    });
    return v * Math.min(1, s / 0.002) * 0.6;
  }, niva, 0, 0.45);
};

// ---------------------------------------------------------------------------
// Efterklang (Schroeder)

const efterklang = () => {
  const kammar = [1687, 1601, 2053, 2251].map((d) => ({ buf: new Float32Array(Math.round((d * SR) / 44100)), i: 0, f: 0 }));
  const allpass = [347, 113].map((d) => ({ buf: new Float32Array(Math.round((d * SR) / 44100)), i: 0 }));
  for (let j = 0; j < N; j++) {
    const x = REV[j] * 0.2;
    let y = 0;
    for (const k of kammar) {
      const ut = k.buf[k.i];
      k.f = ut * 0.7 + k.f * 0.3;
      k.buf[k.i] = x + k.f * 0.84;
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
    L[j] += y * 0.5;
    R[j] += y * 0.47;
  }
};

// ---------------------------------------------------------------------------
// Musiken: klippen, lågpass i introt som öppnas på dropen

const ffmpeg = path.resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const musik = () => {
  const tmp = path.resolve('musik/tmp/spar3.wav');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', path.resolve(SPAR3.fil), '-ac', '2', '-ar', String(SR), '-c:a', 'pcm_s16le', tmp]);
  const b = fs.readFileSync(tmp);
  const d = b.indexOf('data') + 8;
  const n = (b.length - d) >> 2;
  const ml = new Float32Array(N);
  const mr = new Float32Array(N);
  const skarv = Math.round(0.015 * SR);
  let ut = 0;
  SPAR3.klipp.forEach((k, nr) => {
    const fran = Math.round((SPAR3.forstaSlag + k.franTakt * TAKT) * SR);
    const langd = Math.round((k.takter * TAKT + (k.svans ?? 0)) * SR);
    for (let i = -skarv; i < langd + skarv; i++) {
      const j = ut + i;
      const src = fran + i;
      if (j < 0 || j >= N || src < 0 || src >= n) continue;
      let g = 1;
      if (i < skarv && nr > 0) g = (i + skarv) / (2 * skarv);
      if (i > langd - skarv && nr < SPAR3.klipp.length - 1) g = Math.min(g, (langd + skarv - i) / (2 * skarv));
      if (nr === 0 && i < 0) g = 0;
      ml[j] += (b.readInt16LE(d + 4 * src) / 32768) * g;
      mr[j] += (b.readInt16LE(d + 4 * src + 2) / 32768) * g;
    }
    ut += langd;
  });
  // Lågpass i introt: 380 Hz i första takten, öppnas långsamt under flygningen och helt på dropen.
  const lpL = [new Biquad('lp', 400), new Biquad('lp', 400)];
  const lpR = [new Biquad('lp', 400), new Biquad('lp', 400)];
  for (let j = 0; j < N; j++) {
    const s = j / SR;
    let v = 1;
    if (s < DROP) {
      if (j % 32 === 0) {
        const p = Math.max(0, (s - takt(1)) / TAKT);
        const f = 380 * Math.pow(2600 / 380, p * p);
        lpL.forEach((f2) => f2.satt(f, 0.9));
        lpR.forEach((f2) => f2.satt(f, 0.9));
      }
      ml[j] = lpL[1].steg(lpL[0].steg(ml[j]));
      mr[j] = lpR[1].steg(lpR[0].steg(mr[j]));
      v = db(-7);
    }
    // Musiken duckar kort under varje effekt-smäll i introt och vid morfen.
    L[j] += ml[j] * v * MUSIK_NIVA * duck(s);
    R[j] += mr[j] * v * MUSIK_NIVA * duck(s);
  }
};

const MUSIK_NIVA = db(-9);
const DUCKAR = [0, SLAG, 2 * SLAG, DROP, MORF, T.numeriskt, T.resultat, T.nivasteg, T.genomgang, T.hemvy, T.provet, T.personlighet, T.avslut, T.slut];
const duck = (s: number) => {
  let g = 1;
  for (const d of DUCKAR) {
    const x = s - d;
    if (x >= 0 && x < 0.4) g = Math.min(g, 1 - 0.5 * Math.exp(-x / 0.12));
  }
  return g;
};

// ---------------------------------------------------------------------------
// Tidslinjen

const effekter = () => {
  // Introt: tre ord, tre smällar
  small(0, -5);
  small(SLAG, -5);
  small(2 * SLAG, -4);
  // Ordet exploderar mot kameran, flygningen och risern in i dropen
  sus(takt(1), 0.6, -10, 0, 0);
  riser(takt(1), DROP, -9);
  for (const [t, p] of [[takt(1, 1.2), -0.8], [takt(1, 2.1), 0.7], [takt(1, 2.8), -0.5], [takt(1, 3.3), 0.6]] as [number, number][]) sus(t, 0.35, -16, p, -p);
  svall(DROP, 0.5, -10);
  impact(DROP, -3);

  // Logiktestet: pilens hopp på åttondelar
  for (let i = 1; i < 8; i++) tick(takt(2, 0.5 + i * 0.5), -17, -0.2 + i * 0.06);
  // Kameran drar sig ut, alternativen landar
  sus(takt(2, 2), 0.9, -18, 0.3, -0.3);
  for (let k = 0; k < 6; k++) pop(takt(3) + k * (SLAG / 4) * 0.68, -15, -0.4 + k * 0.16);
  // Rätt svar
  klang(takt(3, 1), 880, -9);
  small(takt(3, 1), -14);
  // Morfen: rutan växer, svällning in i klippet, smäll när ridån lyfts
  svall(MORF, 0.55, -9);
  small(MORF, -6);
  sus(MORF + 0.05, 0.5, -12, 0, 0);

  // Verbalt: knapparna poppar, rätt svar på takt 4
  for (let k = 0; k < 3; k++) pop(takt(3, 3) + k * 0.09, -15, -0.3 + k * 0.3);
  klang(takt(4), 988, -10);
  small(takt(4), -15);
  // Panoreringen till numeriskt
  sus(T.numeriskt - 0.25, 0.5, -9, -0.9, 0.9);
  small(T.numeriskt, -11);

  // Numeriskt: alternativen, rätt svar på takt 5, zoomen genom svaret
  for (let k = 0; k < 4; k++) pop(takt(4, 3) + k * 0.08, -16, -0.3 + k * 0.2);
  klang(takt(5), 880, -10);
  small(takt(5), -15);
  svall(T.resultat, 0.4, -8);
  small(T.resultat, -5);

  // Resultatet: ringen fylls, nivåsteget slår in
  sus(takt(5, 2.6), 0.4, -16, 0, 0);
  impact(T.nivasteg, -7);
  klang(T.nivasteg, 1319, -11);

  // Kortet vänds till genomgången
  sus(T.genomgang - 0.22, 0.45, -11, 0.6, -0.6);
  small(T.genomgang, -12);
  klang(takt(6, 2.5), 880, -13);

  // Flygningen genom vyn in i hemvyn
  svall(T.hemvy, 0.3, -10);
  sus(T.hemvy - 0.05, 0.5, -10, 0, 0);
  small(T.hemvy, -9);
  sus(takt(7, 1.3), 0.7, -17, -0.4, 0.4); // kurvans linje ritas
  pop(takt(7, 3), -14);

  // Övningsprovet: hårt klipp, klockan på slagen
  impact(T.provet, -9);
  for (let k = 0; k < 4; k++) tick(T.provet + k * SLAG, -11 + (k === 3 ? 2 : 0), 0.4);

  // Iris till personligheten
  sus(T.personlighet - 0.1, 0.5, -12, 0.5, -0.3);
  small(T.personlighet, -12);
  pop(takt(9, 1), -13);
  sus(takt(9, 1.5), 0.6, -17, -0.3, 0.3);
  for (let k = 0; k < 5; k++) tick(takt(9, 2) + k * 0.12, -20, -0.4 + k * 0.2);

  // Staplarna sveper till avslutet
  svall(T.avslut, 0.3, -9);
  sus(T.avslut - 0.3, 0.65, -9, -0.9, 0.9);
  small(T.avslut, -6);
  small(takt(10, 1), -10);
  pop(takt(10, 2), -11);
  small(takt(10, 2), -12);
  // Knappen trycks på spårets sista slag
  impact(T.slut, -6);
  klang(T.slut, 880, -9);
};

musik();
effekter();
efterklang();

let topp = 0;
const hpL = new Biquad('hp', 25);
const hpR = new Biquad('hp', 25);
for (let j = 0; j < N; j++) {
  L[j] = hpL.steg(L[j]);
  R[j] = hpR.steg(R[j]);
  topp = Math.max(topp, Math.abs(L[j]), Math.abs(R[j]));
}
// Normalisera till -1 dBFS topp med mjuk begränsning på det som sticker ut.
const g = db(-1) / Math.max(topp, 1e-9) * 1.6;
const tak = db(-1);
const begrans = (x: number) => (Math.abs(x) < tak * 0.6 ? x : Math.sign(x) * (tak * 0.6 + tak * 0.4 * Math.tanh((Math.abs(x) - tak * 0.6) / (tak * 0.4))));
for (let j = 0; j < N; j++) {
  L[j] = begrans(L[j] * g);
  R[j] = begrans(R[j] * g);
}

const wav = Buffer.alloc(44 + N * 4);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28);
wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
for (let j = 0; j < N; j++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[j])) * 32767), 44 + j * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[j])) * 32767), 46 + j * 4);
}
fs.writeFileSync(path.resolve('public/ljud3.wav'), wav);
console.log('public/ljud3.wav klar');
