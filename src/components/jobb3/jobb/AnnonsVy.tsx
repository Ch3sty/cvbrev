/**
 * Annonsen i Matchade jobb (skissen Jobb, Jobb-gratis och Mobil-jobb-annons):
 * huvudet med sista ansökningsdag, "Därför passar du" med kompetenserna en
 * och en, de tre handlingarna, faktarutorna och annonsens text. Plus den
 * dolda träffen på gratisnivån, med dagens betalvägg i rummets ram.
 *
 * Inga hooks: MatchadeJobb äger tillståndet och skickar in handlingarna.
 */
import type { ReactNode } from 'react'
import PaywallCard from '@/components/paywall/PaywallCard'
import {
  AnnonsText,
  Bricka,
  FaktaRutor,
  IkonBock,
  IkonBokmark,
  IkonLas,
  IkonPil,
  KompetensRad,
  KravRutor,
  LitenKnapp,
  Passar,
  Skel,
  SparrRam,
  StatusPiller,
  StorKnapp,
} from '@/components/jobb3/kit'
import { brickBokstaver, soktaHref, type SistaAnsokningsdag } from '@/lib/jobbsok'
import { ansokan, arbetsgivareOrt, faktaRutor, kravOchMeriterande, type PassarSkal } from './annons'

type Annons = Record<string, any>

export type SparLage = 'idle' | 'sparar' | 'sparad' | 'fel'
export type SoktLage = 'idle' | 'sparar' | 'sokt' | 'fel'

export interface AnnonsHandlingar {
  onSkrivBrev: () => void
  onSpara: () => void
  onSokt: () => void
  spara: SparLage
  sokt: SoktLage
}

function skalTillKit(skal: PassarSkal[]): { rubrik: string; text?: ReactNode }[] {
  return skal.map((s) => ({
    rubrik: s.rubrik,
    text: s.kompetenser ? <KompetensRad har={s.kompetenser.har} saknas={s.kompetenser.saknas} /> : s.text,
  }))
}

const sparText = (l: SparLage) => (l === 'sparad' ? 'Sparad i Ska sökas' : l === 'sparar' ? 'Sparar' : l === 'fel' ? 'Försök spara igen' : 'Spara till Ska sökas')
const soktText = (l: SoktLage) => (l === 'sokt' ? 'Loggad som sökt' : l === 'sparar' ? 'Sparar' : l === 'fel' ? 'Försök igen' : 'Markera som sökt')

function DagPiller({ sista }: { sista: SistaAnsokningsdag | null }) {
  if (!sista) return null
  if (sista.passerad) return <StatusPiller status="avslutad">Sista dag har passerat</StatusPiller>
  return <StatusPiller status={sista.dagarKvar <= 7 ? 'folj-upp' : 'vantar'}>{sista.text}</StatusPiller>
}

/** Annonsens text: arbetsuppgifter, vi söker, krav, om företaget, villkor, kontakt. */
export function AnnonsInnehall({ job }: { job: Annons }) {
  const { krav, meriterande } = kravOchMeriterande(job)
  const d = job.description ?? {}
  const kontakt = Array.isArray(job.application_contacts) ? job.application_contacts[0] : job.application_contacts
  return (
    <>
      <AnnonsText>
        {d.text_formatted || d.text ? (
          <>
            <h3>Arbetsuppgifter</h3>
            {d.text_formatted ? (
              <div dangerouslySetInnerHTML={{ __html: d.text_formatted }} />
            ) : (
              <p className="whitespace-pre-wrap">{d.text}</p>
            )}
          </>
        ) : null}
        {d.needs ? (
          <>
            <h3>Vi söker</h3>
            <div dangerouslySetInnerHTML={{ __html: d.needs }} />
          </>
        ) : null}
      </AnnonsText>
      {krav.length > 0 ? <KravRutor krav={krav} meriterande={meriterande} /> : null}
      <AnnonsText>
        {d.company_information ? (
          <>
            <h3>Om företaget</h3>
            <div dangerouslySetInnerHTML={{ __html: d.company_information }} />
          </>
        ) : null}
        {d.conditions || job.access ? (
          <>
            <h3>Villkor</h3>
            {d.conditions ? <div dangerouslySetInnerHTML={{ __html: d.conditions }} /> : null}
            {job.access ? <p>Tillträde: {job.access}</p> : null}
          </>
        ) : null}
        {kontakt && (kontakt.name || kontakt.email || kontakt.telephone) ? (
          <>
            <h3>Kontaktperson</h3>
            {kontakt.name ? <p>{kontakt.name}{kontakt.description ? `, ${kontakt.description}` : ''}</p> : null}
            {kontakt.email ? (
              <p>
                <a href={`mailto:${kontakt.email}`} className="break-all underline underline-offset-4">
                  {kontakt.email}
                </a>
              </p>
            ) : null}
            {kontakt.telephone ? (
              <p>
                <a href={`tel:${kontakt.telephone}`} className="underline underline-offset-4">
                  {kontakt.telephone}
                </a>
              </p>
            ) : null}
          </>
        ) : null}
      </AnnonsText>
    </>
  )
}

