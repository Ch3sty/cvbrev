'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useNotification } from '@/context/notificationcontext';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { requestInstallPrompt } from '@/lib/pwa/installPrompt';

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
}: {
  initialCvs: InitialCv[];
  initialIsPremium: boolean;
  initialSelectedCvId: string | null;
}) {
  const router = useRouter();
  const { successWithMascotAndActivity } = useNotification();

  // Valet bor i sidan, inte i cv-storen. Servern har redan avgjort vilket CV
  // som ska vara valt (från ?cv= eller det senaste), så första målningen har
  // rätt CV utan en effekt som hinner byta höjd på väljaren efteråt.
  const [selectedCvId, setSelectedCvId] = useState<string | null>(initialSelectedCvId);
  const selectedCV = useMemo(
    () => initialCvs.find((cv) => cv.id === selectedCvId) ?? null,
    [initialCvs, selectedCvId]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const isPremium = initialIsPremium;

  const handleUpgradeClick = () => {
    router.push('/dashboard/profil/prenumeration');
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

      // Anvand features fran mall-registret for att avgora vilka toggles som
      // ska skickas. Mallar utan stOd far inte options-falt sa generators
      // anvander default-beteende.
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
          // Skicka pre-parsed structured_data om finns (matchar preview exakt)
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

      // Frågan om hemskärmen (docs/plan-pwa.md). PDF:en ligger på enheten,
      // så handlingen är avslutad och raden avbryter ingenting. Reglerna för
      // om frågan får visas ligger i storen, inte här.
      requestInstallPrompt('cv_template_downloaded');
    } catch (error: any) {
      console.error('Fel vid CV-skapande:', error);
      setGenerationError(error?.message || 'Något gick fel. Försök igen.');
      // LAmnar isGenerating=true sa error-vyn syns; stangs av onClose
    }
  };

  return (
    <CvMallarLayout>
      <CvMallarHero />

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

      {/* Live-preview-vy med mall-lista, toolbar, info, CTA */}
      <section data-flow-section="template">
        <MallarLivePreview
          selectedCV={selectedCV}
          isPremium={isPremium}
          isGenerating={isGenerating}
          onGenerate={handleGenerateCV}
          onUpgrade={handleUpgradeClick}
        />
      </section>

      {/* Generation overlay */}
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
