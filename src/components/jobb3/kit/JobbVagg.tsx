/**
 * Sidramen: väggen med cirkel och kullar, toppraden (flikarna, glasknappen
 * och kontots åtgärder), tillbakalänken och hjälten, plus golvet under.
 *
 * Väggen har en minsta höjd (skissens höjd per skärm) i stället för en fast:
 * blir innehållet högre (längre rubrik, kontots åtgärder på telefon) växer
 * väggen i stället för att klippa. Panelen under lyfts med negativ marginal,
 * så överlappet är detsamma ändå. Allt ritas på servern: inget skiftar.
 *
 * Ersätter dagens RumHuvud på Jobbsökets sidor: väggen bär sidans enda h1
 * (VaggText) och kontots åtgärder (`atgarder`, i vyerna
 * <Topprad bara="atgarder" />), så sidan får ingen rubrik till.
 *
 * Serverkomponent (JobbFlikar är en klientö).
 */

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import JobbFlikar from './JobbFlikar'
import type { JobbFlik } from './flikar'
import { IkonTillbaka } from './ikoner'

export interface JobbVaggProps {
  children?: ReactNode
  /** Minsta höjd på dator i px (skissens .vagg height). 596 i Main. */
  hojd?: number
  /** Minsta höjd på telefon i px. 500 i Mobil-oversikt. */
  hojdMobil?: number
  /** Luft under innehållet, dator. 88 i grunden (panelen lyfts 72). */
  luft?: number
  /** Luft under innehållet, telefon. 40 i grunden. */
  luftMobil?: number
  /** Kullarna längs nederkanten: två (grund), en, eller inga. */
  kullar?: 'tva' | 'en' | 'inga'
  /** Flikarna: 'auto' läser sökvägen, null ritar dem utan aktiv flik, false ritar inga. */
  flik?: JobbFlik | null | 'auto' | false
  /** Väggens handling uppe till höger på dator: en GlasKnapp. */
  handling?: ReactNode
  /** Kontots åtgärder (meddelanden, notiser, profil): <Topprad bara="atgarder" />. */
  atgarder?: ReactNode
  /** Tillbakalänk under flikarna (eller i stället för dem med flik={false}). */
  tillbaka?: { href: string; text: string; ton?: 'mjuk' | 'koppar' }
  /** Handling till höger om tillbakalänken på telefon (t.ex. "Redigera"). */
  handlingMobil?: ReactNode
  /** Landmärkets namn för skärmläsare. */
  etikett?: string
  className?: string
}

function Kullar({ antal }: { antal: 'tva' | 'en' }) {
  return (
    <>
      <svg className="j3-vagg-kullar dator" viewBox="0 0 1440 230" preserveAspectRatio="none">
        <path d="M0 150C220 96 420 176 660 142C900 108 1120 20 1440 34V230H0z" style={{ fill: 'var(--j3-kulle-1)' }} />
        {antal === 'tva' ? <path d="M0 206C260 168 520 214 800 186C1060 160 1260 120 1440 128V230H0z" style={{ fill: 'var(--j3-kulle-2)' }} /> : null}
      </svg>
      <svg className="j3-vagg-kullar mobil" viewBox="0 0 412 120" preserveAspectRatio="none">
        <path d="M0 62C90 30 190 76 290 50C340 38 380 16 412 20V120H0z" style={{ fill: 'var(--j3-kulle-1)' }} />
        {antal === 'tva' ? <path d="M0 100C110 76 220 104 320 84C360 76 390 66 412 68V120H0z" style={{ fill: 'var(--j3-kulle-2)' }} /> : null}
      </svg>
    </>
  )
}

