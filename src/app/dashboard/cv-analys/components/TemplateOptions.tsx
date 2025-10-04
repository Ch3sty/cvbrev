// src/app/dashboard/cv-analys/components/TemplateOptions.tsx
'use client';

import { useState, useEffect } from 'react';
import { Camera, Linkedin, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { SimpleTemplate } from '@/lib/cv/simple-templates';

interface TemplateOptionsProps {
  template: SimpleTemplate | null;
  userProfile: {
    hasPhoto: boolean;
    hasLinkedIn: boolean;
  };
  onOptionsChange?: (options: { includePhoto: boolean; includeLinkedIn: boolean }) => void;
}

export default function TemplateOptions({
  template,
  userProfile,
  onOptionsChange
}: TemplateOptionsProps) {
  const [includePhoto, setIncludePhoto] = useState(false);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(false);

  // Reset når template ändras
  useEffect(() => {
    if (template?.features?.supportsPhoto && userProfile.hasPhoto) {
      setIncludePhoto(true);
    } else {
      setIncludePhoto(false);
    }

    if (template?.features?.supportsLinkedIn && userProfile.hasLinkedIn) {
      setIncludeLinkedIn(true);
    } else {
      setIncludeLinkedIn(false);
    }
  }, [template, userProfile]);

  // Notifiera parent om ändringar
  useEffect(() => {
    onOptionsChange?.({ includePhoto, includeLinkedIn });
  }, [includePhoto, includeLinkedIn, onOptionsChange]);

  if (!template?.features) return null;

  const { supportsPhoto, supportsLinkedIn } = template.features;

  if (!supportsPhoto && !supportsLinkedIn) return null;

  const hasMissingData =
    (supportsPhoto && !userProfile.hasPhoto) ||
    (supportsLinkedIn && !userProfile.hasLinkedIn);

  return (
    <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <div className="flex-1">
          <h5 className="font-semibold text-gray-900 text-base mb-1">
            Anpassa "{template.name}"
          </h5>
          <p className="text-sm text-gray-600">
            Denna mall stödjer extra funktioner för ett mer professionellt CV
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {supportsPhoto && (
          <label className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
            includePhoto && userProfile.hasPhoto
              ? 'border-blue-500 bg-white shadow-sm'
              : userProfile.hasPhoto
              ? 'border-gray-200 bg-white hover:border-blue-300'
              : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          }`}>
            <input
              type="checkbox"
              checked={includePhoto}
              onChange={(e) => setIncludePhoto(e.target.checked)}
              disabled={!userProfile.hasPhoto}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Camera className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">
                Inkludera profilfoto
              </div>
              {!userProfile.hasPhoto && (
                <div className="text-xs text-red-600 mt-0.5">
                  Saknas i profil
                </div>
              )}
            </div>
            {userProfile.hasPhoto && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Tillgängligt
              </Badge>
            )}
          </label>
        )}

        {supportsLinkedIn && (
          <label className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
            includeLinkedIn && userProfile.hasLinkedIn
              ? 'border-blue-500 bg-white shadow-sm'
              : userProfile.hasLinkedIn
              ? 'border-gray-200 bg-white hover:border-blue-300'
              : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          }`}>
            <input
              type="checkbox"
              checked={includeLinkedIn}
              onChange={(e) => setIncludeLinkedIn(e.target.checked)}
              disabled={!userProfile.hasLinkedIn}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Linkedin className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">
                Inkludera LinkedIn-länk
              </div>
              {!userProfile.hasLinkedIn && (
                <div className="text-xs text-red-600 mt-0.5">
                  Saknas i profil
                </div>
              )}
            </div>
            {userProfile.hasLinkedIn && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Tillgängligt
              </Badge>
            )}
          </label>
        )}
      </div>

      {hasMissingData && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium mb-1">
                Saknad information
              </p>
              <p className="text-xs text-amber-800 mb-2">
                Vissa funktioner kräver att du först lägger till information i din profil
              </p>
              <Link
                href="/profile"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Gå till Profil och lägg till →
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
