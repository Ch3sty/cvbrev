/**
 * Korten på golvet (skissens .radk, .jobb, .brevk och .nytt i Main och
 * Mobil-hem). Samma komponent på dator och telefon; formen byts i CSS.
 *
 * Inga hooks, serverkomponenter. Handlingar kommer in som färdiga element
 * (LitenKnapp, Link), så att korten kan stå i både server- och klientvyer.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { IkonLas, IkonPlus } from './ikoner'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { Tagg } from './delar'

/* ------------------------------------------------------------------ Radkort */

export interface RadkortProps {
  /** Rubriken i fet stil ("Erik Lindberg, projektledare"). */
  rubrik: ReactNode
  /** Överraden i versaler ("CV:t som breven bygger på"). */
  ogon?: string
  /** Raden under rubriken. */
  text?: ReactNode
  /** Raden under rubriken bara på dator (Mobil-hem utelämnar den). */
  textBaraDator?: boolean
  /** Ikonen i den tonade rutan till vänster (dator). */
  ikon?: ReactNode
  /** Knappen till höger (LitenKnapp). På Premiumkortet full bredd på telefonen. */
  handling?: ReactNode
  /**
   * prem: det orange Premiumkortet (bara för gratis). streckad: den
   * streckade raden, som telefonens "Skriv nytt brev".
   */
  variant?: 'vanlig' | 'prem' | 'streckad'
  className?: string
}

