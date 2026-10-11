'use client';

import { KNAPP_PRIMAR, KNAPP_SEKUNDAR } from '@/components/shell/knappar'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import { useCVStore } from '@/store/cv-store';
import { useProfile } from '@/hooks/use-profile';
import { getActiveCvIds } from '@/lib/cv/cv-quota';
import CVUploadZone from '@/components/cv/cv-upload-zone';
import InlineCVUpload from '@/components/cv/InlineCVUpload';
import { formatCVDate } from '@/lib/utils/date-formatter';
import type { ParsedCV } from '@/lib/cv/cv-parser';

import CvCard from './components/CvCard';
import PaywallCard from '@/components/paywall/PaywallCard';
import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import LyftKort from '@/components/rum/LyftKort';
import { CV_RUM, LYFT, RUBRIK, kortDatum } from '@/lib/rum/copy';
import Link from 'next/link';
import Poangring from '@/components/rum/Poangring';
import Veckorad from '@/components/rum/Veckorad';
import Rader from '@/components/rum/Rader';
import Kort from '@/components/rum/Kort';
import Chip from '@/components/rum/Chip';
import SektRubrik from '@/components/rum/SektRubrik';
import { dokumentVag, fyndUrAnalys, poangUrAnalys, type AnalysUnderlag } from '@/lib/rum/cvRum';
import { dokumentEpost } from '@/lib/profile/dokumentEpost';

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
  updated_at?: string | null;
  structured_data: ParsedCV | null;
}

