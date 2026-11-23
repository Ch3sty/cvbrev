/**
 * Översikt, Jobbsökets första flik (/dashboard), i tre lägen (Jobbsöket
 * omgång 1, etapp 2A; skissen Main, Oversikt-ny och Mobil-oversikt):
 *
 *   Main         mitt i jobbsöket: väggen ur första handlingen i Att göra nu,
 *                banan och veckans mål, sedan Att göra nu, nya träffar
 *                (egen Suspense-gräns), Sökta tjänster och Mer i Jobbsöket.
 *                Inget att göra och CV utan sökta tjänster är samma skärm
 *                med väggen som säger läget och tomma lägen i golvet.
 *   Ny           utan CV (attGora.lage 'utan_cv').
 *   Träning      träningsfokus (dagens regel, se (oversikt)/startvy.ts).
 *
 * Allt ritas på servern ur hamtaJobbsokOversikt; klientöarna är arket för
 * veckans mål, köpkvittot och mätpunkterna.
 */
import { Suspense, type ReactNode } from 'react'
import Topprad from '@/components/rum/Topprad'
import {
  JobbVagg,
  VaggHero,
  VaggText,
  Knapprad,
  Chips,
  Golv,
  StorKnapp,
  LitenKnapp,
  GlasKnapp,
  TextLank,
  VeckansMal,
  Matchring,
  Bricka,
  FyrstegsBana,
  Rutor,
  JobbsokBana,
  JobbsokBanaNy,
  LyftPanel,
  PanelHuvud,
  SektionsHuvud,
  Kort,
  Spalter,
  Avsnitt,
  GoraKort,
  GoraLista,
  TjanstRad,
  SidoRad,
  StegKort,
  StegKortRad,
  TomtLage,
  Felruta,
  IkonPil,
  IkonPlus,
  IkonKalender,
  IkonMejl,
  IkonPenna,
  IkonDokument,
  IkonFlagga,
  IkonPrat,
  IkonOga,
  IkonRutnat,
  IkonPerson,
  IkonVaska,
  StatusPiller,
} from '@/components/jobb3/kit'
import {
  SOKTA_HREF,
  isoVecka,
  kortDag,
  ordtal,
  soktaHref,
  veckodagKort,
  type AttGoraHandling,
  type AttGoraIkon,
} from '@/lib/jobbsok'
import type { JobbsokOversikt } from '@/lib/jobbsok/server'
import { korsreferens } from '@/lib/rum/jobbsok'
import { CHIP, KORS, MER } from '@/lib/rum/copy'
import { HEM } from '@/app/dashboard/intervju/infor-intervjun-copy'
import { traningsHandling } from '@/lib/intervju/nasta'
import { scopeHasFeature } from '@/lib/access/features'
import { dagensDatum, halsning } from '@/app/dashboard/(oversikt)/HemHuvud'
import { startvy } from '@/app/dashboard/(oversikt)/startvy'
import OversiktKlient from '@/app/dashboard/(oversikt)/OversiktKlient'
import QuotaNudgeRow from '@/app/dashboard/(oversikt)/QuotaNudgeRow'
import ProfilKomplettering from '@/app/dashboard/(oversikt)/ProfilKomplettering'
import { banaProps, bliUpptacktRad, goraMobil, goraTon, stor, tjanstRad } from './oversikt'
import { traningsKopia } from './traning'
import VeckansMalAndra from './VeckansMalAndra'
import TraningsKnapp from './TraningsKnapp'
import KorsKlick from './KorsKlick'
import { NyaTraffar, NyaTraffarSkelett } from './NyaTraffar'

const LOGGA_HREF = soktaHref({ logga: 'sokt' })
// Nolläget (beslut 22): länken i väggen, märkt med varifrån den kom.
const LOGGA_FORSTA_NY_HREF = soktaHref({ logga: 'sokt', fran: 'oversikt-ny' })
const LOGGA_FORSTA_HREF = soktaHref({ logga: 'sokt', fran: 'oversikt-forsta' })
const KORS_LANK_HREF = '/dashboard/tester'

const IKON: Record<AttGoraIkon, ReactNode> = {
  kalender: <IkonKalender />,
  kuvert: <IkonMejl />,
  penna: <IkonPenna />,
  dokument: <IkonDokument />,
  flagga: <IkonFlagga />,
  fraga: <IkonPrat />,
}

const Logga = () => (
  <GlasKnapp href={LOGGA_HREF} ikon={<IkonPlus />}>
    Logga sökt tjänst
  </GlasKnapp>
)

const Atgarder = () => <Topprad bara="atgarder" />

/** "Logga sökt tjänst" sist på sidan på telefon (beslut efter etapp 1), inte i en fast fot. */
function LoggaMobil() {
  return (
    <div className="mt-8 xl:hidden">
      <LitenKnapp storlek={52} bred href={LOGGA_HREF} ikon={<IkonPlus size={20} />}>
        Logga sökt tjänst
      </LitenKnapp>
    </div>
  )
}

function arPremium(profile: Record<string, unknown> | null | undefined): boolean {
  const until = profile?.premium_until as string | undefined
  return !!(profile?.subscription_tier === 'premium' || (until && new Date(until) > new Date()) || profile?.premium_source)
}

export interface OversiktVyProps {
  data: JobbsokOversikt
  userId: string
  /** ?cv=1 i adressen (träningsfokus visar CV-läget ändå). */
  visaCv: boolean
}

export default function OversiktVy({ data, userId, visaCv }: OversiktVyProps) {
  const s = data.summering
  const cvCount = s?.cv.count ?? 0
  const totalLetters = s?.letters.total ?? 0
  const vy = startvy({
    cvCount,
    totalLetters,
    scope: s?.paket?.scope ?? null,
    intent: s?.komIgang?.intent ?? null,
    visaCv,
  })
  const klient = <OversiktKlient state={vy.state} cvCount={cvCount} totalLetters={totalLetters} />

  if (vy.traningsFokus) {
    return <TraningsVy data={data} testForst={vy.testForst} valtVidStart={vy.valtVidStart} klient={klient} />
  }
  if (data.attGora.lage === 'utan_cv') return <NyVy data={data} klient={klient} />
  return <MainVy data={data} userId={userId} klient={klient} premium={arPremium(s?.profile as Record<string, unknown> | null)} />
}

/* ================================================================== Main */

function goraRubrik(n: number): string {
  return `${stor(ordtal(n))} ${n === 1 ? 'sak' : 'saker'} som för jobbsöket framåt`
}

