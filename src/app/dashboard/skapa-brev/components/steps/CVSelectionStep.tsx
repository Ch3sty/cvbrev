'use client';

import UnifiedCVSelector from '@/components/cv/unified-cv-selector';

interface CVSelectionStepProps {
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
  onCVUpload?: (file: File) => Promise<void>; // Deprecated - kept for backward compatibility
}

export default function CVSelectionStep({
  selectedCV,
  onCVSelect,
  onCVUpload // Ignored - no longer used
}: CVSelectionStepProps) {
  return (
    <UnifiedCVSelector
      selectedCV={selectedCV}
      onCVSelect={onCVSelect}
      variant="grid"
      showEmptyState={true}
    />
  );
}
