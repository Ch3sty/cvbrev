/**
 * Custom mini-SVG-illustrationer för ToolsOverview-sektionen på /funktioner.
 *
 * Stil: 80×80 viewBox, orange/röd/magenta-DNA, kompakta scener som visar
 * varje verktyg i action. Designade för att fånga ögat snabbt utan att
 * konkurrera med rubriken — accent-element, inte huvudfokus.
 *
 * Alla illustrationer accepterar `className` för storlek.
 */

interface IllustrationProps {
  className?: string;
}

// Gemensamma defs (gradienter) som återanvänds
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
);

// =============================================================
// 1. PERSONLIGT BREV — brev med pulserande textrader och hjärt-prick
// =============================================================
export function ToolBrevIllustration({ className }: IllustrationProps) {
  const id = 'tool-brev';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      {/* Bakgrunds-blob */}
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Brev (lutat bak) */}
      <g transform="translate(14 18) rotate(-6 24 30)">
        <rect
          x="0"
          y="0"
          width="40"
          height="48"
          rx="4"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1"
        />
        <rect x="0" y="0" width="40" height="3" fill={`url(#${id}-warm)`} />
        <line
          x1="6"
          y1="12"
          x2="22"
          y2="12"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="20"
          x2="32"
          y2="20"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="26"
          x2="28"
          y2="26"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="32"
          x2="34"
          y2="32"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="38"
          x2="24"
          y2="38"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      {/* Brev (förgrund med highlight) */}
      <g transform="translate(22 22) rotate(4 22 28)">
        <rect
          x="0"
          y="0"
          width="40"
          height="48"
          rx="4"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="40" height="3" fill={`url(#${id}-deep)`} />
        <line
          x1="6"
          y1="12"
          x2="20"
          y2="12"
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="6"
          y="18"
          width="28"
          height="3"
          rx="1.5"
          fill={`url(#${id}-warm)`}
          opacity="0.85"
        />
        <line
          x1="6"
          y1="26"
          x2="32"
          y2="26"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="32"
          x2="28"
          y2="32"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      {/* Liten pulserande prick som accent (orange-glow) */}
      <circle cx="64" cy="20" r="3.5" fill={`url(#${id}-warm)`} />
      <circle cx="64" cy="20" r="6" fill="#F97316" opacity="0.2" />
    </svg>
  );
}

// =============================================================
// 2. CV-ANALYS — CV med stigande stapel-graf som överlappar
// =============================================================
export function ToolCvAnalysIllustration({ className }: IllustrationProps) {
  const id = 'tool-cva';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* CV bakom */}
      <g transform="translate(14 14) rotate(-3 22 26)">
        <rect
          x="0"
          y="0"
          width="36"
          height="50"
          rx="4"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1"
        />
        <rect x="0" y="0" width="36" height="3" fill="#FB923C" />
        <circle cx="9" cy="12" r="3.5" fill="#FED7AA" />
        <line
          x1="16"
          y1="11"
          x2="28"
          y2="11"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="14.5"
          x2="24"
          y2="14.5"
          stroke="#CBD5E1"
          strokeWidth="1"
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
          y1="27"
          x2="26"
          y2="27"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="32"
          x2="28"
          y2="32"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="37"
          x2="22"
          y2="37"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      {/* Score-graf framför (kort med staplar) */}
      <g transform="translate(34 34)">
        <rect
          x="0"
          y="0"
          width="38"
          height="32"
          rx="5"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="38" height="2.5" fill={`url(#${id}-warm)`} />
        {/* Staplar — stigande */}
        <rect
          x="6"
          y="20"
          width="4"
          height="6"
          rx="1"
          fill="#FED7AA"
        />
        <rect
          x="13"
          y="16"
          width="4"
          height="10"
          rx="1"
          fill="#FB923C"
        />
        <rect
          x="20"
          y="11"
          width="4"
          height="15"
          rx="1"
          fill="#F97316"
        />
        <rect
          x="27"
          y="7"
          width="4"
          height="19"
          rx="1"
          fill={`url(#${id}-warm)`}
        />
        {/* Pil upp */}
        <path
          d="M 31 7 L 33 5 L 35 7 M 33 5 L 33 11"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      {/* Plus-stjärna ovanför */}
      <g transform="translate(60 14)">
        <circle cx="0" cy="0" r="6" fill={`url(#${id}-deep)`} />
        <path
          d="M 0 -3 L 0 3 M -3 0 L 3 0"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// =============================================================
