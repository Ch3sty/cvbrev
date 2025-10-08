'use client';

interface TestNavigationProps {
  totalQuestions: number;
  currentQuestion: number;
  answeredQuestions: Set<number>;
  onNavigate: (index: number) => void;
}

export function TestNavigation({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onNavigate
}: TestNavigationProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Navigering</h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isAnswered = answeredQuestions.has(i);
          const isCurrent = i === currentQuestion;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${isCurrent ? 'ring-2 ring-indigo-600 scale-110' : ''}
                ${isAnswered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}
                hover:shadow-md hover:scale-105
              `}
              aria-label={`Fråga ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="text-xs text-gray-600 pt-2 border-t">
        <div className="flex justify-between">
          <span>Besvarade:</span>
          <span className="font-semibold">{answeredQuestions.size}/{totalQuestions}</span>
        </div>
      </div>
    </div>
  );
}
