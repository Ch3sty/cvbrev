'use client';

/**
 * CV-mallarnas klientdel.
 *
 * Gränsen syns här, där den är (spec-onboarding 2026-09-22, sektion 3, med
 * ägarens beslut 2026-10-11): utan mallarna är mall 4 till 41 gråa med
 * bricka, går att förhandsvisa i full storlek men inte ladda ned, och
 * trycket på nedladdningen öppnar betalväggen för Premium. Ett köp, inga
 * spår och inga sidbyten. Talen kommer ur mallregistret och prislistan.
 */

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNotification } from '@/context/notificationcontext';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { requestInstallPrompt } from '@/lib/pwa/installPrompt';
import StatusRow from '@/components/shell/StatusRow';
import GraValSheet from '@/components/paywall/GraValSheet';
import type { Scope } from '@/lib/access/features';
import type { PlanKey } from '@/lib/plans/plans';
import { mallHuvud } from '@/lib/onboarding/paket-rader';

import CvMallarLayout from './components/CvMallarLayout';
import CvMallarHero from './components/CvMallarHero';
import MallarLivePreview from './components/MallarLivePreview';
import CompactCvPicker from './components/CompactCvPicker';
import StepHeader from './components/StepHeader';

export interface InitialCv {
  id: string;
  user_id: string;
  file_name: string;
  original_file_path: string;
  cv_text: string;
  created_at: string;
  structured_data: any;
}

// Overlayen ligger bakom en knapptryckning och syns aldrig i första vyn.
const CvGenerationOverlay = dynamic(
  () => import('./components/CvGenerationOverlay'),
  { ssr: false }
);


export default function CvMallarClient({
  initialCvs,
  initialIsPremium,
  initialSelectedCvId,
  scope = null,
  track = null,
  planKey = null,
}: {
  initialCvs: InitialCv[];
  initialIsPremium: boolean;
  initialSelectedCvId: string | null;
  scope?: Scope | null;
  track?: Scope | null;
  planKey?: PlanKey | null;
}) {
  const { successWithMascotAndActivity } = useNotification();

  const [selectedCvId, setSelectedCvId] = useState<string | null>(initialSelectedCvId);
  // structured_data som servern skrev om när kontaktuppgifterna sparades i
  // raden vid mallen (KontaktuppgifterRad). Läggs över serverlistan.
  const [nyStrukturerad, setNyStrukturerad] = useState<Record<string, unknown>>({});
  const selectedCV = useMemo(() => {
    const cv = initialCvs.find((c) => c.id === selectedCvId) ?? null;
    if (!cv || !(cv.id in nyStrukturerad)) return cv;
    return { ...cv, structured_data: nyStrukturerad[cv.id] };
  }, [initialCvs, selectedCvId, nyStrukturerad]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [sparrOppen, setSparrOppen] = useState(false);
  const [bytCv, setBytCv] = useState(false);

  const isPremium = initialIsPremium;
  const huvud = mallHuvud(scope);

  // Betalväggen för Premium (befintlig spårkund: FelSpar i arket).
  const handleUpgradeClick = () => setSparrOppen(true);

  const handleGenerateCV = async (params: {
    templateId: string;
    fontFamily: string;
    fontId: string;
    includePhoto: boolean;
    includeLinkedIn: boolean;
  }) => {
    if (!selectedCV) return;

    const template = getTemplateById(params.templateId);
    if (template?.tier === 'premium' && !isPremium) {
      handleUpgradeClick();
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);

    try {
      const fileName = `cv-${template?.name.toLowerCase().replace(/\s+/g, '-')}-${selectedCV.file_name.replace(/\.[^/.]+$/, '')}.pdf`;

      const supportsPhoto = template?.features?.supportsPhoto === true;
      const supportsLinkedIn = template?.features?.supportsLinkedIn === true;

      const templateOptions: { includePhoto?: boolean; includeLinkedIn?: boolean } = {};
      if (supportsPhoto) templateOptions.includePhoto = params.includePhoto;
      if (supportsLinkedIn) templateOptions.includeLinkedIn = params.includeLinkedIn;

      const response = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: params.templateId,
          structuredData: (selectedCV as any).structured_data || undefined,
          cvText: selectedCV.cv_text,
          format: 'pdf',
          templateOptions,
          fontFamily: params.fontFamily,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);

      successWithMascotAndActivity(
        'Vi har gjort en PDF av ditt CV. Den är nedladdad till din enhet.',
        'cv-template-generated',
        'cv_generated',
        'skapade ett professionellt CV',
        {
          template: params.templateId,
          font: params.fontId,
          cv_id: selectedCV.id,
          file_name: fileName,
        },
        5000
      );

      requestInstallPrompt('cv_template_downloaded');
    } catch (error: any) {
      console.error('Fel vid CV-skapande:', error);
      setGenerationError(error?.message || 'Något gick fel. Försök igen.');
    }
  };

  return (
    <>
    <CvMallarHero />
    <CvMallarLayout>

      {/* Gränsen: vad som ingår, att resten ingår i Premium, och att gråa
          mallar går att förhandsvisa. Bara för den som saknar mallarna. */}
      {huvud ? (
        <section className="space-y-2" aria-label={huvud.statusrad}>
          <StatusRow tone="neutral" showDot>
            {huvud.statusrad}
          </StatusRow>
          <p className="text-kort text-ink-1">{huvud.rubrik}</p>
          <p className="text-meta text-ink-3">{huvud.not}</p>
        </section>
      ) : null}

      {/* Steg 1 är en statusrad när ett CV redan är valt: det är gjort
          (analysen 22 september, avsnitt 4). "Byt" fäller ut väljaren. */}
      <section data-flow-section="cv">
        {selectedCV && !bytCv ? (
          <StatusRow
            tone="positive"
            showDot
            label="Steg 1 av 3, CV"
            action={
              <button
                type="button"
                onClick={() => setBytCv(true)}
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
              >
                Byt
              </button>
            }
          >
            Steg 1 av 3 · CV: {selectedCV.file_name.replace(/\.[^/.]+$/, '')}
          </StatusRow>
        ) : (
          <>
            <StepHeader number={1} title="Vilket CV?" description="Vi lägger innehållet från CV:t i mallen du väljer." />
            <CompactCvPicker
              cvs={initialCvs}
              selectedCV={selectedCvId}
              onCVSelect={(id) => {
                setSelectedCvId(id);
                setBytCv(false);
              }}
            />
          </>
        )}
      </section>

      <section data-flow-section="template">
        <MallarLivePreview
          selectedCV={selectedCV}
          isPremium={isPremium}
          isGenerating={isGenerating}
          onGenerate={handleGenerateCV}
          onUpgrade={handleUpgradeClick}
          onCvKontaktSparad={(cv) => setNyStrukturerad((prev) => ({ ...prev, [cv.id]: cv.structured_data }))}
        />
      </section>

      {sparrOppen ? (
        <GraValSheet
          open
          onClose={() => setSparrOppen(false)}
          feature="cv_templates_all"
          variant="mall"
          scope={scope}
          track={track}
          planKey={planKey}
          surface="/dashboard/cv-mallar"
          plats="mall"
        />
      ) : null}

      {isGenerating && (
        <CvGenerationOverlay
          isOpen
          isError={!!generationError}
          errorMessage={generationError || undefined}
          onClose={() => {
            setIsGenerating(false);
            setGenerationError(null);
          }}
        />
      )}
    </CvMallarLayout>
    </>
  );
}
