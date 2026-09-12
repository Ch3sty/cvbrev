'use client';

/**
 * Mina CV (docs/plan-inloggat-omdesign.md, punkt 18).
 *
 * På sidmallen: PageHeader, valfri statusrad, innehåll. Ingen gradienthero,
 * inget "du har låst upp fyra funktioner"-diagram, inga gradientknappar.
 * Borttagning bekräftas med ConfirmDialog, aldrig native confirm.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { useCvQuota } from '@/hooks/useCvQuota';
import CVUploadZone from '@/components/cv/cv-upload-zone';
import QuickScoreReveal from '@/components/cv/QuickScoreReveal';
import type { ParsedCV } from '@/lib/cv/cv-parser';

import OnboardingNextStep from '@/components/dashboard/OnboardingNextStep';
import CvCard from './components/CvCard';
import PaywallCard from '@/components/paywall/PaywallCard';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import StatusRow from '@/components/shell/StatusRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { IlluTomCv } from '@/components/illustrations/EmptyStateIllustrations';

const FREE_LIMIT = 2;

export default function MinaCVPage() {
  const router = useRouter();
  const { cvs, fetchCVs, isLoading: cvListLoading } = useCVStore();
  const {
    profile,
    subscriptionTier,
    uploadCV,
    setGdprConsent: setProfileGdprConsent,
  } = useProfile();
  const { isLocked: isCvLocked, refresh: refreshQuota } = useCvQuota();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [expandedCvId, setExpandedCvId] = useState<string | null>(null);
  // Aha-moment: CV-id för nyss uppladdat FÖRSTA CV (visar snabb-poäng inline).
  const [quickScoreCvId, setQuickScoreCvId] = useState<string | null>(null);
  // Lokal overlay over store: nar /api/cv/structure returnerar
  // strukturerad data lagger vi den har sa CvDetailView ser den utan
  // att vi behover refetcha hela CV-listan.
  const [structuredOverrides, setStructuredOverrides] = useState<
    Record<string, ParsedCV>
  >({});

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
        refreshQuota();
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

  const handleUpload = async (
    file: File,
    onPhaseChange?: (phase: 'uploading' | 'vision', label: string) => void,
  ) => {
    setIsUploading(true);
    // Är detta användarens första CV? (avgör om aha-momentet ska visas)
    const isFirstCv = cvCount === 0;
    try {
      setProfileGdprConsent(gdprConsent);
      const title = file.name.split('.').slice(0, -1).join('.');
      const success = await uploadCV(
        file,
        title,
        onPhaseChange,
        (cv) => {
          // Visa snabb-poäng bara för det allra första CV:t.
          if (isFirstCv) setQuickScoreCvId(cv.id);
        },
      );
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
                background: #FAFAFA;
                color: #171717; min-height: 100dvh;
              }
              .header {
                background: #FFFFFF; border-bottom: 1px solid #E5E5E5;
                color: #171717; padding: 24px 40px;
              }
              .header h1 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; }
              .header .meta { color: #525252; font-size: 14px; display: flex; align-items: center; gap: 8px; }
              .content { max-width: 850px; margin: 32px auto; padding: 0 24px; }
              .cv-container {
                background: white; padding: 48px; border-radius: 12px;
                border: 1px solid #E5E5E5;
                white-space: pre-line; font-size: 15px;
              }
              .cv-container p { margin: 0 0 16px 0; }
              .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 13px; }
              .footer a { color: #C2410C; text-decoration: none; font-weight: 500; }
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
              <a href="https://www.jobbcoach.ai" target="_blank">jobbcoach.ai</a> · din karriärcoach
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
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <LoadingSkeleton variant="text" count={2} label="Laddar dina CV" />
        <LoadingSkeleton variant="list" count={2} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Mina CV"
        description="Ladda upp ditt CV en gång, använd det i brev, analys och mallar."
        action={
          !limitReached ? (
            <a
              href="#upload-zone"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              Ladda upp CV
            </a>
          ) : undefined
        }
      />

      {/* Statusrad: antal av kvoten. Aldrig oandlighetstecken. */}
      {cvCount > 0 && (
        <StatusRow label="Antal CV">
          {isPremium
            ? `${cvCount} sparade CV. Premium, inga gränser.`
            : `${cvCount} av ${FREE_LIMIT} CV använda.`}
        </StatusRow>
      )}

      {/* Tomt tillstand enligt sidmallen */}
      {isEmpty && (
        <>
          <EmptyState
            illustration={IlluTomCv}
            title="Inget CV än"
            description="Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder."
            action={
              <a
                href="#upload-zone"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700"
              >
                Ladda upp CV
              </a>
            }
          />

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

      {/* Med CV */}
      {cvCount > 0 && (
        <>
          {/* Aha-moment: snabb-poang direkt efter forsta uppladdningen */}
          {quickScoreCvId && (
            <QuickScoreReveal cvId={quickScoreCvId} userId={profile?.id} />
          )}

          {limitReached && (
            <PaywallCard
              variant="cv-antal"
              isPremium={isPremium}
              onSecondary={scrollToList}
            />
          )}

          <section id="cv-list" className="scroll-mt-6">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-neutral-900">
              Dina CV
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {cvs.map((cv, i) => {
                const structured =
                  structuredOverrides[cv.id] ?? cv.structured_data ?? null;
                const cvWithStructured = { ...cv, structured_data: structured };
                return (
                  <CvCard
                    key={cv.id}
                    cv={cvWithStructured}
                    index={i}
                    isDeleting={isDeleting && deleteId === cv.id}
                    expanded={expandedCvId === cv.id}
                    onToggleExpand={() =>
                      setExpandedCvId((prev) => (prev === cv.id ? null : cv.id))
                    }
                    onOpenInNewWindow={() => openCVInNewWindow(cv)}
                    onDownload={() =>
                      router.push(`/dashboard/cv-mallar?cv=${cv.id}`)
                    }
                    onDelete={() => handleDeleteCV(cv.id)}
                    onStructured={(data) =>
                      setStructuredOverrides((prev) => ({
                        ...prev,
                        [cv.id]: data,
                      }))
                    }
                    preview={getCleanPreview(cv.cv_text)}
                    formatDate={formatDate}
                    isLocked={isCvLocked(cv.id)}
                    userContact={{
                      full_name: profile?.full_name ?? '',
                      email: profile?.email ?? '',
                      phone: profile?.phone ?? '',
                      location: profile?.location ?? '',
                    }}
                  />
                );
              })}
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

      <ConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteCV}
        title="Ta bort CV"
        description={`${
          cvs.find((cv) => cv.id === deleteId)?.file_name || 'CV:t'
        } raderas permanent och kan inte återställas.`}
        confirmLabel="Ta bort"
        destructive
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-neutral-900">
          {subdued ? 'Ladda upp ytterligare CV' : 'Ladda upp ditt CV'}
        </h2>
        <span className="text-sm text-neutral-500">Tar 30 sekunder</span>
      </div>
      {children}
    </motion.div>
  );
}

function TrustChips() {
  const items = [
    'Tar 30 sekunder',
    'GDPR-säkert, radera när du vill',
    'Krypterat och privat',
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-sm text-neutral-500">
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

