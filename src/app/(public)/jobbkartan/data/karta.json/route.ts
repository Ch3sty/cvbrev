/**
 * Jobbkartans data för webbläsaren: översikten och länsgeometrin, samma objekt som sidan ritar
 * hjältekartan av. Låg tidigare som prop till JobbkartanKlient och följde därför med i varje
 * HTML-svar som RSC-data (cirka 40 kB). Nu hämtar klienten den här filen efter första bilden,
 * och CDN:et och webbläsaren kan cacha den mellan besöken. Samma ISR som sidan.
 *
 * Platsannonserna (dagens tal, några hundra byte) följer fortfarande med sidan, så att kartans
 * annonskort alltid visar samma tal som hjältens text.
 */
import { FJALL, GEO, OVERSIKT, type JobbkartanKartdata } from '@/lib/jobbkartan/data'

export const revalidate = 86400

export function GET() {
  const data: JobbkartanKartdata = { ...OVERSIKT, geo: GEO, fjall: FJALL }
  return Response.json(data, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31449600' },
  })
}
