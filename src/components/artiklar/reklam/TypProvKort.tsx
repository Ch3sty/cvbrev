/**
 * Provkortet per testtyp (SEO-planen för de nya testerna 2026-11-10,
 * avsnitt 5.1): samma kort och mätning som ProvKort, men knappen går till
 * typens nivåtest (eller Nivåkollen) via kontot, och den andra länken till
 * typens prov. Används i MDX som <TypProvKort typ="talserie" />.
 *
 * Kortet ersätter klustrets automatiska matriskort när artikeln skriver
 * <TypProvKort ... ersatterProvkort /> (se injectClusterCta). Det inbäddade
 * provet utan konto läggs till senare av produktsidan och ersätter då kortet.
 *
 * Gratis före pris, priset ur PLANS, aldrig stanine, aldrig "officiellt".
 * Facit visas inte: bilden är en uppgift utan markerat svar.
 */

import Link from 'next/link'
import type { CtaCluster } from '@/lib/cta/clusters'
import { KLUSTER_RUM } from '@/components/publikt/innehall/artikel-kluster'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { SpatialSvg } from '@/lib/spatialV1/ritare'
import type { KubFigur } from '@/lib/spatialV1/types'
import { nivakollHref, ovningsprovHref } from '@/lib/traning/rutter'

export type ProvKortTyp = 'deduktiv' | 'talserie' | 'spatial' | 'ordforrad' | 'iprov'

const KORT_PRIS = `${paketKort()}, ${prisPeriod(SALD_PLAN)}`

/** Kontot först, sedan sidan i testerna. sakerRedirect släpper igenom relativa sökvägar. */
const viaKonto = (sokvag: string) => `/register?redirect=${encodeURIComponent(sokvag)}`

interface TypCopy {
  etikett: string
  rubrik: string
  text: string
  knapp: string
  href: string
  sekundar: { text: string; href: string }
  paketrad: string
}

