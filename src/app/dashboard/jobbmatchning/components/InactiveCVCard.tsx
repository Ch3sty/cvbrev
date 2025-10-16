'use client';

import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2 } from 'lucide-react';

interface InactiveCVCardProps {
  cv: {
    id: string;
    file_name: string;
    created_at: string;
  };
  onActivate: (cvId: string) => void;
  isActivating: boolean;
}

export default function InactiveCVCard({ cv, onActivate, isActivating }: InactiveCVCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <motion.button
      onClick={() => onActivate(cv.id)}
      disabled={isActivating}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="block w-full text-left"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Gradient Header */}
        <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2">
              <FileText className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Uppladdat {formatDate(cv.created_at)}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate">
            {cv.file_name}
          </h3>
        </div>

        {/* Action Area */}
        <div className="p-4 bg-slate-50/50">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
                <span>Aktiverar...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>Klicka för att aktivera</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
