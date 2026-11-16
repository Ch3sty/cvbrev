/**
 * Mallens PDF med "Få plats på en sida" (granskningen G7, server).
 *
 * Utan valet: en rendering. Med valet: först utan krympning (ryms CV:t gör
 * valet ingenting), sedan steg 1 till 5 (farg.ts, matt) i tur och ordning
 * tills PDF:en blir en sida; når den inte dit efter steg 5 blir
 * det två sidor, utan varning i filen. Steget som användes returneras, så
 * att Word-filen kan byggas med samma mått.
 */
import type { CVMetadata } from '../cv-metadata'
import type { MallVal } from './kontrakt'
import { EN_SIDA_STEG } from './farg'
import { renderaMallHtml } from '../rendera-mall-html'

/** Antalet sidor i en PDF från Chrome. */
export function antalSidor(pdf: Buffer | Uint8Array): number {
  const text = Buffer.from(pdf).toString('latin1')
  return (text.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length
}

export interface MallPdf {
  pdf: Buffer
  sidor: number
  /** Steget i "Få plats på en sida" som användes, eller undefined utan valet. */
  steg?: 1 | 2 | 3 | 4 | 5
}

/**
 * `skrivPdf` är PDF-kedjan (generate-formatted skickar sin med reservväg,
 * skripten generateSwedishCVPDF).
 */
export async function renderaMallPdf(
  cv: CVMetadata,
  mallId: string,
  val: MallVal,
  skrivPdf: (html: string) => Promise<Buffer>
): Promise<MallPdf | null> {
  if (!val.enSida) {
    const html = renderaMallHtml(cv, mallId, val)
    if (!html) return null
    const pdf = await skrivPdf(html)
    return { pdf, sidor: antalSidor(pdf) }
  }
  // Ryms CV:t redan på en sida gör valet ingenting (UX U5).
  const bas = renderaMallHtml(cv, mallId, { ...val, enSida: false })
  if (!bas) return null
  const basPdf = await skrivPdf(bas)
  if (antalSidor(basPdf) <= 1) return { pdf: basPdf, sidor: 1 }
  let senast: MallPdf | null = null
  for (let s = 1; s <= EN_SIDA_STEG; s++) {
    const steg = s as 1 | 2 | 3 | 4 | 5
    const html = renderaMallHtml(cv, mallId, { ...val, enSidaSteg: steg })
    if (!html) return null
    const pdf = await skrivPdf(html)
    senast = { pdf, sidor: antalSidor(pdf), steg }
    if (senast.sidor <= 1) break
  }
  return senast
}
