/**
 * Custom SVG-illustrationer för OG-bilder.
 *
 * Alla 540×540 viewbox, inline-style, orange/röd-DNA. Designade för att
 * fungera direkt i Next.js ImageResponse (next/og).
 *
 * Stil: two-layer mockups (en lutad bakgrund + en framför motsatta hållet),
 * matchar OgLetterMockup + OgCvMockup-mönstret från exempel-sidor.
 */

const wrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: 540,
  height: 540,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// =============================================================
// CV-ANALYS — CV med förstoringsglas + checkmarks
// =============================================================
export function OgCvAnalysisIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cva-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="cva-loupe" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Bakgrund-CV (lutad) */}
        <g transform="translate(60 80) rotate(7 200 230)" opacity="0.45">
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" opacity="0.85" />
          <rect x="0" y="0" width="400" height="6" rx="3" fill="#FB923C" />
          <rect x="40" y="40" width="160" height="9" rx="3" fill="#94A3B8" />
          <rect x="40" y="58" width="120" height="6" rx="3" fill="#CBD5E1" />
          {[100, 130, 160, 220, 250, 280, 340, 370].map((y, i) => (
            <rect key={i} x="40" y={y} width={i % 2 === 0 ? 320 : 280} height="5" rx="2.5" fill="#CBD5E1" />
          ))}
        </g>

        {/* Förgrunds-CV med highlights */}
        <g transform="translate(60 30) rotate(-3 200 250)">
          <rect x="6" y="14" width="400" height="490" rx="20" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" />
          <rect x="0" y="0" width="400" height="8" rx="4" fill="url(#cva-strip)" />

          {/* Header med avatar */}
          <circle cx="76" cy="76" r="32" fill="url(#cva-loupe)" />
          <rect x="124" y="58" width="180" height="14" rx="4" fill="#1E293B" />
          <rect x="124" y="80" width="140" height="7" rx="3" fill="#94A3B8" />

          <line x1="36" y1="138" x2="364" y2="138" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Item 1 - GRÖN highlight (godkänt) */}
          <rect x="32" y="156" width="336" height="50" rx="6" fill="#D1FAE5" opacity="0.55" />
          <rect x="36" y="166" width="180" height="7" rx="3" fill="#475569" />
          <rect x="36" y="180" width="280" height="5" rx="2.5" fill="#94A3B8" />
          <rect x="36" y="190" width="260" height="5" rx="2.5" fill="#94A3B8" />
          {/* Checkmark */}
          <circle cx="346" cy="181" r="11" fill="#10B981" />
          <path d="M 341 181 L 345 185 L 351 178" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Item 2 - ORANGE highlight (förbättring) */}
          <rect x="32" y="216" width="336" height="50" rx="6" fill="#FFEDD5" opacity="0.7" />
          <rect x="36" y="226" width="160" height="7" rx="3" fill="#475569" />
          <rect x="36" y="240" width="290" height="5" rx="2.5" fill="#94A3B8" />
          <rect x="36" y="250" width="240" height="5" rx="2.5" fill="#94A3B8" />
          {/* Pil (förbättring) */}
          <circle cx="346" cy="241" r="11" fill="#F97316" />
          <path d="M 346 246 L 346 236 M 342 240 L 346 236 L 350 240" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Item 3 - normal */}
          <rect x="36" y="284" width="170" height="7" rx="3" fill="#475569" />
          <rect x="36" y="298" width="320" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="36" y="308" width="280" height="5" rx="2.5" fill="#CBD5E1" />

          <line x1="36" y1="336" x2="364" y2="336" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Sektion 2 - score-bar */}
          <rect x="36" y="356" width="100" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="378" width="328" height="14" rx="7" fill="#FFEDD5" />
          <rect x="36" y="378" width="276" height="14" rx="7" fill="url(#cva-strip)" />
          <rect x="36" y="404" width="40" height="6" rx="3" fill="#94A3B8" />
          <rect x="316" y="404" width="48" height="6" rx="3" fill="#DC2626" />
        </g>

        {/* Förstoringsglas (extra accent ovan i hörnet) */}
        <g transform="translate(390 50)">
          <circle cx="48" cy="48" r="44" fill="white" opacity="0.95" />
          <circle cx="48" cy="48" r="32" stroke="url(#cva-loupe)" strokeWidth="6" fill="none" />
          <line x1="72" y1="72" x2="92" y2="92" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
          {/* Utropstecken som path */}
          <rect x="44" y="32" width="8" height="20" rx="3" fill="#DC2626" />
          <circle cx="48" cy="60" r="4" fill="#DC2626" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// JOBBMATCHNING — pusselbitar som möts + jobb-card
