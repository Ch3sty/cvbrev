'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, MapPin, TrendingUp, CheckCircle2 } from 'lucide-react';

const SAMPLE_MATCHES = [
  {
    title: 'DevOps Engineer',
    company: 'Spotify',
    location: 'Stockholm',
    match: 92,
  },
  {
    title: 'Site Reliability Engineer',
    company: 'Klarna',
    location: 'Stockholm · Hybrid',
    match: 87,
  },
  {
    title: 'Cloud Engineer',
    company: 'King',
    location: 'Stockholm',
    match: 81,
  },
];

const HIGHLIGHTS = [
  'Hämtar lediga jobb från Arbetsförmedlingen och JobTech',
  'Normaliserar yrkestitlar via JobTech Taxonomy',
  'Filtrerar på pendlingsavstånd från din ort',
  'Uppdaterar matchningarna när nya tjänster publiceras',
];

export default function JobMatchingShowcase() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-orange-50/40 via-white to-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
              <Compass className="w-3.5 h-3.5" strokeWidth={2.5} />
              Jobbmatchning
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
              Vi hittar tjänster du själv aldrig hade sökt
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
              Aktivera ditt CV och vi extraherar yrkestitel, kompetenser,
              utbildning och ort. Sedan matchar vi mot lediga jobb från
              Arbetsförmedlingen och JobTech, inklusive tjänster med
              annan titel där dina kvalifikationer faktiskt passar.
            </p>

            <ul className="space-y-2.5 mb-7">
              {HIGHLIGHTS.map((highlight, i) => (
                <motion.li
                  key={highlight}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0"
                    strokeWidth={2.5}
                  />
                  {highlight}
                </motion.li>
              ))}
            </ul>

            <Link
              href="/login?signup=true"
              data-cta="jobmatching"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
              }}
            >
              Hitta dina matchande jobb
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.div>

          {/* Höger: mockup */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div
              className="absolute -inset-4 rounded-3xl opacity-25 blur-2xl pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
              aria-hidden="true"
            />

            <div
              className="relative bg-white rounded-3xl border border-orange-100 overflow-hidden"
              style={{ boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.22)' }}
            >
              {/* Header */}
              <div
                className="relative px-5 py-4 border-b border-orange-100"
                style={{
                  background:
                    'linear-gradient(90deg, #FFF7ED 0%, #FFFFFF 100%)',
                }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
                      Dina matchningar
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      Baserat på ditt CV
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                      aria-hidden="true"
                    />
                    Live
                  </div>
                </div>
              </div>

              {/* Lista */}
              <div className="divide-y divide-orange-100">
                {SAMPLE_MATCHES.map((job, i) => (
                  <motion.div
                    key={job.title}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-orange-50/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900 text-sm sm:text-base leading-tight mb-0.5">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-500">
                        <MapPin
                          className="w-3 h-3 text-orange-500"
                          strokeWidth={2.5}
                        />
                        {job.location}
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <div
                        className="text-xl sm:text-2xl font-black tabular-nums leading-none"
                        style={{
                          backgroundImage:
                            'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {job.match}%
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        match
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-orange-50/40 border-t border-orange-100 flex items-center gap-2 text-[11px] text-slate-600">
                <TrendingUp
                  className="w-3.5 h-3.5 text-orange-600"
                  strokeWidth={2.5}
                />
                <span className="font-medium">
                  +27 nya matchningar denna vecka
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
