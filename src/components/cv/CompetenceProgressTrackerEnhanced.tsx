// src/components/cv/CompetenceProgressTrackerEnhanced.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  Loader2, Check, AlertTriangle, Clock, Target, BookOpen, X,
  Zap, Search, Brain, Sparkles, TrendingUp, Database, Cpu, Network
} from 'lucide-react';
import CircularProgress from '@/components/ui/CircularProgress';
import AnimatedParticles from '@/components/ui/AnimatedParticles';

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

  // Status configurations - premium descriptions without AI buzzwords
  const statusConfig = {
    pending: {
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      message: 'Initierar analys',
      description: 'Förbereder systemet och laddar data'
    },
    analyzing: {
      icon: Cpu,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      message: 'Analyserar CV-data',
      description: 'Utvärderar kompetenser och erfarenhet mot målroll'
    },
    processing_gaps: {
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      message: 'Processar kompetensgap',
      description: 'Söker och matchar relevanta utbildningar'
    },
    partial_complete: {
      icon: Network,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      message: 'Kurerar utbildningsväg',
      description: 'Fortsätter med nästa batch av kompetensgap'
    },
    completed: {
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      message: 'Färdigställd analys',
      description: 'Rekommendationer kompletta och redo att visa'
    },
    failed: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      message: 'Systemfel uppstod',
      description: errorMessage || 'Analysen kunde inte slutföras - försök igen'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Premium step labels with professional tone (no AI buzzwords)
  const steps = [
    {
      id: 'start',
      label: 'Initierar system',
      subtitle: 'Förbereder analysmotor',
      icon: Zap,
      completed: true,
      active: status === 'pending'
    },
    {
      id: 'analyze',
      label: 'Analyserar CV-data',
      subtitle: 'Utvärderar kompetenser och erfarenhet',
      icon: Cpu,
      completed: status !== 'pending',
      active: status === 'analyzing'
    },
    {
      id: 'gaps',
      label: 'Processar kompetensgap',
      subtitle: 'Identifierar utvecklingsområden',
      icon: Database,
      completed: ['processing_gaps', 'partial_complete', 'completed'].includes(status),
      active: status === 'processing_gaps' && processedGaps === 0
    },
    {
      id: 'courses',
      label: 'Kurerar utbildningsväg',
      subtitle: 'Söker och matchar utbildningar',
      icon: Network,
      completed: status === 'completed',
      active: (status === 'processing_gaps' || status === 'partial_complete') && (processedGaps ?? 0) > 0
    },
    {
      id: 'done',
      label: 'Färdigställer rekommendationer',
      subtitle: 'Komplett analys klar',
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

  // Detail message for current processing - simplified
  const getDetailMessage = () => {
    if ((status === 'processing_gaps' || status === 'partial_complete') && currentStep) {
      const match = currentStep.match(/"([^"]+)"/);
      if (match) {
        // Return just the skill name without extra text
        return match[1];
      }
    }
    return currentStep;
  };

  // Calculate individual step progress
  const getStepProgress = (step: typeof steps[0]) => {
    if (step.completed && !step.active) return 100;
    if (step.active) {
      // For active step, show animated progress based on overall progress
      if (step.id === 'analyze') return Math.min(progress * 2, 100);
      if (step.id === 'gaps' || step.id === 'courses') {
        if (totalGaps && processedGaps !== undefined) {
          return (processedGaps / totalGaps) * 100;
        }
        return progress;
      }
      return progress;
    }
    return 0;
  };

  return (
    <div className="w-full">
      <div className="relative bg-transparent rounded-2xl overflow-hidden">
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

          {/* Premium Vertical Timeline */}
          <div className="mb-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const stepProgress = getStepProgress(step);
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="relative pb-8 last:pb-0">
                  {/* Timeline item */}
                  <div className="flex items-start gap-4">
                    {/* Left: CircularProgress with Icon */}
                    <div className="relative flex-shrink-0 z-10">
                      {/* Glow effect for active step */}
                      {step.active && (
                        <div className="absolute inset-0 rounded-full bg-blue-500 blur-xl opacity-40 animate-pulse" />
                      )}

                      <CircularProgress
                        percentage={stepProgress}
                        size={64}
                        strokeWidth={4}
                        color={
                          step.completed ? '#10b981' : // green-500
                          step.active ? '#3b82f6' : // blue-500
                          '#d1d5db' // gray-300
                        }
                        backgroundColor="#f3f4f6"
                      >
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-all
                          ${step.completed
                            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg'
                            : step.active
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                            : 'bg-gray-200'}
                        `}>
                          {step.completed && !step.active ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <StepIcon className={`w-6 h-6 ${
                              step.active ? 'text-white' : 'text-gray-500'
                            }`} />
                          )}
                        </div>
                      </CircularProgress>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 pt-2 min-w-0">
                      <div className="transition-all">
                        <h4 className={`
                          text-sm font-bold transition-colors
                          ${step.completed
                            ? 'text-green-600'
                            : step.active
                            ? 'text-blue-600'
                            : 'text-gray-500'}
                        `}>
                          {step.label}
                          {step.active && (
                            <Loader2 className="inline-block w-3 h-3 ml-2 animate-spin" />
                          )}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {step.subtitle}
                        </p>

                        {/* Live status for active step */}
                        {step.active && getDetailMessage() && (
                          <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 rounded px-2 py-1 inline-block max-w-full truncate">
                            {getDetailMessage()}
                          </div>
                        )}

                        {/* Progress for gap processing */}
                        {step.active && (step.id === 'gaps' || step.id === 'courses') && totalGaps && processedGaps !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Framsteg</span>
                              <span className="font-medium">{processedGaps} / {totalGaps}</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${stepProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connecting line with animated particles */}
                  {!isLast && (
                    <div className="absolute left-[32px] top-[64px] w-1 h-[calc(100%-64px)] z-0">
                      {/* Background line */}
                      <div className={`
                        w-full h-full rounded-full transition-all duration-500
                        ${step.completed
                          ? 'bg-gradient-to-b from-green-500 to-green-400'
                          : step.active
                          ? 'bg-gradient-to-b from-blue-500 to-gray-300'
                          : 'bg-gray-300'}
                      `} />

                      {/* Animated particles flowing down */}
                      {step.active && (
                        <AnimatedParticles
                          count={3}
                          color={step.completed ? '#10b981' : '#3b82f6'}
                          speed="medium"
                          direction="down"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
              <div className="flex items-center space-x-3 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold">Analys färdigställd - rekommendationer redo att visa</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetenceProgressTrackerEnhanced;