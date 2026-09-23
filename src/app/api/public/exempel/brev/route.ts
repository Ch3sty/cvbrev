/**
 * GET /api/public/exempel/brev?mall=classic&typsnitt=calibri
 *
 * Exempelbrevet (Maria Johansson) i en av de sex brevmallarna, som ett eget
 * HTML-dokument för iframen i artiklarnas brevvisning. Samma innehåll som
 * InteractiveLetterShowcase ritade i klienten, nu utan klientkod.
 * Cachas ett dygn i CDN:et.
 */
import { getFontById } from '@/lib/cv/preview-utils'
import { BREV_MALLAR, SKALA_SKRIPT, brevHtml, type BrevMallId } from '@/lib/cv/showcase-exempel'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mall = (url.searchParams.get('mall') ?? 'classic') as BrevMallId
  if (!BREV_MALLAR.some((m) => m.id === mall)) {
    return new Response('Okänd mall', { status: 404 })
  }
  const typsnitt = getFontById(url.searchParams.get('typsnitt') ?? 'calibri')
  const html = brevHtml(mall, typsnitt.family).replace('</body>', `${SKALA_SKRIPT}</body>`)
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  })
}
