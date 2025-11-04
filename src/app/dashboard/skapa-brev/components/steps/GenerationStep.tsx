'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface GenerationStepProps {
  isGenerating: boolean;
  generatedLetter: string | null;
  error: string | null;
}

const mascotStages = [
  {
    image: '/images/maskot/personligt-brev-1.svg',
    text: 'Analyserar ditt CV'
  },
  {
    image: '/images/maskot/personligt-brev-2.svg',
    text: 'Extraherar nyckelkompetenser'
  },
  {
    image: '/images/maskot/personligt-brev-3.svg',
    text: 'Matchar mot jobbkrav'
  },
  {
    image: '/images/maskot/personligt-brev-4.svg',
    text: 'Genererar personligt brev'
  },
  {
    image: '/images/maskot/personligt-brev-5.svg',
    text: 'Optimerar för ATS'
  }
];

export default function GenerationStep({
  isGenerating,
  generatedLetter,
  error
}: GenerationStepProps) {
  const [currentStage, setCurrentStage] = useState(0);

  // Cycle through stages while generating
  useEffect(() => {
    // Stop animation only when letter is ready
    if (generatedLetter) {
      return;
    }

    // Start interval immediately when component mounts
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        const next = prev + 1;
        // Stop at last stage instead of looping back to 0
        return next >= mascotStages.length ? mascotStages.length - 1 : next;
      });
    }, 2500); // Change stage every 2.5 seconds

    return () => clearInterval(interval);
  }, [generatedLetter]); // Only depend on generatedLetter

  // Error state
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

  // Success state
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

  // Generating state - Show current stage
  const stage = mascotStages[currentStage];

  return (
    <div className="text-center py-12">
      {/* SVG Mascot */}
      <div className="w-48 h-48 mx-auto mb-6 relative">
        <Image
          src={stage.image}
          alt={stage.text}
          width={192}
          height={192}
          unoptimized
          className="w-full h-full object-contain"
        />
      </div>

      {/* Stage text */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        {stage.text}
      </h3>

      {/* Spinner */}
      <div className="flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
      </div>

      <p className="text-gray-600">
        Detta tar vanligtvis 10-15 sekunder
      </p>

      {/* Stage indicators */}
      <div className="flex gap-2 mt-8 justify-center">
        {mascotStages.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-12 rounded-full transition-all duration-300 ${
              index === currentStage
                ? 'bg-pink-600'
                : index < currentStage
                ? 'bg-pink-300'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
