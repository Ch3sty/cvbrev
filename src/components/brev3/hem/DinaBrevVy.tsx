/**
 * Dina brev (BYGGSPEC avsnitt 7; skisserna Main, Hem-ny och Mobil-hem).
 *
 * Väggen säger läget och nästa steg för det senast uppdaterade brevet som
 * inte är skickat (motorns nastaSteg), med brevets väg och arken. Golvet har
 * måtten på brevet, alla brev, kortet "Skriv nytt brev", Premiumkortet (bara
 * gratis), jobben ur matchningarna och raderna om CV:t och Sökta tjänster.
 * Utan brev: annonsfältet i väggen och "Så går det till" (Hem-ny).
 *
 * Serverkomponent; allt är ritat i första HTML:en. Klientöarna är små
 * (CV-väljaren, annonsfältet, jobbens knappar, listans utfällning).
 */
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  BrevVagg,
  BrevFlikar,
  VaggArk,
  BrevBana,
  ArkBunt,
  StorKnapp,
  LitenKnapp,
  Chip,
  Tagg,
  MatarBricka,
  Golv,
  LyftPanel,
  PanelHuvud,
  SektionsHuvud,
  MattRutnat,
  Matare,
  KravMitt,
  LangdMitt,
  MallMitt,
  Radkort,
  JobbKort,
  JobbRutnat,
  BrevKort,
  NyttBrevKort,
  IkonPil,
  IkonDokument,
  IkonLas,
  IkonBock,
  type NyttBrevKvot,
} from '@/components/brev3/kit'
import Topprad from '@/components/rum/Topprad'
import { PremiumKnappText, PremiumPrisradText } from '@/components/kampanj/KampanjPrisKontext'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { CV_HREF, SKRIV_BREV_HREF, brevHref } from '@/lib/letters/lage'
import type { BrevIListan } from '@/lib/letters/server'
import { formatGratisbrevDag } from '@/lib/letters/brevKvot'
import { kortDatum } from '@/lib/rum/copy'
import type { BrevSteg } from '@/lib/letters/brevmall/typer'
import type { DinaBrevData, HemMatt } from './data'
import { Miniatyr, MiniatyrStilar } from './Miniatyr'
import CvRad from './CvRad'
import { AnnonsFalt, BrevListaKlient, KvotMatning, SkrivBrevKnapp, type ListPost } from './Klient'
import { ingressMobil, kravEtikett, langdOrd, narRelativt, overradMobil, rollKort, skrivetRad, soktaOgon, stortTalRader } from './text'

