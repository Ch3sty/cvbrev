'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import DynamicCounters from './DynamicCounters';

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-12 text-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            Bekräftat av SVT, SR, DN och Kollega
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
            Därför får du{' '}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              }}
            >
              inte
            </span>{' '}
            svar på dina ansökningar
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Allt fler rekryterare låter rekryteringssystem sålla kandidater
            automatiskt, ofta utan att du vet om det. Är ditt CV inte
            optimerat når det aldrig en mänsklig rekryterare. Vi ser till
            att du tar dig förbi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link
              href="/trial-signup"
              data-cta="hero-primary"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all touch-manipulation w-full sm:w-auto"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
              }}
            >
              Prova Premium gratis i 7 dagar
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>

            <Link
              href="/login?signup=true"
              data-cta="hero-secondary"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-base border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 transition-all touch-manipulation w-full sm:w-auto"
            >
              Eller starta gratis
            </Link>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-600 mb-8">
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-500"
                strokeWidth={2.5}
              />
              Inget kreditkort krävs
            </li>
            <li className="hidden sm:inline-block w-px h-3 bg-orange-200" aria-hidden="true" />
            <li className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-500"
                strokeWidth={2.5}
              />
              Avsluta när du vill
            </li>
            <li className="hidden sm:inline-block w-px h-3 bg-orange-200" aria-hidden="true" />
            <li className="inline-flex items-center gap-1.5">
              <Star
                className="w-3.5 h-3.5 text-orange-500 fill-current"
                strokeWidth={2}
              />
              Uppskattat av våra användare
            </li>
          </ul>

          {/* Dynamiska räknare med live-aktivitet */}
          <div className="max-w-md mx-auto pt-6 border-t border-orange-100">
            <DynamicCounters />
          </div>
        </div>
      </div>
    </section>
  );
}
