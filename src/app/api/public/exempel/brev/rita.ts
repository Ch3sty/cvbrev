/**
 * Rutten /api/public/exempel/brev, utan Response: vilket brev, vilken mall
 * och arket som HTML (byggspecen våg 2, avsnitt 2). Egen fil så att testerna
 * kan köra valet och alla 89 exempelbrev utan server.
 *
 * Arket ritas av brevmotorn (renderBrevHtml) och skalas till iframens bredd
 * med SKALA_SKRIPT. Täthetssteget räknas här (uppskattatSteg) och låses med
 * opt.steg, så att motorns passningsskript inte mäter om arket efter att
 * zoomen satts (då blir måtten förminskade och ett långt brev kan få för
 * glest steg). Ingenting under src/lib/letters/brevmall ändras.
 */
import { brevMallDef, renderBrevHtml, uppskattatSteg, type BrevSteg } from '@/lib/letters/brevmall/render'
import { exempelBrev } from '@/lib/letters/brevmall/exempel'
import type { BrevData } from '@/lib/letters/brevmall/typer'
import { SKALA_SKRIPT } from '@/lib/cv/showcase-exempel'
import { exampleData } from '@/app/(public)/personligt-brev-exempel/[yrke]/exempel-data'
import { ARTIKEL_BREV, arArtikelBrevNyckel } from '@/components/mdx/personligt-brev-preview-data'
import { VISARE_MALL_IDS, brevDataFranFalt, type PubliktBrevFalt } from '@/components/publikt/brevvisare/visare-data'

/**
 * De sex gamla uppställningarna (classic till twocolumn). Cachade artiklar
 * pekar på dem i minst en vecka efter våg 2, så de svarar med Linne.
 */
export const GAMLA_MALL_IDS = ['classic', 'sidebar', 'minimal', 'compact', 'centered', 'twocolumn'] as const

/** Mallen ur parametern: en av de fem, gamla id:n ger Linne, ingen parameter ger Linne. Okänd ger null. */
export function valdMall(param: string | null): string | null {
  if (param === null || param === '') return VISARE_MALL_IDS[0]
  if ((VISARE_MALL_IDS as readonly string[]).includes(param)) return param
  if ((GAMLA_MALL_IDS as readonly string[]).includes(param)) return VISARE_MALL_IDS[0]
  return null
}

/** Exempelsidans brev för ett yrke, eller null om yrket inte finns. */
export function exempelsidansBrev(slug: string, datum: string): BrevData | null {
  if (!Object.prototype.hasOwnProperty.call(exampleData, slug)) return null
  const b = (exampleData as Record<string, { exempelBrev?: PubliktBrevFalt }>)[slug]?.exempelBrev
  return b ? brevDataFranFalt(b, datum) : null
}

/** Ett av artiklarnas sex brev, eller null. */
export function artikelnsBrev(nyckel: string, datum: string): BrevData | null {
  return arArtikelBrevNyckel(nyckel) ? brevDataFranFalt(ARTIKEL_BREV[nyckel], datum) : null
}

/**
 * Brevet ur parametrarna: slug (exempelsidorna), nyckel (artiklarnas sex)
 * eller motorns eget exempelbrev när ingen av dem finns. Okänd slug eller
 * nyckel ger null.
 */
export function valtBrev(sp: URLSearchParams, datum: string): BrevData | null {
  const slug = sp.get('slug')
  if (slug !== null) return exempelsidansBrev(slug, datum)
  const nyckel = sp.get('nyckel')
  if (nyckel !== null) return artikelnsBrev(nyckel, datum)
  return exempelBrev('normal')
}

/** Steget som låses i arket. */
export function lastSteg(mall: string, data: BrevData): BrevSteg {
  return uppskattatSteg(brevMallDef(mall), data)
}

/** Arket som HTML, skalat till iframens bredd. */
export function ritaArk(mall: string, data: BrevData): string {
  return renderBrevHtml(mall, data, {}, { steg: lastSteg(mall, data) }).replace('</body>', `${SKALA_SKRIPT}</body>`)
}

/** Hela valet: 404 för okänd mall, slug eller nyckel, annars arket. */
export function svaraBrev(sp: URLSearchParams, datum: string): { status: 200; html: string } | { status: 404; fel: string } {
  const mall = valdMall(sp.get('mall'))
  if (!mall) return { status: 404, fel: 'Okänd mall' }
  const data = valtBrev(sp, datum)
  if (!data) return { status: 404, fel: 'Okänt brev' }
  return { status: 200, html: ritaArk(mall, data) }
}