// =============================================================
export function OgJobbmatchningIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="jm-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="jm-piece1" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="jm-piece2" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>

        {/* Bakgrunds-jobb-card */}
        <g transform="translate(40 40) rotate(-5 220 220)" opacity="0.45">
          <rect x="0" y="0" width="440" height="200" rx="16" fill="white" opacity="0.85" />
          <rect x="0" y="0" width="440" height="6" rx="3" fill="#FB923C" />
          <rect x="20" y="24" width="40" height="40" rx="8" fill="#FED7AA" />
          <rect x="72" y="28" width="180" height="10" rx="3" fill="#94A3B8" />
          <rect x="72" y="46" width="120" height="6" rx="3" fill="#CBD5E1" />
          <rect x="20" y="84" width="400" height="4" rx="2" fill="#CBD5E1" />
          <rect x="20" y="96" width="380" height="4" rx="2" fill="#CBD5E1" />
        </g>

        {/* Förgrund: 2 stora pussel-bitar som möts */}
        <g transform="translate(60 130)">
          {/* Skugga */}
          <ellipse cx="210" cy="290" rx="180" ry="20" fill="rgba(0,0,0,0.18)" filter="blur(8px)" />

          {/* Vänster bit (CV-profil) */}
          <g transform="translate(0 30)">
            <path
              d="M 0 0 L 180 0 L 180 60 Q 180 80 200 80 Q 220 80 220 60 L 220 0 L 240 0 L 240 240 L 0 240 Z"
              fill="white"
              stroke="#FED7AA"
              strokeWidth="2"
            />
            <rect x="0" y="0" width="240" height="6" rx="3" fill="url(#jm-piece1)" />
            <circle cx="60" cy="56" r="20" fill="url(#jm-piece1)" />
            <rect x="92" y="46" width="100" height="8" rx="3" fill="#1E293B" />
            <rect x="92" y="62" width="80" height="6" rx="3" fill="#94A3B8" />
            <rect x="20" y="100" width="200" height="5" rx="2" fill="#CBD5E1" />
            <rect x="20" y="112" width="180" height="5" rx="2" fill="#CBD5E1" />
            <rect x="20" y="124" width="200" height="5" rx="2" fill="#CBD5E1" />
            <rect x="20" y="148" width="60" height="14" rx="7" fill="#FFEDD5" stroke="#FED7AA" />
            <rect x="86" y="148" width="60" height="14" rx="7" fill="#FFEDD5" stroke="#FED7AA" />
            <rect x="152" y="148" width="60" height="14" rx="7" fill="#FFEDD5" stroke="#FED7AA" />
          </g>

          {/* Höger bit (Jobb) */}
          <g transform="translate(180 50)">
            <path
              d="M 60 0 L 240 0 L 240 220 L 60 220 L 60 160 Q 60 140 40 140 Q 20 140 20 160 L 20 220 Q 20 220 20 220 L 0 220 L 0 0 L 20 0 L 20 60 Q 20 80 40 80 Q 60 80 60 60 Z"
              fill="white"
              stroke="#FED7AA"
              strokeWidth="2"
            />
            <rect x="0" y="0" width="240" height="6" rx="3" fill="url(#jm-piece2)" />
            <rect x="80" y="30" width="40" height="40" rx="6" fill="#FED7AA" />
            <rect x="80" y="84" width="140" height="8" rx="3" fill="#1E293B" />
            <rect x="80" y="100" width="100" height="5" rx="2" fill="#94A3B8" />
            <rect x="80" y="120" width="160" height="4" rx="2" fill="#CBD5E1" />
            <rect x="80" y="132" width="140" height="4" rx="2" fill="#CBD5E1" />
            <rect x="80" y="156" width="100" height="20" rx="10" fill="url(#jm-piece2)" />
          </g>

          {/* Fram match-prick i mitten där bitarna möts */}
          <circle cx="220" cy="180" r="14" fill="#FCD34D" stroke="white" strokeWidth="3" />
          <path d="M 214 180 L 219 185 L 226 174" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// JOBBCOACHEN — chat-bubblor
