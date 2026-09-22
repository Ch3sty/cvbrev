'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

          <div className="flex items-center justify-center mb-4">
            <Link
              href="/register"
              data-cta="hero-primary"
              className="group inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-base font-semibold text-white hover:bg-orange-700 transition-colors touch-manipulation"
            >
              Skapa konto gratis
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2}
              />
            </Link>
          </div>

          <p className="text-sm text-neutral-600 mb-8">
            Inget kreditkort · Avsluta när du vill · Bekräftat av SVT, SR, DN
          </p>

          {/* Dynamiska räknare med live-aktivitet */}
          <div className="max-w-md mx-auto pt-6 border-t border-orange-100">
            <DynamicCounters />
          </div>
        </div>
      </div>
    </section>
  );
}
