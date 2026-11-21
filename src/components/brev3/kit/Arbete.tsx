/**
 * Arbetsläget: Skriv brev och Brevet (skissens Skriv-1440, Brevet-1440,
 * Mobil-skriv och Mobil-brevet). Plommonytan över hela skärmen med cirkeln
 * och kullarna, huvudet överst, och två fält på dator: bladet (560 px, vitt
 * papper med mörkt huvud) till vänster och brevets ark (480 px) till höger.
 * På telefonen står arket överst och bladet kommer upp nerifrån under det.
 *
 *   ArbetsYta     ytan och placeringen (huvud, flikrad, blad, ark)
 *   ArbetsHuvud   pil tillbaka, rubrik, underrad, sparkvittot, mallkapseln, Klar
 *   MallKapsel    den vita kapseln med mallens miniatyr ("Linne  Byt mall")
 *   Avsnittsrad   flikraden över bladet (Kraven, Texten, Ton och språk ...)
 *   Blad          det vita bladet med huvud, innehåll, fot och bottenrad
 *
 * Inga hooks. Handlingar kommer in som href eller färdiga element, så att
 * delarna går att använda från serversidan och från vyernas klientdelar.
 */

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { IkonBock, IkonTillbaka } from './ikoner'

/* ------------------------------------------------------------------ ArbetsYta */

export interface ArbetsYtaProps {
  /** ArbetsHuvud. */
  huvud: ReactNode
  /** Avsnittsrad (Brevet). Över bladet på dator, under huvudet på telefonen. */
  avsnitt?: ReactNode
  /** Blad. */
  blad: ReactNode
  /** Brevets ark (BrevArk från arket), 480 px brett på dator. */
  ark: ReactNode
  /** Raden under arket på dator ("Siffrorna visar var brevet svarar på kraven ..."). */
  arkRad?: ReactNode
  /**
   * Arket på telefonen. stort: i full bredd, avklippt vid 440 px (Brevet).
   * litet: 132 px brett bredvid telefonArkSida (Skriv, medan brevet skrivs).
   */
  telefonArk?: 'stort' | 'litet'
  /** Det som står bredvid det lilla arket på telefonen (skrivbrickan och raden). */
  telefonArkSida?: ReactNode
}

