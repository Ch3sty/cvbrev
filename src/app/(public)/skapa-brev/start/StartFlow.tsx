'use client'

/**
 * Brevflödet utan konto (docs/plan-konvertering.md, C6), i publikt omgång 3
 * (skissen skapa-brev-start, nytt-innehall.md avsnitt skapa-brev-start).
 *
 * Besökaren väljer mall och ton, fyller i tjänst, arbetsgivare och sin
 * erfarenhet, får ett brev skrivet, ser första stycket på arket i mallen och
 * möts sedan av spärren. Resten av texten finns bara på servern tills någon
 * registrerat sig.
 *
 * Det som följer med in i kontot (byggbriefens beslut 6, CV-flödets mönster):
 * utkastets token (sessionStorage och /register?draft=, som förut) och, bredvid
 * den, mallen, tonen och annonsen (localStorage, publikt-brev-val.ts). Claim
 * skriver brevet i mallen; en Premiummall öppnas provad i Mallar.
 *
 * Annonsen från säljsidan kommer via sessionStorage och fyller fältet, aldrig
 * via adressen. Arket ritas av brevmotorn på servern (POST
 * /api/public/letter-draft/ark) och visas i en iframe; tills det har kommit,
 * och om rutten inte svarar, står ett enkelt ark med samma innehåll.
 * Arket visar aldrig suddad text: första stycket och sedan tomma streck.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFriSikt } from '@/components/shared/useFriSikt'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { storePendingDraft } from '@/lib/letters/claim-draft-client'
import { hamtaAnnonsTillStart, sparaUtkastVal } from '@/lib/letters/publikt-brev-val'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { TONER } from '@/components/brev3/arbete/texter'

const MIN_EXPERIENCE = 200
/** Kontots förval för tonen (dashboard/skapa-brev). */
const FORVALD_TON = 'balanced'

interface DraftResult {
  draftToken: string
  previewParagraph: string
  blurredLineCount: number
  expiresAt: string
}

/** En av de 40 mallarna, räknad på servern ur brevets katalog. */
export interface StartMall {
  id: string
  namn: string
  gratis: boolean
  word: boolean
  /** "Ingår i Premium, även som Word." */
  rad: string
  /** Miniatyren: brevets egen om den finns, annars mallens CV-miniatyr. */
  bild: string
  brevbild: boolean
  farg: boolean
  sidospalt: boolean
  enkel: boolean
}

/** Texter med tal och namn ur katalogen och plans.ts. */
export interface StartTexter {
  premium: string
  /** "Linne och Björk" */
  gratisNamn: string
  allaAntal: number
  /** "Linne och Björk är gratis. De övriga 38 ingår i Premium, och du provar dem med ditt eget brev." */
  valjareRad: string
}

interface StartFlowProps {
  /** Förifylld roll från ?yrke=. Tom sträng när slugen är okänd. */
  initialRole: string
  yrkeSlug?: string
  /** Yrkets visningsnamn, för rubrik och CTA. */
  yrkeLabel?: string
  mallar: StartMall[]
  /** Mallen ur ?mall= (kontrollerad), annars Linne. */
  initialMall: string
  /** Kom mallen med i adressen? Då säger raden "Mallen du valde". */
  mallFranAdress: boolean
  arbetsgivarePlats: string
  texter: StartTexter
}

type Filter = 'alla' | 'gratis' | 'enkla' | 'farg' | 'sidospalt'

/** Filtren som i kontot (brev3/mallar/filter.ts), räknade ur mallens egenskaper. */
function passar(m: StartMall, f: Filter): boolean {
  if (f === 'gratis') return m.gratis
  if (f === 'enkla') return m.enkel
  if (f === 'farg') return m.farg
  if (f === 'sidospalt') return m.sidospalt
  return true
}

const PIL = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const BOCK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 12.5l4 4 8-9" />
  </svg>
)
const LAS = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

