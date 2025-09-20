// src/components/learning/StudyProgressModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Clock, Award, BookOpen, Plus, Loader2 } from 'lucide-react';

interface StudyProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  planId: string;
  onSuccess: () => void;
}

export default function StudyProgressModal({
  isOpen,
  onClose,
  skillId,
  skillName,
  planId,
  onSuccess
}: StudyProgressModalProps) {
  const [activeTab, setActiveTab] = useState<'hours' | 'course'>('hours');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Study hours form
  const [studyHours, setStudyHours] = useState('');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyMethod, setStudyMethod] = useState('reading');
  const [studyQuality, setStudyQuality] = useState(3);
  const [studyNotes, setStudyNotes] = useState('');

  // Completed course form
  const [courseName, setCourseName] = useState('');
  const [provider, setProvider] = useState('');
  const [credits, setCredits] = useState('');
  const [gradeSystem, setGradeSystem] = useState('A-F');
  const [grade, setGrade] = useState('');
  const [courseHours, setCourseHours] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmitHours = async () => {
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
      resetForms();
    } catch (error) {
      console.error('Error registering study hours:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCourse = async () => {
    if (!courseName || !courseHours) return;

    setIsSubmitting(true);
    try {
      // First, register the completed course
      const courseResponse = await fetch('/api/learning-plans/completed-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          planId,
          courseName,
          provider,
          creditsHp: credits ? parseFloat(credits) : null,
          gradeSystem,
          gradeValue: grade,
          studyHours: parseFloat(courseHours),
          completionDate
        })
      });

      if (!courseResponse.ok) throw new Error('Failed to register completed course');

      // Then update progress with XP
      const xpEarned = 200 + (credits ? parseFloat(credits) * 50 : 0); // Base 200 XP + 50 per HP

      await fetch(`/api/learning-plans/${planId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          hoursSpent: parseFloat(courseHours),
          activityType: 'course_completed',
          activityDescription: `Slutförde kurs: ${courseName}${credits ? ` (${credits} HP)` : ''}`,
          xpEarned
        })
      });

      onSuccess();
      onClose();
      resetForms();
    } catch (error) {
      console.error('Error registering completed course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForms = () => {
    setStudyHours('');
    setStudyNotes('');
    setCourseName('');
    setProvider('');
    setCredits('');
    setGrade('');
    setCourseHours('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-navy-800 border-b border-navy-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Registrera framsteg</h2>
              <p className="text-sm text-gray-400 mt-1">{skillName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'hours'
                  ? 'bg-pink-600 text-white'
                  : 'bg-navy-700 text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Registrera studietimmar
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'course'
                  ? 'bg-pink-600 text-white'
                  : 'bg-navy-700 text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              Avslutad kurs
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {activeTab === 'hours' ? (
            <div className="space-y-4">
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
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Studiemetod
                </label>
                <select
                  value={studyMethod}
                  onChange={(e) => setStudyMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                          ? 'bg-pink-600 text-white'
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
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Vad lärde du dig? Vad var svårt?"
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
                onClick={handleSubmitHours}
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
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kursnamn
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="T.ex. Databaser 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lärosäte/Leverantör
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="T.ex. Stockholms universitet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Högskolepoäng (HP)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="7.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Studietimmar
                  </label>
                  <input
                    type="number"
                    value={courseHours}
                    onChange={(e) => setCourseHours(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Betygssystem
                  </label>
                  <select
                    value={gradeSystem}
                    onChange={(e) => setGradeSystem(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="A-F">A-F</option>
                    <option value="G-VG">G/VG/MVG</option>
                    <option value="Pass-Fail">Godkänd/Underkänd</option>
                    <option value="Numeric">Numerisk (0-100)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Betyg
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder={gradeSystem === 'A-F' ? 'B' : gradeSystem === 'G-VG' ? 'VG' : 'Godkänd'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slutförd datum
                </label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-300">
                  <strong>XP-belöning:</strong> {200 + (credits ? parseFloat(credits) * 50 : 0)} XP
                </p>
                <p className="text-xs text-green-200/70 mt-1">
                  200 XP bas + 50 XP per högskolepoäng
                </p>
              </div>

              <button
                onClick={handleSubmitCourse}
                disabled={!courseName || !courseHours || isSubmitting}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  courseName && courseHours && !isSubmitting
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                    : 'bg-navy-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registrerar...
                  </span>
                ) : (
                  'Registrera avslutad kurs'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}