/**
 * Raderna och korten på golvet: Att göra nu, en sökt tjänst som rad, en
 * rad i Mer i Jobbsöket, det sparade kortet (Ska sökas), träffkortet och
 * träffraden, filterbrickorna och växeln.
 *
 * Hela raden är tryckbar via rubrikens länk (en osynlig yta över raden);
 * en knapp i raden ligger ovanpå och går att trycka för sig.
 * Serverkomponenter; onClick fungerar när de används i en klientvy.
 */

import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'
import { Bricka, FyrstegsBana, Matchring, Tagg, StatusPiller, type BrickTon, type FyrSteg, type Status } from './delar'
import { IkonBock, IkonChevron, IkonLas } from './ikoner'

/* ============================================================== Att göra nu */

export interface GoraKortProps {
  /** 'nu' (den första, väggens färg), 'tyst' (följ upp), 'vanlig'. */
  ton?: 'nu' | 'tyst' | 'vanlig'
  ikon: ReactNode
  /** När: "Tisdag 24 nov 10.00", "Tyst i 15 dagar", "Sista dag torsdag 26 nov". */
  nar: string
  rubrik: string
  /** Kortare rubrik på telefon ("Förbered intervjun"). */
  rubrikMobil?: string
  text: string
  /** Kortare rad på telefon. */
  textMobil?: string
  href: string
  /** Knappens text på dator ("Öppna utkastet"). På telefon är hela raden länken. */
  knapp: string
  onClick?: MouseEventHandler<HTMLElement>
}

/**
 * Ett kort i Att göra nu (BYGGSPEC F2). Dator: kort med ikon, när, rubrik,
 * text och en vit knapp. Telefon: en rad där hela raden är länken, med pil.
 * Sidans primärknapp står i väggen; här är knappen alltid vit.
 */
export function GoraKort({ ton = 'vanlig', ikon, nar, rubrik, rubrikMobil, text, textMobil, href, knapp, onClick }: GoraKortProps) {
  const t = ton === 'vanlig' ? '' : ` ${ton}`
  return (
    <>
      <div className={`j3-gora${t}`}>
        <div className="j3-gora-topp">
          <span className="j3-gora-ik">{ikon}</span>
          <span className="j3-gora-nar">{nar}</span>
        </div>
        <b>{rubrik}</b>
        <p>{text}</p>
        <Link className={ton === 'nu' ? 'j3-liten morkt' : 'j3-liten'} href={href} onClick={onClick}>
          {knapp}
        </Link>
      </div>
      <Link className={`j3-gorarad${t}`} href={href} onClick={onClick}>
        <span className="j3-gora-ik">{ikon}</span>
        <span>
          <span className="j3-gora-nar">{nar}</span>
          <b>{rubrikMobil ?? rubrik}</b>
          <small>{textMobil ?? text}</small>
        </span>
        <IkonChevron className="j3-gorarad-pil" />
      </Link>
    </>
  )
}

/** Listan med högst tre GoraKort: tre i rad på dator, under varandra på telefon. */
export function GoraLista({ children }: { children: ReactNode }) {
  return <div className="j3-goralista">{children}</div>
}

/* ============================================================== en sökt tjänst som rad */

export interface TjanstRadProps {
  bricka: { kod: string; ton?: BrickTon }
  /** Rubriken. Main: "Umeå Energi, Redovisningsekonom"; Sökta: tjänsten. */
  rubrik: string
  /** Rubrik på telefon (Main visar bara arbetsgivaren där). */
  rubrikMobil?: string
  /** Arbetsgivaren på egen rad (Sökta: "Umeå Energi, Umeå"). */
  arbetsgivare?: string
  /** Raden om läget ("Kallad till intervju 13 nov. Intervjun är på tisdag 10.00."). Får innehålla Rutor. */
  text?: ReactNode
  textMobil?: ReactNode
  /** Fyrstegsbanan på dator. */
  steg?: { steg: FyrSteg; tyst?: boolean; avslutad?: boolean }
  /** Statuspillret (under texten på telefon, egen spalt på dator). */
  status?: { status: Status; text?: string; vit?: boolean }
  /** Rubrikens länk: hela raden blir tryckbar. */
  href?: string
  /** En knapp i raden ("Följ upp", "Förbered intervjun", "Uppdatera"). Under texten på telefon. */
  handling?: ReactNode
  /** Visa knappen på telefon (grund: ja). */
  handlingMobil?: boolean
  /** Till höger på telefon i stället för pillret under (t.ex. "Tis 10.00", "11 dagar"). */
  hogerMobil?: ReactNode
  /** 'kompakt' (Main, rubriken i Inter) eller 'stor' (Sökta, rubriken i displaysnittet, 56-bricka). */
  storlek?: 'kompakt' | 'stor'
}

