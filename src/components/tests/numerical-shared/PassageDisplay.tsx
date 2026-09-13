'use client';

import NumericalTable from './NumericalTable';
import NumericalChart from './NumericalChart';
import {
  TableTopicIcon,
  ChartTopicIcon,
  SeriesTopicIcon,
  WordProblemTopicIcon,
  ConversionTopicIcon,
} from './illustrations/NumericalIcons';
import type { Passage, QuestionType } from '@/lib/numericalTest/types';

interface PassageDisplayProps {
  passage: Passage;
}

const TYPE_ICON: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  table: TableTopicIcon,
  graph: ChartTopicIcon,
  series: SeriesTopicIcon,
  word_problem: WordProblemTopicIcon,
  conversion: ConversionTopicIcon,
};

const TYPE_LABEL: Record<QuestionType, string> = {
  table: 'Tabell',
  graph: 'Graf',
  series: 'Talserie',
  word_problem: 'Lästal',
  conversion: 'Konvertering',
};

/**
 * Underlaget till frågan: typ och ämne som metarad, rubrik i text-kort,
 * kontexttext i en panel, sedan tabell eller graf.
 */
export default function PassageDisplay({ passage }: PassageDisplayProps) {
  const Icon = TYPE_ICON[passage.type];
  const typeLabel = TYPE_LABEL[passage.type];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 flex-shrink-0 text-ink-2" />
        <div className="min-w-0 flex-1">
          <p className="text-meta text-ink-3">
            {typeLabel}
            <span aria-hidden="true"> · </span>
            {passage.topic}
          </p>
          <h2 className="text-kort text-ink-1">{passage.title}</h2>
        </div>
      </div>

      {passage.contextText && (
        <div className="rounded-xl border border-kant bg-panel p-4 text-sm leading-[22px] text-ink-2 sm:p-5">
          {passage.contextText.split('\n\n').map((para, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>
              {para.trim()}
            </p>
          ))}
        </div>
      )}

      {passage.dataTable && <NumericalTable data={passage.dataTable} />}

      {passage.chartData && <NumericalChart config={passage.chartData} />}
    </section>
  );
}
