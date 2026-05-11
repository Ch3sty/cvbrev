'use client';

import { motion } from 'framer-motion';
import { MessageSquareQuote } from 'lucide-react';
import { interviewTips } from '@/lib/personalityTest/insights';
import type { BigFiveScores } from '@/lib/personalityTest/types';

export default function InterviewTipsCard({ scores }: { scores: BigFiveScores }) {
  const tips = interviewTips(scores);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.4)',
            }}
          >
            <MessageSquareQuote className="w-5 h-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
              Intervjutips för din profil
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Så här kan du prata om din personlighet
            </h2>
          </div>
        </div>

        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
              className="flex items-start gap-2 text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-3"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center mt-0.5 tabular-nums">
                {i + 1}
              </span>
              <span>{tip}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
