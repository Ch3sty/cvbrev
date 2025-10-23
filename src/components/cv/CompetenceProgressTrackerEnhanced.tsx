// src/components/cv/CompetenceProgressTrackerEnhanced.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Loader2, Check, AlertTriangle, Clock, Target, BookOpen, X,
  Zap, Search, Brain, Sparkles, TrendingUp
} from 'lucide-react';

interface CompetenceProgressTrackerEnhancedProps {
  status: 'pending' | 'analyzing' | 'processing_gaps' | 'partial_complete' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  totalGaps?: number;
  processedGaps?: number;
  errorMessage?: string;
  onCancel?: () => void;
}

const CompetenceProgressTrackerEnhanced: React.FC<CompetenceProgressTrackerEnhancedProps> = ({
  status,
  progress,
  currentStep,
  totalGaps,
  processedGaps,
  errorMessage,
  onCancel
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Pulse animation when processing
  useEffect(() => {
    if (status === 'analyzing' || status === 'processing_gaps' || status === 'partial_complete') {
      const interval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Status configurations
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      message: 'Startar...',
      description: 'Förbereder din analys'
    },
    analyzing: {
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      message: 'Analyserar...',
      description: 'Går igenom ditt CV och målrollen'
    },
    processing_gaps: {
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      message: 'Söker kurser...',
      description: 'Hittar relevanta utbildningar för dig'
    },
    partial_complete: {
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      message: 'Fortsätter...',
      description: 'Söker fler kurser'
    },
    completed: {
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      message: 'Klart!',
      description: 'Dina rekommendationer är redo'
    },
    failed: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      message: 'Något gick fel',
      description: errorMessage || 'Analysen kunde inte slutföras'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Simplified step labels without AI buzzwords
  const steps = [
    {
      id: 'start',
      label: 'Startar',
      icon: Zap,
      completed: true,
      active: status === 'pending'
    },
    {
      id: 'analyze',
      label: 'Analyserar CV',
      icon: Search,
      completed: status !== 'pending',
      active: status === 'analyzing'
    },
    {
      id: 'gaps',
      label: 'Hittar kurser',
      icon: BookOpen,
      completed: ['processing_gaps', 'partial_complete', 'completed'].includes(status),
      active: status === 'processing_gaps' && processedGaps === 0
    },
    {
      id: 'courses',
      label: 'Väljer utbildningar',
      icon: Target,
      completed: status === 'completed',
      active: (status === 'processing_gaps' || status === 'partial_complete') && (processedGaps ?? 0) > 0
    },
    {
      id: 'done',
      label: 'Klar',
      icon: Check,
      completed: status === 'completed',
      active: false
    }
  ];

  // Time estimate
  const getTimeEstimate = () => {
    if (status === 'completed' || status === 'failed') return null;

    if (status === 'analyzing') {
      return 'Analyserar (10-20 sekunder)';
    }

    if ((status === 'processing_gaps' || status === 'partial_complete') && totalGaps && processedGaps !== undefined) {
      const remaining = totalGaps - processedGaps;
      // Parallel processing: 4 workers processing ~5 gaps each
      // Each gap takes ~25s, but workers run in parallel
      // Effective time per gap: 25s / 4 workers = ~6-7s per gap
      const estimatedSeconds = Math.ceil(remaining * 7);
      if (estimatedSeconds < 60) {
        return `~${estimatedSeconds} sekunder kvar`;
      }
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `~${minutes} ${minutes === 1 ? 'minut' : 'minuter'} kvar`;
    }

    return 'Beräknar tid...';
  };

  // Detail message for current processing
  const getDetailMessage = () => {
    if ((status === 'processing_gaps' || status === 'partial_complete') && currentStep) {
      const match = currentStep.match(/"([^"]+)"/);
      if (match) {
        return `Söker kurser för: ${match[1]}`;
      }
    }
    return currentStep;
  };

  return (
    <div className="w-full">
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 ${
            pulseAnimation ? 'opacity-30' : 'opacity-10'
          } transition-opacity duration-2000`} />
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${config.bgColor}/20 ${
                status === 'analyzing' || status === 'processing_gaps' ? 'animate-pulse' : ''
              }`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {config.message}
                  {(status === 'analyzing' || status === 'processing_gaps') && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                {getTimeEstimate() && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeEstimate()}
                  </p>
                )}
              </div>
            </div>
            {onCancel && status !== 'completed' && status !== 'failed' && (
              <button
                onClick={onCancel}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
                aria-label="Avbryt analys"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Enhanced step indicators */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <div className="relative mb-2">
                        {/* Glow effect for active step */}
                        {step.active && (
                          <div className="absolute inset-0 rounded-full bg-blue-500 blur-lg opacity-50 animate-pulse" />
                        )}
                        <div className={`
                          relative w-10 h-10 rounded-full flex items-center justify-center transition-all
                          ${step.completed
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-100'
                            : step.active
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-110'
                            : 'bg-gray-200 text-gray-500 border border-gray-300'}
                          ${step.active ? 'animate-pulse' : ''}
                        `}>
                          {step.completed && !step.active ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <span className={`
                        text-xs transition-colors text-center px-1
                        ${step.completed
                          ? 'text-green-400'
                          : step.active
                          ? 'text-blue-400 font-semibold'
                          : 'text-gray-500'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center flex-1 pb-6">
                        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden mx-2">
                          <div className={`
                            h-full transition-all duration-500 rounded-full
                            ${step.completed
                              ? 'bg-gradient-to-r from-green-500 to-green-400 w-full'
                              : step.active
                              ? 'bg-gradient-to-r from-blue-500 to-blue-400 w-1/2'
                              : 'bg-gray-200 w-0'}
                          `} />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Totalt framsteg</span>
              <span className={`text-sm font-bold ${
                status === 'completed' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {animatedProgress}%
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              {/* Animated stripes for active processing */}
              {(status === 'analyzing' || status === 'processing_gaps') && (
                <div className="absolute inset-0 opacity-20">
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
                </div>
              )}
              <div
                className={`h-full ${config.bgColor} transition-all duration-700 ease-out rounded-full relative overflow-hidden`}
                style={{ width: `${animatedProgress}%` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* Detailed progress for gap processing */}
          {status === 'processing_gaps' && totalGaps && processedGaps !== undefined && (
            <div className="bg-gray-50 backdrop-blur rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-gray-900 font-medium">
                    Kurssökning
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {processedGaps} av {totalGaps} klara
                </span>
              </div>

              {/* Mini progress bar for gaps */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(processedGaps / totalGaps) * 100}%` }}
                />
              </div>

              {getDetailMessage() && (
                <p className="text-xs text-gray-600 mt-3 italic truncate">
                  {getDetailMessage()}
                </p>
              )}
            </div>
          )}

          {/* Error display */}
          {status === 'failed' && errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Fel uppstod</p>
                  <p className="text-xs text-red-300/80 mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success animation */}
          {status === 'completed' && (
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Klart! Dina rekommendationer visas nedan</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetenceProgressTrackerEnhanced;