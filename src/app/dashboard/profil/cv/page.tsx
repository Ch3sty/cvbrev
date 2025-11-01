'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { motion, AnimatePresence } from 'framer-motion';
import CVUploadZone from '@/components/cv/cv-upload-zone';
import { FileText, Trash2, ExternalLink, AlertTriangle, Info, Crown, Edit, Clock, Eye } from 'lucide-react';

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

  const openCVInNewWindow = (cv: any) => {
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${cv.file_name || 'CV'}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 40px;
                line-height: 1.6;
                background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
                color: #1f2937;
              }
              .cv-container {
                max-width: 800px;
                margin: 0 auto;
                white-space: pre-line;
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              }
              h1 {
                color: #111827;
                margin-bottom: 12px;
              }
              .meta {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 32px;
                padding-bottom: 16px;
                border-bottom: 2px solid #f3f4f6;
              }
            </style>
          </head>
          <body>
            <div class="cv-container">
              <h1>${cv.file_name || 'CV'}</h1>
              <div class="meta">
                📅 Uppladdad: ${cv.created_at ? new Date(cv.created_at).toLocaleDateString('sv-SE') : 'okänt datum'}
              </div>
              <div>${cv.cv_text ? cv.cv_text.replace(/\n/g, '<br />') : 'Inget CV-innehåll tillgängligt'}</div>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
              Mina CV:n
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 font-medium">Ladda upp och hantera dina CV:n</p>
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
      >
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Detta är den centrala platsen för att ladda upp och hantera alla dina CV:n. Dina CV:n används för att skapa personliga brev och analysera din profil.
          </p>
        </div>
      </motion.div>

      {/* CV List - FÖRST! */}
      {cvs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-6"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50 shadow-xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center min-w-0">
                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mr-2 sm:mr-3 flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="truncate">Dina CV:n</span>
              </h2>
              {/* Dynamisk räknare */}
              <div className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gray-100 rounded-lg sm:rounded-xl flex-shrink-0">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                  {cvCount} / {subscriptionTier === 'premium' ? '∞' : '2'}
                </span>
              </div>
            </div>

            {cvListLoading ? (
              <div className="flex justify-center items-center h-40">
                <motion.div
                  className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
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
                    className="group relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-pink-400 hover:shadow-2xl"
                    whileHover={{ y: -4 }}
                  >
                    {/* CV Icon Header */}
                    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-b border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                          <motion.div
                            className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg sm:rounded-xl flex-shrink-0"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                          >
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate mb-0.5 sm:mb-1">{cv.file_name}</h3>
                            <div className="flex items-center text-[10px] sm:text-xs text-gray-600">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                              {formatDate(cv.created_at)}
                            </div>
                          </div>
                        </div>

                        {/* Delete button */}
                        <motion.button
                          onClick={() => handleDeleteCV(cv.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0 touch-manipulation"
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
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-32 overflow-hidden relative border border-gray-100">
                        <div className="text-xs text-gray-700 line-clamp-4">
                          {cv.cv_text && cv.cv_text.length > 200
                            ? cv.cv_text.slice(0, 200) + '...'
                            : cv.cv_text || 'Ingen förhandsgranskning tillgänglig'}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <motion.button
                          onClick={() => openCVInNewWindow(cv)}
                          className="flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg touch-manipulation"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Visa</span>
                        </motion.button>

                        <motion.button
                          onClick={() => router.push(`/dashboard/profil/cv/${cv.id}/edit`)}
                          className="flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] sm:text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg touch-manipulation"
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
          className="mb-4 sm:mb-6 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 bg-gray-50"
        >
          <div className="flex flex-col items-center justify-center text-gray-600">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </motion.div>
            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Inga CV:n uppladdade än</p>
            <p className="text-xs sm:text-sm text-gray-500 text-center">Ladda upp ditt första CV för att komma igång</p>
          </div>
        </motion.div>
      )}

      {/* CV Upload Zone - SIST! */}
      {cvCount >= (subscriptionTier === 'premium' ? 999 : 2) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl sm:rounded-2xl"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">CV-gräns nådd</h4>
              <p className="text-gray-700 text-xs sm:text-sm mb-3">
                {subscriptionTier === 'premium'
                  ? 'Du har nått gränsen för antal CV:n. Ta bort ett befintligt CV för att ladda upp ett nytt.'
                  : 'Som gratisanvändare kan du ha 2 CV. Ta bort ett CV för att ladda upp ett nytt, eller uppgradera till Premium för obegränsade uppladdningar.'}
              </p>
              {subscriptionTier === 'free' && (
                <motion.button
                  onClick={() => router.push('/dashboard/profil/prenumeration')}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm touch-manipulation"
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
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200/50 shadow-xl"
        >
          <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mr-2 sm:mr-3 flex-shrink-0">
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
  );
}
