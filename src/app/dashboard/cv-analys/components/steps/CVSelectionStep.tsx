'use client';

import UnifiedCVSelector from '@/components/cv/unified-cv-selector';

interface CVSelectionStepProps {
  cvs: any[];
  selectedCV: string | null;
  onSelectCV: (cvId: string) => void;
}

export default function CVSelectionStep({ cvs, selectedCV, onSelectCV }: CVSelectionStepProps) {
  return (
    <UnifiedCVSelector
      selectedCV={selectedCV}
      onCVSelect={onSelectCV}
      variant="grid"
      showEmptyState={true}
    />
  );
}
