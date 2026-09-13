'use client';

interface PotentialBarProps {
  currentAtsScore: number;
  dynamicPotentialScore: number;
  totalSelected: number;
  totalAvailable: number;
}

/**
 * Vad dina val är värda just nu.
 *
 * Bort: det orange fyllda kortet med skugga, den fasta mobilvarianten som
 * låg ovanpå bottennavet och pilen i en halvgenomskinlig ruta. Poängen
 * står nu som stora tal i en panel, samma som på resultatsteget.
 */
export default function PotentialBar({
  currentAtsScore,
  dynamicPotentialScore,
  totalSelected,
  totalAvailable,
}: PotentialBarProps) {
  const atsIncrease = Math.round(dynamicPotentialScore - currentAtsScore);

  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-steg uppercase text-ink-3">Potential med dina val</p>
          <p className="mt-1 text-meta text-ink-3">
            {totalSelected} av {totalAvailable} valda
          </p>
        </div>
        <div className="flex items-end gap-6">
          <div className="text-right">
            <div className="text-tal tabular-nums text-ink-1">{currentAtsScore}</div>
            <div className="text-meta text-ink-3">i dag</div>
          </div>
          <div className="text-right">
            <div className="text-tal tabular-nums text-ink-1">
              {Math.round(dynamicPotentialScore)}
            </div>
            <div className="text-meta text-ink-3">
              {atsIncrease > 0 ? `+${atsIncrease} poäng` : 'välj förbättringar'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