export interface AnnonsProps {
  job: Annons
  procent: number
  skal: PassarSkal[]
  sista: SistaAnsokningsdag | null
  handlingar: AnnonsHandlingar
}

/** Annonsen bredvid listan på dator (från 1280 px). */
export function AnnonsPanel({ job, procent, skal, sista, handlingar: h }: AnnonsProps) {
  const a = ansokan(job)
  return (
    <article aria-labelledby="annons-rubrik" className="px-4 py-5 xl:px-[30px] xl:pb-[30px] xl:pt-[26px]">
      <div className="flex items-start gap-4">
        <Bricka kod={brickBokstaver(String(job.employer?.name ?? ''))} mobil={56} dator={60} />
        <div className="min-w-0 flex-1">
          <h2 id="annons-rubrik" className="j3-h2 stor xl:!text-[30px] xl:!leading-[36px]">
            {job.headline}
          </h2>
          <p className="j3-under">{arbetsgivareOrt(job)}</p>
        </div>
        <span className="mt-1 shrink-0">
          <DagPiller sista={sista} />
        </span>
      </div>
      <Passar procent={procent} skal={skalTillKit(skal)} />
      <div className="mt-[22px] flex flex-wrap gap-3">
        <StorKnapp storlek="mellan" golv onClick={h.onSkrivBrev}>
          Skriv brev
          <IkonPil />
        </StorKnapp>
        <LitenKnapp storlek={48} ikon={<IkonBokmark />} onClick={h.onSpara} disabled={h.spara === 'sparar' || h.spara === 'sparad'}>
          {sparText(h.spara)}
        </LitenKnapp>
        <LitenKnapp storlek={48} ikon={<IkonBock />} onClick={h.onSokt} disabled={h.sokt === 'sparar' || h.sokt === 'sokt'}>
          {soktText(h.sokt)}
        </LitenKnapp>
      </div>
      <p className="j3-fin mt-3" aria-live="polite">
        Brevet öppnas med annonsen ifylld.{' '}
        {a.url ? (
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            {a.text}
          </a>
        ) : null}
      </p>
      {faktaRutor(job).length ? (
        <div className="mt-[22px]">
          <FaktaRutor rutor={faktaRutor(job)} />
        </div>
      ) : null}
      <AnnonsInnehall job={job} />
    </article>
  )
}

/** Telefonens egen vy för annonsen (Mobil-jobb-annons): kortet med skälen, texten och foten. */
export function AnnonsKortMobil({ job, procent, skal }: Pick<AnnonsProps, 'job' | 'procent' | 'skal'>) {
  const fakta = faktaRutor(job).slice(0, 2)
  return (
    <>
      <Passar procent={procent} ogon="Därför passar du" skal={skalTillKit(skal)} />
      {fakta.length ? (
        <div className="mt-3">
          <FaktaRutor rutor={fakta} />
        </div>
      ) : null}
    </>
  )
}

/* ------------------------------------------------- annonsens fot på telefon */

/** Länken från foten in i Sökta tjänster (mäts som sidvisning med fran=annons-fot). */
export const FOT_SPARAD_HREF = soktaHref({ filter: 'ska-sokas', fran: 'annons-fot' })
export const FOT_SOKT_HREF = soktaHref({ fran: 'annons-fot' })

/**
 * Vänster knapp i fotens andra rad (byggspecen 3.3). "Spara" räcker på
 * telefon, hela meningen står i aria-label; datorn behåller sparText.
 */
export function sparTextMobil(l: SparLage): { text: string; etikett?: string } {
  if (l === 'sparad') return { text: 'Sparad', etikett: 'Sparad i Ska sökas. Visa listan' }
  if (l === 'sparar') return { text: 'Sparar' }
  if (l === 'fel') return { text: 'Försök igen', etikett: 'Försök spara igen' }
  return { text: 'Spara', etikett: 'Spara till Ska sökas' }
}

