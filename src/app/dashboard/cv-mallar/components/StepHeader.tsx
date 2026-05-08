'use client';

interface StepHeaderProps {
  number: 1 | 2 | 3;
  title: string;
  description?: string;
}

/**
 * Numrerad steg-rubrik for /dashboard/cv-mallar.
 *
 * Visar steg-nummer i en orange-DNA-cirkel + titel + valfri beskrivning.
 * Anvands for att gora flodet pedagogiskt: 1. Valj CV, 2. Valj mall,
 * 3. Granska och ladda ner.
 */
export default function StepHeader({ number, title, description }: StepHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3 px-1">
      <span
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
        style={{
          background: 'linear-gradient(135deg, #F97316, #DC2626)',
          boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.4)',
        }}
        aria-hidden
      >
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-snug mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
