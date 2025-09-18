// src/components/cv/CompetenceProgressTracker.tsx
'use client';

import React from 'react';
import { Loader2, Check, AlertTriangle, Clock, Target, BookOpen, X } from 'lucide-react';

interface CompetenceProgressTrackerProps {
  status: 'pending' | 'analyzing' | 'processing_gaps' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  totalGaps?: number;
  processedGaps?: number;
  errorMessage?: string;
  onCancel?: () => void;
}

const CompetenceProgressTracker: React.FC<CompetenceProgressTrackerProps> = ({
  status,
  progress,
  currentStep,
  totalGaps,
  processedGaps,
  errorMessage,
  onCancel
}) => {
  // Progress bar colors based on status
  const getProgressColor = () => {
    if (status === 'failed') return 'bg-red-500';
    if (status === 'completed') return 'bg-green-500';
    if (status === 'processing_gaps') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // Status icon
  const StatusIcon = () => {
    if (status === 'failed') return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (status === 'completed') return <Check className="w-6 h-6 text-green-500" />;
    if (status === 'analyzing') return <Target className="w-6 h-6 text-blue-500 animate-pulse" />;
    if (status === 'processing_gaps') return <BookOpen className="w-6 h-6 text-yellow-500 animate-pulse" />;
    return <Clock className="w-6 h-6 text-gray-500" />;
  };

  // Time estimate based on gaps
  const getTimeEstimate = () => {
    if (status === 'completed' || status === 'failed') return null;
    if (totalGaps && processedGaps !== undefined) {
      const remaining = totalGaps - processedGaps;
      const estimatedSeconds = remaining * 15; // ~15 seconds per gap
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `~${minutes} ${minutes === 1 ? 'minut' : 'minuter'} kvar`;
    }
    return 'Beräknar tid...';
  };

  // Step descriptions
  const getStepDescription = () => {
    if (status === 'pending') return 'Förbereder analys...';
    if (status === 'analyzing') return 'Analyserar ditt CV mot målrollen...';
    if (status === 'processing_gaps') {
      if (totalGaps && processedGaps !== undefined) {
        return `Söker utbildningar för identifierade kompetensgap (${processedGaps}/${totalGaps})`;
      }
      return 'Söker relevanta utbildningsresurser...';
    }
    if (status === 'completed') return 'Analys klar! Resultat redo att visas.';
    if (status === 'failed') return errorMessage || 'Analysen misslyckades';
    return currentStep || 'Bearbetar...';
  };

  // Progress steps visualization
  const steps = [
    { id: 'start', label: 'Start', completed: true },
    { id: 'analyze', label: 'CV-analys', completed: status !== 'pending' },
    { id: 'gaps', label: 'Hitta gap', completed: status === 'processing_gaps' || status === 'completed' },
    { id: 'courses', label: 'Sök kurser', completed: status === 'completed' },
    { id: 'done', label: 'Klar', completed: status === 'completed' }
  ];

  return (
    <div className="w-full p-6 bg-navy-800 rounded-lg border border-navy-700">
      {/* Header with status icon and title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <StatusIcon />
          <div>
            <h3 className="text-lg font-semibold text-white">
              {status === 'completed' ? 'Analys genomförd!' : 'Analyserar kompetensmatchning'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{getStepDescription()}</p>
          </div>
        </div>
        {onCancel && status !== 'completed' && status !== 'failed' && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
            aria-label="Avbryt analys"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Visual step progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                ${step.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-navy-700 text-gray-400 border border-navy-600'}
              `}>
                {step.completed ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  h-1 w-full mx-2
                  ${step.completed ? 'bg-green-500' : 'bg-navy-700'}
                `} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          {steps.map((step) => (
            <span key={step.id} className="text-center">{step.label}</span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm font-semibold text-white">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-navy-900 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Additional info */}
      {status === 'processing_gaps' && totalGaps && processedGaps !== undefined && (
        <div className="bg-navy-900/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              <span className="text-sm text-gray-300">
                Bearbetar kompetensgap {processedGaps} av {totalGaps}
              </span>
            </div>
            {getTimeEstimate() && (
              <span className="text-xs text-gray-400">{getTimeEstimate()}</span>
            )}
          </div>
          {currentStep && (
            <p className="text-xs text-gray-500 mt-2 italic">{currentStep}</p>
          )}
        </div>
      )}

      {/* Error message */}
      {status === 'failed' && errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Loading animation for active processing */}
      {(status === 'analyzing' || status === 'processing_gaps') && (
        <div className="flex justify-center py-2">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetenceProgressTracker;