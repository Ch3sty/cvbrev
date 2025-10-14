'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { motion, AnimatePresence } from 'framer-motion';
import CVUploader from '@/components/cv/cv-uploader';
import { FileText, Upload, Trash2, ExternalLink, SearchCheck, AlertTriangle, Info, Crown } from 'lucide-react';

export default function MinaCVPage() {
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvListLoading } = useCVStore();
  const { subscriptionTier } = useProfile();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');

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

  const handleUploadSuccess = () => {
    fetchCVs();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Mina CV:n
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Ladda upp och hantera dina CV:n</p>
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
      >
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Detta är den centrala platsen för att ladda upp och hantera alla dina CV:n. Dina CV:n används för att skapa personliga brev och analysera din profil.
          </p>
        </div>
      </motion.div>

      {/* CV List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 mr-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Dina CV:n
            </h2>
            {/* Dynamisk räknare */}
            <div className="px-4 py-2 bg-gray-100 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">
                {cvCount} / {subscriptionTier === 'premium' ? '∞' : '1'}
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
          ) : cvs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50"
            >
              <div className="flex flex-col items-center justify-center text-gray-600">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FileText className="w-10 h-10 text-blue-600" />
                </motion.div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Inga CV:n uppladdade än</p>
                <p className="text-sm text-gray-500">Ladda upp ditt första CV för att komma igång</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {cvs.map((cv, index) => (
                <motion.div
                  key={cv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-pink-500/50 hover:shadow-xl"
                  whileHover={{ y: -4 }}
                >
                  <div className="p-6 flex items-start">
                    <motion.div
                      className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl mr-4 flex-shrink-0"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-grow">
                      <h3 className="font-semibold mb-1 text-gray-900 text-lg">{cv.file_name}</h3>
                      {cv.created_at && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <Upload className="w-3 h-3 mr-1" />
                          Uppladdad: {new Date(cv.created_at).toLocaleDateString('sv-SE')}
                        </p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleDeleteCV(cv.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
                      disabled={isDeleting && deleteId === cv.id}
                      title="Ta bort CV"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isDeleting && deleteId === cv.id ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>

                  {/* CV Preview Section */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="bg-white rounded-xl p-5 shadow-sm max-h-48 overflow-auto text-gray-700 text-sm relative border border-gray-200">
                      {/* Preview Content */}
                      <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-line' }}>
                        {cv.cv_text && cv.cv_text.length > 400
                          ? cv.cv_text.slice(0, 400) + '...'
                          : cv.cv_text || 'Ingen förhandsgranskning tillgänglig'}
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex justify-end mt-4 space-x-3">
                      <motion.button
                        onClick={() => {
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
                        }}
                        className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visa fullständigt CV
                      </motion.button>

                      {/* CV-analys knapp för Premium-användare */}
                      {subscriptionTier === 'premium' && (
                        <motion.button
                          className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                          onClick={() => router.push(`/analysera-cv?id=${cv.id}`)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <SearchCheck className="w-4 h-4 mr-2" />
                          Analysera CV
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* CV Uploader */}
      {cvCount >= (subscriptionTier === 'premium' ? 999 : 1) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-2xl"
        >
          <div className="flex items-start">
            <div className="p-2 bg-yellow-100 rounded-lg mr-4">
              <Info className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-gray-900 mb-2">CV-gräns nådd</h4>
              <p className="text-gray-700 text-sm mb-3">
                {subscriptionTier === 'premium'
                  ? 'Du har nått gränsen för antal CV:n. Ta bort ett befintligt CV för att ladda upp ett nytt.'
                  : 'Som gratisanvändare kan du ha 1 CV. Ta bort ditt nuvarande CV för att ladda upp ett nytt, eller uppgradera till Premium för obegränsade uppladdningar.'}
              </p>
              {subscriptionTier === 'free' && (
                <motion.button
                  onClick={() => router.push('/dashboard/profil/prenumeration')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Uppgradera till Premium
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
        >
          <CVUploader
            onSuccess={handleUploadSuccess}
            onError={(error) => console.error('CV upload error:', error)}
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
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  Bekräfta borttagning
                </h3>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Är du säker på att du vill ta bort detta CV?
                </p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center mb-5">
                  <div className="p-2 bg-pink-100 rounded-lg mr-3">
                    <FileText className="text-pink-600 w-5 h-5" />
                  </div>
                  <span className="text-gray-900 font-medium">
                    {cvs.find(cv => cv.id === deleteId)?.file_name || 'CV'}
                  </span>
                </div>
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    Detta kan inte ångras och all data kommer att raderas permanent.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                  disabled={isDeleting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={confirmDeleteCV}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 flex items-center transition-all font-medium shadow-lg disabled:opacity-50"
                  disabled={isDeleting}
                  whileHover={!isDeleting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isDeleting ? { scale: 0.98 } : {}}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Tar bort...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2"/>
                      Ta bort CV
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