// 3. SKAPA CV — staplade tomma sektioner med plus-cirkel
// =============================================================
export function ToolSkapaCvIllustration({ className }: IllustrationProps) {
  const id = 'tool-skapa';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Bakre tom rektangel */}
      <rect
        x="14"
        y="16"
        width="50"
        height="14"
        rx="3"
        fill="white"
        stroke="#FED7AA"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      {/* Mellan-rektangel (fylld) */}
      <rect
        x="14"
        y="34"
        width="50"
        height="14"
        rx="3"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.2"
      />
      <rect x="14" y="34" width="3" height="14" fill={`url(#${id}-warm)`} />
      <line
        x1="22"
        y1="38"
        x2="36"
        y2="38"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="43"
        x2="48"
        y2="43"
        stroke="#CBD5E1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Främre tom — markerad som aktiv */}
      <rect
        x="14"
        y="52"
        width="50"
        height="14"
        rx="3"
        fill="white"
        stroke="#FED7AA"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <line
        x1="22"
        y1="59"
        x2="38"
        y2="59"
        stroke="#FED7AA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      {/* Plus-cirkel överst, indikerar "lägg till" */}
      <g transform="translate(60 14)">
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
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// =============================================================
// 4. CV-MALLAR — tre staplade mallar i förskjutet perspektiv
// =============================================================
export function ToolCvMallarIllustration({ className }: IllustrationProps) {
  const id = 'tool-mallar';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Bakersta mall (vänster, lutad) */}
      <g transform="translate(8 18) rotate(-8 16 22)">
        <rect
          x="0"
          y="0"
          width="32"
          height="44"
          rx="3"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1"
        />
        <rect x="0" y="0" width="32" height="2.5" fill="#FB923C" />
        <line
          x1="5"
          y1="10"
          x2="20"
          y2="10"
          stroke="#94A3B8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="18"
          x2="26"
          y2="18"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="24"
          x2="22"
          y2="24"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      {/* Mall mitten (rakt fram) */}
      <g transform="translate(24 17)">
        <rect
          x="2"
          y="3"
          width="32"
          height="44"
          rx="3"
          fill="rgba(0,0,0,0.18)"
        />
        <rect
          x="0"
          y="0"
          width="32"
          height="44"
          rx="3"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="32" height="3" fill={`url(#${id}-deep)`} />
        <circle cx="8" cy="11" r="3" fill="#FED7AA" />
        <line
          x1="14"
          y1="9.5"
          x2="26"
          y2="9.5"
          stroke="#94A3B8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="14"
          y1="13"
          x2="22"
          y2="13"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="22"
          x2="27"
          y2="22"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="28"
          x2="23"
          y2="28"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="34"
          x2="25"
          y2="34"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      {/* Bakre mall (höger, lutad andra hållet) */}
      <g transform="translate(40 18) rotate(8 16 22)">
        <rect
          x="0"
          y="0"
          width="32"
          height="44"
          rx="3"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1"
        />
        <rect x="0" y="0" width="32" height="2.5" fill="#BE185D" />
        <line
          x1="5"
          y1="10"
          x2="20"
          y2="10"
          stroke="#94A3B8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="18"
          x2="26"
          y2="18"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="24"
          x2="22"
          y2="24"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// =============================================================
