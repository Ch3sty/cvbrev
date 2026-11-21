// src/lib/cv-parser/ocr.ts
//
// Bildbaserade PDF:er läses på vår egen server (ägarens regel 2026-11-21:
// inga personuppgifter till modellen). Tidigare renderades sidorna till PNG
// och skickades till Gemini för avläsning, och då gick namn, telefon, e-post
// och adress till modellen omaskade. Nu läses sidbilderna med tesseract.js
// (svensk språkmodell) i samma serverfunktion. Bilderna lämnar aldrig
// servern, och texten går sedan samma väg som all annan CV-text: kontakten
// läses lokalt, texten maskas och först den maskade texten struktureras.
//
// Språkdatan kommer ur npm-paketet @tesseract.js-data/swe och läses
// från disk, aldrig från ett CDN. Wasm-kärnan ligger i tesseract.js-core.
// Båda tas med i Vercels funktionspaket via outputFileTracingIncludes i
// next.config.ts. Själva läsningen sker i en egen arbetstråd (ocr-trad.cjs),
// så att en krasch där aldrig fäller processen. Saknas något i paketet blir
// det ett utfall med skälet 'tekniskt_fel', och användaren får samma besked
// som för en oläslig fil.
//
// Modellen är aldrig reserv för bilder. Ger läsningen för lite text eller för
// låg säkerhet får användaren be om en PDF med markerbar text eller Word.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { Worker } from 'worker_threads';
import { cleanExtractedText } from './text-utils';

/** Fler sidor än så läses inte (ett CV på fem sidor är redan långt). */
export const OCR_MAX_SIDOR = 5;
/**
 * Renderingsskala mot PDF:ens 72 punkter per tum. 3 ger 216 dpi, där
 * brödtext i 9 till 10 punkter får de cirka 25 pixlars versalhöjd som
 * tesseract läser bäst. Se mätningen i rapporten 2026-11-21.
 */
const RENDER_SKALA = 3;
/** Minsta mängd text som räknas som ett läst CV (samma gräns som förut). */
export const OCR_MIN_TECKEN = 50;
/**
 * Lägsta medelkonfidens (tesseracts MeanTextConf, 0 till 100, viktad med
 * textmängden per sida). Mätningen 2026-11-21 på våra egna mallar: rena
 * sidor och en lätt sned skanning i 150 dpi gav 90 till 94 med 92 till 99
 * procent rätt ord. Suddiga skanningar i 75 till 128 dpi gav 46 till 65 och
 * under en tredjedel av orden. Gränsen 75 ligger i glappet. Två suddiga
 * skanningar gav ändå 89 och 92 (se täckningen nedan).
 */
export const OCR_MIN_KONFIDENS = 75;
/**
 * Konfidensen räcker inte ensam. På en suddig skanning kan tesseract tyst
 * hoppa över hela textblock och ändå ge hög konfidens för det lilla som
 * lästes (skanning i 135 dpi: 92 i konfidens men 11 procent av orden). Varje
 * sida läses därför också i glest läge (PSM 11), som inte hoppar över block
 * men blandar ihop spalter, och räknar orden där. Hittar den vanliga
 * läsningen färre än så här stor andel av orden i den glesa, saknas text och
 * filen avvisas. Rena sidor i mätningen låg på 0,99 till 1,00, de suddiga
 * skanningarna (75 till 143 dpi) på 0,11 till 0,54.
 */
export const OCR_MIN_TACKNING = 0.85;
/**
 * Tidsbudget för hela läsningen. Routen exporterar maxDuration 120, men
 * vercel.json sätter 60 s för alla src/app/api/**, och det är inte bekräftat
 * vilken som vinner. Budgeten håller sig därför under 60 s: efter 40 s
 * avbryts OCR-tråden, och strukturen och databasen får resten. Hinner vi
 * inte alla sidor blir det beskedet för oläslig fil, aldrig ett halvläst CV.
 * När 120 s är bekräftat i Vercel kan budgeten höjas till cirka 75 s.
 */
export const OCR_TIDSBUDGET_MS = 40_000;

/** Ord med minst två bokstäver, för täckningskontrollen. */
function raknaOrd(text: string): number {
  return (text.match(/\p{L}{2,}/gu) ?? []).length;
}

/**
 * Bara svenska. Mätningen 2026-11-21 på våra egna mallar: med swe+eng blev
 * 30 procent av orden med å, ä och ö fel (pa, bade, Inférde), med enbart
 * swe 0 till 3 procent. Den svenska modellen läser engelska ord i ett
 * svenskt CV (Scrum, Professional, Management) lika bra.
 */
const SPRAK = ['swe'] as const;

export type OcrUtfall =
  | { ok: true; text: string; konfidens: number; tackning: number; sidor: number; ms: number }
  | {
      ok: false;
      skal: 'for_lite_text' | 'lag_konfidens' | 'saknar_text' | 'tidsgrans' | 'tekniskt_fel';
      konfidens?: number;
      tackning?: number;
      tecken?: number;
      sidor?: number;
      ms: number;
      fel?: string;
    };

