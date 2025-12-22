'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { motion, AnimatePresence } from 'framer-motion';
import CVUploadZone from '@/components/cv/cv-upload-zone';
import { FileText, Trash2, ExternalLink, AlertTriangle, Info, Crown, Edit, Clock, Eye, Download } from 'lucide-react';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function MinaCVPage() {
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvListLoading } = useCVStore();
  const { subscriptionTier, uploadCV, setGdprConsent: setProfileGdprConsent } = useProfile();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  const cvCount = cvs.length;

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const handleDeleteCV = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCV = async () => {
    try {
      if (!deleteId) return;
      setIsDeleting(true);

      const response = await fetch(`/api/cv/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      });

      if (response.ok) {
        fetchCVs();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte ta bort CV');
      }
    } catch (error: any) {
      console.error('Error deleting CV:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteId('');
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Sätt GDPR-consent i profile innan uppladdning
      setProfileGdprConsent(gdprConsent);

      // Extrahera titel från filnamn
      const title = file.name.split('.').slice(0, -1).join('.');
      const success = await uploadCV(file, title);

      if (success) {
        await fetchCVs();
        // Reset GDPR efter lyckad uppladdning
        setGdprConsent(false);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} veckor sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  // Extrahera en ren förhandsgranskning från CV-texten
  const getCleanPreview = (cvText: string | null): string => {
    if (!cvText) return 'Ingen förhandsgranskning tillgänglig';

    // Ta bort email-adresser
    let cleaned = cvText.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
    // Ta bort telefonnummer (olika format)
    cleaned = cleaned.replace(/(\+46|0)[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}/g, '');
    cleaned = cleaned.replace(/\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '');
    // Ta bort postnummer och städer som står ensamma
    cleaned = cleaned.replace(/\d{3}\s?\d{2}\s+[A-ZÅÄÖ][a-zåäö]+/g, '');

    // Dela upp i rader och filtrera bort korta/oönskade rader
    const lines = cleaned.split(/\n+/).map(line => line.trim()).filter(line => {
      // Filtrera bort tomma rader
      if (line.length < 3) return false;
      // Filtrera bort rader som bara är namn (kort och utan mellanrum förutom namn)
      if (line.length < 20 && !line.includes(' ') && /^[A-ZÅÄÖ]/.test(line)) return false;
      // Filtrera bort rubriker som "SAMMANFATTNING", "ERFARENHET", etc.
      if (/^[A-ZÅÄÖ\s]{4,20}$/.test(line) && line === line.toUpperCase()) return false;
      return true;
    });

    // Hitta första meningsfulla stycket (minst 50 tecken)
    const meaningfulText = lines.find(line => line.length > 50) || lines.join(' ');

    // Rensa upp extra mellanslag
    const finalText = meaningfulText.replace(/\s+/g, ' ').trim();

    // Begränsa längden och lägg till ellips
    if (finalText.length > 150) {
      // Försök bryta vid en punkt eller komma för naturligare slut
      const breakPoint = finalText.substring(0, 150).lastIndexOf('.');
      if (breakPoint > 80) {
        return finalText.substring(0, breakPoint + 1);
      }
      return finalText.substring(0, 147) + '...';
    }

    return finalText || 'Ingen förhandsgranskning tillgänglig';
  };

  const openCVInNewWindow = (cv: any) => {
    const newWindow = window.open('', '_blank', 'width=900,height=700');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${cv.file_name || 'CV'} - Jobbcoach.ai</title>
            <style>
              * {
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                padding: 0;
                margin: 0;
                line-height: 1.7;
                background: linear-gradient(135deg, #fdf2f8 0%, #ede9fe 100%);
                color: #1f2937;
                min-height: 100vh;
              }
              .header {
                background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%);
                color: white;
                padding: 24px 40px;
                box-shadow: 0 4px 20px rgba(236, 72, 153, 0.3);
              }
              .header h1 {
                margin: 0 0 8px 0;
                font-size: 24px;
                font-weight: 700;
              }
              .header .meta {
                opacity: 0.9;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .content {
                max-width: 850px;
                margin: 32px auto;
                padding: 0 24px;
              }
              .cv-container {
                background: white;
                padding: 48px;
                border-radius: 20px;
                box-shadow: 0 25px 80px rgba(0,0,0,0.12);
                white-space: pre-line;
                font-size: 15px;
              }
              .cv-container p {
                margin: 0 0 16px 0;
              }
              .footer {
                text-align: center;
                padding: 24px;
                color: #6b7280;
                font-size: 13px;
              }
              .footer a {
                color: #9333ea;
                text-decoration: none;
                font-weight: 500;
              }
              .footer a:hover {
                text-decoration: underline;
              }
              @media print {
                .header { display: none; }
                .footer { display: none; }
                body { background: white; }
                .cv-container {
                  box-shadow: none;
                  border-radius: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${cv.file_name || 'CV'}</h1>
              <div class="meta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Uppladdad: ${cv.created_at ? new Date(cv.created_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : 'okänt datum'}
              </div>
            </div>
            <div class="content">
              <div class="cv-container">${cv.cv_text ? cv.cv_text.replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'}</div>
            </div>
            <div class="footer">
              <a href="https://jobbcoach.ai" target="_blank">jobbcoach.ai</a> - Din AI-drivna karriärcoach
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="emerald" />

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 relative z-10">
        {/* Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
        >
          {/* Dekorativ orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-12 translate-x-12" />

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl shadow-lg">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate">
                Mina CV:n
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 font-medium">Ladda upp och hantera dina CV:n</p>
            </div>
          </div>
        </motion.div>

        {/* Info Box med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/80 backdrop-blur-xl border border-emerald-200/50 rounded-xl sm:rounded-2xl shadow-lg"
        >
          <div className="flex items-start gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0">
              <Info className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-slate-700">
              Detta är den centrala platsen för att ladda upp och hantera alla dina CV:n. Dina CV:n används för att skapa personliga brev och analysera din profil.
            </p>
          </div>
        </motion.div>

        {/* CV List - FÖRST! */}
        {cvs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 flex items-center min-w-0">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mr-2 sm:mr-3 flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="truncate">Dina CV:n</span>
                </h2>
                {/* Dynamisk räknare */}
                <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-emerald-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <span className="text-xs sm:text-sm font-semibold text-emerald-700 whitespace-nowrap">
                    {cvCount} / {subscriptionTier === 'premium' ? '∞' : '2'}
                  </span>
                </div>
              </div>

              {cvListLoading ? (
                <div className="flex justify-center items-center h-40">
                  <motion.div
                    className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {cvs.map((cv, index) => (
                    <motion.div
                      key={cv.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white border-2 border-emerald-200/50 rounded-2xl overflow-hidden transition-all hover:border-emerald-400 hover:shadow-2xl"
                      whileHover={{ y: -4 }}
                    >
                      {/* CV Icon Header */}
                      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-200/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                            <motion.div
                              className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex-shrink-0"
                              whileHover={{ rotate: 5, scale: 1.1 }}
                            >
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base md:text-lg truncate mb-0.5 sm:mb-1">{cv.file_name}</h3>
                              <div className="flex items-center text-[10px] sm:text-xs text-slate-600">
                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                                {formatDate(cv.created_at)}
                              </div>
                            </div>
                          </div>

                          {/* Delete button */}
                          <motion.button
                            onClick={() => handleDeleteCV(cv.id)}
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                            disabled={isDeleting && deleteId === cv.id}
                            title="Ta bort CV"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isDeleting && deleteId === cv.id ? (
                              <motion.div
                                className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-500 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                            ) : (
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </motion.button>
                        </div>
                      </div>

                      {/* CV Preview */}
                      <div className="p-3 sm:p-4 md:p-6">
                        <div className="bg-emerald-50/50 rounded-xl p-3 sm:p-4 mb-4 min-h-[80px] border border-emerald-100">
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                            {getCleanPreview(cv.cv_text)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <motion.button
                            onClick={() => openCVInNewWindow(cv)}
                            className="flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg touch-manipulation min-h-[44px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Visa</span>
                          </motion.button>

                          <motion.button
                            onClick={() => router.push(`/dashboard/cv-mallar?cv=${cv.id}`)}
                            className="flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg touch-manipulation min-h-[44px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Download className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Ladda ner</span>
                          </motion.button>

                          <motion.button
                            onClick={() => router.push(`/dashboard/profil/cv/${cv.id}/edit`)}
                            className="flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-white border border-emerald-300 hover:bg-emerald-50 text-slate-700 rounded-lg transition-all shadow-sm hover:shadow-md touch-manipulation min-h-[44px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Edit className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Redigera</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State - Om inga CV:n finns */}
        {cvs.length === 0 && !cvListLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 sm:mb-6 border-2 border-dashed border-emerald-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 bg-gradient-to-br from-emerald-50 to-teal-50"
          >
            <div className="flex flex-col items-center justify-center text-slate-600">
              <motion.div
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">Inga CV:n uppladdade än</p>
              <p className="text-xs sm:text-sm text-slate-500 text-center max-w-sm">
                Ladda upp ditt första CV för att komma igång med personliga brev och CV-analys
              </p>
            </div>
          </motion.div>
        )}

        {/* CV Upload Zone - SIST! */}
        {cvCount >= (subscriptionTier === 'premium' ? 999 : 2) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 bg-amber-50/80 backdrop-blur-xl border border-amber-200/50 rounded-xl sm:rounded-2xl shadow-lg"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex-shrink-0">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">CV-gräns nådd</h4>
                <p className="text-slate-700 text-xs sm:text-sm mb-3">
                  {subscriptionTier === 'premium'
                    ? 'Du har nått gränsen för antal CV:n. Ta bort ett befintligt CV för att ladda upp ett nytt.'
                    : 'Som gratisanvändare kan du ha 2 CV. Ta bort ett CV för att ladda upp ett nytt, eller uppgradera till Premium för obegränsade uppladdningar.'}
                </p>
                {subscriptionTier === 'free' && (
                  <motion.button
                    onClick={() => router.push('/dashboard/profil/prenumeration')}
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm touch-manipulation min-h-[44px]"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Uppgradera till Premium</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-200/50 shadow-xl"
          >
            <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl font-bold text-slate-900 flex items-center">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mr-2 sm:mr-3 flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="truncate">Ladda upp nytt CV</span>
            </h2>

            <CVUploadZone
              onUpload={handleUpload}
              onGdprChange={setGdprConsent}
              disabled={isUploading}
              maxSizeMB={10}
            />
          </motion.div>
        )}

        {/* Delete confirmation modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl mx-3 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                  </div>
                  <span className="truncate">Bekräfta borttagning</span>
                </h3>
              </div>

              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                  Är du säker på att du vill ta bort detta CV?
                </p>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 flex items-center mb-4 sm:mb-5 gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-pink-100 rounded-lg flex-shrink-0">
                    <FileText className="text-pink-600 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-sm sm:text-base text-gray-900 font-medium truncate">
                    {cvs.find(cv => cv.id === deleteId)?.file_name || 'CV'}
                  </span>
                </div>
                <div className="flex items-start p-2.5 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200 gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-xs sm:text-sm">
                    Detta kan inte ångras och all data kommer att raderas permanent.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-2 sm:gap-3 bg-gray-50">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 sm:px-6 py-2 bg-white text-gray-700 rounded-lg sm:rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                  disabled={isDeleting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={confirmDeleteCV}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg sm:rounded-xl hover:from-red-700 hover:to-pink-700 flex items-center transition-all font-medium shadow-lg disabled:opacity-50 text-sm sm:text-base touch-manipulation"
                  disabled={isDeleting}
                  whileHover={!isDeleting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isDeleting ? { scale: 0.98 } : {}}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full mr-1.5 sm:mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="truncate">Tar bort...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0"/>
                      <span className="truncate">Ta bort CV</span>
                    </>
                  )}
                </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
