/**
 * Delar som står i väggen: tjänstens huvud med den stora brickan,
 * glasrutorna (Ditt CV, Så söker vi åt dig), väggens tal, stegen som fack
 * (Sökta tjänster), statistikens brickgrupper och strömbrytaren.
 *
 * Serverkomponenter; onClick fungerar när de används i en klientvy.
 */

import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'
import { StorBricka, VaggBricka, type VaggBrickTon } from './delar'
import { IkonChevron } from './ikoner'

/** Tjänstens huvud i väggen: stora brickan, ögonbrynet, tjänsten (sidans h1) och arbetsgivaren. */
export function TjanstHuvud({ kod, tyst, ogon, titel, arbetsgivare }: { kod: string; tyst?: boolean; ogon?: string; titel: string; arbetsgivare?: string }) {
  return (
    <div className="j3-tjanst-huvud">
      <StorBricka kod={kod} tyst={tyst} />
      <div>
        {ogon ? <p className="j3-ogon">{ogon}</p> : null}
        <h1 className="j3-h1 mellan">{titel}</h1>
        {arbetsgivare ? <p className="j3-under-vagg">{arbetsgivare}</p> : null}
      </div>
    </div>
  )
}

/** Glasrutan i väggen med rubrik och en eller två länkar till höger ("Byt CV", "Rätta"). */
export function VaggRuta({ rubrik, lankar, children }: { rubrik: string; lankar?: ReactNode; children: ReactNode }) {
  return (
    <section className="j3-ruta" aria-label={rubrik}>
      <div className="j3-ruta-huvud">
        <h2>{rubrik}</h2>
        {lankar ? <span className="j3-ruta-lankar">{lankar}</span> : null}
      </div>
      {children}
    </section>
  )
}

/** Rutan som en länkrad på telefon ("Elin Sundberg, ekonomi.pdf  ...  Byt CV"). */
export function RutaRad({ rubrik, text, handling, href, onClick }: { rubrik: string; text?: string; handling: string; href?: string; onClick?: MouseEventHandler<HTMLElement> }) {
  const inner = (
    <>
      <span>
        <b>{rubrik}</b>
        {text ? <small>{text}</small> : null}
      </span>
      <em>{handling}</em>
    </>
  )
  if (href) {
    return (
      <Link href={href} className="j3-ruta-rad" onClick={onClick}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" className="j3-ruta-rad" onClick={onClick}>
      {inner}
    </button>
  )
}

/** Ett tal med etikett i väggen ("3 roller", "14 kompetenser"). */
export function VaggTal({ tal, etikett }: { tal: ReactNode; etikett: string }) {
  return (
    <span className="j3-vtal">
      <b>{tal}</b>
      {etikett}
    </span>
  )
}

/** Det stora talet i väggen ("23 dagar kvar till sista inlämningsdag"). */
export function StortTal({ tal, rad, stark }: { tal: ReactNode; rad: string; stark?: string }) {
  return (
    <p className="j3-stortal">
      <b>{tal}</b>
      <span>
        {rad}
        {stark ? <strong>{stark}</strong> : null}
      </span>
    </p>
  )
}

export interface Fack {
  namn: string
  antal: number
  /** Raden under talet på dator ("Närmast: torsdag"). */
  under?: string
  /** Brickorna på dator (högst fyra visas). */
  brickor?: { kod: string; ton?: VaggBrickTon; tagg?: string; href?: string; etikett?: string }[]
  /** Målet: streckad kopparram och flaggan när antalet är noll. */
  mal?: boolean
}

/**
 * Stegen som fack i väggen (Sökta tjänster): Ska sökas, Sökt, Intervju,
 * Erbjudande, med antal och brickor. Telefon: små rutor i stället för
 * brickor. Pilarna mellan facken står bara på dator.
 */
export function StegFack({ fack, etikett }: { fack: Fack[]; etikett: string }) {
  return (
    <div className="j3-fackrad" role="group" aria-label={etikett}>
      {fack.map((f, i) => (
        <div key={f.namn} className={['j3-fack', f.mal ? 'mal' : '', f.antal === 0 ? 'noll' : ''].filter(Boolean).join(' ')}>
          <span className="j3-fack-namn">{f.namn}</span>
          <span className="j3-fack-antal">{f.antal}</span>
          {f.under ? <span className="j3-fack-under">{f.under}</span> : null}
          {f.mal && f.antal === 0 ? (
            <svg className="j3-fack-flagga" viewBox="0 0 64 72" width="22" height="26" aria-hidden="true">
              <path d="M14 68V8" stroke="var(--vagg-ink)" strokeWidth="6" strokeLinecap="round" />
              <path d="M16 9h38l-10 13 10 13H16z" fill="var(--koppar)" />
            </svg>
          ) : (
            <>
              <span className="j3-fack-brickor">
                {(f.brickor ?? []).slice(0, 4).map((b, j) => (
                  <VaggBricka key={`${b.kod}-${j}`} kod={b.kod} ton={b.ton} tagg={b.tagg} href={b.href} etikett={b.etikett} />
                ))}
              </span>
              <span className="j3-fack-sma" aria-hidden="true">
                {(f.brickor ?? []).slice(0, 8).map((b, j) => (
                  <i key={j} className={b.ton === 'tyst' ? 'tyst' : b.ton === 'tom' ? 'tom' : undefined} />
                ))}
              </span>
            </>
          )}
          {i < fack.length - 1 ? (
            <span className="j3-fack-pil" aria-hidden="true">
              <IkonChevron size={20} />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** En grupp brickor i väggen med rad under (Statistik: "2 i intervju"). */
export function VaggBrickLag({ brickor, rubrik, text }: { brickor: { kod: string; ton?: VaggBrickTon }[]; rubrik: string; text?: string }) {
  return (
    <div className="j3-vb-lag">
      <div aria-hidden="true">
        {brickor.map((b, i) => (
          <VaggBricka key={`${b.kod}-${i}`} kod={b.kod} ton={b.ton} stor />
        ))}
      </div>
      <span>
        <b>{rubrik}</b>
        {text ? <small>{text}</small> : null}
      </span>
    </div>
  )
}

/** Strömbrytaren i väggen (Bli upptäckt: sökbar eller inte). role="switch". */
export function Strombrytare({ pa, rubrik, text, onClick, disabled }: { pa: boolean; rubrik: string; text?: string; onClick?: MouseEventHandler<HTMLButtonElement>; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={pa} className="j3-bryt" onClick={onClick} disabled={disabled}>
      <span className="j3-bryt-sp" aria-hidden="true" />
      <span>
        <b>{rubrik}</b>
        {text ? <small>{text}</small> : null}
      </span>
    </button>
  )
}
