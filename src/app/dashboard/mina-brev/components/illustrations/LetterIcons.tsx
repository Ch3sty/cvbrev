/**
 * Brevminiatyren i Mina brev. Ett ark i panel med en ink-linje som
 * brevhuvud, brödtextlinjer i kant-stark och en liten signatur. Ingen
 * gradient, ingen orange: miniatyren är innehåll, inte position.
 *
 * `seed` ger deterministiska linjelängder så samma brev alltid ser likadant
 * ut men olika brev skiljer sig. Inga id, inga defs, så inga kollisioner.
 */
interface PaperThumbnailProps {
  seed?: string;
  className?: string;
}

export function LetterPaperThumbnail({ seed = '', className = 'w-28 h-36' }: PaperThumbnailProps) {
  const hash = seed.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const lineLen = (i: number) => 38 + (Math.abs((hash >> (i % 8)) + i * 11) % 22);
  const lineYs = [30, 36, 42, 48, 54, 60, 68, 74];

  return (
    <svg
      viewBox="0 0 80 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="76" height="96" rx="3" fill="var(--panel)" stroke="var(--kant-stark)" />

      {/* Brevhuvudet: namn i ink, kontaktrad i kant. */}
      <line x1="8" y1="12" x2="36" y2="12" stroke="var(--ink-1)" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="18" x2="24" y2="18" stroke="var(--kant-stark)" strokeWidth="0.9" strokeLinecap="round" />

      {lineYs.map((y, i) => (
        <line
          key={i}
          x1="8"
          y1={y}
          x2={8 + lineLen(i)}
          y2={y}
          stroke="var(--kant-stark)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}

      {/* Signatur. */}
      <path
        d="M 8 86 q 4 -2.5 8 0 t 8 0"
        stroke="var(--ink-2)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
