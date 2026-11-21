/**
 * Brevrummets ikoner, ritade som i skissen (24-rutnät, rundade ändar).
 * Alla är dekor (aria-hidden); det som ska läsas står i texten bredvid.
 * Ingen Sparkles någonstans.
 */

type P = { size?: number; className?: string; strokeWidth?: number }

const bas = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true as const,
  className,
})

export function IkonBock({ size = 16, className, strokeWidth = 3.4 }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12.5l5 5L20 6.5" />
    </svg>
  )
}

export function IkonLas({ size = 12, className, strokeWidth = 2.6 }: P) {
  return (
    <svg {...bas(size, className)}>
      <path d="M7.5 10.5V8a4.5 4.5 0 019 0v2.5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor" />
    </svg>
  )
}

export function IkonPil({ size = 20, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IkonTillbaka({ size = 22, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function IkonFram({ size = 18, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function IkonPlus({ size = 26, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IkonStang({ size = 22, className, strokeWidth = 1.9 }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IkonKopiera({ size = 17, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2.5" />
      <path d="M16 8V6.5A2.5 2.5 0 0013.5 4h-7A2.5 2.5 0 004 6.5v7A2.5 2.5 0 006.5 16H8" />
    </svg>
  )
}

export function IkonLaddaNer({ size = 19, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
    </svg>
  )
}

export function IkonFlagga({ size = 18, className }: P) {
  return (
    <svg {...bas(size, className)}>
      <path d="M6 21V3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M7.5 4h12l-3.5 4.5L19.5 13h-12z" fill="currentColor" />
    </svg>
  )
}

export function IkonKlocka({ size = 20, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  )
}

export function IkonPortfolj({ size = 20, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" />
    </svg>
  )
}

export function IkonDokument({ size = 24, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  )
}

export function IkonPenna({ size = 18, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l1.5-5.5L16.5 3.5l4 4L9.5 18.5z" />
    </svg>
  )
}

export function IkonKuvert({ size = 18, className }: P) {
  return (
    <svg {...bas(size, className)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="M4 7.5l8 6 8-6" />
    </svg>
  )
}
