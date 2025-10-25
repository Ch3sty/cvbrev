'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Plus, Copy, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

interface WeakSkill {
  skill: string
  reason: string
  replace_with: string
}

interface SuggestedSkill {
  skill: string
  reason: string
}

interface SkillsAnalysis {
  strong_skills: string[]
  weak_skills: WeakSkill[]
  suggested_skills: SuggestedSkill[]
}

interface SkillsResultProps {
  analysis: SkillsAnalysis
  scoreImprovement: number
}

export default function SkillsResult({ analysis, scoreImprovement }: SkillsResultProps) {
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(
    new Set(analysis.weak_skills.map(ws => ws.skill))
  )
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(
    new Set(analysis.suggested_skills.map(ss => ss.skill))
  )

  const toggleRemove = (skill: string) => {
    setSelectedToRemove(prev => {
      const newSet = new Set(prev)
      if (newSet.has(skill)) {
        newSet.delete(skill)
      } else {
        newSet.add(skill)
      }
      return newSet
    })
  }

  const toggleAdd = (skill: string) => {
    setSelectedToAdd(prev => {
      const newSet = new Set(prev)
      if (newSet.has(skill)) {
        newSet.delete(skill)
      } else {
        newSet.add(skill)
      }
      return newSet
    })
  }

  const handleCopySelected = async () => {
    // Build final skills list
    const finalSkills: string[] = []

    // Add strong skills
    finalSkills.push(...analysis.strong_skills)

    // Add selected suggested skills
    selectedToAdd.forEach(skill => finalSkills.push(skill))

    // Create formatted list
    const skillsText = finalSkills.join(', ')

    try {
      await navigator.clipboard.writeText(skillsText)
      toast.success('✓ Valda skills kopierade till urklipp!', {
        position: 'bottom-right',
        autoClose: 2000,
        theme: 'light'
      })
    } catch (error) {
      toast.error('Kunde inte kopiera', { position: 'bottom-right' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">
              Så uppdaterar du dina skills på LinkedIn:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
              <li>Bocka i/av vilka skills du vill lägga till eller ta bort nedan</li>
              <li>Kopiera den färdiga listan med knappen "Kopiera valda skills"</li>
              <li>Gå till LinkedIn → Din profil → Skills-sektionen</li>
              <li>Ta bort svaga skills (de markerade med rött nedan)</li>
              <li>Lägg till nya skills genom att söka i LinkedIn's dropdown-meny</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Strong Skills - Keep These */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Starka skills (behåll dessa)
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.strong_skills.map((skill, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-3 py-1.5 bg-green-50 border-2 border-green-200 rounded-lg text-sm font-medium text-green-800 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-green-600" />
              {skill}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weak Skills - Remove These */}
      {analysis.weak_skills.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Svaga skills (rekommenderar att ta bort)
          </h3>
          <div className="space-y-2">
            {analysis.weak_skills.map((weakSkill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedToRemove.has(weakSkill.skill)}
                    onChange={() => toggleRemove(weakSkill.skill)}
                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-red-900">{weakSkill.skill}</span>
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-xs text-red-700 mb-2">
                      <strong>Varför:</strong> {weakSkill.reason}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">Ersätt med:</span>
                      <span className="px-3 py-1 bg-green-100 border-2 border-green-300 rounded-lg text-sm font-semibold text-green-800 flex items-center gap-1.5 shadow-sm">
                        <Plus className="w-3.5 h-3.5" />
                        {weakSkill.replace_with}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Skills - Add These */}
      {analysis.suggested_skills.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Föreslagna skills (baserat på din erfarenhet)
          </h3>
          <div className="space-y-2">
            {analysis.suggested_skills.map((suggestedSkill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedToAdd.has(suggestedSkill.skill)}
                    onChange={() => toggleAdd(suggestedSkill.skill)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-900">{suggestedSkill.skill}</span>
                      <Plus className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-xs text-blue-700">
                      <strong>Varför:</strong> {suggestedSkill.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Copy Button */}
      <div className="flex justify-center pt-4">
        <motion.button
          onClick={handleCopySelected}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Copy className="w-5 h-5" />
          Kopiera valda skills
        </motion.button>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{analysis.strong_skills.length}</span> starka skills
          {analysis.weak_skills.length > 0 && (
            <>
              {' • '}
              <span className="font-semibold text-red-700">{selectedToRemove.size}</span> att ta bort
            </>
          )}
          {analysis.suggested_skills.length > 0 && (
            <>
              {' • '}
              <span className="font-semibold text-blue-700">{selectedToAdd.size}</span> att lägga till
            </>
          )}
        </p>
      </div>
    </div>
  )
}