// 5. JOBBMATCHNING — kompass med riktningsmarkör och prick-träff
// =============================================================
export function ToolJobbmatchningIllustration({
  className,
}: IllustrationProps) {
  const id = 'tool-match';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Yttre cirkel (kompass) */}
      <circle
        cx="40"
        cy="40"
        r="22"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.5"
      />
      {/* Inre ring */}
      <circle
        cx="40"
        cy="40"
        r="16"
        fill="none"
        stroke="#FED7AA"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      {/* Tick-marker uppe/höger/ner/vänster */}
      <line
        x1="40"
        y1="20"
        x2="40"
        y2="24"
        stroke="#94A3B8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="60"
        y1="40"
        x2="56"
        y2="40"
        stroke="#94A3B8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="60"
        x2="40"
        y2="56"
        stroke="#94A3B8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="40"
        x2="24"
        y2="40"
        stroke="#94A3B8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Nålen (gradient) — pekar mot 2 (NE) */}
      <g transform="translate(40 40) rotate(45)">
        <path
          d="M 0 -16 L 4 0 L 0 16 L -4 0 Z"
          fill={`url(#${id}-warm)`}
        />
        <circle cx="0" cy="0" r="3" fill="white" />
        <circle cx="0" cy="0" r="1.5" fill={`url(#${id}-deep)`} />
      </g>
      {/* Träff-prickar (jobbmatchningar runt kompassen) */}
      <circle cx="62" cy="22" r="4" fill={`url(#${id}-deep)`} />
      <circle
        cx="62"
        cy="22"
        r="7"
        fill="#DC2626"
        opacity="0.18"
      />
      <circle cx="18" cy="58" r="3" fill="#FB923C" />
      <circle cx="64" cy="58" r="2.5" fill="#F97316" opacity="0.7" />
    </svg>
  );
}

// =============================================================
// 6. JOBBCOACHEN — chat-bubblor (fråga + svar)
// =============================================================
export function ToolJobbcoachenIllustration({
  className,
}: IllustrationProps) {
  const id = 'tool-coach';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Användarens bubbla — höger, vit */}
      <g transform="translate(36 14)">
        <path
          d="M 4 0 L 30 0 Q 34 0 34 4 L 34 16 Q 34 20 30 20 L 14 20 L 8 25 L 8 20 L 4 20 Q 0 20 0 16 L 0 4 Q 0 0 4 0 Z"
          fill="white"
          stroke="#FED7AA"
          strokeWidth="1.2"
        />
        <line
          x1="6"
          y1="7"
          x2="22"
          y2="7"
          stroke="#94A3B8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="12"
          x2="26"
          y2="12"
          stroke="#CBD5E1"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      {/* Coachens bubbla — vänster, gradient */}
      <g transform="translate(8 38)">
        <path
          d="M 4 0 L 38 0 Q 42 0 42 4 L 42 22 Q 42 26 38 26 L 14 26 L 8 31 L 8 26 L 4 26 Q 0 26 0 22 L 0 4 Q 0 0 4 0 Z"
          fill={`url(#${id}-warm)`}
        />
        <path
          d="M 4 0 L 38 0 Q 42 0 42 4 L 42 5 L 0 5 L 0 4 Q 0 0 4 0 Z"
          fill="white"
          opacity="0.18"
        />
        {/* Coach-ikon i bubblan */}
        <circle cx="9" cy="13" r="4" fill="white" opacity="0.9" />
        <circle cx="9" cy="11" r="1.5" fill={`url(#${id}-deep)`} />
        <path
          d="M 5 16 Q 5 13 9 13 Q 13 13 13 16"
          fill={`url(#${id}-deep)`}
        />
        {/* Text-rader */}
        <line
          x1="18"
          y1="10"
          x2="36"
          y2="10"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.95"
        />
        <line
          x1="18"
          y1="15"
          x2="32"
          y2="15"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <line
          x1="6"
          y1="20"
          x2="36"
          y2="20"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}

