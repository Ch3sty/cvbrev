/**
 * GET /api/public/exempel/cv?mall=<id>&typsnitt=<id>&farg=<0-3>&ordning=<val>
 *     &uppsattning=<id> (eller rubriker=<id>)&yrke=<slug>&foto=<0|1>
 *
 * Exempel-CV:t i en mall, som ett eget HTML-dokument för iframen i
 * artiklarnas mallvisning, mallsidorna och yrkessidorna (aldrig mallmotorn
 * i klienten). Samma renderare som PDF:en. Gamla mall-id löses med alias.
 *
 *  - utan yrke: Erik Lindberg (SHOWCASE_CV), rubrikerna ur hans titel,
 *  - med yrke: yrkessidans exempel-CV (Anna Lindström med yrkets titel och
 *    kompetenser) och rubrikuppsättningen för yrket.
 *
 * Namnet, titeln och rubrikerna har data-falt och data-sektion, så att
 * iframen kan byta text direkt i contentDocument (samma ursprung).
 *
 * Svaret är detsamma för alla besökare och cachas ett dygn i CDN:et.
 */
import { convertToCVMetadata } from '@/lib/cv/cv-metadata-converter'
import { SHOWCASE_CV, SKALA_SKRIPT } from '@/lib/cv/showcase-exempel'
import { losMallId } from '@/lib/cv/mallar/alias'
import { FORVALD_MALL_ID } from '@/lib/cv/mallar/katalog'
import { tolkaValUrQuery } from '@/lib/cv/mallar/val'
import { renderMallHtml } from '@/lib/cv/mallar/render/html'
import { uppsattningForTitel } from '@/lib/cv/rubriker'
import { YRKESMALL_LIST } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { buildYrkesmallExempelCV } from '@/app/(public)/cv-mallar/[yrke]/YrkesmallExempelData'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mall = losMallId(url.searchParams.get('mall') ?? FORVALD_MALL_ID)
  if (!mall) return new Response('Okänd mall', { status: 404 })

  const val = tolkaValUrQuery(url.searchParams)
  const slug = url.searchParams.get('yrke')
  let exempel = SHOWCASE_CV as Parameters<typeof convertToCVMetadata>[0]
  if (slug) {
    const yrke = YRKESMALL_LIST.find((y) => y.slug === slug)
    if (!yrke) return new Response('Okänt yrke', { status: 404 })
    exempel = buildYrkesmallExempelCV(yrke.namn, yrke.kompetenser)
    if (!val.uppsattning && !val.rubriker) val.uppsattning = uppsattningForTitel(yrke.namn)
  }

  const html = renderMallHtml(convertToCVMetadata(exempel), mall, val, { forhandsvisning: true })
  const medSkala = html.includes('</body>') ? html.replace('</body>', `${SKALA_SKRIPT}</body>`) : html + SKALA_SKRIPT
  return new Response(medSkala, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  })
}
