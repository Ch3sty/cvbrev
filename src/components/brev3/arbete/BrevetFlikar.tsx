'use client'

/**
 * Innehållet i Brevets fem flikar (skissen Brevet-1440 och Mobil-brevet;
 * Texten, Ton och språk, Typsnitt och Titel och företag är inte ritade och
 * följer byggspecen avsnitt 7). Flikarna har inget eget tillstånd för
 * brevet: allt kommer in som props från BrevetVy, som sparar.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { LitenKnapp, StorKnapp, Pips, Tagg, MatarBricka, LangdMitt, IkonPlus } from '@/components/brev3/kit'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import type { BrevKrav } from '@/lib/letters/brevmall/typer'
import { forvaltStycke } from '@/lib/letters/krav'
import { forvaldHalsning } from '@/lib/letters/stycken'
import { BREVET, ordningstal, type TonId } from './texter'
import { SprakVal, TonKnappar } from './TonVal'
import { BREV_TYPSNITT, typsnittFontFace } from './typsnitt'

const FALT =
  'block w-full rounded-[12px] border-2 border-[color:var(--b3-kant)] bg-[color:var(--b3-papper)] px-3 text-[15px] leading-[21px] text-[color:var(--b3-ink)] placeholder:text-[color:var(--b3-ink-3)] focus:border-[color:var(--koppar)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(224,122,47,.18)] disabled:opacity-60'
const ETIKETT = 'mb-1.5 block text-[13px] font-bold leading-[18px] text-[color:var(--b3-ink)]'
const HJALP = 'mt-1.5 block text-[12px] leading-[17px] text-[color:var(--b3-ink-2)]'

/* ------------------------------------------------------------------ Kraven */

