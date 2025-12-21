'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Search, X, Plus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CVDraft } from '../CVCreatorWizard';
import type { CVSkill } from '@/lib/cv/cv-metadata';

interface Step5SkillsProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
}

// Predefined skill categories with suggestions
const SKILL_CATEGORIES = {
  popular: {
    label: 'Populära',
    skills: ['Kundservice', 'Microsoft Office', 'Excel', 'Teamwork', 'Kommunikation', 'Tidsplanering', 'Problemlösning'],
  },
  technical: {
    label: 'Tekniska',
    skills: ['Python', 'JavaScript', 'SQL', 'React', 'Node.js', 'Git', 'AWS', 'Docker', 'Figma', 'Adobe Photoshop', 'AutoCAD'],
  },
  soft: {
    label: 'Mjuka färdigheter',
    skills: ['Ledarskap', 'Projektledning', 'Presentation', 'Förhandling', 'Kreativitet', 'Analytisk förmåga', 'Flexibilitet', 'Stresshantering'],
  },
  languages: {
    label: 'Programmeringsspråk',
    skills: ['Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript'],
  },
  tools: {
    label: 'Verktyg',
    skills: ['Slack', 'Jira', 'Trello', 'Salesforce', 'HubSpot', 'SAP', 'Power BI', 'Tableau', 'Google Analytics'],
  },
};

// Flatten all skills for search
const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flatMap(cat => cat.skills);

export default function Step5Skills({
  cvData,
  updateCVData,
}: Step5SkillsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  // Get all selected skills as a flat array
  const selectedSkills = useMemo(() => {
    return cvData.skills.flatMap(cat => cat.skills);
  }, [cvData.skills]);

  // Filter skills based on search
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return ALL_SKILLS.filter(
      skill =>
        skill.toLowerCase().includes(query) &&
        !selectedSkills.includes(skill)
    );
  }, [searchQuery, selectedSkills]);

  // Add a skill
  const addSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) return;

    // Find or create "Kompetenser" category
    const existingCategoryIndex = cvData.skills.findIndex(
      cat => cat.category === 'Kompetenser'
    );

    let newSkills: CVSkill[];
    if (existingCategoryIndex >= 0) {
      newSkills = [...cvData.skills];
      newSkills[existingCategoryIndex] = {
        ...newSkills[existingCategoryIndex],
        skills: [...newSkills[existingCategoryIndex].skills, skill],
      };
    } else {
      newSkills = [
        ...cvData.skills,
        { category: 'Kompetenser', skills: [skill] },
      ];
    }

    updateCVData({ skills: newSkills });
    setSearchQuery('');
    setCustomSkill('');
  };

  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    const newSkills = cvData.skills
      .map(cat => ({
        ...cat,
        skills: cat.skills.filter(s => s !== skillToRemove),
      }))
      .filter(cat => cat.skills.length > 0);

    updateCVData({ skills: newSkills });
  };

  // Add custom skill
  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      addSkill(customSkill.trim());
    }
  };

  const skillCount = selectedSkills.length;
  const isOptimalCount = skillCount >= 5 && skillCount <= 10;
  const isTooMany = skillCount > 15;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Kompetenser
        </h1>
        <p className="text-gray-600">
          Välj eller lägg till kompetenser som är relevanta för de jobb du söker.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök efter kompetens..."
            className="pl-10 h-12"
          />
          {/* Search results dropdown */}
          {filteredSkills && filteredSkills.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredSkills.slice(0, 8).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Skills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Dina valda kompetenser ({skillCount})
            </p>
            {skillCount > 0 && (
              <span className={`text-xs ${
                isTooMany
                  ? 'text-amber-600'
                  : isOptimalCount
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}>
                {isOptimalCount && 'Bra antal!'}
                {isTooMany && 'Överväg att ta bort några'}
                {skillCount < 5 && skillCount > 0 && 'Lägg gärna till fler'}
              </span>
            )}
          </div>

          <div className="min-h-[60px] p-3 bg-gray-50 rounded-xl border border-gray-200">
            {selectedSkills.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">
                Inga kompetenser valda ännu. Sök eller välj från förslagen nedan.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedSkills.map((skill) => (
                    <motion.button
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 rounded-full text-sm font-medium hover:from-pink-200 hover:to-purple-200 transition-colors group"
                    >
                      {skill}
                      <X className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Add Custom Skill */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
            placeholder="Lägg till egen kompetens..."
            className="h-12"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCustomSkill}
            disabled={!customSkill.trim()}
            className="h-12 px-4"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Skill Suggestions by Category */}
        <div className="space-y-4">
          {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
            <div key={key}>
              <p className="text-sm font-medium text-gray-600 mb-2">{category.label}</p>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => isSelected ? removeSkill(skill) : addSkill(skill)}
                      disabled={isTooMany && !isSelected}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : isTooMany
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Too many warning */}
        {isTooMany && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Du har valt många kompetenser. Överväg att fokusera på de 10-15 mest relevanta för att inte späda ut ditt CV.
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 max-w-2xl mx-auto">
        <h3 className="font-medium text-gray-900 mb-2">Tips för kompetenser</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Kvalitet före kvantitet:</strong> 5-10 relevanta kompetenser är bättre än 20 generiska</li>
          <li>• <strong>Anpassa efter jobbet:</strong> Läs jobbannonsen och inkludera matchande kompetenser</li>
          <li>• <strong>Var specifik:</strong> "React och TypeScript" är bättre än bara "Programmering"</li>
          <li>• <strong>Inkludera både tekniska och mjuka färdigheter</strong> för en balanserad profil</li>
        </ul>
      </div>

      {/* Skip hint */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Du kan alltid gå tillbaka och lägga till fler kompetenser senare
      </p>
    </div>
  );
}
