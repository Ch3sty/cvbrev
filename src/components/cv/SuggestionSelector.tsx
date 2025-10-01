'use client';

import { motion } from 'framer-motion';
import {
  Check,
  FileText,
  Target,
  Key,
  Briefcase,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export interface Suggestion {
  id: string;
  category: 'structure' | 'content' | 'keywords' | 'ats';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  selected?: boolean;
}

interface SuggestionSelectorProps {
  suggestions: Suggestion[];
  onToggle: (suggestionId: string) => void;
}

const categoryConfig = {
  structure: {
    label: 'Struktur',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  content: {
    label: 'Innehåll',
    icon: Briefcase,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  keywords: {
    label: 'Nyckelord',
    icon: Key,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  ats: {
    label: 'ATS-optimering',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

const impactConfig = {
  high: {
    label: 'Hög påverkan',
    icon: TrendingUp,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  medium: {
    label: 'Medel påverkan',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  low: {
    label: 'Låg påverkan',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

export default function SuggestionSelector({
  suggestions,
  onToggle
}: SuggestionSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['structure', 'content', 'keywords', 'ats'])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const categorySuggestions = groupedSuggestions[category] || [];
        if (categorySuggestions.length === 0) return null;

        const config = categoryConfig[category];
        const Icon = config.icon;
        const isExpanded = expandedCategories.has(category);
        const selectedCount = categorySuggestions.filter(s => s.selected).length;

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-2"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-white/80 hover:bg-gray-50 transition-colors duration-200 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">{config.label}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedCount} av {categorySuggestions.length} valda
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>

            {/* Suggestions */}
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pl-4">
                {categorySuggestions.map((suggestion, index) => {
                  const impactInfo = impactConfig[suggestion.impact];
                  const ImpactIcon = impactInfo.icon;

                  return (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Card
                        onClick={() => onToggle(suggestion.id)}
                        className={`
                          relative cursor-pointer transition-all duration-300 p-4
                          ${suggestion.selected
                            ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 shadow-lg shadow-pink-500/10'
                            : 'bg-white/80 hover:bg-gray-50 border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className="mt-1">
                            <motion.div
                              initial={false}
                              animate={{
                                scale: suggestion.selected ? 1.1 : 1,
                                rotate: suggestion.selected ? 360 : 0
                              }}
                              transition={{ duration: 0.3 }}
                              className={`
                                w-6 h-6 rounded-md border-2 flex items-center justify-center
                                ${suggestion.selected
                                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-600'
                                  : 'bg-white border-gray-300'}
                              `}
                            >
                              {suggestion.selected && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </motion.div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">
                                  {suggestion.title}
                                </h5>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>

                            {/* Impact Badge */}
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${impactInfo.bgColor} ${impactInfo.color} border-0`}
                              >
                                <ImpactIcon className="h-3 w-3 mr-1" />
                                {impactInfo.label}
                              </Badge>
                              {suggestion.selected && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  style={{ willChange: 'opacity, transform' }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge className="text-xs bg-pink-600 text-white">
                                    Vald
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Selection Animation Overlay */}
                        {suggestion.selected && (
                          <motion.div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-purple-600/5 rounded-lg" />
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}