export function KravFlik({
  krav,
  antalStycken,
  last,
  onLaggTill,
}: {
  krav: BrevKrav[] | null
  antalStycken: number
  last: boolean
  onLaggTill: (kravIndex: number, mening: string) => Promise<boolean>
}) {
  const [aktivt, setAktivt] = useState<number | null>(null)
  const [mening, setMening] = useState('')
  const [skickar, setSkickar] = useState(false)
  const [fel, setFel] = useState(false)

  if (!krav || krav.length < 3) {
    return <p className="m-0 py-3 text-[14px] leading-[21px] text-[color:var(--b3-ink-2)]">{BREVET.ingaKrav}</p>
  }
  const saknade = krav.map((k, i) => ({ k, i })).filter((x) => !x.k.citat)
  const valt = aktivt !== null && saknade.some((x) => x.i === aktivt) ? aktivt : saknade[0]?.i ?? null
  const stycke = ordningstal(forvaltStycke(antalStycken))

  const laggTill = async () => {
    if (valt === null || mening.trim().length < 3 || skickar) return
    setSkickar(true)
    setFel(false)
    const ok = await onLaggTill(valt, mening.trim())
    setSkickar(false)
    if (ok) {
      setMening('')
      setAktivt(null)
    } else setFel(true)
  }

  return (
    <div className="flex flex-col">
      {krav.map((k, i) =>
        k.citat ? (
          <div key={`${i}-${k.krav}`} className="b3-kr">
            <span className="b3-kr-nr">{i + 1}</span>
            <span className="b3-kr-text">
              <b>{k.krav}</b>
              <small>”{k.citat}”</small>
            </span>
          </div>
        ) : null
      )}
      {saknade.length === 0 ? (
        <p className="m-0 mt-3 flex items-center gap-2 rounded-[14px] bg-[color:var(--b3-gron)] px-3.5 py-3 text-[14px] font-semibold leading-5 text-[color:var(--b3-gron-ink)]" role="status">
          {BREVET.allaSvar}
        </p>
      ) : null}
      {saknade.map(({ k, i }) =>
        i === valt ? (
          <div key={`s${i}`} className="b3-saknas">
            <div className="b3-saknas-topp">
              <span className="b3-kr-nr">{i + 1}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{k.krav}</b>
                <span>{BREVET.saknasRad}</span>
              </span>
            </div>
            <label htmlFor={`krav-mening-${i}`} className="sr-only">
              {BREVET.saknasEtikett(k.krav)}
            </label>
            <textarea
              id={`krav-mening-${i}`}
              placeholder={BREVET.saknasPlats}
              value={mening}
              onChange={(e) => setMening(e.target.value)}
              disabled={last || skickar}
            />
            {fel ? (
              <p className="m-0 mt-2 text-[13px] leading-[18px] text-[color:var(--fel)]" role="alert">
                {BREVET.laggTillFel}
              </p>
            ) : null}
            <div className="b3-saknas-fot">
              <span className="b3-saknas-rad">{BREVET.saknasLaggs(stycke)}</span>
              <LitenKnapp saknas onClick={laggTill} disabled={last || skickar || mening.trim().length < 3}>
                {skickar ? BREVET.laggerTill : BREVET.laggTill}
              </LitenKnapp>
            </div>
          </div>
        ) : (
          <button
            key={`s${i}`}
            type="button"
            className="b3-kr w-full border-0 bg-transparent p-0 text-left"
            onClick={() => {
              setAktivt(i)
              setMening('')
              setFel(false)
            }}
          >
            <span className="b3-kr-nr" style={{ background: 'var(--b3-papper)', color: 'var(--koppar-ink)', border: '2.5px dashed var(--koppar)', boxShadow: 'none' }}>
              {i + 1}
            </span>
            <span className="b3-kr-text">
              <b>{k.krav}</b>
              <small>{BREVET.saknasRad}</small>
            </span>
          </button>
        )
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Texten */

function VaxandeFalt({ value, onChange, onFocus, disabled, id, refFn, etikett }: { value: string; onChange: (v: string) => void; onFocus: () => void; disabled: boolean; id: string; refFn?: (el: HTMLTextAreaElement | null) => void; etikett: string }) {
  const ref = useRef<HTMLTextAreaElement | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(72, el.scrollHeight + 4)}px`
  }, [value])
  return (
    <textarea
      id={id}
      ref={(el) => {
        ref.current = el
        refFn?.(el)
      }}
      aria-label={etikett}
      className={`${FALT} resize-none overflow-hidden py-2.5`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      disabled={disabled}
      rows={3}
    />
  )
}

export function TextFlik({
  halsning,
  sprak,
  stycken,
  aktivt,
  last,
  ord,
  andel,
  fokusStycke,
  onHalsning,
  onStycke,
  onAktivt,
  onLaggTillStycke,
  onTaBortStycke,
}: {
  halsning: string
  sprak: 'sv' | 'en'
  stycken: string[]
  aktivt: number | null
  last: boolean
  ord: number
  andel: number
  /** Ändras när ett stycke på arket trycks: fältet får fokus. */
  fokusStycke: { i: number; n: number } | null
  onHalsning: (v: string) => void
  onStycke: (i: number, v: string) => void
  onAktivt: (i: number | null) => void
  onLaggTillStycke: () => void
  onTaBortStycke: (i: number) => void
}) {
  const falt = useRef<(HTMLTextAreaElement | null)[]>([])
  useEffect(() => {
    if (!fokusStycke) return
    const el = falt.current[fokusStycke.i]
    if (el) {
      el.focus({ preventScroll: true })
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [fokusStycke])

  return (
    <div className="flex flex-col gap-3 pb-3 pt-1">
      <div>
        <label htmlFor="brev-halsning" className={ETIKETT}>
          {BREVET.halsning}
        </label>
        <input
          id="brev-halsning"
          type="text"
          className={`${FALT} h-11`}
          value={halsning}
          placeholder={forvaldHalsning(sprak)}
          onChange={(e) => onHalsning(e.target.value)}
          onFocus={() => onAktivt(null)}
          disabled={last}
          maxLength={200}
        />
      </div>
      {stycken.map((s, i) => (
        <div key={i}>
          <div className="flex items-center justify-between">
            <label htmlFor={`brev-stycke-${i}`} className={ETIKETT}>
              {BREVET.stycke(i)}
            </label>
            {aktivt === i && stycken.length > 1 && !last ? (
              <button type="button" className="inline-flex min-h-[32px] items-center text-[13px] font-semibold leading-[18px] text-[color:var(--fel)] underline underline-offset-[3px]" onClick={() => onTaBortStycke(i)}>
                {BREVET.taBortStycket}
              </button>
            ) : null}
          </div>
          <VaxandeFalt
            id={`brev-stycke-${i}`}
            etikett={BREVET.stycke(i)}
            value={s}
            onChange={(v) => onStycke(i, v)}
            onFocus={() => onAktivt(i)}
            disabled={last}
            refFn={(el) => {
              falt.current[i] = el
            }}
          />
        </div>
      ))}
      {!last ? (
        <button type="button" className="inline-flex min-h-[44px] items-center gap-2 self-start text-[14px] font-semibold leading-5 text-[color:var(--b3-ink)] underline underline-offset-[3px]" onClick={onLaggTillStycke}>
          <IkonPlus size={16} />
          {BREVET.laggTillStycke}
        </button>
      ) : null}
      <div className="mt-1 flex flex-col gap-2.5 rounded-[18px] bg-[color:var(--b3-mjuk)] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="b3-eyebrow">Längden</span>
          {andel > 1 ? <MatarBricka>{BREVET.overSida}</MatarBricka> : null}
        </div>
        <LangdMitt ord={ord} andel={andel} etikett={BREVET.langdEtikett(andel)} />
        {andel > 1 ? <p className="b3-matare-rad">{BREVET.overSidaRad}</p> : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Ton och språk */

export function TonFlik({
  ton,
  sprak,
  harBetalt,
  last,
  kvot,
  skriverOm,
  fel,
  onTon,
  onSprak,
  onSkrivOm,
  namn,
}: {
  ton: TonId
  sprak: 'sv' | 'en'
  harBetalt: boolean
  last: boolean
  kvot: { kvar: number | null; nastaDag: string | null }
  skriverOm: boolean
  fel: string | null
  onTon: (t: TonId) => void
  onSprak: (s: 'sv' | 'en') => void
  onSkrivOm: () => void
  namn?: ReactNode
}) {
  const slut = !harBetalt && kvot.kvar === 0
  return (
    <div className="flex flex-col gap-4 pb-3 pt-1">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="b3-eyebrow">{BREVET.sprak}</p>
          <SprakVal sprak={sprak} onSprak={onSprak} disabled={last || skriverOm} />
        </div>
        <p className="b3-eyebrow mb-2">Tonen</p>
        <TonKnappar ton={ton} onTon={onTon} harBetalt={harBetalt} disabled={last || skriverOm} />
      </div>
      {namn}
      <p className="m-0 text-[14px] leading-[21px] text-[color:var(--b3-ink-2)]">{BREVET.skrivOmRad}</p>
      {!harBetalt ? (
        <p className="m-0 flex items-center gap-3 text-[13px] leading-[18px] text-[color:var(--b3-ink-2)]">
          <Pips fyllda={slut ? 1 : 0} totalt={1} etikett={slut ? 'Veckans gratisbrev är använt' : 'Veckans gratisbrev är kvar'} />
          <span>
            {slut ? (kvot.nastaDag ? `Nästa gratisbrev ${kvot.nastaDag}.` : null) : BREVET.kvotRaknas}{' '}
            <span className="b3-premium-rad">{`Utan tak i ${PAKETRADER.bricka}`}</span>
          </span>
        </p>
      ) : null}
      {fel ? (
        <p className="m-0 text-[13px] leading-[18px] text-[color:var(--fel)]" role="alert">
          {fel}
        </p>
      ) : null}
      <StorKnapp lag platt className="xl:self-start" onClick={onSkrivOm} disabled={last || skriverOm}>
        {skriverOm ? BREVET.skriverOm : BREVET.skrivOm}
      </StorKnapp>
    </div>
  )
}

/* ------------------------------------------------------------------ Typsnitt */

export function TypsnittFlik({
  fontId,
  mallNamn,
  harBetalt,
  last,
  onVal,
}: {
  fontId: string | null
  mallNamn: string
  harBetalt: boolean
  last: boolean
  onVal: (id: string | null) => void
}) {
  const rad = (id: string | null, namn: string, familj: string | null, under: string | null, premium: boolean) => {
    const valt = fontId === id
    const sparrad = premium && !harBetalt
    return (
      <button
        key={id ?? 'mall'}
        type="button"
        role="radio"
        aria-checked={valt}
        disabled={last || sparrad}
        onClick={() => onVal(id)}
        className={`flex min-h-[60px] w-full items-center gap-3 rounded-[16px] border-2 px-3.5 py-2 text-left disabled:cursor-not-allowed ${
          valt
            ? 'border-[color:var(--b3-valt)] bg-[color:var(--b3-mjuk)] shadow-[0_3px_0_var(--b3-valt-kant)]'
            : 'border-[color:var(--b3-kant)] bg-[color:var(--b3-papper)] shadow-[0_3px_0_var(--b3-kant)]'
        } ${sparrad ? 'opacity-70' : ''}`}
      >
        <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${valt ? 'border-[color:var(--b3-valt)]' : 'border-[color:var(--b3-streck)]'}`}>
          {valt ? <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--b3-valt)]" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[19px] leading-[26px] text-[color:var(--b3-ink)]" style={familj ? { fontFamily: `'${familj}'` } : undefined}>
            {namn}
          </span>
          {under ? <span className="block truncate text-[12px] leading-4 text-[color:var(--b3-ink-2)]">{under}</span> : null}
        </span>
        {premium ? (
          <Tagg ton="p" las={sparrad}>
            {PAKETRADER.bricka}
          </Tagg>
        ) : null}
      </button>
    )
  }
  return (
    <div className="flex flex-col gap-2 pb-3 pt-1" role="radiogroup" aria-label="Typsnitt">
      <style>{typsnittFontFace()}</style>
      {rad(null, BREVET.mallensEget, null, BREVET.mallensEgetRad(mallNamn), false)}
      {BREV_TYPSNITT.map((t) => rad(t.id, t.namn, t.familj, null, t.premium))}
      <p className="m-0 mt-1 text-[12px] leading-[17px] text-[color:var(--b3-ink-2)]">{BREVET.typsnittWord}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ Titel och företag */

export function InfoFlik({
  titel,
  foretag,
  tjanst,
  mottagare,
  last,
  onAndra,
  onTaBort,
}: {
  titel: string
  foretag: string
  tjanst: string
  mottagare: string
  last: boolean
  onAndra: (falt: 'title' | 'company' | 'job_title' | 'mottagare_person', v: string) => void
  onTaBort: () => void
}) {
  return (
    <div className="flex flex-col gap-4 pb-3 pt-1">
      <div>
        <label htmlFor="brev-titel" className={ETIKETT}>
          {BREVET.titel}
        </label>
        <input id="brev-titel" className={`${FALT} h-11`} value={titel} placeholder={BREVET.titelPlats} onChange={(e) => onAndra('title', e.target.value)} disabled={last} maxLength={200} />
        <span className={HJALP}>{BREVET.titelHjalp}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="brev-foretag" className={ETIKETT}>
            {BREVET.foretag}
          </label>
          <input id="brev-foretag" className={`${FALT} h-11`} value={foretag} placeholder={BREVET.foretagPlats} onChange={(e) => onAndra('company', e.target.value)} disabled={last} maxLength={200} />
        </div>
        <div>
          <label htmlFor="brev-tjanst" className={ETIKETT}>
            {BREVET.tjanst}
          </label>
          <input id="brev-tjanst" className={`${FALT} h-11`} value={tjanst} placeholder={BREVET.tjanstPlats} onChange={(e) => onAndra('job_title', e.target.value)} disabled={last} maxLength={200} />
        </div>
      </div>
      <span className={`${HJALP} -mt-2`}>{BREVET.foretagHjalp}</span>
      <div>
        <label htmlFor="brev-mottagare" className={ETIKETT}>
          {BREVET.mottagare}
        </label>
        <input id="brev-mottagare" className={`${FALT} h-11`} value={mottagare} placeholder={BREVET.mottagarePlats} onChange={(e) => onAndra('mottagare_person', e.target.value)} disabled={last} maxLength={200} aria-describedby="brev-mottagare-hjalp" />
        <span id="brev-mottagare-hjalp" className={HJALP}>
          {BREVET.mottagareHjalp}
        </span>
      </div>
      <button type="button" className="inline-flex min-h-[44px] items-center self-start text-[14px] font-semibold leading-5 text-[color:var(--fel)] underline underline-offset-[3px]" onClick={onTaBort}>
        {BREVET.taBort}
      </button>
    </div>
  )
}
