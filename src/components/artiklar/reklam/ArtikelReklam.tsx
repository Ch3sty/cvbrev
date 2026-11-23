/**
 * Reklamkorten i artiklarna och artikellistan, publikt omgång 3 (skissen
 * artikelreklam, docs/design/publikt-omgang3/sidor/artikelreklam.html och
 * noter/artikelreklam.md).
 *
 * Tre platser på en artikel: rutan efter andra stycket (verktyget, gratis
 * först), sidokortet i sidokolumnen (Premium) och slutkortet efter texten
 * (Premium med verktyget i större skala). Jobbsökets kort läggs till efter
 * texten i artiklarna om matchning och uppföljning (JobbKort). Två platser i
 * listan: gratiskortet bland artikelkorten och slutkortet efter
 * pagineringen. Texterna står i reklam-copy.ts.
 *
 * Formen: ett mörkt block i delens färg med klack, och bilden ur produkten
 * ur grunden (testramen, CV-arket, brevet, träffen, vägen till erbjudande,
 * mallminiatyrerna), aria-hidden. Rubrikerna är p, aldrig h2 eller h3, så
 * att de inte hamnar i artikelns rubrikträd. Länkmålen är desamma som
 * förut. Visning och klick mäts av ArtikelKlient via data-cta-position och
 * data-cta-klick, oförändrat. Alla är serverkomponenter.
 */

import type { ReactNode } from 'react'
import type { ArtikelPaket, CtaCluster, InlineVerktyg } from '@/lib/cta/clusters'
import {
  Bocklista,
  Brevpar,
  CvArk,
  Dorr,
  Knapp,
  MallMiniatyr,
  PrisRad,
  Samtal,
  Stig,
  Svav,
  Testram,
  TextLank,
  Traff,
  TraffRad,
  SARA_FLER_TRAFFAR,
  FARG_OVRIGT,
  type Farg,
  type IkonNamn,
} from '@/components/publikt/v3'
import { MATRIS_EXPERT_ALTERNATIV, MATRIS_EXPERT_RUTOR, MatrisFigur } from '@/components/publikt/MatrisExpert'
import { TESTTAL } from '@/components/publikt/testtal'
import TestBredd from '@/components/publikt/TestBredd'
import Bankbredd from '@/components/publikt/Bankbredd'
import { KLUSTER_RUM } from '@/components/publikt/innehall/artikel-kluster'
import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'
import { KampanjPris, KampanjVarianter, MedKampanjPris } from '@/components/kampanj/Kampanj'
import { PremiumOrd } from '@/components/publikt/PremiumBlock'
import {
  GRATIS_KORT,
  INLINE,
  INLINE_PROVA,
  INLINE_RAKNARE,
  JOBB_KORT,
  LANKRAD,
  LISTA_SLUT,
  SIDO,
  SLUT,
  TESTKORT_INTERVJU,
} from './reklam-copy'
import './reklam.css'

type Data = Record<string, string | undefined>

/** Datat som ArtikelKlient läser för visnings- och klickmätningen. */
function matning(position: string, cluster: CtaCluster | 'lista', variant: string): Data {
  return {
    'data-cta-position': position,
    'data-cta-cluster': cluster,
    'data-cta-variant': variant,
  }
}

/** Klustrets färg i grunden (artikelns topp och menyn, beslut 8). */
export function fargForKluster(cluster: CtaCluster): Farg {
  const rum = KLUSTER_RUM[cluster]
  // Inget kluster står i grafit (ägaren 2026-11-22): utan egen del gäller indigo.
  return rum === 'neu' ? FARG_OVRIGT : rum
}

/* ------------------------------------------------------------- rutan */

/**
 * Rutan i skissens form. Bilden står aria-hidden; bildSynlig för en bild
 * med egen text som ska läsas (I-provets rutnät, gratiskortets bredd).
 */
