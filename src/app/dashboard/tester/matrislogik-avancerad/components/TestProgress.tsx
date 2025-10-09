'use client';

import React from 'react';

interface TestProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  currentQuestion,
  totalQuestions,
}) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700">
          Fråga {currentQuestion} av {totalQuestions}
        </span>
        <span className="text-sm font-semibold text-purple-600">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