// =============================================================
export function OgJobbcoachenIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="jc-bubble" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Bakgrund-bubbla (användarens fråga) */}
        <g transform="translate(80 80) rotate(-4 140 70)" opacity="0.85">
          <path
            d="M 12 0 L 268 0 Q 280 0 280 12 L 280 100 Q 280 112 268 112 L 60 112 L 36 136 L 36 112 L 12 112 Q 0 112 0 100 L 0 12 Q 0 0 12 0 Z"
            fill="white"
            stroke="#FED7AA"
            strokeWidth="2"
          />
          <rect x="20" y="20" width="200" height="6" rx="3" fill="#1E293B" />
          <rect x="20" y="36" width="240" height="5" rx="2" fill="#94A3B8" />
          <rect x="20" y="50" width="220" height="5" rx="2" fill="#94A3B8" />
          <rect x="20" y="78" width="60" height="20" rx="10" fill="#FFEDD5" />
        </g>

        {/* Stor svarsbubbla (jobbcoachen) */}
        <g transform="translate(80 240) rotate(2 200 110)">
          <ellipse cx="200" cy="240" rx="180" ry="14" fill="rgba(0,0,0,0.18)" filter="blur(6px)" />
          <path
            d="M 0 12 Q 0 0 12 0 L 388 0 Q 400 0 400 12 L 400 200 Q 400 212 388 212 L 80 212 L 56 236 L 56 212 L 12 212 Q 0 212 0 200 Z"
            fill="url(#jc-bubble)"
          />
          <path
            d="M 0 12 Q 0 0 12 0 L 388 0 Q 400 0 400 12 L 400 16 L 0 16 Z"
            fill="#FCD34D"
            opacity="0.8"
          />

          {/* Coach avatar */}
          <circle cx="40" cy="46" r="20" fill="white" opacity="0.95" />
          <circle cx="40" cy="40" r="6" fill="#DC2626" />
          <path d="M 28 56 Q 28 48 40 48 Q 52 48 52 56" fill="#DC2626" />

          <rect x="76" y="32" width="180" height="8" rx="3" fill="white" />
          <rect x="76" y="48" width="120" height="6" rx="3" fill="white" opacity="0.85" />

          {/* Quote-text */}
          <rect x="24" y="84" width="352" height="6" rx="3" fill="white" opacity="0.95" />
          <rect x="24" y="100" width="340" height="6" rx="3" fill="white" opacity="0.95" />
          <rect x="24" y="116" width="280" height="6" rx="3" fill="white" opacity="0.95" />

          {/* Tagg-rad */}
          <rect x="24" y="148" width="80" height="22" rx="11" fill="rgba(255,255,255,0.25)" />
          <rect x="112" y="148" width="80" height="22" rx="11" fill="rgba(255,255,255,0.25)" />
          <rect x="200" y="148" width="80" height="22" rx="11" fill="rgba(255,255,255,0.25)" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// LINKEDIN — profil-mockup i orange
// =============================================================
export function OgLinkedinIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="li-banner" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>

        {/* Bakgrunds-profil */}
        <g transform="translate(60 80) rotate(7 200 230)" opacity="0.45">
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" opacity="0.85" />
          <rect x="0" y="0" width="400" height="100" fill="#FB923C" />
          <circle cx="76" cy="120" r="40" fill="#FED7AA" stroke="white" strokeWidth="6" />
        </g>

        {/* Förgrunds-profil */}
        <g transform="translate(80 30) rotate(-4 200 250)">
          <rect x="6" y="14" width="400" height="490" rx="20" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" />

          {/* Banner */}
          <rect x="0" y="0" width="400" height="120" rx="20" fill="url(#li-banner)" />
          <rect x="0" y="100" width="400" height="20" fill="url(#li-banner)" />

          {/* Avatar */}
          <circle cx="76" cy="140" r="44" fill="white" />
          <circle cx="76" cy="140" r="38" fill="url(#li-banner)" />
          <circle cx="76" cy="130" r="12" fill="white" opacity="0.9" />
          <path d="M 56 154 Q 56 142 76 142 Q 96 142 96 154 L 96 162 L 56 162 Z" fill="white" opacity="0.9" />

          {/* "in"-pill */}
          <rect x="320" y="124" width="58" height="32" rx="8" fill="#0A66C2" />

          {/* Namn + Headline */}
          <rect x="36" y="200" width="200" height="14" rx="4" fill="#1E293B" />
          <rect x="36" y="222" width="280" height="9" rx="3" fill="#475569" />
          <rect x="36" y="238" width="240" height="9" rx="3" fill="#475569" />

          <rect x="36" y="260" width="120" height="6" rx="3" fill="#FB923C" />

          <line x1="36" y1="284" x2="364" y2="284" stroke="#FED7AA" strokeWidth="1.5" />

          {/* About-sektion */}
          <rect x="36" y="304" width="80" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="324" width="328" height="5" rx="2" fill="#CBD5E1" />
          <rect x="36" y="334" width="316" height="5" rx="2" fill="#CBD5E1" />
          <rect x="36" y="344" width="280" height="5" rx="2" fill="#CBD5E1" />

          <line x1="36" y1="372" x2="364" y2="372" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Skills */}
          <rect x="36" y="392" width="60" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="412" width="80" height="22" rx="11" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="124" y="412" width="100" height="22" rx="11" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="232" y="412" width="80" height="22" rx="11" fill="#FFEDD5" stroke="#FED7AA" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// REKRYTERINGSTESTER — matrix-grid + checkboxes
