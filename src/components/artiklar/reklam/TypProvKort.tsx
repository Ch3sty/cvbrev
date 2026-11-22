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

import type { CtaCluster } from '@/lib/cta/clusters'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { SpatialSvg } from '@/lib/spatialV1/ritare'
import type { KubFigur } from '@/lib/spatialV1/types'
import { nivakollHref, ovningsprovHref } from '@/lib/traning/rutter'
import TestBredd from '@/components/publikt/TestBredd'
import { Knapp, TextLank } from '@/components/publikt/v3'
import { ReklamRuta } from './ArtikelReklam'

/*
 * Publikt omgång 3 (skissen artikelreklam, beslut 9): provkorten får rutans
 * form i testernas färg. Nio-raden under texten utgår som i provkortet;
 * typens bild står på ett papper i rutan.
 */

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
    text: 'Börja med nivåtestet i deduktivt. Det är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt.',
    knapp: 'Gör nivåtestet i deduktivt',
    href: viaKonto(nivakollHref('deduktiv')),
    sekundar: { text: 'Övningsprovet mot klockan', href: viaKonto(ovningsprovHref('deduktiv')) },
    paketrad: `Avancerad och expertnivå, träning så ofta du vill och övningsprovet mot klockan ingår i ${KORT_PRIS}.`,
  },
  talserie: {
    etikett: 'Öva talserier',
    rubrik: 'Talserier i tre nivåer, med lösning efter varje rad',
    text: 'Grundnivån är gratis med konto: femton talserier på tolv minuter och genomgång av varje rad. Sedan två luckor som i I-provet.',
    knapp: 'Gör grundnivån i talserier',
    href: viaKonto('/dashboard/tester/talserier-grund'),
    sekundar: { text: 'I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Avancerad och expertnivå, träning så ofta du vill och I-provets övningsprov ingår i ${KORT_PRIS}.`,
  },
  spatial: {
    etikett: 'Öva spatial förmåga',
    rubrik: 'Vridna figurer, pappersvikning, tärningar och kroppar',
    text: 'Grundnivån i spatial förmåga är gratis med konto: femton uppgifter på tolv minuter och genomgång av varje figur.',
    knapp: 'Gör grundnivån i spatial förmåga',
    href: viaKonto('/dashboard/tester/spatial-grund'),
    sekundar: { text: 'I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Avancerad och expertnivå, träning så ofta du vill och I-provets övningsprov ingår i ${KORT_PRIS}.`,
  },
  ordforrad: {
    etikett: 'Öva ordförståelse',
    rubrik: 'Synonymer och motsatsord i tre nivåer',
    text: 'Grundnivån är gratis med konto: tjugo ord på åtta minuter, och efteråt betydelsen och en exempelmening för varje ord.',
    knapp: 'Gör grundnivån i ordförråd',
    href: viaKonto('/dashboard/tester/ordforrad-grund'),
    sekundar: { text: 'I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Avancerad och expertnivå, träning så ofta du vill och I-provets övningsprov ingår i ${KORT_PRIS}.`,
  },
  iprov: {
    etikett: 'Öva inför I-provet',
    rubrik: 'Alla sex deltester, i provets ordning',
    text: 'Grundnivån i synonymer och motsatsord, talserier och spatial förmåga är gratis med konto. Övningsprovet med tid per deltest ingår i Premium.',
    knapp: 'Börja med grundnivån gratis',
    href: viaKonto('/dashboard/tester'),
    sekundar: { text: 'Se I-provet, övningsprov', href: viaKonto('/dashboard/tester/iprov') },
    paketrad: `Halva och hela I-provets övningsprov, avancerad och expertnivå och träning så ofta du vill ingår i ${KORT_PRIS}.`,
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
    // Det deduktiva motivet i bild (S12, art-director A2): två villkorsrader
    // som streck och en remsa med fyra platser, svaret i koppar.
    return (
      <div className="ib-typbild ib-ded" aria-hidden="true">
        <svg viewBox="0 0 170 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 18h92M14 36h62" strokeWidth="5" opacity=".7" />
          <rect x="10" y="60" width="150" height="46" rx="10" strokeWidth="4" />
          <path d="M47.5 60v46M85 60v46M122.5 60v46" strokeWidth="3" opacity=".5" />
          <rect x="21.75" y="76" width="14" height="14" rx="3" fill="currentColor" stroke="none" />
          <rect x="59.25" y="76" width="14" height="14" rx="3" fill="currentColor" stroke="none" />
          <rect x="93.75" y="72" width="20" height="22" rx="5" fill="var(--koppar)" stroke="none" />
          <rect x="134.25" y="76" width="14" height="14" rx="3" fill="currentColor" stroke="none" />
        </svg>
        <p>Vad måste gälla?</p>
      </div>
    )
  }
  // I-provet: Nio-rutnätet med provets tre typer markerade (S12). Ordförråd
  // täcker synonymer och motsatsord, spatial pappersvikning, tärningar och
  // vikning med klipp, talserier det sjätte; captionen bär talet.
  return (
    <div className="ib-typbild">
      <TestBredd
        form="rutnat"
        markerade={['ordforrad', 'spatial', 'talserier']}
        text="Sex deltester, tre testtyper"
        label="Åtta testtyper och personlighetstestet, I-provets tre markerade: ordförråd, spatial förmåga och talserier"
      />
    </div>
  )
}

export default function TypProvKort({ typ, cluster, slug }: { typ: ProvKortTyp; cluster: CtaCluster; slug: string }) {
  const c = TYP_PROVKORT[typ]
  return (
    <ReklamRuta
      farg="tran"
      ikon="tran"
      etikett={c.etikett}
      rubrik={c.rubrik}
      ariaLabel={c.etikett}
      data={{
        'data-cta-position': 'inline',
        'data-cta-cluster': cluster,
        'data-cta-variant': `prov-${typ}`,
        'data-cta-slug': slug,
      }}
      // I-provets rutnät har en caption som läses; övriga bilder är aria-hidden själva.
      bildSynlig={typ === 'iprov'}
      bild={
        <div className="ar-typbild">
          <Bild typ={typ} />
        </div>
      }
      brod={c.text}
      knappar={
        <>
          <Knapp href={c.href} pil data-cta={`article-inline-${cluster}`} data-cta-klick={c.href}>
            {c.knapp}
          </Knapp>
          <TextLank href={c.sekundar.href} data-cta-klick={c.sekundar.href}>
            {c.sekundar.text}
          </TextLank>
        </>
      }
      paket={c.paketrad}
    />
  )
}
