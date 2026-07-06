/**
 * Custom SVG-ikoner för dashboard-menyn.
 *
 * Stil: 24×24 viewbox, anpassningsbar färg via CSS (currentColor på stroke,
 * gradient-fill på accent-detaljer). Inspirerade av OG-mockup-stilen men
 * mindre och striktare för meny-användning.
 *
 * Alla ikoner accepterar `className` för storlek + färg.
 */

interface IconProps {
  className?: string;
}

const SW = 2;

// === ÖVERSIKT — dashboard med 4 rutor + glimt ===
export function OversiktIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

// === MINA CV:N — papper med rader och avatar ===
export function CvIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth={SW} />
      <circle cx="9" cy="8" r="1.6" fill="currentColor" />
      <line x1="13" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="13" y1="9.5" x2="16" y2="9.5" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="15.5" x2="14" y2="15.5" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// === SPARADE BREV — kuvert med skuggning ===
export function BrevIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth={SW} />
      <path d="M3 8 L12 13.5 L21 8" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M3 8 L12 13.5 L21 8" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

// === NYTT CV — papper med plus ===
export function NyttCvIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="3" width="13" height="16" rx="2" stroke="currentColor" strokeWidth={SW} />
      <line x1="7" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <circle cx="17.5" cy="17" r="3.5" fill="currentColor" />
      <line x1="17.5" y1="15" x2="17.5" y2="19" stroke="white" strokeWidth={SW} strokeLinecap="round" />
      <line x1="15.5" y1="17" x2="19.5" y2="17" stroke="white" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

// === NYTT BREV — penna som skriver ===
export function NyttBrevIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14.5 4 L20 9.5 L9.5 20 L4 20 L4 14.5 Z" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" />
      <line x1="13" y1="5.5" x2="18.5" y2="11" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" opacity="0.5" />
      <line x1="6" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

// === CV-MALLAR — staplade lager ===
export function MallIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="3" width="13" height="16" rx="1.5" stroke="currentColor" strokeWidth={SW} opacity="0.4" />
      <rect x="4" y="5" width="13" height="16" rx="1.5" stroke="currentColor" strokeWidth={SW} fill="white" />
      <line x1="7" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
      <line x1="7" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// === FÖRBÄTTRA CV — förstoringsglas över rader ===
export function ForbattraIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="13" height="16" rx="2" stroke="currentColor" strokeWidth={SW} opacity="0.5" />
      <line x1="6" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.4" />
      <line x1="6" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.4" />
      <circle cx="15" cy="15" r="4.5" stroke="currentColor" strokeWidth={SW} fill="white" />
      <line x1="18.2" y1="18.2" x2="21" y2="21" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

// === JOBBMATCHNING — pussel-bitar som möts ===
export function JobbmatchningIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 8 L4 4 L9 4 L9 6 Q9 7.5 10.5 7.5 Q12 7.5 12 6 L12 4 L17 4 L17 8 Q18.5 8 18.5 9.5 Q18.5 11 17 11 L17 13 Q18.5 13 18.5 14.5 Q18.5 16 17 16 L17 20 L13 20 L13 18 Q13 16.5 11.5 16.5 Q10 16.5 10 18 L10 20 L4 20 L4 16 Q5.5 16 5.5 14.5 Q5.5 13 4 13 L4 11 Q5.5 11 5.5 9.5 Q5.5 8 4 8 Z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// === BLI UPPTÄCKT — radar/signal som sänder ut ===
export function UpptacktIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M8.8 15.2 Q7.5 13.9 7.5 12 Q7.5 10.1 8.8 8.8" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <path d="M15.2 8.8 Q16.5 10.1 16.5 12 Q16.5 13.9 15.2 15.2" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <path d="M6 18 Q3.5 15.5 3.5 12 Q3.5 8.5 6 6" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" opacity="0.6" />
      <path d="M18 6 Q20.5 8.5 20.5 12 Q20.5 15.5 18 18" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// === JOBBCOACHEN — chat-bubbla med spark ===
export function JobbcoachenIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 5 L20 5 Q21 5 21 6 L21 15 Q21 16 20 16 L11 16 L7 20 L7 16 L4 16 Q3 16 3 15 L3 6 Q3 5 4 5 Z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" />
      <circle cx="13" cy="10.5" r="1" fill="currentColor" />
      <circle cx="17" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