/** Höger knapp i fotens andra rad. I läget sökt blir raden en enda länk. */
export function soktTextMobil(l: SoktLage): string {
  if (l === 'sokt') return 'Loggad som sökt. Visa listan'
  if (l === 'sparar') return 'Sparar'
  if (l === 'fel') return 'Försök igen'
  return 'Markera som sökt'
}

/**
 * Foten i telefonens annonsvy, under 1280 px: "Skriv brev" i full bredd
 * överst, Spara och Markera som sökt med text under (beslut 22). Ritas i
 * <FastFot rader>. Inga hooks: lägena kommer som egenskaper.
 */
export function AnnonsFotMobil({ job, handlingar: h }: Pick<AnnonsProps, 'job' | 'handlingar'>) {
  void job
  const spara = sparTextMobil(h.spara)
  return (
    <>
      <StorKnapp onClick={h.onSkrivBrev}>
        Skriv brev
        <IkonPil />
      </StorKnapp>
      {h.sokt === 'sokt' ? (
        <LitenKnapp storlek={48} bred ikon={<IkonBock />} href={FOT_SOKT_HREF}>
          {soktTextMobil(h.sokt)}
        </LitenKnapp>
      ) : (
        <>
          {h.spara === 'sparad' ? (
            <LitenKnapp storlek={48} ikon={<IkonBock />} href={FOT_SPARAD_HREF} aria-label={spara.etikett}>
              {spara.text}
            </LitenKnapp>
          ) : (
            <LitenKnapp storlek={48} ikon={<IkonBokmark />} onClick={h.onSpara} disabled={h.spara === 'sparar'} aria-label={spara.etikett}>
              {spara.text}
            </LitenKnapp>
          )}
          <LitenKnapp storlek={48} ikon={<IkonBock />} onClick={h.onSokt} disabled={h.sokt === 'sparar'}>
            {soktTextMobil(h.sokt)}
          </LitenKnapp>
        </>
      )}
    </>
  )
}

/* ------------------------------------------------------------ den dolda träffen */

export function DoldPassar({ procent }: { procent: number }) {
  const rad = (b1: string, b2: string) => (
    <span className="mt-1 block" aria-hidden="true">
      <Skel b={b1} h={12} />
      <Skel b={b2} h={9} stil={{ marginTop: 8 }} />
    </span>
  )
  return (
    <Passar
      procent={procent}
      skal={[
        { rubrik: ' ', text: rad('40%', '70%') },
        { rubrik: '  ', text: rad('50%', '80%') },
        { rubrik: '   ', text: rad('25%', '45%') },
      ]}
    />
  )
}

export function Betalvagg({ hiddenCount }: { hiddenCount: number }) {
  return (
    <SparrRam etikett="Ingår i Premium">
      <PaywallCard variant="jobbtraffar" hiddenCount={hiddenCount} bare />
    </SparrRam>
  )
}

/** Den dolda träffen bredvid listan (Jobb-gratis): ringen, suddiga skäl och betalväggen. */
export function DoldPanel({ procent, hiddenCount }: { procent: number; hiddenCount: number }) {
  return (
    <article aria-labelledby="annons-rubrik" className="px-4 py-5 xl:px-[30px] xl:pb-[30px] xl:pt-[26px]">
      <div className="flex items-center gap-4">
        <Bricka kod="" ton="las" mobil={56} dator={60}>
          <IkonLas />
        </Bricka>
        <div className="min-w-0 flex-1">
          <h2 id="annons-rubrik" className="j3-h2 stor xl:!text-[30px] xl:!leading-[36px]">
            Dold träff
          </h2>
          <p className="j3-under">Matchar ditt CV till {procent} procent</p>
        </div>
      </div>
      <DoldPassar procent={procent} />
      <div className="mt-[22px]">
        <Betalvagg hiddenCount={hiddenCount} />
      </div>
      <div className="mt-6 flex flex-col gap-3" aria-hidden="true">
        <Skel b={210} h={18} />
        <Skel b="96%" h={12} />
        <Skel b="92%" h={12} />
        <Skel b="97%" h={12} />
        <Skel b="58%" h={12} />
      </div>
      <p className="j3-fin mt-8">De tre bästa träffarna är alltid öppna, med hela annonsen och alla skäl.</p>
    </article>
  )
}
