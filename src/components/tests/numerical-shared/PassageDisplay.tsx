'use client';

import { motion } from 'framer-motion';
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

export default function PassageDisplay({ passage }: PassageDisplayProps) {
  const Icon = TYPE_ICON[passage.type];
  const typeLabel = TYPE_LABEL[passage.type];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4 sm:space-y-5"
    >
      {/* Type pill + title */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
            {typeLabel} · {passage.topic}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            {passage.title}
          </h2>
        </div>
      </div>

      {/* Context text */}
      {passage.contextText && (
        <div className="text-sm sm:text-base text-slate-700 leading-relaxed bg-orange-50/40 border border-orange-100 rounded-2xl p-4 sm:p-5">
          {passage.contextText.split('\n\n').map((para, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>
              {para.trim()}
            </p>
          ))}
        </div>
      )}

      {/* Data table */}
      {passage.dataTable && <NumericalTable data={passage.dataTable} />}

      {/* Chart */}
      {passage.chartData && <NumericalChart config={passage.chartData} />}
    </motion.section>
  );
}
