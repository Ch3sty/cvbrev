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
  { variant: 'letter', yrke: 'Sjuksköterska', label: 'Brev, Sjuksköterska' },
  { variant: 'letter', yrke: 'IT-konsult', label: 'Brev, IT-konsult' },
  { variant: 'cv', yrke: 'Sjuksköterska', label: 'CV, Sjuksköterska' },
  { variant: 'cv', yrke: 'IT-konsult', label: 'CV, IT-konsult' },
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
    subtitle: 'Konkret feedback, ingen gissning',
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
        <p className="mb-1.5 text-steg uppercase text-ink-3">Intern preview</p>
        <h1 className="text-h1 text-ink-1">OG-bild förhandsvisning</h1>
        <p className="mt-2 max-w-2xl text-sm leading-[22px] text-ink-2">
          Alla dynamiska OG-bilder i 1200×630-format (Open Graph-storlek).
          Genereras automatiskt vid build/deploy via Next.js
          ImageResponse, inga manuella bilder krävs.
        </p>
      </div>

      {/* Custom variants (nya) */}
      <h2 className="mb-4 mt-2 text-sm font-medium text-ink-3">
        Marketing & verktygssidor
      </h2>
      <div className="space-y-8 sm:space-y-10 mb-12">
        {CUSTOM_VARIANTS.map((v) => (
          <section key={v.label}>
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-1 text-meta text-ink-2">
                {v.category}
              </span>
              <h3 className="text-kort text-ink-1">
                {v.label}
              </h3>
              <span className="text-meta tabular-nums text-ink-3">1200 × 630</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-kant bg-insunken">
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
      <h2 className="mb-4 mt-2 text-sm font-medium text-ink-3">
        Exempel-sidor (per yrke)
      </h2>
      <div className="space-y-8 sm:space-y-10">
        {LEGACY_VARIANTS.map((v) => (
          <section key={v.label}>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-kant bg-panel px-2.5 py-1 text-meta text-ink-2">
                {v.variant === 'letter' ? 'Brev' : 'CV'}
              </span>
              <h3 className="text-kort text-ink-1">
                {v.label}
              </h3>
              <span className="text-meta tabular-nums text-ink-3">1200 × 630</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-kant bg-insunken">
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

      <div className="mt-8 rounded-xl border border-kant bg-panel p-4 text-sm leading-[22px] text-ink-2">
        <strong className="font-semibold text-ink-1">Notering:</strong>{' '}
        Bilderna ovan visar exakt vad sociala medier (LinkedIn, X, Facebook) och
        Google ser när någon delar en länk. Bilderna genereras dynamiskt vid
        request via Next.js <code className="mx-1 rounded border border-kant bg-insunken px-1.5 py-0.5 text-meta">opengraph-image.tsx</code>
        per route, inga manuella PNG-filer.
      </div>
    </div>
  );
}