export function ArbetsYta({ huvud, avsnitt, blad, ark, arkRad, telefonArk = 'stort', telefonArkSida }: ArbetsYtaProps) {
  return (
    <div className="b3-yta">
      <div className="b3-yta-dekor" aria-hidden="true">
        <span className="b3-yta-cirkel" />
        <svg className="b3-yta-kullar" viewBox="0 620 1440 280" preserveAspectRatio="none">
          <path d="M0 900V720C260 680 520 760 800 690S1240 590 1440 620V900Z" style={{ fill: 'var(--b3-kulle-1)' }} />
          <path d="M0 900V820C300 790 620 850 900 800S1300 730 1440 750V900Z" style={{ fill: 'var(--b3-kulle-2)' }} />
        </svg>
      </div>
      <div className="b3-yta-inre">
        {huvud}
        <div className="b3-yta-rutnat">
          <div className="b3-yta-vanster">
            {avsnitt ? <div className="b3-yta-avsnitt">{avsnitt}</div> : null}
            <div className="b3-yta-blad">{blad}</div>
          </div>
          <div className="b3-yta-hoger">
            <div className="b3-yta-ark" data-telefon={telefonArk}>
              <div className="b3-yta-arkbild">{ark}</div>
              {telefonArk === 'litet' && telefonArkSida ? <div className="b3-yta-arksida">{telefonArkSida}</div> : null}
            </div>
            {arkRad ? <p className="b3-yta-arkrad">{arkRad}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ ArbetsHuvud */

export type Sparstatus = 'sparat' | 'auto' | 'sparar' | 'fel'

const SPARTEXT: Record<Sparstatus, string> = {
  sparat: 'Sparat',
  auto: 'Sparas av sig självt',
  sparar: 'Sparar',
  fel: 'Kunde inte spara',
}

export interface ArbetsHuvudProps {
  /** Pilen tillbaka (Dina brev). */
  tillbakaHref: string
  tillbakaEtikett?: string
  /** "Ditt brev till Nordanvind Energi", "Nytt brev". */
  rubrik: string
  /** Kortare rubrik på telefonen ("Nordanvind Energi"). */
  rubrikMobil?: string
  /** Raden under ("IT-projektledare till kundplattformen"). */
  underrad?: string
  /** Raden under på telefonen, där sparkvittot inte får plats ("Sparat · 6 av 7 krav"). */
  underradMobil?: string
  /**
   * Sparkvittot på dator. sparat: "Sparat". auto: "Sparas av sig självt"
   * (Skriv). sparar. fel: "Kunde inte spara", aldrig som sparat. null: inget.
   */
  sparstatus?: Sparstatus | null
  /** MallKapsel. */
  mallKapsel?: ReactNode
  /** Knappen "Klar" (dator). Utelämnad: ingen knapp (Skriv). */
  klarHref?: string
  /** Tillfällig bricka efter rubriken, t.ex. "Brevet klart" (?klart=1). */
  bricka?: ReactNode
}

export function ArbetsHuvud({ tillbakaHref, tillbakaEtikett = 'Tillbaka till dina brev', rubrik, rubrikMobil, underrad, underradMobil, sparstatus = null, mallKapsel, klarHref, bricka }: ArbetsHuvudProps) {
  return (
    <header className="b3-huvud">
      <Link href={tillbakaHref} className="b3-kryss" aria-label={tillbakaEtikett}>
        <IkonTillbaka />
      </Link>
      <div className="b3-huvud-titel">
        <b className="b3-disp">
          {rubrikMobil ? (
            <>
              <span className="hidden xl:inline">{rubrik}</span>
              <span className="xl:hidden">{rubrikMobil}</span>
            </>
          ) : (
            rubrik
          )}
        </b>
        {underradMobil ? (
          <span>
            {underrad ? <span className="hidden xl:inline">{underrad}</span> : null}
            <span className="xl:hidden">{underradMobil}</span>
          </span>
        ) : underrad ? (
          <span>{underrad}</span>
        ) : null}
      </div>
      {bricka}
      {sparstatus ? (
        <span className="b3-sparat" role="status" aria-live="polite" data-fel={sparstatus === 'fel' ? '' : undefined}>
          {sparstatus === 'fel' ? null : <IkonBock size={15} strokeWidth={3} className="text-[color:var(--ljus)]" />}
          {SPARTEXT[sparstatus]}
        </span>
      ) : null}
      {mallKapsel}
      {klarHref ? (
        <Link href={klarHref} className="b3-kapsel b3-huvud-klar">
          Klar
        </Link>
      ) : null}
    </header>
  )
}

/* ------------------------------------------------------------------ MallKapsel */

export interface MallKapselProps {
  /** Mallens namn ("Linne"). */
  namn: string
  /** Mallens miniatyr, 18 x 25 (en <img> eller BrevMiniatyr). */
  miniatyr?: ReactNode
  /** Mallväljaren som sida (Mallar). Antingen href eller onClick. */
  href?: string
  /** Mallväljaren som ark (Skriv, Brevet). */
  onClick?: () => void
  /** Visa "Byt mall" efter namnet på dator. */
  visaByt?: boolean
  /** Telefonens text: mallens namn (Skriv) eller "Byt mall" (Brevet). */
  mobil?: 'namn' | 'byt'
}

export function MallKapsel({ namn, miniatyr, href, onClick, visaByt = true, mobil = 'namn' }: MallKapselProps) {
  const innehall = (
    <>
      {miniatyr ? (
        <span className="b3-kapsel-bild" aria-hidden="true">
          {miniatyr}
        </span>
      ) : null}
      <span className={mobil === 'byt' ? 'hidden xl:inline' : undefined}>{namn}</span>
      {mobil === 'byt' ? <span className="xl:hidden">Byt mall</span> : null}
      {visaByt ? <span className="b3-kapsel-byt hidden xl:inline">Byt mall</span> : null}
    </>
  )
  const etikett = `Mallen ${namn}. Byt mall`
  if (href) {
    return (
      <Link href={href} className="b3-kapsel" aria-label={etikett}>
        {innehall}
      </Link>
    )
  }
  return (
    <button type="button" className="b3-kapsel" onClick={onClick} aria-label={etikett}>
      {innehall}
    </button>
  )
}

/* ------------------------------------------------------------------ Avsnittsrad */

export interface Avsnitt {
  id: string
  namn: string
  href: string
}

/** Flikraden över bladet. Riktiga länkar (?flik=), den aktiva bär aria-current. Svepbar på telefonen. */
export function Avsnittsrad({ avsnitt, aktiv, etikett = 'Arbeta med brevet' }: { avsnitt: readonly Avsnitt[]; aktiv: string; etikett?: string }) {
  return (
    <nav className="b3-avsn" aria-label={etikett}>
      {avsnitt.map((a) => (
        <Link key={a.id} href={a.href} scroll={false} replace aria-current={a.id === aktiv ? 'page' : undefined}>
          {a.namn}
        </Link>
      ))}
    </nav>
  )
}

/* ------------------------------------------------------------------ Blad */

export interface BladProps {
  /** Rubriken i bladets huvud ("Kraven i annonsen", "Annonsen och valen"). */
  rubrik: string
  /** Raden till höger i huvudet på dator ("6 av 7 har fått svar i brevet"). */
  sidorad?: ReactNode
  /** Raden till höger på telefonen, i grönt ("6 av 7"). */
  sidoradMobil?: ReactNode
  children: ReactNode
  /** Raden ovanför foten på dator, sist i foten på telefonen ("Läs och kopiera ingår gratis ..."). */
  fotRad?: ReactNode
  /** Foten: knapparna (Kopiera text, Word, Ladda ner PDF) eller kvotraden och Avbryt. */
  fot?: ReactNode
  /** Bottenraden i tonat papper ("Har du skickat ansökan?"). */
  botten?: ReactNode
  /** Bladets höjd på dator i px (752 i Brevet, 780 i Skriv). Utelämnad: efter innehållet. */
  hojd?: number
  id?: string
}

export function Blad({ rubrik, sidorad, sidoradMobil, children, fotRad, fot, botten, hojd, id }: BladProps) {
  const stil = hojd ? ({ ['--b3-blad-h' as string]: `${hojd}px` } as CSSProperties) : undefined
  return (
    <section className="b3-blad" style={stil} aria-labelledby={id ? `${id}-r` : undefined} id={id}>
      <div className="b3-blad-hu">
        <h2 id={id ? `${id}-r` : undefined}>{rubrik}</h2>
        {sidorad ? <span>{sidorad}</span> : null}
      </div>
      <div className="b3-blad-hu-mobil">
        <h2>{rubrik}</h2>
        {sidoradMobil ? <span>{sidoradMobil}</span> : null}
      </div>
      <div className="b3-blad-kropp">{children}</div>
      {fotRad ? <p className="b3-blad-fotrad hidden xl:block">{fotRad}</p> : null}
      {fot ? (
        <div className="b3-blad-fot" data-rad={fotRad ? '' : undefined}>
          {fot}
          {fotRad ? <p className="b3-blad-fotrad xl:hidden">{fotRad}</p> : null}
        </div>
      ) : null}
      {botten ? <div className="b3-blad-botten">{botten}</div> : null}
    </section>
  )
}
