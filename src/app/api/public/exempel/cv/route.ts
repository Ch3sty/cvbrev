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
 * Helskärmens sidor för samma adress: ./sidor.
 */
import { SKALA_SKRIPT } from '@/lib/cv/showcase-exempel'
import { renderMallHtml } from '@/lib/cv/mallar/render/html'
import { exempelUrAdress } from './exempel-cv'

export async function GET(request: Request) {
  const e = exempelUrAdress(new URL(request.url).searchParams)
  if (!e.ok) return new Response(e.text, { status: e.status })

  const html = renderMallHtml(e.cv, e.mall, e.val, { forhandsvisning: true })
  const medSkala = html.includes('</body>') ? html.replace('</body>', `${SKALA_SKRIPT}</body>`) : html + SKALA_SKRIPT
  return new Response(medSkala, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  })
}
