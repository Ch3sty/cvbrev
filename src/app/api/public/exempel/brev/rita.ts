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
 * De sex gamla uppställningarna (classic till twocolumn), och Kalksten och
 * Granit som var med i visaren innan UX bytte dem mot Ritning och Terrakotta.
 * Cachade sidor kan peka på dem, så de svarar med Linne i stället för 404.
 */
export const GAMLA_MALL_IDS = ['classic', 'sidebar', 'minimal', 'compact', 'centered', 'twocolumn', 'kalksten', 'granit'] as const

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

/**
 * Mallar vars brödtypsnitt är bredare än uppskattningens 0,5 em per tecken
 * (Verdana i Raster och Betong, Poppins i Mörkrum): uppskattningen räknar
 * med textbredden gånger faktorn, så att visaren aldrig väljer glesare steg
 * än produktens mätning (mätningen av 89 brev i 40 mallar 2026-11-21: 10
 * ritningar föll med uppskattningen rakt av, 0 med 0,92).
 */
export const SMALARE_TEXT: Readonly<Record<string, number>> = Object.freeze({ raster: 0.92, betong: 0.92, morkrum: 0.92 })

/** Steget som låses i arket. */
export function lastSteg(mall: string, data: BrevData): BrevSteg {
  const def = brevMallDef(mall)
  const f = Object.prototype.hasOwnProperty.call(SMALARE_TEXT, def.id) ? SMALARE_TEXT[def.id] : undefined
  if (!f) return uppskattatSteg(def, data)
  // Smalare text: högermarginalen ökas så att textbredden blir f gånger. Gränsen (nedre marginalen) är densamma.
  const bredd = 210 - def.sida.vanster - def.sida.hoger
  return uppskattatSteg({ ...def, sida: { ...def.sida, hoger: def.sida.hoger + bredd * (1 - f) } }, data)
}

/**
 * Skalningen utan JavaScript: iframen ärver att skript är av, så SKALA_SKRIPT
 * körs inte. Då skalar en trappa av mediafrågor arket till iframens bredd i
 * steg om 4 px (högst 4 px vitt till höger). Med JavaScript gäller skriptets
 * exakta zoom, och noscript-stilen läses inte.
 */
export const SKALA_UTAN_JS = (() => {
  const regler: string[] = []
  for (let b = 160; b < 794; b += 4) regler.push(`@media (min-width:${b}px){html{zoom:${(b / 794).toFixed(4)}}}`)
  regler.push('@media (min-width:794px){html{zoom:1}}')
  return `<noscript><style>${regler.join('')}</style></noscript>`
})()

/** Arket som HTML, skalat till iframens bredd (med skript exakt, utan skript i steg). */
export function ritaArk(mall: string, data: BrevData): string {
  return renderBrevHtml(mall, data, {}, { steg: lastSteg(mall, data) })
    .replace('</head>', `${SKALA_UTAN_JS}</head>`)
    .replace('</body>', `${SKALA_SKRIPT}</body>`)
}

/** Hela valet: 404 för okänd mall, slug eller nyckel, annars arket. */
export function svaraBrev(sp: URLSearchParams, datum: string): { status: 200; html: string } | { status: 404; fel: string } {
  const mall = valdMall(sp.get('mall'))
  if (!mall) return { status: 404, fel: 'Okänd mall' }
  const data = valtBrev(sp, datum)
  if (!data) return { status: 404, fel: 'Okänt brev' }
  return { status: 200, html: ritaArk(mall, data) }
}
