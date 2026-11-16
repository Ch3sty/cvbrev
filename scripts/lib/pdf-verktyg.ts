/**
 * Verktyg för mallgranskningen: PDF-sidor som png (pdf.js i Chrome) och
 * PDF:ens text med position per sida (pdf.js i Node), så att sidbrytningen
 * kan kontrolleras ur den riktiga filen.
 *
 * Används av scripts/mallar-sidbrytning.ts, scripts/word-mallar-granska.ts
 * och scripts/mallbilder.ts. Bilderna hamnar alltid utanför git.
 */
import { existsSync, readFileSync } from 'fs'
import http from 'http'
import path from 'path'

export const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

/** En textrad på en sida: y uppifrån i punkter, och texten. */
export interface PdfRad {
  sida: number
  y: number
  x: number
  text: string
}

export interface PdfGeometri {
  sidor: number
  /** Sidhöjden i punkter. */
  hojd: number
  rader: PdfRad[]
}

/**
 * PDF:ens textrader per sida. Textbitar på samma höjd (inom 2 pt) slås ihop
 * till en rad, i x-ordning.
 */
export async function lasPdfGeometri(buf: Buffer | Uint8Array): Promise<PdfGeometri> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true, isEvalSupported: false }).promise
  const rader: PdfRad[] = []
  let hojd = 842
  for (let s = 1; s <= doc.numPages; s++) {
    const sida = await doc.getPage(s)
    const vp = sida.getViewport({ scale: 1 })
    hojd = vp.height
    const inn = await sida.getTextContent()
    const bitar = (inn.items as { str: string; transform: number[] }[])
      .filter((i) => typeof i.str === 'string' && i.str.trim())
      .map((i) => ({ x: i.transform[4], y: vp.height - i.transform[5], text: i.str }))
    bitar.sort((a, b) => a.y - b.y || a.x - b.x)
    const pa: PdfRad[] = []
    for (const b of bitar) {
      const sista = pa[pa.length - 1]
      if (sista && Math.abs(sista.y - b.y) < 2) {
        sista.text += (b.x > sista.x ? ' ' : '') + b.text
      } else {
        pa.push({ sida: s, y: b.y, x: b.x, text: b.text })
      }
    }
    rader.push(...pa)
  }
  return { sidor: doc.numPages, hojd, rader }
}

/** Normaliserad text för jämförelser: ett mellanslag, gemener, bindestreck i radbrytning ihop. */
export const norm = (s: string) => s.normalize('NFC').replace(/-\s+/g, '-').replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * Sidan där en text står (första träffen efter `franSida`). Texten får vara
 * radbruten: det räcker att dess första 24 tecken finns i en rad.
 */
export function sidaFor(g: PdfGeometri, text: string, franSida = 1): number {
  const nyckel = norm(text).slice(0, 24)
  const rad = g.rader.find((r) => r.sida >= franSida && norm(r.text).includes(nyckel))
  return rad?.sida ?? -1
}

/** Sidan där en text slutar (sista 24 tecknen). */
export function sidaForSlut(g: PdfGeometri, text: string, franSida = 1): number {
  const nyckel = norm(text).slice(-24)
  const rad = g.rader.find((r) => r.sida >= franSida && norm(r.text).includes(nyckel))
  return rad?.sida ?? -1
}

/**
 * Ritar PDF:er som png, en bild per sida (`<namn>-s<sida>.png` bredvid
 * PDF:en). `filer` är absoluta sökvägar.
 */
export async function ritaPdfSidor(filer: string[], skala = 1.5): Promise<Record<string, string[]>> {
  const pdfjsMapp = path.resolve('node_modules/pdfjs-dist/build')
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0])
    let fil: string
    if (url.startsWith('/pdfjs/')) fil = path.join(pdfjsMapp, url.slice(7))
    else if (url === '/') {
      res.setHeader('Content-Type', 'text/html')
      res.end(`<!doctype html><html><body style="margin:0;background:#fff"><canvas id="c"></canvas><script type="module">
        import * as pdfjs from '/pdfjs/pdf.mjs';
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
        window.rita = async (fil, sida, skala) => {
          const doc = await pdfjs.getDocument('/fil?p=' + encodeURIComponent(fil)).promise;
          const p = await doc.getPage(sida);
          const vp = p.getViewport({ scale: skala });
          const c = document.getElementById('c');
          c.width = vp.width; c.height = vp.height;
          await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          return { sidor: doc.numPages };
        };
        window.klar = true;
      </script></body></html>`)
      return
    } else if (url === '/fil') {
      fil = new URL(req.url ?? '', 'http://x').searchParams.get('p') ?? ''
    } else fil = ''
    if (!fil || !existsSync(fil)) {
      res.statusCode = 404
      res.end()
      return
    }
    res.setHeader('Content-Type', fil.endsWith('.mjs') ? 'text/javascript' : fil.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream')
    res.end(readFileSync(fil))
  })
  await new Promise<void>((r) => server.listen(0, r))
  const port = (server.address() as { port: number }).port
  const puppeteer = (await import('puppeteer-core')).default
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
  const ut: Record<string, string[]> = {}
  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1000, height: 1400 })
    await page.goto(`http://localhost:${port}/`)
    await page.waitForFunction('window.klar === true')
    for (const pdf of filer) {
      ut[pdf] = []
      let sida = 1
      let sidor = 1
      do {
        const r = (await page.evaluate((f, s, k) => (window as any).rita(f, s, k), pdf, sida, skala)) as { sidor: number }
        sidor = r.sidor
        const el = await page.$('#c')
        const png = pdf.replace(/\.pdf$/, `-s${sida}.png`)
        await el!.screenshot({ path: png as `${string}.png` })
        ut[pdf].push(png)
        sida++
      } while (sida <= sidor)
    }
  } finally {
    await browser.close()
    server.close()
  }
  return ut
}