// =============================================================
// 7. REKRYTERINGSTESTER — 3×3 mönster-grid med markering
// =============================================================
export function ToolTesterIllustration({ className }: IllustrationProps) {
  const id = 'tool-test';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Yttre kortbakgrund */}
      <rect
        x="14"
        y="14"
        width="52"
        height="52"
        rx="6"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.2"
      />
      {/* 3×3 grid */}
      {/* Rad 1 */}
      <rect
        x="20"
        y="20"
        width="12"
        height="12"
        rx="2"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
      />
      <circle
        cx="40"
        cy="26"
        r="5"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
      />
      <polygon
        points="54,32 60,20 48,20"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Rad 2 */}
      <circle
        cx="26"
        cy="40"
        r="5"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
      />
      <polygon
        points="40,46 46,34 34,34"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect
        x="48"
        y="34"
        width="12"
        height="12"
        rx="2"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
      />
      {/* Rad 3 */}
      <polygon
        points="26,60 32,48 20,48"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect
        x="34"
        y="48"
        width="12"
        height="12"
        rx="2"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
      />
      {/* Sista rutan: orange "?" */}
      <rect
        x="48"
        y="48"
        width="12"
        height="12"
        rx="2"
        fill={`url(#${id}-warm)`}
      />
      <text
        x="54"
        y="58"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontSize="10"
        fontWeight="900"
        fill="white"
      >
        ?
      </text>
      {/* Liten emerald check-prick uppe i hörnet (rätt svar identifierat) */}
      <circle cx="62" cy="18" r="5" fill="#10B981" />
      <path
        d="M 59.5 18 L 61.3 19.7 L 64.5 16.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// =============================================================
// 8. LINKEDIN-OPTIMERING — profil-mockup med stigande score-stapel
// =============================================================
export function ToolLinkedinIllustration({ className }: IllustrationProps) {
  const id = 'tool-li';
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <Defs id={id} />
      <circle cx="40" cy="40" r="34" fill={`url(#${id}-soft)`} opacity="0.7" />
      {/* Profil-card */}
      <rect
        x="14"
        y="18"
        width="52"
        height="44"
        rx="5"
        fill="white"
        stroke="#FB923C"
        strokeWidth="1.2"
      />
      {/* Banner */}
      <rect
        x="14"
        y="18"
        width="52"
        height="14"
        rx="5"
        fill={`url(#${id}-warm)`}
      />
      <rect x="14" y="28" width="52" height="4" fill={`url(#${id}-warm)`} />
      {/* Diagonalt streck-mönster på bannern */}
      <line
        x1="20"
        y1="20"
        x2="14"
        y2="26"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="30"
        y1="20"
        x2="20"
        y2="30"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="40"
        y1="20"
        x2="30"
        y2="30"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="50"
        y1="20"
        x2="40"
        y2="30"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="60"
        y1="20"
        x2="50"
        y2="30"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="66"
        y1="26"
        x2="60"
        y2="30"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Avatar — överlappar bannern */}
      <circle
        cx="26"
        cy="32"
        r="7"
        fill="white"
        stroke="white"
        strokeWidth="2"
      />
      <circle cx="26" cy="32" r="5.5" fill="#FED7AA" />
      <circle cx="26" cy="30.5" r="1.8" fill={`url(#${id}-deep)`} />
      <path
        d="M 22 35.5 Q 22 33 26 33 Q 30 33 30 35.5"
        fill={`url(#${id}-deep)`}
      />
      {/* Headline-text */}
      <line
        x1="36"
        y1="36"
        x2="58"
        y2="36"
        stroke="#1E293B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="40"
        x2="50"
        y2="40"
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Score-staplar i botten */}
      <rect
        x="20"
        y="50"
        width="14"
        height="3"
        rx="1.5"
        fill="#FED7AA"
      />
      <rect
        x="20"
        y="50"
        width="10"
        height="3"
        rx="1.5"
        fill={`url(#${id}-warm)`}
      />
      <rect
        x="38"
        y="50"
        width="14"
        height="3"
        rx="1.5"
        fill="#FED7AA"
      />
      <rect
        x="38"
        y="50"
        width="12"
        height="3"
        rx="1.5"
        fill={`url(#${id}-warm)`}
      />
      <rect
        x="56"
        y="50"
        width="6"
        height="3"
        rx="1.5"
        fill="#FED7AA"
      />
      <rect
        x="56"
        y="50"
        width="5"
        height="3"
        rx="1.5"
        fill={`url(#${id}-deep)`}
      />
      {/* Pil-upp som accent */}
      <g transform="translate(60 14)">
        <circle cx="0" cy="0" r="6" fill={`url(#${id}-deep)`} />
        <path
          d="M 0 3 L 0 -3 M -2.5 -0.5 L 0 -3 L 2.5 -0.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
