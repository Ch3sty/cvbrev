'use client';

import { useState } from 'react';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import SaveActionSegments, { type SaveChoice } from '../save/SaveActionSegments';
import CvFilenameInput from '../save/CvFilenameInput';
import QuotaWarningBanner from '../save/QuotaWarningBanner';
import { generateCVNameSuggestions } from '@/lib/cv/cvNameSuggestions';
import { useCvQuota } from '@/hooks/useCvQuota';

interface SaveAndTemplateStepProps {
  saveChoice: SaveChoice | null;
  onChoiceChange: (choice: SaveChoice) => void;
  /** Det analyserade CV:ts namn. */
  cvNamn?: string | null;
  customName: string;
  onNameChange: (name: string) => void;
  isSaving: boolean;
}

/**
 * Slutsteget (CV-rummet steg 4, byggspecen avsnitt 8): spara det förbättrade
 * CV:t som nytt eller ersätt det analyserade. Mallval och nedladdning sker
 * sedan i Mallar, dit flödet går efter sparandet: där finns spärrarna,
 * merförsäljningen och målgången som galleriet har (rättar fynd 1 och 2).
 *
 * Vid fullt bibliotek är "Spara som nytt CV" spärrat, men "Ersätt" kräver
 * ingen ny plats: det finns alltid en väg utan köp.
 */
export default function SaveAndTemplateStep({
  saveChoice,
  onChoiceChange,
  cvNamn = null,
  customName,
  onNameChange,
  isSaving,
}: SaveAndTemplateStepProps) {
  const { cvCount, maxCvs, canSave, subscriptionTier, loading } = useCvQuota();
  const [quotaRefreshKey, setQuotaRefreshKey] = useState(0);

  const nameSuggestions = generateCVNameSuggestions();

  if (loading) {
    return <LoadingSkeleton variant="card" label="Laddar" />;
  }

  return (
    <div className="space-y-5">
      <SaveActionSegments
        value={saveChoice}
        onChange={onChoiceChange}
        canSave={canSave}
        cvCount={cvCount}
        maxCvs={maxCvs}
        disabled={isSaving}
        cvNamn={cvNamn}
      />

      {/* Fullt bibliotek: dagens panel för att ta bort ett gammalt CV. */}
      {!canSave && (
        <QuotaWarningBanner
          key={quotaRefreshKey}
          cvCount={cvCount}
          maxCvs={maxCvs}
          subscriptionTier={subscriptionTier as 'free' | 'premium'}
          onCVDeleted={() => setQuotaRefreshKey((k) => k + 1)}
        />
      )}

      {saveChoice === 'nytt' && (
        <CvFilenameInput value={customName} onChange={onNameChange} suggestions={nameSuggestions} />
      )}
    </div>
  );
}
