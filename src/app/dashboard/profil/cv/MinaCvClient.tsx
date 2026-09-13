'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import CVUploadZone from '@/components/cv/cv-upload-zone';
import type { ParsedCV } from '@/lib/cv/cv-parser';

import CvCard from './components/CvCard';
import PaywallCard from '@/components/paywall/PaywallCard';
import PageHeader from '@/components/shell/PageHeader';
import EmptyState from '@/components/shell/EmptyState';
import StatusRow from '@/components/shell/StatusRow';
import { IlluTomCv } from '@/components/illustrations/EmptyStateIllustrations';

// Syns aldrig i första vyn. Bekräftelsedialogen öppnas vid borttagning,
// snabb-poängen bara direkt efter en uppladdning.
const ConfirmDialog = dynamic(() => import('@/components/shell/ConfirmDialog'), {
  ssr: false,
});
const QuickScoreReveal = dynamic(() => import('@/components/cv/QuickScoreReveal'), {
  ssr: false,
});

export interface InitialCv {
  id: string;
  user_id: string;
  file_name: string;
  original_file_path: string;
  cv_text: string | null;
  created_at: string;
  structured_data: ParsedCV | null;
}

const FREE_LIMIT = 2;
const PREMIUM_MAX_CVS = 50;

/**
 * Städar CV-texten till en kort förhandsvisning.
 *
 * Låg tidigare inne i komponenten och deklarerades om vid varje render. Den
 * kördes dessutom en gång per CV-kort direkt i JSX, alltså fem regex plus
 * radbearbetning över hela CV-texten gånger antalet CV. På ett konto med åtta
 * CV blev det tung synkron text-tuggning mitt i hydreringen, och LCP på
 * /dashboard/profil/cv låg på 2,4 sekunder trots att texten fanns i
 * server-HTML. Nu ligger den på modulnivå och resultaten memoiseras.
 */
function getCleanPreview(cvText: string | null): string {
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
}

export default function MinaCvClient({
  initialCvs,
  initialIsPremium,
  initialLockedCvIds,
}: {
  initialCvs: InitialCv[];
  initialIsPremium: boolean;
  initialLockedCvIds: string[];
}) {
  const router = useRouter();
  const { fetchCVs } = useCVStore();
  const {
    profile,
    subscriptionTier,
    uploadCV,
    setGdprConsent: setProfileGdprConsent,
  } = useProfile();

  // Listan kommer serverrenderad. Efter uppladdning eller borttagning hämtar
  // vi om via cv-storen och byter till den färskare listan.
  const [cvs, setCvs] = useState<InitialCv[]>(initialCvs);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [expandedCvId, setExpandedCvId] = useState<string | null>(null);
  // Aha-moment: CV-id för nyss uppladdat FÖRSTA CV (visar snabb-poäng inline).
  const [quickScoreCvId, setQuickScoreCvId] = useState<string | null>(null);
  // Lokal overlay over listan: nar /api/cv/structure returnerar
  // strukturerad data lagger vi den har sa CvDetailView ser den utan
  // att vi behover refetcha hela CV-listan.
  const [structuredOverrides, setStructuredOverrides] = useState<
    Record<string, ParsedCV>
  >({});

  const cvCount = cvs.length;
  // Serverns svar gäller tills klientens profil har landat. Annars står
  // subscriptionTier på 'free' i första målningen och en premiumanvändare
  // hade sett gratisgränsen blinka förbi.
  const isPremium = profile === null ? initialIsPremium : subscriptionTier === 'premium';
  const limitReached = !isPremium && cvCount >= FREE_LIMIT;

  // Låsmarkeringen: serverns uträkning så länge listan är serverns, annars
  // samma getActiveCvIds på den färskare listan. Regeln är oförändrad.
  // Förhandsvisningarna räknas en gång per CV-lista, inte en gång per render
  // och kort. Nyckeln är CV:ts id, så en ny uppladdning ger ny text.
  const previews = useMemo(() => {
    const map = new Map<string, string>();
    for (const cv of cvs) map.set(cv.id, getCleanPreview(cv.cv_text));
    return map;
  }, [cvs]);

  const lockedCvIds = useMemo(() => {
    if (cvs === initialCvs) return new Set(initialLockedCvIds);
    const maxCvs = isPremium ? PREMIUM_MAX_CVS : FREE_LIMIT;
    const activeIds = getActiveCvIds(cvs, maxCvs);
    const locked = new Set<string>();
    for (const cv of cvs) {
      if (!activeIds.has(cv.id)) locked.add(cv.id);
    }
    return locked;
  }, [cvs, initialCvs, initialLockedCvIds, isPremium]);

  const refreshCvs = useCallback(async () => {
    await fetchCVs();
    setCvs(useCVStore.getState().cvs as unknown as InitialCv[]);
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
        await refreshCvs();
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
        await refreshCvs();
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


  const openCVInNewWindow = (cv: InitialCv) => {
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

  // Inget skelett längre: listan finns redan i första HTML, så empty- och
  // populated-läget avgörs av serverns svar och kan inte flasha förbi.
  const isEmpty = cvCount === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Mina CV"
        description="Ladda upp ditt CV en gång, använd det i brev, analys och mallar."
        action={
          !limitReached ? (
            <a
              href="#upload-zone"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
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
                className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
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
            <h2 className="mb-2 text-sm font-medium text-ink-3">Dina CV</h2>

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
                    preview={previews.get(cv.id) ?? ""}
                    formatDate={formatDate}
                    isLocked={lockedCvIds.has(cv.id)}
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

      {showDeleteConfirm && (
        <ConfirmDialog
          open
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteCV}
          title="Ta bort CV"
          description={`${
            cvs.find((cv) => cv.id === deleteId)?.file_name || 'CV:t'
          } raderas permanent och kan inte återställas.`}
          confirmLabel="Ta bort"
          destructive
        />
      )}
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
    <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-kort text-ink-1">
          {subdued ? 'Ladda upp ytterligare CV' : 'Ladda upp ditt CV'}
        </h2>
        <span className="text-meta text-ink-3">Tar 30 sekunder</span>
      </div>
      {children}
    </section>
  );
}

function TrustChips() {
  const items = [
    'Tar 30 sekunder',
    'GDPR-säkert, radera när du vill',
    'Krypterat och privat',
  ];
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-meta text-ink-3">
      {items.map((label) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-ink-3" />
          {label}
        </li>
      ))}
    </ul>
  );
}