export const TYP_PROVKORT: Record<ProvKortTyp, TypCopy> = {
  deduktiv: {
    etikett: 'Öva deduktivt',
    rubrik: 'Deduktivt test med lösningen efter varje svar',
    text: 'Börja med Nivåkollen i deduktivt. Den är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt.',
    knapp: 'Gör Nivåkollen i deduktivt',
    href: viaKonto(nivakollHref('deduktiv')),
    sekundar: { text: 'Övningsprovet mot klockan', href: viaKonto(ovningsprovHref('deduktiv')) },
    paketrad: `Pass varje dag, avancerad och expert och övningsprovet mot klockan ingår i ${KORT_PRIS}.`,
  },
  talserie: {
    etikett: 'Öva talserier',
    rubrik: 'Talserier i tre nivåer, med lösning efter varje rad',
    text: 'Grundnivån är gratis med konto: femton talserier på tolv minuter och genomgång av varje rad. Sedan två luckor som i I-provet.',
    knapp: 'Gör nivåtestet i talserier',
    href: viaKonto('/dashboard/tester/talserier-grund'),
    sekundar: { text: 'I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Avancerad och expert, pass varje dag och I-provets övningsprov ingår i ${KORT_PRIS}.`,
  },
  spatial: {
    etikett: 'Öva spatial förmåga',
    rubrik: 'Vridna figurer, pappersvikning och tärningar',
    text: 'Grundnivån i spatial förmåga är gratis med konto: femton uppgifter på tolv minuter och genomgång av varje figur.',
    knapp: 'Gör nivåtestet i spatial förmåga',
    href: viaKonto('/dashboard/tester/spatial-grund'),
    sekundar: { text: 'I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Avancerad och expert, pass varje dag och I-provets övningsprov ingår i ${KORT_PRIS}.`,
  },
  ordforrad: {
    etikett: 'Öva ordförståelse',
    rubrik: 'Synonymer och motsatsord i tre nivåer',
    text: 'Grundnivån är gratis med konto: tjugo ord på åtta minuter, och efteråt betydelsen och en exempelmening för varje ord.',
    knapp: 'Gör nivåtestet i ordförråd',
    href: viaKonto('/dashboard/tester/ordforrad-grund'),
    sekundar: { text: 'I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Avancerad och expert, pass varje dag och I-provets övningsprov ingår i ${KORT_PRIS}.`,
  },
  iprov: {
    etikett: 'Öva inför I-provet',
    rubrik: 'Alla sex deltester, i provets ordning',
    text: 'Grundnivån i synonymer och motsatsord, talserier och spatial förmåga är gratis med konto. Övningsprovet med tid per deltest ingår i Premium.',
    knapp: 'Börja med grundnivån gratis',
    href: viaKonto('/dashboard/tester'),
    sekundar: { text: 'Se I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Halva och hela I-provets övningsprov, alla nivåer och pass varje dag ingår i ${KORT_PRIS}.`,
  },
}

/* --------------------------------------------------------------- bilderna */

/** En egen tärning, inte ur banken. Tre symboler som ser likadana ut åt alla håll (krysset används inte, se NIVAER_C). */
const KUB: KubFigur = {
  kind: 'kub',
  t: { symbol: 'stjarna', riktning: 0 },
  l: { symbol: 'ring', riktning: 0 },
  r: { symbol: 'fkvadrat', riktning: 0 },
}

function Bild({ typ }: { typ: ProvKortTyp }) {
  if (typ === 'spatial') {
    return (
      <div className="ib-typbild ib-typbild-fig matrisyta" aria-hidden="true">
        <SpatialSvg fig={KUB} />
      </div>
    )
  }
  if (typ === 'talserie') {
    return (
      <div className="ib-typbild" aria-hidden="true">
        <div className="ib-typrad">
          {['11', '90', '15', '84', '19', '78', '?', '?'].map((t, i) => (
            <span key={i} className={t === '?' ? 'ib-typlucka' : undefined}>
              {t}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (typ === 'ordforrad') {
    return (
      <div className="ib-typbild" aria-hidden="true">
        <p className="ib-typpremiss">Synonym</p>
        <p className="ib-typord">ENTYDIG</p>
        <div className="ib-typalt">
          {['klar', 'ensam', 'lugn', 'bred', 'saklig'].map((o) => (
            <span key={o}>{o}</span>
          ))}
        </div>
      </div>
    )
  }
  if (typ === 'deduktiv') {
    return (
      <div className="ib-typbild" aria-hidden="true">
        <p className="ib-typpremiss">Alla som gått kursen får ett intyg. Omar har inget intyg.</p>
        <p className="ib-typpastaende">Vad måste gälla?</p>
        <ol className="ib-typlista">
          {['Omar har inte gått kursen.', 'Alla med intyg har gått kursen.', 'Omar har gått kursen.', 'Någon utan intyg har gått kursen.'].map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
      </div>
    )
  }
  return (
    <div className="ib-typbild" aria-hidden="true">
      <ol className="ib-typdelar">
        {['Synonymer', 'Pappersvikning', 'Talserier', 'Motsatsord', 'Tärningar', 'Vikning med klipp'].map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ol>
    </div>
  )
}

export default function TypProvKort({ typ, cluster, slug }: { typ: ProvKortTyp; cluster: CtaCluster; slug: string }) {
  const c = TYP_PROVKORT[typ]
  return (
    <aside
      className={`not-prose ib-prova pub-rum-${KLUSTER_RUM[cluster]}`}
      aria-label={c.etikett}
      data-cta-position="inline"
      data-cta-cluster={cluster}
      data-cta-variant={`prov-${typ}`}
      data-cta-slug={slug}
    >
      <div>
        <p className="pub-kick">{c.etikett}</p>
        <p className="ib-rub">{c.rubrik}</p>
        <p className="ib-prova-text">{c.text}</p>
        <div className="pub-handling">
          <Link href={c.href} data-cta={`article-inline-${cluster}`} data-cta-klick={c.href} className="pub-knapp">
            {c.knapp}
          </Link>
          <Link href={c.sekundar.href} data-cta-klick={c.sekundar.href} className="pub-lank">
            {c.sekundar.text}
          </Link>
        </div>
        <p className="pub-liten">{c.paketrad}</p>
      </div>
      <div className="ib-prova-sida">
        <Bild typ={typ} />
      </div>
    </aside>
  )
}
