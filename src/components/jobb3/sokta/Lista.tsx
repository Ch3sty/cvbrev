'use client'

/**
 * Listan under Sökta tjänster (skisserna Sokta och Mobil-sokta): väggen med
 * de fyra facken och golvet med grupperna Följ upp, Intervju på gång,
 * Erbjudande, Ska sökas, Väntar svar och Avslutade.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  VaggHero,
  VaggText,
  Chips,
  Chip,
  VeckansMal,
  VaggBricka,
  StegFack,
  Golv,
  LyftPanel,
  Avsnitt,
  GruppHuvud,
  Kort,
  TjanstRad,
  SparadKort,
  SparadLista,
  FilterRad,
  SokFalt,
  StatusPiller,
  StorKnapp,
  LitenKnapp,
  TextLank,
  Bricka,
  TomtLage,
  Felruta,
  IkonPil,
  IkonPlus,
  IkonDokument,
  IkonNed,
  IkonKryss,
  Ark as ArkHurGick,
} from '@/components/jobb3/kit'
import {
  intervjuEtikettKort,
  intervjuText,
  kortDag,
  langDag,
  tjanstHref,
  veckodagNamn,
  dagarMellan,
  type SkaSokasRad,
  type SoktaFilter,
  type TjanstLage,
} from '@/lib/jobbsok'
import type { SoktaTjansterData } from '@/lib/jobbsok/server'
import { coverLetterPrefill } from '@/store/cover-letter-store'
import { dagarSedan, fyrsteg, golvTon, intervjuPiller, soktRad, stor, uppraknat, varRad } from './text'
import type { LoggaForifyllt } from './LoggaArk'
import { BekraftArk, HurGickSvar, IntervjuTidArk, anropa } from './SmaArk'
import Backfill from './Backfill'

/* =================================================================== väggen */

export function ListaVagg({ data, onAndraMal }: { data: SoktaTjansterData; onAndraMal: () => void }) {
  const { tjanster, bana, veckansMal, vagg, idag } = data
  const st = Object.fromEntries(bana.stationer.map((s) => [s.station, s]))
  const narmast = data.lista.ska_sokas.find((r) => !r.passerad && r.sistaDag)
  const narmastText = narmast?.sistaDag
    ? `Närmast: ${dagarMellan(idag, narmast.sistaDag) <= 6 ? veckodagNamn(narmast.sistaDag) : kortDag(narmast.sistaDag)}`
    : st.ska_sokas?.antal
      ? 'Ingen sista dag satt'
      : 'Inga sparade'
  const avslutade = bana.avslutade
  const ingressMobil = tjanster.find((t) => t.tyst && !t.avslutad) ? vagg.text.split('. ').slice(-1)[0] : vagg.text

  return (
    <VaggHero
      spalt={340}
      glapp={40}
      bildPlats="bred"
      bild={
        <StegFack
          etikett="Dina sökta tjänster per steg"
          fack={[
            {
              namn: 'Ska sökas',
              antal: st.ska_sokas?.antal ?? 0,
              under: narmastText,
              brickor: (st.ska_sokas?.brickor ?? []).map((b) => ({ kod: b.bokstaver, ton: 'tom' as const, etikett: b.company })),
            },
            {
              namn: 'Sökt',
              antal: st.sokt?.antal ?? 0,
              under: (st.sokt?.antal ?? 0) > 0 ? 'Väntar svar' : 'Inga väntar svar',
              brickor: (st.sokt?.brickor ?? []).map((b) => ({ kod: b.bokstaver, ton: b.tyst ? ('tyst' as const) : ('vit' as const), tagg: b.tyst ? b.etikett?.replace('tyst ', '') ?? undefined : undefined, href: tjanstHref(b.id), etikett: b.company })),
            },
            {
              namn: 'Intervju',
              antal: st.intervju?.antal ?? 0,
              under: st.intervju?.undertext,
              brickor: (st.intervju?.brickor ?? []).map((b) => ({ kod: b.bokstaver, ton: 'vit' as const, tagg: b.etikett ?? undefined, href: tjanstHref(b.id), etikett: b.company })),
            },
            {
              namn: 'Erbjudande',
              antal: st.erbjudande?.antal ?? 0,
              under: st.erbjudande?.undertext,
              brickor: (st.erbjudande?.brickor ?? []).map((b) => ({ kod: b.bokstaver, ton: 'int' as const, href: tjanstHref(b.id), etikett: b.company })),
              mal: true,
            },
          ]}
        />
      }
    >
      <VaggText
        ogon={tjanster.length ? `Sökta tjänster · ${tjanster.length} hittills` : 'Sökta tjänster'}
        rubrik={vagg.rubrik}
        ingress={vagg.text}
        ingressMobil={ingressMobil}
      />
      <Chips dator>
        <VeckansMal antal={veckansMal.sokta} mal={veckansMal.mal} onAndra={onAndraMal} />
      </Chips>
      {avslutade.length ? (
        <Chips dator>
          <Chip href="#g-avslutade" liten>
            <span className="j3-brickrad" aria-hidden="true">
              {avslutade.slice(0, 3).map((b) => (
                <VaggBricka key={b.id} kod={b.bokstaver} ton="av" />
              ))}
            </span>
            <span>
              <b>{avslutade.length === 1 ? '1 avslutad' : `${avslutade.length} avslutade`}</b> ligger längst ned
            </span>
          </Chip>
        </Chips>
      ) : null}
    </VaggHero>
  )
}

