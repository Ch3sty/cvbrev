'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Pen, Brain, MessageSquare, FileSearch, Star } from 'lucide-react';

interface TipsItem {
  rubrik: string;
  text: string;
}

interface TipsSectionProps {
  yrke: string;
  items: TipsItem[];
}

const ICONS = [Lightbulb, Pen, Brain, MessageSquare, FileSearch, Star];

export default function TipsSection({ yrke, items }: TipsSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-5 sm:space-y-6">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          Skriv-tips
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Tips för {yrke.toLowerCase()}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
          Konkreta råd från rekryterare som vet vad som funkar i din bransch.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((tip, idx) => {
          const Icon = ICONS[idx % ICONS.length];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.2) }}
              className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5 sm:p-6 md:p-7"
              style={{
                boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background:
                    'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
                }}
              />

              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
                    {tip.rubrik}
                  </h3>
                  <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                    {tip.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
