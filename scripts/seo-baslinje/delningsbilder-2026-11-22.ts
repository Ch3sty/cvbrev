// scripts/seo-baslinje/delningsbilder-2026-11-22.ts
// Skriver delningsbilder-2026-11-22-undantag.json ur baslinjen mot live
// (docs/qa/seo-diff/publikt-omgang3-efter-live-6.json), så att ingen rad
// skrivs för hand.
//
//   OG_BILD_BYTT  varje sida vars og:image är en WebP: exakt ny adress är
//                 JPG-systern (src/lib/delningsbild.ts), och filen måste finnas.
//   META_TILLAGD  varje sida utan og:image: den nya ska vara sidans egen
//                 opengraph-image.
//
// Kör: node node_modules/tsx/dist/cli.mjs scripts/seo-baslinje/delningsbilder-2026-11-22.ts

import fs from 'node:fs'
import path from 'node:path'
import { delningsbildSrc } from '../../src/lib/delningsbild'

const BASLINJE = 'docs/qa/seo-diff/publikt-omgang3-efter-live-6.json'
const UT = 'scripts/seo-baslinje/delningsbilder-2026-11-22-undantag.json'
const DATUM = '2026-11-22'

type Sida = { path: string; status: number; ogImage: string }
const sidor = JSON.parse(fs.readFileSync(BASLINJE, 'utf8')) as Sida[]
const norm = (v: string) => v.split('?')[0].replace(/^https?:\/\/[^/]+/, '')

const skalWebp = (p: string) =>
  p.startsWith('/artiklar/')
    ? 'og:image och twitter:image pekade på artikelbildens WebP utan mått, och en artikel delad i en Facebook-grupp kom utan bild. Nu JPG-systern i 1200 × 630 med width, height, type och imageAlt (scripts/artikelbild/delningsbild.ts). Samma motiv; JSON-LD och bilden på sidan behåller WebP.'
    : 'og:image pekade på en WebP utan mått, som Facebook och LinkedIn inte visar säkert. Nu JPG-systern i 1200 × 630 med width, height och type (scripts/artikelbild/delningsbild.ts). Samma motiv.'

const OG_BILD_BYTT = sidor
  .filter((s) => s.status === 200 && /\.webp$/.test(norm(s.ogImage ?? '')))
  .map((s) => {
    const gammal = norm(s.ogImage)
    const ny = delningsbildSrc(gammal)
    if (!fs.existsSync(path.join('public', ny))) throw new Error(`${s.path}: ${ny} finns inte, kör scripts/artikelbild/delningsbild.ts`)
    return { path: s.path, gammal, ny, datum: DATUM, skal: skalWebp(s.path) }
  })

const META_TILLAGD = sidor
  .filter((s) => s.status === 200 && !s.ogImage)
  .map((s) => ({
    path: s.path,
    falt: 'ogImage',
    efterBorjar: `${s.path}/opengraph-image`,
    datum: DATUM,
    skal: 'Sidan saknade og:image. Nu en egen opengraph-image.tsx i segmentet efter syskonens mönster (OgFrame med sidans egen rubrik).',
  }))

const fil = {
  _om:
    'Delningsbilderna 2026-11-22. Raderna är framtagna av scripts/seo-baslinje/delningsbilder-2026-11-22.ts ur docs/qa/seo-diff/publikt-omgang3-efter-live-6.json. OG_BILD_BYTT tillåter bara att og:image byts från exakt den gamla WebP-adressen till exakt dess JPG-syster; META_TILLAGD bara att en saknad og:image blir sidans egen opengraph-image. Läses av scripts/seo-diff-artiklar.ts.',
  OG_BILD_BYTT,
  META_TILLAGD,
}

fs.writeFileSync(UT, JSON.stringify(fil, null, 2) + '\n')
console.log(`${UT}: OG_BILD_BYTT ${OG_BILD_BYTT.length} (artiklar ${OG_BILD_BYTT.filter((r) => r.path.startsWith('/artiklar/')).length}), META_TILLAGD ${META_TILLAGD.length}`)
