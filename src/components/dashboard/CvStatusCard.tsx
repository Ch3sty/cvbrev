'use client';

/**
 * CvStatusCard
 * ------------
 * Visar antingen ett "Ladda upp / Skapa CV"-banner (nar cvCount === 0)
 * eller en kompakt rad med anvandarens aktiva CV.
 *
 * Premissen: utan CV kan man inte skapa personliga brev, analysera CV
 * eller kora jobbmatchning. Det har ar gating-elementet pa dashboarden.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { IconVarning, IconCheckmark, MiniScenCvVerktyg } from './illustrations/DashboardIcons';
import InfoPopover from '@/components/ui/InfoPopover';

interface CvStatusCardProps {
  cvCount: number;
  activeCvName?: string;
}

export default function CvStatusCard({ cvCount, activeCvName }: CvStatusCardProps) {
  const hasCv = cvCount > 0;

  // Variant A: Ingen CV
  if (!hasCv) {
    return (
      <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/40 p-5 sm:p-6 motion-safe:animate-[slideUp_400ms_ease-out_both]">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <IconVarning className="w-12 h-12 flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-semibold text-neutral-900 text-base sm:text-lg leading-tight">
                Du behöver ett CV för att börja
              </h3>
              <span
                className="text-xs font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full text-white"
                style={{
                  background:
                    '#EA580C',
                }}
              >
                Krävs
              </span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Personliga brev, CV-analys och jobbmatchning kräver att du
              först laddar upp eller skapar ett CV. Det tar ca 30 sekunder.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/dashboard/profil/cv"
                className="group inline-flex items-center justify-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl text-white min-h-[44px]"
                style={{
                  background:
                    '#EA580C',
                }}
              >
                Ladda upp CV
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
              <Link
                href="/dashboard/skapa-cv"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 transition-colors min-h-[44px]"
              >
                Skapa nytt CV
              </Link>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-orange-700 font-bold">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#EA580C',
                }}
                aria-hidden="true"
              />
              Du får +25 XP när CV:t är på plats
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant B: Aktivt CV
  return (
    <div
      className="rounded-xl bg-white border border-orange-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 motion-safe:animate-[slideUp_400ms_ease-out_both]"
      >
      <IconCheckmark className="w-11 h-11 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
          <span>Dina CV</span>
          {/* "Aktivt CV" finns inte som globalt begrepp: man väljer CV per
              verktyg. Popovern förklarar exakt det. */}
          <InfoPopover
            title="Dina CV"
            illustration={<MiniScenCvVerktyg className="w-full h-auto" />}
          >
            <p>
              Här ser du ditt senast uppdaterade CV. När du skapar brev, kör en
              analys eller matchar mot jobb väljer du själv vilket av dina CV
              vi ska utgå från.
            </p>
            <p>Du hanterar alla dina CV under Mina CV.</p>
          </InfoPopover>
        </div>
        <div className="font-semibold text-neutral-900 truncate text-base">
          {activeCvName || `${cvCount} ${cvCount === 1 ? 'sparat CV' : 'sparade CV'}`}
        </div>
        <div className="text-xs text-neutral-500 truncate">
          {activeCvName ? 'Senast uppdaterat. ' : ''}
          Du väljer vilket CV du använder i varje verktyg.
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/dashboard/profil/cv"
          className="text-xs font-bold px-3 py-2 rounded-xl text-orange-700 hover:bg-orange-50 transition-colors"
        >
          Hantera
        </Link>
        <Link
          href="/dashboard/profil/cv"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white"
          style={{
            background:
              '#EA580C',
          }}
        >
          Mina CV ({cvCount})
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </div>
  );
}
