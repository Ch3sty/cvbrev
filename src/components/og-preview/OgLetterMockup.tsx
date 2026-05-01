/**
 * Stiliserat personligt brev som SVG.
 * Två lager: ett halv-synligt bakom för djup, ett fullt detaljerat fram.
 *
 * Använder bara SVG-element (inga img/CSS-shadow) så koden kan flyttas
 * direkt in i Next.js ImageResponse senare.
 */

export default function OgLetterMockup() {
  // Wrapper-div ger oss kontroll över rotation och plats inom OgFrame.
  return (
    <div
      style={{
        position: 'relative',
        width: 540,
        height: 540,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="540"
        height="540"
        viewBox="0 0 540 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Bakgrunds-brev (halv-synligt, lutad andra hållet) */}
        <g transform="translate(60 80) rotate(-7 200 230)" opacity="0.45">
          <rect
            x="0"
            y="0"
            width="400"
            height="490"
            rx="20"
            fill="white"
            opacity="0.85"
          />
          {/* Gradient-strip topp */}
          <rect x="0" y="0" width="400" height="6" rx="3" fill="#FB923C" />
          {/* Några text-rader för att antyda innehåll */}
          {[
            { y: 50, w: 220 },
            { y: 90, w: 320 },
            { y: 110, w: 280 },
            { y: 160, w: 340 },
            { y: 180, w: 300 },
            { y: 200, w: 320 },
            { y: 250, w: 320 },
            { y: 270, w: 280 },
            { y: 320, w: 200 },
          ].map((row, i) => (
            <rect
              key={i}
              x="40"
              y={row.y}
              width={row.w}
              height="6"
              rx="3"
              fill="#CBD5E1"
            />
          ))}
        </g>

        {/* Huvudbrev (lutad +4 grader för dynamik) */}
        <g transform="translate(80 30) rotate(4 200 250)">
          {/* Skugga */}
          <rect
            x="6"
            y="14"
            width="400"
            height="490"
            rx="20"
            fill="rgba(0,0,0,0.22)"
            filter="blur(4px)"
          />

          {/* Papper */}
          <rect
            x="0"
            y="0"
            width="400"
            height="490"
            rx="20"
            fill="white"
          />

          {/* Gradient-strip topp */}
          <defs>
            <linearGradient id="letter-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FB923C" />
              <stop offset="0.5" stopColor="#DC2626" />
              <stop offset="1" stopColor="#BE185D" />
            </linearGradient>
            <linearGradient id="letter-name" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#F97316" />
              <stop offset="1" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="8" rx="4" fill="url(#letter-strip)" />

          {/* HEADER-block: namn + kontaktinfo */}
          {/* Namn-rad (tjockare, gradient) */}
          <rect x="36" y="44" width="180" height="14" rx="4" fill="url(#letter-name)" />
          {/* Kontaktinfo */}
          <rect x="36" y="68" width="220" height="6" rx="3" fill="#94A3B8" />
          <rect x="36" y="82" width="180" height="6" rx="3" fill="#94A3B8" />

          {/* Datum (höger sida) */}
          <rect x="290" y="44" width="74" height="6" rx="3" fill="#CBD5E1" />
          <rect x="306" y="58" width="58" height="6" rx="3" fill="#CBD5E1" />

          {/* Subjekt-rad (tjockare, mörkare) */}
          <rect x="36" y="118" width="280" height="10" rx="3" fill="#1E293B" />

          {/* Hälsning */}
          <rect x="36" y="148" width="120" height="7" rx="3" fill="#475569" />

          {/* Paragraf 1 (5 rader) */}
          {[178, 192, 206, 220, 234].map((y, i, arr) => {
            const widths = [328, 320, 332, 316, 240];
            return (
              <rect
                key={`p1-${i}`}
                x="36"
                y={y}
                width={widths[i]}
                height="6"
                rx="3"
                fill="#475569"
                opacity={0.8}
              />
            );
          })}

          {/* Paragraf 2 (4 rader) */}
          {[266, 280, 294, 308].map((y, i) => {
            const widths = [332, 318, 330, 200];
            return (
              <rect
                key={`p2-${i}`}
                x="36"
                y={y}
                width={widths[i]}
                height="6"
                rx="3"
                fill="#475569"
                opacity={0.8}
              />
            );
          })}

          {/* Paragraf 3 (3 rader) */}
          {[340, 354, 368].map((y, i) => {
            const widths = [330, 320, 260];
            return (
              <rect
                key={`p3-${i}`}
                x="36"
                y={y}
                width={widths[i]}
                height="6"
                rx="3"
                fill="#475569"
                opacity={0.8}
              />
            );
          })}

          {/* Avslutning */}
          <rect x="36" y="402" width="160" height="6" rx="3" fill="#475569" opacity="0.8" />

          {/* Signatur (handskrift-likt streck med kurvor) */}
          <path
            d="M 36 432 Q 60 420 84 432 T 132 432 Q 156 420 180 432"
            stroke="#1E293B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Namn under signatur */}
          <rect x="36" y="450" width="120" height="6" rx="3" fill="#94A3B8" />
        </g>

        {/* Subtila dekor-prickar runtom mockupen */}
        <circle cx="80" cy="70" r="3" fill="white" opacity="0.55" />
        <circle cx="500" cy="120" r="4" fill="white" opacity="0.5" />
        <circle cx="500" cy="490" r="3" fill="white" opacity="0.45" />
        <circle cx="50" cy="500" r="4" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}
