/**
 * Golvets ram: den lyfta panelen med rubrikrad, avsnittens rubriker,
 * gruppernas rubriker med antal, kortet och spalterna.
 *
 * Serverkomponenter.
 */

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { Antal } from './delar'

export interface LyftPanelProps {
  children: ReactNode
  /** Landmärkets namn eller id på rubriken (aria-labelledby). */
  etikett?: string
  rubrikId?: string
  /** Utan inre luft (delade paneler, listor kant i kant). */
  tat?: boolean
  /** Två spalter på dator med en linje emellan (Matchade jobb 432, Meddelanden 388). */
  delad?: number
  /** Hur mycket panelen lyfts upp i väggen på telefon (30 i grunden, 28 i Sökta, 44 i annonsen). */
  lyftMobil?: number
  /** Inget lyft: panelen står på golvet. */
  ejLyft?: boolean
  /** Panelens luft på dator, om den skiljer sig från 22/28/28 (t.ex. "20px 28px 30px"). */
  luft?: string
  className?: string
}

/** Den lyfta vita panelen, först på golvet direkt under väggen. */
export function LyftPanel({ children, etikett, rubrikId, tat, delad, lyftMobil, ejLyft, luft, className }: LyftPanelProps) {
  const k = ['j3-panel', tat || delad ? 'tat' : '', delad ? 'delad' : '', ejLyft ? 'ej-lyft' : '', luft ? 'j3-panel-luft' : '', className ?? ''].filter(Boolean).join(' ')
  const stil = {
    ...(delad ? { ['--j3-delad' as string]: `${delad}px` } : {}),
    ...(lyftMobil != null ? { ['--j3-lyft-mobil' as string]: `${lyftMobil}px` } : {}),
  } as CSSProperties
  return (
    <section className={k} style={luft ? { ...stil, ['--j3-panel-luft' as string]: luft } : stil} aria-label={rubrikId ? undefined : etikett} aria-labelledby={rubrikId}>
      {children}
    </section>
  )
}

export interface PanelHuvudProps {
  /** Ögonbrynet i koppar ("Att göra nu", "Nästa steg"). */
  ogon?: string
  /** Bredvid ögonbrynet: en Tagg (Ny, Exempel). */
  ogonTagg?: ReactNode
  rubrik: ReactNode
  rubrikMobil?: ReactNode
  rubrikId?: string
  /** 'stor' 26/32 på dator (Nästa steg), annars 24/30. */
  stor?: boolean
  /** Raden under rubriken. */
  under?: ReactNode
  /** Till höger på dator: en förklarande rad, en länk eller primärknappen. */
  hoger?: ReactNode
  /** Visa högerdelen också på telefon (under rubriken). */
  hogerAlltid?: boolean
  /** Centrera höger mot rubriken i stället för mot nederkanten. */
  mitt?: boolean
}

/** Panelens rubrikrad. Rubriken är en h2. */
export function PanelHuvud({ ogon, ogonTagg, rubrik, rubrikMobil, rubrikId, stor, under, hoger, hogerAlltid, mitt }: PanelHuvudProps) {
  return (
    <div className={mitt ? 'j3-panel-huvud mitt' : 'j3-panel-huvud'}>
      <div className="j3-panel-huvud-text">
        {ogon ? (
          <div className="j3-ogonrad-golv">
            <p className="j3-ogon-golv">{ogon}</p>
            {ogonTagg}
          </div>
        ) : null}
        <h2 id={rubrikId} className={stor ? 'j3-h2 stor' : 'j3-h2'}>
          {rubrikMobil ? (
            <>
              <span className="hidden xl:inline">{rubrik}</span>
              <span className="xl:hidden">{rubrikMobil}</span>
            </>
          ) : (
            rubrik
          )}
        </h2>
        {under ? <p className="j3-under">{under}</p> : null}
      </div>
      {hoger ? <div className={hogerAlltid ? 'j3-panel-huvud-hoger alltid' : 'j3-panel-huvud-hoger'}>{hoger}</div> : null}
    </div>
  )
}

export interface SektionsHuvudProps {
  rubrik: ReactNode
  rubrikId?: string
  /** Raden under (på dator; `underAlltid` visar den också på telefon). */
  under?: ReactNode
  underAlltid?: boolean
  /** Länken till höger ("Alla 25 träffar"); `lankMobil` är den korta texten ("Alla 25"). */
  lank?: { href: string; text: string; textMobil?: string }
  /** Annat till höger i stället för länken (växeln Vecka, Månad). */
  hoger?: ReactNode
}

/** Rubrikraden för ett avsnitt på golvet. */
export function SektionsHuvud({ rubrik, rubrikId, under, underAlltid, lank, hoger }: SektionsHuvudProps) {
  return (
    <div className="j3-sektion-huvud">
      <div>
        <h2 id={rubrikId} className="j3-h2">
          {rubrik}
        </h2>
        {under ? <p className={underAlltid ? 'j3-under alltid' : 'j3-under'}>{under}</p> : null}
      </div>
      {lank ? (
        <Link href={lank.href} className="j3-lank">
          {lank.textMobil ? (
            <>
              <span className="hidden xl:inline">{lank.text}</span>
              <span className="xl:hidden">{lank.textMobil}</span>
            </>
          ) : (
            lank.text
          )}
        </Link>
      ) : (
        hoger
      )}
    </div>
  )
}

/** En grupps rubrik i en lista: "Följ upp 1  Tyst i minst tolv dagar ...". h2 eller h3. */
export function GruppHuvud({ rubrik, antal, antalTyst, text, tagg, niva = 2, id }: { rubrik: string; antal?: number; antalTyst?: boolean; text?: ReactNode; tagg?: ReactNode; niva?: 2 | 3; id?: string }) {
  const H = niva === 2 ? 'h2' : 'h3'
  return (
    <div className="j3-grupp">
      <H id={id}>{rubrik}</H>
      {antal != null ? <Antal tyst={antalTyst}>{antal}</Antal> : null}
      {tagg}
      {text ? <p>{text}</p> : null}
    </div>
  )
}

export interface KortProps {
  children: ReactNode
  /** 'vit' (grund), 'ton' (tonad yta utan kant), 'streckad', 'tyst' (följ upp), 'kop' (Premium), 'morkt' (väggens färg). */
  ton?: 'vit' | 'ton' | 'streckad' | 'tyst' | 'kop' | 'morkt'
  /** Raderna står kant i kant med en linje emellan. */
  lista?: boolean
  /** Inre luft (16, och 22/24 på dator). */
  luft?: boolean
  as?: 'div' | 'section' | 'article' | 'aside' | 'ul'
  etikett?: string
  className?: string
}

/** Kortet: vitt, kant 2, tjock underkant. */
export function Kort({ children, ton = 'vit', lista, luft, as = 'div', etikett, className }: KortProps) {
  const k = ['j3-kort', ton !== 'vit' ? ton : '', lista ? 'lista' : '', luft ? 'luft' : '', className ?? ''].filter(Boolean).join(' ')
  const T = as
  return (
    <T className={k} aria-label={etikett}>
      {children}
    </T>
  )
}

/** Tonad yta utan kant (kraven i annonsen, Vad som händer sedan). */
export function TonYta({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `j3-tonyta ${className}` : 'j3-tonyta'}>{children}</div>
}

/**
 * Två spalter på dator (huvudspalt och sidospalt), en kolumn på telefon.
 * `sido` är sidospaltens bredd (380 i Main, 400 i tjänsten, 360 i bedömningen).
 */
export function Spalter({ children, sido = 380, topp, tat }: { children: ReactNode; sido?: number; topp?: number; tat?: boolean }) {
  const stil = { ['--j3-sido' as string]: `${sido}px`, ...(topp != null ? { ['--j3-spalt-mt' as string]: `${topp}px` } : {}) } as CSSProperties
  return (
    <div className={tat ? 'j3-spalter tat' : 'j3-spalter'} style={stil}>
      {children}
    </div>
  )
}

/** Ett avsnitt på golvet med rätt avstånd uppåt (30 på telefon, 52 eller `topp` på dator). */
export function Avsnitt({ children, topp, tat, etikett, rubrikId }: { children: ReactNode; topp?: number; tat?: boolean; etikett?: string; rubrikId?: string }) {
  return (
    <section className={tat ? 'j3-avsnitt tat' : 'j3-avsnitt'} style={topp != null ? ({ ['--j3-avsnitt-mt' as string]: `${topp}px` } as CSSProperties) : undefined} aria-label={rubrikId ? undefined : etikett} aria-labelledby={rubrikId}>
      {children}
    </section>
  )
}
