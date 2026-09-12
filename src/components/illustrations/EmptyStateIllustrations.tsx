'use client'

/**
 * Illustrationer för tomma tillstånd, viewBox 96, stroke 3, hörnradie 8
 * (docs/plan-inloggat-omdesign.md, avsnitt 3 och 7).
 *
 * En per yta. Följer primitives: konturer i currentColor, fyllningar via
 * --illu-*, max en gradient per illustration och bara på accentelementet,
 * unika id via useIlluId, aldrig hårdkodat vitt, inga bakgrundscirklar.
 *
 * Motiven visar vad ytan gör när den väl har innehåll, inte en tom låda.
 */

import {
  ILLU,
  IlluSvg,
  IlluAccentGradient,
  useIlluId,
  type IlluProps,
} from './primitives'

const SW = ILLU.stroke[96]
const R = ILLU.radius[96]

/** Ansökningar: tre kort i en pipeline, det främre markerat. */
export function IlluTomAnsokningar({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect
        x="8" y="26" width="24" height="44" rx={R}
        fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.45"
      />
      <rect
        x="36" y="18" width="24" height="52" rx={R}
        fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.7"
      />
      <rect
        x="64" y="26" width="24" height="44" rx={R}
        fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} opacity="0.45"
      />
      <path d="M42 34h12M42 44h12" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <circle cx="48" cy="60" r="7" fill={`url(#${id})`} />
      <path d="M44.5 60l2.5 2.5 4.5-4.5" stroke={ILLU.onAccent} strokeWidth={SW * 0.8} />
    </IlluSvg>
  )
}

/** Brev: ark med textrader och ett vikt hörn. */
export function IlluTomBrev({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <path
        d="M22 10h34l18 18v58a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z"
        fill={ILLU.fill} stroke="currentColor" strokeWidth={SW}
      />
      <path d="M56 10v18h18" stroke="currentColor" strokeWidth={SW} />
      <path d="M30 44h36M30 56h36M30 68h20" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <rect x="30" y="76" width="22" height="6" rx="3" fill={`url(#${id})`} />
    </IlluSvg>
  )
}

/** CV: dokument med porträttblock och rader. */
export function IlluTomCv({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect
        x="18" y="8" width="60" height="80" rx={R}
        fill={ILLU.fill} stroke="currentColor" strokeWidth={SW}
      />
      <circle cx="38" cy="30" r="9" fill={`url(#${id})`} />
      <path d="M54 26h16M54 36h16" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <path d="M28 54h40M28 66h40M28 76h24" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
    </IlluSvg>
  )
}

/** Matchning: två överlappande cirklar, snittet är accenten. */
export function IlluTomMatchning({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <circle cx="38" cy="48" r="24" fill={ILLU.soft} stroke="currentColor" strokeWidth={SW} />
      <circle cx="58" cy="48" r="24" fill="none" stroke="currentColor" strokeWidth={SW} />
      <path
        d="M48 27.5a24 24 0 0 1 0 41 24 24 0 0 1 0-41z"
        fill={`url(#${id})`} opacity="0.9"
      />
    </IlluSvg>
  )
}

/** Tester: rutnät där tre rutor är ifyllda och den fjärde streckad. */
export function IlluTomTester({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <rect x="12" y="12" width="32" height="32" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="52" y="12" width="32" height="32" rx={R} fill={ILLU.fill} stroke="currentColor" strokeWidth={SW} />
      <rect x="12" y="52" width="32" height="32" rx={R} fill={`url(#${id})`} />
      <rect
        x="52" y="52" width="32" height="32" rx={R}
        fill="none" stroke="currentColor" strokeWidth={SW}
        strokeDasharray="5 5" opacity="0.5"
      />
      <path d="M22 28h12M62 28h12" stroke="currentColor" strokeWidth={SW} opacity="0.55" />
      <path d="M22 68l5 5 10-10" stroke={ILLU.onAccent} strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Notiser: klocka utan badge, lugn och tyst. */
export function IlluTomNotiser({ size = 96, className, title }: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={96} size={size} className={className} title={title}>
      <IlluAccentGradient id={id} />
      <path
        d="M48 14a22 22 0 0 1 22 22v16l6 10H20l6-10V36a22 22 0 0 1 22-22z"
        fill={ILLU.fill} stroke="currentColor" strokeWidth={SW}
      />
      <path d="M40 62a8 8 0 0 0 16 0" stroke="currentColor" strokeWidth={SW} />
      <rect x="42" y="6" width="12" height="6" rx="3" fill={`url(#${id})`} />
    </IlluSvg>
  )
}
