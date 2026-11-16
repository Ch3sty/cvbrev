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

import { nedladdningsFelForStatus, nedladdningsFelForUndantag } from '@/lib/cv/nedladdningsFel';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNotification } from '@/context/notificationcontext';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { requestInstallPrompt } from '@/lib/pwa/installPrompt';
import StatusRow from '@/components/shell/StatusRow';
import GraValSheet from '@/components/paywall/GraValSheet';
import type { Feature, Scope } from '@/lib/access/features';
import type { PaywallVariant } from '@/components/paywall/paywall-copy';
import type { BetalvaggPlats } from '@/lib/analytics/events';
import type { PlanKey } from '@/lib/plans/plans';
import { mallHuvud } from '@/lib/onboarding/paket-rader';
import { arNamnKravs, kastaOmNamnKravs } from '@/lib/cv/namnKravs';
import NameRequiredNotice from '@/components/shared/NameRequiredNotice';

import CvMallarLayout from './components/CvMallarLayout';
import CvMallarHero from './components/CvMallarHero';
import MallarLivePreview, { type GenereraParams } from './components/MallarLivePreview';
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

/** Betalväggarna i CV-mallarna: varianten, featuren den spärrar och platsen. */
type Sparr = 'mall' | 'cv-export-word' | 'cv-export';
const SPARR: Record<Sparr, { feature: Feature; plats: BetalvaggPlats }> = {
  mall: { feature: 'cv_templates_all', plats: 'mall' },
  'cv-export-word': { feature: 'cv_export_word', plats: 'cv_export_word' },
  'cv-export': { feature: 'cv_export', plats: 'cv_export' },
};
/** 402-svarets feature till väggen, om servern spärrar fast klienten inte gjorde det. */
const SPARR_FOR_FEATURE: Partial<Record<string, Sparr>> = {
  cv_templates_all: 'mall',
  cv_export_word: 'cv-export-word',
  cv_export: 'cv-export',
};

/**
 * Filnamnet: mallens namn och CV:ts namn, små bokstäver och bindestreck
 * (skissen, avsnitt 5): cv-norrsken-erik-lindberg.docx.
 */
