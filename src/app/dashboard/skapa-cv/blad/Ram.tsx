'use client'

/**
 * Bladets ram i arbetsläget (skisserna Redigera-1440, Bygg-1440,
 * Mobil-redigera): papper med mörkt huvud. På datorn står bladet till
 * vänster under avsnittsraden, med egen rullning i kroppen och foten
 * (förklaringen, Avbryt, Spara) alltid synlig. På telefonen är det ett
 * bottenblad under arket; huvudet med handtaget fäller ihop och upp det.
 *
 * Ramen hämtar det arbetsläget äger ur ArbetsKontext: läget, avsnittsraden
 * (telefonen har den överst i bladet), raderna ovanför innehållet (Ångra,
 * spärren för antal CV), Nästa-raden och foten. Bladen ger rubriken,
 * innehållet och sin sparknapp.
 */
import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react'
import type { ByggCv } from '@/lib/cv/bygg/modell'
import type { Lage } from '../arbetslage'
import { ARBETE } from '../texter'
import s from '../arbetslage.module.css'

export interface Arbete {
  dator: boolean
  lage: Lage
  fallt: boolean
  setFallt: (v: boolean) => void
  avsnittsrad: ReactNode
  ovan: ReactNode
  nasta: ReactNode
  fotText: string
  onAvbryt: (() => void) | null
  /** Bladets sparfunktion, så att Klar och avsnittsbyten sparar det hon skrivit. Sant när det gick. */
  registrera: (fn: (() => boolean) | null) => void
  /** Bladets utkast medan hon skriver (null: inget ändrat), för arket. */
  onUtkast: (cv: ByggCv | null) => void
}

export const ArbetsKontext = createContext<Arbete | null>(null)

export function useArbete(): Arbete {
  const a = useContext(ArbetsKontext)
  if (!a) throw new Error('ArbetsKontext saknas')
  return a
}

/**
 * Bladets utkast till arket: CV:t som det skulle se ut om hon sparade nu.
 * Jämförs med bladets första version, så att ett blad som bara öppnats
 * aldrig räknas som ändrat (ett uppladdat CV:s datum skrivs inte om av sig självt).
 */
export function useUtkast(bygg: () => ByggCv | null, deps: readonly unknown[]) {
  const { onUtkast } = useArbete()
  const forsta = useRef<string | null>(null)
  useEffect(() => {
    const ny = bygg()
    const sn = JSON.stringify(ny)
    if (forsta.current === null) {
      forsta.current = sn
      return
    }
    onUtkast(sn === forsta.current || !ny ? null : ny)
    // deps bär bladets fält.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Registrerar bladets spara hos arbetsläget, varje rendering (fälten ändras). */
export function useRegistrera(spara: () => boolean) {
  const { registrera } = useArbete()
  const ref = useRef(spara)
  ref.current = spara
  useEffect(() => {
    registrera(() => ref.current())
    return () => registrera(null)
  }, [registrera])
}

export interface RamProps {
  rubrik: ReactNode
  /** Till höger i huvudet: "3 jobb, det senaste först", "Avsnitt 2 av 5". */
  under?: ReactNode
  /** Telefonens kortare variant ("Jobb 1 av 3"). */
  underMobil?: ReactNode
  /** Sparknappen. */
  fot?: ReactNode
  children: ReactNode
  /** Byts nyckeln flyttas fokus till första fältet (dator). */
  nyckel: string
}

export default function Ram({ rubrik, under, underMobil, fot, children, nyckel }: RamProps) {
  const a = useArbete()
  const id = useId()
  const ref = useRef<HTMLElement>(null)
  const kropp = useRef<HTMLDivElement>(null)

  useEffect(() => {
    kropp.current?.scrollTo({ top: 0 })
    if (!a.dator) return
    const t = window.setTimeout(() => {
      const forsta = kropp.current?.querySelector<HTMLElement>('input:not([type=checkbox]), textarea, select')
      forsta?.focus({ preventScroll: true })
    }, 30)
    return () => window.clearTimeout(t)
    // Bara när bladet byts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyckel])

  const fallt = !a.dator && a.fallt
  return (
    <section ref={ref} className={s.blad} aria-labelledby={`${id}-r`} data-bygg-blad data-fallt={fallt ? '' : undefined}>
      <div className={s.bladHu}>
        {a.dator ? null : (
          <button
            type="button"
            onClick={() => a.setFallt(!a.fallt)}
            aria-expanded={!fallt}
            aria-label={fallt ? ARBETE.visaBladet : ARBETE.fallIhop}
            className="absolute inset-0 z-[1] cursor-pointer rounded-t-[26px] border-0 bg-transparent"
          >
            <span aria-hidden className={s.handtag} />
          </button>
        )}
        <h2 id={`${id}-r`}>{rubrik}</h2>
        {a.dator ? under ? <span>{under}</span> : null : underMobil ?? under ? <span>{underMobil ?? under}</span> : null}
      </div>
      <div ref={kropp} className={s.bladKropp}>
        {a.dator ? null : a.avsnittsrad}
        {a.ovan}
        {children}
      </div>
      {a.nasta}
      <div className={s.fot}>
        {a.dator ? <p className={s.fotText}>{a.fotText}</p> : null}
        {a.onAvbryt ? (
          <button type="button" className={s.avbryt} onClick={a.onAvbryt}>
            {ARBETE.avbryt}
          </button>
        ) : null}
        {fot}
      </div>
    </section>
  )
}