/** Brett läge (från 1000 px), där arket står bredvid panelen. */
function useBrett(): boolean {
  const [brett, setBrett] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(min-width: 1000px)')
    const satt = () => setBrett(mq.matches)
    satt()
    mq.addEventListener?.('change', satt)
    return () => mq.removeEventListener?.('change', satt)
  }, [])
  return brett
}

/**
 * Arket i mallen från servern. Hämtas bara när det syns (brett läge eller
 * efter utkastet), med en kort paus medan besökaren skriver i fälten.
 */
function useArkHtml(aktiv: boolean, mall: string, tjanst: string, foretag: string, stycke?: string): string | null {
  const [html, setHtml] = useState<string | null>(null)
  const forsta = useRef(true)
  useEffect(() => {
    if (!aktiv) return
    const ctrl = new AbortController()
    const paus = forsta.current ? 0 : 450
    forsta.current = false
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/public/letter-draft/ark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mall, tjanst: tjanst.trim(), foretag: foretag.trim(), stycke }),
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const j = (await res.json()) as { html?: unknown }
        if (typeof j.html === 'string') setHtml(j.html)
      } catch {
        // Avbrutet eller utan nät: det enkla arket står kvar.
      }
    }, paus)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [aktiv, mall, tjanst, foretag, stycke])
  return html
}

/** Tomma streck på det enkla arket (aldrig suddad text). */
function Streck({ antal, start = 0 }: { antal: number; start?: number }) {
  return (
    <>
      {Array.from({ length: antal }).map((_, i) => (
        <i key={i} className="sb-l" style={{ width: `${72 + (((i + start) * 13) % 26)}%` }} />
      ))}
    </>
  )
}

/** Det enkla arket: tills mallens ark har kommit från servern, och om rutten inte svarar. */
function EnkeltArk({ role, employer, stycke }: { role: string; employer?: string; stycke?: string }) {
  return (
    <div className="sb-ark" aria-hidden="true">
      <p className="sb-ark-namn">Ditt namn</p>
      <p className="sb-ark-kontakt">din e-post · ditt telefonnummer · din ort</p>
      <p className="sb-ark-mottagare">{employer?.trim() || 'Arbetsgivaren'}</p>
      <p className="sb-ark-arende">Ansökan: {role.trim() || 'tjänsten du söker'}</p>
      {stycke ? (
        <>
          <p className="sb-ark-stycke">{stycke}</p>
          <div>
            <Streck antal={4} />
            <span className="sb-ark-luft" />
            <Streck antal={5} start={4} />
          </div>
        </>
      ) : (
        <div>
          <i className="sb-l sb-l-kort" />
          <Streck antal={4} />
          <span className="sb-ark-luft" />
          <Streck antal={5} start={4} />
          <span className="sb-ark-luft" />
          <Streck antal={3} start={9} />
        </div>
      )}
    </div>
  )
}

/** Raden under arket (nytt-innehall.md): vald Premiummall, vald gratismall, eller förvalet. */
function ArkRad({ mall, vald, gratisNamn }: { mall: StartMall; vald: boolean; gratisNamn: string }) {
  if (!mall.gratis) {
    return (
      <>
        <b>{`${mall.namn}, mallen du valde.`}</b> {`Du provar den med ditt eget brev. ${gratisNamn} är gratis.`}
      </>
    )
  }
  if (vald) {
    return (
      <>
        <b>{`${mall.namn}, mallen du valde.`}</b> {mall.word ? 'Den är gratis, även som Word.' : 'Den är gratis.'}
      </>
    )
  }
  return (
    <>
      <b>{`${mall.namn}.`}</b> {`${mall.rad} Du byter mall när du vill.`}
    </>
  )
}

