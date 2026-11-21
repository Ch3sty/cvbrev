'use client'

/**
 * Rapport till Arbetsförmedlingen (skissen Sokta-rapport): nedräkningen i
 * väggen, månadsväljaren, rapportbladet (det som skrivs ut), kopiera som
 * text, och delningslänken. Gratisnivåns lås är dagens: servern utelämnar
 * radlistorna, raderna ritas som grå streck och betalväggen (dagens
 * PaywallCard, variant af-rapport) står i SparrRam i stället för uttaget.
 * Telefon: samma innehåll i en kolumn (BYGGSPEC 5).
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  VaggHero,
  VaggText,
  StortTal,
  Golv,
  LyftPanel,
  ManadVal,
  RapportBlad,
  StorKnapp,
  LitenKnapp,
  TonYta,
  Kryss,
  TextLank,
  SparrRam,
  TomtLage,
  IkonSkrivare,
  IkonKopiera,
  IkonLank,
  IkonPlus,
  IkonDokument,
  type RapportRad,
} from '@/components/jobb3/kit'
import PaywallCard from '@/components/paywall/PaywallCard'
import { useNotification } from '@/context/notificationcontext'
import { useProfile } from '@/hooks/use-profile'
import { afReportStatusText } from '@/lib/applications/afReport'
import type { AfRapport } from '@/lib/applications/afRapportData'
import { dagFor, idagSv, kortDag, manadEtikett, type Dag } from '@/lib/jobbsok'
import type { SoktaTjansterData } from '@/lib/jobbsok/server'

const MANAD_KORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

function deadlineFran(data: SoktaTjansterData) {
  const d = data.rapport.deadline
  return { ...d, dueDate: new Date(d.dueDate) }
}

/* =================================================================== väggen */

export function RapportVagg({ data }: { data: SoktaTjansterData }) {
  const d = deadlineFran(data)
  const n = data.tjanster.filter((t) => t.appliedAt.startsWith(d.reportMonth)).length
  const sista = dagFor(data.rapport.deadline.dueDate) ?? data.idag
  const oppnar = `${sista.slice(0, 8)}01`
  const ingress = d.isOverdue
    ? afReportStatusText(d, n)
    : n > 0
      ? `Ska vara inne ${d.dueDateLabel}. Du sökte ${n === 1 ? '1 jobb' : `${n} jobb`}, och de står redan ifyllda.`
      : `Ska vara inne ${d.dueDateLabel}. Inga sökta tjänster är loggade för ${d.reportMonthLabel} än.`

  return (
    <VaggHero
      spalt={440}
      glapp={40}
      bild={
        d.isOverdue ? undefined : (
          <div className="j3-b-nedrakning">
            <StortTal tal={d.daysLeft} rad={d.daysLeft === 1 ? 'dag kvar till' : 'dagar kvar till'} stark="sista inlämningsdag" />
            <Nedrakning idag={data.idag} oppnar={oppnar} sista={sista} manad={d.reportMonthLabel} />
          </div>
        )
      }
    >
      <VaggText
        ogon="Sökta tjänster · Rapport till Arbetsförmedlingen"
        ogonMobil="Rapport till Arbetsförmedlingen"
        rubrik={
          <>
            Rapporten
            <br />
            för {d.reportMonthLabel}
          </>
        }
        ingress={ingress}
      />
    </VaggHero>
  )
}