function MainVy({ data, userId, klient, premium }: { data: JobbsokOversikt; userId: string; klient: ReactNode; premium: boolean }) {
  const { attGora, veckansMal: mal, idag } = data
  const forsta: AttGoraHandling | undefined = attGora.handlingar[0]
  const ogonMobil = `${veckodagKort(idag)} ${kortDag(idag)} · vecka ${isoVecka(idag)}`
  const oppnaAntal = data.tjanster.filter((t) => !t.avslutad).length
  // Nolläget: inga sökta tjänster och inget under Ska sökas (och inget läsfel).
  const utanRader = !data.lasfel && data.tjanster.length === 0 && data.skaSokas.length === 0

  return (
    <>
      <JobbVagg hojd={596} hojdMobil={500} flik="oversikt" handling={<Logga />} atgarder={<Atgarder />} etikett="Läget och nästa steg">
        <VaggHero spalt={480} glapp={28} bild={<JobbsokBana {...banaProps(data.bana)} />}>
          <VaggText
            ogon={attGora.vagg.overrad}
            ogonMobil={ogonMobil}
            ogonHoger={<VeckansMal kompakt antal={mal.sokta} mal={mal.mal} />}
            rubrik={attGora.vagg.rubrik}
            ingress={attGora.vagg.text}
          />
          <Knapprad rad={forsta?.typ === 'forbered_intervju' ? 'En kvart räcker.' : undefined}>
            <StorKnapp href={attGora.vagg.knapp.href}>
              {attGora.vagg.knapp.text}
              <IkonPil />
            </StorKnapp>
          </Knapprad>
          {utanRader ? (
            <Chips stapel>
              <TextLank vagg href={LOGGA_FORSTA_HREF}>
                Har du redan sökt en tjänst? Logga den
              </TextLank>
            </Chips>
          ) : null}
          <Chips dator>
            <VeckansMalAndra antal={mal.sokta} mal={mal.mal} forval={mal.forval} />
          </Chips>
        </VaggHero>
      </JobbVagg>

      <Golv>
        <LyftPanel rubrikId="gora-rubrik">
          {attGora.handlingar.length > 0 ? (
            <>
              <PanelHuvud
                ogon="Att göra nu"
                rubrik={goraRubrik(attGora.handlingar.length)}
                rubrikId="gora-rubrik"
                hoger="Ordnade efter datum. Det som brinner står först."
              />
              <GoraLista>
                {attGora.handlingar.map((h, i) => {
                  const m = goraMobil(h, data.tjanster)
                  return (
                    <GoraKort
                      key={h.nyckel}
                      ton={goraTon(h, i)}
                      ikon={IKON[h.ikon]}
                      nar={h.overrad}
                      rubrik={h.rubrik}
                      rubrikMobil={m.rubrik}
                      text={h.text}
                      textMobil={m.text}
                      href={h.knapp.href}
                      knapp={h.knapp.text}
                    />
                  )
                })}
              </GoraLista>
            </>
          ) : (
            <>
              <PanelHuvud ogon="Att göra nu" rubrik="Inget som brinner just nu" rubrikId="gora-rubrik" />
              <div className="mt-4">
                <TomtLage
                  inbaddad
                  ikon={<IkonKalender />}
                  text={
                    oppnaAntal > 0
                      ? 'Vi säger till här när det är dags att följa upp, förbereda en intervju eller söka före sista dag.'
                      : 'När du sparar en annons eller loggar en sökt tjänst säger vi till här vad som är nästa steg.'
                  }
                />
              </div>
            </>
          )}
        </LyftPanel>

        {klient}

        {data.harCv ? (
          <Suspense fallback={<NyaTraffarSkelett />}>
            <NyaTraffar userId={userId} idag={idag} />
          </Suspense>
        ) : null}

        <Spalter sido={380}>
          <section aria-labelledby="sokta-rubrik">
            <SektionsHuvud
              rubrikId="sokta-rubrik"
              rubrik="Sökta tjänster"
              lank={data.tjanster.length > 0 ? { href: SOKTA_HREF, text: `Alla ${data.tjanster.length}` } : undefined}
            />
            {data.lasfel ? (
              <Felruta text="Vi kunde inte hämta dina sökta tjänster just nu." forsokHref="/dashboard" />
            ) : data.tjansterKort.length > 0 ? (
              <Kort lista>
                {data.tjansterKort.map((t) => {
                  const r = tjanstRad(t, idag)
                  return (
                    <TjanstRad
                      key={t.id}
                      bricka={r.bricka}
                      rubrik={r.rubrik}
                      rubrikMobil={r.rubrikMobil}
                      text={r.text}
                      textMobil={r.textMobil}
                      steg={r.steg}
                      status={r.status}
                      href={r.href}
                    />
                  )
                })}
              </Kort>
            ) : (
              <TomtLage
                ikon={<IkonVaska />}
                rubrik={data.tjanster.length > 0 ? 'Inga öppna sökta tjänster just nu' : 'Inga sökta tjänster än'}
                text={
                  data.tjanster.length > 0
                    ? 'Alla du har loggat är avslutade. Logga nästa, så håller vi koll på svaret.'
                    : 'Logga den första, så håller vi koll på svaren och säger till när det är dags att följa upp.'
                }
                handling={
                  <LitenKnapp href={LOGGA_HREF} ikon={<IkonPlus />}>
                    Logga sökt tjänst
                  </LitenKnapp>
                }
              />
            )}
          </section>
          <aside aria-labelledby="mer-rubrik">
            <SektionsHuvud rubrikId="mer-rubrik" rubrik="Mer i Jobbsöket" />
            <MerIJobbsoket data={data} />
          </aside>
        </Spalter>

        <div className="mt-6 flex flex-col gap-4">
          <QuotaNudgeRow isPremium={premium} />
          <ProfilKomplettering />
        </div>

        {data.tjansterKort.length > 0 || data.lasfel ? <LoggaMobil /> : null}
      </Golv>
    </>
  )
}