// =============================================================
export function OgRekryteringstesterIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="rt-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="rt-tile" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Bakgrund: kontext-passage med tester */}
        <g transform="translate(60 80) rotate(7 200 230)" opacity="0.45">
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" opacity="0.85" />
          <rect x="0" y="0" width="400" height="6" rx="3" fill="#FB923C" />
          {[40, 70, 100, 130, 160, 200, 230, 260, 290].map((y, i) => (
            <rect key={i} x="40" y={y} width={i % 2 === 0 ? 320 : 280} height="5" rx="2.5" fill="#CBD5E1" />
          ))}
        </g>

        {/* Förgrund: matrix 3x3 grid */}
        <g transform="translate(80 30) rotate(-4 200 250)">
          <rect x="6" y="14" width="400" height="490" rx="20" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" />
          <rect x="0" y="0" width="400" height="8" rx="4" fill="url(#rt-strip)" />

          {/* Header */}
          <rect x="36" y="36" width="160" height="14" rx="4" fill="#1E293B" />
          <rect x="36" y="60" width="120" height="7" rx="3" fill="#94A3B8" />

          {/* Test-meta-rad */}
          <rect x="36" y="86" width="60" height="20" rx="10" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="106" y="86" width="80" height="20" rx="10" fill="#FFEDD5" stroke="#FED7AA" />

          {/* Matrix-grid */}
          <g transform="translate(60 130)">
            {/* Cellbakgrunder */}
            {[0, 1, 2].map(row =>
              [0, 1, 2].map(col => (
                <rect
                  key={`bg-${row}-${col}`}
                  x={col * 96}
                  y={row * 96}
                  width="80"
                  height="80"
                  rx="10"
                  fill="#FFF7ED"
                  stroke="#FED7AA"
                  strokeWidth="1.5"
                />
              ))
            )}
            {/* Mönster i celler */}
            {/* Row 0: 1, 2, 3 prickar */}
            <circle cx="40" cy="40" r="6" fill="url(#rt-tile)" />
            <circle cx="124" cy="32" r="5" fill="url(#rt-tile)" />
            <circle cx="148" cy="48" r="5" fill="url(#rt-tile)" />
            <circle cx="220" cy="28" r="4" fill="url(#rt-tile)" />
            <circle cx="240" cy="40" r="4" fill="url(#rt-tile)" />
            <circle cx="220" cy="52" r="4" fill="url(#rt-tile)" />

            {/* Row 1: streck i olika riktningar */}
            <line x1="20" y1="116" x2="60" y2="156" stroke="url(#rt-tile)" strokeWidth="6" strokeLinecap="round" />
            <line x1="124" y1="116" x2="156" y2="156" stroke="url(#rt-tile)" strokeWidth="6" strokeLinecap="round" />
            <line x1="156" y1="116" x2="124" y2="156" stroke="url(#rt-tile)" strokeWidth="6" strokeLinecap="round" />
            <rect x="220" y="116" width="40" height="40" rx="6" fill="none" stroke="url(#rt-tile)" strokeWidth="3" />

            {/* Row 2: blandat + frågetecken */}
            <circle cx="40" cy="232" r="14" fill="none" stroke="url(#rt-tile)" strokeWidth="3" />
            <line x1="124" y1="216" x2="156" y2="248" stroke="url(#rt-tile)" strokeWidth="6" strokeLinecap="round" />
            <line x1="156" y1="216" x2="124" y2="248" stroke="url(#rt-tile)" strokeWidth="6" strokeLinecap="round" />

            {/* Sista cellen: ? */}
            <rect x="208" y="200" width="80" height="80" rx="10" fill="url(#rt-tile)" />
          </g>

          {/* Svarsknappar */}
          <g transform="translate(36 410)">
            {[0, 1, 2, 3].map(i => (
              <rect
                key={i}
                x={i * 84}
                y="0"
                width="76"
                height="40"
                rx="8"
                fill={i === 1 ? '#FB923C' : 'white'}
                stroke="#FED7AA"
                strokeWidth="1.5"
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// CV-MALLAR — staplade CV i olika stilar
// =============================================================
export function OgCvMallarIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="cm-strip" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Tre staplade CV-mallar i olika stilar */}

        {/* Bakgrund: Modern Minimal (ljus) */}
        <g transform="translate(40 80) rotate(8 140 200)" opacity="0.7">
          <rect x="0" y="0" width="280" height="380" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="20" y="20" width="100" height="10" rx="3" fill="#1E293B" />
          <rect x="20" y="36" width="80" height="6" rx="3" fill="#94A3B8" />
          <line x1="20" y1="60" x2="260" y2="60" stroke="#FB923C" strokeWidth="2" />
          {[80, 110, 140, 180, 210, 240, 280, 310, 340].map((y, i) => (
            <rect key={i} x="20" y={y} width={i % 2 === 0 ? 220 : 180} height="4" rx="2" fill="#CBD5E1" />
          ))}
        </g>

        {/* Mellan: Nordic (sidofält) */}
        <g transform="translate(120 70) rotate(-2 140 200)" opacity="0.85">
          <rect x="6" y="10" width="280" height="380" rx="14" fill="rgba(0,0,0,0.15)" filter="blur(4px)" />
          <rect x="0" y="0" width="280" height="380" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="0" y="0" width="100" height="380" fill="#1F4E5F" />
          <circle cx="50" cy="60" r="26" fill="white" opacity="0.85" />
          <rect x="14" y="100" width="72" height="6" rx="3" fill="white" opacity="0.85" />
          <rect x="14" y="116" width="60" height="4" rx="2" fill="white" opacity="0.65" />
          <rect x="14" y="160" width="50" height="6" rx="3" fill="white" opacity="0.85" />
          <rect x="14" y="174" width="60" height="4" rx="2" fill="white" opacity="0.65" />
          <rect x="14" y="184" width="56" height="4" rx="2" fill="white" opacity="0.65" />
          {/* Höger sida */}
          <rect x="116" y="20" width="140" height="10" rx="3" fill="#1E293B" />
          <rect x="116" y="36" width="100" height="6" rx="3" fill="#94A3B8" />
          <rect x="116" y="60" width="60" height="8" rx="3" fill="#0F766E" />
          {[80, 95, 110, 140, 155, 170, 200, 215, 230].map((y, i) => (
            <rect key={i} x="116" y={y} width={i % 3 === 0 ? 130 : 110} height="4" rx="2" fill="#CBD5E1" />
          ))}
        </g>

        {/* Förgrund: Creative (med färgad header) */}
        <g transform="translate(220 80) rotate(6 140 200)">
          <rect x="6" y="14" width="280" height="380" rx="14" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="280" height="380" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          {/* Geometrisk header */}
          <path d="M 0 0 L 280 0 L 280 50 L 168 80 L 0 50 Z" fill="url(#cm-strip)" />
          <rect x="20" y="14" width="100" height="10" rx="3" fill="white" />
          <rect x="20" y="30" width="80" height="6" rx="3" fill="white" opacity="0.85" />

          {/* Avatar i circle */}
          <circle cx="206" cy="86" r="14" fill="white" stroke="url(#cm-strip)" strokeWidth="3" />

          <rect x="20" y="100" width="60" height="8" rx="3" fill="#DC2626" />
          {[120, 134, 148, 178, 192, 206, 240, 254, 268, 304, 318, 332].map((y, i) => (
            <rect key={i} x="20" y={y} width={i % 2 === 0 ? 220 : 180} height="4" rx="2" fill="#CBD5E1" />
          ))}
          {/* Pills */}
          <rect x="20" y="350" width="50" height="14" rx="7" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="78" y="350" width="60" height="14" rx="7" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="146" y="350" width="50" height="14" rx="7" fill="#FFEDD5" stroke="#FED7AA" />
        </g>

        {/* Antal-badge */}
        <g transform="translate(420 380)">
          <circle cx="60" cy="60" r="50" fill="#FCD34D" />
          <circle cx="60" cy="60" r="50" fill="url(#cm-strip)" opacity="0.95" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// PERSONLIGT BREV (verktyg) — kompaktare brev-mockup
// =============================================================
export function OgPersonligtBrevIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="pb-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="pb-name" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Bakgrunds-brev */}
        <g transform="translate(60 80) rotate(-7 200 230)" opacity="0.45">
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" opacity="0.85" />
          <rect x="0" y="0" width="400" height="6" rx="3" fill="#FB923C" />
          {[50, 90, 110, 160, 180, 200, 250, 270].map((y, i) => (
            <rect key={i} x="40" y={y} width={250 + (i % 2) * 60} height="6" rx="3" fill="#CBD5E1" />
          ))}
        </g>

        {/* Förgrundsbrev med "Skapa nu"-CTA */}
        <g transform="translate(80 30) rotate(4 200 250)">
          <rect x="6" y="14" width="400" height="490" rx="20" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" />
          <rect x="0" y="0" width="400" height="8" rx="4" fill="url(#pb-strip)" />

          {/* Header */}
          <rect x="36" y="44" width="180" height="14" rx="4" fill="url(#pb-name)" />
          <rect x="36" y="68" width="220" height="6" rx="3" fill="#94A3B8" />
          <rect x="36" y="82" width="180" height="6" rx="3" fill="#94A3B8" />
          <rect x="290" y="44" width="74" height="6" rx="3" fill="#CBD5E1" />

          {/* Subjekt */}
          <rect x="36" y="118" width="280" height="10" rx="3" fill="#1E293B" />

          {/* Hälsning */}
          <rect x="36" y="148" width="120" height="7" rx="3" fill="#475569" />

          {/* Paragrafer (simplifierat) */}
          {[178, 192, 206, 220, 234, 266, 280, 294, 308, 340, 354].map((y, i) => (
            <rect key={i} x="36" y={y} width={290 + (i * 9 % 50) - 25} height="6" rx="3" fill="#475569" opacity="0.8" />
          ))}

          {/* Signatur */}
          <path
            d="M 36 402 Q 60 390 84 402 T 132 402 Q 156 390 180 402"
            stroke="#1E293B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="36" y="420" width="120" height="6" rx="3" fill="#94A3B8" />
        </g>

        {/* Floating "Anpassad för jobbet"-badge */}
        <g transform="translate(60 320)">
          <rect x="0" y="0" width="160" height="56" rx="12" fill="white" stroke="url(#pb-strip)" strokeWidth="2" />
          <rect x="0" y="0" width="160" height="4" rx="2" fill="url(#pb-strip)" />
          <circle cx="22" cy="28" r="10" fill="url(#pb-strip)" />
          <path d="M 18 28 L 22 32 L 28 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// SKAPA CV — CV med plus/redigerings-indikator
// =============================================================
export function OgSkapaCvIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="sc-strip" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="sc-plus" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {/* Bakgrund: tomt CV med markörer för fält att fylla */}
        <g transform="translate(80 30) rotate(-4 200 250)">
          <rect x="6" y="14" width="400" height="490" rx="20" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="400" height="490" rx="20" fill="white" />
          <rect x="0" y="0" width="400" height="8" rx="4" fill="url(#sc-strip)" />

          {/* Header med animerad blink-cursor */}
          <circle cx="76" cy="76" r="32" stroke="url(#sc-plus)" strokeWidth="3" strokeDasharray="6 4" fill="#FFEDD5" />

          <rect x="124" y="58" width="180" height="14" rx="4" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="1" strokeDasharray="4 3" />
          <rect x="124" y="80" width="140" height="7" rx="3" fill="#FED7AA" />

          <line x1="36" y1="138" x2="364" y2="138" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Sektion 1 - delvis ifylld */}
          <rect x="36" y="158" width="100" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="180" width="180" height="7" rx="3" fill="#475569" />
          <rect x="36" y="194" width="120" height="6" rx="3" fill="#94A3B8" />
          <rect x="36" y="212" width="318" height="5" rx="2.5" fill="#CBD5E1" />
          <rect x="36" y="222" width="280" height="5" rx="2.5" fill="#CBD5E1" />

          {/* Sektion 2 - tom (placeholder) */}
          <rect x="36" y="252" width="84" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="274" width="328" height="50" rx="6" fill="#FFEDD5" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="6 4" />

          <line x1="36" y1="346" x2="364" y2="346" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Sektion 3 — pills */}
          <rect x="36" y="366" width="100" height="8" rx="3" fill="#1E293B" />
          <rect x="36" y="386" width="76" height="22" rx="11" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="120" y="386" width="64" height="22" rx="11" fill="#FFEDD5" stroke="#FED7AA" />
          {/* Tom pill med + */}
          <rect x="192" y="386" width="44" height="22" rx="11" fill="white" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>

        {/* Stor "Bygg ditt CV"-pil ovan */}
        <g transform="translate(380 60)">
          <circle cx="60" cy="60" r="56" fill="white" />
          <circle cx="60" cy="60" r="48" fill="url(#sc-plus)" />
        </g>

        {/* Tids-badge */}
        <g transform="translate(400 380)">
          <rect x="0" y="0" width="120" height="44" rx="22" fill="#FCD34D" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// ARTIKLAR (lista) — 3-4 artiklar i stack
