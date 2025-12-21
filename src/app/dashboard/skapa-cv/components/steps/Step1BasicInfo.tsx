'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Linkedin, AlertCircle, Check, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { CVDraft } from '../CVCreatorWizard';

interface Step1BasicInfoProps {
  cvData: CVDraft;
  updateCVData: (updates: Partial<CVDraft>) => void;
  hasDraft: boolean;
  onRestoreDraft: (draft: CVDraft) => void;
  loadDraft: () => CVDraft | null;
  clearDraft: () => void;
}

// Phone number formatting helper
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format Swedish mobile numbers: 070-XXX XX XX
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
};

// Validation helpers
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
};

export default function Step1BasicInfo({
  cvData,
  updateCVData,
  hasDraft,
  onRestoreDraft,
  loadDraft,
  clearDraft,
}: Step1BasicInfoProps) {
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Show draft recovery dialog on mount if draft exists
  useEffect(() => {
    if (hasDraft && !cvData.personalInfo.fullName) {
      setShowDraftRecovery(true);
    }
  }, [hasDraft, cvData.personalInfo.fullName]);

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

  const updatePersonalInfo = (field: string, value: string) => {
    updateCVData({
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value,
      },
    });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation states
  const nameValid = (cvData.personalInfo.fullName?.trim().length || 0) >= 2;
  const emailValid = isValidEmail(cvData.personalInfo.email || '');
  const phoneValid = isValidPhone(cvData.personalInfo.phone || '');

  const getFieldState = (field: string, isValid: boolean) => {
    if (!touched[field]) return 'default';
    return isValid ? 'valid' : 'invalid';
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Dina kontaktuppgifter
        </h1>
        <p className="text-gray-600">
          Börja med grundläggande information så arbetsgivare kan nå dig.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5 max-w-lg mx-auto">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            För- och efternamn <span className="text-pink-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="fullName"
              type="text"
              value={cvData.personalInfo.fullName || ''}
              onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="Anna Andersson"
              className={`h-12 pr-10 ${
                getFieldState('fullName', nameValid) === 'invalid'
                  ? 'border-red-500 focus:ring-red-500'
                  : getFieldState('fullName', nameValid) === 'valid'
                    ? 'border-green-500 focus:ring-green-500'
                    : ''
              }`}
              autoFocus
            />
            {touched.fullName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {nameValid ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {touched.fullName && !nameValid && (
            <p className="text-sm text-red-600">Ange ditt för- och efternamn</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            E-postadress <span className="text-pink-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={cvData.personalInfo.email || ''}
              onChange={(e) => updatePersonalInfo('email', e.target.value.toLowerCase())}
              onBlur={() => handleBlur('email')}
              placeholder="anna.andersson@exempel.se"
              className={`h-12 pr-10 ${
                getFieldState('email', emailValid) === 'invalid'
                  ? 'border-red-500 focus:ring-red-500'
                  : getFieldState('email', emailValid) === 'valid'
                    ? 'border-green-500 focus:ring-green-500'
                    : ''
              }`}
            />
            {touched.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {emailValid ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {touched.email && !emailValid && (
            <p className="text-sm text-red-600">Ange en giltig e-postadress</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            Telefonnummer <span className="text-pink-600">*</span>
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={cvData.personalInfo.phone || ''}
              onChange={(e) => updatePersonalInfo('phone', formatPhoneNumber(e.target.value))}
              onBlur={() => handleBlur('phone')}
              placeholder="070-123 45 67"
              className={`h-12 pr-10 ${
                getFieldState('phone', phoneValid) === 'invalid'
                  ? 'border-red-500 focus:ring-red-500'
                  : getFieldState('phone', phoneValid) === 'valid'
                    ? 'border-green-500 focus:ring-green-500'
                    : ''
              }`}
            />
            {touched.phone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {phoneValid ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {touched.phone && !phoneValid && (
            <p className="text-sm text-red-600">Ange ett giltigt telefonnummer</p>
          )}
        </div>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-br from-slate-50 to-slate-100 px-3 text-sm text-gray-500">
              Valfritt
            </span>
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Stad
          </Label>
          <Input
            id="address"
            type="text"
            value={cvData.personalInfo.address || ''}
            onChange={(e) => updatePersonalInfo('address', e.target.value)}
            placeholder="Stockholm"
            className="h-12"
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label htmlFor="linkedIn" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-gray-500" />
            LinkedIn
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              linkedin.com/in/
            </span>
            <Input
              id="linkedIn"
              type="text"
              value={cvData.personalInfo.linkedIn?.replace('linkedin.com/in/', '').replace('https://', '').replace('www.', '') || ''}
              onChange={(e) => {
                const value = e.target.value.replace('linkedin.com/in/', '').replace('https://', '').replace('www.', '');
                updatePersonalInfo('linkedIn', value ? `linkedin.com/in/${value}` : '');
              }}
              placeholder="anna-andersson"
              className="h-12 pl-[130px]"
            />
          </div>
          <p className="text-xs text-gray-500">
            Ange bara ditt användarnamn, inte hela länken
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
        <h3 className="font-medium text-gray-900 mb-2">Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Använd en professionell e-postadress (helst förnamn.efternamn@...)</li>
          <li>• Dubbelkolla att telefonnumret är korrekt - det är så arbetsgivare når dig!</li>
          <li>• LinkedIn är inte obligatoriskt, men kan stärka din ansökan</li>
        </ul>
      </div>
    </div>
  );
}
