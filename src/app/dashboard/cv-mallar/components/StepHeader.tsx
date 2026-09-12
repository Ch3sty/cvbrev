'use client';

interface StepHeaderProps {
  number: 1 | 2 | 3;
  total?: number;
  title: string;
  description?: string;
}

/**
 * Numrerad steg-rubrik for /dashboard/cv-mallar.
 *
 * Visar "STEG X AV Y" + steg-nummer i orange-DNA-cirkel + stor titel +
 * beskrivning. Designen matchar /dashboard/linkedin-optimizer for
 * konsekvent visuellt sprak mellan dashboard-verktygen.
 */
export default function StepHeader({
  number,
  total = 3,
  title,
  description,
}: StepHeaderProps) {
  return (
    <div className="mb-4 sm:mb-5">
      {/* Eyebrow: STEG X AV Y */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-1 h-3 rounded-sm"
          style={{
            background: '#EA580C',
          }}
          aria-hidden
        />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
          Steg {number} av {total}
        </span>
      </div>

      {/* Steg-cirkel + titel */}
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-base mt-0.5"
          style={{
            background: '#EA580C',
          }}
          aria-hidden
        >
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900 leading-[1.15] tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-600 leading-relaxed mt-1.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