export function ReklamRuta({
  farg,
  ikon,
  etikett,
  rubrik,
  bild,
  bildSynlig,
  brod,
  gratis,
  knappar,
  paket,
  children,
  className = '',
  ariaLabel,
  data,
}: {
  farg?: Farg
  ikon: IkonNamn
  etikett: ReactNode
  rubrik?: ReactNode
  bild?: ReactNode
  bildSynlig?: boolean
  brod?: ReactNode
  gratis?: ReactNode
  knappar?: ReactNode
  paket?: string
  children?: ReactNode
  className?: string
  ariaLabel?: string
  data: Data
}) {
  return (
    <aside className={`not-prose ar-hall ${className}`.trim()} aria-label={ariaLabel} {...data}>
      <div className={`ar-rk ${bild ? '' : 'ar-utan-bild'}`.trim()} data-p3-farg={farg}>
        <div className="ar-huvud">
          <p className="ar-ey">
            <Dorr ikon={ikon} />
            {etikett}
          </p>
          {rubrik ? <p className="ar-rub">{rubrik}</p> : null}
        </div>
        {bild ? (
          <div className="ar-bild" aria-hidden={bildSynlig ? undefined : true}>
            {bild}
          </div>
        ) : null}
        <div className="ar-rest">
          {brod ? <p className="ar-brod">{brod}</p> : null}
          {gratis ? <p className="ar-gratis">{gratis}</p> : null}
          {children}
          {knappar ? <div className="ar-gor">{knappar}</div> : null}
          {paket ? (
            <p className="ar-paket">
              <MedKampanjPris text={paket} />
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

/* -------------------------------------------------------- bilderna */

/** En ruta ur expertuppgiften, med fyllning, som egen ritning i grundens testram. */
function ExpertRuta({ ruta }: { ruta: (typeof MATRIS_EXPERT_RUTOR)[number] }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <MatrisFigur ruta={ruta} streck={4.2} />
    </svg>
  )
}

/**
 * Den riktiga expertuppgiften (MatrisExpert, v7e-plus-p2-17) i grundens
 * testram: brädet och alternativen tar nu egna ritningar med fyllning (P5a,
 * önskemålet från P4). Inget alternativ är valt, facit visas inte.
 */
function ExpertUppgift() {
  return (
    <Testram
      niva="Expertnivå"
      uppgift={1}
      av={TESTTAL.matrisExpert.fragor}
      tid={null}
      knapp={null}
      brade={[...MATRIS_EXPERT_RUTOR.map((r, i) => <ExpertRuta key={i} ruta={r} />), null]}
      svar={MATRIS_EXPERT_ALTERNATIV.map((a) => ({ figur: <ExpertRuta ruta={a.ruta} /> }))}
      ariaLabel="Exempel: en uppgift i matrislogik på expertnivå, som den ser ut i testet"
    />
  )
}

type VerktygMedBild = Exclude<InlineVerktyg, 'raknare' | 'lankrad' | 'test'>

function InlineBild({ verktyg }: { verktyg: VerktygMedBild }) {
  if (verktyg === 'mallar')
    return (
      <div className="ar-mallar">
        <MallMiniatyr id="linne" />
        <MallMiniatyr id="bjork" />
      </div>
    )
  if (verktyg === 'analys') return <CvArk liten poang={{ tal: 93, text: 'av 100 i dag' }} kvar="7 poäng kvar till 100" />
  if (verktyg === 'brev') return <Brevpar stycken={BREVKORT_STYCKEN} />
  return <Samtal />
}

/**
 * Brevkortets bild (seo-slutbesked.md punkt 69 och avsnitt 5): grundens brev
 * (Brevpar, SARA_STYCKEN) kortat, inga nya meriter och inga belopp. Andra
 * meningen har SEO:s lydelse ordagrant.
 */
const BREVKORT_STYCKEN: readonly ReactNode[] = [
  <>När ni söker en projektledare som håller ihop upphandling och tidplan känner jag igen mina senaste tre år.</>,
  <>
    Ni skriver att rollen kräver vana vid <mark>offentlig upphandling enligt LOU</mark>. Jag har drivit fyra sådana.
  </>,
]

const INLINE_FARG: Record<VerktygMedBild, Farg> = {
  mallar: 'cv',
  analys: 'cv',
  brev: 'brev',
  coach: 'jobb',
}

/* --------------------------------------------------------- rutan i texten */

export function InlineKort({
  cluster,
  verktyg,
  slug,
}: {
  cluster: CtaCluster
  verktyg: InlineVerktyg
  slug: string
}) {
  if (verktyg === 'lankrad') {
    return (
      <ReklamRuta
        farg={fargForKluster(cluster)}
        ikon="neutral"
        etikett={LANKRAD.etikett}
        ariaLabel="Relaterade räknare"
        data={{ ...matning('inline', cluster, 'lankrad'), 'data-cta-slug': slug }}
        brod={LANKRAD.text}
      >
        <ul className="ar-lankar">
          {LANKRAD.lankar.map((l) => (
            <li key={l.href}>
              <TextLank href={l.href} data-cta-klick={l.href}>
                {l.text}
              </TextLank>
            </li>
          ))}
        </ul>
      </ReklamRuta>
    )
  }

  if (verktyg === 'raknare') {
    return (
      <ReklamRuta
        farg="jobb"
        ikon="neutral"
        etikett={INLINE_RAKNARE.etikett}
        rubrik={INLINE_RAKNARE.rubrik}
        ariaLabel={INLINE_RAKNARE.rubrik}
        data={{ ...matning('inline', cluster, 'raknare'), 'data-cta-slug': slug }}
        brod={INLINE_RAKNARE.text}
      >
        <ul className="ar-lankar">
          {INLINE_RAKNARE.lankar.map((l) => (
            <li key={l.href}>
              <TextLank href={l.href} data-cta-klick={l.href}>
                {l.text}
              </TextLank>
            </li>
          ))}
        </ul>
      </ReklamRuta>
    )
  }

  if (verktyg === 'test') {
    // Utanför testklustret (intervjuartiklarna, S6) bär kortet intervjutexten
    // och mäts som testkort, samma som <TestKort /> i MDX.
    if (cluster !== 'test')
      return (
        <ProvKort
          cluster={cluster}
          slug={slug}
          etikett={TESTKORT_INTERVJU.etikett}
          rubrik={TESTKORT_INTERVJU.rubrik}
          text={TESTKORT_INTERVJU.text}
          variant="testkort"
        />
      )
    return <ProvKort cluster={cluster} slug={slug} />
  }

  const copy = INLINE[verktyg]
  return (
    <ReklamRuta
      farg={INLINE_FARG[verktyg]}
      ikon={INLINE_FARG[verktyg]}
      etikett={copy.etikett}
      rubrik={copy.rubrik}
      ariaLabel={copy.rubrik}
      data={{ ...matning('inline', cluster, verktyg), 'data-cta-slug': slug }}
      bild={<InlineBild verktyg={verktyg} />}
      brod={copy.brod}
      gratis={copy.gratis}
      knappar={
        <Knapp href={copy.href} pil data-cta={`article-inline-${cluster}`} data-cta-klick={copy.href}>
          {copy.knapp}
        </Knapp>
      }
      paket={copy.paketrad}
    />
  )
}

/**
 * Provkortet: expertuppgiften i bild, knappen till provet och länken till
 * testsidan bredvid. Båda målen mäts som article_cta_clicked med target =
 * länkens mål. I testklustret står det efter andra stycket; i andra artiklar
 * läggs det in med <TestKort /> och egen rubrik och text, med variant
 * 'testkort' så att de två går att skilja åt. Med egen text (testkortet)
 * står texten hel, utan gratisrutan.
 */
export function ProvKort({
  cluster,
  slug,
  etikett = INLINE_PROVA.etikett,
  rubrik = INLINE_PROVA.rubrik,
  text,
  variant = 'test',
}: {
  cluster: CtaCluster
  slug: string
  etikett?: string
  rubrik?: string
  text?: string
  variant?: string
}) {
  const egenText = text !== undefined
  return (
    <ReklamRuta
      farg="tran"
      ikon="tran"
      etikett={etikett}
      rubrik={rubrik}
      ariaLabel={etikett}
      data={{ ...matning('inline', cluster, variant), 'data-cta-slug': slug }}
      bild={<ExpertUppgift />}
      brod={egenText ? text : INLINE_PROVA.brod}
      gratis={egenText ? undefined : INLINE_PROVA.gratis}
      knappar={
        <>
          <Knapp href={INLINE_PROVA.href} pil data-cta={`article-inline-${cluster}`} data-cta-klick={INLINE_PROVA.href}>
            {INLINE_PROVA.knapp}
          </Knapp>
          <TextLank href={INLINE_PROVA.sekundar.href} data-cta-klick={INLINE_PROVA.sekundar.href}>
            {INLINE_PROVA.sekundar.text}
          </TextLank>
        </>
      }
      paket={INLINE_PROVA.paketrad}
    />
  )
}

/* ------------------------------------------------------ Jobbsökets kort */

/**
 * Jobbsökets kort efter texten (SEO-beskedet avsnitt 20): träffen i
 * artiklarna om matchning, vägen från Ska sökas till Erbjudande i artiklarna
 * om uppföljning. Läggs till, ersätter inget kort. Mäts som slutkort med
 * egen variant. Arbetsgivarna är grundens påhittade, matchgraden exempel.
 */
export function JobbKort({ variant, cluster, slug }: { variant: keyof typeof JOBB_KORT; cluster: CtaCluster; slug: string }) {
  const copy = JOBB_KORT[variant]
  const bild =
    variant === 'matchning' ? (
      <div>
        <Traff
          sistaDag="Sista ansökningsdag 28 nov"
          skal={[{ rubrik: '1 av dina 3 roller' }, { rubrik: 'Fyra av dina kompetenser' }, { rubrik: 'Göteborg, en av dina orter' }]}
          handlingar={[]}
        />
        <TraffRad {...SARA_FLER_TRAFFAR[0]} />
      </div>
    ) : (
      <Stig />
    )
  return (
    <ReklamRuta
      farg="jobb"
      ikon="jobb"
      etikett={copy.etikett}
      rubrik={copy.rubrik}
      ariaLabel={copy.ariaLabel}
      data={{ ...matning('final', cluster, `jobb-${variant}`), 'data-cta-slug': slug }}
      bild={bild}
      brod={copy.brod}
      gratis={copy.gratis}
      knappar={
        <Knapp href={copy.href} pil data-cta={`article-jobb-${cluster}`} data-cta-klick={copy.href}>
          {copy.knapp}
        </Knapp>
      }
      paket={copy.paketrad}
    />
  )
}

/* ------------------------------------------------ sidokolumnens kort */

/*
 * data-sido-steg: det som döljs med CSS i låga fönster så att knappen alltid
 * syns (innehall.css, logg-sidokort.md). Steg 1 först, steg 2 och 3 i lägre
 * fönster. Texten och ordningen i HTML:en är densamma i alla fönster.
 */

/**
 * Jobbsökets kort i sidokolumnen, för artiklarna i JOBB_SKAL_SLUGAR där
 * Jobbsöket tar hela skalets reklam (aktivitetsrapporten, saas-lead 10.4).
 * Samma text som kortet efter texten, mäts som sidokort med egen variant.
 */
export function SidoJobbKort({ variant, cluster, slug }: { variant: keyof typeof JOBB_KORT; cluster: CtaCluster; slug: string }) {
  const copy = JOBB_KORT[variant]
  return (
    <section className="ar-sido" aria-label={copy.ariaLabel} {...matning('sidebar', cluster, `jobb-${variant}`)} data-cta-slug={slug}>
      <p className="ar-ey">{copy.etikett}</p>
      <p className="ar-sido-rub">{copy.rubrik}</p>
      <p className="ar-sido-text" data-sido-steg="2">{copy.gratis}</p>
      <Knapp href={copy.href} bred data-cta-klick={copy.href}>
        {copy.knapp}
      </Knapp>
    </section>
  )
}

export function SidoPaketKort({ paket, cluster, slug }: { paket: ArtikelPaket; cluster: CtaCluster; slug: string }) {
  if (paket === 'gratis') {
    return (
      <section className="ar-sido ar-sido-gratis" aria-label={GRATIS_KORT.rubrik} {...matning('sidebar', cluster, 'gratis')} data-cta-slug={slug}>
        <p className="ar-ey">{GRATIS_KORT.etikett}</p>
        <p className="ar-sido-rub">{GRATIS_KORT.rubrik}</p>
        <div className="ar-bock" data-sido-steg="2">
          <Bocklista punkter={GRATIS_KORT.rader.slice(0, 3)} />
        </div>
        {/* Sidokolumnen har ingen listrad intill rutnätet, så raden får caption (S7, S13). */}
        <div className="ar-gratiskort" data-sido-steg="1">
          <div className="ar-bredd">
            <TestBredd form="rad" text={GRATIS_KORT.breddCaption} label="Åtta testtyper och personlighetstestet, grundnivån gratis" className="ib-tb-sido" />
          </div>
        </div>
        <Knapp href={GRATIS_KORT.href} bred data-cta-klick={GRATIS_KORT.href}>
          {GRATIS_KORT.knapp}
        </Knapp>
      </section>
    )
  }
  const copy = SIDO[paket]
  return (
    <section className="ar-sido km-yta" aria-label={copy.rubrik} {...matning('sidebar', cluster, paket)} data-cta-slug={slug}>
      <p className="ar-ey">{copy.etikett}</p>
      <p className="ar-sido-rub">{copy.rubrik}</p>
      <p className="ar-sido-text" data-sido-steg="2">{copy.text}</p>
      <p className="ar-sido-pris" data-sido-steg="3">
        {/* Priset följer kampanjen som slutkortet (H2, 2026-11-14). */}
        <KampanjVarianter
          ord={
            <>
              {copy.belopp}
              <small>{copy.under}</small>
            </>
          }
          kampanj={(k) => <KampanjPris k={k} storlek="mellan" />}
        />
      </p>
      <Knapp href="/priser" bred data-cta-klick="/priser">
        Se vad som ingår
      </Knapp>
      {copy.gratisrad ? <p className="ar-sido-text" data-sido-steg="1">{copy.gratisrad}</p> : null}
    </section>
  )
}

/* ---------------------------------------------- slutkortet efter texten */

/** Verktyget i större skala i slutkortet (skissen: testets ram i stället för tre telefoner). */
function SlutBild({ paket }: { paket: 'cv' | 'test' | 'allt' | 'lista' }) {
  if (paket === 'cv') {
    return (
      <div className="ar-slutbild" aria-hidden="true">
        <CvArk poang={{ tal: 93, text: 'av 100 i dag' }} kvar="7 poäng kvar till 100" />
      </div>
    )
  }
  if (paket === 'allt') {
    return (
      <div className="ar-slutbild" aria-hidden="true">
        <Traff handlingar={[]} />
      </div>
    )
  }
  return (
    <div className="ar-slutbild ar-med-resultat" aria-hidden="true">
      <Svav className="ar-resultat" stor="12 av 15" under="rätt, exempel på ett pass" gungar />
      <Testram fraga={null} knapp={null} />
    </div>
  )
}

function PremiumKort({
  id,
  etikett,
  rubrik,
  text,
  mellan,
  punkter,
  pris,
  knapp,
  lank,
  bild,
  data,
}: {
  id: string
  etikett: string
  rubrik: string
  text?: ReactNode
  mellan?: ReactNode
  punkter: readonly string[]
  /** Priset stort (slutkortet i artiklarna; listans kort har priset i texten). */
  pris?: boolean
  knapp: ReactNode
  lank: { text: string; href: string }
  bild: ReactNode
  data: Data
}) {
  return (
    <section id={id} className="ar-slut-sekt" {...data}>
      <div className="p3-bredd">
        <div className="p3-premium ar-slut">
          <div className="ar-slut-rad">
            <div className="ar-slut-text">
              <p className="p3-ey">{etikett}</p>
              {/* Rubriken är p, så att artiklarna inte får en ny h2. */}
              <p className="ar-slut-rub">{rubrik}</p>
              {text ? <p className="ar-slut-text-p">{text}</p> : null}
              {mellan ? <div>{mellan}</div> : null}
              <Bocklista punkter={punkter} />
              {pris ? <PrisRad uppsagning /> : null}
              <div className="p3-knapprad">
                {knapp}
                <TextLank href={lank.href} data-cta-klick={lank.href}>
                  {lank.text}
                </TextLank>
              </div>
            </div>
            {bild}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Slutkortet efter texten: Premium på sidans mörkaste ton med kopparklack
 * och klustrets verktyg i bild. Rubriken är p. Paketet gratis ritas i
 * textspalten av GratisKort i stället.
 */
export function SlutKort({ paket, cluster, slug }: { paket: Exclude<ArtikelPaket, 'gratis'>; cluster: CtaCluster; slug: string }) {
  const copy = SLUT[paket]
  return (
    <PremiumKort
      id="premium-artikel"
      data={{ ...matning('final', cluster, paket), 'data-cta-slug': slug }}
      etikett={copy.etikett}
      rubrik={copy.rubrik}
      mellan={
        // Bankbredden i testpaketets slutkort, mellan rubrik och punkter
        // (docs/design/bankbredd-2026-11-19.md avsnitt 4).
        paket === 'test' ? <Bankbredd form="rad" yta="vagg" text="Nivån räknas bara på uppgifter du inte sett den senaste månaden." /> : undefined
      }
      punkter={copy.rader}
      pris
      knapp={
        <Knapp href={copy.href} data-cta={`article-final-${cluster}`} data-cta-klick={copy.href}>
          {/* Knappen säger samma pris som raden ovanför (slutgranskningen 14 nov). */}
          <KampanjVarianter ord={copy.knapp} kampanj={(k) => k.copy.prisKnapp} />
        </Knapp>
      }
      lank={copy.sekundar}
      bild={<SlutBild paket={paket} />}
    />
  )
}

/* ------------------------------------------------------- gratiskortet */

export function GratisKort({
  cluster,
  slug,
  position = 'inline',
  className,
}: {
  cluster: CtaCluster | 'lista'
  slug?: string
  position?: string
  className?: string
}) {
  return (
    <ReklamRuta
      ikon="bock"
      etikett={GRATIS_KORT.etikett}
      rubrik={GRATIS_KORT.rubrik}
      ariaLabel={GRATIS_KORT.rubrik}
      className={`ar-gratiskort ${className ?? ''}`.trim()}
      data={{ ...matning(position, cluster, 'gratis'), 'data-cta-slug': slug }}
      bildSynlig
      bild={
        // Ingen caption: listans första rad står intill och säger bredden.
        <div className="ar-bredd">
          <TestBredd form="rutnat" label="Åtta testtyper och personlighetstestet, grundnivån gratis" />
        </div>
      }
      knappar={
        <>
          <Knapp href={GRATIS_KORT.href} pil data-cta-klick={GRATIS_KORT.href}>
            {GRATIS_KORT.knapp}
          </Knapp>
          <TextLank href={GRATIS_KORT.sekundar.href} data-cta-klick={GRATIS_KORT.sekundar.href}>
            {GRATIS_KORT.sekundar.text}
          </TextLank>
        </>
      }
    >
      <ul className="ar-lista">
        {GRATIS_KORT.rader.map((r, i) => (
          <li key={r}>
            {/* Mallraden leder till verktygssidan: intern länkkraft som kortet
                hade förut och inte får tappa (SEO-spärrlistan punkt 4). */}
            {i === GRATIS_KORT.mallrad ? (
              <TextLank href="/cv-mallar" data-cta-klick="/cv-mallar">
                {r}
              </TextLank>
            ) : (
              <span>{r}</span>
            )}
          </li>
        ))}
      </ul>
    </ReklamRuta>
  )
}

/* ------------------------------------------------- listans slutkort */

export function ListaSlutKort() {
  return (
    <PremiumKort
      id="premium-arkiv"
      data={matning('final', 'lista', 'paket')}
      etikett={LISTA_SLUT.etikett}
      rubrik={LISTA_SLUT.rubrik}
      text={<MedKampanjPris text={LISTA_SLUT.text} />}
      punkter={LISTA_SLUT.rader}
      knapp={
        <Knapp href={LISTA_SLUT.href} data-cta-klick={LISTA_SLUT.href}>
          {LISTA_SLUT.knapp}
        </Knapp>
      }
      lank={{ text: 'Eller börja gratis med en CV-mall', href: '/cv-mallar' }}
      bild={<SlutBild paket="lista" />}
    />
  )
}

/** Premium-namnet med gradienten, för sidor som vill skriva det i en rubrik. */
export { PremiumOrd }

/** Priset för sidopaketet, ur plans.ts. */
export const SIDO_PRIS = PLAN_BY_KEY[SALD_PLAN].amount
