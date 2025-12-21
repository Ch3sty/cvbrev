'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Linkedin, AlertCircle, Check, RotateCcw, Settings, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { useRouter } from 'next/navigation';
import type { CVDraft } from '../CVCreatorWizard';

interface Step1BasicInfoProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
  hasDraft: boolean;
  onRestoreDraft: (draft: CVDraft) => void;
  loadDraft: () => CVDraft | null;
  clearDraft: () => void;
}

export default function Step1BasicInfo({
  cvData,
  updateCVData,
  hasDraft,
  onRestoreDraft,
  loadDraft,
  clearDraft,
}: Step1BasicInfoProps) {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  // Show draft recovery dialog on mount if draft exists
  useEffect(() => {
    if (hasDraft && !cvData.personalInfo.fullName) {
      setShowDraftRecovery(true);
    }
  }, [hasDraft, cvData.personalInfo.fullName]);

  // Load profile data into CV when profile is available
  useEffect(() => {
    if (!loading && profile && !hasLoadedProfile) {
      // Endast ladda profildata om användaren inte redan har data i cvData
      if (!cvData.personalInfo.fullName) {
        updateCVData({
          personalInfo: {
            fullName: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.location || '',
            linkedIn: profile.linkedin_url || '',
          },
        });
        setHasLoadedProfile(true);
      }
    }
  }, [profile, loading, hasLoadedProfile, cvData.personalInfo.fullName, updateCVData]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      onRestoreDraft(draft);
    }
    setShowDraftRecovery(false);
  };

  const handleDismissDraft = () => {
    clearDraft();
    setShowDraftRecovery(false);
  };

  // Validation states
  const isProfileComplete =
    profile?.full_name?.trim() &&
    profile?.email?.trim() &&
    profile?.phone?.trim();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Om profilen är ofullständig
  if (!isProfileComplete) {
    return (
      <div className="space-y-6">
        {/* Draft Recovery Dialog */}
        {showDraftRecovery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Fortsätt där du slutade?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Du har ett sparat utkast. Vill du fortsätta med det?
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleRestoreDraft}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Ja, fortsätt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismissDraft}
                  >
                    Nej, börja om
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Incomplete Profile Alert */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 border border-pink-200 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Komplettera din profil först
            </h2>

            <p className="text-gray-600 mb-6">
              För att skapa ditt CV behöver vi dina kontaktuppgifter. Dessa hämtas från din profil och används inte i AI-genereringen.
            </p>

            {/* Missing fields */}
            <div className="w-full bg-white/50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3 text-left">Saknade uppgifter:</h3>
              <div className="space-y-2 text-left">
                {!profile?.full_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>För- och efternamn</span>
                  </div>
                )}
                {!profile?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>E-postadress</span>
                  </div>
                )}
                {!profile?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span>Telefonnummer</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => router.push('/dashboard/profil')}
              className="min-h-[48px] bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium px-8"
            >
              Gå till profilinställningar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* GDPR Info */}
        <div className="mt-6 p-4 bg-pink-50 rounded-xl border border-pink-100">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-pink-600" />
            GDPR-säkerhet
          </h3>
          <p className="text-sm text-gray-600">
            Dina personuppgifter hämtas från din profil och inkluderas automatiskt i CV:t.
            De skickas <strong>aldrig</strong> till AI:n utan används endast för att fylla i kontaktuppgifter i ditt färdiga CV.
          </p>
        </div>
      </div>
    );
  }

  // Profile is complete - show read-only data with confirmation
  return (
    <div className="space-y-6">
      {/* Draft Recovery Dialog */}
      {showDraftRecovery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Fortsätt där du slutade?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Du har ett sparat utkast. Vill du fortsätta med det?
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleRestoreDraft}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Ja, fortsätt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismissDraft}
                >
                  Nej, börja om
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-600 to-purple-600 rounded-full mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Dina kontaktuppgifter
        </h1>
        <p className="text-gray-600">
          Vi använder informationen från din profil. Den skickas inte till AI:n.
        </p>
      </div>

      {/* Profile Data Display (Read-only) */}
      <div className="space-y-4 max-w-lg mx-auto">
        {/* Full Name */}
        <div className="bg-gradient-to-br from-pink-50 via-purple-50/50 to-blue-50/30 rounded-xl p-4 border border-pink-100">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                För- och efternamn
              </p>
              <p className="text-base font-semibold text-gray-900">
                {cvData.personalInfo.fullName || profile?.full_name || '—'}
              </p>
            </div>
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>
        </div>

        {/* Email */}
        <div className="bg-gradient-to-br from-pink-50 via-purple-50/50 to-blue-50/30 rounded-xl p-4 border border-pink-100">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                E-postadress
              </p>
              <p className="text-base font-semibold text-gray-900 break-all">
                {cvData.personalInfo.email || profile?.email || '—'}
              </p>
            </div>
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>
        </div>

        {/* Phone */}
        <div className="bg-gradient-to-br from-pink-50 via-purple-50/50 to-blue-50/30 rounded-xl p-4 border border-pink-100">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Telefonnummer
              </p>
              <p className="text-base font-semibold text-gray-900">
                {cvData.personalInfo.phone || profile?.phone || '—'}
              </p>
            </div>
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          </div>
        </div>

        {/* Optional fields */}
        {(cvData.personalInfo.address || profile?.location) && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Stad (valfritt)
                </p>
                <p className="text-base font-medium text-gray-700">
                  {cvData.personalInfo.address || profile?.location}
                </p>
              </div>
            </div>
          </div>
        )}

        {(cvData.personalInfo.linkedIn || profile?.linkedin_url) && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <Linkedin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  LinkedIn (valfritt)
                </p>
                <p className="text-base font-medium text-gray-700 break-all">
                  {cvData.personalInfo.linkedIn || profile?.linkedin_url}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Link */}
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/profil')}
          className="min-h-[44px]"
        >
          <Settings className="w-4 h-4 mr-2" />
          Uppdatera profilinställningar
        </Button>
      </div>

      {/* GDPR Info */}
      <div className="mt-8 p-4 bg-pink-50 rounded-xl border border-pink-100">
        <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          GDPR-säkerhet
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Dina personuppgifter hämtas från din profil</li>
          <li>• De skickas aldrig till AI:n</li>
          <li>• Uppgifterna används endast i ditt färdiga CV-dokument</li>
          <li>• Du kan uppdatera dem när som helst i profilinställningar</li>
        </ul>
      </div>
    </div>
  );
}
