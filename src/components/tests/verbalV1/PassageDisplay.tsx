import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface PassageDisplayProps {
  title: string;
  text: string;
  passageNumber: number;
  totalPassages: number;
  difficulty: 1 | 2 | 3;
  topic: string;
}

export function PassageDisplay({
  title,
  text,
  passageNumber,
  totalPassages,
  difficulty,
  topic
}: PassageDisplayProps) {
  const difficultyColors = {
    1: 'bg-green-100 text-green-700',
    2: 'bg-yellow-100 text-yellow-700',
    3: 'bg-orange-100 text-orange-700'
  };

  const difficultyLabels = {
    1: 'Lätt',
    2: 'Medel',
    3: 'Svår'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border-2 border-green-200 p-6 lg:p-8 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-600">
              Passage {passageNumber} av {totalPassages}
            </h3>
            <p className="text-xs text-slate-500">{topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[difficulty]}`}>
            {difficultyLabels[difficulty]}
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">
        {title}
      </h2>

      {/* Passage Text */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
          {text}
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </motion.div>
  );
}
