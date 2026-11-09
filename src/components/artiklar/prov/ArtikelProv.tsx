/**
 * Uppgift 1 i artikeln (SEO-planen för de nya testerna 4.2, saas-leads
 * slutliga beslut 2026-11-10, våg 1 och 2). I MDX:
 *
 *   <ArtikelProv typ="spatial" />
 *
 * Servern ritar uppgift 1 i artikelns HTML med alternativen synliga, så att
 * Google och besökaren ser att artikeln har ett test. Uppgiften väljs med
 * artikelns fasta frö (samma för alla besökare, samma HTML i cachen) och har
 * inget facit. Ett svar startar provet på sidan; resten av uppgifterna och
 * resultatet följer i samma ruta och slutar i samma kontosteg som
 * /verktyg/rekryteringstester/prova (som förblir noindex).
 *
 * Kortets text är aldrig en rubrik (h2 eller h3): artikelns rubrikträd och
 * snabbsvar ändras inte. Läggs efter första avsnittet, inte före snabbsvaret.
 */

import type { CtaCluster } from '@/lib/cta/clusters'
import { artikelSeedMatris, questionsForToken, toPublicQuestion } from '@/lib/tests/anon-session'
import { BANK_VERSION } from '@/lib/logicTestV7/selectQuestions.v7'
import { arProvTyp, type ProvTyp } from '@/lib/tests/prov-typer'
import { artikelUppgift } from '@/lib/tests/prov-typer.server'
import { MatrisProv, TypProv } from './ArtikelProvKlient'

const TEXT: Partial<Record<ProvTyp, string>> = {
  matris: 'Svara på uppgiften här, så fortsätter provet med fyra till. Rätt svar och regeln bakom visas när provet är hämtat till ett gratiskonto.',
  iprov: 'En uppgift ur vart och ett av I-provets sex deltester, i provets ordning. Svara här, så fortsätter provet. Rätt svar och tekniken visas med ett gratiskonto.',
}
const TEXT_ANNARS = 'Svara på uppgiften här, så fortsätter provet med fyra till. Rätt svar och förklaringen visas när provet är hämtat till ett gratiskonto.'

export default function ArtikelProv({ typ, slug, cluster }: { typ: string; slug: string; cluster?: CtaCluster }) {
  if (!arProvTyp(typ)) return null
  let innehall: React.ReactNode = null
  if (typ === 'matris') {
    const seed = artikelSeedMatris(slug)
    const q = questionsForToken(seed, BANK_VERSION)[0]
    if (!q) return null
    innehall = <MatrisProv slug={slug} forsta={toPublicQuestion(q, seed, true)} />
  } else {
    const a = artikelUppgift(typ, slug)
    if (!a) return null
    innehall = <TypProv typ={typ} slug={slug} forsta={a.uppgift} underlag={a.underlag} />
  }
  return (
    <aside
      className="not-prose art-prov"
      aria-label="Prova testet direkt"
      data-artikel-prov={typ}
      data-cta-position="inline"
      data-cta-cluster={cluster}
      data-cta-variant={`prov-${typ}`}
      data-cta-slug={slug}
    >
      <p className="art-prov-text">{TEXT[typ] ?? TEXT_ANNARS}</p>
      {innehall}
    </aside>
  )
}