/** Arket bredvid panelen, i den valda mallen. */
function Ark({
  role,
  employer,
  stycke,
  mall,
  vald,
  texter,
  html,
  onBytMall,
}: {
  role: string
  employer: string
  stycke?: string
  mall: StartMall
  vald: boolean
  texter: StartTexter
  html: string | null
  onBytMall?: () => void
}) {
  return (
    <figure className="sb-ark-ram" aria-label={stycke ? `Ditt brev i mallen ${mall.namn}. Första stycket visas.` : undefined} aria-hidden={stycke ? undefined : true}>
      <div className="sb-ark-yta">
        {html ? (
          <div className="sb-ark-mall" aria-hidden="true">
            <iframe srcDoc={html} title={`Ditt brev i mallen ${mall.namn}`} tabIndex={-1} scrolling="no" />
          </div>
        ) : (
          <EnkeltArk role={role} employer={employer} stycke={stycke} />
        )}
        {stycke ? (
          <span className="sb-lapp" aria-hidden="true">
            Första stycket
          </span>
        ) : null}
      </div>
      {stycke ? (
        <>
          {/* Skärmläsaren får första stycket som text; arket är en bild av samma sak. */}
          <p className="sr-only">{stycke}</p>
          <p className="sb-ark-vantar">
            <span className="sb-ark-ikon">{LAS}</span>
            Resten av brevet väntar på dig. Du ser det när du har skapat konto.
          </p>
        </>
      ) : null}
      <figcaption>
        <ArkRad mall={mall} vald={vald} gratisNamn={texter.gratisNamn} />
        {onBytMall ? (
          <>
            {' '}
            <button type="button" className="sb-ark-byt" onClick={onBytMall}>
              Byt mall
            </button>
          </>
        ) : null}
      </figcaption>
    </figure>
  )
}

