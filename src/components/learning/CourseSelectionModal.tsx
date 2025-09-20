// src/components/learning/CourseSelectionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Course {
  title: string;
  provider?: string;
  duration?: string;
  cost?: string;
  url?: string;
}

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  courses: Course[];
  action: 'applied' | 'accepted' | 'enrolled';
  onConfirm: (selectedCourses: Course[]) => void;
}

export default function CourseSelectionModal({
  isOpen,
  onClose,
  skillId,
  skillName,
  courses,
  action,
  onConfirm
}: CourseSelectionModalProps) {
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset selection when modal opens
    if (isOpen) {
      setSelectedCourses(new Set());
    }
  }, [isOpen]);

  const handleToggleCourse = (courseTitle: string) => {
    const newSelection = new Set(selectedCourses);
    if (newSelection.has(courseTitle)) {
      newSelection.delete(courseTitle);
    } else {
      newSelection.add(courseTitle);
    }
    setSelectedCourses(newSelection);
  };

  const handleSubmit = async () => {
    const selected = courses.filter(course => selectedCourses.has(course.title));
    if (selected.length > 0) {
      setIsSubmitting(true);
      await onConfirm(selected);
      setIsSubmitting(false);
      onClose();
    }
  };

  const getActionText = () => {
    switch (action) {
      case 'applied':
        return {
          title: 'Välj kurser att ansöka till',
          button: 'Markera som ansökt',
          description: 'Välj vilka kurser du har ansökt till för denna kompetens:'
        };
      case 'accepted':
        return {
          title: 'Välj kurs du blivit antagen till',
          button: 'Markera som antagen',
          description: 'Välj vilken kurs du har blivit antagen till:'
        };
      case 'enrolled':
        return {
          title: 'Välj kurs att påbörja',
          button: 'Påbörja studier',
          description: 'Välj vilken kurs du vill påbörja studier för:'
        };
      default:
        return {
          title: 'Välj kurs',
          button: 'Bekräfta',
          description: 'Välj en kurs:'
        };
    }
  };

  if (!isOpen) return null;

  const actionText = getActionText();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800 border-b border-navy-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-pink-400" />
                {actionText.title}
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
        <div className="p-6">
          <p className="text-sm text-gray-300 mb-4">{actionText.description}</p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {courses.map((course, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedCourses.has(course.title)
                    ? 'border-pink-500/50 bg-pink-500/10'
                    : 'border-navy-600 bg-navy-700/30 hover:border-pink-500/30 hover:bg-navy-700/50'
                }`}
                onClick={() => handleToggleCourse(course.title)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1">{course.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {course.provider && <span>{course.provider}</span>}
                      {course.duration && <span>• {course.duration}</span>}
                      {course.cost && <span>• {course.cost}</span>}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedCourses.has(course.title)
                      ? 'bg-pink-500 border-pink-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedCourses.has(course.title) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedCourses.size === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Bearbetar...
                </span>
              ) : (
                actionText.button
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}