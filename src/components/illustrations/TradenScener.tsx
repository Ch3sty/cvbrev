/**
 * Trådens scener och plattmotiv (docs/design/koncept-2026-09-13.md, avsnitt 7).
 *
 * Tre storlekar med var sin roll:
 *   48  motiv på marginalplattan (MarginPlate). Stroke 2, en fylld accentform.
 *   96  tomt tillstånd och bekräftelse. Stroke 3.
 *   240 hero, bara dashboard A. Stroke 6.
 *
 * Scen-regler: en scen berättar ett ögonblick, högst tre element (bärande,
 * rörligt, accent), det rörliga lutar 4 till 8 grader, accentformen är fylld
 * och liten, aldrig ovanpå text. Konturer i currentColor, fyllning via
 * --illu-fill så mörkt läge inte behöver nya motiv.
 *
 * Inga hooks, ingen 'use client': scenerna renderas på servern och har
 * varken gradient eller clip-path som behöver unika id.
 */

import { ILLU, IlluSvg, type IlluProps } from './primitives'

const SW48 = ILLU.stroke[48]
const SW96 = ILLU.stroke[96]
const SW240 = ILLU.stroke[240]

/* ============================================================ 240 */

/**
 * Arket lyfter ur mappen. Hero i dashboard A: det första CV:t på väg in.
 * Mappens bakstycke (bärande), arket lutat 6 grader (rörligt), uppåtpilen
 * (accent). Ingen mark, ingen horisont.
 */
export function IlluArketLyfter({ size = 240, className, title }: IlluProps) {
  return (
    <IlluSvg box={240} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW240}>
        <path
          d="M28 146V96a12 12 0 0 1 12-12h44l16 16h60a12 12 0 0 1 12 12v14"
          fill={ILLU.fill}
        />
        <g transform="rotate(-6 128 96)">
          <rect x="86" y="30" width="84" height="112" rx="14" fill={ILLU.fill} />
          <path d="M104 62h48M104 84h48M104 106h28" opacity="0.4" />
        </g>
        <path
          d="M22 146h196l-18 70a12 12 0 0 1-12 12H52a12 12 0 0 1-12-12z"
          fill={ILLU.fill}
        />
      </g>
      <circle cx="184" cy="46" r="24" fill={ILLU.accent} />
      <path
        d="M184 34v24M172 46l12-12 12 12"
        stroke={ILLU.onAccent}
        strokeWidth={SW240}
      />
    </IlluSvg>
  )
}

/**
 * CV mot annonser. Hero i jobbmatchningens tomma tillstånd, innan första
 * sökningen: ditt ark till vänster, annonserna till höger, och tråden som
 * går från arket och möter den annons som passar.
 *
 * Bärande är CV-arket, rörligt är den mellersta annonsen som lutar 6 grader
 * och möter tråden, accent är den fyllda punkten där linjen träffar. Ingen
 * mark, ingen horisont, samma hand som IlluArketLyfter.
 */
export function IlluCvMotAnnonser({ size = 240, className, title }: IlluProps) {
  return (
    <IlluSvg box={240} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW240}>
        {/* CV-arket, bärande */}
        <rect x="18" y="44" width="84" height="152" rx="14" fill={ILLU.fill} />
        <path d="M38 78h44M38 104h44M38 130h28" opacity="0.4" />

        {/* Tre annonskort, det mellersta lutat och närmast */}
        <rect x="150" y="30" width="72" height="48" rx="10" fill={ILLU.fill} opacity="0.5" />
        <rect x="150" y="162" width="72" height="48" rx="10" fill={ILLU.fill} opacity="0.5" />
        <g transform="rotate(-6 186 120)">
          <rect x="146" y="94" width="80" height="52" rx="10" fill={ILLU.fill} />
          <path d="M164 114h44M164 130h26" opacity="0.4" />
        </g>
      </g>

      {/* Tråden: från arkets kant till den annons som passar */}
      <path
        d="M102 120h34"
        stroke={ILLU.accent}
        strokeWidth={SW240}
        strokeLinecap="round"
      />
      <circle cx="140" cy="120" r="10" fill={ILLU.accent} />
    </IlluSvg>
  )
}

