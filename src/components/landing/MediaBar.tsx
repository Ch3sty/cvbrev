'use client';

import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

const MEDIA = ['SVT', 'Sveriges Radio', 'DN', 'Kollega'];
const COMPANIES = ['Spotify', 'H&M', 'IKEA', 'SEB', 'Klarna', 'Volvo'];

export default function MediaBar() {
  return (
    <section className="relative py-10 sm:py-14 bg-gradient-to-b from-white via-orange-50/30 to-white border-y border-orange-100/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-7 sm:mb-9"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-3">
            <Newspaper className="w-3.5 h-3.5" strokeWidth={2.5} />
            Som omtalat i
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Svenska medier och kandidater på Sveriges största arbetsgivare litar på oss.
          </p>
        </motion.div>

        {/* Media-namn */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {MEDIA.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center justify-center px-4 py-3 rounded-xl bg-white border border-orange-100 text-slate-700 font-bold text-sm sm:text-base tracking-tight"
              style={{ boxShadow: '0 2px 8px -4px rgba(249, 115, 22, 0.08)' }}
            >
              {name}
            </motion.div>
          ))}
        </div>

        {/* Avskiljare */}
        <div className="flex items-center gap-3 my-6 sm:my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
            Användare hos
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
        </div>

        {/* Företagslogos som textnamn */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3 opacity-70">
          {COMPANIES.map((name) => (
            <span
              key={name}
              className="text-slate-500 font-bold text-sm sm:text-base tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
