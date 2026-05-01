'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'Hade sökt i månader utan att få svar. Med ett anpassat brev fick jag mitt första intervju-svar inom tre veckor — och jobbet kort därefter.',
    name: 'Emma',
    role: 'Nyexaminerad, Stockholm',
    initial: 'E',
    color: '#FED7AA',
  },
  {
    quote:
      'Att byta bransch kändes omöjligt. Verktyget hjälpte mig formulera hur mina tidigare erfarenheter faktiskt var relevanta för den nya rollen.',
    name: 'Marcus',
    role: 'Karriärbytare, Göteborg',
    initial: 'M',
    color: '#FECACA',
  },
  {
    quote:
      'Sparar mig timmar varje vecka. Varje brev känns som mitt eget, men slipper jag plåga mig igenom det själv. Värt varje krona.',
    name: 'Sofia',
    role: 'Projektledare, Malmö',
    initial: 'S',
    color: '#FBCFE8',
  },
];

export default function TestimonialsRow() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-orange-50/40 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            <Star className="w-3.5 h-3.5 fill-current" strokeWidth={2.5} />
            4.9 av 5 från våra användare
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
            Riktiga jobbsökare. Riktiga svar.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Tusentals jobbsökare i Sverige har fått intervjuer och jobb sedan
            de bytte hur de skriver sina ansökningar.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative bg-white rounded-2xl border border-orange-100 p-6 sm:p-7 hover:border-orange-300 hover:-translate-y-0.5 transition-all duration-300"
              style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.12)' }}
            >
              <Quote
                className="absolute top-5 right-5 w-7 h-7 text-orange-200"
                strokeWidth={2}
                aria-hidden="true"
              />

              {/* Stjärnor */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 text-orange-500 fill-current"
                    strokeWidth={2}
                  />
                ))}
              </div>

              <blockquote className="text-base text-slate-700 leading-relaxed mb-5">
                "{t.quote}"
              </blockquote>

              <figcaption className="flex items-center gap-3 pt-4 border-t border-orange-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-orange-700 text-sm border border-orange-200"
                  style={{ background: t.color }}
                  aria-hidden="true"
                >
                  {t.initial}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-600">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
