'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Key,
  Award,
  CheckCircle2,
  ArrowUp,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImprovementMetricsProps {
  metrics: {
    keywordOptimization: number;
    atsScore: number;
    overallImprovement: number;
  };
  className?: string;
}

export default function ImprovementMetrics({
  metrics,
  className = ''
}: ImprovementMetricsProps) {
  const metricCards = [
    {
      label: 'Total förbättring',
      value: metrics.overallImprovement,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      suffix: '%',
      description: 'Övergripande CV-kvalitet'
    },
    {
      label: 'ATS-poäng',
      value: metrics.atsScore,
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      suffix: '%',
      description: 'Kompatibilitet med rekryteringssystem'
    },
    {
      label: 'Nyckelordsoptimering',
      value: metrics.keywordOptimization,
      icon: Key,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      suffix: '% mer',
      description: 'Branschspecifika nyckelord'
    }
  ];

  return (
    <div className={`improvement-metrics ${className}`}>
      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-white shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                Förbättringar applicerade framgångsrikt!
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Ditt CV har optimerats baserat på dina valda förbättringar
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Card className={`relative overflow-hidden border ${metric.borderColor} ${metric.bgColor} p-6`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-gray-900 to-transparent" />
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-tr from-gray-900 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <Icon className={`h-5 w-5 ${metric.textColor}`} />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.5 + index * 0.1
                      }}
                    >
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    </motion.div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <motion.span
                        className={`text-3xl font-bold ${metric.textColor}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.3 + index * 0.1
                        }}
                      >
                        {metric.value}
                      </motion.span>
                      <span className={`text-lg font-medium ${metric.textColor}`}>
                        {metric.suffix}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mt-2">
                      {metric.label}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {metric.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(metric.value, 100)}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.5 + index * 0.1,
                        ease: "easeOut"
                      }}
                    />
                  </div>
                </div>

                {/* Sparkle Animation */}
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }}
                >
                  <Sparkles className={`h-4 w-4 ${metric.textColor} opacity-30`} />
                </motion.div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Improvement Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <Award className="h-5 w-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                Nästa steg
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Din förbättrade CV är nu redo att sparas eller exporteras med valfri mall
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {metrics.overallImprovement}%
              </div>
              <div className="text-xs text-gray-600">bättre</div>
            </div>
            <div className="text-center border-x border-pink-200">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(metrics.atsScore / 10)}/10
              </div>
              <div className="text-xs text-gray-600">ATS-betyg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                +{metrics.keywordOptimization}
              </div>
              <div className="text-xs text-gray-600">nyckelord</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}