/** Var språkdatan ligger i paketet (följer med via outputFileTracingIncludes). */
function sprakfil(sprak: string): string {
  return path.join(process.cwd(), 'node_modules', '@tesseract.js-data', sprak, '4.0.0_best_int', `${sprak}.traineddata.gz`);
}

/**
 * tesseract.js läser språkdatan ur en mapp med filnamnet <språk>.traineddata.gz
 * direkt i mappen, men paketet lägger den i en undermapp per version. Filen
 * kopieras därför en gång per kall start till en mapp under os.tmpdir(), det
 * enda skrivbara stället i en Vercel-funktion.
 */
async function sprakmapp(): Promise<string> {
  const mapp = path.join(os.tmpdir(), 'jc-tessdata-4.0.0_best_int');
  await fs.promises.mkdir(mapp, { recursive: true });
  for (const sprak of SPRAK) {
    const mal = path.join(mapp, `${sprak}.traineddata.gz`);
    const kalla = sprakfil(sprak);
    const finns = await fs.promises
      .stat(mal)
      .then((s) => s.size > 0)
      .catch(() => false);
    if (finns) continue;
    // Kopiera till ett temporärt namn först, så att en avbruten kopia aldrig
    // ser ut som en hel fil för nästa anrop.
    const tmp = `${mal}.${process.pid}.${Date.now()}`;
    await fs.promises.copyFile(kalla, tmp);
    await fs.promises.rename(tmp, mal);
  }
  return mapp;
}

/**
 * Rättar det OCR:en vanligen läser fel i kontaktraden. Den svenska modellen
 * läser @ som Q, (Q, & eller ©, och då hittar varken den lokala
 * kontaktläsningen eller maskeringen e-postadressen. Rättas bara när det
 * efter tecknet står något som ser ut som en domän (exempel.se, mail.com).
 */
export function lagaOcrText(text: string): string {
  return text.replace(
    // Lokaldelen är lat, så att ett Q som står direkt före @ ("lindbergQ@")
    // räknas till skiljetecknet och inte till adressen.
    /\b([A-Za-z0-9._%+-]{2,}?)[ ]?(?:\(?Q\)?@?|\(@\)|\(a\)|&|©|@)[ ]?([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,6})\b/g,
    '$1@$2'
  );
}

/**
 * Andra skyddet för OCR-text, efter den vanliga maskeringen. OCR läser ibland
 * fel i just personuppgifterna ("[inkedin:com/in/eriklindberd",
 * "erik.indberg@"), och då känner mönstren inte igen dem. Början av varje
 * känd namndel (fem tecken, eller hela delen om den är kortare) letas upp:
 * ett ord som börjar så, eller ett ord med tecken som hör till adresser
 * (punkt, snedstreck, @, kolon, siffror) och innehåller den, byts mot [NAMN].
 * "Nordamerika" står kvar fast namnet är Erik. Hellre ett ord för mycket
 * maskat än ett namn som går till modellen; används bara på OCR-text.
 */
export function maskaOcrRester(text: string, kandaNamn: Array<string | null | undefined>): string {
  const borjor = new Set<string>();
  for (const namn of kandaNamn) {
    for (const del of (namn ?? '').split(/[\s-]+/)) {
      const d = del.trim().toLowerCase();
      if (d.length >= 3 && !/^\[.*\]$/.test(d)) borjor.add(d.slice(0, Math.min(5, d.length)));
    }
  }
  if (borjor.size === 0 || !text) return text;
  return text.replace(/[^\s|·,;]+/g, (ord) => {
    if (/^\[[A-ZÅÄÖ-]+\]$/.test(ord)) return ord;
    const liten = ord.toLowerCase();
    const adressartad = /[./@:\d]/.test(ord);
    for (const b of borjor) {
      // Treställiga delar (Per, Eva) bara i adressartade ord: "personal"
      // ska inte maskas för att någon heter Per.
      const borjarSa = b.length >= 4 && liten.replace(/^[^\p{L}]+/u, '').startsWith(b);
      if (borjarSa || (adressartad && liten.includes(b))) return '[NAMN]';
    }
    return ord;
  });
}

