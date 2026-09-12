import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressTrackerProps {
  totalQuestions: number;
  answeredQuestions: number;
}

export function ProgressTracker({
  totalQuestions,
  answeredQuestions
}: ProgressTrackerProps) {
  const percentage = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div className="bg-white rounded-xl border-2 border-green-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {answeredQuestions === totalQuestions ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-neutral-400" />
          )}
          <span className="text-sm font-semibold text-neutral-700">
            Framsteg
          </span>
        </div>
        <span className="text-lg font-bold text-green-600">
          {answeredQuestions}/{totalQuestions}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <p className="text-xs text-neutral-500 mt-2 text-center">
        {percentage}% besvarade
      </p>
    </div>
  );
}
