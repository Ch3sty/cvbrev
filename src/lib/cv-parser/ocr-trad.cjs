// src/lib/cv-parser/ocr-trad.cjs
//
// Arbetstråden för OCR-läsningen (ocr.ts). tesseract.js körs här och inte i
// serverfunktionens huvudtråd, av två skäl:
//
//  1. tesseract.js startar i sin tur en egen arbetstråd utan felhanterare.
//     Kraschar den (wasm-kärnan saknas i funktionspaketet, minnet tar slut)
//     kastas felet okontrollerat och tar med sig hela processen, och då får
//     användaren ett 500 utan förklaring. Här stannar kraschen i den här
//     tråden, och huvudtråden får ett 'error' som blir beskedet för
//     bildbaserad PDF.
//  2. Huvudtråden kan avbryta läsningen mitt i en sida när tidsbudgeten är
//     slut (worker.terminate()), i stället för att vänta ut sidan.
//
// Vanlig JavaScript, inte TypeScript: filen startas från disk med sökvägen
// och buntas inte. Den tas med i funktionspaketet via
// outputFileTracingIncludes i next.config.ts.
//
// In (workerData): { bilder: Uint8Array[], sprakmapp: string, sprak: string[] }
// Ut (postMessage): { sidor: [{ text, konfidens, glesOrd }] } eller { fel }

// Turbopack följer sökvägen i ocr.ts hit och spårar filens beroenden, och
// bygget kraschar på varje modulnamn den inte kan göra till en fil
// ("NftJsonAsset: cannot handle filepath node:worker_threads", sedan
// "tesseract.js"). Därför require med turbopackIgnore på båda; filerna
// kommer ändå med via outputFileTracingIncludes och serverExternalPackages.
const { parentPort, workerData } = require(/* turbopackIgnore: true */ 'worker_threads');

function raknaOrd(text) {
  return (text.match(/\p{L}{2,}/gu) ?? []).length;
}

async function kor() {
  const { bilder, sprakmapp, sprak } = workerData;
  const tesseract = require(/* turbopackIgnore: true */ 'tesseract.js');
  const worker = await tesseract.createWorker(sprak, tesseract.OEM.LSTM_ONLY, {
    langPath: sprakmapp,
    gzip: true,
    // Ingen cache i arbetskatalogen (skrivskyddad i Vercel).
    cacheMethod: 'none',
    // Utan felhanterare kastar tesseract.js ett okontrollerat fel när ett
    // jobb avvisas. Avvisningen når oss ändå via jobbets promise.
    errorHandler: () => {},
  });
  try {
    const sidor = [];
    for (const bild of bilder) {
      const buf = Buffer.from(bild);
      // Texten: tesseract delar upp sidan själv (PSM 3, automatisk
      // sidsegmentering), så att sidospalt och huvudspalt läses var för sig.
      // tesseract.js har annars ett enda textblock (PSM 6) som standard, och
      // då läses spalterna ihop rad för rad.
      await worker.setParameters({ tessedit_pageseg_mode: tesseract.PSM.AUTO });
      const { data } = await worker.recognize(buf);
      // Kontrollen: samma sida i glest läge (PSM 11), bara för att räkna ord.
      await worker.setParameters({ tessedit_pageseg_mode: tesseract.PSM.SPARSE_TEXT });
      const { data: gles } = await worker.recognize(buf);
      sidor.push({
        text: (data.text ?? '').trim(),
        konfidens: data.confidence ?? 0,
        glesOrd: raknaOrd(gles.text ?? ''),
      });
    }
    return { sidor };
  } finally {
    await worker.terminate().catch(() => {});
  }
}

kor().then(
  (svar) => parentPort.postMessage(svar),
  (err) => parentPort.postMessage({ fel: err instanceof Error ? err.message : String(err) })
);
