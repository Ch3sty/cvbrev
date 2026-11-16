/**
 * Helskärmens sidor (skissen yta 3, V4b): den riktiga PDF:en, sida för sida,
 * som bilder.
 *
 * Sidindelningen i helskärmen ska vara exakt den i den nedladdade filen. Den
 * görs därför inte om i webbläsaren: CV:t går genom samma kedja som
 * nedladdningen (renderaMallPdf med createSwedishCVPDF, samma brytregler, samma
 * steg i "Få plats på en sida") och varje sida i PDF:en ritas med pdf.js till
 * en webp-bild. Bilder och inte PDF:en själv, så att helskärmen aldrig blir en
 * väg runt nedladdningens konto och spärrar.
 *
 * Ingen initial i en tom fotoplats (forhandsvisning), fast arket visar den:
 * filen har ingen, och initialens ruta flyttar brytningarna i fotomallarna
 * (Granit: huvudbandet blir högre och Språk hamnar på sida 2). Helskärmen
 * visar filen.
 */
import type { CVMetadata } from '../cv-metadata'
import type { MallVal } from './kontrakt'
import { renderaMallPdf } from './pdf'
import { createSwedishCVPDF } from './pdf-kedja'

/** Bildbredden i pixlar: skarp i helskärmen på telefon och dator, också med zoomen. */
export const SIDBILD_BREDD = 1600
/** Fler sidor än så ritas inte (ett CV på fyra sidor är redan för långt). */
const MAX_SIDOR = 6

export interface Sidbilder {
  /** Sidorna i PDF:en. */
  sidor: number
  /** En data-url (image/webp) per sida, högst MAX_SIDOR. */
  bilder: string[]
  /** Sidans höjd per bredd (A4). */
  kvot: number
  /** Steget i "Få plats på en sida", om valet användes. */
  steg?: number
}

export async function renderaSidbilder(cv: CVMetadata, mallId: string, val: MallVal): Promise<Sidbilder | null> {
  const resultat = await renderaMallPdf(cv, mallId, val, (html) => createSwedishCVPDF(html, cv, mallId))
  if (!resultat) return null
  const { bilder, kvot } = await ritaSidor(resultat.pdf)
  return { sidor: resultat.sidor, bilder, kvot, steg: resultat.steg }
}

/** PDF:ens sidor som webp, med pdf.js och @napi-rs/canvas (samma väg som vision-fallback). */
export async function ritaSidor(pdf: Buffer | Uint8Array, bredd = SIDBILD_BREDD): Promise<{ bilder: string[]; kvot: number }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { createCanvas } = await import('@napi-rs/canvas')
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(pdf),
    useSystemFonts: false,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise
  const bilder: string[] = []
  let kvot = 297 / 210
  try {
    for (let s = 1; s <= Math.min(doc.numPages, MAX_SIDOR); s++) {
      const sida = await doc.getPage(s)
      const bas = sida.getViewport({ scale: 1 })
      kvot = bas.height / bas.width
      const vp = sida.getViewport({ scale: bredd / bas.width })
      const canvas = createCanvas(Math.round(vp.width), Math.round(vp.height))
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      await sida.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport: vp } as never).promise
      const webp = await canvas.encode('webp', 82)
      bilder.push(`data:image/webp;base64,${Buffer.from(webp).toString('base64')}`)
      sida.cleanup()
    }
  } finally {
    await doc.destroy()
  }
  return { bilder, kvot }
}
