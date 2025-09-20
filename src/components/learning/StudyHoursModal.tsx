// src/components/learning/StudyHoursModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';

interface StudyHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  planId: string;
  onSuccess: () => void;
}

export default function StudyHoursModal({
  isOpen,
  onClose,
  skillId,
  skillName,
  planId,
  onSuccess
}: StudyHoursModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studyHours, setStudyHours] = useState('');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyMethod, setStudyMethod] = useState('reading');
  const [studyQuality, setStudyQuality] = useState(3);
  const [studyNotes, setStudyNotes] = useState('');

  const handleSubmit = async () => {
    if (!studyHours || parseFloat(studyHours) <= 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/learning-plans/${planId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          hoursSpent: parseFloat(studyHours),
          activityType: 'study_session',
          activityDescription: `Studerade ${studyHours} timmar - ${studyMethod}`,
          xpEarned: Math.round(parseFloat(studyHours) * 20), // 20 XP per hour
          studyMethod,
          studyQuality,
          notes: studyNotes,
          date: studyDate
        })
      });

      if (!response.ok) throw new Error('Failed to register study hours');

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error registering study hours:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStudyHours('');
    setStudyNotes('');
    setStudyQuality(3);
    setStudyMethod('reading');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800 border-b border-navy-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-400" />
                Registrera studietimmar
              </h2>
              <p className="text-sm text-gray-400 mt-1">{skillName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Antal studietimmar
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Datum
            </label>
            <input
              type="date"
              value={studyDate}
              onChange={(e) => setStudyDate(e.target.value)}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Studiemetod
            </label>
            <select
              value={studyMethod}
              onChange={(e) => setStudyMethod(e.target.value)}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="reading">Läsning</option>
              <option value="lecture">Föreläsning</option>
              <option value="practice">Praktik/Övning</option>
              <option value="discussion">Diskussion/Seminarium</option>
              <option value="project">Projekt</option>
              <option value="exam_prep">Tentaförberedelse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kvalitet på studiesessionen (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setStudyQuality(rating)}
                  className={`w-12 h-12 rounded-lg font-medium transition-all ${
                    studyQuality === rating
                      ? 'bg-blue-600 text-white'
                      : 'bg-navy-700 text-gray-400 hover:bg-navy-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Anteckningar (valfritt)
            </label>
            <textarea
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Vad arbetade du med? Eventuella reflektioner eller anteckningar"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>XP-belöning:</strong> {studyHours ? Math.round(parseFloat(studyHours) * 20) : 0} XP
            </p>
            <p className="text-xs text-blue-200/70 mt-1">
              Du får 20 XP per studietimme
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!studyHours || isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              studyHours && !isSubmitting
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                : 'bg-navy-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Registrerar...
              </span>
            ) : (
              'Registrera studietimmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}