/* ============================================================ 96 */

/**
 * Öppen mapp som väntar på sitt första ark. Arkets kontur är streckad och
 * lutad ovanför, fliken är accentformen. Tomt tillstånd för ansökningar och
 * andra listor som ännu inte fått innehåll.
 */
export function IlluTomMapp({ size = 96, className, title }: IlluProps) {
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW96}>
        <path d="M14 44V30a6 6 0 0 1 6-6h18l8 8h26a6 6 0 0 1 6 6v6" fill={ILLU.fill} />
        <path d="M10 48h76l-8 30a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill={ILLU.fill} />
        <g transform="rotate(6 66 20)" opacity="0.45">
          <rect x="52" y="2" width="30" height="38" rx="5" strokeDasharray="6 5" fill={ILLU.fill} />
        </g>
      </g>
      <path d="M20 24h18l8 8H20z" fill={ILLU.accent} />
    </IlluSvg>
  )
}

/**
 * Brevet, lätt lutat, med en bock som ritar sig. Bekräftelse efter ett
 * skapat brev eller CV. Bocken har klassen confirm-draw så att
 * Confirmation-panelen kan rita den i 480 ms; utanför panelen står den
 * färdigritad.
 */
export function IlluBrevBekraftat({ size = 96, className, title }: IlluProps) {
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW96} transform="rotate(-5 48 48)">
        <path d="M24 14h36l12 12v56H24z" fill={ILLU.fill} />
        <path d="M60 14v12h12" />
        <path d="M34 42h28M34 54h28M34 66h14" opacity="0.4" />
      </g>
      <circle cx="70" cy="70" r="16" fill="var(--positiv-mjuk)" stroke="var(--positiv)" strokeWidth={SW96} />
      <path
        className="confirm-draw"
        d="M61 70.5l6 6 12-13"
        stroke="var(--positiv)"
        strokeWidth={SW96 + 0.5}
      />
    </IlluSvg>
  )
}

/**
 * Ett ark som lyfts ur en hög: sökningen har inte gett något än. Tomt
 * tillstånd för sök- och matchningsytor.
 */
export function IlluTomSokning({ size = 96, className, title }: IlluProps) {
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW96}>
        <rect x="18" y="26" width="44" height="56" rx="8" fill={ILLU.fill} opacity="0.5" />
        <g transform="rotate(5 52 44)">
          <rect x="30" y="14" width="44" height="56" rx="8" fill={ILLU.fill} />
          <path d="M42 34h20M42 46h20M42 58h10" opacity="0.4" />
        </g>
      </g>
      <circle cx="74" cy="72" r="11" fill={ILLU.accent} />
      <path d="M69 72h10M74 67v10" stroke={ILLU.onAccent} strokeWidth={SW96} />
    </IlluSvg>
  )
}

/* ============================================================ 48, plattmotiv */

/** Uppföljning: kuvert och en fylld klocka. Nästa handling på dashboarden. */
export function IlluPlattaUppfoljning({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <rect x="5" y="13" width="30" height="23" rx="4" fill={ILLU.fill} />
        <path d="M5 17.5 20 27l15-9.5" />
      </g>
      <circle cx="38" cy="13" r="8" fill={ILLU.accent} />
      <path d="M38 9v4.5l3 1.8" stroke={ILLU.onAccent} strokeWidth={1.75} />
    </IlluSvg>
  )
}

/** Presentation: ark med vikt hörn, namnblocket är accentformen. Profilen. */
export function IlluPlattaPresentation({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <path d="M10 6h20l8 8v28H10z" fill={ILLU.fill} />
        <path d="M30 6v8h8" />
        <path d="M15 32h18M15 38h11" opacity="0.5" />
      </g>
      <rect x="15" y="20" width="12" height="6" rx="2" fill={ILLU.accent} />
    </IlluSvg>
  )
}