// =============================================================
export function OgArticlesListIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="al-strip" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>

        {/* Tredje bak */}
        <g transform="translate(60 60) rotate(-6 140 110)" opacity="0.45">
          <rect x="0" y="0" width="280" height="180" rx="12" fill="white" />
          <rect x="0" y="0" width="280" height="80" rx="12" fill="#FED7AA" />
          <rect x="20" y="100" width="80" height="6" rx="3" fill="#FB923C" />
          <rect x="20" y="116" width="200" height="9" rx="3" fill="#1E293B" />
          <rect x="20" y="132" width="180" height="9" rx="3" fill="#1E293B" />
          <rect x="20" y="156" width="100" height="5" rx="2" fill="#94A3B8" />
        </g>

        {/* Andra mitten */}
        <g transform="translate(120 130) rotate(2 140 110)" opacity="0.85">
          <rect x="6" y="10" width="280" height="220" rx="12" fill="rgba(0,0,0,0.18)" filter="blur(4px)" />
          <rect x="0" y="0" width="280" height="220" rx="12" fill="white" />
          <rect x="0" y="0" width="280" height="100" rx="12" fill="url(#al-strip)" opacity="0.85" />
          {/* Bild-mockup i headern */}
          <circle cx="48" cy="50" r="18" fill="white" opacity="0.4" />
          <rect x="76" y="42" width="80" height="6" rx="3" fill="white" opacity="0.85" />
          <rect x="76" y="54" width="60" height="5" rx="2" fill="white" opacity="0.7" />

          <rect x="20" y="120" width="60" height="14" rx="7" fill="#FFEDD5" />
          <rect x="20" y="142" width="240" height="8" rx="3" fill="#1E293B" />
          <rect x="20" y="158" width="220" height="8" rx="3" fill="#1E293B" />
          <rect x="20" y="180" width="100" height="5" rx="2" fill="#94A3B8" />
          <rect x="200" y="194" width="60" height="14" rx="7" fill="#FB923C" />
        </g>

        {/* Förgrund */}
        <g transform="translate(80 290) rotate(-3 140 100)">
          <rect x="6" y="10" width="380" height="190" rx="12" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="380" height="190" rx="12" fill="white" />
          <rect x="0" y="0" width="160" height="190" rx="12" fill="#FFEDD5" />
          <rect x="0" y="0" width="160" height="190" fill="url(#al-strip)" opacity="0.5" />
          {/* "CV"-text på vänster bild */}
          <rect x="40" y="76" width="80" height="40" rx="6" fill="white" opacity="0.95" />

          <rect x="180" y="20" width="50" height="14" rx="7" fill="#FFEDD5" />
          <rect x="180" y="46" width="180" height="9" rx="3" fill="#1E293B" />
          <rect x="180" y="62" width="160" height="9" rx="3" fill="#1E293B" />
          <rect x="180" y="86" width="190" height="5" rx="2" fill="#94A3B8" />
          <rect x="180" y="98" width="170" height="5" rx="2" fill="#94A3B8" />
          <rect x="180" y="110" width="160" height="5" rx="2" fill="#94A3B8" />
          <rect x="180" y="140" width="100" height="20" rx="10" fill="url(#al-strip)" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// EXEMPEL — kombinerad CV+brev mockup
// =============================================================
export function OgExempelIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="ex-strip" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
        </defs>

        {/* Bakgrund-brev (lutad höger) */}
        <g transform="translate(220 70) rotate(8 140 200)">
          <rect x="6" y="10" width="280" height="380" rx="14" fill="rgba(0,0,0,0.18)" filter="blur(4px)" />
          <rect x="0" y="0" width="280" height="380" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="0" y="0" width="280" height="6" rx="3" fill="url(#ex-strip)" />
          <rect x="20" y="20" width="120" height="10" rx="3" fill="url(#ex-strip)" />
          <rect x="20" y="36" width="140" height="6" rx="3" fill="#94A3B8" />
          <rect x="180" y="20" width="80" height="6" rx="3" fill="#CBD5E1" />
          {/* Subjekt */}
          <rect x="20" y="64" width="200" height="8" rx="3" fill="#1E293B" />
          {/* Brevtext */}
          {[90, 102, 114, 134, 146, 158, 178, 190, 202, 222, 234, 246, 266, 278, 298, 310, 322].map((y, i) => (
            <rect key={i} x="20" y={y} width={i % 3 === 0 ? 230 : i % 3 === 1 ? 200 : 240} height="4" rx="2" fill="#475569" opacity="0.7" />
          ))}
          {/* Signatur */}
          <path d="M 20 348 Q 36 340 52 348 T 92 348 Q 108 340 124 348" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Förgrund-CV (lutad vänster) */}
        <g transform="translate(40 60) rotate(-5 140 200)">
          <rect x="6" y="14" width="280" height="390" rx="14" fill="rgba(0,0,0,0.22)" filter="blur(4px)" />
          <rect x="0" y="0" width="280" height="390" rx="14" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="0" y="0" width="280" height="6" rx="3" fill="url(#ex-strip)" />

          {/* Header med avatar */}
          <circle cx="50" cy="56" r="22" fill="url(#ex-strip)" />
          <rect x="84" y="42" width="130" height="10" rx="3" fill="#1E293B" />
          <rect x="84" y="60" width="100" height="6" rx="3" fill="#94A3B8" />
          {/* Pill-rad kontakt */}
          {[84, 124, 164, 204].map((x, i) => (
            <rect key={i} x={x} y="76" width="32" height="5" rx="2" fill="#CBD5E1" />
          ))}

          <line x1="20" y1="104" x2="260" y2="104" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Sektion 1: erfarenhet */}
          <rect x="20" y="120" width="80" height="6" rx="3" fill="#1E293B" />
          <rect x="20" y="136" width="140" height="6" rx="3" fill="#475569" />
          <rect x="20" y="148" width="100" height="5" rx="2" fill="#94A3B8" />
          {[166, 176, 186, 196].map((y) => (
            <rect key={y} x="20" y={y} width="240" height="4" rx="2" fill="#CBD5E1" />
          ))}

          <line x1="20" y1="218" x2="260" y2="218" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Sektion 2 */}
          <rect x="20" y="234" width="80" height="6" rx="3" fill="#1E293B" />
          <rect x="20" y="250" width="120" height="5" rx="2" fill="#475569" />
          <rect x="20" y="260" width="180" height="4" rx="2" fill="#CBD5E1" />

          <line x1="20" y1="288" x2="260" y2="288" stroke="#FED7AA" strokeWidth="1.5" />

          {/* Pills */}
          <rect x="20" y="304" width="80" height="6" rx="3" fill="#1E293B" />
          <rect x="20" y="318" width="50" height="16" rx="8" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="78" y="318" width="60" height="16" rx="8" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="146" y="318" width="50" height="16" rx="8" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="20" y="342" width="60" height="16" rx="8" fill="#FFEDD5" stroke="#FED7AA" />
          <rect x="88" y="342" width="70" height="16" rx="8" fill="#FFEDD5" stroke="#FED7AA" />
        </g>

        {/* Floating "150+ yrken"-badge */}
        <g transform="translate(380 400)">
          <circle cx="60" cy="60" r="56" fill="#FCD34D" />
          <circle cx="60" cy="60" r="48" fill="url(#ex-strip)" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
