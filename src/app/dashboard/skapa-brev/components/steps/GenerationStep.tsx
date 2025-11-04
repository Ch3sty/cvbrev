'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';

interface GenerationStepProps {
  isGenerating: boolean;
  generatedLetter: string | null;
  error: string | null;
}

/* ============================================
   ANIMATION CODE COMMENTED OUT FOR DEBUGGING

   All complex SVG mascot animations, particle effects,
   confetti, and stage progression have been temporarily
   removed to isolate React error #300.

   The original animation code with 5 SVG stages,
   particles, and effects has been saved in git history
   (commit 0cb9a82 and earlier).
   ============================================ */

export default function GenerationStep({
  isGenerating,
  generatedLetter,
  error
}: GenerationStepProps) {

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Något gick fel</h3>
        <p className="text-gray-600 mb-4">{error}</p>
      </div>
    );
  }

  if (generatedLetter) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ditt brev är klart!</h3>
        <p className="text-gray-600">
          Vi har skapat ett personligt brev optimerat för din ansökan
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <Loader2 className="w-20 h-20 text-pink-600 animate-spin" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Genererar ditt personliga brev...
      </h3>
      <p className="text-gray-600">
        Detta tar vanligtvis 10-15 sekunder
      </p>
    </div>
  );
}