export function JobbVagg({
  children,
  hojd = 596,
  hojdMobil = 440,
  luft,
  luftMobil,
  kullar = 'tva',
  flik = 'auto',
  handling,
  atgarder,
  tillbaka,
  handlingMobil,
  etikett,
  className,
}: JobbVaggProps) {
  const stil = {
    ['--j3-vagg-h' as string]: `${hojd}px`,
    ['--j3-vagg-h-mobil' as string]: `${hojdMobil}px`,
    ...(luft != null ? { ['--j3-vagg-pb' as string]: `${luft}px` } : {}),
    ...(luftMobil != null ? { ['--j3-vagg-pb-mobil' as string]: `${luftMobil}px` } : {}),
  } as CSSProperties
  const visaFlikar = flik !== false
  return (
    <section className={className ? `j3-vagg ${className}` : 'j3-vagg'} style={stil} aria-label={etikett}>
      <div className="j3-vagg-dekor" aria-hidden="true">
        <span className="j3-vagg-cirkel" />
        {kullar !== 'inga' ? <Kullar antal={kullar} /> : null}
      </div>
      <div className="j3-vagg-inre">
        <div className="j3-topp">
          {atgarder ? <div className="j3-topp-atgarder">{atgarder}</div> : null}
          {visaFlikar ? (
            <div className="min-w-0">
              <JobbFlikar aktiv={flik === 'auto' ? undefined : flik} />
            </div>
          ) : tillbaka ? (
            <Tillbaka {...tillbaka} />
          ) : (
            <span />
          )}
          {handling || atgarder ? (
            <div className="j3-topp-hoger">
              {handling}
              {atgarder ? <div className="j3-topp-atgarder">{atgarder}</div> : null}
            </div>
          ) : null}
        </div>
        {tillbaka && visaFlikar ? (
          <div className="j3-tillbaka-rad">
            <Tillbaka {...tillbaka} />
            {handlingMobil ? <span className="j3-mobil-handling">{handlingMobil}</span> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  )
}

/** Tillbakalänken i väggen: pil och text, minst 44 px tryckyta på telefon. */
export function Tillbaka({ href, text, ton = 'mjuk' }: { href: string; text: string; ton?: 'mjuk' | 'koppar' }) {
  return (
    <Link href={href} className={ton === 'koppar' ? 'j3-tillbaka koppar' : 'j3-tillbaka'}>
      <IkonTillbaka size={ton === 'koppar' ? 16 : 18} />
      {text}
    </Link>
  )
}

export interface VaggHeroProps {
  /** Vänsterspalten: VaggText, Knapprad, Chips. */
  children: ReactNode
  /** Väggens bild till höger på dator, mellan text och knapp på telefon. */
  bild?: ReactNode
  /** Vänsterspaltens bredd på dator i px (480 i Main, 340 i Sökta, 470 i Jobb). */
  spalt?: number
  /** Mellanrum mellan spalterna på dator (28 i Main, 40 i de flesta). */
  glapp?: number
  /** Avstånd från toppraden på dator (34 i grunden, 26 efter tillbakalänk). */
  topp?: number
  /** Bildens plats i högerspalten: höger (grund), vänster eller hela bredden. */
  bildPlats?: 'hoger' | 'vanster' | 'bred'
  /** Bildspaltens stil (t.ex. marginTop: -14 som i Main). */
  bildStil?: CSSProperties
}

/**
 * Hjältens rutnät. På telefon står allt i en kolumn: ögonbryn, rubrik och
 * ingress, sedan bilden, sedan primärknappen (Knapprad) och brickorna.
 */
export function VaggHero({ children, bild, spalt, glapp, topp, bildPlats = 'hoger', bildStil }: VaggHeroProps) {
  const stil = {
    ...(spalt != null ? { ['--j3-hero-v' as string]: `${spalt}px` } : {}),
    ...(glapp != null ? { ['--j3-hero-gap' as string]: `${glapp}px` } : {}),
    ...(topp != null ? { ['--j3-hero-mt' as string]: `${topp}px` } : {}),
  } as CSSProperties
  return (
    <div className="j3-hero" style={stil}>
      <div className="j3-hero-text">{children}</div>
      {bild ? (
        <div className={`j3-hero-bild${bildPlats !== 'hoger' ? ` ${bildPlats}` : ''}`} style={bildStil}>
          {bild}
        </div>
      ) : null}
    </div>
  )
}

export interface VaggTextProps {
  /** Ögonbrynet: data, aldrig en kategori ("Lördag 21 nov · vecka 47"). */
  ogon?: ReactNode
  /** Kortare ögonbryn på telefon. */
  ogonMobil?: ReactNode
  /** Till höger om ögonbrynet på telefon (VeckansMal kompakt). */
  ogonHoger?: ReactNode
  rubrik: ReactNode
  rubrikMobil?: ReactNode
  /** 'stor' 46/50 (Main), 'mellan' 42/46 (tjänstens sida). */
  storlek?: 'stor' | 'mellan'
  ingress?: ReactNode
  ingressMobil?: ReactNode
  /** Bredare ingress på dator (600 px i stället för 440). */
  bredIngress?: boolean
}

function Byt({ dator, mobil }: { dator: ReactNode; mobil?: ReactNode }) {
  if (mobil == null) return <>{dator}</>
  return (
    <>
      <span className="hidden xl:inline">{dator}</span>
      <span className="xl:hidden">{mobil}</span>
    </>
  )
}

/** Ögonbryn, sidans h1 och ingressen i väggen. */
export function VaggText({ ogon, ogonMobil, ogonHoger, rubrik, rubrikMobil, storlek = 'stor', ingress, ingressMobil, bredIngress }: VaggTextProps) {
  return (
    <>
      {ogon ? (
        <div className="j3-ogonrad">
          <p className="j3-ogon">
            <Byt dator={ogon} mobil={ogonMobil} />
          </p>
          {ogonHoger}
        </div>
      ) : null}
      <h1 className={storlek === 'mellan' ? 'j3-h1 mellan' : 'j3-h1'}>
        <Byt dator={rubrik} mobil={rubrikMobil} />
      </h1>
      {ingress ? (
        <p className={bredIngress ? 'j3-ingress bred' : 'j3-ingress'}>
          <Byt dator={ingress} mobil={ingressMobil} />
        </p>
      ) : null}
    </>
  )
}

/** Primärknappen med raden bredvid (raden syns bara på dator). */
export function Knapprad({ children, rad }: { children: ReactNode; rad?: ReactNode }) {
  return (
    <div className="j3-knapprad">
      {children}
      {rad ? <span className="j3-sidorad">{rad}</span> : null}
    </div>
  )
}

/** Raden med brickor under hjälten (veckans mål, avslutade). Med dator: bara på dator (telefonen har målet i ögonbrynsraden). */
export function Chips({ children, dator, stapel }: { children: ReactNode; dator?: boolean; stapel?: boolean }) {
  const k = ['j3-chips', dator ? 'dator' : '', stapel ? 'stapel' : ''].filter(Boolean).join(' ')
  return <div className={k}>{children}</div>
}

/** Golvet: sidans ljusa yta under väggen, med 1120 px innehåll på dator. */
export function Golv({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={className ? `j3-golv ${className}` : 'j3-golv'}>
      <div className="j3-golv-inre">{children}</div>
    </main>
  )
}

/**
 * Den fasta foten på telefon, över dörrnavet: "Logga sökt tjänst" och
 * annonsens knappar. Döljs på dator, där glasknappen i väggen gör jobbet.
 * `rader`: annonsens fot i två rader, primärknappen överst i full bredd och
 * de vita knapparna med text under (Jobbsöket omgång 2, byggspecen 3.4).
 */
export function FastFot({ children, rader }: { children: ReactNode; rader?: boolean }) {
  return <div className={rader ? 'j3-fot rader' : 'j3-fot'}>{children}</div>
}
