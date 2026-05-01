/**
 * Stiliserat CV som SVG.
 * Två lager: ett halv-synligt bakom för djup, ett fullt detaljerat fram.
 *
 * Använder bara SVG-element så koden kan flyttas direkt in i
 * Next.js ImageResponse senare.
 */

export default function OgCvMockup() {
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
        <defs>
          <linearGradient id="cv-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="cv-avatar" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="cv-name" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Bakgrunds-CV (halv-synligt, lutad andra hållet) */}
        <g transform="translate(60 80) rotate(7 200 230)" opacity="0.45">
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" opacity="0.85" />
          <rect x="0" y="0" width="400" height="6" rx="3" fill="#FB923C" />
          {/* Avatar-cirkel skuggad */}
          <circle cx="76" cy="76" r="32" fill="#CBD5E1" />
          {/* Name-rader */}
          <rect x="124" y="58" width="180" height="9" rx="3" fill="#94A3B8" />
          <rect x="124" y="78" width="140" height="6" rx="3" fill="#CBD5E1" />
          {/* Sektion-rader */}
          {[150, 200, 250, 300, 350].map((y, i) => (
            <rect
              key={i}
              x="40"
              y={y}
              width={i % 2 === 0 ? 320 : 280}
              height="6"
              rx="3"
              fill="#CBD5E1"
            />
          ))}
        </g>

        {/* Huvud-CV (lutad -4 grader, motsatt brev-mockup) */}
        <g transform="translate(80 30) rotate(-4 200 250)">
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
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" />

          {/* Gradient-strip topp */}
          <rect x="0" y="0" width="400" height="8" rx="4" fill="url(#cv-strip)" />

          {/* HEADER: avatar + namn + titel */}
          <circle cx="76" cy="76" r="32" fill="url(#cv-avatar)" />
          {/* Liten profil-silhuett inuti */}
          <circle cx="76" cy="68" r="9" fill="white" opacity="0.85" />
          <path
            d="M 60 92 Q 60 80 76 80 Q 92 80 92 92 L 92 96 L 60 96 Z"
            fill="white"
            opacity="0.85"
          />

          {/* Namn-rad (gradient text-rad) */}
          <rect x="124" y="58" width="200" height="14" rx="4" fill="url(#cv-name)" />
          {/* Titel-rad */}
          <rect x="124" y="80" width="160" height="7" rx="3" fill="#94A3B8" />
          {/* Kontaktinfo (4 små pillar i rad) */}
          {[124, 174, 218, 268].map((x, i) => {
            const widths = [42, 36, 42, 38];
            return (
              <rect
                key={i}
                x={x}
                y="100"
                width={widths[i]}
                height="6"
                rx="3"
                fill="#CBD5E1"
              />
            );
          })}

          {/* DIVIDER */}
          <line x1="36" y1="138" x2="364" y2="138" stroke="#FED7AA" strokeWidth="1.5" />

          {/* SEKTION 1: Erfarenhet */}
          {/* Sektions-rubrik */}
          <rect x="36" y="158" width="100" height="8" rx="3" fill="#1E293B" />
          {/* Item 1: titel + företag + datum + 2 rader beskrivning */}
          <rect x="36" y="180" width="180" height="7" rx="3" fill="#475569" />
          <rect x="36" y="194" width="120" height="6" rx="3" fill="#94A3B8" />
          <rect x="290" y="194" width="74" height="6" rx="3" fill="#CBD5E1" />
          <rect x="36" y="212" width="318" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="36" y="222" width="280" height="5" rx="2.5" fill="#CBD5E1" />

          {/* Item 2 */}
          <rect x="36" y="246" width="160" height="7" rx="3" fill="#475569" />
          <rect x="36" y="260" width="110" height="6" rx="3" fill="#94A3B8" />
          <rect x="290" y="260" width="74" height="6" rx="3" fill="#CBD5E1" />
          <rect x="36" y="278" width="320" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="36" y="288" width="240" height="5" rx="2.5" fill="#CBD5E1" />

          {/* DIVIDER */}
          <line x1="36" y1="312" x2="364" y2="312" stroke="#FED7AA" strokeWidth="1.5" />

          {/* SEKTION 2: Utbildning */}
          <rect x="36" y="332" width="84" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="354" width="170" height="7" rx="3" fill="#475569" />
          <rect x="36" y="368" width="120" height="6" rx="3" fill="#94A3B8" />
          <rect x="290" y="368" width="74" height="6" rx="3" fill="#CBD5E1" />

          {/* DIVIDER */}
          <line x1="36" y1="396" x2="364" y2="396" stroke="#FED7AA" strokeWidth="1.5" />

          {/* SEKTION 3: Kompetenser (pill-taggar) */}
          <rect x="36" y="416" width="100" height="8" rx="3" fill="#1E293B" />
          {/* Pills */}
          {[
            { x: 36, w: 76 },
            { x: 120, w: 64 },
            { x: 192, w: 88 },
            { x: 288, w: 70 },
          ].map((pill, i) => (
            <rect
              key={i}
              x={pill.x}
              y="436"
              width={pill.w}
              height="22"
              rx="11"
              fill="#FFEDD5"
              stroke="#FED7AA"
              strokeWidth="1"
            />
          ))}
          {/* Pill-texter (bara små rader inom pillarna) */}
          {[
            { x: 50, w: 48 },
            { x: 132, w: 40 },
            { x: 206, w: 60 },
            { x: 300, w: 46 },
          ].map((t, i) => (
            <rect
              key={`t-${i}`}
              x={t.x}
              y="444"
              width={t.w}
              height="6"
              rx="3"
              fill="#C2410C"
              opacity="0.7"
            />
          ))}
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