/** PDF:ens sidor som PNG, med pdf.js och @napi-rs/canvas. */
async function renderaSidor(pdfData: Uint8Array, skala: number): Promise<Buffer[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');
  const doc = await pdfjs.getDocument({
    data: pdfData,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise;
  const bilder: Buffer[] = [];
  try {
    for (let s = 1; s <= Math.min(doc.numPages, OCR_MAX_SIDOR); s++) {
      const sida = await doc.getPage(s);
      const vp = sida.getViewport({ scale: skala });
      const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
      const ctx = canvas.getContext('2d');
      // Vit botten: en transparent sida blir svart för tesseract.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await sida.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport: vp } as never).promise;
      bilder.push(canvas.toBuffer('image/png'));
      sida.cleanup();
    }
  } finally {
    await doc.destroy();
  }
  return bilder;
}

/** Arbetstråden som kör tesseract.js (se filens egen kommentar). */
function tradfil(): string {
  return path.join(process.cwd(), 'src', 'lib', 'cv-parser', 'ocr-trad.cjs');
}

interface SidSvar {
  text: string;
  konfidens: number;
  glesOrd: number;
}

/**
 * Kör OCR i en egen arbetstråd. Kraschar tråden eller tar den för lång tid
 * blir det ett fel med skäl, aldrig ett okontrollerat fel i processen.
 */
function lasITrad(
  bilder: Buffer[],
  sprakmappen: string,
  tidMs: number
): Promise<{ sidor: SidSvar[] } | { skal: 'tidsgrans' | 'tekniskt_fel'; fel?: string }> {
  return new Promise((resolve) => {
    let klar = false;
    const svara = (v: { sidor: SidSvar[] } | { skal: 'tidsgrans' | 'tekniskt_fel'; fel?: string }) => {
      if (klar) return;
      klar = true;
      clearTimeout(klocka);
      void trad.terminate().catch(() => {});
      resolve(v);
    };
    const bilddata = bilder.map((b) => new Uint8Array(b.buffer, b.byteOffset, b.byteLength));
    const trad = new Worker(tradfil(), {
      workerData: { bilder: bilddata, sprakmapp: sprakmappen, sprak: [...SPRAK] },
    });
    const klocka = setTimeout(() => svara({ skal: 'tidsgrans' }), Math.max(1, tidMs));
    trad.on('message', (m: { sidor?: SidSvar[]; fel?: string }) =>
      svara(m.sidor ? { sidor: m.sidor } : { skal: 'tekniskt_fel', fel: m.fel ?? 'okänt fel i OCR-tråden' })
    );
    trad.on('error', (err) => svara({ skal: 'tekniskt_fel', fel: err instanceof Error ? err.message : String(err) }));
    trad.on('exit', (kod) => svara({ skal: 'tekniskt_fel', fel: `OCR-tråden avslutades (kod ${kod})` }));
  });
}

/**
 * Läser en bildbaserad PDF med OCR på servern. Kastar aldrig: allt som går
 * fel blir ett utfall med skäl, så att routen kan ge rätt besked.
 */
export async function lasPdfMedOcr(
  pdfData: Uint8Array,
  opts: { tidsbudgetMs?: number; minKonfidens?: number; minTackning?: number; skala?: number } = {}
): Promise<OcrUtfall> {
  const start = Date.now();
  const budget = opts.tidsbudgetMs ?? OCR_TIDSBUDGET_MS;
  const minKonfidens = opts.minKonfidens ?? OCR_MIN_KONFIDENS;
  const minTackning = opts.minTackning ?? OCR_MIN_TACKNING;
  const ms = () => Date.now() - start;

  try {
    const [bilder, mapp] = await Promise.all([renderaSidor(pdfData, opts.skala ?? RENDER_SKALA), sprakmapp()]);
    if (bilder.length === 0) {
      return { ok: false, skal: 'for_lite_text', tecken: 0, sidor: 0, ms: ms() };
    }

    const svar = await lasITrad(bilder, mapp, budget - ms());
    if (!('sidor' in svar)) {
      return { ok: false, skal: svar.skal, fel: svar.fel, sidor: bilder.length, ms: ms() };
    }

    const text = cleanExtractedText(lagaOcrText(svar.sidor.map((s) => s.text).join('\n\n')));
    // Medelkonfidens viktad med textmängden, så att en nästan tom sida två
    // inte drar ned ett väl läst CV.
    const totalt = svar.sidor.reduce((s, k) => s + k.text.length, 0);
    const konfidens = totalt > 0 ? svar.sidor.reduce((s, k) => s + k.konfidens * k.text.length, 0) / totalt : 0;
    // Täckningen: sämsta sidan. Sidor med nästan ingen text (en tom sista
    // sida) räknas inte.
    let tackning = 1;
    for (const sida of svar.sidor) {
      if (sida.glesOrd >= 20) tackning = Math.min(tackning, raknaOrd(sida.text) / sida.glesOrd);
    }

    if (text.replace(/\s/g, '').length < OCR_MIN_TECKEN) {
      return { ok: false, skal: 'for_lite_text', tecken: text.length, konfidens, sidor: bilder.length, ms: ms() };
    }
    if (konfidens < minKonfidens) {
      return { ok: false, skal: 'lag_konfidens', tecken: text.length, konfidens, tackning, sidor: bilder.length, ms: ms() };
    }
    if (tackning < minTackning) {
      return { ok: false, skal: 'saknar_text', tecken: text.length, konfidens, tackning, sidor: bilder.length, ms: ms() };
    }
    return { ok: true, text, konfidens, tackning, sidor: bilder.length, ms: ms() };
  } catch (err) {
    const fel = err instanceof Error ? err.message : String(err);
    return { ok: false, skal: 'tekniskt_fel', fel, ms: ms() };
  }
}
