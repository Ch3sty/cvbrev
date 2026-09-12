'use client';

import { Layers, LineChart } from 'lucide-react';

export type TesterTab = 'tester' | 'utveckling';

interface Props {
  active: TesterTab;
  onChange: (tab: TesterTab) => void;
  /** Antal slutförda försök, visas som liten räknare på utvecklingsfliken. */
  completedCount: number;
}

export default function TesterTabs({ active, onChange, completedCount }: Props) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-orange-50/70 border border-orange-100 w-full sm:w-fit">
      <TabButton
        label="Tester"
        icon={<Layers className="w-4 h-4" strokeWidth={2.5} />}
        isActive={active === 'tester'}
        onClick={() => onChange('tester')}
      />
      <TabButton
        label="Din utveckling"
        icon={<LineChart className="w-4 h-4" strokeWidth={2.5} />}
        isActive={active === 'utveckling'}
        onClick={() => onChange('utveckling')}
        badge={completedCount > 0 ? completedCount : undefined}
      />
    </div>
  );
}

function TabButton({
  label,
  icon,
  isActive,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation ${
        isActive
          ? 'bg-white text-orange-700 shadow-sm'
          : 'text-neutral-500 hover:text-neutral-700'
      }`}
    >
      <span className={isActive ? 'text-orange-600' : 'text-neutral-400'}>{icon}</span>
      {label}
      {badge !== undefined && (
        <span
          className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold tabular-nums ${
            isActive ? 'bg-orange-100 text-orange-700' : 'bg-neutral-200 text-neutral-600'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
