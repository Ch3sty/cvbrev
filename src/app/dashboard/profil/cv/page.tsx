'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, FileText, Trash2, CheckCircle2 } from 'lucide-react';

import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import CVUploadZone from '@/components/cv/cv-upload-zone';

import CvHeroBanner from './components/CvHeroBanner';
import CvUploadIllustration from './components/CvUploadIllustration';
import CvUnlocksFlow from './components/CvUnlocksFlow';
import CvCard from './components/CvCard';
import CvLimitBanner from './components/CvLimitBanner';

const FREE_LIMIT = 2;

export default function MinaCVPage() {
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvListLoading } = useCVStore();
  const {
    subscriptionTier,
    uploadCV,
    setGdprConsent: setProfileGdprConsent,
  } = useProfile();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const cvCount = cvs.length;
  const isPremium = subscriptionTier === 'premium';
  const limitReached = !isPremium && cvCount >= FREE_LIMIT;
  const latestUploadedAt =
    cvs.length > 0
      ? cvs
          .map((c) => c.created_at)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      : null;

  useEffect(() => {
    let cancelled = false;
    fetchCVs().finally(() => {
      if (!cancelled) setHasFetched(true);
    });
    return () => {
      cancelled = true;
    };
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
      setProfileGdprConsent(gdprConsent);
      const title = file.name.split('.').slice(0, -1).join('.');
      const success = await uploadCV(file, title);
      if (success) {
        await fetchCVs();
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
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} veckor sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  const getCleanPreview = (cvText: string | null): string => {
    if (!cvText) return 'Ingen förhandsgranskning tillgänglig';
    let cleaned = cvText.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
    cleaned = cleaned.replace(/(\+46|0)[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}/g, '');
    cleaned = cleaned.replace(/\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '');
    cleaned = cleaned.replace(/\d{3}\s?\d{2}\s+[A-ZÅÄÖ][a-zåäö]+/g, '');
    const lines = cleaned
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => {
        if (line.length < 3) return false;
        if (line.length < 20 && !line.includes(' ') && /^[A-ZÅÄÖ]/.test(line))
          return false;
        if (/^[A-ZÅÄÖ\s]{4,20}$/.test(line) && line === line.toUpperCase())
          return false;
        return true;
      });
    const meaningfulText =
      lines.find((line) => line.length > 50) || lines.join(' ');
    const finalText = meaningfulText.replace(/\s+/g, ' ').trim();
    if (finalText.length > 150) {
      const breakPoint = finalText.substring(0, 150).lastIndexOf('.');
      if (breakPoint > 80) return finalText.substring(0, breakPoint + 1);
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
              * { box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                padding: 0; margin: 0; line-height: 1.7;
                background: linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%);
                color: #1f2937; min-height: 100vh;
              }
              .header {
                background: linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%);
                color: white; padding: 24px 40px;
                box-shadow: 0 12px 28px -8px rgba(220, 38, 38, 0.35);
              }
              .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; }
              .header .meta { opacity: 0.9; font-size: 14px; display: flex; align-items: center; gap: 8px; }
              .content { max-width: 850px; margin: 32px auto; padding: 0 24px; }
              .cv-container {
                background: white; padding: 48px; border-radius: 20px;
                box-shadow: 0 25px 80px rgba(0,0,0,0.12);
                white-space: pre-line; font-size: 15px;
              }
              .cv-container p { margin: 0 0 16px 0; }
              .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 13px; }
              .footer a { color: #DC2626; text-decoration: none; font-weight: 500; }
              .footer a:hover { text-decoration: underline; }
              @media print {
                .header, .footer { display: none; }
                body { background: white; }
                .cv-container { box-shadow: none; border-radius: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${cv.file_name || 'CV'}</h1>
              <div class="meta">
                Uppladdad: ${
                  cv.created_at
                    ? new Date(cv.created_at).toLocaleDateString('sv-SE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'okänt datum'
                }
              </div>
            </div>
            <div class="content">
              <div class="cv-container">${
                cv.cv_text
                  ? cv.cv_text.replace(/\n/g, '<br />')
                  : 'Inget CV-innehåll tillgängligt'
              }</div>
            </div>
            <div class="footer">
              <a href="https://jobbcoach.ai" target="_blank">jobbcoach.ai</a> · din karriärcoach
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const scrollToList = () => {
    const el = document.getElementById('cv-list');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Vi vantar med att rendera empty/populated tills forsta fetchCVs har kort.
  // Annars flashar empty-hero forst (cvs ar [] vid mount) och hoppar till
  // populated nar datan kommit.
  const initialLoading = !hasFetched || cvListLoading;
  const isEmpty = hasFetched && cvCount === 0;

  if (initialLoading) {
    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-5 sm:space-y-6">
        <HeroSkeleton />
        <BodySkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-5 sm:space-y-6">
      <CvHeroBanner
        mode={isEmpty ? 'empty' : 'populated'}
        cvCount={cvCount}
        isPremium={isPremium}
        latestUploadedAt={latestUploadedAt}
        cvLimit={FREE_LIMIT}
      />

      {/* Empty state body */}
      {isEmpty && (
        <>
          <CvUploadIllustration />
          <CvUnlocksFlow variant="full" />

          <div id="upload-zone" className="scroll-mt-6">
            <UploadCard>
              <CVUploadZone
                onUpload={handleUpload}
                onGdprChange={setGdprConsent}
                disabled={isUploading}
                maxSizeMB={10}
              />
            </UploadCard>
          </div>

          <TrustChips />
        </>
      )}

      {/* Populated state */}
      {cvCount > 0 && (
        <>
          <CvUnlocksFlow variant="compact" />

          {limitReached && (
            <CvLimitBanner
              cvCount={cvCount}
              cvLimit={FREE_LIMIT}
              isPremium={isPremium}
              onScrollToList={scrollToList}
            />
          )}

          <section
            id="cv-list"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 min-w-0">
                <span className="truncate">Dina CV</span>
                <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 tabular-nums">
                  {cvCount} / {isPremium ? '∞' : FREE_LIMIT}
                </span>
              </h2>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {cvs.map((cv, i) => (
                <CvCard
                  key={cv.id}
                  cv={cv}
                  index={i}
                  isDeleting={isDeleting && deleteId === cv.id}
                  onView={() => openCVInNewWindow(cv)}
                  onDownload={() =>
                    router.push(`/dashboard/cv-mallar?cv=${cv.id}`)
                  }
                  onEdit={() =>
                    router.push(`/dashboard/profil/cv/${cv.id}/edit`)
                  }
                  onDelete={() => handleDeleteCV(cv.id)}
                  preview={getCleanPreview(cv.cv_text)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </section>

          {!limitReached && (
            <div id="upload-zone" className="scroll-mt-6">
              <UploadCard subdued>
                <CVUploadZone
                  onUpload={handleUpload}
                  onGdprChange={setGdprConsent}
                  disabled={isUploading}
                  maxSizeMB={10}
                />
              </UploadCard>
            </div>
          )}
        </>
      )}

      <DeleteConfirmModal
        open={showDeleteConfirm}
        fileName={cvs.find((cv) => cv.id === deleteId)?.file_name || 'CV'}
        isDeleting={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteCV}
      />
    </div>
  );
}

function UploadCard({
  children,
  subdued = false,
}: {
  children: React.ReactNode;
  subdued?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          {subdued ? 'Ladda upp ytterligare CV' : 'Ladda upp ditt CV nu'}
        </h2>
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white"
          style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
        >
          30 sek
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function HeroSkeleton() {
  return (
    <div
      className="rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-rose-50 animate-pulse"
      style={{ height: 320 }}
      aria-hidden="true"
    />
  );
}

function BodySkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div
        className="rounded-3xl bg-white border border-slate-200/70 animate-pulse"
        style={{ height: 280 }}
        aria-hidden="true"
      />
      <div
        className="rounded-3xl bg-white border border-slate-200/70 animate-pulse"
        style={{ height: 220 }}
        aria-hidden="true"
      />
    </div>
  );
}

function TrustChips() {
  const items = [
    'Tar 30 sekunder',
    'GDPR-säkert, radera när du vill',
    'Krypterat och privat',
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500 pt-1">
      {items.map((label) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <CheckCircle2
            className="w-3.5 h-3.5 text-emerald-500"
            strokeWidth={2.5}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

function DeleteConfirmModal({
  open,
  fileName,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  fileName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="h-1"
              style={{
                background: 'linear-gradient(90deg, #F97316, #DC2626)',
              }}
            />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Bekräfta borttagning
                </h3>
              </div>

              <p className="text-sm text-slate-700 mb-3">
                Är du säker på att du vill ta bort detta CV?
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 mb-4 flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900 truncate">
                  {fileName}
                </span>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 flex items-start gap-2 mb-5">
                <AlertTriangle
                  className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                  strokeWidth={2.25}
                />
                <p className="text-xs sm:text-sm text-amber-800 leading-snug">
                  Detta kan inte ångras och all data raderas permanent.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="px-4 py-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-semibold text-sm touch-manipulation min-h-[44px]"
                >
                  Avbryt
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2.5 text-white rounded-xl flex items-center gap-2 font-semibold text-sm touch-manipulation min-h-[44px] disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(90deg, #DC2626, #BE185D)',
                    boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.4)',
                  }}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <span>Tar bort...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" strokeWidth={2.25} />
                      <span>Ta bort CV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
