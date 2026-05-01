'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';

const STUDIES = [
  {
    source: 'Kollega',
    headline: 'AI-rekrytering klassad som högriskverksamhet',
    quote:
      '40% av Teamtailors 10 000+ arbetsgivare har aktiverat AI-funktioner för rekrytering. EU klassificerar AI-rekrytering som "högriskverksamhet".',
    url: 'https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju',
  },
  {
    source: 'SVT Nyheter',
    headline: 'Knepen som gör att du inte sorteras bort',
    quote:
      'Hur sticker du ut när "perfekta" AI-skrivna CV:n blivit norm? SVT undersöker knepen som gör att du inte sorteras bort.',
    url: 'https://www.svt.se/nyheter/inrikes/ai-och-jobbsokande-har-ar-knepen-som-gor-att-du-inte-sorteras-bort',
  },
  {
    source: 'Sveriges Radio P1',
    headline: 'Så tar du dig förbi robotarna',
    quote:
      'Allt fler företag använder AI för att sålla bland CV:n. Jesper Olsson på Trygghetsrådet TRR förklarar hur du undviker att bli bortsållad.',
    url: 'https://www.sverigesradio.se/artikel/ai-sallar-bort-ditt-cv-sa-har-tar-du-dig-forbi-robotarna',
  },
  {
    source: 'Dagens Nyheter',
    headline: 'Intervjuad av en robot',
    quote:
      '"Intervjuad av en robot" — DN rapporterar om hur AI tar över allt fler steg i rekryteringsprocessen hos svenska företag.',
    url: 'https://www.dn.se/sverige/intervjuad-av-en-robot-sa-tar-ai-over-inom-rekrytering/',
  },
];

export default function MediaImpactSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Bakgrund: vita prickar + subtil gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 20% 30%, rgba(249, 115, 22, 0.06) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        aria-hidden="true"
      >
        <pattern
          id="media-impact-dots"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="1" fill="#FB923C" opacity="0.18" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#media-impact-dots)" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-start">
          {/* Vänster: rubrik + jätte-citattecken */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="relative lg:sticky lg:top-24"
          >
            {/* Stort jätte-citattecken som dekoration */}
            <svg
              className="absolute -top-8 -left-2 sm:-left-6 w-32 sm:w-40 lg:w-56 h-auto pointer-events-none opacity-90"
              viewBox="0 0 200 200"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="quote-mark"
                  x1="0"
                  y1="0"
                  x2="200"
                  y2="200"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#F97316" />
                  <stop offset="0.5" stopColor="#DC2626" />
                  <stop offset="1" stopColor="#BE185D" />
                </linearGradient>
              </defs>
              <path
                d="M 50 30 Q 20 30 20 70 L 20 130 Q 20 160 50 160 L 80 160 Q 80 130 60 130 Q 50 130 50 110 Q 50 80 80 70 Q 80 30 50 30 Z M 130 30 Q 100 30 100 70 L 100 130 Q 100 160 130 160 L 160 160 Q 160 130 140 130 Q 130 130 130 110 Q 130 80 160 70 Q 160 30 130 30 Z"
                fill="url(#quote-mark)"
                opacity="0.18"
              />
            </svg>

            <div className="relative pt-12 sm:pt-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
                Bekräftat av medierna
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
                Robotarna har redan{' '}
                <span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  }}
                >
                  läst ditt CV
                </span>
                .
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
                Sveriges största redaktioner har samma slutsats: rekryteringen
                har förändrats i grunden. Den första som läser din ansökan är
                inte en människa.
              </p>

              <Link
                href="/trial-signup"
                data-cta="media-impact-primary"
                className="group inline-flex items-center gap-2 text-orange-700 hover:text-orange-800 font-bold text-sm"
              >
                Så hjälper vi dig komma förbi
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
            </div>
          </motion.div>

          {/* Höger: zigzag-stapel av kort */}
          <div className="relative space-y-4 sm:space-y-5">
            {STUDIES.map((study, i) => {
              const offsetClass =
                i % 2 === 0
                  ? 'lg:translate-x-0'
                  : 'lg:translate-x-8';
              return (
                <motion.a
                  key={study.source}
                  href={study.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`group relative block bg-white rounded-2xl border border-orange-100 p-5 sm:p-6 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300 ${offsetClass}`}
                  style={{
                    boxShadow:
                      '0 8px 24px -12px rgba(249, 115, 22, 0.18)',
                  }}
                >
                  {/* Mini-faksimil av nyhetsartikel */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div
                      className="hidden sm:block flex-shrink-0 w-20 lg:w-24 aspect-[3/4] rounded-lg overflow-hidden border border-orange-100 bg-orange-50/30 p-2"
                      aria-hidden="true"
                    >
                      <div className="space-y-1">
                        <div
                          className="h-2 rounded"
                          style={{
                            background:
                              'linear-gradient(90deg, #F97316 0%, #DC2626 100%)',
                          }}
                        />
                        <div className="h-1 bg-slate-200 rounded w-3/4" />
                        <div className="h-1 bg-slate-200 rounded w-full" />
                        <div className="h-1 bg-slate-200 rounded w-5/6" />
                        <div className="h-6 bg-slate-100 rounded mt-2" />
                        <div className="h-1 bg-slate-200 rounded w-full mt-2" />
                        <div className="h-1 bg-slate-200 rounded w-4/5" />
                        <div className="h-1 bg-slate-200 rounded w-full" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
                          {study.source}
                        </span>
                        <ExternalLink
                          className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 transition-colors flex-shrink-0"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-orange-700 transition-colors">
                        {study.headline}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {study.quote}
                      </p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Lång CTA-stripe längst ner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl mt-12 sm:mt-16"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 16px 36px -12px rgba(220, 38, 38, 0.4)',
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            aria-hidden="true"
          >
            <pattern
              id="media-stripe-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="14" cy="14" r="1.2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#media-stripe-dots)" />
          </svg>

          <div className="relative px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-white">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1 opacity-90">
                Vad du kan göra
              </p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black leading-tight">
                Optimera CV:t och brevet för det system som faktiskt läser dem.
              </h3>
            </div>

            <Link
              href="/trial-signup"
              data-cta="media-impact-stripe"
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 hover:scale-[1.02] transition-all touch-manipulation flex-shrink-0 w-full sm:w-auto"
              style={{ boxShadow: '0 8px 20px -8px rgba(0,0,0,0.2)' }}
            >
              Prova Premium gratis i 7 dagar
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
