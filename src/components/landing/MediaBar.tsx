'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Newspaper } from 'lucide-react';

const STUDIES = [
  {
    source: 'Kollega',
    quote:
      '40% av Teamtailors 10 000+ arbetsgivare har aktiverat AI-funktioner för rekrytering. EU klassificerar AI-rekrytering som "högriskverksamhet".',
    url: 'https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju',
    accent: '#F97316',
  },
  {
    source: 'SVT Nyheter',
    quote:
      'Hur sticker du ut när "perfekta" AI-skrivna CV:n blivit norm? SVT undersöker knepen som gör att du inte sorteras bort.',
    url: 'https://www.svt.se/nyheter/inrikes/ai-och-jobbsokande-har-ar-knepen-som-gor-att-du-inte-sorteras-bort',
    accent: '#DC2626',
  },
  {
    source: 'Sveriges Radio P1',
    quote:
      'Allt fler företag använder AI för att sålla bland CV:n. Jesper Olsson på Trygghetsrådet TRR förklarar hur du undviker att bli bortsållad.',
    url: 'https://www.sverigesradio.se/artikel/ai-sallar-bort-ditt-cv-sa-har-tar-du-dig-forbi-robotarna',
    accent: '#BE185D',
  },
  {
    source: 'Dagens Nyheter',
    quote:
      '"Intervjuad av en robot" — DN rapporterar om hur AI tar över allt fler steg i rekryteringsprocessen hos svenska företag.',
    url: 'https://www.dn.se/sverige/intervjuad-av-en-robot-sa-tar-ai-over-inom-rekrytering/',
    accent: '#0F172A',
  },
];

export default function MediaBar() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/30 to-white border-y border-orange-100/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <Newspaper className="w-3.5 h-3.5" strokeWidth={2.5} />
            Bekräftat av SVT, SR, DN och Kollega
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-3">
            Medierna bekräftar: rekryteringssystemen sållar bort din ansökan
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Sveriges största nyhetsredaktioner varnar. Allt fler rekryterare
            låter system sålla bort kandidater automatiskt. Är ditt CV
            optimerat?
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
          {STUDIES.map((study, i) => (
            <motion.a
              key={study.source}
              href={study.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl bg-white border border-orange-100 p-5 sm:p-6 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: study.accent }}
                aria-hidden="true"
              />

              <div className="flex items-start justify-between mb-3 gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {study.source}
                </span>
                <ExternalLink
                  className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 transition-colors flex-shrink-0 mt-0.5"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {study.quote}
              </p>
            </motion.a>
          ))}
        </div>

        {/* CTA-kort under */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-white to-rose-50/40 border border-orange-200 p-5 sm:p-6 lg:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
        >
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight mb-1.5">
              Vi hjälper dig passera rekryteringssystemen
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Våra verktyg är byggda för att optimera ditt CV och personliga
              brev för ATS-screening så att dina kvalifikationer faktiskt
              når en mänsklig rekryterare.
            </p>
          </div>

          <Link
            href="/trial-signup"
            data-cta="media-cta"
            className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation flex-shrink-0 w-full sm:w-auto"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 8px 20px -8px rgba(220, 38, 38, 0.45)',
            }}
          >
            Prova Premium gratis i 7 dagar
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
