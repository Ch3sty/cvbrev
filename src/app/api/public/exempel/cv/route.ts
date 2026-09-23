/**
 * GET /api/public/exempel/cv?mall=norrsken&typsnitt=calibri
 *
 * Exempel-CV:t (Erik Lindberg) i en mall ur registret, som ett eget
 * HTML-dokument för iframen i artiklarnas mallvisning
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, med ägarens
 * justering: mallväljaren och typsnittsvalet stannar, men ingen mallkod
 * skickas till klienten). Samma mallmotor som PDF:en.
 *
 * Svaret är detsamma för alla besökare och cachas ett dygn i CDN:et.
 */
import { getTemplateGenerator, isValidTemplateId } from '@/lib/cv/templates'
import { convertToCVMetadata } from '@/lib/cv/cv-metadata-converter'
import { getFontById, injectFontIntoHTML } from '@/lib/cv/preview-utils'
import { SHOWCASE_CV, SKALA_SKRIPT } from '@/lib/cv/showcase-exempel'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mall = url.searchParams.get('mall') ?? 'norrsken'
  const typsnitt = getFontById(url.searchParams.get('typsnitt') ?? 'calibri')
  if (!isValidTemplateId(mall)) {
    return new Response('Okänd mall', { status: 404 })
  }
  const generator = getTemplateGenerator(mall)
  if (!generator) return new Response('Okänd mall', { status: 404 })
  const html = injectFontIntoHTML(generator.generate(convertToCVMetadata(SHOWCASE_CV), {}), typsnitt.family)
  const medSkala = html.includes('</body>') ? html.replace('</body>', `${SKALA_SKRIPT}</body>`) : html + SKALA_SKRIPT
  return new Response(medSkala, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  })
}