/**
 * En sökt tjänst som rad. Dator: bricka, text, fyrstegsbanan, pillret och
 * eventuellt en knapp. Telefon: bricka, text och pillret under texten (eller
 * `hogerMobil` till höger), knappen på egen rad.
 */
export function TjanstRad({ bricka, rubrik, rubrikMobil, arbetsgivare, text, textMobil, steg, status, href, handling, handlingMobil = true, hogerMobil, storlek = 'kompakt' }: TjanstRadProps) {
  const enkel = !steg && !status
  const k = ['j3-rad', storlek === 'stor' ? 'stor' : '', enkel ? 'enkel' : handling ? 'med-handling' : ''].filter(Boolean).join(' ')
  const titel = rubrikMobil ? (
    <>
      <span className="hidden xl:inline">{rubrik}</span>
      <span className="xl:hidden">{rubrikMobil}</span>
    </>
  ) : (
    rubrik
  )
  return (
    <div className={k}>
      <Bricka kod={bricka.kod} ton={bricka.ton} mobil={storlek === 'stor' ? 48 : 44} dator={storlek === 'stor' ? 56 : 48} />
      <span className="j3-rad-text">
        <b>
          {href ? (
            <Link href={href} className="j3-strack">
              {titel}
            </Link>
          ) : (
            titel
          )}
        </b>
        {arbetsgivare ? <span className="arb">{arbetsgivare}</span> : null}
        {text ? (
          <small>
            {textMobil ? (
              <>
                <span className="hidden xl:inline">{text}</span>
                <span className="xl:hidden">{textMobil}</span>
              </>
            ) : (
              text
            )}
          </small>
        ) : null}
        {status && !hogerMobil ? <StatusPiller status={status.status} vit={status.vit}>{status.text}</StatusPiller> : null}
      </span>
      {hogerMobil ? <span className="j3-rad-hoger xl:hidden">{hogerMobil}</span> : null}
      {enkel ? null : <span className="j3-rad-steg">{steg ? <FyrstegsBana steg={steg.steg} tyst={steg.tyst} avslutad={steg.avslutad} /> : null}</span>}
      {enkel ? null : <span className="j3-rad-pill">{status ? <StatusPiller status={status.status} vit={status.vit}>{status.text}</StatusPiller> : null}</span>}
      {handling ? <span className={handlingMobil ? 'j3-rad-handling' : 'j3-rad-handling hidden xl:flex'}>{handling}</span> : null}
    </div>
  )
}

/* ============================================================== rad med figur */

export interface SidoRadProps {
  /** Ikon i en tonad ruta, eller en Bricka. */
  ikon?: ReactNode
  /** Rutans ton: 'mjuk' (grund), 'test' (Rekryteringstester), 'tyst', 'ton'. */
  ikonTon?: 'mjuk' | 'test' | 'tyst' | 'ton'
  /** En egen figur i stället för ikonrutan (prickar, en bricka). */
  figur?: ReactNode
  rubrik: ReactNode
  text?: ReactNode
  href?: string
  /** Till höger: ett piller, "Öppna", en knapp. */
  hoger?: ReactNode
  /** Vald rad (samtalen i Meddelanden): tonad med kopparlist. */
  vald?: boolean
}

/** Raden i Mer i Jobbsöket, provlistan, samtalen och liknande listor. */
export function SidoRad({ ikon, ikonTon = 'mjuk', figur, rubrik, text, href, hoger, vald }: SidoRadProps) {
  const k = ['j3-sido', href ? 'lank' : '', vald ? 'vald' : ''].filter(Boolean).join(' ')
  return (
    <div className={k} aria-current={vald ? 'true' : undefined}>
      {figur ?? (ikon ? <span className={ikonTon === 'mjuk' ? 'j3-sido-ik' : `j3-sido-ik ${ikonTon}`}>{ikon}</span> : null)}
      <span className="j3-sido-text">
        <b>
          {href ? (
            <Link href={href} className="j3-strack">
              {rubrik}
            </Link>
          ) : (
            rubrik
          )}
        </b>
        {text ? <small>{text}</small> : null}
      </span>
      {hoger ? <span className="j3-sido-hoger">{hoger}</span> : null}
    </div>
  )
}

/* ============================================================== Ska sökas */

