/**
 * Piloten i SEO-svepet 2026-11-17 (docs/plan-seo-cv-kluster-2026-11-17.md, B3):
 * fem yrkespar där exempelsidan rankar bättre på de delade frågorna slås ihop
 * till /cv-exempel/<slug>. Yrkesmallsidan 308:ar dit (next.config.ts). Egen
 * liten fil så att klientkomponenter kan läsa listan utan yrkesmalldatan.
 */
export const PILOT_SAMMANSLAGNA = ['saljare', 'butikssaljare', 'barnskotare', 'ingenjor', 'larare'] as const

export function arPilotSammanslagen(slug: string): boolean {
  return (PILOT_SAMMANSLAGNA as readonly string[]).includes(slug)
}