/** Tidslinjen I dag, Öppnar, Sista dag (skissens SVG). */
function Nedrakning({ idag, oppnar, sista, manad }: { idag: Dag; oppnar: Dag; sista: Dag; manad: string }) {
  const oppen = idag >= oppnar
  const noder = oppen
    ? [
        { x: 20, rubrik: 'Öppnade', dag: oppnar, nu: false },
        { x: 150, rubrik: 'I dag', dag: idag, nu: true },
      ]
    : [
        { x: 20, rubrik: 'I dag', dag: idag, nu: true },
        { x: 150, rubrik: 'Öppnar', dag: oppnar, nu: false },
      ]
  return (
    <svg
      className="j3-b-nedrakning-svg"
      viewBox="0 0 330 120"
      width={292}
      height={106}
      role="img"
      aria-label={`I dag är det ${kortDag(idag)}. Rapporten för ${manad} lämnas in mellan ${kortDag(oppnar)} och ${kortDag(sista)}.`}
    >
      <path d="M20 60H310" stroke="var(--vagg-svag, #6A9676)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 10" />
      <path d="M150 60H296" stroke="var(--koppar)" strokeWidth="7" strokeLinecap="round" opacity=".45" />
      {noder.map((n) =>
        n.nu ? (
          <circle key={n.rubrik} cx={n.x} cy="60" r="11" fill="var(--koppar)" stroke="var(--vagg-ink)" strokeWidth="3" />
        ) : (
          <circle key={n.rubrik} cx={n.x} cy="60" r="8" fill="var(--vagg)" stroke="var(--koppar-ljus, #F4B98A)" strokeWidth="2.5" />
        ),
      )}
      <path d="M300 62V14" stroke="var(--vagg-ink)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M302 15h26l-7 9.500 7 9.500h-26z" fill="var(--koppar)" />
      <circle cx="300" cy="62" r="7" fill="var(--vagg-ink)" />
      <g fontFamily="Inter,sans-serif" textAnchor="middle">
        {[...noder, { x: 298, rubrik: 'Sista dag', dag: sista, nu: false }].map((n) => (
          <g key={n.rubrik}>
            <text x={n.x + (n.x === 20 ? 4 : 0)} y="92" fontSize="14" fontWeight="700" fill="var(--vagg-ink)">
              {n.rubrik}
            </text>
            <text x={n.x + (n.x === 20 ? 4 : 0)} y="110" fontSize="12" fontWeight="500" fill="var(--vagg-mjuk)">
              {kortDag(n.dag)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

/* ==================================================================== golvet */

interface Delning {
  token: string
  show_company_names: boolean
  show_notes: boolean
  expires_at: string
}

export function RapportGolv({ data, vaxel, onLogga }: { data: SoktaTjansterData; vaxel: ReactNode; onLogga: () => void }) {
  const { success, successWithActivity, error: felNotis } = useNotification()
  const { profile } = useProfile()
  const [manad, setManad] = useState(data.rapport.manad)
  const [rapport, setRapport] = useState<AfRapport | null>(data.rapport.data)
  const [last, setLast] = useState(data.rapport.locked)
  const [laddar, setLaddar] = useState(false)
  const [laddfel, setLaddfel] = useState(false)
  const [kopierad, setKopierad] = useState(false)
  const [delning, setDelning] = useState<Delning | null | undefined>(undefined)
  const [visaForetag, setVisaForetag] = useState(false)
  const [delar, setDelar] = useState(false)

  const hamta = useCallback(async (m: string) => {
    setLaddar(true)
    setLaddfel(false)
    try {
      const res = await fetch(`/api/applications/report?month=${m}`)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error()
      setRapport(json.data as AfRapport)
      setLast(json.locked === true)
    } catch {
      setLaddfel(true)
    } finally {
      setLaddar(false)
    }
  }, [])

  const valjManad = (m: string) => {
    if (m === manad) return
    setManad(m)
    hamta(m)
  }

  useEffect(() => {
    let av = false
    fetch('/api/applications/share')
      .then((r) => r.json())
      .then((json) => {
        if (!av) setDelning(json.success ? ((json.data as Delning | null) ?? null) : null)
      })
      .catch(() => {
        if (!av) setDelning(null)
      })
    return () => {
      av = true
    }
  }, [])

  // Månaderna: från den här månaden bakåt till första sökta tjänstens månad, högst sex.
  const manader = useMemo(() => {
    const nu = idagSv().slice(0, 7)
    const forsta = (data.statistik.forstaSokt ?? nu).slice(0, 7)
    const ut: string[] = []
    let [y, m] = nu.split('-').map(Number)
    for (let i = 0; i < 6; i++) {
      const k = `${y}-${String(m).padStart(2, '0')}`
      ut.push(k)
      if (k <= forsta) break
      m -= 1
      if (m === 0) {
        m = 12
        y -= 1
      }
    }
    if (!ut.includes(manad)) ut.push(manad)
    return ut
  }, [data.statistik.forstaSokt, manad])

  const etikett = (k: string) => `${manadEtikett(k)} ${k.slice(0, 4)}`

  const rad = (r: { applied_at?: string; occurred_at?: string; company: string; job_title: string; location: string | null }, prefix = ''): RapportRad => ({
    datum: kortDag((r.applied_at ?? r.occurred_at ?? '').slice(0, 10)),
    arbetsgivare: r.company,
    tjanst: `${prefix}${r.job_title}`,
  })

  const tomma = (n: number): RapportRad[] => Array.from({ length: Math.min(n, 6) }, () => ({ datum: '', arbetsgivare: '', tjanst: '' }))

  const summa = rapport?.totals
  const sammanfattning = useMemo(() => {
    if (!rapport) return ''
    const plats = (l: string | null) => (l ? `, ${l}` : '')
    const lines: string[] = [`Aktivitetsrapport ${etikett(rapport.month).toLowerCase()}`, '']
    if (rapport.advertised.length) {
      lines.push('Sökta annonserade jobb:')
      for (const r of rapport.advertised) lines.push(`- ${kortDag(r.applied_at)}: ${r.job_title}, ${r.company}${plats(r.location)}`)
      lines.push('')
    }
    if (rapport.unsolicited.length) {
      lines.push('Intresseanmälningar och spontanansökningar:')
      for (const r of rapport.unsolicited) lines.push(`- ${kortDag(r.applied_at)}: ${r.job_title}, ${r.company}${plats(r.location)}`)
      lines.push('')
    }
    if (rapport.interviews.length) {
      lines.push('Intervjuer:')
      for (const r of rapport.interviews) {
        const slag = r.event_type === 'trial_work_completed' ? 'Provjobb' : 'Intervju'
        lines.push(`- ${kortDag(r.occurred_at)}: ${slag}, ${r.job_title}, ${r.company}${plats(r.location)}`)
      }
      lines.push('')
    }
    lines.push(
      `Totalt: ${rapport.totals.applications} sökta jobb (${rapport.totals.advertised} annonserade, ${rapport.totals.unsolicited} spontana), ${rapport.totals.interviews} intervjuer.`
    )
    return lines.join('\n')
  }, [rapport])

  const skrivUt = () => {
    document.body.classList.add('printing-tracker-report')
    const stada = () => document.body.classList.remove('printing-tracker-report')
    window.addEventListener('afterprint', stada, { once: true })
    setTimeout(() => window.print(), 50)
  }

  const kopiera = async () => {
    try {
      await navigator.clipboard.writeText(sammanfattning)
      setKopierad(true)
      setTimeout(() => setKopierad(false), 2500)
    } catch {
      felNotis('Kunde inte kopiera. Markera texten själv.', 4000)
    }
  }

  const skapaLank = async () => {
    setDelar(true)
    try {
      const res = await fetch('/api/applications/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_company_names: visaForetag, show_notes: false }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Kunde inte skapa länken')
      setDelning({ token: json.token, show_company_names: visaForetag, show_notes: false, expires_at: json.expiresAt })
      await navigator.clipboard.writeText(json.url).catch(() => undefined)
      successWithActivity('Delningslänken är skapad och kopierad.', 'application_shared', 'Skapade delningslänk för sökstatistiken', {}, 3500)
      if (navigator.share) navigator.share({ title: 'Min jobbsökning', url: json.url }).catch(() => undefined)
    } catch (e) {
      felNotis(e instanceof Error ? e.message : 'Kunde inte skapa länken', 4000)
    } finally {
      setDelar(false)
    }
  }

  const aterkalla = async () => {
    const res = await fetch('/api/applications/share', { method: 'DELETE' })
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.success) {
      setDelning(null)
      success('Delningslänken är återkallad.', 3000)
    }
  }

  const lankUrl = delning ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dela/sokta-tjanster/${delning.token}` : null

  if (data.tjanster.length === 0) {
    return (
      <Golv>
        <LyftPanel lyftMobil={28} luft="20px 28px 28px">
          {vaxel}
          <div style={{ marginTop: 18 }}>
            <TomtLage
              ikon={<IkonDokument />}
              rubrik="Ingen rapport än"
              text="Rapporten fylls i av sig själv med det du loggar. Logga din första sökta tjänst, så står den här."
              handling={
                <LitenKnapp ikon={<IkonPlus />} onClick={onLogga}>
                  Logga sökt tjänst
                </LitenKnapp>
              }
            />
          </div>
        </LyftPanel>
      </Golv>
    )
  }

  const t = data.statistik.tratt
  const bokadIManaden = data.tjanster.find((x) => x.intervju?.lage === 'bokad' && x.intervju.dag?.startsWith(manad))
  const under =
    summa && summa.applications === 0 && summa.interviews === 0
      ? `Inga sökta tjänster är loggade för ${manadEtikett(manad).toLowerCase()}.`
      : bokadIManaden
        ? `Så här blir utskriften. Intervjun hos ${bokadIManaden.company} kommer med när den är genomförd.`
        : 'Så här blir utskriften.'

  const sektioner = rapport
    ? [
        { rubrik: '1. Sökta annonserade jobb', rader: last ? tomma(rapport.totals.advertised) : rapport.advertised.map((r) => rad(r)), antal: rapport.totals.advertised, las: last },
        { rubrik: '2. Intresseanmälningar och spontanansökningar', rader: last ? tomma(rapport.totals.unsolicited) : rapport.unsolicited.map((r) => rad(r)), antal: rapport.totals.unsolicited, las: last },
        {
          rubrik: '3. Intervjuer och provjobb',
          rader: last
            ? tomma(rapport.totals.interviews)
            : rapport.interviews.map((r) => rad(r, `${r.event_type === 'trial_work_completed' ? 'Provjobb' : r.interview_round && r.interview_round > 1 ? `Intervju ${r.interview_round}` : 'Intervju'}, `)),
          antal: rapport.totals.interviews,
          las: last,
        },
      ]
    : []

  return (
    <Golv>
      <LyftPanel lyftMobil={28} luft="20px 28px 28px">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {vaxel}
          <p className="j3-text">Fylld från dina loggade tjänster. Du lämnar in den själv hos Arbetsförmedlingen.</p>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-7">
          <div className="flex flex-col gap-3">
            <p className="j3-eyebrow">Månad</p>
            {manader.map((k) => {
              const n = data.tjanster.filter((x) => x.appliedAt.startsWith(k)).length
              const i = k === manad && summa ? summa.interviews : 0
              return (
                <ManadVal
                  key={k}
                  kort={MANAD_KORT[Number(k.slice(5, 7)) - 1]}
                  rubrik={etikett(k)}
                  rad={`${n === 1 ? '1 sökt jobb' : `${n} sökta jobb`}${i ? `, ${i === 1 ? '1 intervju' : `${i} intervjuer`}` : ''}`}
                  vald={k === manad}
                  onClick={() => valjManad(k)}
                />
              )
            })}
            {last ? (
              <div className="mt-2">
                <SparrRam etikett="Rapporten ingår i Premium">
                  <PaywallCard variant="af-rapport" bare />
                </SparrRam>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-3">
                <StorKnapp bred golv storlek="mellan" onClick={skrivUt} disabled={!rapport}>
                  <IkonSkrivare />
                  Skriv ut eller spara som PDF
                </StorKnapp>
                <LitenKnapp storlek={52} bred onClick={kopiera} disabled={!rapport} ikon={<IkonKopiera />}>
                  {kopierad ? 'Kopierad' : 'Kopiera som text till AF-rapporten'}
                </LitenKnapp>
              </div>
            )}
            <TonYta className="mt-3">
              <p className="j3-h3">Dela med en länk</p>
              <p className="j3-text" style={{ marginTop: 6 }}>
                Den som får länken ser din statistik utan att logga in. Länken gäller i 30 dagar.
              </p>
              {lankUrl ? (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="j3-b-lank">{lankUrl}</span>
                    <button
                      type="button"
                      className="j3-liten ikon"
                      aria-label="Kopiera länken"
                      onClick={() => navigator.clipboard.writeText(lankUrl).then(() => success('Länken är kopierad.', 2500))}
                    >
                      <IkonKopiera size={18} />
                    </button>
                  </div>
                  <div>
                    <TextLank onClick={aterkalla}>Återkalla länken</TextLank>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-col items-start gap-3">
                  <Kryss checked={visaForetag} onChange={(e) => setVisaForetag(e.target.checked)}>
                    Visa lista med företag och tjänster. Annars visas bara siffror.
                  </Kryss>
                  <LitenKnapp onClick={skapaLank} disabled={delar} ikon={<IkonLank />}>
                    {delar ? 'Skapar' : 'Skapa delningslänk'}
                  </LitenKnapp>
                </div>
              )}
            </TonYta>
          </div>

          <div className="tracker-report min-w-0" aria-busy={laddar}>
            {laddfel ? (
              <TomtLage text="Vi kunde inte hämta rapporten för månaden just nu." handling={<LitenKnapp onClick={() => hamta(manad)}>Försök igen</LitenKnapp>} inbaddad />
            ) : (
              <div style={{ opacity: laddar ? 0.55 : 1, transition: 'opacity .15s' }}>
                <RapportBlad
                  namn={profile?.full_name || 'Min jobbsökning'}
                  period={etikett(manad)}
                  periodRad={summa ? `${summa.applications === 1 ? '1 sökt jobb' : `${summa.applications} sökta jobb`}, ${summa.interviews === 1 ? '1 intervju' : `${summa.interviews} intervjuer`} denna period` : undefined}
                  sektioner={sektioner}
                  siffror={[
                    { tal: t.sokta.antal, text: 'Sökta totalt' },
                    { tal: t.svar.antal, text: 'Fått svar' },
                    { tal: t.intervju.antal, text: 'Intervjuer' },
                    { tal: t.erbjudande.antal, text: 'Erbjudanden' },
                  ]}
                  fot={`Genererad via jobbcoach.ai · ${new Intl.DateTimeFormat('sv-SE', { dateStyle: 'long' }).format(new Date())}`}
                  under={under}
                />
              </div>
            )}
          </div>
        </div>
      </LyftPanel>
    </Golv>
  )
}