// === LINKEDIN — i-bokstav i ruta (vår tolkning, ej officiell blå) ===
export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth={SW} />
      <circle cx="7.5" cy="8" r="1.4" fill="currentColor" />
      <line x1="7.5" y1="11" x2="7.5" y2="17" stroke="currentColor" strokeWidth={SW * 1.4} strokeLinecap="round" />
      <path
        d="M11.5 17 L11.5 11 M11.5 13 Q11.5 11 13.5 11 Q15.5 11 15.5 13.5 L15.5 17 M15.5 17 L15.5 13.5"
        stroke="currentColor"
        strokeWidth={SW * 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// === REKRYTERINGSTESTER — checkbox-rader ===
export function TesterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth={SW} />
      <path d="M6.5 8 L8.5 10 L11 7" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="8.5" x2="18" y2="8.5" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.6" />
      <path d="M6.5 13.5 L8.5 15.5 L11 12.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.6" />
      <rect x="6" y="17" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth={SW * 0.85} />
      <line x1="13" y1="18.5" x2="18" y2="18.5" stroke="currentColor" strokeWidth={SW * 0.85} strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// === BELÖNINGAR — krona-trofé ===
export function BeloningarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M5 5 L7 11 L9 7 L12 11 L15 7 L17 11 L19 5 L19 13 Q19 15 17 15 L7 15 Q5 15 5 13 Z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="7" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="17" cy="5" r="1" fill="currentColor" />
      <line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="12" y1="15" x2="12" y2="20" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

// === PROFIL — siluett (krona-overlay för premium läggs i ProfilLink) ===
export function ProfilIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={SW} />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth={SW} />
      <path
        d="M5.5 19 Q5.5 15 12 15 Q18.5 15 18.5 19"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
    </svg>
  );
}

// === KRONA — premium-marker ===
export function KronaIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M3 7 L6 12 L9 7 L12 13 L15 7 L18 12 L21 7 L21 17 Q21 18 20 18 L4 18 Q3 18 3 17 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// === LOGGA UT — pil ut ===
export function LoggaUtIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M14 4 L18 4 Q19 4 19 5 L19 19 Q19 20 18 20 L14 20"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="3" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <path d="M7 8 L3 12 L7 16" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === BUGG — bug-illustration ===
export function BuggIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8 9 Q8 6 12 6 Q16 6 16 9"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <line x1="9" y1="6.5" x2="7" y2="4.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="15" y1="6.5" x2="17" y2="4.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <rect x="7.5" y="9" width="9" height="11" rx="4.5" stroke="currentColor" strokeWidth={SW} />
      <line x1="12" y1="11" x2="12" y2="20" stroke="currentColor" strokeWidth={SW * 0.85} opacity="0.6" />
      <line x1="3.5" y1="11.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="3.5" y1="15" x2="7.5" y2="14.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="3.5" y1="18.5" x2="7.5" y2="17.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="20.5" y1="11.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="20.5" y1="15" x2="16.5" y2="14.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="20.5" y1="18.5" x2="16.5" y2="17.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

// === KONTAKT — kuvert med spark ===
export function KontaktIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="6" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth={SW} />
      <path d="M3 7.5 L10 12 L17 7.5" stroke="currentColor" strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="19" cy="6" r="1.5" fill="currentColor" />
      <line x1="19" y1="3" x2="19" y2="4.5" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="21.5" y1="6" x2="20.5" y2="6" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
      <line x1="20.7" y1="4" x2="20" y2="4.7" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" />
    </svg>
  );
}

// === SHIELD — admin-panel ===
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 3 L20 6 L20 12 Q20 17 12 21 Q4 17 4 12 L4 6 Z"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M9 12 L11 14 L15 10" stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// === GIFT — onboarding-belöning ===
export function GiftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="9" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth={SW} />
      <line x1="3" y1="14" x2="21" y2="14" stroke="currentColor" strokeWidth={SW} />
      <line x1="12" y1="9" x2="12" y2="21" stroke="currentColor" strokeWidth={SW} />
      <path
        d="M8 9 Q5 9 5 6.5 Q5 4 7.5 4 Q11 4 12 9 Q13 4 16.5 4 Q19 4 19 6.5 Q19 9 16 9"
        stroke="currentColor"
        strokeWidth={SW}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// === TARGET — onboarding kom-igång ===
export function TargetIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={SW} />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth={SW} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
