'use client';

/**
 * Statistiken på hubben: en panel med tre stora tal och etiketter i meta.
 * Ingen ikonrad, inga färgade ikoner. Talen bär informationen.
 */

interface TestStatsCardProps {
  completedTestCount: number;
  totalTestCount: number;
  averageBestPercentage: number;
  totalTimeSeconds: number;
}

export default function TestStatsCard({
  completedTestCount,
  totalTestCount,
  averageBestPercentage,
  totalTimeSeconds,
}: TestStatsCardProps) {
  const totalMinutes = Math.round(totalTimeSeconds / 60);
  const timeValue =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)}t ${totalMinutes % 60}m`
      : `${totalMinutes}`;
  const timeLabel = totalMinutes >= 60 ? 'Total tid' : 'Minuter totalt';

  return (
    <section
      className="rounded-xl border border-kant bg-panel p-4 sm:p-5"
      aria-label="Din statistik"
    >
      <div className="grid grid-cols-3 gap-4">
        <Stat value={`${completedTestCount} / ${totalTestCount}`} label="Test slutförda" />
        <Stat value={`${averageBestPercentage} %`} label="Bästa snitt" />
        <Stat value={timeValue} label={timeLabel} />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-tal tabular-nums text-ink-1">{value}</p>
      <p className="mt-1 text-meta text-ink-3">{label}</p>
    </div>
  );
}
