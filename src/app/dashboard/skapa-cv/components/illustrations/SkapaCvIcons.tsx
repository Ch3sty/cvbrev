/**
 * Custom SVG-illustrationer för Skapa CV-flödet.
 * Stil: orange/röd-DNA, samma DNA som ToolIllustrations.tsx och
 * resten av plattformens nya illustrationer.
 *
 * Innehåller en stor hero-illustration och små per-steg-ikoner
 * som används i progress-baren.
 */

interface IconProps {
  className?: string
}

const Defs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient
      id={`${id}-warm`}
      x1="0"
      y1="0"
      x2="80"
      y2="80"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#F97316" />
      <stop offset="1" stopColor="#DC2626" />
    </linearGradient>
    <linearGradient
      id={`${id}-deep`}
      x1="0"
      y1="0"
      x2="80"
      y2="80"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#DC2626" />
      <stop offset="1" stopColor="#BE185D" />
    </linearGradient>
    <linearGradient
      id={`${id}-soft`}
      x1="0"
      y1="0"
      x2="0"
      y2="80"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#FFEDD5" />
      <stop offset="1" stopColor="#FED7AA" />
    </linearGradient>
  </defs>
)

/**
 * Hero-illustration för Skapa CV-flödet.
 * Ett tomt CV-papper med en pulserande "+"-cirkel som signalerar
 * att vi skapar något nytt.
 */
export function HeroSkapaCvIcon({ className }: IconProps) {
  const id = 'skapa-cv-hero'
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      {/* Bakgrund-blob */}
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />

      {/* CV-papper bakom (lutat lite) */}
      <g transform="translate(8 14) rotate(-5 22 28)">
        <rect
          x="0"
          y="0"
          width="38"
          height="52"
          rx="4"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1"
        />
        <rect
          x="0"
          y="0"
          width="38"
          height="3"
          fill="#FB923C"
          opacity="0.6"
        />
        <line
          x1="6"
          y1="14"
          x2="22"
          y2="14"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="22"
          x2="30"
          y2="22"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="28"
          x2="26"
          y2="28"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* CV-papper fram med innehåll */}
      <g transform="translate(20 16)">
        <rect
          x="0"
          y="0"
          width="42"
          height="54"
          rx="4"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.4"
        />
        {/* Topplist */}
        <rect
          x="0"
          y="0"
          width="42"
          height="3.5"
          fill={`url(#${id}-deep)`}
        />
        {/* Avatar-cirkel */}
        <circle cx="9" cy="13" r="3.5" fill="#FED7AA" />
        {/* Headline */}
        <line
          x1="16"
          y1="11"
          x2="32"
          y2="11"
          stroke="#1E293B"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="14.5"
          x2="26"
          y2="14.5"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Sektions-strecks-grupper */}
        <rect
          x="6"
          y="22"
          width="20"
          height="2"
          rx="1"
          fill={`url(#${id}-warm)`}
          opacity="0.85"
        />
        <line
          x1="6"
          y1="28"
          x2="34"
          y2="28"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="32"
          x2="30"
          y2="32"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <rect
          x="6"
          y="38"
          width="14"
          height="2"
          rx="1"
          fill="#FB923C"
          opacity="0.6"
        />
        <line
          x1="6"
          y1="44"
          x2="32"
          y2="44"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="48"
          x2="28"
          y2="48"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* "+"-cirkel uppe i hörnet — signalerar "skapa nytt" */}
      <g transform="translate(62 14)">
        <circle
          cx="0"
          cy="0"
          r="9"
          fill={`url(#${id}-warm)`}
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M 0 -4 L 0 4 M -4 0 L 4 0"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
      {/* Glow runt + */}
      <circle cx="62" cy="14" r="13" fill="#F97316" opacity="0.18" />
    </svg>
  )
}

/**
 * Per-steg-ikoner för progress-baren.
 * Alla 24×24, orange/röd-stil.
 */
export function StepKontaktIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 5 19 Q 5 14 12 14 Q 19 14 19 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function StepOmDigIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="8"
        y1="9"
        x2="16"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="13"
        x2="14"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="17"
        x2="15"
        y2="17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StepErfarenhetIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 9 7 V 5 Q 9 4 10 4 H 14 Q 15 4 15 5 V 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="3"
        y1="13"
        x2="21"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StepUtbildningIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 2 9 L 12 4 L 22 9 L 12 14 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 6 11 V 17 Q 12 20 18 17 V 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function StepKompetenserIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 12 2 L 14 8 L 20 8 L 15 12 L 17 18 L 12 14 L 7 18 L 9 12 L 4 8 L 10 8 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function StepSprakIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 3 12 H 21 M 12 3 Q 7 8 7 12 Q 7 16 12 21 M 12 3 Q 17 8 17 12 Q 17 16 12 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export function StepGranskaIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 2 12 Q 6 5 12 5 Q 18 5 22 12 Q 18 19 12 19 Q 6 19 2 12 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
