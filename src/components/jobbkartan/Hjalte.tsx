/**
 * Hjältekartan med tidsreglaget, ritad på servern så att den första bilden finns i HTML-svaret
 * utan JavaScript (LCP, CLS 0). app.ts tar över i webbläsaren: färgar om, animerar, lägger till
 * utrop, annonskort och budbil. Används av /jobbkartan och /embed/jobbkartan.
 */
import type { ReactNode } from 'react'
import { extrem, kon, type JobbkartanData } from '@/lib/jobbkartan/data'
import { fmt, hojdFor, kortLan, kvartalNamn, rita } from '@/lib/jobbkartan/karta'

export function hjalteKarta(D: JobbkartanData) {
  const q = D.kvartal.length - 1
  const hojder: Record<string, number> = {}
  const steg: Record<string, number> = {}
  for (const k of D.lanKoder) {
    const v = kon(D, k, q)
    hojder[k] = hojdFor(v == null ? null : Math.min(1, v / 4))
    steg[k] = v == null ? 0 : Math.min(5, Math.floor(v / 0.8) + 1)
  }
  return rita(D.geo, hojder, { id: 'h', fjall: D.fjall, marg: 28, steg })
}

export function KartScen({ D }: { D: JobbkartanData }) {
  const r = hjalteKarta(D)
  const q = D.kvartal.length - 1
  const ex = extrem(D, q)
  const besk =
    ex.min && ex.max
      ? `Varje län är färgat och upphöjt efter hur många arbetslösa som går på varje ledigt jobb, ${kvartalNamn(D.kvartal[q])}. Kortast kö har ${D.lanNamn[ex.min.kod]} med ${fmt(ex.min.v, 1)}, längst ${D.lanNamn[ex.max.kod]} med ${fmt(ex.max.v, 1)}. Alla län står i tabellen längre ner.`
      : 'Varje län är färgat och upphöjt efter hur många arbetslösa som går på varje ledigt jobb.'
  return (
    <figure className="scen" id="jk-scen">
      <svg
        className="karta"
        id="jk-karta"
        viewBox={r.viewBox}
        role="img"
        aria-label="Karta över Sveriges län färgade efter antal arbetslösa per ledigt jobb"
        aria-describedby="jk-karta-besk"
        dangerouslySetInnerHTML={{
          __html:
            '<defs><filter id="oskarpa" x="-10%" y="-10%" width="120%" height="130%"><feColorMatrix type="matrix" values="0 0 0 0 0.22 0 0 0 0 0.13 0 0 0 0 0.05 0 0 0 0.45 0"/><feGaussianBlur stdDeviation="9"/><feOffset dy="12"/></filter></defs>' +
            r.svg,
        }}
      />
      <div className="moln m1" aria-hidden="true" />
      <div className="moln m2" aria-hidden="true" />
      <div className="moln m3" aria-hidden="true" />
      <div id="jk-annonser" aria-hidden="true" />
      <figcaption className="sr" id="jk-karta-besk">
        {besk}
      </figcaption>
    </figure>
  )
}

export function Tidrad({ D }: { D: JobbkartanData }) {
  const q = D.kvartal.length - 1
  return (
    <div className="hjalte-under">
      <div className="tidrad">
        <button type="button" className="spela" id="jk-spela" aria-label="Spela upp kvartalen" aria-pressed="false">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
        </button>
        <label className="sr" htmlFor="jk-kvartal">
          Kvartal
        </label>
        <input type="range" id="jk-kvartal" min={0} max={q} defaultValue={q} step={1} />
        <output id="jk-kvartal-namn" htmlFor="jk-kvartal">
          {kvartalNamn(D.kvartal[q])}
        </output>
      </div>
      <div className="lanval">
        <label htmlFor="jk-lanval">Markerat län</label>
        <select id="jk-lanval" defaultValue="01">
          {[...D.lanKoder]
            .sort((a, b) => D.lanNamn[a].localeCompare(D.lanNamn[b], 'sv'))
            .map((k) => (
              <option key={k} value={k}>
                {D.lanNamn[k]}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}

/** Riket-talet och dagens platsannonser, i hjältens textkolumn. */
export function HjalteTal({ D }: { D: JobbkartanData }) {
  const q = D.kvartal.length - 1
  return (
    <>
      <div className="tal-rad">
        <div className="tal">
          <span className="tal-v" id="jk-riket-v">
            {fmt(kon(D, '00', q), 1)}
          </span>
          <span className="tal-e" id="jk-riket-e">
            arbetslösa per ledigt jobb i hela landet, {kvartalNamn(D.kvartal[q])}
          </span>
        </div>
        {D.annonser ? (
          <div className="tal">
            <span className="tal-v">{fmt(D.annonser.totalt)}</span>
            <span className="tal-e">platsannonser ute hos Arbetsförmedlingen i dag</span>
          </div>
        ) : null}
      </div>
      <div className="legend" aria-hidden="true">
        <span>Få i kö</span>
        <div className="ramp">
          <i className="k1" />
          <i className="k2" />
          <i className="k3" />
          <i className="k4" />
          <i className="k5" />
        </div>
        <span>Många i kö</span>
      </div>
    </>
  )
}

/** Ikonerna som diagrammen och korten använder, tooltipen och meddelanderaden. */
export function JkTillbehor({ children }: { children?: ReactNode }) {
  return (
    <>
      {children}
      <div className="tips" id="jk-tips" hidden role="status" />
      <div className="toast" id="jk-toast" role="status" aria-live="polite" />
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="jk-i-person" viewBox="0 0 20 30">
          <circle cx="10" cy="5" r="4.2" />
          <path d="M4.5 12.5a3.5 3.5 0 0 1 3.5-3h4a3.5 3.5 0 0 1 3.5 3v8h-2.2v9h-2.6v-9h-1.4v9H6.7v-9H4.5z" />
        </symbol>
        <symbol id="jk-i-jobb" viewBox="0 0 28 24">
          <path d="M10 2.5h8a2 2 0 0 1 2 2V7h-2.5V5h-7v2H8V4.5a2 2 0 0 1 2-2z" />
          <rect x="2" y="7" width="24" height="15" rx="3" />
          <rect x="11.5" y="11.5" width="5" height="3.5" rx="1" fill="var(--panel)" />
        </symbol>
        <symbol id="jk-i-annons" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="3" fill="var(--koppar-mjuk)" stroke="var(--koppar-ink)" strokeWidth="1.6" />
          <path d="M7 9h10M7 12.5h7M7 16h5" stroke="var(--koppar-ink)" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
      </svg>
    </>
  )
}

export const kortNamn = (D: JobbkartanData, k: string) => kortLan(D.lanNamn[k])