const DINA_BREV_HREF = '/dashboard/mina-brev'
const SOKTA_HREF = '/dashboard/sokta-tjanster'
const MATCHNINGAR_HREF = '/dashboard/jobbmatchning'
const ALLA_STEG: BrevSteg[] = ['annonsen', 'brevet', 'las-igenom', 'skickat']

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta']
const Tal = (n: number) => {
  const t = ORD[n] ?? String(n)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function foretagFor(b: BrevIListan): string {
  return b.company?.trim() || b.title?.trim() || 'Personligt brev'
}

function forberettOrd(b: BrevIListan): string {
  return b.forberett_som === 'kopierat' ? 'Kopierat' : 'Nedladdat'
}

/** Statusen i väggens bricka: "Inte skickat än", "Nedladdat, inte skickat", "Sökt 14 nov". */
function statusChip(b: BrevIListan): string {
  if (b.soktDatum) return `Sökt ${kortDatum(b.soktDatum)}`
  if (b.forberett_at) return `${forberettOrd(b)}, inte skickat`
  return 'Inte skickat än'
}

function sidorad(d: DinaBrevData): string | null {
  const b = d.fokus
  if (!b) return null
  if (d.steg.lage === 'alla-skickade') return b.soktDatum ? `Senast sökt ${kortDatum(b.soktDatum)}.` : null
  if (d.steg.lage === 'skicka' && b.forberett_at) return `${forberettOrd(b)} ${narRelativt(b.forberett_at) ?? ''}.`.replace(' .', '.')
  const skrivet = skrivetRad(b.created_at)
  return skrivet ? `${skrivet}. Brevet sparas av sig självt.` : 'Brevet sparas av sig självt.'
}

/* ------------------------------------------------------------------ väggen */

function StortTal({ tal, rest }: { tal: string; rest: string }) {
  const { rad1, rad2 } = stortTalRader(rest)
  return (
    <p className="b3-stort">
      <span className="b3-stort-tal" aria-hidden="true">
        {tal}
      </span>
      <span className="b3-stort-rad">
        <span className="sr-only">{tal} </span>
        {rad1}
        {rad2 ? (
          <>
            <br />
            <b>{rad2}</b>
          </>
        ) : null}
      </span>
    </p>
  )
}

function VaggMedBrev({ d, skrivHref, mallarHref }: { d: DinaBrevData; skrivHref: string; mallarHref: string }) {
  const { steg, fokus, matt, vag } = d
  const knappHref = steg.knapp.href === SKRIV_BREV_HREF ? skrivHref : steg.knapp.href
  const allaKlara = !!vag && vag.klara.includes('skickat')
  const banSteg = allaKlara ? null : (vag?.steg ?? null)
  const klara = allaKlara ? ALLA_STEG : (vag?.klara ?? [])
  const mallNamn = matt?.mall.namn ?? 'Linne'
  const fokusArk = fokus ? d.ark[fokus.id] : undefined
  const krav = matt?.krav
  const rad = sidorad(d)

  return (
    <>
      {/* Dator, från 1280 px (Main). */}
      <div className="hidden xl:block">
        <div className="b3-topp">
          <BrevFlikar aktiv="dina-brev" hrefDinaBrev={DINA_BREV_HREF} hrefMallar={mallarHref} />
          <div className="flex items-center gap-3">
            <CvRad cvNamn={d.valtCv?.namn ?? null} skrivHref={skrivHref} cvs={d.cvs} lastaCvIds={d.lastaCvIds} valtCvId={d.valtCv?.id ?? null} />
            <Topprad bara="atgarder" />
          </div>
        </div>
        <div className="b3-hero">
          <div className="b3-hero-text">
            <p className="b3-ogon">{steg.overrad}</p>
            <h1 className="b3-h1">{steg.rubrik}</h1>
            <p className="b3-ingress">{steg.text}</p>
            <div className="b3-knapprad">
              <StorKnapp href={knappHref}>
                {steg.knapp.text}
                <IkonPil />
              </StorKnapp>
              {rad ? <span className="b3-sidorad">{rad}</span> : null}
            </div>
            {fokus ? (
              <div className="b3-chips">
                <Chip>
                  <IkonDokument size={16} className="text-[color:var(--koppar-ljus)]" />
                  {`Mallen ${mallNamn}`}
                </Chip>
                <Chip>{statusChip(fokus)}</Chip>
                <Link href={mallarHref}>Byt mall</Link>
              </div>
            ) : null}
          </div>
          <div className="b3-hero-hoger">
            {steg.stortTal ? <StortTal tal={steg.stortTal.tal} rest={steg.stortTal.rest} /> : null}
            <BrevBana form="dator" steg={banSteg} klara={klara} />
            {fokusArk ? (
              <ArkBunt
                style={{ left: 316, top: 0 }}
                overst={<Miniatyr ark={fokusArk} mobil={206} />}
                bakom={[d.ark['bakom-1'], d.ark['bakom-2']].filter(Boolean).map((a, i) => <Miniatyr key={i} ark={a!} mobil={206} />)}
                alt={`Ditt brev till ${fokus ? foretagFor(fokus) : ''} i mallen ${mallNamn}`}
                etikett={
                  <Chip ljus href={mallarHref}>
                    Se det i fler mallar
                    <IkonPil size={15} />
                  </Chip>
                }
                etikettStil={{ right: -8, bottom: -30 }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Telefon och smal skärm (Mobil-hem). */}
      <div className="xl:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <BrevFlikar aktiv="dina-brev" hrefDinaBrev={DINA_BREV_HREF} hrefMallar={mallarHref} />
          </div>
          <Topprad bara="atgarder" />
        </div>
        <div className="b3-hero">
          <div className="b3-hero-text">
            <p className="b3-ogon">{overradMobil(steg)}</p>
            <h1 className="b3-h1">{steg.rubrik}</h1>
            <p className="b3-ingress">{ingressMobil(steg, krav ? krav.antal - krav.medSvar : 0)}</p>
          </div>
          {fokus && fokusArk ? (
            <VaggArk
              href={brevHref(fokus.id)}
              etikett={`Ditt brev i mallen ${mallNamn}.${krav ? ` ${Tal(krav.medSvar)} av ${ORD[krav.antal] ?? krav.antal} krav i annonsen har fått svar.` : ''}`}
              tal={krav ? krav.medSvar : null}
              av={krav ? krav.antal : null}
            >
              <Miniatyr ark={fokusArk} mobil={84} />
            </VaggArk>
          ) : null}
        </div>
        <BrevBana form="mobil" steg={banSteg} klara={klara} />
        <div className="mt-3.5">
          <StorKnapp href={knappHref}>
            {steg.knapp.text}
            <IkonPil />
          </StorKnapp>
        </div>
      </div>
    </>
  )
}

function VaggUtanBrev({ d, skrivHref, mallarHref }: { d: DinaBrevData; skrivHref: string; mallarHref: string }) {
  const { steg } = d
  const forsta = steg.lage === 'forsta-brevet'
  const hint = (
    <>
      Tar 10 till 15 sekunder.
      <br />
      Ton, språk och mall ändrar du efteråt.
    </>
  )
  const handling = forsta ? (
    <AnnonsFalt cvId={d.valtCv?.id ?? null} skrivHref={skrivHref} hint={hint} />
  ) : (
    <div className="b3-knapprad">
      <StorKnapp href={CV_HREF}>
        {steg.knapp.text}
        <IkonPil />
      </StorKnapp>
    </div>
  )
  return (
    <>
      <div className="hidden xl:block">
        <div className="b3-topp">
          <BrevFlikar aktiv="dina-brev" hrefDinaBrev={DINA_BREV_HREF} hrefMallar={mallarHref} />
          <div className="flex items-center gap-3">
            <CvRad cvNamn={d.valtCv?.namn ?? null} cvs={d.cvs} lastaCvIds={d.lastaCvIds} valtCvId={d.valtCv?.id ?? null} />
            <Topprad bara="atgarder" />
          </div>
        </div>
        <div className="b3-hero xl:!mt-[34px] xl:!grid-cols-[540px_minmax(0,1fr)] xl:!items-start">
          <div className="b3-hero-text">
            <p className="b3-ogon">{steg.overrad}</p>
            <h1 className="b3-h1 xl:!text-[44px] xl:!leading-[48px]">{steg.rubrik}</h1>
            <p className={`b3-ingress xl:!mt-3 xl:!max-w-[480px] ${forsta ? 'xl:!mb-5' : ''}`}>{steg.text}</p>
            {handling}
          </div>
          <div className="b3-hero-hoger xl:!h-[440px]">
            <BrevBana form="dator" steg="annonsen" klara={[]} className="xl:!bottom-[60px]" />
            {d.ark.exempel ? (
              <ArkBunt
                style={{ left: 330, top: 10 }}
                overst={<Miniatyr ark={d.ark.exempel} mobil={206} />}
                bakom={d.ark['bakom-1'] ? [<Miniatyr key="b" ark={d.ark['bakom-1']} mobil={206} />] : []}
                alt="Exempel på ett färdigt brev"
                etikett={<span className="b3-chip ljus !h-[30px] !text-xs !font-bold">Så här blir det</span>}
                etikettStil={{ left: -30, top: -10 }}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <BrevFlikar aktiv="dina-brev" hrefDinaBrev={DINA_BREV_HREF} hrefMallar={mallarHref} />
          </div>
          <Topprad bara="atgarder" />
        </div>
        <div className="mt-4">
          <p className="b3-ogon">{steg.overrad}</p>
          <h1 className="b3-h1">{steg.rubrik}</h1>
          <p className="b3-ingress">{steg.text}</p>
        </div>
        <div className="mt-4">{handling}</div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ golvet */

function SaGarDetTill({ harBetalt }: { harBetalt: boolean }) {
  const steg = [
    { rubrik: 'Annonsen in', text: 'Klistra in texten, eller välj ett jobb bland dina matchningar här nedanför.' },
    { rubrik: 'Brevet skrivs mot kraven', text: 'Du ser vilka krav brevet svarar på och vilket som saknas.' },
    {
      rubrik: 'Läs, ändra och skicka',
      text: harBetalt ? 'Läs, ändra och ladda ner brevet som PDF eller Word.' : `Läs och kopiera ingår gratis. PDF och Word ingår i ${PAKETRADER.bricka}.`,
    },
  ]
  return (
    <LyftPanel etikett="Så går det till">
      <p className="b3-ogon-golv">Så går det till</p>
      <h2 className="b3-h2 mt-0.5 xl:mt-1">Från annons till skickad ansökan</h2>
      <ol className="m-0 mt-3 grid list-none gap-2.5 p-0 xl:mt-4 xl:grid-cols-3 xl:gap-3">
        {steg.map((s, i) => (
          <li key={s.rubrik} className="flex gap-3 rounded-[18px] bg-[color:var(--b3-mjuk)] p-3.5 xl:min-h-[150px] xl:flex-col xl:gap-2 xl:rounded-[20px] xl:px-5 xl:py-[18px]">
            <span
              className="b3-disp flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[13px] bg-[color:var(--vagg)] text-xl font-extrabold leading-none text-[color:var(--vagg-ink)] shadow-[0_3px_0_var(--b3-djup)]"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-1 xl:gap-2">
              <b className="text-[15px] leading-5 xl:text-base xl:leading-[22px]">{s.rubrik}</b>
              <span className="text-[13px] leading-[18px] text-[color:var(--b3-ink-2)] xl:text-sm xl:leading-5">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </LyftPanel>
  )
}

function MattPanel({ matt, mallarHref, brevArk }: { matt: HemMatt; mallarHref: string; brevArk: ReactNode }) {
  const krav = matt.krav
  const antal = krav ? 3 : 2
  const saknas = krav ? krav.antal - krav.medSvar : 0
  const over = matt.andel > 1
  const foretag = matt.foretag
  const ord = antal === 3 ? 'Tre' : 'Två'
  const bytMall = <Link href={mallarHref}>Byt mall</Link>
  const m = matt.mall

  return (
    <LyftPanel etikett="Så ligger brevet till">
      <PanelHuvud
        ogon="Så ligger brevet till"
        rubrik={foretag ? `${ord} mått på brevet till ${foretag}` : `${ord} mått på brevet`}
        rubrikMobil={`${ord} mått på brevet`}
        lank={{ href: brevHref(matt.brevId), text: 'Öppna brevet' }}
      />
      <MattRutnat antal={antal}>
        {krav ? (
          <Matare
            etikett="Kraven i annonsen"
            bricka={saknas > 0 ? <MatarBricka>{`${saknas} krav saknas`}</MatarBricka> : <MatarBricka klar>Alla har svar</MatarBricka>}
            rad={
              saknas > 0 ? (
                <>
                  <b>{saknas === 1 ? `${krav.saknade[0]} saknas.` : `${krav.saknade[0]} och ${ORD[saknas - 1] ?? saknas - 1} till saknas.`}</b>{' '}
                  {saknas === 1 ? 'En mening med ett exempel ur ditt CV räcker.' : 'En mening per krav räcker.'}
                </>
              ) : (
                <>
                  <b>Brevet svarar på alla krav vi hittade.</b> Läs igenom det en gång innan du skickar.
                </>
              )
            }
            radMobil={
              saknas > 0 ? (
                <>
                  <b>{`${krav.saknade[0]} saknas.`}</b> En mening räcker.
                </>
              ) : (
                <b>Brevet svarar på alla krav.</b>
              )
            }
          >
            <KravMitt besvarade={krav.medSvar} totalt={krav.antal} etikett={kravEtikett(krav.medSvar, krav.antal, krav.saknade)} />
          </Matare>
        ) : null}
        <Matare
          etikett="Längden"
          bricka={over ? <MatarBricka>Går över till sida två</MatarBricka> : <MatarBricka klar>En sida</MatarBricka>}
          brickaBaraDator={!over}
          rad={
            over ? (
              <>
                <b>Rekryterare läser sällan längre än en sida.</b> Korta ett stycke.
              </>
            ) : matt.andel < 0.9 ? (
              <>
                <b>Ryms på en sida, med luft kvar.</b>
                {saknas > 0 ? ` Det finns plats för ${saknas === 1 ? 'meningen' : 'meningarna'} som saknas.` : ''}
              </>
            ) : (
              <b>Ryms på en sida.</b>
            )
          }
          radMobil={over ? <b>Går över till sida två.</b> : <b>Ryms på en sida.</b>}
        >
          <LangdMitt ord={matt.ord} andel={matt.andel} etikett={langdOrd(matt.andel)} />
        </Matare>
        <Matare
          etikett="Mallen"
          bricka={m.samma ? <MatarBricka klar>Samma som ditt CV</MatarBricka> : undefined}
          brickaBaraDator
          rad={
            m.samma ? (
              <>
                <b>Ansökan ser ut som en helhet.</b> {bytMall}, texten följer med.
              </>
            ) : (
              <>
                <b>{m.id ? `Brevet står i ${m.namn}.` : `Brevet står i den äldre mallen ${m.namn}.`}</b> {bytMall}, texten följer med.
              </>
            )
          }
          radMobil={
            <>
              <b>{m.samma ? 'Samma som ditt CV.' : `${m.namn}.`}</b> {bytMall}
            </>
          }
        >
          <MallMitt
            namn={m.namn}
            rad={m.samma ? 'Samma huvud som CV:t' : m.cvMallNamn ? `Ditt CV står i ${m.cvMallNamn}` : undefined}
            etikett={m.cvMallId ? `Ditt CV i mallen ${m.cvMallNamn ?? m.cvMallId} och ditt brev i mallen ${m.namn}, sida vid sida` : `Ditt brev i mallen ${m.namn}`}
            cv={m.cvMallId ? <img src={`/mallar/v2/${m.cvMallId}-liten.webp`} alt="" width={58} height={82} /> : undefined}
            brev={brevArk}
          />
        </Matare>
      </MattRutnat>
    </LyftPanel>
  )
}

function brevKortFor(b: BrevIListan, d: DinaBrevData): ReactNode {
  const ark = d.ark[b.id]
  const roll = b.job_title?.trim() || ''
  const bild = ark ? <Miniatyr ark={ark} mobil={148} dator={204} /> : <span className="block aspect-[210/297] w-full bg-white" />
  if (b.isLocked) {
    return (
      <BrevKort
        lage="last"
        href={brevHref(b.id)}
        foretag={foretagFor(b)}
        roll={roll ? `${roll}. Går att läsa och kopiera.` : 'Går att läsa och kopiera.'}
        rollMobil="Går att läsa och kopiera"
        status={
          <Tagg ton="p" las>
            Låst
          </Tagg>
        }
        sidotext={<Link href={kopstegHref(SALD_PLAN, 'kvot')}>{PAKETRADER.ingar}</Link>}
      >
        {bild}
      </BrevKort>
    )
  }
  const status = b.soktDatum ? (
    <Tagg ton="g" bock>
      {`Sökt ${kortDatum(b.soktDatum)}`}
    </Tagg>
  ) : (
    <Tagg ton="p">Inte skickat</Tagg>
  )
  const sidotext = b.soktDatum ? (
    b.ansokanId ? (
      <Link href={`${SOKTA_HREF}/${b.ansokanId}`}>I Sökta tjänster</Link>
    ) : (
      'I Sökta tjänster'
    )
  ) : b.forberett_at ? (
    `${forberettOrd(b)} ${narRelativt(b.forberett_at) ?? ''}`.trim()
  ) : (
    skrivetRad(b.created_at)
  )
  return (
    <BrevKort
      lage={b.id === d.steg.brevId ? 'vald' : 'vanlig'}
      href={brevHref(b.id)}
      foretag={foretagFor(b)}
      roll={roll}
      rollMobil={roll ? rollKort(roll) : undefined}
      status={status}
      sidotext={sidotext}
    >
      {bild}
    </BrevKort>
  )
}

/* ------------------------------------------------------------------ sidan */

export default function DinaBrevVy({ d }: { d: DinaBrevData }) {
  const utanBrev = d.brev.length === 0
  const skrivHref = d.valtCv ? `${SKRIV_BREV_HREF}?cv=${encodeURIComponent(d.valtCv.id)}` : SKRIV_BREV_HREF
  const mallarHref = d.fokus ? `/dashboard/mina-brev/mallar?brev=${encodeURIComponent(d.fokus.id)}` : '/dashboard/mina-brev/mallar'
  const kvot: NyttBrevKvot = d.harBetalt
    ? null
    : d.kvot.kvar && d.kvot.kvar > 0
      ? { lage: 'kvar' }
      : { lage: 'slut', nasta: d.kvot.nastaGratisbrev ? formatGratisbrevDag(d.kvot.nastaGratisbrev) : 'om en vecka' }
  const harLast = d.brev.some((b) => b.isLocked)
  const poster: ListPost[] = d.brev.map((b) => ({ id: b.id, sok: `${b.company ?? ''} ${b.job_title ?? ''} ${b.title ?? ''}`, kort: brevKortFor(b, d) }))
  const nytt = <NyttBrevKort href={skrivHref} kvot={kvot} />
  const fokusArk = d.fokus ? d.ark[d.fokus.id] : undefined

  return (
    <div className="b3-sida flex flex-1 flex-col">
      <MiniatyrStilar ark={Object.values(d.ark)} />
      <KvotMatning aktiv={harLast} />

      <BrevVagg etikett="Nästa steg" hojd={utanBrev ? 664 : 558} hojdMobil={utanBrev ? (d.steg.lage === 'forsta-brevet' ? 600 : 360) : 438}>
        {utanBrev ? <VaggUtanBrev d={d} skrivHref={skrivHref} mallarHref={mallarHref} /> : <VaggMedBrev d={d} skrivHref={skrivHref} mallarHref={mallarHref} />}
      </BrevVagg>

      <Golv>
        {utanBrev ? (
          <SaGarDetTill harBetalt={d.harBetalt} />
        ) : d.matt ? (
          <MattPanel matt={d.matt} mallarHref={mallarHref} brevArk={fokusArk ? <Miniatyr ark={fokusArk} mobil={34} dator={58} /> : null} />
        ) : null}

        {!utanBrev ? (
          <>
            <SektionsHuvud
              rubrik="Dina brev"
              under={d.harBetalt ? 'Varje brev du skriver sparas här av sig självt.' : 'Varje brev du skriver sparas här av sig självt. De två senaste är öppna på gratisnivån.'}
              underMobil={d.harBetalt ? 'Sparas av sig självt.' : 'Sparas av sig självt. De två senaste är öppna på gratisnivån.'}
              lank={{ href: skrivHref, text: 'Skriv nytt brev' }}
            />
            <BrevListaKlient poster={poster} nytt={nytt} />
            <div className="mt-3 xl:hidden">{nytt}</div>
            {!d.harBetalt ? (
              <div className="mt-3 xl:mt-3.5">
                <Radkort
                  variant="prem"
                  ikon={<IkonLas size={22} strokeWidth={2.4} />}
                  rubrik="Ladda ner breven som PDF och Word, och skriv utan veckotak"
                  text={<PremiumPrisradText />}
                  handling={
                    <LitenKnapp kop href={kopstegHref(SALD_PLAN, 'kvot')}>
                      <PremiumKnappText />
                    </LitenKnapp>
                  }
                />
              </div>
            ) : null}
          </>
        ) : null}

        {d.jobb.length > 0 ? (
          <>
            <SektionsHuvud
              rubrik={utanBrev ? 'Ingen annons till hands? Börja med ett jobb som passar ditt CV' : 'Jobb att skriva till'}
              under={utanBrev ? 'Ur dina matchningar. Annonsen följer med in i brevet.' : 'Ur dina matchningar, valda mot ditt CV. Annonsen följer med in i brevet, så du slipper klistra.'}
              underMobil="Ur dina matchningar. Annonsen följer med in i brevet."
              lank={{ href: MATCHNINGAR_HREF, text: 'Alla matchningar' }}
            />
            <JobbRutnat>
              {d.jobb.map((j) => (
                <JobbKort
                  key={j.id}
                  tagg={j.tagg}
                  sistaDag={j.sistaDag}
                  titel={j.titel}
                  foretag={j.foretag}
                  ort={j.ort}
                  skal={utanBrev ? null : j.skal}
                  handling={<SkrivBrevKnapp jobb={j} cvId={d.valtCv?.id ?? null} skrivHref={skrivHref} />}
                />
              ))}
            </JobbRutnat>
          </>
        ) : null}

        {!utanBrev ? (
          <div className="mt-6 grid gap-2.5 xl:mt-11 xl:grid-cols-2 xl:gap-3">
            {d.valtCv ? (
              <Radkort
                ikon={<IkonDokument />}
                ogon="CV:t som breven bygger på"
                rubrik={d.valtCv.namn}
                text="Ändrar du i CV:t skrivs nästa brev efter det nya."
                textBaraDator
                handling={<LitenKnapp href={CV_HREF}>Öppna CV:t</LitenKnapp>}
              />
            ) : null}
            <Radkort
              ikon={<IkonBock size={24} strokeWidth={2.2} />}
              ogon={soktaOgon(d.antalSokta)}
              rubrik={
                <>
                  <span className="hidden xl:inline">Håll ordning på det du har sökt</span>
                  <span className="xl:hidden">Det du har sökt, samlat</span>
                </>
              }
              text="Brevet, annonsen och datumet, och när det är dags att följa upp."
              textBaraDator
              handling={<LitenKnapp href={SOKTA_HREF}>Öppna</LitenKnapp>}
            />
          </div>
        ) : null}
      </Golv>
    </div>
  )
}