/** CV-rummets underlag (våg 4, C1), läst på servern. */
export interface CvRumData {
  underlag: AnalysUnderlag | null;
  /** Senaste analysens poäng per CV-id. */
  poangPerCv: Record<string, number>;
  nedladdatAt: string | null;
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
  cvRum = { underlag: null, poangPerCv: {}, nedladdatAt: null },
}: {
  initialCvs: InitialCv[];
  initialIsPremium: boolean;
  initialLockedCvIds: string[];
  cvRum?: CvRumData;
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

  // Samma relativa datum som brevflödets och LinkedIn-flödets CV-val
  // ("1 vecka sedan", 21.3 punkt 8).
  const formatDate = formatCVDate;


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

  // CV-rummet (våg 4, C1): poängringen, vad som drar ner och dokumentets
  // väg, ur den senaste analysen av ett CV som finns kvar i listan. Plustalen
  // är analysens egna atsImpact (cvRum.ts), aldrig uppskattningar.
  const analyseratCv = cvRum.underlag ? cvs.find((cv) => cv.id === cvRum.underlag?.cvId) ?? null : null;
  const underlag = analyseratCv ? cvRum.underlag : null;
  const poang = poangUrAnalys(underlag);
  const fynd = fyndUrAnalys(underlag);
  // Ett lyft kort som pekar på sparad data öppnar den datan (21.2 fråga 2):
  // "Åtgärda i CV:t" öppnar analysen med ?job=<id>, utan ny analys och utan
  // kvot. Går den inte att öppna lyfts inte "Åtgärda först".
  const atgardaHref = underlag?.jobbId ? `/dashboard/cv-analys?job=${encodeURIComponent(underlag.jobbId)}` : null;
  const atgardaForst = atgardaHref ? fynd[0] ?? null : null;
  const vag = analyseratCv
    ? dokumentVag({
        harCv: true,
        analyseradAt: underlag?.klar ?? null,
        // Det förbättrade CV:t sparas som ett nytt CV med filvägen + "-improved"
        // (/api/cv/save-improved); det analyserade kan också vara det.
        atgardadAt: analyseratCv.original_file_path?.endsWith('-improved')
          ? analyseratCv.created_at
          : cvs.find((c) => c.original_file_path === `${analyseratCv.original_file_path}-improved`)?.created_at ?? null,
        nedladdatAt: cvRum.nedladdatAt,
      })
    : null;
  const instrument =
    poang !== null && vag ? (
      <>
        <Poangring
          poang={poang}
          rubrik={CV_RUM.drarNer(fynd.length)}
          rad={
            underlag?.klar
              ? CV_RUM.senaste(underlag.namn ?? analyseratCv?.file_name ?? '', kortDatum(underlag.klar))
              : null
          }
        />
        <Veckorad
          celler={vag}
          label={CV_RUM.vagenAria(
            vag.filter((c) => c.status === 'gjord').map((c) => c.etikett),
            vag.find((c) => c.status === 'nu')?.etikett ?? null
          )}
          className="mt-5"
        />
      </>
    ) : null;
  const liftAtgarda = atgardaForst !== null;

  return (
    <>
      {/* Väggen säger var du är (spec 16.3.2): statusradens text står i
          raden, uppladdningen i det lyfta kortet. Aldrig oändlighetstecken. */}
      <RumHuvud
        title={RUBRIK.minaCv}
        description={
          cvCount > 0
            ? isPremium
              ? PAKETRADER.cvUtanGrans(cvCount)
              : `${cvCount} av ${FREE_LIMIT} CV använda.`
            : 'Ladda upp ditt CV en gång, använd det i brev, analys och mallar.'
        }
        instrument={instrument}
        tat={limitReached && !liftAtgarda}
      />
    <Golv lyft={!limitReached || liftAtgarda}>
      {liftAtgarda && atgardaForst ? (
        <>
          <LyftKort
            label={CV_RUM.atgardaForst}
            eyebrow={CV_RUM.atgardaForst}
            titel={atgardaForst.titel}
            text={atgardaForst.meta}
            handling={
              <Link href={atgardaHref ?? '/dashboard/cv-analys'} className={quickScoreCvId ? KNAPP_SEKUNDAR : KNAPP_PRIMAR}>
                {CV_RUM.atgardaKnapp}
              </Link>
            }
          />
          <Kort label={CV_RUM.fyndRubrik}>
            <h2 className="text-ey text-ink-3">{CV_RUM.fyndRubrik}</h2>
            <ol className="mt-1" aria-label={CV_RUM.fyndAria(fynd.length)}>
              {fynd.slice(0, 5).map((f, i) => (
                <li
                  key={f.nyckel}
                  className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-3 [&+&]:border-t [&+&]:border-kant"
                >
                  <span className="font-display text-xl font-bold tabular-nums text-koppar-ink">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-[19px] text-ink-1">{f.titel}</span>
                    {f.meta ? <span className="mt-0.5 block text-meta text-ink-3">{f.meta}</span> : null}
                  </span>
                  <Chip ton label={CV_RUM.plusAria(f.plus)}>
                    {CV_RUM.plus(f.plus)}
                  </Chip>
                </li>
              ))}
            </ol>
          </Kort>
        </>
      ) : isEmpty ? (
        // Utan CV (21.3 punkt 6, samma mönster som hemmet A i 18.3.2):
        // uppladdningsytan står i det lyfta kortet och är handlingen själv.
        <LyftKort
          label={LYFT.minaCv.titel}
          eyebrow={LYFT.minaCv.eyebrow}
          eyebrowTon="neutral"
          titel={LYFT.minaCv.titel}
          text={LYFT.minaCv.text}
        >
          <div id="upload-zone" className="mt-3.5 scroll-mt-6">
            <InlineCVUpload
              showCancel={false}
              hideHeader
              onComplete={(cv) => {
                setQuickScoreCvId(cv.id);
                void refreshCvs();
              }}
            />
          </div>
        </LyftKort>
      ) : !limitReached ? (
        <LyftKort
          label={LYFT.minaCv.titel}
          eyebrow={LYFT.minaCv.eyebrow}
          eyebrowTon="neutral"
          titel={LYFT.minaCv.titel}
          text={LYFT.minaCv.text}
          handling={
            // Snabbpoängen efter en uppladdning bär kopparknappen; då är
            // uppladdningen sekundär (en kopparknapp per vy).
            <a href="#upload-zone" className={quickScoreCvId ? KNAPP_SEKUNDAR : KNAPP_PRIMAR}>
              {LYFT.minaCv.handling}
            </a>
          }
        />
      ) : null}
    <div className="w-full max-w-5xl space-y-6">

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
            <SektRubrik>{CV_RUM.sparadeRubrik}</SektRubrik>

            <Rader label={CV_RUM.sparadeRubrik} className="mt-4">
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
                    poang={cvRum.poangPerCv[cv.id] ?? null}
                    userContact={{
                      full_name: profile?.full_name ?? '',
                      email: dokumentEpost(profile),
                      phone: profile?.phone ?? '',
                      location: profile?.location ?? '',
                    }}
                  />
                );
              })}
            </Rader>
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
    </Golv>
    </>
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
    <section className="rounded-xl border border-kant bg-papper p-4 sm:p-5">
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