/* ==================================================================== golvet */

type Grupp = 'folj_upp' | 'intervju' | 'erbjudande' | 'vantar_svar' | 'avslutade'

function iFilter(t: TjanstLage, grupp: Grupp, f: SoktaFilter): boolean {
  switch (f) {
    case 'alla':
      return true
    case 'folj-upp':
      return grupp === 'folj_upp'
    case 'vantar-svar':
      return t.station === 'sokt' && !t.avslutad
    case 'intervju':
      return t.station === 'intervju' && !t.avslutad
    case 'erbjudande':
      return grupp === 'erbjudande'
    case 'avslutade':
      return grupp === 'avslutade'
    case 'ska-sokas':
      return false
  }
}

function traffar(t: { company: string; jobTitle: string; location: string | null }, term: string): boolean {
  if (!term) return true
  const q = term.toLowerCase()
  return t.company.toLowerCase().includes(q) || t.jobTitle.toLowerCase().includes(q) || (t.location ?? '').toLowerCase().includes(q)
}

export function ListaGolv({
  data,
  filter,
  vaxel,
  onFilter,
  onLogga,
  onRefresh,
}: {
  data: SoktaTjansterData
  filter: SoktaFilter
  vaxel: ReactNode
  onFilter: (f: SoktaFilter) => void
  onLogga: (f?: LoggaForifyllt | null) => void
  onRefresh: () => void
}) {
  const router = useRouter()
  const { lista, idag } = data
  const [term, setTerm] = useState('')
  const [visaAvslutade, setVisaAvslutade] = useState(filter === 'avslutade')
  const [hurGick, setHurGick] = useState<TjanstLage | null>(null)
  const [taBort, setTaBort] = useState<SkaSokasRad | null>(null)

  useEffect(() => {
    if (filter === 'avslutade') setVisaAvslutade(true)
  }, [filter])

  const g = useMemo(() => {
    const valj = (rader: TjanstLage[], grupp: Grupp) => rader.filter((t) => iFilter(t, grupp, filter) && traffar(t, term))
    return {
      folj_upp: valj(lista.folj_upp, 'folj_upp'),
      intervju: valj(lista.intervju, 'intervju'),
      erbjudande: valj(lista.erbjudande, 'erbjudande'),
      vantar_svar: valj(lista.vantar_svar, 'vantar_svar'),
      avslutade: valj(lista.avslutade, 'avslutade'),
      ska_sokas: filter === 'alla' || filter === 'ska-sokas' ? lista.ska_sokas.filter((r) => traffar(r, term)) : [],
    }
  }, [lista, filter, term])

  const totalt = data.tjanster.length + lista.ska_sokas.length
  const synliga = g.folj_upp.length + g.intervju.length + g.erbjudande.length + g.vantar_svar.length + g.avslutade.length + g.ska_sokas.length

  const filterVal = [
    { id: 'alla', text: 'Alla', antal: lista.antal.alla },
    ...(filter === 'folj-upp' ? [{ id: 'folj-upp', text: 'Följ upp', antal: lista.antal['folj-upp'] }] : []),
    { id: 'ska-sokas', text: 'Ska sökas', antal: lista.antal['ska-sokas'] },
    { id: 'vantar-svar', text: 'Väntar svar', antal: lista.antal['vantar-svar'] },
    { id: 'intervju', text: 'Intervju', antal: lista.antal.intervju },
    { id: 'erbjudande', text: 'Erbjudande', antal: lista.antal.erbjudande },
    { id: 'avslutade', text: 'Avslutade', antal: lista.antal.avslutade },
  ]

  const skrivBrev = (r: SkaSokasRad) => {
    coverLetterPrefill.set({ cvId: '', jobTitle: r.jobTitle, company: r.company, jobDescription: '', jobAdUrl: r.jobAdUrl ?? undefined })
    router.push('/dashboard/skapa-brev')
  }

  const sokt = (r: SkaSokasRad) =>
    onLogga({ sparadId: r.id, job_title: r.jobTitle, company: r.company, location: r.location, job_ad_url: r.jobAdUrl })

  /* ----------------------------------------------------- raderna */

  const rad = (t: TjanstLage, grupp: Grupp) => {
    const steg = fyrsteg(t)
    const bricka = { kod: t.bokstaver, ton: golvTon(t.ton) }
    const href = tjanstHref(t.id)
    if (grupp === 'folj_upp') {
      return (
        <TjanstRad
          key={t.id}
          storlek="stor"
          bricka={bricka}
          rubrik={t.jobTitle}
          arbetsgivare={varRad(t)}
          text={soktRad(t)}
          steg={steg}
          status={{ status: 'folj-upp', text: `Tyst i ${t.dagarTyst} dagar`, vit: true }}
          hogerMobil={<StatusPiller status="folj-upp" vit>{`Tyst ${t.dagarTyst} dagar`}</StatusPiller>}
          handling={
            <>
              <span className="hidden xl:inline-flex">
                <StorKnapp storlek="lag" golv href={tjanstHref(t.id, 'folj-upp')} className="lag-alltid">
                  Följ upp
                  <IkonPil size={18} />
                </StorKnapp>
              </span>
              <span className="w-full xl:hidden">
                <StorKnapp storlek="lag" golv bred href={tjanstHref(t.id, 'folj-upp')}>
                  Följ upp med ett kort mejl
                </StorKnapp>
              </span>
            </>
          }
          href={href}
        />
      )
    }
    if (grupp === 'intervju') {
      const i = t.intervju
      const piller =
        i?.lage === 'bokad' ? intervjuPiller(i.tid) ?? 'Intervju bokad' : i?.lage === 'hur_gick' ? 'Hur gick den?' : i?.lage === 'utan_tid' ? 'Tid saknas' : 'Väntar besked'
      const status = i?.lage === 'vantar_besked' ? ('vantar-besked' as const) : ('intervju' as const)
      const handling =
        i?.lage === 'hur_gick' ? (
          <LitenKnapp storlek={48} onClick={() => setHurGick(t)}>
            Hur gick intervjun?
          </LitenKnapp>
        ) : i?.lage === 'bokad' ? (
          <LitenKnapp storlek={48} href={tjanstHref(t.id, 'forbered')}>
            Förbered intervjun
          </LitenKnapp>
        ) : i?.lage === 'utan_tid' ? (
          <LitenKnapp storlek={48} href={tjanstHref(t.id, 'andra-tid')}>
            Sätt tid
          </LitenKnapp>
        ) : (
          <LitenKnapp storlek={48} href={href}>
            Uppdatera
          </LitenKnapp>
        )
      return (
        <TjanstRad
          key={t.id}
          storlek="stor"
          bricka={bricka}
          rubrik={t.jobTitle}
          arbetsgivare={varRad(t)}
          text={intervjuText(t, idag)}
          steg={steg}
          status={{ status, text: piller, vit: true }}
          hogerMobil={<StatusPiller status={status} vit>{i?.lage === 'bokad' ? stor(intervjuEtikettKort(i.tid) ?? piller) : piller}</StatusPiller>}
          handling={handling}
          handlingMobil={i?.lage !== 'vantar_besked'}
          href={href}
        />
      )
    }
    if (grupp === 'erbjudande') {
      return (
        <TjanstRad
          key={t.id}
          storlek="stor"
          bricka={bricka}
          rubrik={t.jobTitle}
          arbetsgivare={varRad(t)}
          text={t.status === 'accepted' ? `Du tackade ja ${kortDag(t.senasteAktivitet)}.` : `Erbjudande ${kortDag(t.senasteAktivitet)}.`}
          steg={steg}
          status={{ status: 'erbjudande', text: t.status === 'accepted' ? 'Tackat ja' : 'Erbjudande', vit: true }}
          hogerMobil={<StatusPiller status="erbjudande" vit>{t.status === 'accepted' ? 'Tackat ja' : 'Erbjudande'}</StatusPiller>}
          handling={
            <LitenKnapp storlek={48} href={href}>
              Uppdatera
            </LitenKnapp>
          }
          handlingMobil={false}
          href={href}
        />
      )
    }
    if (grupp === 'avslutade') {
      return (
        <TjanstRad
          key={t.id}
          storlek="stor"
          bricka={{ kod: t.bokstaver, ton: 'slut' }}
          rubrik={t.jobTitle}
          arbetsgivare={varRad(t)}
          text={`${t.status === 'declined' ? 'Tackade nej' : 'Avslag'} ${kortDag(t.senasteAktivitet)}. Räknas som svar i din statistik.`}
          textMobil={`${t.company}, ${kortDag(t.senasteAktivitet)}`}
          steg={steg}
          status={{ status: 'avslutad', text: t.status === 'declined' ? 'Tackade nej' : 'Avslag' }}
          hogerMobil={<StatusPiller status="avslutad">{t.status === 'declined' ? 'Tackade nej' : 'Avslag'}</StatusPiller>}
          href={href}
        />
      )
    }
    // Väntar svar
    return (
      <TjanstRad
        key={t.id}
        storlek="stor"
        bricka={bricka}
        rubrik={t.jobTitle}
        arbetsgivare={varRad(t)}
        text={soktRad(t)}
        textMobil={`Sökt ${kortDag(t.appliedAt)}`}
        steg={steg}
        status={{ status: 'vantar', text: dagarSedan(t.appliedAt, idag) }}
        hogerMobil={<StatusPiller status="vantar">{dagarSedan(t.appliedAt, idag)}</StatusPiller>}
        handling={
          <LitenKnapp storlek={48} href={href}>
            Uppdatera
          </LitenKnapp>
        }
        handlingMobil={false}
        href={href}
      />
    )
  }

  const grupp = (id: string, rubrik: string, rader: TjanstLage[], g2: Grupp, text: string, ton: 'vit' | 'ton' | 'tyst', antalTyst?: boolean) =>
    rader.length ? (
      <div key={id} style={{ marginTop: 22 }}>
        <GruppHuvud id={id} rubrik={rubrik} antal={rader.length} antalTyst={antalTyst} text={text} />
        <Kort ton={ton} lista>
          {rader.map((t) => rad(t, g2))}
        </Kort>
      </div>
    ) : null

  const iPanelen = [
    grupp('g-folj-upp', 'Följ upp', g.folj_upp, 'folj_upp', 'Tyst i minst tolv dagar. Ett kort mejl brukar ge besked.', 'tyst', true),
    grupp('g-intervju', 'Intervju på gång', g.intervju, 'intervju', 'Förbered dig här. Frågorna hör ihop med tjänsten.', 'ton'),
    grupp('g-erbjudande', 'Erbjudande', g.erbjudande, 'erbjudande', 'Grattis. Logga ditt svar när du har bestämt dig.', 'ton'),
  ].filter(Boolean)
  const vantarIPanelen = iPanelen.length === 0

  const vantarGrupp = g.vantar_svar.length ? (
    vantarIPanelen ? (
      grupp('g-vantar', 'Väntar svar', g.vantar_svar, 'vantar_svar', 'Svar brukar dröja en till två veckor. Vi säger till när det är dags att följa upp.', 'vit')
    ) : (
      <Avsnitt topp={48} rubrikId="g-vantar">
        <GruppHuvud id="g-vantar" rubrik="Väntar svar" antal={g.vantar_svar.length} text="Svar brukar dröja en till två veckor. Vi säger till när det är dags att följa upp." />
        <Kort lista>{g.vantar_svar.map((t) => rad(t, 'vantar_svar'))}</Kort>
      </Avsnitt>
    )
  ) : null

  const avslutadeBlock = g.avslutade.length ? (
    <Avsnitt topp={48} rubrikId="g-avslutade">
      <GruppHuvud id="g-avslutade" rubrik="Avslutade" antal={g.avslutade.length} />
      {visaAvslutade ? (
        <>
          <Kort lista>{g.avslutade.map((t) => rad(t, 'avslutade'))}</Kort>
          {filter !== 'avslutade' ? (
            <div style={{ marginTop: 12 }}>
              <TextLank onClick={() => setVisaAvslutade(false)}>Dölj avslutade</TextLank>
            </div>
          ) : null}
        </>
      ) : (
        <Kort>
          <button type="button" className="j3-b-avslutade" onClick={() => setVisaAvslutade(true)} aria-expanded={false}>
            <span className="j3-brickrad" aria-hidden="true">
              {g.avslutade.slice(0, 3).map((t) => (
                <Bricka key={t.id} kod={t.bokstaver} ton="slut" mobil={44} dator={48} />
              ))}
            </span>
            <span className="j3-b-avslutade-text">
              <span className="hidden xl:block">
                <b>{uppraknat(g.avslutade.map((t) => t.company))}</b>
                <small>{data.avslutadeText} De räknas som svar i din statistik.</small>
              </span>
              <span className="xl:hidden">
                <b>{data.avslutadeText?.split(',')[0] ?? `${g.avslutade.length} avslutade`}</b>
                <small>Senast {kortDag(g.avslutade[0].senasteAktivitet)}</small>
              </span>
            </span>
            <span className="j3-b-avslutade-visa">
              <span className="hidden xl:inline">Visa</span>
              <IkonNed size={20} />
            </span>
          </button>
        </Kort>
      )}
    </Avsnitt>
  ) : null

  const skaSokasBlock = g.ska_sokas.length ? (
    <Avsnitt topp={48} rubrikId="g-ska-sokas">
      <GruppHuvud id="g-ska-sokas" rubrik="Ska sökas" antal={g.ska_sokas.length} text="Sparade annonser med sista ansökningsdag. De räknas inte förrän du har sökt." />
      <SparadLista>
        {g.ska_sokas.map((r) =>
          r.passerad ? (
            <SparadKort
              key={r.id}
              kod={r.bokstaver}
              titel={r.jobTitle}
              arbetsgivare={varRad(r)}
              passerad
              lank={<TextLank onClick={() => setTaBort(r)}>Ta bort</TextLank>}
              handling={
                <LitenKnapp storlek={48} onClick={() => sokt(r)}>
                  Sökt ändå
                </LitenKnapp>
              }
            />
          ) : (
            <SparadKort
              key={r.id}
              kod={r.bokstaver}
              titel={r.jobTitle}
              arbetsgivare={varRad(r)}
              matchgrad={r.matchScore}
              dag={r.sistaDagText ?? 'Ingen sista dag satt'}
              snart={r.dagarKvar != null && r.dagarKvar <= 7}
              lank={
                <>
                  <TextLank onClick={() => sokt(r)}>Markera som sökt</TextLank>
                </>
              }
              handling={
                <LitenKnapp storlek={48} onClick={() => skrivBrev(r)}>
                  Skriv brev
                </LitenKnapp>
              }
            />
          ),
        )}
      </SparadLista>
      {g.ska_sokas.some((r) => !r.passerad) ? (
        <div className="mt-3 xl:hidden">
          <p className="j3-text">Har du sökt någon av dem? Tryck på kortet och välj Markera som sökt.</p>
        </div>
      ) : null}
    </Avsnitt>
  ) : null

  /* ------------------------------------------------------- tomt */

  if (totalt === 0) {
    return (
      <Golv>
        <LyftPanel lyftMobil={28} luft="20px 28px 28px">
          {vaxel}
          <div style={{ marginTop: 18 }}>
            {data.lasfel ? (
              <Felruta text="Vi kunde inte hämta dina sökta tjänster just nu." onForsok={onRefresh} />
            ) : data.backfill.length > 0 ? (
              <Backfill kandidater={data.backfill} inbaddad onImporterat={onRefresh} onLogga={() => onLogga()} />
            ) : (
              <TomtLage
                ikon={<IkonDokument />}
                rubrik="Inga sökta tjänster än"
                text="Logga den första, så håller vi koll på svaren och säger till när det är dags att följa upp."
                handling={
                  <LitenKnapp ikon={<IkonPlus />} onClick={() => onLogga()}>
                    Logga sökt tjänst
                  </LitenKnapp>
                }
              />
            )}
          </div>
        </LyftPanel>
      </Golv>
    )
  }

  return (
    <Golv>
      <LyftPanel lyftMobil={28} luft="20px 28px 28px">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {vaxel}
          <div className="hidden xl:block xl:w-[300px]">
            <SokFalt etikett="Sök på företag eller tjänst" placeholder="Sök på företag eller tjänst" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <FilterRad etikett="Filter" valt={filter} onVal={(id) => onFilter(id as SoktaFilter)} val={filterVal} />
        </div>
        <div className="mt-3 xl:hidden">
          <SokFalt etikett="Sök på företag eller tjänst" placeholder="Sök på företag eller tjänst" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
        {data.lasfel ? (
          <div style={{ marginTop: 18 }}>
            <Felruta text="Vi kunde inte hämta alla dina sökta tjänster just nu." onForsok={onRefresh} />
          </div>
        ) : null}
        {iPanelen}
        {vantarIPanelen ? vantarGrupp : null}
        {synliga === 0 ? (
          <div style={{ marginTop: 22 }}>
            <TomtLage
              text={term ? 'Inga sökta tjänster matchar sökningen.' : 'Inga sökta tjänster med det här filtret just nu.'}
              handling={
                <LitenKnapp
                  ikon={<IkonKryss />}
                  onClick={() => {
                    setTerm('')
                    onFilter('alla')
                  }}
                >
                  Visa alla
                </LitenKnapp>
              }
              inbaddad
            />
          </div>
        ) : null}
        {iPanelen.length === 0 && !vantarGrupp && synliga > 0 ? <div style={{ height: 4 }} /> : null}
      </LyftPanel>

      {data.backfill.length > 0 ? (
        <Avsnitt topp={32}>
          <Backfill kandidater={data.backfill} onImporterat={onRefresh} onLogga={() => onLogga()} />
        </Avsnitt>
      ) : null}
      {skaSokasBlock}
      {vantarIPanelen ? null : vantarGrupp}
      {avslutadeBlock}

      {hurGick ? <HurGickArk t={hurGick} onClose={() => setHurGick(null)} onKlar={onRefresh} /> : null}
      <BekraftArk
        open={!!taBort}
        onClose={() => setTaBort(null)}
        rubrik="Ta bort raden?"
        text="Annonsen försvinner från Ska sökas. Den har aldrig räknats i din statistik."
        knapp="Ta bort"
        onJa={async () => {
          if (!taBort) return
          await anropa(`/api/jobbsok/ska-sokas/${taBort.id}`, 'DELETE')
          onRefresh()
        }}
      />
    </Golv>
  )
}

/** "Hur gick intervjun?" från listan: de tre svaren i ett ark. */
function HurGickArk({ t, onClose, onKlar }: { t: TjanstLage; onClose: () => void; onKlar: () => void }) {
  const [flytta, setFlytta] = useState(false)
  const dag = t.intervju?.dag
  return (
    <>
      <ArkHurGick open={!flytta} onClose={onClose} rubrik="Hur gick intervjun?" text={`${t.jobTitle} på ${t.company}${dag ? `, ${langDag(dag)}` : ''}.`}>
        <HurGickSvar
          ansokanId={t.id}
          onKlar={() => {
            onKlar()
            onClose()
          }}
          onFlyttad={() => setFlytta(true)}
        />
      </ArkHurGick>
      <IntervjuTidArk
        open={flytta}
        onClose={onClose}
        ansokanId={t.id}
        tid={t.intervju?.tid ?? null}
        plats={t.intervju?.plats ?? null}
        flyttad
        onSparat={onKlar}
      />
    </>
  )
}

