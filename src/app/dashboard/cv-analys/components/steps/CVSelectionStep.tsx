'use client';

import { motion } from 'framer-motion';
import { FileText, Check, Upload, Target, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CVSelectionStepProps {
  cvs: any[];
  selectedCV: string | null;
  onSelectCV: (cvId: string) => void;
}

export default function CVSelectionStep({ cvs, selectedCV, onSelectCV }: CVSelectionStepProps) {
  if (cvs.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga CV uppladdade</h3>
        <p className="text-gray-600 mb-6">Ladda upp ditt första CV för att komma igång</p>
        <Link
          href="/profile?tab=cv"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Upload className="w-5 h-5 mr-2" />
          Ladda upp CV
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Välj ditt CV</h2>
        <p className="text-gray-600">Välj vilket CV du vill analysera och förbättra</p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        {[
          { icon: Target, text: 'ATS-optimering', color: 'text-green-600' },
          { icon: BarChart3, text: 'Poängbedömning', color: 'text-blue-600' },
          { icon: Sparkles, text: 'Förbättringar', color: 'text-purple-600' }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center p-3 bg-gray-50 rounded-lg"
          >
            <feature.icon className={`w-6 h-6 ${feature.color} mb-2`} />
            <span className="text-xs text-gray-600 text-center">{feature.text}</span>
          </motion.div>
        ))}
      </div>

      {/* CV Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cvs.map((cv, index) => {
          const isSelected = selectedCV === cv.id;

          return (
            <motion.button
              key={cv.id}
              onClick={() => onSelectCV(cv.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${isSelected
                  ? 'border-pink-500 bg-pink-50/50 ring-4 ring-pink-500/20 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}

              {/* CV Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600'
                  : 'bg-gray-100'
              }`}>
                <FileText className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              </div>

              {/* CV Info */}
              <h3 className={`font-semibold mb-1 truncate ${
                isSelected ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {cv.file_name}
              </h3>

              <p className="text-xs text-gray-500 mb-3">
                Uppladdad {new Date(cv.created_at).toLocaleDateString('sv-SE')}
              </p>

              {/* Preview */}
              {cv.cv_text && (
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {cv.cv_text.substring(0, 100)}...
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-2 text-xs">
                {cv.ats_score && (
                  <div className={`px-2 py-1 rounded ${
                    cv.ats_score >= 80
                      ? 'bg-green-100 text-green-700'
                      : cv.ats_score >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    ATS: {cv.ats_score}%
                  </div>
                )}
                {cv.last_analyzed && (
                  <div className="text-gray-500">
                    Senast analyserad
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Add CV Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-center"
      >
        <Link
          href="/profile?tab=cv"
          className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
        >
          <Upload className="w-4 h-4 mr-2" />
          Ladda upp ett nytt CV
        </Link>
      </motion.div>
    </div>
  );
}
