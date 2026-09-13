'use client';

import { useState } from 'react';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import TemplateSelector from '../TemplateSelector';
import TemplateInlineOptions from '../save/TemplateInlineOptions';
import SaveActionSegments, { type SaveChoice } from '../save/SaveActionSegments';
import CvFilenameInput from '../save/CvFilenameInput';
import QuotaWarningBanner from '../save/QuotaWarningBanner';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';
import { getTemplateById } from '@/lib/cv/simple-templates';
import { useProfile } from '@/hooks/use-profile';

interface SaveAndTemplateStepProps {
  improvedCV: string;
  saveChoice: SaveChoice | null;
  onChoiceChange: (choice: SaveChoice) => void;
  selectedTemplate: string | null;
  onTemplateChange: (templateId: string | null) => void;
  customName: string;
  onNameChange: (name: string) => void;
  isSaving: boolean;
}

export default function SaveAndTemplateStep({
  saveChoice,
  onChoiceChange,
  selectedTemplate,
  onTemplateChange,
  customName,
  onNameChange,
  isSaving,
}: SaveAndTemplateStepProps) {
  const { cvCount, maxCvs, canSave, subscriptionTier, loading } = useCvQuota();
  const { profile } = useProfile();
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);

  const nameSuggestions = generateCVNameSuggestions();
  const selectedTemplateData = selectedTemplate
    ? getTemplateById(selectedTemplate) || null
    : null;

  const userProfile = {
    hasPhoto: !!profile?.profile_photo_url,
    hasLinkedIn: !!profile?.linkedin_url,
  };

  const handleQuotaRefresh = () => setQuotaRefreshKey((prev) => prev + 1);
  const showFilenameInput =
    saveChoice === 'save' || saveChoice === 'save-and-download';

  if (loading) {
    return <LoadingSkeleton variant="card" label="Laddar mallar" />;
  }

  return (
    <div className="space-y-5">
      {/* MALL ÖVERST - huvudfokus */}
      <section className="overflow-hidden rounded-xl border border-kant bg-panel p-4 sm:p-5">
        <TemplateSelector
          selectedTemplateId={selectedTemplate}
          onSelectTemplate={onTemplateChange}
          subscriptionTier={subscriptionTier as 'free' | 'premium'}
        />

        {/* Inline-options under mallrutnätet */}
        {selectedTemplateData && (
          <div className="mt-4 border-t border-kant pt-4">
            <div className="mb-2 min-w-0">
              <p className="text-steg uppercase text-ink-3">Vald mall</p>
              <p className="truncate text-kort text-ink-1">
                {selectedTemplateData.name}
              </p>
            </div>
            <TemplateInlineOptions
              template={selectedTemplateData}
              userProfile={userProfile}
            />
          </div>
        )}
      </section>

      {/* Quota-warning om biblioteket fullt och man behöver det */}
      {!canSave && showFilenameInput && (
        <QuotaWarningBanner
          key={quotaRefreshKey}
          cvCount={cvCount}
          maxCvs={maxCvs}
          subscriptionTier={subscriptionTier as 'free' | 'premium'}
          onCVDeleted={handleQuotaRefresh}
        />
      )}

      {/* Spara-segments */}
      <SaveActionSegments
        value={saveChoice}
        onChange={onChoiceChange}
        canSave={canSave}
        cvCount={cvCount}
        maxCvs={maxCvs}
        disabled={isSaving}
      />

      {/* Filnamn (om relevant) */}
      {showFilenameInput && (
        <CvFilenameInput
          value={customName}
          onChange={onNameChange}
          suggestions={nameSuggestions}
        />
      )}
    </div>
  );
}
