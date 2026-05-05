import Link from 'next/link'

/**
 * Jobbcoach.ai-logo: J-monogram + ordmark, valfri tagline.
 *
 * Varianter:
 *  - default      = orange/röd-ikon + mörk text (ljus bakgrund)
 *  - default-tag  = default + tagline under
 *  - compact      = orange/röd-ikon + mörk text utan tagline (default for navbar)
 *  - on-dark      = orange/röd-ikon + vit text (mörk bakgrund, footer, dark mode)
 *  - mono-white   = vit-kontur-ikon + vit text (på orange/röd CTA-band)
 *
 * Alla varianter renderas som inline SVG så de skalar perfekt och kan stylas
 * via CSS om så behövs. Använd `href` for att gora logon klickbar.
 */

type Variant = 'default' | 'default-tag' | 'compact' | 'on-dark' | 'mono-white'

interface LogoProps {
  variant?: Variant
  href?: string
  className?: string
  /** Höjd i pixlar. Bredden anpassar sig automatiskt. */
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
  const showTagline = variant === 'default-tag'
  const isOnDark = variant === 'on-dark'
  const isMonoWhite = variant === 'mono-white'

  // Färgval per variant
  const wordColor = isOnDark || isMonoWhite ? 'white' : '#0F172A'
  const aiColor = isOnDark
    ? 'rgba(255,255,255,0.55)'
    : isMonoWhite
    ? 'rgba(255,255,255,0.7)'
    : '#94A3B8'
  const taglineColor = '#64748B'

  // ViewBox: 240×48 utan tagline, 360×64 med tagline
  const viewBox = showTagline ? '0 0 360 64' : '0 0 240 48'
  const aspectRatio = showTagline ? 360 / 64 : 240 / 48
  const width = Math.round(height * aspectRatio)

  // Unik ID per render så flera Logo:s i samma DOM inte krockar
  const gradId = `logo-grad-${variant}`

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="0.55" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>

      {/* Ikon-block */}
      {showTagline ? (
        <>
          {isMonoWhite ? (
            <rect
              x="1"
              y="9"
              width="46"
              height="46"
              rx="11"
              fill="rgba(255,255,255,0.18)"
              stroke="white"
              strokeWidth="2"
            />
          ) : (
            <rect
              x="0"
              y="8"
              width="48"
              height="48"
              rx="12"
              fill={`url(#${gradId})`}
            />
          )}
          <text
            x="24"
            y="44"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="32"
            fontWeight="900"
            textAnchor="middle"
            fill="white"
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
            fill={isOnDark || isMonoWhite ? 'rgba(255,255,255,0.7)' : taglineColor}
            letterSpacing="0.04em"
          >
            {TAGLINE}
          </text>
        </>
      ) : (
        <>
          {isMonoWhite ? (
            <rect
              x="1"
              y="1"
              width="46"
              height="46"
              rx="11"
              fill="rgba(255,255,255,0.18)"
              stroke="white"
              strokeWidth="2"
            />
          ) : (
            <rect
              x="0"
              y="0"
              width="48"
              height="48"
              rx="12"
              fill={`url(#${gradId})`}
            />
          )}
          <text
            x="24"
            y="36"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="32"
            fontWeight="900"
            textAnchor="middle"
            fill="white"
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
        </>
      )}
    </svg>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center"
        aria-label={ariaLabel}
      >
        {svg}
      </Link>
    )
  }

  return svg
}