function filnamnsdel(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


export default function CvMallarClient({
  initialCvs,
  initialIsPremium,
  initialSelectedCvId,
  harWord = false,
  gratisAnvand = false,
  scope = null,
  track = null,
  planKey = null,
}: {
  initialCvs: InitialCv[];
  initialIsPremium: boolean;
  initialSelectedCvId: string | null;
  /** Kontot har Word-filen (cv_export_word). */
  harWord?: boolean;
  /** Gratisnedladdningen är använd och kontot saknar cv_export. */
  gratisAnvand?: boolean;
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
  const [sparr, setSparr] = useState<Sparr | null>(null);
  // Filnamnet på den senaste Word-filen, för bekräftelsen under knappen.
  const [wordKlar, setWordKlar] = useState<string | null>(null);
  // Det senaste valet, så att felläget kan försöka igen eller byta till PDF.
  const [senaste, setSenaste] = useState<GenereraParams | null>(null);
  const [bytCv, setBytCv] = useState(false);
  // 422 name_required: valet sparas så att nedladdningen fortsätter när
  // namnet är sparat (NameRequiredNotice).
  const [namnFor, setNamnFor] = useState<Parameters<typeof handleGenerateCV>[0] | null>(null);

  const isPremium = initialIsPremium;
  const huvud = mallHuvud(scope);

  // Betalväggen för Premium. En befintlig spårkund får samma vägg; knappen
  // går då till prenumerationssidan (spec-rummen 17.5).
  const handleUpgradeClick = () => setSparr('mall');

  const handleGenerateCV = async (params: GenereraParams) => {
    if (!selectedCV) return;

    const template = getTemplateById(params.templateId);
    const somWord = params.format === 'docx';
    // Spärrarna i samma ordning som servern: Word, mallen, gratisnedladdningen.
    if (somWord && !harWord) {
      setSparr('cv-export-word');
      return;
    }
    if (template?.tier === 'premium' && !isPremium) {
      handleUpgradeClick();
      return;
    }
    if (gratisAnvand) {
      setSparr('cv-export');
      return;
    }

    setGenerationError(null);
    setWordKlar(null);
    setSenaste(params);
    setIsGenerating(true);

    try {
      const fileName = `cv-${filnamnsdel(template?.name ?? params.templateId)}-${filnamnsdel(selectedCV.file_name.replace(/\.[^/.]+$/, ''))}.${somWord ? 'docx' : 'pdf'}`;

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
          format: somWord ? 'docx' : 'pdf',
          templateOptions,
          fontFamily: params.fontFamily,
          // Word-filen tar typsnittet som id; servern godtar bara Word-typsnitt.
          fontId: somWord ? params.wordFontId : params.fontId,
        }),
      });

      await kastaOmNamnKravs(response);
      // Servern spärrade fast klienten inte gjorde det (gammalt läge i
      // fliken): visa betalväggen, aldrig ett fel.
      if (response.status === 402) {
        const sparrBody = await response.json().catch(() => ({}));
        setIsGenerating(false);
        setSparr(SPARR_FOR_FEATURE[sparrBody?.feature] ?? 'cv-export');
        return;
      }
      if (!response.ok) {
        throw new Error(nedladdningsFelForStatus(response.status));
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
      if (somWord) setWordKlar(fileName);

      successWithMascotAndActivity(
        somWord
          ? 'Vi har gjort en Word-fil av ditt CV. Den är nedladdad till din enhet.'
          : 'Vi har gjort en PDF av ditt CV. Den är nedladdad till din enhet.',
        'cv-template-generated',
        'cv_generated',
        'skapade ett professionellt CV',
        {
          template: params.templateId,
          font: somWord ? params.wordFontId : params.fontId,
          format: somWord ? 'docx' : 'pdf',
          cv_id: selectedCV.id,
          file_name: fileName,
        },
        5000
      );

      requestInstallPrompt('cv_template_downloaded');
    } catch (error: any) {
      if (arNamnKravs(error)) {
        setIsGenerating(false);
        setNamnFor(params);
        return;
      }
      console.error('Fel vid CV-skapande:', error);
      setGenerationError(nedladdningsFelForUndantag(error));
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
          harWord={harWord}
          gratisAnvand={gratisAnvand}
          isGenerating={isGenerating}
          onGenerate={handleGenerateCV}
          onUpgrade={handleUpgradeClick}
          onWordLast={() => setSparr('cv-export-word')}
          onExportLast={() => setSparr('cv-export')}
          wordKlar={wordKlar}
          onCvKontaktSparad={(cv) => setNyStrukturerad((prev) => ({ ...prev, [cv.id]: cv.structured_data }))}
        />
        {namnFor ? (
          <NameRequiredNotice
            className="mt-4"
            onSaved={() => {
              const p = namnFor;
              setNamnFor(null);
              void handleGenerateCV(p);
            }}
          />
        ) : null}
      </section>

      {sparr ? (
        <GraValSheet
          open
          onClose={() => setSparr(null)}
          feature={SPARR[sparr].feature}
          variant={sparr as PaywallVariant}
          scope={scope}
          track={track}
          planKey={planKey}
          surface="/dashboard/cv-mallar"
          plats={SPARR[sparr].plats}
        />
      ) : null}

      {isGenerating && (
        <CvGenerationOverlay
          isOpen
          isError={!!generationError}
          errorMessage={generationError || undefined}
          format={senaste?.format ?? 'pdf'}
          onClose={() => {
            setIsGenerating(false);
            setGenerationError(null);
          }}
          onRetry={
            senaste
              ? () => {
                  setGenerationError(null);
                  void handleGenerateCV(senaste);
                }
              : undefined
          }
          onPdfIstallet={
            senaste
              ? () => {
                  setGenerationError(null);
                  void handleGenerateCV({ ...senaste, format: 'pdf' });
                }
              : undefined
          }
        />
      )}
    </CvMallarLayout>
    </>
  );
}
