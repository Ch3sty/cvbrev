import OgFrame from '@/components/og-preview/OgFrame';
import {
  OgCvAnalysisIllustration,
  OgJobbmatchningIllustration,
  OgJobbcoachenIllustration,
  OgLinkedinIllustration,
  OgRekryteringstesterIllustration,
  OgCvMallarIllustration,
  OgPersonligtBrevIllustration,
  OgSkapaCvIllustration,
  OgArticlesListIllustration,
  OgExempelIllustration,
  OgHomeIllustration,
} from '@/components/og-preview/OgIllustrations';
import type { ReactNode } from 'react';

// Legacy-variants (exempel-sidor)
const LEGACY_VARIANTS: Array<{
  variant: 'letter' | 'cv';
  yrke: string;
  label: string;
}> = [
  { variant: 'letter', yrke: 'Sjuksköterska', label: 'Brev — Sjuksköterska' },
  { variant: 'letter', yrke: 'IT-konsult', label: 'Brev — IT-konsult' },
  { variant: 'cv', yrke: 'Sjuksköterska', label: 'CV — Sjuksköterska' },
  { variant: 'cv', yrke: 'IT-konsult', label: 'CV — IT-konsult' },
];

// Custom variants (verktyg, hub-sidor)
interface CustomVariant {
  label: string;
  category: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  illustration: ReactNode;
}

const CUSTOM_VARIANTS: CustomVariant[] = [
  {
    label: 'Hem (/)',
    category: 'Marketing',
    eyebrow: 'Jobbcoach.ai',
    title: 'Bygg en ansökan som blir läst',
    subtitle: 'CV · Brev · Matchning · Tester',
    illustration: <OgHomeIllustration />,
  },
  {
    label: 'Artiklar (/artiklar)',
    category: 'Content',
    eyebrow: 'Karriärbiblioteket',
    title: 'Artiklar som tar dig vidare',
    subtitle: 'Tips, guider och insikter för din karriär',
    illustration: <OgArticlesListIllustration />,
  },
  {
    label: 'Exempel (/exempel)',
    category: 'Content',
    eyebrow: 'Inspiration',
    title: 'Färdiga exempel för 150+ yrken',
    subtitle: 'CV och personliga brev som imponerar',
    illustration: <OgExempelIllustration />,
  },
  {
    label: 'CV-mallar (/cv-mallar)',
    category: 'Verktyg',
    eyebrow: 'CV-mallar',
    title: 'Mallar för alla branscher',
    subtitle: '8+ designer · ATS-optimerat',
    illustration: <OgCvMallarIllustration />,
  },
  {
    label: 'CV-analys (/verktyg/cv-analys)',
    category: 'Verktyg',
    eyebrow: 'CV-analys',
    title: 'Förbättra ditt CV på 60 sek',
    subtitle: 'Konkret feedback — ingen gissning',
    illustration: <OgCvAnalysisIllustration />,
  },
  {
    label: 'Personligt brev (/verktyg/personligt-brev)',
    category: 'Verktyg',
    eyebrow: 'Personligt brev',
    title: 'Brev som matchar varje jobb',
    subtitle: 'Skräddarsydd ansökan på 60 sek',
    illustration: <OgPersonligtBrevIllustration />,
  },
  {
    label: 'Jobbcoachen (/verktyg/jobbcoachen)',
    category: 'Verktyg',
    eyebrow: 'Jobbcoachen',
    title: 'Karriärråd när du behöver det',
    subtitle: 'Lön · Intervju · Arbetsrätt · Tips',
    illustration: <OgJobbcoachenIllustration />,
  },
  {
    label: 'Jobbmatchning (/verktyg/jobbmatchning)',
    category: 'Verktyg',
    eyebrow: 'Jobbmatchning',
    title: 'Hitta jobb som matchar dig',
    subtitle: 'Vi matchar din profil mot tusentals annonser',
    illustration: <OgJobbmatchningIllustration />,
  },
  {
    label: 'LinkedIn-optimering (/verktyg/linkedin-optimering)',
    category: 'Verktyg',
    eyebrow: 'LinkedIn-optimering',
    title: 'Profilen rekryterare hittar',
    subtitle: 'Headline · About · Sökord',
    illustration: <OgLinkedinIllustration />,
  },
  {
    label: 'Rekryteringstester (/verktyg/rekryteringstester)',
    category: 'Verktyg',
    eyebrow: 'Rekryteringstester',
    title: 'Träna inför provet',
    subtitle: 'Matrislogik · Verbal · Numerisk',
    illustration: <OgRekryteringstesterIllustration />,
  },
  {
    label: 'Skapa CV (/verktyg/skapa-cv)',
    category: 'Verktyg',
    eyebrow: 'Skapa CV',
    title: 'Ditt CV på 60 sekunder',
    subtitle: 'Ladda upp eller börja från noll',
    illustration: <OgSkapaCvIllustration />,
  },
];

export default function OgPreviewPage() {
  return (
    <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 max-w-[1280px]">
      <div className="mb-6 sm:mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          Intern preview
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          OG-bild förhandsvisning
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
          Alla dynamiska OG-bilder i 1200×630-format (Open Graph-storlek).
          Genereras automatiskt vid build/deploy via Next.js
          ImageResponse — inga manuella bilder krävs.
        </p>
      </div>

      {/* Custom variants (nya) */}
      <h2 className="text-xl font-bold text-slate-900 mb-4 mt-2">
        Marketing & verktygssidor
      </h2>
      <div className="space-y-8 sm:space-y-10 mb-12">
        {CUSTOM_VARIANTS.map((v) => (
          <section key={v.label}>
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-[0.12em]">
                {v.category}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {v.label}
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">1200 × 630</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
              <div
                style={{
                  width: 1200,
                  height: 630,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <OgFrame
                  eyebrow={v.eyebrow}
                  title={v.title}
                  subtitle={v.subtitle}
                  illustration={v.illustration}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Legacy variants (exempel-sidor) */}
      <h2 className="text-xl font-bold text-slate-900 mb-4 mt-2">
        Exempel-sidor (per yrke)
      </h2>
      <div className="space-y-8 sm:space-y-10">
        {LEGACY_VARIANTS.map((v) => (
          <section key={v.label}>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-[0.12em]">
                {v.variant === 'letter' ? 'Brev' : 'CV'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {v.label}
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">1200 × 630</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
              <div
                style={{
                  width: 1200,
                  height: 630,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <OgFrame variant={v.variant} yrke={v.yrke} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-orange-50/60 border border-orange-100 text-sm text-slate-700">
        <strong className="font-semibold text-slate-900">Notering:</strong>{' '}
        Bilderna ovan visar exakt vad sociala medier (LinkedIn, X, Facebook) och
        Google ser när någon delar en länk. Bilderna genereras dynamiskt vid
        request via Next.js <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-orange-200 text-xs">opengraph-image.tsx</code>
        per route — inga manuella PNG-filer.
      </div>
    </div>
  );
}
