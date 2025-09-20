// src/components/learning/CompleteEducationModal.tsx
'use client';

import React, { useState } from 'react';
import { X, GraduationCap, Loader2, Trophy } from 'lucide-react';

interface CompleteEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  planId: string;
  onSuccess: () => void;
  totalHours?: number;
}

export default function CompleteEducationModal({
  isOpen,
  onClose,
  skillId,
  skillName,
  planId,
  onSuccess,
  totalHours = 200
}: CompleteEducationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Mark the skill as completed with a significant amount of XP
      const response = await fetch(`/api/learning-plans/${planId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          hoursSpent: totalHours,
          activityType: 'skill_completed',
          activityDescription: `Avslutade utbildning: ${skillName}`,
          xpEarned: 500, // Significant XP reward for completion
          notes: completionNotes,
          date: completionDate
        })
      });

      if (!response.ok) throw new Error('Failed to mark as complete');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error marking as complete:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Slutför utbildning
              </h2>
              <p className="text-purple-100 mt-1">{skillName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Achievement illustration */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Trophy className="w-24 h-24 text-yellow-500" />
              <div className="absolute -top-2 -right-2">
                <span className="text-3xl">🎉</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Grattis till din prestation!
            </h3>
            <p className="text-gray-400">
              Du är på väg att markera denna utbildning som slutförd.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slutförd datum
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reflektioner (valfritt)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Dela dina tankar om utbildningen, vad du lärt dig, och hur du planerar att använda dina nya kunskaper..."
            />
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-300">
                  Slutförande-belöning
                </p>
                <p className="text-xs text-purple-200/70 mt-1">
                  För att markera denna milstolpe
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-400">500 XP</p>
                <p className="text-xs text-yellow-300/70">+ Achievement</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-medium bg-navy-700 text-gray-300 hover:bg-navy-600 transition-colors"
            >
              Avbryt
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                !isSubmitting
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-navy-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Slutför...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Markera som slutförd
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}