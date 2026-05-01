'use client';

import { motion } from 'framer-motion';
import { Check, X, HelpCircle } from 'lucide-react';

type AnswerValue = 'true' | 'false' | 'cannot_say';

interface Statement {
  text: string;
}

interface StatementListProps {
  statements: Statement[];
  answers: (AnswerValue | null)[];
  onAnswer: (statementIndex: number, value: AnswerValue) => void;
  disabled?: boolean;
}

export default function StatementList({
  statements,
  answers,
  onAnswer,
  disabled = false,
}: StatementListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-3 sm:space-y-4"
    >
      <div className="text-center px-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
          Bedöm påståendena
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          Endast utifrån texten ovan — inte din egen kunskap.
        </p>
      </div>

      {statements.map((statement, i) => (
        <StatementCard
          key={i}
          index={i}
          text={statement.text}
          answer={answers[i]}
          onAnswer={(v) => onAnswer(i, v)}
          disabled={disabled}
        />
      ))}
    </motion.div>
  );
}

function StatementCard({
  index,
  text,
  answer,
  onAnswer,
  disabled,
}: {
  index: number;
  text: string;
  answer: AnswerValue | null;
  onAnswer: (v: AnswerValue) => void;
  disabled?: boolean;
}) {
  const isAnswered = answer !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
      className="bg-white rounded-2xl border border-orange-100 overflow-hidden"
      style={{
        boxShadow: isAnswered
          ? '0 4px 16px -8px rgba(249, 115, 22, 0.18)'
          : '0 4px 12px -6px rgba(249, 115, 22, 0.12)',
      }}
    >
      <div className="p-4 sm:p-5">
        {/* Statement-text med nummer */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold tabular-nums"
            style={{
              background: isAnswered
                ? 'linear-gradient(135deg, #F97316, #DC2626)'
                : '#CBD5E1',
            }}
          >
            {index + 1}
          </div>
          <p className="flex-1 text-sm sm:text-base text-slate-800 leading-relaxed">
            {text}
          </p>
        </div>

        {/* 3 svarsalternativ */}
        <div className="grid grid-cols-3 gap-2">
          <AnswerButton
            value="true"
            selected={answer === 'true'}
            disabled={disabled}
            onClick={() => onAnswer('true')}
          />
          <AnswerButton
            value="false"
            selected={answer === 'false'}
            disabled={disabled}
            onClick={() => onAnswer('false')}
          />
          <AnswerButton
            value="cannot_say"
            selected={answer === 'cannot_say'}
            disabled={disabled}
            onClick={() => onAnswer('cannot_say')}
          />
        </div>
      </div>
    </motion.div>
  );
}

function AnswerButton({
  value,
  selected,
  disabled,
  onClick,
}: {
  value: AnswerValue;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const config = {
    true: {
      label: 'Sant',
      icon: Check,
      strokeWidth: 3,
      activeBg: 'linear-gradient(135deg, #10B981, #059669)',
      activeShadow: '0 6px 14px -4px rgba(16, 185, 129, 0.45)',
      activeRing: 'ring-emerald-400',
      hoverBorder: 'hover:border-emerald-400',
      hoverText: 'hover:text-emerald-700',
    },
    false: {
      label: 'Falskt',
      icon: X,
      strokeWidth: 3,
      activeBg: 'linear-gradient(135deg, #F87171, #DC2626)',
      activeShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.45)',
      activeRing: 'ring-red-400',
      hoverBorder: 'hover:border-red-400',
      hoverText: 'hover:text-red-700',
    },
    cannot_say: {
      label: 'Kan ej avgöras',
      icon: HelpCircle,
      strokeWidth: 2.5,
      activeBg: 'linear-gradient(135deg, #94A3B8, #64748B)',
      activeShadow: '0 6px 14px -4px rgba(100, 116, 139, 0.45)',
      activeRing: 'ring-slate-400',
      hoverBorder: 'hover:border-slate-400',
      hoverText: 'hover:text-slate-700',
    },
  }[value];

  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex flex-col items-center justify-center gap-1
        py-2.5 px-2 rounded-xl border-2 transition-all touch-manipulation
        min-h-[64px] sm:min-h-[68px]
        ${
          selected
            ? `text-white border-transparent shadow-md ring-2 ${config.activeRing}`
            : `bg-white text-slate-700 border-orange-100 ${config.hoverBorder} ${config.hoverText} hover:-translate-y-0.5`
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={
        selected
          ? {
              background: config.activeBg,
              boxShadow: config.activeShadow,
            }
          : undefined
      }
      aria-pressed={selected}
    >
      <Icon
        className="w-4 h-4 sm:w-5 sm:h-5"
        strokeWidth={config.strokeWidth}
      />
      <span className="text-[10px] sm:text-xs font-bold leading-tight text-center">
        {config.label}
      </span>
    </button>
  );
}
