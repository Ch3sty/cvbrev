'use client';

interface ConfidenceMeterProps {
  confidence: 'high' | 'medium' | 'low';
  /** Behålls för bakåtkompatibilitet, mätaren är numera en linje. */
  segments?: number;
}

/**
 * Säkerheten i en yrkesrollsmatchning som en 2 px mätare i ink-1 på kant,
 * med etiketten i text-meta under. Hög = 100 procent, trolig = 60, osäker = 20.
 * Ingen färgkodning, ingen rörelse: talet och etiketten bär informationen.
 */
export default function ConfidenceMeter({ confidence }: ConfidenceMeterProps) {
  const widthByLevel: Record<typeof confidence, string> = {
    high: '100%',
    medium: '60%',
    low: '20%',
  };

  const labelByLevel: Record<typeof confidence, string> = {
    high: 'Verifierad',
    medium: 'Trolig',
    low: 'Osäker',
  };

  return (
    <div className="flex min-w-[88px] flex-col gap-1.5">
      <div
        className="h-0.5 w-full bg-kant"
        role="img"
        aria-label={`Säkerhet: ${labelByLevel[confidence]}`}
      >
        <div className="h-full bg-ink-1" style={{ width: widthByLevel[confidence] }} />
      </div>
      <span className="text-meta text-ink-3">{labelByLevel[confidence]}</span>
    </div>
  );
}
