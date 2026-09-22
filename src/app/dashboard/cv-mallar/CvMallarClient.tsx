'use client';

/**
 * CV-mallarnas klientdel.
 *
 * Paketets gräns syns här, där den är (spec-onboarding 2026-09-22, sektion
 * 3): utanför CV-veckan och Allt är mall 4 till 41 gråa med lås, går att
 * förhandsvisa i full storlek men inte ladda ned, och trycket på
 * nedladdningen öppnar betalväggen för rätt paket med mellanskillnaden.
 * Testveckans kund får fotknapparna "Byt till CV-veckan" och "Eller Allt
 * för 20 kr till i veckan". Talen kommer ur mallregistret och prislistan.
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
import { ellerAlltKnapp, laggTillKnapp, mallHuvud } from '@/lib/onboarding/paket-rader';

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

const KNAPP_PRIMAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40';
const KNAPP_SEKUNDAR =
  'inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-semibold text-ink-1 transition-colors hover:bg-insunken disabled:opacity-40';

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
  const selectedCV = useMemo(
    () => initialCvs.find((cv) => cv.id === selectedCvId) ?? null,
    [initialCvs, selectedCvId]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [sparrOppen, setSparrOppen] = useState(false);
  const [busy, setBusy] = useState<PlanKey | null>(null);

  const isPremium = initialIsPremium;
  const huvud = mallHuvud(scope);
  const alltKnapp = ellerAlltKnapp(planKey);

  // Betalväggen för rätt paket, med mellanskillnaden om hon har ett spår.
  const handleUpgradeClick = () => setSparrOppen(true);

  const uppgradera = async (plan: PlanKey) => {
    if (busy) return;
    setBusy(plan);
    try {
      const res = await fetch('/api/stripe/create-upgrade-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: plan, returnPath: '/dashboard/cv-mallar' }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.url) {
        window.location.href = json.url as string;
        return;
      }
    } catch {
      /* knappen blir tryckbar igen */
    }
    setBusy(null);
  };

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
    <CvMallarLayout>
      <CvMallarHero />

      {/* Paketets gräns: vad som ingår, var resten finns, och att gråa
          mallar går att förhandsvisa. Bara utanför CV-veckan och Allt. */}
      {huvud ? (
        <section className="space-y-2" aria-label="Ditt paket">
          <StatusRow tone="neutral" showDot>
            {huvud.statusrad}
          </StatusRow>
          <p className="text-kort text-ink-1">{huvud.rubrik}</p>
          <p className="text-meta text-ink-3">{huvud.not}</p>
        </section>
      ) : null}

      {/* Steg 1: Valj CV */}
      <section data-flow-section="cv">
        <StepHeader
          number={1}
          title="Välj vilket CV du vill använda"
          description="Vi använder innehållet från CV:t i mallen du väljer i nästa steg."
        />
        <CompactCvPicker
          cvs={initialCvs}
          selectedCV={selectedCvId}
          onCVSelect={setSelectedCvId}
        />
      </section>

      <section data-flow-section="template">
        <MallarLivePreview
          selectedCV={selectedCV}
          isPremium={isPremium}
          isGenerating={isGenerating}
          onGenerate={handleGenerateCV}
          onUpgrade={handleUpgradeClick}
        />
      </section>

      {/* Foten för Testveckans kund (sektion 3). */}
      {scope === 'tester' ? (
        <div className="grid gap-2 rounded-xl border border-kant bg-panel p-4">
          <button
            type="button"
            onClick={() => uppgradera('cv_week')}
            disabled={busy !== null}
            className={KNAPP_PRIMAR}
          >
            {busy === 'cv_week' ? 'Öppnar' : laggTillKnapp('cv_week')}
          </button>
          {alltKnapp ? (
            <button
              type="button"
              onClick={() => uppgradera('all_week')}
              disabled={busy !== null}
              className={KNAPP_SEKUNDAR}
            >
              {busy === 'all_week' ? 'Öppnar' : alltKnapp}
            </button>
          ) : null}
        </div>
      ) : null}

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
  );
}
