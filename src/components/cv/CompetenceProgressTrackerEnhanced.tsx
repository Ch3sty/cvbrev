// src/components/cv/CompetenceProgressTrackerEnhanced.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Loader2, Check, AlertTriangle, Clock, Target, BookOpen, X,
  Zap, Search, Brain, Sparkles, TrendingUp
} from 'lucide-react';

interface CompetenceProgressTrackerEnhancedProps {
  status: 'pending' | 'analyzing' | 'processing_gaps' | 'completed' | 'failed';
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
    if (status === 'analyzing' || status === 'processing_gaps') {
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
      color: 'text-gray-400',
      bgColor: 'bg-gray-500',
      message: 'Förbereder analys...',
      description: 'Systemet startar upp och förbereder din analys'
    },
    analyzing: {
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
      message: 'Analyserar ditt CV...',
      description: 'GPT-5 analyserar ditt CV mot målrollen'
    },
    processing_gaps: {
      icon: Search,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500',
      message: 'Söker utbildningar...',
      description: 'Hittar kurser och certifieringar för dina kompetensgap'
    },
    completed: {
      icon: Check,
      color: 'text-green-400',
      bgColor: 'bg-green-500',
      message: 'Analys klar!',
      description: 'Dina resultat och rekommendationer är redo'
    },
    failed: {
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500',
      message: 'Något gick fel',
      description: errorMessage || 'Analysen kunde inte slutföras'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Enhanced steps with better visuals
  const steps = [
    {
      id: 'start',
      label: 'Start',
      icon: Zap,
      completed: true,
      active: status === 'pending'
    },
    {
      id: 'analyze',
      label: 'Analys',
      icon: Brain,
      completed: status !== 'pending',
      active: status === 'analyzing'
    },
    {
      id: 'gaps',
      label: 'Hitta gap',
      icon: Target,
      completed: ['processing_gaps', 'completed'].includes(status),
      active: status === 'processing_gaps' && processedGaps === 0
    },
    {
      id: 'courses',
      label: 'Sök kurser',
      icon: BookOpen,
      completed: status === 'completed',
      active: status === 'processing_gaps' && (processedGaps ?? 0) > 0
    },
    {
      id: 'done',
      label: 'Resultat',
      icon: Sparkles,
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

    if (totalGaps && processedGaps !== undefined) {
      const remaining = totalGaps - processedGaps;
      const estimatedSeconds = remaining * 8; // Faster estimate
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
    if (status === 'processing_gaps' && currentStep) {
      const match = currentStep.match(/"([^"]+)"/);
      if (match) {
        return `Söker kurser för: ${match[1]}`;
      }
    }
    return currentStep;
  };

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl border border-navy-700 overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 ${
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
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {config.message}
                  {(status === 'analyzing' || status === 'processing_gaps') && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{config.description}</p>
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
                className="p-2 text-gray-400 hover:text-white hover:bg-navy-700 rounded-lg transition-all hover:scale-110"
                aria-label="Avbryt analys"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Enhanced step indicators */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="relative">
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
                          : 'bg-navy-700 text-gray-500 border border-navy-600'}
                        ${step.active ? 'animate-pulse' : ''}
                      `}>
                        {step.completed && !step.active ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-3 h-1 rounded-full bg-navy-700 overflow-hidden">
                        <div className={`
                          h-full transition-all duration-500 rounded-full
                          ${step.completed
                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                            : step.active
                            ? 'bg-gradient-to-r from-blue-500 to-blue-400 w-1/2'
                            : 'bg-navy-700'}
                        `} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <span key={step.id} className={`
                  text-xs transition-colors flex-1 text-center
                  ${step.completed
                    ? 'text-green-400'
                    : step.active
                    ? 'text-blue-400 font-semibold'
                    : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* Main progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Total progress</span>
              <span className={`text-sm font-bold ${
                status === 'completed' ? 'text-green-400' : 'text-white'
              }`}>
                {animatedProgress}%
              </span>
            </div>
            <div className="relative h-4 bg-navy-900 rounded-full overflow-hidden">
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
            <div className="bg-navy-900/50 backdrop-blur rounded-lg p-4 border border-navy-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white font-medium">
                    Kompetensgap-analys
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {processedGaps} av {totalGaps} klara
                </span>
              </div>

              {/* Mini progress bar for gaps */}
              <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${(processedGaps / totalGaps) * 100}%` }}
                />
              </div>

              {getDetailMessage() && (
                <p className="text-xs text-gray-400 mt-3 italic truncate">
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
              <div className="flex items-center space-x-2 text-green-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Resultat redo att visas!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetenceProgressTrackerEnhanced;