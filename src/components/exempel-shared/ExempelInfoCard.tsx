'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ExempelInfoCardProps {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

export default function ExempelInfoCard({
  eyebrow,
  title,
  description,
  features,
}: ExempelInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-white p-6 sm:p-7 md:p-8"
      style={{
        boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)',
      }}
    >
      {/* Gradient-strip topp */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #FB923C 0%, #DC2626 50%, #BE185D 100%)',
        }}
      />

      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
        {eyebrow}
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5 max-w-2xl">
        {description}
      </p>

      <div className="flex flex-wrap gap-2">
        {features.map((feature, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs sm:text-sm font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
            {feature}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