export function Radkort({ rubrik, ogon, text, textBaraDator, ikon, handling, variant = 'vanlig', className }: RadkortProps) {
  const cls = ['b3-radk', variant !== 'vanlig' && variant, className].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      {ikon ? (
        <span className={ogon && variant === 'vanlig' ? 'b3-radk-ik hidden xl:flex' : 'b3-radk-ik'} aria-hidden="true">
          {ikon}
        </span>
      ) : null}
      <span className="b3-radk-text">
        {ogon ? <span className="b3-eyebrow block">{ogon}</span> : null}
        <b>{rubrik}</b>
        {text ? <small className={textBaraDator ? 'hidden xl:block' : undefined}>{text}</small> : null}
      </span>
      {handling ? <span className="b3-radk-handling">{handling}</span> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ JobbKort */

export interface JobbKortProps {
  /** Taggen överst ("Ny i natt", "I tisdags"). */
  tagg: string
  /** "Sista dag 6 dec", eller null när annonsen saknar sista dag. */
  sistaDag?: string | null
  titel: string
  foretag: string
  ort?: string | null
  /** "Passar ditt CV: ..." ur matchningens skäl (bara dator). Utelämnas när skäl saknas. */
  skal?: string | null
  /** "Skriv brev" (LitenKnapp). */
  handling: ReactNode
}

/** Ett jobb ur matchningarna: kort i tre spalter på dator, rad på telefonen. Står i JobbRutnat. */
export function JobbKort({ tagg, sistaDag, titel, foretag, ort, skal, handling }: JobbKortProps) {
  const mobilrad = [foretag, sistaDag].filter(Boolean).join('. ')
  return (
    <div className="b3-jobb">
      <span className="b3-jobb-topp">
        <Tagg ton="n">{tagg}</Tagg>
        {sistaDag ? <span className="b3-jobb-dag">{sistaDag}</span> : null}
      </span>
      <span className="b3-jobb-text">
        <Tagg ton="n">{tagg}</Tagg>
        <b>{titel}</b>
        <small className="b3-jobb-ort">{ort ? `${foretag}, ${ort}` : foretag}</small>
        <small className="b3-jobb-mobilrad">{`${mobilrad}.`}</small>
      </span>
      {skal ? <p className="b3-jobb-skal">{skal}</p> : null}
      <span className="b3-jobb-handling">{handling}</span>
    </div>
  )
}

export function JobbRutnat({ children }: { children: ReactNode }) {
  return <div className="b3-jobbrutnat">{children}</div>
}

/* ------------------------------------------------------------------ BrevKort */

export interface BrevKortProps {
  /**
   * vald: brevet väggen handlar om (plommonkant). vanlig. last: äldre brev
   * på gratisnivån, gråat med lås (går att öppna, läsa och kopiera).
   */
  lage: 'vald' | 'vanlig' | 'last'
  /** Brevet. Hela kortet är tryckbart via företagsnamnet. */
  href: string
  foretag: string
  /** Tjänsten ("IT-projektledare till kundplattformen"). */
  roll: string
  /** Kortare tjänst på telefonen ("IT-projektledare"). */
  rollMobil?: string
  /** Statustaggen ("Inte skickat", "Sökt 14 nov", "Låst"). */
  status: ReactNode
  /** Texten till höger om taggen, bara dator ("Skrivet i går", länken "Ingår i Premium"). */
  sidotext?: ReactNode
  /** Brevets miniatyr (BrevMiniatyr från arket, eller en bild). */
  children: ReactNode
}

/** Ett brev i Dina brev. Står i BrevRemsa (svepbar på telefonen, fyra spalter på dator). */
export function BrevKort({ lage, href, foretag, roll, rollMobil, status, sidotext, children }: BrevKortProps) {
  return (
    <article className={lage === 'vanlig' ? 'b3-brevk' : `b3-brevk ${lage}`}>
      <span className="b3-brevk-bild" aria-hidden="true">
        <span>{children}</span>
        {lage === 'last' ? (
          <span className="b3-brevk-las">
            <IkonLas size={26} strokeWidth={2.4} />
          </span>
        ) : null}
      </span>
      <span className="b3-brevk-text">
        <Link href={href} className="b3-brevk-namn b3-strack">
          {foretag}
        </Link>
        {rollMobil ? (
          <>
            <span className="b3-brevk-roll hidden xl:block">{roll}</span>
            <span className="b3-brevk-roll xl:hidden">{rollMobil}</span>
          </>
        ) : (
          <span className="b3-brevk-roll">{roll}</span>
        )}
        <span className="b3-brevk-status">
          {status}
          {sidotext ? <span className="b3-brevk-sido">{sidotext}</span> : null}
        </span>
      </span>
    </article>
  )
}

/** Remsan med breven: svepbar i sidled på telefonen, fyra spalter på dator. */
export function BrevRemsa({ children }: { children: ReactNode }) {
  return <div className="b3-remsa">{children}</div>
}

/* ------------------------------------------------------------------ NyttBrevKort */

export type NyttBrevKvot = { lage: 'kvar' } | { lage: 'slut'; nasta: string } | null

export interface NyttBrevKortProps {
  href: string
  /**
   * Gratisnivåns kvotrad. kvar: "Ditt gratisbrev för veckan är inte använt".
   * slut: "Nästa gratisbrev {nasta}" och taggen "Utan tak i Premium"
   * (nasta som "fredag 27 nov"). null: Premium, ingen kvotrad.
   */
  kvot: NyttBrevKvot
  /** Raden under rubriken (dator). */
  text?: string
}

/** Kortet "Skriv nytt brev": streckat kort sist i remsan på dator, streckad rad under remsan på telefonen. */
export function NyttBrevKort({ href, kvot, text = 'Klistra in annonsen, så skriver vi brevet mot ditt CV.' }: NyttBrevKortProps) {
  const kvotText = kvot?.lage === 'kvar' ? 'Ditt gratisbrev för veckan är inte använt' : kvot?.lage === 'slut' ? `Nästa gratisbrev ${kvot.nasta}` : null
  return (
    <Link href={href} className="b3-nytt">
      <span className="b3-nytt-ik" aria-hidden="true">
        <IkonPlus />
      </span>
      <span className="b3-nytt-text">
        <b className="b3-nytt-rubrik">Skriv nytt brev</b>
        <span className="b3-nytt-under">{text}</span>
        {kvotText ? <span className="b3-nytt-kvot-mobil">{`${kvotText}.`}</span> : null}
      </span>
      {kvotText ? (
        <span className="b3-nytt-kvotrad">
          <span className="b3-nytt-kvot">{kvotText}</span>
          {kvot?.lage === 'slut' ? (
            <Tagg ton="p" las>
              {`Utan tak i ${PAKETRADER.bricka}`}
            </Tagg>
          ) : null}
        </span>
      ) : null}
    </Link>
  )
}
