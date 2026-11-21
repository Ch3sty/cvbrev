/**
 * Träningsfokus på Översikt: texten och länken för träningens nästa steg
 * (traningsHandling i lib/intervju/nasta.ts). Samma ord och mål som dagens
 * Nästa handling; bara formen är ny (väggens rubrik och primärknapp).
 */
import { GRUNDTEST_HREF, nyttProvHref } from '@/lib/intervju/lankar'
import { getTestConfig, testPaths } from '@/app/dashboard/tester/testConfig'
import { nar, type TraningsHandling } from '@/lib/intervju/nasta'
import { HEM } from '@/app/dashboard/intervju/infor-intervjun-copy'

export type TraningsSteg = TraningsHandling

export interface TraningsKopia {
  rubrik: string
  text: string
  href: string
  knapp: string
}

export function traningsKopia(a: TraningsSteg): TraningsKopia {
  switch (a.kind) {
    case 'interview-rewrite':
      return {
        rubrik: HEM.omskrivning.rubrik(a.prov.question),
        text: HEM.omskrivning.text(a.prov.level, nar(a.prov.createdAt), a.prov.missingKind, a.prov.question),
        href: nyttProvHref(a.prov.question),
        knapp: HEM.omskrivning.knapp,
      }
    case 'personality-full':
      return { rubrik: HEM.helaTestet.rubrik, text: HEM.helaTestet.text, href: GRUNDTEST_HREF, knapp: HEM.helaTestet.knapp }
    case 'interview-new':
      return {
        rubrik: HEM.traning.nyFraga.rubrik(a.fraga),
        text: HEM.traning.nyFraga.text(a.fraga),
        href: nyttProvHref(a.fraga),
        knapp: HEM.traning.nyFraga.knapp,
      }
    case 'test-next': {
      const titel = getTestConfig(a.slug)?.title ?? ''
      return {
        rubrik: a.forsta ? HEM.traning.test.forstaRubrik : HEM.traning.test.rubrik(titel),
        text: a.forsta ? HEM.traning.test.forstaText : HEM.traning.test.text,
        href: testPaths.hub(a.slug),
        knapp: HEM.traning.test.knapp,
      }
    }
  }
}
