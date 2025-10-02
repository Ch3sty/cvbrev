// src/components/cv/analysis/steps/AnalysisOverviewStep.tsx
'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Target,
  Briefcase,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AnalysisOverviewStepProps {
  totalImprovements: number;
  roleBasedCount: number;
  skillsCount: number;
  generalCount: number;
  profileImproved: boolean;
  atsScore: number;
  potentialScore: number;
}

export default function AnalysisOverviewStep({
  totalImprovements,
  roleBasedCount,
  skillsCount,
  generalCount,
  profileImproved,
  atsScore,
  potentialScore
}: AnalysisOverviewStepProps) {
  const improvement = potentialScore - atsScore;

  const categories = [
    {
      icon: Briefcase,
      title: 'Rollbaserade förbättringar',
      count: roleBasedCount,
      color: 'from-blue-600 to-cyan-600',
      description: 'Optimering av arbetserfarenheter'
    },
    {
      icon: Award,
      title: 'Kompetenser & färdigheter',
      count: skillsCount,
      color: 'from-purple-600 to-pink-600',
      description: 'Saknade kompetenser identifierade'
    },
    {
      icon: Sparkles,
      title: 'Personbeskrivning',
      count: profileImproved ? 1 : 0,
      color: 'from-pink-600 to-rose-600',
      description: 'Din inledning har optimerats'
    },
    {
      icon: Target,
      title: 'Allmänna förbättringar',
      count: generalCount,
      color: 'from-green-600 to-emerald-600',
      description: 'Övriga rekommendationer'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Din analys är klar!
        </h3>
        <p className="text-lg text-gray-600">
          Vi har identifierat <span className="font-semibold text-pink-600">{totalImprovements} förbättringar</span> för ditt CV
        </p>
      </motion.div>

      {/* ATS Score Card */}
      <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border border-slate-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">ATS-Optimering</h4>
            <p className="text-sm text-gray-600">Applicant Tracking System</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>

        <div className="flex items-center gap-8 mb-4">
          {/* Current Score */}
          <div>
            <div className="text-4xl font-bold text-gray-900">{atsScore}</div>
            <div className="text-sm text-gray-600">Nuvarande poäng</div>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1 bg-gradient-to-r from-gray-400 to-green-500 rounded-full" />
            <span className="text-2xl">→</span>
          </div>

          {/* Potential Score */}
          <div>
            <div className="text-4xl font-bold text-green-600">{potentialScore}</div>
            <div className="text-sm text-gray-600">Potentiell poäng</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            <span className="font-semibold">+{improvement} poäng förbättring</span> möjlig genom att implementera våra rekommendationer.
            Detta ökar chansen att ditt CV kommer förbi automatiska urvalsystem.
          </p>
        </div>
      </Card>

      {/* Category Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {category.title}
                  </h5>
                  <p className="text-sm text-gray-600 mb-2">
                    {category.description}
                  </p>
                  <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {category.count}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Next Step Hint */}
      <div className="text-center pt-4">
        <p className="text-gray-600">
          Klicka på <span className="font-semibold">Nästa</span> för att granska och välja vilka förbättringar du vill implementera
        </p>
      </div>
    </div>
  );
}