function MerIJobbsoket({ data, utanUpptackt }: { data: JobbsokOversikt; utanUpptackt?: boolean }) {
  const kors = korsreferens(data.summering?.jobbsok?.traning ?? null, data.idag)
  const intervju = data.summering?.intervju
  const visaArbetsstil = Boolean(intervju?.harProfil)
  const upptackt = bliUpptacktRad({ synlig: data.bliUpptacktSynlig, ...data.bliUpptacktTal }, MER.bliUpptackt)
  return (
    <KorsKlick variant={kors.variant === 'niva' ? 'niva' : 'aldrig_matt'}>
      <Kort lista>
        {utanUpptackt ? null : (
          <SidoRad
            ikon={<IkonOga />}
            rubrik={MER.bliUpptackt.titel}
            text={upptackt.text}
            href="/dashboard/bli-upptackt"
            hoger={upptackt.vantar ? <StatusPiller status="folj-upp">{CHIP.vantar(upptackt.vantar)}</StatusPiller> : undefined}
          />
        )}
        <SidoRad ikon={<IkonPrat />} rubrik={MER.jobbcoachen.titel} text={MER.jobbcoachen.meta} href="/dashboard/jobbcoachen" />
        {visaArbetsstil ? (
          <SidoRad ikon={<IkonPerson />} rubrik="Din arbetsstil" text="Hur du arbetar, samarbetar och drivs, i ord." href="/dashboard/arbetsstil" />
        ) : null}
        <SidoRad
          ikon={<IkonRutnat />}
          ikonTon="test"
          rubrik={kors.variant === 'niva' ? 'Rekryteringstester' : KORS.aldrigMattFraga}
          text={kors.variant === 'niva' ? kors.text : `${KORS.aldrigMattTitel} ${KORS.lank}.`}
          href={KORS_LANK_HREF}
        />
      </Kort>
    </KorsKlick>
  )
}

/* ================================================================== Ny */

function NyVy({ data, klient }: { data: JobbsokOversikt; klient: ReactNode }) {
  const v = data.attGora.vagg
  return (
    <>
      <JobbVagg hojd={566} hojdMobil={480} flik="oversikt" handling={<Logga />} atgarder={<Atgarder />} etikett="Läget och nästa steg">
        <VaggHero
          spalt={480}
          glapp={28}
          bild={
            <JobbsokBanaNy
              etikett="Vägen i Jobbsöket: först CV:t, sedan de första träffarna, sedan den första sökta tjänsten, och till sist ett erbjudande."
              steg={[{ rubrik: 'CV:t in' }, { rubrik: 'Första träffarna', under: 'jobb som passar ditt CV' }, { rubrik: 'Första sökta tjänsten', under: 'vi håller koll på svaren' }]}
            />
          }
        >
          <VaggText ogon="Börja här" rubrik={v.rubrik} ingress={v.text} />
          <Knapprad rad="PDF, Word eller text. Namn, telefon och adress maskas först.">
            <StorKnapp href={v.knapp.href}>
              {v.knapp.text}
              <IkonPil />
            </StorKnapp>
          </Knapprad>
          <Chips stapel>
            <TextLank vagg href="/dashboard/skapa-cv">
              Har du inget CV? Bygg ett här
            </TextLank>
            <TextLank vagg href={LOGGA_FORSTA_NY_HREF}>
              Har du redan sökt en tjänst? Logga den
            </TextLank>
          </Chips>
        </VaggHero>
      </JobbVagg>
      <Golv>
        <LyftPanel rubrikId="ny-rubrik">
          <PanelHuvud ogon="När CV:t är inne" rubrik="Tre saker Jobbsöket gör åt dig" rubrikId="ny-rubrik" />
          <StegKortRad>
            <StegKort
              nr={2}
              rubrik="Hittar jobb som passar"
              text="Vi läser ditt CV och letar bland Arbetsförmedlingens annonser. Varje träff säger varför den passar."
              bild={
                <span className="flex items-center gap-4">
                  <Matchring procent={86} storlek={64} />
                  <span className="flex flex-col gap-1.5 text-[13px] leading-[18px]">
                    <span>Din roll matchar</span>
                    <span>5 av 6 kompetenser</span>
                  </span>
                </span>
              }
            />
            <StegKort
              nr={3}
              rubrik="Håller koll på svaren"
              text="Logga varje sökt tjänst, så påminner vi när det är dags att följa upp och sammanställer månaden åt Arbetsförmedlingen."
              bild={
                <>
                  <Bricka kod="AB" />
                  <FyrstegsBana steg={2} />
                </>
              }
            />
            <StegKort
              nr={<IkonFlagga size={16} />}
              koppar
              rubrik="Förbereder intervjun"
              text={HEM.forberederText(scopeHasFeature(data.summering?.paket?.scope ?? null, 'interview_unlimited'))}
              bild={<Rutor antal={4} />}
            />
          </StegKortRad>
        </LyftPanel>

        {klient}

        <div className="mt-6 grid gap-4 xl:mt-8 xl:grid-cols-2 xl:gap-5">
          <Kort lista>
            <SidoRad
              ikon={<IkonPlus />}
              rubrik="Har du redan sökt jobb?"
              text="Logga en sökt tjänst. Företag, tjänst och datum räcker, och det går utan CV."
              href={LOGGA_HREF}
            />
          </Kort>
          <KorsKlick variant="aldrig_matt">
            <Kort lista>
              <SidoRad
                ikon={<IkonRutnat />}
                ikonTon="test"
                rubrik={KORS.aldrigMattFraga}
                text={`${KORS.aldrigMattTitel} ${KORS.lank}.`}
                href={KORS_LANK_HREF}
              />
            </Kort>
          </KorsKlick>
        </div>
        <div className="mt-4">
          <ProfilKomplettering />
        </div>
      </Golv>
    </>
  )
}

/* ================================================================== Träning */

function TraningsVy({
  data,
  testForst,
  valtVidStart,
  klient,
}: {
  data: JobbsokOversikt
  testForst: boolean
  valtVidStart: string | null
  klient: ReactNode
}) {
  const s = data.summering
  const steg = traningsHandling(s?.intervju, testForst)
  const k = traningsKopia(steg)
  const nu = new Date()
  const rad =
    s?.paket?.scope === 'tester' ? HEM.traning.rad : valtVidStart === 'intervju' ? HEM.traning.radValtIntervju : HEM.traning.radValtTester
  return (
    <>
      <JobbVagg hojd={440} hojdMobil={360} flik="oversikt" handling={<Logga />} atgarder={<Atgarder />} etikett="Läget och nästa steg">
        <VaggHero spalt={560}>
          <VaggText ogon={dagensDatum(nu)} rubrik={`${halsning(nu)}${data.fornamn ? `, ${data.fornamn}` : ''}.`} ingress={rad} />
        </VaggHero>
      </JobbVagg>
      <Golv>
        <LyftPanel rubrikId="traning-rubrik">
          <PanelHuvud ogon="Nästa steg i träningen" rubrik={k.rubrik} rubrikId="traning-rubrik" under={k.text} />
          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-6">
            <TraningsKnapp href={k.href} kind={steg.kind}>
              {k.knapp}
            </TraningsKnapp>
            <TextLank href="/dashboard?cv=1">{HEM.traning.cvLank}</TextLank>
          </div>
        </LyftPanel>
        {klient}
        <Avsnitt rubrikId="mer-rubrik">
          <SektionsHuvud rubrikId="mer-rubrik" rubrik="Mer i Jobbsöket" />
          <div className="xl:max-w-[560px]">
            <MerIJobbsoket data={data} />
          </div>
        </Avsnitt>
        <LoggaMobil />
      </Golv>
    </>
  )
}

