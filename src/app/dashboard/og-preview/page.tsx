import OgFrame from '@/components/og-preview/OgFrame';

const VARIANTS: Array<{ variant: 'letter' | 'cv'; yrke: string; label: string }> = [
  { variant: 'letter', yrke: 'Sjuksköterska', label: 'Brev — Sjuksköterska' },
  { variant: 'letter', yrke: 'IT-konsult', label: 'Brev — IT-konsult' },
  { variant: 'cv', yrke: 'Sjuksköterska', label: 'CV — Sjuksköterska' },
  { variant: 'cv', yrke: 'IT-konsult', label: 'CV — IT-konsult' },
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
          Fyra varianter i exakt 1200×630-format (Open Graph-storlek). Bilderna
          genereras dynamiskt per yrke när vi rullar ut — inga manuella bilder
          per yrke krävs.
        </p>
      </div>

      <div className="space-y-8 sm:space-y-10">
        {VARIANTS.map((v) => (
          <section key={v.label}>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold uppercase tracking-[0.12em]">
                {v.variant === 'letter' ? 'Brev' : 'CV'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {v.label}
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                1200 × 630
              </span>
            </div>

            {/* Skarp 1200x630-canvas (overflow-x-auto för mobilen) */}
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

        <div className="mt-8 p-4 rounded-2xl bg-orange-50/60 border border-orange-100 text-sm text-slate-700">
          <strong className="font-semibold text-slate-900">Notering:</strong>{' '}
          Detta är bara en intern förhandsvisning. Inga ändringar har gjorts på
          live. När du godkänt designen flyttar vi koden till
          <code className="mx-1 px-1.5 py-0.5 rounded bg-white border border-orange-200 text-xs">opengraph-image.tsx</code>
          per route så att alla 50+ brev-exempel och CV-exempel automatiskt får
          en unik OG-bild med sitt yrkesnamn.
        </div>
      </div>
    </div>
  );
}
