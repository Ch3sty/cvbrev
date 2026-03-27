'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Check,
  BarChart3,
  Key,
  Target,
  Briefcase,
  Star,
  TrendingUp,
  Clock,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FrontendRoleImprovement } from '@/lib/cv/role-based-improvements';

// Export FrontendRoleImprovement as RoleImprovement for backward compatibility
export type RoleImprovement = FrontendRoleImprovement;

interface GeneralImprovement {
  id: string;
  title: string;
  description: string;
  category: 'skills' | 'certifications' | 'languages' | 'profile';
  selected: boolean;
  impact: 'high' | 'medium' | 'low';
  example?: string;
}

interface RoleBasedSuggestionSelectorProps {
  roleImprovements: RoleImprovement[];
  generalImprovements: GeneralImprovement[];
  onRoleToggle: (roleId: string) => void;
  onGeneralToggle: (improvementId: string) => void;
  onSelectAllRoles: () => void;
  onClearRoleSelection: () => void;
  onEditSuggestion?: (roleId: string, newText: string) => void;
}

const improvementTypeConfig = {
  quantification: {
    icon: BarChart3,
    label: 'Kvantifiering',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  keywords: {
    icon: Key,
    label: 'Nyckelord',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  ats: {
    icon: Target,
    label: 'ATS',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
};

const impactConfig = {
  high: {
    label: 'Hög påverkan',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  medium: {
    label: 'Medel påverkan',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  low: {
    label: 'Låg påverkan',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

const generalCategoryConfig = {
  skills: {
    icon: Star,
    label: 'Saknade färdigheter',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  certifications: {
    icon: Briefcase,
    label: 'Certifieringar',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  languages: {
    icon: TrendingUp,
    label: 'Språkkunskaper',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  profile: {
    icon: Star,
    label: 'Profilsammanfattning',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
};

export default function RoleBasedSuggestionSelector({
  roleImprovements,
  generalImprovements,
  onRoleToggle,
  onGeneralToggle,
  onSelectAllRoles,
  onClearRoleSelection,
  onEditSuggestion
}: RoleBasedSuggestionSelectorProps) {
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
  const [expandedGeneral, setExpandedGeneral] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<Record<string, string>>({});

  const toggleRoleExpansion = (roleId: string) => {
    setExpandedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const selectedRoleCount = roleImprovements.filter(r => r.selected).length;
  const selectedGeneralCount = generalImprovements.filter(g => g.selected).length;
  const totalRoles = roleImprovements.length;

  const renderImprovementTags = (improvements: RoleImprovement['improvements']) => {
    const tags = [];

    if (improvements.quantification) {
      const config = improvementTypeConfig.quantification;
      const Icon = config.icon;
      tags.push(
        <Badge key="quantification" variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    }

    if (improvements.keywords.length > 0) {
      const config = improvementTypeConfig.keywords;
      const Icon = config.icon;
      tags.push(
        <Badge key="keywords" variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label} ({improvements.keywords.length})
        </Badge>
      );
    }

    if (improvements.atsOptimization) {
      const config = improvementTypeConfig.ats;
      const Icon = config.icon;
      tags.push(
        <Badge key="ats" variant="outline" className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    }

    return tags;
  };

  const handleSaveEdit = (roleId: string) => {
    if (editedText[roleId] && onEditSuggestion) {
      onEditSuggestion(roleId, editedText[roleId]);
    }
    setEditingRole(null);
  };

  const handleStartEdit = (roleId: string, currentText: string) => {
    setEditingRole(roleId);
    setEditedText({ ...editedText, [roleId]: currentText });
  };

  return (
    <div className="space-y-6">
      {/* Warning about AI-generated numbers */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">
              Stämmer siffrorna?
            </h4>
            <p className="text-sm text-yellow-800">
              Siffrorna är uppskattade utifrån din profil. Justera dem så de stämmer med din erfarenhet.
              <strong> Redigera alltid dessa så de stämmer överens med dina faktiska prestationer</strong>
              innan du använder dem i ditt CV. Klicka på "Redigera" vid varje förbättring för att anpassa texten.
            </p>
          </div>
        </div>
      </div>

      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-pink-600/10 to-purple-600/10">
            <Briefcase className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Roll-baserade förbättringar
            </h3>
            <p className="text-sm text-gray-600">
              {selectedRoleCount} av {totalRoles} roller valda
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAllRoles}
            className="bg-white/80 hover:bg-gray-50"
          >
            Välj alla roller
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearRoleSelection}
            className="bg-white/80 hover:bg-gray-50"
          >
            Rensa val
          </Button>
        </div>
      </div>

      {/* Role-based Improvements */}
      <div className="space-y-4">
        {roleImprovements.map((roleImprovement, index) => {
          const isExpanded = expandedRoles.has(roleImprovement.role);
          const impactInfo = impactConfig[roleImprovement.impact];

          return (
            <motion.div
              key={roleImprovement.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`
                transition-all duration-300 overflow-hidden
                ${roleImprovement.selected
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 shadow-lg shadow-pink-500/10'
                  : 'bg-white/95 border-gray-200 hover:border-gray-300 hover:shadow-md'}
              `}>
                {/* Role Header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="mt-1">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: roleImprovement.selected ? 1.1 : 1,
                          rotate: roleImprovement.selected ? 360 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        onClick={() => onRoleToggle(roleImprovement.role)}
                        className={`
                          w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer
                          ${roleImprovement.selected
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-600'
                            : 'bg-white border-gray-300 hover:border-gray-400'}
                        `}
                      >
                        {roleImprovement.selected && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </motion.div>
                    </div>

                    {/* Role Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-base">
                            {roleImprovement.role}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {roleImprovement.period}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${impactInfo.bgColor} ${impactInfo.color} border-0`}>
                            {impactInfo.label}
                          </Badge>
                          {roleImprovement.confidence && (
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                              {Math.round(roleImprovement.confidence * 100)}% säker
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Improvement Tags */}
                      <div className="flex flex-wrap gap-2">
                        {renderImprovementTags(roleImprovement.improvements)}
                      </div>

                      {/* Why This Improvement is Good */}
                      {(roleImprovement.improvements.quantification || roleImprovement.improvements.keywords.length > 0) && (
                        <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200/60">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">💡</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {roleImprovement.improvements.quantification && roleImprovement.improvements.keywords.length > 0 && (
                                  <>Genom att <strong>kvantifiera resultat</strong> och lägga till <strong>nyckelord som {roleImprovement.improvements.keywords.slice(0, 2).join(', ')}</strong> ökar dina chanser att passera ATS med <span className="text-pink-600 font-semibold">40%</span> och gör din erfarenhet mer konkret för rekryterare.</>
                                )}
                                {roleImprovement.improvements.quantification && !roleImprovement.improvements.keywords.length && (
                                  <>Kvantifierade resultat visar <strong>mätbar påverkan</strong> och ökar trovärdigheten hos rekryterare betydligt. Konkreta siffror gör ditt CV <span className="text-pink-600 font-semibold">3x mer attraktivt</span>.</>
                                )}
                                {!roleImprovement.improvements.quantification && roleImprovement.improvements.keywords.length > 0 && (
                                  <>Dessa nyckelord matchar <span className="text-pink-600 font-semibold">80% av jobbannonser</span> i din bransch och ökar dina chanser att passera ATS-system.</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRoleExpansion(roleImprovement.role)}
                        className="w-full justify-center bg-gray-50/80 hover:bg-gray-100 h-8 mt-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Dölj förhandsvisning
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Visa före/efter förhandsvisning
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expandable Preview */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200/60"
                    >
                      <div className="p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/80">
                        {/* Original Text */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                            <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Nuvarande beskrivning
                            </h5>
                          </div>
                          <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {roleImprovement.originalText}
                            </p>
                          </div>
                        </div>

                        {/* Suggested Text */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Förbättrat förslag
                              </h5>
                            </div>
                            {editingRole !== roleImprovement.role && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(roleImprovement.role, roleImprovement.suggestedText)}
                                className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit3 className="h-3 w-3" />
                                Redigera
                              </Button>
                            )}
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-50 via-emerald-50/50 to-green-50 rounded-lg border border-green-300/60 shadow-sm">
                            {editingRole === roleImprovement.role ? (
                              <div className="space-y-3">
                                <textarea
                                  className="w-full min-h-[120px] p-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y"
                                  value={editedText[roleImprovement.role] || roleImprovement.suggestedText}
                                  onChange={(e) => setEditedText({ ...editedText, [roleImprovement.role]: e.target.value })}
                                  placeholder="Redigera texten här..."
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingRole(null)}
                                    className="h-8 text-xs"
                                  >
                                    Avbryt
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(roleImprovement.role)}
                                    className="h-8 text-xs bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                  >
                                    Spara ändringar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-900 leading-relaxed font-medium">
                                {editedText[roleImprovement.role] || roleImprovement.suggestedText}
                              </p>
                            )}
                            {/* Visual improvement indicators */}
                            <div className="mt-3 pt-3 border-t border-green-200/60 flex flex-wrap gap-2">
                              {roleImprovement.improvements.quantification && (
                                <div className="flex items-center gap-1 text-xs text-green-700">
                                  <BarChart3 className="h-3 w-3" />
                                  <span className="font-medium">Kvantifierat</span>
                                </div>
                              )}
                              {roleImprovement.improvements.keywords.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-green-700">
                                  <Key className="h-3 w-3" />
                                  <span className="font-medium">{roleImprovement.improvements.keywords.length} nyckelord</span>
                                </div>
                              )}
                              {roleImprovement.improvements.atsOptimization && (
                                <div className="flex items-center gap-1 text-xs text-green-700">
                                  <Target className="h-3 w-3" />
                                  <span className="font-medium">ATS-optimerad</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Keywords if available */}
                        {roleImprovement.improvements.keywords.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Key className="h-3.5 w-3.5 text-purple-600" />
                              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Tillagda nyckelord ({roleImprovement.improvements.keywords.length})
                              </h5>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {roleImprovement.improvements.keywords.map((keyword, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-300 font-medium px-2.5 py-1"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* General Improvements Section */}
      {generalImprovements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600/10 to-blue-600/10">
                <Star className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Allmänna förbättringar</h4>
                <p className="text-sm text-gray-600">
                  {selectedGeneralCount} av {generalImprovements.length} valda
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedGeneral(!expandedGeneral)}
            >
              {expandedGeneral ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          <AnimatePresence>
            {expandedGeneral && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {generalImprovements.map((improvement, index) => {
                  const categoryConfig = generalCategoryConfig[improvement.category];
                  const Icon = categoryConfig.icon;
                  const impactInfo = impactConfig[improvement.impact];

                  return (
                    <motion.div
                      key={improvement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        onClick={() => onGeneralToggle(improvement.id)}
                        className={`
                          cursor-pointer transition-all duration-300 p-3
                          ${improvement.selected
                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 shadow-md'
                            : 'bg-white/80 hover:bg-gray-50 border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: improvement.selected ? 1.1 : 1
                            }}
                            transition={{ duration: 0.3 }}
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center
                              ${improvement.selected
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-600'
                                : 'bg-white border-gray-300'}
                            `}
                          >
                            {improvement.selected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </motion.div>

                          <div className={`p-1.5 rounded ${categoryConfig.bgColor}`}>
                            <Icon className={`h-4 w-4 ${categoryConfig.color}`} />
                          </div>

                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {improvement.title}
                            </h5>
                            <p className="text-xs text-gray-600">
                              {improvement.description}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Badge className={`text-xs ${categoryConfig.bgColor} ${categoryConfig.color} border-0`}>
                              {categoryConfig.label}
                            </Badge>
                            <Badge className={`text-xs ${impactInfo.bgColor} ${impactInfo.color} border-0`}>
                              {impactInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}