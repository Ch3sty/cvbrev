'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Target, Zap, Award, ShieldCheck, Sparkle } from 'lucide-react';

interface VarforItem {
  titel: string;
  beskrivning: string;
}

interface VarforFungerarSectionProps {
  yrke: string;
  variant: 'letter' | 'cv';
  items: VarforItem[];
}

const ICONS = [CheckCircle2, Target, Zap, Award, ShieldCheck, Sparkle];

export default function VarforFungerarSection({
  yrke,
  variant,
  items,
}: VarforFungerarSectionProps) {
  if (!items || items.length === 0) return null;

  const what = variant === 'letter' ? 'brevet' : 'CV:t';

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Section heading */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          Varför det fungerar
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Det här gör {what} starkt
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
          Konkreta detaljer i exemplet som rekryterare och ATS-system letar efter
          för {yrke.toLowerCase()}.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {items.map((item, idx) => {
          const Icon = ICONS[idx % ICONS.length];
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.2) }}
              className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-5 sm:p-6 md:p-7 hover:shadow-lg transition-shadow"
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
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5 leading-snug">
                    {item.titel}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.beskrivning}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
