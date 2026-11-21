'use client'

/**
 * En sökt tjänst (skisserna Sokta-tjanst, Sokta-folj-upp, Mobil-tjanst).
 * Väggen: tjänstens huvud, datumbrickan med "Ändra tid" och tjänstens bana.
 * Panelen "Nästa steg": Hur gick intervjun?, Förbered intervjun (de sju
 * frågorna och Kraven i annonsen) eller Följ upp. Sedan Händelser som lodrät
 * bana med uppföljningarna insorterade, snabbvalen, och Om tjänsten.
 *
 * Datan kommer från hamtaSoktTjanst på servern; efter en ändring hämtas den
 * om med router.refresh(). Det som användaren själv just gjort (svarat på
 * Hur gick intervjun?, loggat en uppföljning) syns direkt ur lokalt läge,
 * innan serverdatan är tillbaka (klicktestet 2026-11-21).
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Topprad from '@/components/rum/Topprad'
import { useNotification } from '@/context/notificationcontext'
import {
  JobbVagg,
  VaggHero,
  TjanstHuvud,
  TjanstBana,
  DatumRuta,
  DatumBricka,
  GlasKnapp,
  TextLank,
  Golv,
  LyftPanel,
  PanelHuvud,
  Spalter,
  SektionsHuvud,
  Kort,
  TonYta,
  Fakta,
  Fragor,
  FragaKort,
  FragaAllt,
  KravLista,
  Handelsebana,
  Snabbval,
  StorKnapp,
  LitenKnapp,
  IkonPil,
  IkonPenna,
  IkonBock,
  IkonVaska,
  IkonFlagga,
  IkonAvslag,
  IkonKalender,
  IkonMejl,
  IkonPrat,
  type Handelse as BanHandelse,
} from '@/components/jobb3/kit'
import { STATUS_META } from '@/lib/applications/status'
import { INFOR_INTERVJUN_HREF, nyttProvHref } from '@/lib/intervju/lankar'
import {
  dagarMellan,
  foljdeUppRad,
  handelseEtikett,
  idagSv,
  klockslag,
  kortDag,
  langDag,
  langDagMedAr,
  narText,
  ordtal,
  veckodagNamn,
  veckodagOchDag,
  type ApplicationEventType,
  type HandelseListRad,
  type TjanstFokus,
  type Uppfoljning as UppfoljningRad,
} from '@/lib/jobbsok'
import type { SoktTjanstData } from '@/lib/jobbsok/server'
import LoggaArk from './LoggaArk'
import Uppfoljning from './Uppfoljning'
import { BekraftArk, HandelseArk, HurGickSvar, IntervjuTidArk, anropa, handelseNamn } from './SmaArk'
import { KANAL_NAMN, Ordtal, stor, varRad } from './text'

type Block = 'hur-gick' | 'forbered' | 'folj-upp' | null

const MANAD_KORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

export default function TjanstVy({ data, fokus }: { data: SoktTjanstData; fokus: TjanstFokus }) {
  const router = useRouter()
  const { successWithActivity, success } = useNotification()
  const { tjanst: t, ansokan: a, forberedelse: f, uppfoljning: u } = data
  const idag = idagSv()
  const i = t.intervju

  const [redigera, setRedigera] = useState(false)
  const [handelse, setHandelse] = useState<{ open: boolean; typ: ApplicationEventType | null }>({ open: false, typ: null })
  const [tidArk, setTidArk] = useState<'andra' | 'flyttad' | null>(fokus === 'andra-tid' && i ? 'andra' : null)
  const [taBortTjanst, setTaBortTjanst] = useState(false)
  const [taBortRad, setTaBortRad] = useState<{ typ: 'handelse' | 'foljde_upp'; id: string; rubrik: string } | null>(null)
  const [ratta, setRatta] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  // Uppföljningen som just loggades, tills serverdatan har den (fel 4 i klicktestet).
  const [lokalUppf, setLokalUppf] = useState<UppfoljningRad | null>(null)
  // Intervjutiden som "Hur gick intervjun?" just besvarades för.
  const [hurGickSvarat, setHurGickSvarat] = useState<string | null>(null)
  const serverHarLokal = !!lokalUppf && data.handelselista.some((r) => r.typ === 'foljde_upp' && r.radId === lokalUppf.id)
  useEffect(() => {
    if (serverHarLokal) setLokalUppf(null)
  }, [serverHarLokal])
  const tyst = t.tyst && !lokalUppf
  const uppfoljdIdag = !t.avslutad && (u.senastSkickad?.sent_at === idag || lokalUppf?.sent_at === idag)
  const hurGickBesvarad = !!i && i.lage === 'hur_gick' && hurGickSvarat !== null && hurGickSvarat === (i.tid ?? '')

  // Vilket block panelen visar, räknat ur dagens data vid varje ritning. Bara
  // Följ upp står kvar när den väl har visats, så att bekräftelsen och Ångra
  // syns efter att tjänsten lämnat Följ upp. "Hur gick intervjun?" står
  // aldrig kvar när frågan är besvarad (klicktestet 2026-11-21).
  // Följ upp visas när tjänsten är tyst, har ett utkast eller följdes upp i
  // dag (så att "Följde upp i dag" och Ångra står kvar efter en omladdning).
  const grund: Block = t.avslutad
    ? null
    : i?.lage === 'hur_gick' && !hurGickBesvarad
      ? 'hur-gick'
      : i && (i.lage === 'bokad' || i.lage === 'utan_tid')
        ? 'forbered'
        : tyst || u.utkast || uppfoljdIdag
          ? 'folj-upp'
          : null
  const onskat: Block =
    fokus === 'folj-upp' && !t.avslutad
      ? 'folj-upp'
      : fokus === 'forbered' && t.station === 'intervju'
        ? 'forbered'
        : fokus === 'hur-gick' && i?.lage === 'hur_gick' && !hurGickBesvarad
          ? 'hur-gick'
          : null
  const [foljUppVisad, setFoljUppVisad] = useState((onskat ?? grund) === 'folj-upp')
  const block: Block = foljUppVisad ? 'folj-upp' : grund ?? onskat
  useEffect(() => {
    if (block === 'folj-upp') setFoljUppVisad(true)
  }, [block])

  useEffect(() => {
    if (fokus && fokus !== 'andra-tid' && panel.current) panel.current.scrollIntoView({ block: 'start' })
  }, [fokus])

  const uppdatera = () => router.refresh()
  const genomforda = data.handelser.filter((h) => h.event_type === 'interview_completed').length

  /* ------------------------------------------------------------ väggen */

  const aktuell = data.steg.punkter.find((p) => p.aktuell)?.steg ?? 'sokt'
  const datum: Partial<Record<'sokt' | 'svar' | 'intervju' | 'erbjudande', string>> = {}
  const datumMobil: typeof datum = {}
  for (const p of data.steg.punkter) {
    if (p.etikett && (p.klar || p.aktuell || p.steg === 'intervju')) datum[p.steg] = p.etikett
  }
  if (i?.dag) datumMobil.intervju = veckodagOchDag(i.dag)
  const banEtikett = `Tjänstens väg: ${data.steg.punkter.map((p) => `${p.steg === 'sokt' ? 'sökt' : p.steg}${p.etikett ? ` ${p.etikett}` : ''}${p.klar || p.aktuell ? '' : ' återstår'}`).join(', ')}.`

  const ogon = t.avslutad
    ? STATUS_META[t.status ?? 'rejected'].label
    : tyst
      ? `Tyst i ${t.dagarTyst} dagar`
      : i?.lage === 'vantar_besked'
        ? 'Intervju genomförd'
        : i?.lage === 'hur_gick'
          ? 'Intervjun har varit'
          : i
            ? 'Kallad till intervju'
            : t.station === 'erbjudande'
              ? STATUS_META[t.status ?? 'offer_received'].label
              : 'Väntar svar'

  const intervjuRubrik = i?.dag
    ? `Intervju ${veckodagNamn(i.dag)} ${langDag(i.dag)}${klockslag(i.tid) ? `, ${klockslag(i.tid)}` : ''}`
    : null
  const dagarKvar = i?.dag ? dagarMellan(idag, i.dag) : null
  const omText = dagarKvar == null ? '' : dagarKvar < 0 ? 'Har varit.' : dagarKvar === 0 ? 'I dag.' : dagarKvar === 1 ? 'I morgon.' : `Om ${dagarKvar} dagar.`
  const tidLank = (vagg: boolean) =>
    i && i.lage !== 'vantar_besked' ? (
      <TextLank vagg={vagg} onClick={() => setTidArk('andra')}>
        {i.tid ? 'Ändra tid' : 'Sätt tid'}
      </TextLank>
    ) : null
  const datumBricka = (pa: 'vagg' | 'golv') =>
    i?.dag ? <DatumBricka manad={MANAD_KORT[Number(i.dag.slice(5, 7)) - 1]} dag={Number(i.dag.slice(8, 10))} pa={pa} /> : null

  const visaDatumRuta = !!(i && (i.lage === 'bokad' || i.lage === 'hur_gick') && i.dag)
  const ingressVagg = tyst
    ? `Du sökte ${veckodagNamn(t.appliedAt)} ${langDag(t.appliedAt)} och har inte hört något. Efter två veckor är det helt i sin ordning att fråga.`
    : i?.lage === 'utan_tid'
      ? 'Du är kallad till intervju. Sätt tiden när du vet den, så påminner vi och frågar hur det gick.'
      : null

  /* -------------------------------------------------------- händelserna */

  // Uppföljningen som just loggades står med direkt; en som just ångrats tas bort.
  const lista: HandelseListRad[] = [...data.handelselista]
  const lokalRad = lokalUppf && !serverHarLokal ? foljdeUppRad(lokalUppf) : null
  if (lokalRad) {
    const kommande = lista.findIndex((r) => r.typ === 'kommande_intervju')
    lista.splice(kommande < 0 ? lista.length : kommande, 0, lokalRad)
  }
  const rader: BanHandelse[] = lista.map((r) => {
    const kanTas = ratta && r.typ !== 'kommande_intervju'
    const text: ReactNode = (
      <>
        {r.text}
        {kanTas ? (
          <>
            {' '}
            <TextLank liten onClick={() => setTaBortRad({ typ: r.typ === 'foljde_upp' ? 'foljde_upp' : 'handelse', id: r.radId, rubrik: r.rubrik })}>
              {r.typ === 'foljde_upp' ? 'Ångra' : 'Ta bort'}
            </TextLank>
          </>
        ) : null}
      </>
    )
    if (r.typ === 'kommande_intervju') {
      return { rubrik: r.rubrik, datum: handelseEtikett(r), datumKoppar: true, text, lage: 'snart', ikon: <IkonKalender size={20} /> }
    }
    return {
      rubrik: r.rubrik,
      // Händelsens egen dag: "Kallad till intervju" visar dagen kallelsen kom, inte intervjutiden.
      datum: handelseEtikett(r),
      text: r.text || kanTas ? text : undefined,
      lage: 'klar',
      ikon: r.typ === 'foljde_upp' ? <IkonMejl size={18} /> : r.eventType === 'rejected' || r.eventType === 'declined' ? <IkonAvslag size={18} /> : undefined,
    }
  })
  if (tyst && !t.avslutad) {
    rader.push({
      rubrik: 'Följde upp',
      datum: 'läggs till när du har skickat',
      datumKoppar: true,
      text: `Inget hört på ${t.dagarTyst} dagar. Tystnaden loggar du aldrig själv, den räknar vi ut.`,
      lage: 'snart',
      ikon: <IkonMejl size={20} />,
    })
  }
  if (!t.avslutad && t.status !== 'accepted') {
    if (t.station === 'sokt') rader.push({ rubrik: 'Svar', lage: 'sen', ikon: <IkonPrat size={20} /> })
    else if (t.station === 'intervju') rader.push({ rubrik: 'Erbjudande', lage: 'sen', ikon: <IkonFlagga size={20} /> })
  }

  const snabb: { typ: ApplicationEventType; ikon: ReactNode }[] = t.avslutad || t.status === 'accepted'
    ? []
    : t.station === 'erbjudande'
      ? [
          { typ: 'accepted', ikon: <IkonBock /> },
          { typ: 'declined', ikon: <IkonAvslag /> },
        ]
      : t.station === 'intervju'
        ? [
            { typ: 'interview_completed', ikon: <IkonBock /> },
            { typ: 'trial_work_completed', ikon: <IkonVaska /> },
            { typ: 'offer_received', ikon: <IkonFlagga /> },
            { typ: 'rejected', ikon: <IkonAvslag /> },
          ]
        : [
            { typ: 'interview_invited', ikon: <IkonKalender /> },
            { typ: 'rejected', ikon: <IkonAvslag /> },
          ]

  /* -------------------------------------------------------- panelens block */

  const fragaRad = (q: (typeof f.fragor)[number], nu: boolean) => {
    if (q.betyg == null) return 'Inte övad än'
    const delar = [`${q.betygOrd}, ${q.betyg} av 5.`]
    if (q.saknades) delar.push(`${stor(q.saknades)} saknades.`)
    if (nu) delar.push('Börja här.')
    else if (q.datum) delar.push(`Övad ${kortDag(q.datum.slice(0, 10))}.`)
    return delar.join(' ')
  }
  const nastaIndex = f.fragor.findIndex((q) => q.fraga === f.nastaFraga)

  const kravBlock = f.krav ? (
    <TonYta>
      <p className="j3-eyebrow">Kraven i annonsen</p>
      <p className="j3-h3" style={{ margin: '6px 0 14px' }}>
        Brevet svarade på {ordtal(f.kravMedSvar)} av {ordtal(f.krav.length)}
      </p>
      <KravLista krav={f.krav.map((k) => ({ text: k.krav, saknas: !k.harSvar, rad: k.harSvar ? undefined : 'Står inte i brevet. Ha ett svar redo.' }))} />
      {data.brev ? (
        <div style={{ marginTop: 14 }}>
          <TextLank href={`/dashboard/mina-brev/${data.brev.id}`}>Öppna brevet</TextLank>
        </div>
      ) : null}
    </TonYta>
  ) : null

  let panelInnehall: ReactNode = null
  if (block === 'hur-gick' && i) {
    panelInnehall = (
      <>
        <PanelHuvud
          ogon="Nästa steg"
          rubrik="Hur gick intervjun?"
          rubrikId="nasta"
          stor
          under={i.dag ? `Intervjun var ${veckodagNamn(i.dag)} ${langDag(i.dag)}. Svara med ett tryck, så hamnar det rätt bland händelserna.` : 'Svara med ett tryck, så hamnar det rätt bland händelserna.'}
        />
        <div className="mt-[18px]">
          <HurGickSvar
            ansokanId={a.id}
            onKlar={() => {
              setHurGickSvarat(i.tid ?? '')
              uppdatera()
            }}
            onFlyttad={() => setTidArk('flyttad')}
          />
        </div>
      </>
    )
  } else if (block === 'forbered') {
    const nar = i?.dag ? narText(i.dag, idag) : null
    const knapp = (
      <StorKnapp golv href={nyttProvHref(f.nastaFraga)}>
        Öva på nästa fråga
        <IkonPil />
      </StorKnapp>
    )
    panelInnehall = (
      <>
        {visaDatumRuta ? (
          <div className="xl:hidden" style={{ marginBottom: 14 }}>
            <DatumRuta pa="golv" bricka={datumBricka('golv')} rubrik={i?.dag ? `Intervju ${veckodagNamn(i.dag)}${klockslag(i.tid) ? ` ${klockslag(i.tid)}` : ''}` : ''} rad={<>{omText} {tidLank(false)}</>} />
          </div>
        ) : null}
        <PanelHuvud
          ogon="Nästa steg"
          rubrik={nar ? `Förbered intervjun ${nar}` : 'Förbered intervjun'}
          rubrikId="nasta"
          stor
          under={
            f.ovade === 0
              ? 'Ingen av de sju vanligaste frågorna är övad än. Börja med den första.'
              : `${Ordtal(f.ovade)} av de sju vanligaste frågorna ${f.ovade === 1 ? 'är övad' : 'är övade'}. Börja med den du fick lägst betyg på.`
          }
          mitt
          hoger={knapp}
        />
        <div className="xl:hidden" style={{ marginTop: 14 }}>
          <StorKnapp href={nyttProvHref(f.nastaFraga)}>
            Öva på nästa fråga
            <IkonPil />
          </StorKnapp>
        </div>
        <div className={f.krav ? 'mt-[18px] grid gap-6 xl:mt-[22px] xl:grid-cols-[minmax(0,1fr)_336px] xl:items-start' : 'mt-[18px] xl:mt-[22px]'}>
          <Fragor>
            {f.fragor.map((q, n) => (
              <FragaKort key={q.fraga} nu={n === nastaIndex && q.betyg != null} betyg={q.betyg ?? 0} rubrik={q.kort} rad={fragaRad(q, n === nastaIndex && q.betyg != null)} href={nyttProvHref(q.fraga)} />
            ))}
            <FragaAllt rubrik="Allt under Inför intervjun" rad="Dina prov och din personlighetsprofil." href={INFOR_INTERVJUN_HREF} />
          </Fragor>
          {kravBlock}
        </div>
      </>
    )
  } else if (block === 'folj-upp') {
    panelInnehall = (
      <>
        <PanelHuvud
          ogon="Nästa steg"
          rubrik={`Följ upp ${t.company}`}
          rubrikId="nasta"
          stor
          under="Ett kort mejl brukar ge besked. Utkastet är skrivet utifrån din ansökan. Ändra det du vill direkt i texten."
        />
        <Uppfoljning
          ansokanId={a.id}
          start={u}
          jobAdUrl={a.job_ad_url}
          onAndrat={uppdatera}
          onSkickad={(rad) => setLokalUppf(rad)}
          onAngrad={(id) => setLokalUppf((l) => (l?.id === id ? null : l))}
        />
      </>
    )
  }

  /* -------------------------------------------------------------- vyn */

  return (
    <>
      <JobbVagg
        hojd={528}
        hojdMobil={392}
        flik="sokta"
        handling={
          <GlasKnapp onClick={() => setRedigera(true)} ikon={<IkonPenna size={18} />}>
            Redigera
          </GlasKnapp>
        }
        atgarder={<Topprad bara="atgarder" />}
        tillbaka={{ href: '/dashboard/sokta-tjanster', text: 'Alla sökta tjänster' }}
        handlingMobil={
          <TextLank vagg onClick={() => setRedigera(true)}>
            Redigera
          </TextLank>
        }
      >
        <VaggHero
          spalt={520}
          glapp={32}
          topp={18}
          bild={
            <TjanstBana
              steg={aktuell}
              kod={t.bokstaver}
              tyst={tyst ? `tyst ${t.dagarTyst} dagar` : undefined}
              datum={datum}
              datumMobil={datumMobil}
              etikett={banEtikett}
            />
          }
        >
          <TjanstHuvud kod={t.bokstaver} tyst={tyst} ogon={ogon} titel={t.jobTitle} arbetsgivare={varRad(t)} />
          {visaDatumRuta && intervjuRubrik ? (
            <div className="hidden xl:block" style={{ marginTop: 30 }}>
              <DatumRuta bricka={datumBricka('vagg')} rubrik={intervjuRubrik} rad={<>{omText} {tidLank(true)}</>} />
            </div>
          ) : null}
          {ingressVagg ? (
            <p className="j3-ingress hidden xl:block" style={{ marginTop: 30 }}>
              {ingressVagg}
            </p>
          ) : null}
          {i?.lage === 'utan_tid' ? (
            <div className="hidden xl:block" style={{ marginTop: 12 }}>
              {tidLank(true)}
            </div>
          ) : null}
        </VaggHero>
      </JobbVagg>

      <Golv>
        {panelInnehall ? (
          <div ref={panel} style={{ scrollMarginTop: 16 }}>
            <LyftPanel rubrikId="nasta">{panelInnehall}</LyftPanel>
          </div>
        ) : null}

        <Spalter sido={400} topp={panelInnehall ? 48 : 0}>
          <section aria-labelledby="handelser-rubrik">
            <SektionsHuvud rubrikId="handelser-rubrik" rubrik="Händelser" />
            <Kort luft>
              <Handelsebana handelser={rader} />
              <div className="j3-b-snabb">
                {snabb.length ? <p className="j3-b-snabb-rubrik">Har något hänt? Lägg till det med ett tryck.</p> : null}
                <Snabbval>
                  {snabb.map((s) => (
                    <LitenKnapp key={s.typ} ikon={s.ikon} onClick={() => setHandelse({ open: true, typ: s.typ })}>
                      {handelseNamn(s.typ, genomforda)}
                    </LitenKnapp>
                  ))}
                  <LitenKnapp variant="streckad" onClick={() => setHandelse({ open: true, typ: null })}>
                    {snabb.length ? 'Annat' : 'Lägg till händelse'}
                  </LitenKnapp>
                </Snabbval>
                <div style={{ marginTop: 14 }}>
                  <TextLank liten onClick={() => setRatta(!ratta)}>
                    {ratta ? 'Klar' : 'Rätta en händelse'}
                  </TextLank>
                </div>
              </div>
            </Kort>
          </section>
          <aside aria-labelledby="om-rubrik">
            <SektionsHuvud rubrikId="om-rubrik" rubrik="Om tjänsten" />
            <Kort luft>
              <Fakta
                rader={[
                  { etikett: 'Sökt', varde: langDagMedAr(t.appliedAt) },
                  { etikett: 'Hur', varde: KANAL_NAMN[t.kanal] },
                  ...(data.brev ? [{ etikett: 'Brev', varde: <a href={`/dashboard/mina-brev/${data.brev.id}`}>{data.brev.title || `Personligt brev till ${t.company}`}</a> }] : []),
                  ...(data.cv ? [{ etikett: 'CV', varde: data.cv.file_name }] : []),
                  ...(a.job_ad_url
                    ? [{ etikett: 'Annonsen', varde: <a href={a.job_ad_url} target="_blank" rel="noopener noreferrer">Till annonsen</a> }]
                    : []),
                  ...(a.notes ? [{ etikett: 'Anteckning', varde: a.notes }] : []),
                ]}
              />
              <div className="j3-b-om-fot">
                <LitenKnapp onClick={() => setRedigera(true)}>Redigera</LitenKnapp>
                <TextLank liten mjuk onClick={() => setTaBortTjanst(true)}>
                  Ta bort tjänsten
                </TextLank>
              </div>
            </Kort>
          </aside>
        </Spalter>
      </Golv>

      <LoggaArk open={redigera} onClose={() => setRedigera(false)} redigera={a} handelser={data.handelser} onKlar={() => { success('Sparat.', 2500); uppdatera() }} />
      <HandelseArk
        open={handelse.open}
        onClose={() => setHandelse({ open: false, typ: null })}
        ansokanId={a.id}
        typ={handelse.typ}
        genomforda={genomforda}
        sokt={t.appliedAt}
        onSparat={(typ) => {
          successWithActivity('Händelsen är sparad.', 'application_event_added', `Ny händelse: ${STATUS_META[typ].label}`, { applicationId: a.id, eventType: typ }, 2500)
          uppdatera()
        }}
      />
      <IntervjuTidArk
        open={tidArk !== null}
        onClose={() => setTidArk(null)}
        ansokanId={a.id}
        tid={i?.tid ?? null}
        plats={i?.plats ?? null}
        flyttad={tidArk === 'flyttad'}
        onSparat={uppdatera}
      />
      <BekraftArk
        open={taBortTjanst}
        onClose={() => setTaBortTjanst(false)}
        rubrik="Ta bort tjänsten ur Sökta tjänster?"
        text="Tjänsten och hela dess historik försvinner, och den räknas inte längre med i statistiken eller i rapporten. Det går inte att ångra."
        knapp="Ta bort tjänsten"
        onJa={async () => {
          await anropa(`/api/applications/${a.id}`, 'DELETE')
          router.replace('/dashboard/sokta-tjanster')
          router.refresh()
        }}
      />
      <BekraftArk
        open={!!taBortRad}
        onClose={() => setTaBortRad(null)}
        rubrik={taBortRad?.typ === 'foljde_upp' ? 'Ångra uppföljningen?' : `Ta bort ${taBortRad?.rubrik.toLowerCase() ?? 'händelsen'}?`}
        text={taBortRad?.typ === 'foljde_upp' ? 'Raden Följde upp försvinner och påminnelsen räknas från förra händelsen igen.' : 'Statusen räknas om från de händelser som är kvar. Tjänsten ligger kvar.'}
        knapp={taBortRad?.typ === 'foljde_upp' ? 'Ångra' : 'Ta bort'}
        onJa={async () => {
          if (!taBortRad) return
          if (taBortRad.typ === 'foljde_upp') await anropa(`/api/jobbsok/uppfoljning/${a.id}/skickad?uppfoljning=${taBortRad.id}`, 'DELETE')
          else await anropa(`/api/applications/${a.id}/events/${taBortRad.id}`, 'DELETE')
          if (taBortRad.typ === 'foljde_upp' && lokalUppf?.id === taBortRad.id) setLokalUppf(null)
          success(taBortRad.typ === 'foljde_upp' ? 'Uppföljningen är ångrad.' : 'Händelsen är borttagen.', 2500)
          uppdatera()
        }}
      />
    </>
  )
}