/** Väljaren med alla 40 mallarna (skissblad 2). Inget lås och inget köpsteg: alla går att välja och provas. */
function MallValjare({
  oppen,
  mallar,
  vald,
  texter,
  onValj,
  onStang,
}: {
  oppen: boolean
  mallar: StartMall[]
  vald: string
  texter: StartTexter
  onValj: (id: string) => void
  onStang: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [filter, setFilter] = useState<Filter>('alla')
  const [markerad, setMarkerad] = useState(vald)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (oppen) {
      setMarkerad(vald)
      if (!d.open && typeof d.showModal === 'function') d.showModal()
    } else if (d.open) {
      d.close()
    }
  }, [oppen, vald])

  const synliga = mallar.filter((m) => passar(m, filter))
  const m = mallar.find((x) => x.id === markerad) ?? mallar[0]
  const filtren: { id: Filter; text: string }[] = [
    { id: 'alla', text: `Alla ${texter.allaAntal}` },
    { id: 'gratis', text: 'Gratis' },
    { id: 'enkla', text: 'Enkla' },
    { id: 'farg', text: 'Med färg' },
    { id: 'sidospalt', text: 'Sidospalt' },
  ]

  return (
    <dialog
      ref={ref}
      className="sb-valjare"
      aria-label="Välj mall"
      onClose={onStang}
      onCancel={onStang}
      onClick={(e) => {
        if (e.target === e.currentTarget) onStang()
      }}
    >
      <div className="sb-v-ram">
        <div className="sb-v-huvud">
          <p>Välj mall</p>
          <button type="button" className="sb-v-stang" aria-label="Stäng" onClick={onStang}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="sb-v-filter" role="group" aria-label="Filtrera mallar">
          {filtren.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.text}
            </button>
          ))}
        </div>
        <p className="sb-v-rad">{texter.valjareRad}</p>
        <p className="sb-v-not">Bilderna visar mallen på ett exempelbrev. Ditt brev får mallens huvud, typsnitt och färger.</p>
        <div className="sb-v-rutnat">
          {synliga.map((x) => (
            <button
              key={x.id}
              type="button"
              className="sb-vm"
              aria-pressed={x.id === markerad}
              aria-label={`Mallen ${x.namn}${x.gratis ? ', gratis' : ''}`}
              onClick={() => setMarkerad(x.id)}
              onDoubleClick={() => onValj(x.id)}
            >
              <span className="sb-vm-bild" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.bild} alt="" width={x.brevbild ? 480 : 112} height={x.brevbild ? 679 : 158} loading="lazy" decoding="async" />
              </span>
              <span className="sb-vm-namn">{x.namn}</span>
              {x.id === vald ? (
                <i className="sb-vm-vald">Vald</i>
              ) : x.gratis ? (
                <i className="sb-vm-gratis">Gratis</i>
              ) : null}
            </button>
          ))}
        </div>
        <div className="sb-v-fot">
          <p aria-live="polite">
            <b>{`${m.namn}.`}</b> {m.rad}
          </p>
          <button type="button" className="p3-knapp p3-knapp-vit sb-v-anvand" onClick={() => onValj(m.id)}>
            {`Använd ${m.namn}`}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default function StartFlow({ initialRole, yrkeSlug, yrkeLabel, mallar, initialMall, mallFranAdress, arbetsgivarePlats, texter }: StartFlowProps) {
  const [role, setRole] = useState(initialRole)
  const [employer, setEmployer] = useState('')
  const [experience, setExperience] = useState('')
  const [jobAd, setJobAd] = useState('')
  const [showJobAd, setShowJobAd] = useState(false)
  const [annonsFoljde, setAnnonsFoljde] = useState(false)
  const [ton, setTon] = useState<string>(FORVALD_TON)
  const [mallId, setMallId] = useState(initialMall)
  const [mallBytt, setMallBytt] = useState(false)
  const [valjare, setValjare] = useState(false)
  const bytKnapp = useRef<HTMLButtonElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerHref, setRegisterHref] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftResult | null>(null)

  const mall = useMemo(() => mallar.find((m) => m.id === mallId) ?? mallar[0], [mallar, mallId])
  const vald = mallFranAdress || mallBytt
  const brett = useBrett()
  const arkHtml = useArkHtml(brett || !!draft, mall.id, role, employer, draft?.previewParagraph)

  // Annonsen från säljsidan, en gång (sessionStorage, aldrig adressen).
  useEffect(() => {
    const a = hamtaAnnonsTillStart()
    if (a) {
      setJobAd(a)
      setShowJobAd(true)
      setAnnonsFoljde(true)
    }
  }, [])

  useEffect(() => {
    capture('sample_started', { kind: 'letter', yrke_slug: yrkeSlug, cluster: 'letter', template: initialMall })
  }, [yrkeSlug, initialMall])

  // Valet bredvid utkastets token, också när mallen byts efter utkastet.
  useEffect(() => {
    if (draft) sparaUtkastVal(draft.draftToken, { mall: mall.id, ton, annons: jobAd.trim() || null })
  }, [draft, mall.id, ton, jobAd])

  useEffect(() => {
    if (draft) {
      storePendingDraft(draft.draftToken)
      capture('sample_completed', { kind: 'letter', yrke_slug: yrkeSlug, cluster: 'letter', template: mall.id, ton })
      capture('signup_gate_shown', { kind: 'letter', cluster: 'letter' })
    }
    // Mätningen gäller utkastet, inte senare mallbyten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, yrkeSlug])

  const oppnaValjare = () => setValjare(true)
  const stangValjare = () => {
    setValjare(false)
    bytKnapp.current?.focus({ preventScroll: true })
  }
  const valjMall = (id: string) => {
    setMallId(id)
    setMallBytt(true)
    stangValjare()
  }

  const canSubmit =
    role.trim().length > 0 &&
    employer.trim().length > 0 &&
    experience.trim().length >= MIN_EXPERIENCE &&
    !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    setRegisterHref(null)

    try {
      const res = await fetch('/api/public/letter-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.trim(),
          employer: employer.trim(),
          experience: experience.trim(),
          jobAd: jobAd.trim() || undefined,
          yrkeSlug,
          ton,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? data.error ?? 'Något gick fel. Försök igen.')
        if (typeof data.registerHref === 'string') setRegisterHref(data.registerHref)
        return
      }

      setDraft(data as DraftResult)
    } catch {
      setError('Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.')
    } finally {
      setLoading(false)
    }
  }

  const valjaren = (
    <MallValjare oppen={valjare} mallar={mallar} vald={mall.id} texter={texter} onValj={valjMall} onStang={stangValjare} />
  )

  if (draft) {
    return (
      <>
        <DraftGate
          draft={draft}
          yrkeLabel={yrkeLabel ?? role}
          role={role}
          employer={employer}
          mall={mall}
          vald={vald}
          texter={texter}
          arkHtml={arkHtml}
          onBytMall={oppnaValjare}
        />
        {valjaren}
      </>
    )
  }

  const antal = experience.trim().length
  const franExemplet = !!yrkeSlug && role === initialRole && initialRole.length > 0

  return (
    <div className="sb-rad">
      <form onSubmit={handleSubmit} className="sb-panel" aria-label="Tjänsten och din erfarenhet">
        <div className="sb-panel-huvud">
          <b>Tjänsten och du</b>
          <span>Allt går att ändra efteråt</span>
        </div>
        <div className="sb-panel-kropp">
          <div className="sb-mall">
            <span className={`sb-mall-bild ${mall.brevbild ? '' : 'sb-mall-cv'}`.trim()} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mall.bild} alt="" width={mall.brevbild ? 480 : 112} height={mall.brevbild ? 679 : 158} decoding="async" />
            </span>
            <p>
              <small>{vald ? 'Mallen du valde' : 'Mall'}</small>
              <b>{`${mall.namn}.`}</b> {mall.rad}
            </p>
            <button ref={bytKnapp} type="button" className="sb-mall-byt" onClick={oppnaValjare} aria-haspopup="dialog">
              Byt mall
            </button>
          </div>

          <Field
            label="Tjänsten du söker"
            value={role}
            onChange={setRole}
            placeholder="Till exempel Butikssäljare"
            marke={franExemplet ? 'från exemplet' : undefined}
          />

          <Field label="Arbetsgivare" value={employer} onChange={setEmployer} placeholder={arbetsgivarePlats} />

          <div className="sb-falt">
            <label htmlFor="experience">Din erfarenhet</label>
            <p className="sb-hjalp" id="experience-hjalp">
              Skriv fritt om vad du gjort, vad du är bra på och varför du vill ha jobbet. Ju mer konkret du är, desto bättre blir brevet.
            </p>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={7}
              aria-describedby="experience-hjalp experience-rakna"
            />
            <div className="sb-rakna">
              <span className="sb-rakna-stapel" aria-hidden="true">
                <i style={{ width: `${Math.min(100, Math.round((antal / MIN_EXPERIENCE) * 100))}%` }} />
              </span>
              <span id="experience-rakna" className="sb-rakna-tal">
                {antal} av minst {MIN_EXPERIENCE} tecken
              </span>
            </div>
          </div>

          <fieldset className="sb-falt sb-ton">
            <legend>Tonen</legend>
            <div className="sb-ton-val" role="group" aria-label="Brevets ton">
              {TONER.map((t) => (
                <button key={t.id} type="button" aria-pressed={ton === t.id} onClick={() => setTon(t.id)}>
                  <b>{t.namn}</b>
                  <small>{t.rad}</small>
                </button>
              ))}
            </div>
          </fieldset>

          {showJobAd ? (
            <div className="sb-falt">
              <label htmlFor="jobAd">Jobbannonsen (valfritt)</label>
              {annonsFoljde ? <p className="sb-hjalp sb-foljde">Annonsen du klistrade in följde med.</p> : null}
              <textarea id="jobAd" value={jobAd} onChange={(e) => setJobAd(e.target.value)} rows={6} />
            </div>
          ) : (
            <button type="button" onClick={() => setShowJobAd(true)} className="sb-mer">
              <span aria-hidden="true">+</span>
              Klistra in jobbannonsen också
            </button>
          )}

          {error ? (
            <div className="sb-fel" role="alert">
              <p>{error}</p>
              {registerHref ? (
                <Link href={registerHref} className="sb-fel-lank">
                  Skapa ett gratiskonto
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="sb-panel-fot">
          <p>
            <b>Första personliga brevet är gratis.</b> Du ser första stycket direkt och hela brevet när du har skapat ett gratiskonto.
          </p>
          <button type="submit" disabled={!canSubmit} data-cta="start-flow-generate" className="p3-knapp sb-skriv">
            {loading ? 'Skriver ditt brev…' : 'Skriv mitt brev'}
            {loading ? null : PIL}
          </button>
        </div>
      </form>
      <div className="sb-ark-spalt">
        <Ark role={role} employer={employer} mall={mall} vald={vald} texter={texter} html={arkHtml} />
      </div>
      {valjaren}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  marke,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  /** Märket i fältet: "från exemplet". */
  marke?: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="sb-falt">
      <label htmlFor={id}>{label}</label>
      <span className="sb-input">
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {marke ? <em>{marke}</em> : null}
      </span>
    </div>
  )
}

/** Spärrens andra rad (nytt-innehall.md): Premiummallen öppnas, gratismallen sparas. */
export function sparrMallRad(mall: Pick<StartMall, 'namn' | 'gratis'>, vald: boolean): string {
  if (!mall.gratis) return `Brevet öppnas i ${mall.namn}, mallen du valde`
  return vald ? `Brevet sparas i ${mall.namn}, mallen du valde` : `Brevet sparas i ${mall.namn}`
}

/**
 * Spärren. Första stycket i klartext på arket, resten som tomma streck.
 * Vi blurrar aldrig riktig text med CSS: raderna nedanför är tomma element,
 * själva brevet ligger kvar på servern.
 */
function DraftGate({
  draft,
  yrkeLabel,
  role,
  employer,
  mall,
  vald,
  texter,
  arkHtml,
  onBytMall,
}: {
  draft: DraftResult
  yrkeLabel: string
  role: string
  employer: string
  mall: StartMall
  vald: boolean
  texter: StartTexter
  arkHtml: string | null
  onBytMall: () => void
}) {
  const registerHref = `/register?draft=${encodeURIComponent(draft.draftToken)}`
  // Samtycket får aldrig ligga över kontoknappen (useFriSikt).
  const sparrRef = useRef<HTMLElement>(null)
  useFriSikt(sparrRef)

  return (
    <div className="sb-rad sb-klart">
      <section ref={sparrRef} className="sb-panel">
        <div className="sb-panel-huvud">
          <b>Utkastet är skrivet</b>
          <span>{[role.trim(), employer.trim()].filter(Boolean).join(', ')}</span>
        </div>
        <div className="sb-panel-kropp">
          <h2 className="p3-h2 sb-klart-rubrik">Ditt brev är klart</h2>
          <p className="sb-klart-text">
            Skapa ett gratiskonto så får du hela brevet, och vi sparar det åt dig. Vill du ladda ner det som PDF eller Word ingår det i {paketKort()},{' '}
            {prisPeriod(SALD_PLAN)}.
          </p>
          <ul className="sb-far">
            <li>
              <span className="sb-far-ikon">{BOCK}</span>
              Hela brevet, att läsa, kopiera och ändra
            </li>
            <li>
              <span className="sb-far-ikon">{BOCK}</span>
              {sparrMallRad(mall, vald)}
            </li>
            <li>
              <span className="sb-far-ikon sb-far-las">{LAS}</span>
              {`Nedladdning som PDF och Word ingår i ${texter.premium}`}
            </li>
          </ul>
          <Link
            href={registerHref}
            data-cta="start-flow-gate"
            onClick={() => capture('signup_started', { cluster: 'letter', source_page: '/skapa-brev/start' })}
            className="p3-knapp p3-knapp-bred"
          >
            Skapa konto och läs brevet
            {PIL}
          </Link>
          <p className="sb-klart-not">Inget kreditkort. Avsluta när du vill.</p>
          <p className="sb-klart-not">Utkastet för {yrkeLabel.toLowerCase()} sparas i sju dagar.</p>
        </div>
      </section>
      <div className="sb-ark-spalt">
        <Ark role={role} employer={employer} stycke={draft.previewParagraph} mall={mall} vald={vald} texter={texter} html={arkHtml} onBytMall={onBytMall} />
      </div>
    </div>
  )
}
