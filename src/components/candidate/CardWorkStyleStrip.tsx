import type { SpectrumView } from '@/lib/recruiter/workStyle'

/**
 * Kompakt arbetsstil för kandidatKORTET: två bipolära spektra som mini-linjer
 * plus en "Trivs när"-rad i prosa. Återanvänds i alla kort-renderingar (rekryterarens
 * poolkort, kandidatens preview, publika exempel) så uttrycket aldrig divergerar.
 *
 * Regler ur arbetsstilsmotorn, hålls här:
 *  - Indigo genomgående (personlighet), aldrig orange (testresultat) eller slate (CV).
 *  - Båda polerna i ett spektrum är likvärdigt positiva, aldrig bra mot dåligt.
 *  - Alltid exakt två spektra (motorn väljer de mest avvikande). Band 3 = neutral.
 *  - Inga siffror, procent eller staplar, rågången mot testpercentilerna ska synas.
 */

const BAND_POSITION: Record<number, string> = {
  1: '10%',
  2: '30%',
  3: '50%',
  4: '70%',
  5: '90%',
}

/** En bipolär mini-linje: liten prick vid bandets position, aktiv pol i fetstil. */
function MiniSpectrum({ spectrum }: { spectrum: SpectrumView }) {
  const isLeft = spectrum.band <= 2
  const isRight = spectrum.band >= 4
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className={`text-[10.5px] leading-tight ${isLeft ? 'font-bold text-indigo-800' : 'text-slate-400'}`}>
          {spectrum.leftLabel}
        </span>
        <span className={`text-[10.5px] leading-tight text-right ${isRight ? 'font-bold text-indigo-800' : 'text-slate-400'}`}>
          {spectrum.rightLabel}
        </span>
      </div>
      <div className="relative h-2.5 px-1" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-indigo-100" />
        <div className="relative h-full mx-1">
          <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white"
            style={{
              left: BAND_POSITION[spectrum.band],
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              boxShadow: '0 2px 5px -1px rgba(79, 70, 229, 0.5)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/** Sprout-ikon (lucide) inline så komponenten funkar överallt utan extra import. */
function SproutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 20h10" />
      <path d="M12 20c0-3.5 0-6-1-8" />
      <path d="M12 12c0-4-3-6-6-6 0 4 3 6 6 6z" />
      <path d="M12 10c0-3 2-5 5-5 0 3-2 5-5 5z" />
    </svg>
  )
}

export interface CardWorkStyleStripData {
  spectra: SpectrumView[]
  thrivesWhen: string | null
}

/**
 * @param thrivesForm 'recruiter' → "Trivs när ...", 'candidate' → "Du trivs när ...".
 *   Fraserna ur motorn är miljöbeskrivningar ("processer är tydliga ..."), så
 *   bara prefixet skiljer sig mellan vyerna.
 */
export default function CardWorkStyleStrip({
  data,
  thrivesForm = 'recruiter',
}: {
  data: CardWorkStyleStripData
  thrivesForm?: 'recruiter' | 'candidate'
}) {
  if (!data.spectra.length) return null
  const thrivesPrefix = thrivesForm === 'candidate' ? 'Du trivs när' : 'Trivs när'

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-indigo-500 mb-2">
        Arbetsstil
      </div>
      <div className="flex flex-col gap-2.5">
        {data.spectra.slice(0, 2).map((s) => (
          <MiniSpectrum key={s.key} spectrum={s} />
        ))}
      </div>
      {data.thrivesWhen && (
        <div className="flex items-start gap-1.5 mt-2.5 pt-2.5 border-t border-indigo-100">
          <SproutIcon className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <span className="text-[11.5px] text-slate-600 leading-snug">
            <span className="font-bold text-indigo-800">{thrivesPrefix}</span> {data.thrivesWhen}
          </span>
        </div>
      )}
    </div>
  )
}
