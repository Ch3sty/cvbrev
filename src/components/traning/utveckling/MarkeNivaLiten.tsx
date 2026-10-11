/**
 * Märket Nivån upp i liten storlek (20 och 14 px) för kurvan och legenden.
 * Samma ritning som MarkeNiva i RumSymboler, men med fasta gradient-id i
 * stället för useId: märket ritas från en server component på flera ställen
 * (mobil- och datorkurvan, legenden), och useId gav olika id på servern och
 * klienten (hydreringsvarning). Fasta id är säkra här eftersom alla
 * instanser har identiska gradienter.
 */

export default function MarkeNivaLiten({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none" aria-hidden="true" focusable="false" className="shrink-0">
      <defs>
        <linearGradient id="utv-marke-niva" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0A061" />
          <stop offset=".5" stopColor="#D9702A" />
          <stop offset="1" stopColor="#9E4515" />
        </linearGradient>
        <linearGradient id="utv-marke-niva-kant" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD9B8" />
          <stop offset="1" stopColor="#B55A1E" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#utv-marke-niva)" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="url(#utv-marke-niva-kant)" strokeWidth="1.5" opacity=".8" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="#FFF" strokeOpacity=".28" strokeWidth="1" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#5A2708" strokeOpacity=".35" strokeWidth="1" />
      <path d="M36 76h48" stroke="#3F1A06" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 76L54 58l10 8 20-22" fill="none" stroke="#FFF2E6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="44" r="5" fill="#FFF2E6" />
    </svg>
  )
}