export interface SparadKortProps {
  kod: string
  titel: string
  arbetsgivare: string
  /** Matchgraden när den sparades (ögonblicksbild), om den kom från en träff. */
  matchgrad?: number | null
  /** "Sista dag tors 26 nov, 5 dagar kvar". */
  dag?: string
  /** Sista dagen är nära: texten i koppar. */
  snart?: boolean
  /** Sista dagen har passerat: grått kort, "Sökt ändå" och "Ta bort". */
  passerad?: boolean
  /** Primära valet i kortet ("Skriv brev"), en LitenKnapp. */
  handling?: ReactNode
  /** Textlänken bredvid ("Markera som sökt", eller "Ta bort" när passerad). Bara på dator, och på telefon när passerad. */
  lank?: ReactNode
}

/** Det sparade kortet under Ska sökas (BYGGSPEC F3): tom streckad bricka, ringen och sista dag. */
export function SparadKort({ kod, titel, arbetsgivare, matchgrad, dag, snart, passerad, handling, lank }: SparadKortProps) {
  return (
    <article className={passerad ? 'j3-spar passerad' : 'j3-spar'}>
      <div className="j3-spar-topp">
        <Bricka kod={kod} ton="tom" mobil={48} dator={56} />
        <div>
          <h3>{titel}</h3>
          <p className="arb">{arbetsgivare}</p>
        </div>
        {matchgrad != null && !passerad ? <Matchring procent={matchgrad} storlek={52} /> : null}
      </div>
      <div className="j3-spar-fot">
        <span className={snart && !passerad ? 'j3-spar-dag snart' : 'j3-spar-dag'}>{passerad ? 'Sista dag har passerat' : dag}</span>
        <span className="j3-spar-handling">
          {lank}
          {handling}
        </span>
      </div>
    </article>
  )
}

/** Listan med sparade kort: två i rad på dator. */
export function SparadLista({ children }: { children: ReactNode }) {
  return <div className="j3-sparlista">{children}</div>
}

/* ============================================================== träffarna */

export interface TraffKortProps {
  procent: number
  titel: string
  /** "Ålö AB, Umeå". */
  var: string
  ny?: boolean
  /** Skälen (högst två på kortet): "Din roll matchar". */
  skal?: string[]
  /** "Sista dag 26 nov, 5 dagar kvar". */
  dag?: string
  snart?: boolean
  href: string
  /** Knappen på dator ("Skriv brev"). */
  knapp?: { text: string; href: string }
}

/**
 * Träffkortet (Main: "4 nya jobb som passar dig"). Dator: kort med ring 64,
 * skäl och fot med sista dag och knapp. Telefon: en rad med ring 48 i
 * Traffar-kortet; hela raden är länken till annonsen.
 */
export function TraffKort({ procent, titel, var: plats, ny, skal = [], dag, snart, href, knapp }: TraffKortProps) {
  return (
    <article className="j3-traff">
      <div className="j3-traff-topp">
        <Matchring procent={procent} storlek={48} className="liten" />
        <Matchring procent={procent} storlek={64} className="stor" />
        <div>
          <div className="j3-traff-titel">
            <h3>
              <Link href={href} className="j3-strack">
                {titel}
              </Link>
            </h3>
            {ny ? <Tagg>Ny</Tagg> : null}
          </div>
          <p className="var">{plats}</p>
          {dag ? <span className={snart ? 'dag snart' : 'dag'}>{dag}</span> : null}
        </div>
      </div>
      {skal.length ? (
        <div className="j3-traff-skal">
          {skal.slice(0, 2).map((s) => (
            <span key={s} className="j3-skal">
              <IkonBock size={16} bredd={2.2} />
              {s}
            </span>
          ))}
        </div>
      ) : null}
      <div className="j3-traff-fot">
        <span className={snart ? 'dag snart' : 'dag'}>{dag}</span>
        {knapp ? (
          <Link className="j3-liten" href={knapp.href}>
            {knapp.text}
          </Link>
        ) : null}
      </div>
    </article>
  )
}

/** Träffkorten: tre i rad på dator, en lista i ett kort på telefon. */
export function Traffar({ children }: { children: ReactNode }) {
  return <div className="j3-traffar">{children}</div>
}

