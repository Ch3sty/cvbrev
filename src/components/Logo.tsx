'use client'

import Link from 'next/link'

/**
 * Jobbcoach.ai-logo: J-monogram + ordmark, valfri tagline.
 *
 * Varianter:
 *  - default      = orange/rod-ikon + mork text (ljus bakgrund)
 *  - default-tag  = default + tagline under
 *  - compact      = orange/rod-ikon + mork text utan tagline (default for navbar)
 *  - on-dark      = orange/rod-ikon + vit text (mork bakgrund, footer, dark mode)
 *  - mono-white   = vit-kontur-ikon + vit text (pa orange/rod CTA-band)
 */

type Variant = 'default' | 'default-tag' | 'compact' | 'on-dark' | 'mono-white'

interface LogoProps {
  variant?: Variant
  href?: string
  className?: string
  height?: number
  ariaLabel?: string
}

const TAGLINE = 'Smartare jobbsökning, på svenska'

export default function Logo({
  variant = 'compact',
  href,
  className = '',
  height = 36,
  ariaLabel = 'Jobbcoach.ai',
}: LogoProps) {
  const content = <LogoSvg variant={variant} height={height} className={className} ariaLabel={ariaLabel} />

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center" aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  return content
}

function LogoSvg({
  variant,
  height,
  className,
  ariaLabel,
}: {
  variant: Variant
  height: number
  className: string
  ariaLabel: string
}) {
  const showTagline = variant === 'default-tag'
  const isOnDark = variant === 'on-dark'
  const isMonoWhite = variant === 'mono-white'

  const wordColor = isOnDark || isMonoWhite ? '#FFFFFF' : '#0F172A'
  const aiColor = isOnDark
    ? 'rgba(255,255,255,0.55)'
    : isMonoWhite
    ? 'rgba(255,255,255,0.7)'
    : '#94A3B8'

  if (showTagline) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 64"
        width={height * (360 / 64)}
        height={height}
        role="img"
        aria-label={ariaLabel}
        className={className}
      >
        <defs>
          <linearGradient id="logo-grad-warm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="0.55" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>
        {isMonoWhite ? (
          <rect x="1" y="9" width="46" height="46" rx="11" fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" strokeWidth="2" />
        ) : (
          <rect x="0" y="8" width="48" height="48" rx="12" fill="url(#logo-grad-warm)" />
        )}
        <text
          x="24"
          y="44"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="32"
          fontWeight="900"
          textAnchor="middle"
          fill="#FFFFFF"
        >
          J
        </text>
        <text
          x="62"
          y="36"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="22"
          fontWeight="900"
          fill={wordColor}
          letterSpacing="-0.5"
        >
          Jobbcoach
          <tspan fill={aiColor}>.ai</tspan>
        </text>
        <text
          x="62"
          y="54"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="11"
          fontWeight="600"
          fill={isOnDark || isMonoWhite ? 'rgba(255,255,255,0.7)' : '#64748B'}
          letterSpacing="0.04em"
        >
          {TAGLINE}
        </text>
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 48"
      width={height * (240 / 48)}
      height={height}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad-warm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="0.55" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      {isMonoWhite ? (
        <rect x="1" y="1" width="46" height="46" rx="11" fill="rgba(255,255,255,0.18)" stroke="#FFFFFF" strokeWidth="2" />
      ) : (
        <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#logo-grad-warm)" />
      )}
      <text
        x="24"
        y="36"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="32"
        fontWeight="900"
        textAnchor="middle"
        fill="#FFFFFF"
      >
        J
      </text>
      <text
        x="60"
        y="34"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="26"
        fontWeight="900"
        fill={wordColor}
        letterSpacing="-0.5"
      >
        Jobbcoach
        <tspan fill={aiColor}>.ai</tspan>
      </text>
    </svg>
  )
}
