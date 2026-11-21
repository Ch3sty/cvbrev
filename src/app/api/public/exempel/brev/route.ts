/**
 * GET /api/public/exempel/brev?mall=koppar&slug=projektledare
 *
 * Ett personligt brev i en av mallvisarens fem mallar (Linne, Björk, Koppar,
 * Kalksten, Granit), ritat av brevmotorn som ett eget HTML-dokument för
 * iframen i mallvisaren (byggspecen våg 2, 2026-11-21). Brevet väljs med
 * slug (exempelsidornas yrke), nyckel (artiklarnas sex brev) eller ingen
 * parameter (motorns exempelbrev). De sex gamla mall-id:na ger Linne, så att
 * cachade artiklar fortfarande får ett ark. Okänd mall, slug eller nyckel
 * ger 404. Valet och ritningen står i rita.ts. Cachas ett dygn i CDN:et.
 */
import { idagISverige } from '@/components/publikt/brevvisare/visare-data'
import { svaraBrev } from './rita'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const svar = svaraBrev(url.searchParams, idagISverige())
  if (svar.status === 404) {
    return new Response(svar.fel, { status: 404, headers: { 'X-Robots-Tag': 'noindex' } })
  }
  return new Response(svar.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  })
}
