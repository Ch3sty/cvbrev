/**
 * Brevrummets mallar. Vyerna importerar mallväljaren dynamiskt:
 *
 *   const MallValjare = dynamic(() => import('@/components/brev3/mallar/MallValjare'), { ssr: false })
 *
 * Övrigt härifrån är klientsäkert (ingen serverkod; rita.server.ts importeras
 * bara av sidan och rutten).
 */
export type { MallValjareProps } from './MallValjare'
export { mallarKatalog, passarFilter, MALL_FILTER, type MallarKort, type MallFilter } from './filter'
export { forhandsvisa, forhandsvisaFlera, sparaVal, laddaNerBrev, markeraKopierat, EXEMPEL_ID, MallarFel, type Filformat } from './klient'
export { MALLAR_TEXT } from './text'
