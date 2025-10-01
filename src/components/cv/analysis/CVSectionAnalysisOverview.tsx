// src/components/cv/analysis/CVSectionAnalysisOverview.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Key,
  Type,
  Zap,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SectionCard from './SectionCard';

// ============================================================================
//  Type Definitions
// ============================================================================

export interface RoleBasedImprovement {
  roleTitle: string;
  company: string;
  period?: string;
  currentText?: string;
  improvements: {
    hasQuantification?: boolean;
    keywords?: string[];
    grammarIssues?: string[];
    atsOptimization?: boolean;
  };
  suggestedText: string;
  atsImpact?: number;
}

export interface GeneralImprovement {
  area: string;
  suggestion: string;
  example?: string;
}

interface CVSectionAnalysisOverviewProps {
  roleBasedImprovements: RoleBasedImprovement[];
  generalImprovements: GeneralImprovement[];
  atsScore?: number;
  onStartImprovements?: () => void;
}

// ============================================================================
//  Priority Calculation
// ============================================================================

const calculatePriority = (improvement: RoleBasedImprovement): 'critical' | 'high' | 'medium' | 'low' => {
  const { improvements, atsImpact = 0 } = improvement;

  // Kritisk: Saknar kvantifiering OCH har högt ATS-impact
  if (!improvements.hasQuantification && atsImpact > 15) {
    return 'critical';
  }

  // Hög: Saknar kvantifiering ELLER högt ATS-impact
  if (!improvements.hasQuantification || atsImpact > 10) {
    return 'high';
  }

  // Medium: Har grammatikfel eller några nyckelord
  if ((improvements.grammarIssues?.length || 0) > 0 || (improvements.keywords?.length || 0) > 0) {
    return 'medium';
  }

  return 'low';
};

// ============================================================================
//  Component
// ============================================================================

export default function CVSectionAnalysisOverview({
  roleBasedImprovements,
  generalImprovements,
  atsScore = 0,
  onStartImprovements
}: CVSectionAnalysisOverviewProps) {

  // Beräkna prioriteter
  const prioritizedRoles = roleBasedImprovements
    .map(role => ({
      ...role,
      priority: calculatePriority(role)
    }))
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const criticalCount = prioritizedRoles.filter(r => r.priority === 'critical').length;
  const highCount = prioritizedRoles.filter(r => r.priority === 'high').length;
  const totalImprovements = roleBasedImprovements.length + generalImprovements.length;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-white via-gray-50/30 to-white border border-gray-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            {/* ATS Score */}
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-gray-200"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className={
                      atsScore >= 80 ? 'text-green-500' :
                      atsScore >= 60 ? 'text-yellow-500' :
                      'text-red-500'
                    }
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: atsScore / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={`${2 * Math.PI * 28}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-900">{atsScore}</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">ATS-Poäng</div>
                <div className="text-xs text-gray-500">av 100</div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-gray-300" />

            {/* Improvements Count */}
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalImprovements}</div>
              <div className="text-sm text-gray-600">förbättringar identifierade</div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-gray-300" />

            {/* Sections Count */}
            <div>
              <div className="text-2xl font-bold text-gray-900">{roleBasedImprovements.length}</div>
              <div className="text-sm text-gray-600">sektioner att förbättra</div>
            </div>
          </div>

          {/* CTA Button */}
          {onStartImprovements && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartImprovements}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Generera AI-förbättringar
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Priority Indicators */}
      {(criticalCount > 0 || highCount > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ willChange: 'opacity, transform' }}
          className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Prioriterade Förbättringar</h4>
              <p className="text-sm text-gray-700">
                {criticalCount > 0 && (
                  <span className="font-medium text-red-600">
                    {criticalCount} kritiska förbättringar
                  </span>
                )}
                {criticalCount > 0 && highCount > 0 && ' och '}
                {highCount > 0 && (
                  <span className="font-medium text-orange-600">
                    {highCount} högt prioriterade förbättringar
                  </span>
                )}
                {' '}identifierade. Dessa kan öka ditt ATS-poäng betydligt.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{
          staggerChildren: 0.1,
          delayChildren: 0.2
        }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-pink-600" />
          Sektion-baserade Förbättringar
        </h3>

        {prioritizedRoles.length === 0 ? (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ willChange: 'transform' }}
              className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Utmärkt CV!
            </h3>
            <p className="text-gray-600">
              Inga roll-baserade förbättringar identifierade. Ditt CV har redan hög kvalitet!
            </p>
          </Card>
        ) : (
          prioritizedRoles.map((role, index) => (
            <motion.div
              key={`${role.roleTitle}-${index}`}
              variants={itemVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <SectionCard
                sectionName={`${role.roleTitle} - ${role.company}`}
                sectionType="work_experience"
                period={role.period}
                priority={role.priority}
                currentText={role.currentText || ''}
                suggestedText={role.suggestedText}
                improvements={role.improvements}
                atsImpact={role.atsImpact || 0}
              />
            </motion.div>
          ))
        )}

        {/* General Improvements */}
        {generalImprovements.length > 0 && (
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="bg-white/95 border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Allmänna Förbättringar
              </h4>
              <div className="space-y-3">
                {generalImprovements.map((improvement, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      {improvement.area}
                    </div>
                    <p className="text-sm text-gray-700">{improvement.suggestion}</p>
                    {improvement.example && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Exempel: {improvement.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