/** Smart-anpassad ton: en ratt där kilen är accentformen. Tonalitetssteget. */
export function IlluPlattaSmartTon({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <circle cx="24" cy="26" r="15" fill={ILLU.fill} stroke="currentColor" strokeWidth={SW48} />
      <path d="M24 26 32 15A15 15 0 0 1 38.5 23z" fill={ILLU.accent} />
      <path d="M24 26 32 15" stroke="currentColor" strokeWidth={SW48} />
      <circle cx="24" cy="26" r="3" fill="currentColor" />
      <path d="M9 40h30" stroke="currentColor" strokeWidth={SW48} opacity="0.35" />
    </IlluSvg>
  )
}

/** Nedladdning: brevet med nedladdningspil som fylld accentform. Betalväggen. */
export function IlluPlattaNedladdning({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <path d="M11 6h18l7 7v29H11z" fill={ILLU.fill} />
        <path d="M29 6v7h7" />
        <path d="M17 20h13M17 26h13M17 32h7" opacity="0.5" />
      </g>
      <circle cx="38" cy="38" r="8" fill={ILLU.accent} />
      <path d="M38 33.5v8M35 39l3 3 3-3" stroke={ILLU.onAccent} strokeWidth={1.75} />
    </IlluSvg>
  )
}

/** CV med poäng: arket och en fylld cirkel med bock. Analys och CV-ytor. */
export function IlluPlattaCvPoang({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <path d="M10 6h18l8 8v28H10z" fill={ILLU.fill} />
        <path d="M28 6v8h8" />
        <circle cx="18" cy="21" r="3.5" />
        <path d="M26 21h6M16 31h16M16 37h10" opacity="0.5" />
      </g>
      <circle cx="38" cy="38" r="8" fill={ILLU.accent} />
      <path d="M34.5 38.5l2.5 2.5 4.5-5" stroke={ILLU.onAccent} strokeWidth={1.75} />
    </IlluSvg>
  )
}

/** Ansökan: mapp med fylld flik och ett ark på väg ner. Loggade ansökningar. */
export function IlluPlattaAnsokan({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <path d="M6 16a3 3 0 0 1 3-3h9l4 4h14a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill={ILLU.fill} />
        <path d="M6 23h33" />
        <g transform="rotate(6 32 12)" opacity="0.6">
          <rect x="26" y="4" width="12" height="15" rx="2" fill={ILLU.fill} />
        </g>
      </g>
      <path d="M9 13h9l4 4H6.6A3 3 0 0 1 9 13z" fill={ILLU.accent} />
    </IlluSvg>
  )
}

/** Test: rutnät där en ruta är fylld accent. Rekryteringstester. */
export function IlluPlattaTest({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <rect x="7" y="7" width="15" height="15" rx="3" fill={ILLU.fill} />
        <rect x="26" y="7" width="15" height="15" rx="3" fill={ILLU.fill} />
        <rect x="7" y="26" width="15" height="15" rx="3" fill={ILLU.fill} />
        <rect x="26" y="26" width="15" height="15" rx="3" strokeDasharray="3 3" opacity="0.5" />
      </g>
      <rect x="12" y="31" width="5" height="5" rx="1" fill="currentColor" opacity="0.5" />
      <circle cx="33.5" cy="14.5" r="4.5" fill={ILLU.accent} />
    </IlluSvg>
  )
}

/** Premium: krona med fylld bas. Prenumeration och betalväggar utan brev. */
export function IlluPlattaPremium({ size = 48, className, title }: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={SW48}>
        <path d="M8 16l7 8 9-13 9 13 7-8-3 20H11z" fill={ILLU.fill} />
      </g>
      <path d="M11 36h26l-.8 5H11.8z" fill={ILLU.accent} />
    </IlluSvg>
  )
}