export interface TraffRadProps {
  procent: number
  /** Öppen träff: titel och arbetsgivare. Utelämnade = dold träff (gratisnivån). */
  titel?: string
  var?: string
  /** Ett skäl på telefon ("Din roll, 6 av 7 kompetenser"). */
  skal?: string
  dag?: string
  snart?: boolean
  ny?: boolean
  href: string
  /** Vald i listan (annonsen står bredvid på dator). */
  vald?: boolean
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

/**
 * Träffraden i Matchade jobb. Öppen: ring, titel, arbetsgivare, sista dag
 * och Ny. Dold: bara ringen, suddiga rader och ett lås (dagens gratisnivå).
 * Vald i adressen (BYGGSPEC F7): aria-current och markerad ram på dator.
 */
export function TraffRad({ procent, titel, var: plats, skal, dag, snart, ny, href, vald, onClick }: TraffRadProps) {
  const dold = !titel
  const k = ['j3-trf', dold ? 'dold' : '', vald ? 'vald' : ''].filter(Boolean).join(' ')
  if (dold) {
    return (
      <Link className={k} href={href} onClick={onClick} aria-current={vald ? 'true' : undefined} aria-label={`Dold träff, matchar ditt CV till ${procent} procent`} scroll={false}>
        <Matchring procent={procent} storlek={52} />
        <span className="j3-trf-sudd" aria-hidden="true">
          <i style={{ width: `${60 + ((procent * 7) % 25)}%` }} />
          <i style={{ width: `${38 + ((procent * 3) % 22)}%` }} />
        </span>
        <span className="j3-trf-las" aria-hidden="true">
          <IkonLas />
        </span>
      </Link>
    )
  }
  return (
    <Link className={k} href={href} onClick={onClick} aria-current={vald ? 'true' : undefined} scroll={false}>
      <Matchring procent={procent} storlek={52} />
      <span className="j3-trf-text">
        <b>
          {titel}
          {ny ? (
            <Tagg liten>
              Ny
            </Tagg>
          ) : null}
        </b>
        <small>{plats}</small>
        {skal ? (
          <span className="j3-trf-skal">
            <IkonBock size={14} bredd={2.4} />
            {skal}
          </span>
        ) : null}
        {dag || ny ? (
          <span className={snart ? 'j3-trf-dag snart' : 'j3-trf-dag'}>
            {dag}
            {ny ? <Tagg liten>Ny</Tagg> : null}
          </span>
        ) : null}
      </span>
    </Link>
  )
}

/** Listan med träffrader. */
export function TraffLista({ children }: { children: ReactNode }) {
  return <div className="j3-trflista">{children}</div>
}

/* ============================================================== filter och växel */

export interface FilterVal {
  id: string
  text: string
  antal?: number
  href?: string
}

/**
 * Filter- eller sorteringsbrickorna. Länkar (adressen bär valet, F8) eller
 * knappar med `onVal`. Rullar i sidled på telefon.
 */
export function FilterRad({ val, valt, onVal, sort, etikett }: { val: FilterVal[]; valt: string; onVal?: (id: string) => void; sort?: boolean; etikett: string }) {
  return (
    <div className="j3-filterrad" role="group" aria-label={etikett}>
      {val.map((v) => {
        const ar = v.id === valt
        const k = sort ? 'j3-fchip sort' : 'j3-fchip'
        const inner = (
          <>
            {v.text}
            {v.antal != null ? <span>{v.antal}</span> : null}
          </>
        )
        if (v.href) {
          return (
            <Link key={v.id} href={v.href} className={k} aria-current={ar ? 'true' : undefined} scroll={false}>
              {inner}
            </Link>
          )
        }
        return (
          <button key={v.id} type="button" className={k} aria-pressed={ar} onClick={onVal ? () => onVal(v.id) : undefined}>
            {inner}
          </button>
        )
      })}
    </div>
  )
}

export interface VaxelVal {
  id: string
  text: ReactNode
  href?: string
}

/**
 * Växeln. 'ljus' (Lista, Statistik, Rapport: vald vit), 'mork' (Jag har
 * sökt, Jag ska söka: vald i väggens färg), 'liten' (Vecka, Månad).
 * Länkar (adressen bär vyn) eller knappar med `onVal`.
 */
export function Vaxel({ val, valt, onVal, variant = 'ljus', etikett }: { val: VaxelVal[]; valt: string; onVal?: (id: string) => void; variant?: 'ljus' | 'mork' | 'liten'; etikett: string }) {
  const k = variant === 'ljus' ? 'j3-vaxel' : `j3-vaxel ${variant}`
  const Ram = val.some((v) => v.href) ? 'nav' : 'div'
  return (
    <Ram className={k} aria-label={etikett} role={Ram === 'div' ? 'group' : undefined}>
      {val.map((v) => {
        const ar = v.id === valt
        if (v.href) {
          return (
            <Link key={v.id} href={v.href} aria-current={ar ? 'page' : undefined} scroll={false}>
              {v.text}
            </Link>
          )
        }
        return (
          <button key={v.id} type="button" aria-pressed={ar} onClick={onVal ? () => onVal(v.id) : undefined}>
            {v.text}
          </button>
        )
      })}
    </Ram>
  )
}
