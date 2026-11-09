/**
 * Publika sidor som är flöden i flödesskalet (PubliktFlodesskal) i stället
 * för vanliga sidor: ingen publik meny, ingen sidfot. Skissen
 * docs/design/skiss-prov-konto-2026-11-09.html: provet är en väg till konto,
 * menyn är en väg ut.
 */

export const PROVA_PATH = '/verktyg/rekryteringstester/prova'

export function arFlodessida(pathname: string | null | undefined): boolean {
  return pathname === '/register' || pathname === '/login' || pathname === PROVA_PATH
}