// HOME — komplett ekosystem (CV + brev + chart + matchning)
// =============================================================
export function OgHomeIllustration() {
  return (
    <div style={wrapperStyle}>
      <svg width="540" height="540" viewBox="0 0 540 540" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="home-strip" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#DC2626" />
            <stop offset="1" stopColor="#BE185D" />
          </linearGradient>
          <linearGradient id="home-bar1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#F97316" />
            <stop offset="1" stopColor="#FED7AA" />
          </linearGradient>
        </defs>

        {/* CV-card (vänster) */}
        <g transform="translate(20 60) rotate(-4 110 140)">
          <rect x="6" y="10" width="220" height="280" rx="12" fill="rgba(0,0,0,0.18)" filter="blur(4px)" />
          <rect x="0" y="0" width="220" height="280" rx="12" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="0" y="0" width="220" height="6" rx="3" fill="url(#home-strip)" />
          <circle cx="36" cy="40" r="16" fill="url(#home-strip)" />
          <rect x="60" y="32" width="100" height="6" rx="3" fill="#1E293B" />
          <rect x="60" y="44" width="80" height="5" rx="2" fill="#94A3B8" />
          <line x1="16" y1="68" x2="204" y2="68" stroke="#FED7AA" />
          {[84, 96, 108, 130, 142, 154, 180, 192, 204, 230, 242, 254].map((y, i) => (
            <rect key={i} x="16" y={y} width={i % 3 === 0 ? 160 : 130} height="4" rx="2" fill="#CBD5E1" />
          ))}
        </g>

        {/* Brev-card (höger topp) */}
        <g transform="translate(260 30) rotate(4 110 100)">
          <rect x="6" y="10" width="220" height="180" rx="12" fill="rgba(0,0,0,0.18)" filter="blur(4px)" />
          <rect x="0" y="0" width="220" height="180" rx="12" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="0" y="0" width="220" height="6" rx="3" fill="url(#home-strip)" />
          <rect x="16" y="20" width="80" height="8" rx="3" fill="url(#home-strip)" />
          <rect x="16" y="36" width="100" height="5" rx="2" fill="#94A3B8" />
          {[60, 72, 84, 100, 112, 124, 140, 152].map((y, i) => (
            <rect key={i} x="16" y={y} width={170 - (i % 2) * 30} height="4" rx="2" fill="#475569" opacity="0.7" />
          ))}
        </g>

        {/* Chart-card (höger botten) */}
        <g transform="translate(280 250) rotate(-3 100 110)">
          <rect x="6" y="10" width="220" height="200" rx="12" fill="rgba(0,0,0,0.18)" filter="blur(4px)" />
          <rect x="0" y="0" width="220" height="200" rx="12" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
          <rect x="0" y="0" width="220" height="6" rx="3" fill="url(#home-strip)" />
          <rect x="16" y="20" width="100" height="6" rx="3" fill="#1E293B" />
          <rect x="16" y="32" width="80" height="5" rx="2" fill="#94A3B8" />

          {/* Chart */}
          <line x1="16" y1="170" x2="204" y2="170" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="16" y1="170" x2="16" y2="60" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="36" y="130" width="22" height="40" rx="3" fill="url(#home-bar1)" />
          <rect x="68" y="100" width="22" height="70" rx="3" fill="url(#home-strip)" />
          <rect x="100" y="120" width="22" height="50" rx="3" fill="url(#home-bar1)" />
          <rect x="132" y="80" width="22" height="90" rx="3" fill="url(#home-strip)" />
          <rect x="164" y="70" width="22" height="100" rx="3" fill="url(#home-bar1)" />
          {/* Trendlinje */}
          <path d="M 47 120 L 79 90 L 111 110 L 143 70 L 175 60" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Match-prick i mitten */}
        <g transform="translate(220 220)">
          <circle cx="50" cy="50" r="46" fill="white" opacity="0.95" />
          <circle cx="50" cy="50" r="38" fill="url(#home-strip)" />
        </g>
      </svg>
    </div>
  );
}
