'use client';

/**
 * Steg 1: vilket CV ska brevet utgå från?
 *
 * FlowShell visar ett steg i taget, så det gamla hopfällda "Valt CV"-läget
 * behövs inte: det valda kortet bär sin bock, och Fortsätt ligger i foten.
 * Frågan som rubrik sätts av CreateLetterClient.
 */

import CvPickerGrid, { type PickerCv } from '../CvPickerGrid';

interface CVSelectionStepProps {
  /* CV-listan kommer server-hämtad från page.tsx. */
  cvs: PickerCv[];
  /** ID:n för CV som ligger utanför gratisgränsen och därför är låsta. */
  lockedCvIds: Set<string>;
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
  isActive: boolean;
  startCollapsed: boolean;
  onComplete: () => void;
  registerRef?: (el: HTMLElement | null) => void;
}

export default function CVSelectionStep({
  cvs,
  lockedCvIds,
  selectedCV,
  onCVSelect,
  onComplete,
  registerRef,
}: CVSelectionStepProps) {
  return (
    <section ref={registerRef} data-flow-section="cv">
      <CvPickerGrid
        cvs={cvs}
        lockedCvIds={lockedCvIds}
        selectedCV={selectedCV}
        onCVSelect={(cvId) => {
          onCVSelect(cvId);
          onComplete();
        }}
      />
    </section>
  );
}
