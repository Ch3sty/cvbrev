'use client';

/**
 * Ett sparat brev (docs/design/overlamning-opus.md, avsnitt 4, "Lista" och
 * "Flödessteg").
 *
 * B1-skelettet (spec-rummen 16.3.2): väggen bär h1, metaraden och länken
 * tillbaka. Brevet är det lyfta kortet, med Redigera som kopparknapp och
 * Kopiera, PDF och Word som länkar under. Ta bort är en röd länk vid
 * metaraden. Brevet självt ligger på vitt papper (dokumentytan, undantaget i
 * spec 13.1).
 * Borttagning går genom ConfirmDialog, felet genom FlowError, laddningen
 * genom samma skelett som loading.tsx. Ingen rörelse, inga orange ytor.
 */

import { KNAPP_PRIMAR, KNAPP_SEKUNDAR, KNAPPRAD, LANK, LANK_VAGG } from '@/components/shell/knappar'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';

import RumHuvud from '@/components/rum/RumHuvud';
import Golv from '@/components/rum/Golv';
import LyftKort from '@/components/rum/LyftKort';
import { BREVVY, BREV_RUM } from '@/lib/rum/copy';
import Veckorad from '@/components/rum/Veckorad';
import Rader, { Rad } from '@/components/rum/Rader';
import { kravIAnnonsen, kravTraffar, KRAV_MIN_FOR_INSTRUMENT } from '@/lib/letters/kravIAnnonsen';
import { capture } from '@/lib/analytics/events';
import VaggLaddar from '@/components/rum/VaggLaddar';
import FlowError from '@/components/shell/FlowError';
import StatusRow from '@/components/shell/StatusRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import PaywallCard from '@/components/paywall/PaywallCard';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import type { Letter } from '@/store/letter-store';
import { scopeLetterHtml, BREV_SCOPE } from '../scopeLetterHtml';
import KontaktuppgifterRad from '@/components/shell/KontaktuppgifterRad';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { bytKontaktIBrev, kontaktIBrev, type ProfilKontakt } from '@/lib/profile/dokumentKontakt';

/** Brevets tre länkar under Redigera (spec 16.3.2, B1). */
const BREVLANK = `${LANK} inline-flex min-h-11 items-center disabled:cursor-not-allowed disabled:opacity-40`;
const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1';

export default function ViewLetterClient({
  id,
  initialLetter,
  soktId: initialSoktId = null,
  klart = false,
}: {
  id: string;
  /** Den sökta tjänst brevet redan ligger i, om någon (B1). */
  soktId?: string | null;
  /** Kom direkt från brevflödet: väggen säger "Brevet klart". */
  klart?: boolean;
  /** Serverhämtat brev. Är det satt står hela brevet i första HTML och
      klienten gör ingen rundtur före första målningen. */
  initialLetter: Letter | null;
}) {
  const router = useRouter();
  // Brevvisningen läser aldrig listan. Utan flaggan drog useLetters ett
  // GET /api/letters på varje brevvisning, rakt in i den kritiska vägen.
  const {
    getLetter,
    currentLetter: hamtatBrev,
    isLoading,
    error,
    removeLetter,
    isDeleting,
  } = useLetters({ skipInitialFetch: true });
  // Serverns brev gäller tills klienten har en egen version av samma id.
  const currentLetter = hamtatBrev && hamtatBrev.id === id ? hamtatBrev : initialLetter;

  // Brevet visas med dagens kontaktuppgifter i huvud och avslutning, samma
  // byte som PDF:en får (api/letters/download). Brödtexten rörs aldrig.
  const { summary } = useDashboardData();
  const kontakt = kontaktIBrev((summary?.profile as ProfilKontakt) ?? null);
  const visatInnehall = (content: string) =>
    content.includes('class="body-content"') && kontakt.namn
      ? bytKontaktIBrev(content, { namn: kontakt.namn, epost: kontakt.epost, telefon: kontakt.telefon })
      : content;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  // A1: servern svarade 402 på nedladdningen. Brevet står kvar i sin helhet,
  // betalväggen läggs under det.
  const [downloadGate, setDownloadGate] = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  // B1: "Spara som sökt tjänst". Samma idempotenta POST /api/applications
  // som brevflödets "Markera som sökt"; UI:t säger aldrig sparat på fel.
  const [soktId, setSoktId] = useState<string | null>(initialSoktId);
  const [sparar, setSparar] = useState(false);
  const [sparaFel, setSparaFel] = useState(false);

  const initialLoadRef = useRef(false);
  /** Sant först när ett brev finns, eller när en hämtning har avslutats.
      Styr när felvyn får visas, så den inte blinkar förbi. */
  const [harForsokt, setHarForsokt] = useState(Boolean(initialLetter));

  useEffect(() => {
    // Servern hann före. Ingen klienthämtning behövs.
    if (initialLetter) return;
    if (id && !initialLoadRef.current && !currentLetter) {
      initialLoadRef.current = true;
      Promise.resolve(getLetter(id)).finally(() => setHarForsokt(true));
    } else if (currentLetter) {
      setHarForsokt(true);
    }
  }, [id, currentLetter, getLetter, initialLetter]);

  const confirmDeleteAction = async () => {
    if (await removeLetter(id)) {
      router.push('/dashboard/mina-brev');
      setShowDeleteConfirm(false);
    }
  };

  const handleCopy = async () => {
    if (currentLetter?.content) {
      await navigator.clipboard.writeText(currentLetter.content.replace(/<[^>]*>/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* Samma anrop som skapa brev gör i sitt sista steg. Vi kallar API:t direkt
     i stället för den gamla DownloadButton, som bär sin egen mörka stil. */
  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!currentLetter?.content) return;
    setDownloading(format);
    setDownloadError(null);
    try {
      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentLetter.content,
          format,
          title: currentLetter.title || 'Ansökningsbrev',
          company: currentLetter.company || '',
          position: currentLetter.job_title || '',
          template: currentLetter.template_id || undefined,
        }),
      });

      // A1: 402 betyder att filen kräver Premium. Brevet syns fortfarande i
      // sin helhet, betalväggen läggs under det.
      if (response.status === 402) {
        setDownloadGate(true);
        return;
      }

      if (!response.ok) {
        setDownloadError('Filen kunde inte skapas. Försök igen om en stund.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personligt-brev.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError('Filen kunde inte skapas. Försök igen om en stund.');
    } finally {
      setDownloading(null);
    }
  };

  const sparaSomSokt = async () => {
    if (!currentLetter || sparar || soktId) return;
    setSparar(true);
    setSparaFel(false);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: currentLetter.job_title || currentLetter.title || 'Okänd tjänst',
          company: currentLetter.company || 'Okänd arbetsgivare',
          application_channel: 'ad',
          letter_id: currentLetter.id,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !json?.data?.id) throw new Error('fel');
      setSoktId(json.data.id as string);
      capture('korsreferens_klick', { fran: 'brev', till: 'jobb', variant: 'spara_sokt' });
    } catch {
      setSparaFel(true);
    } finally {
      setSparar(false);
    }
  };

  const isTemplateHTML = (content: string) =>
    content.includes('<div') || content.includes('<style');

  const formatContent = (content: string) => {
    // Mallens egna style-block måste scopas, annars sätter dess `body`-regel
    // padding på dashboardens body och knuffar hela skalet 24 px i sidled.
    if (isTemplateHTML(content)) return scopeLetterHtml(content);
    return content
      .split('\n')
      .map((line) => {
        if (line.trim() === '') return '<br/>';
        if (line.startsWith('Hej') || line.startsWith('Dear')) {
          return `<p class="font-semibold mb-4">${line}</p>`;
        }
        if (line.startsWith('Med vänlig hälsning') || line.startsWith('Best regards')) {
          return `<p class="mt-6 font-medium">${line}</p>`;
        }
        return `<p class="mb-3">${line}</p>`;
      })
      .join('');
  };

  /* Identiskt med loading.tsx, så bytet inte flyttar något. */
  if (!currentLetter && (!harForsokt || isLoading)) {
    // Egen nyckel på golvet: när brevet landat byts golvet i stället för att
    // flyttas, så väggens nya höjd inte räknas som ett layoutskifte.
    return (
      <>
        <VaggLaddar label="Laddar brev" />
        <Golv key="laddar">
          <div className="w-full max-w-3xl space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
            <div className="h-11 w-full rounded-lg bg-papper-2 sm:w-64" />
            <div className="loading-thread h-[520px] rounded-xl border border-kant bg-papper" />
          </div>
        </Golv>
      </>
    );
  }

  if (error || (!isLoading && !currentLetter)) {
    return (
      <>
        <RumHuvud title="Brevet kunde inte hittas" />
        <Golv key="fel">
          <div className="w-full max-w-lg">
            <FlowError
              title="Brevet kunde inte hittas"
              message={error || 'Brevet finns inte eller har tagits bort.'}
              secondaryAction={
                <Link href="/dashboard/mina-brev" className={LINK}>
                  Tillbaka till mina brev
                </Link>
              }
            />
          </div>
        </Golv>
      </>
    );
  }

  if (!currentLetter) return null;

  const templateName =
    currentLetter.template_id &&
    DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES]
      ? DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES].name
      : null;

  const skapad = currentLetter.created_at
    ? new Date(currentLetter.created_at).toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  const uppdaterad =
    currentLetter.updated_at &&
    currentLetter.created_at &&
    new Date(currentLetter.updated_at) > new Date(currentLetter.created_at)
      ? new Date(currentLetter.updated_at).toLocaleDateString('sv-SE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  // En rad i stället för taggpiller: företag, tjänst och mall står som meta.
  const beskrivning = [currentLetter.company, currentLetter.job_title, templateName]
    .filter(Boolean)
    .join(' · ');

  const html = isTemplateHTML(currentLetter.content || '');

  // B1: kraven vi läste ut ur annonsen och vilka brevet nämner. Bara när
  // annonsen finns och gav minst tre krav; annars visar väggen metaraden
  // som förut och ingen veckorad (spec: degradera, aldrig gissa).
  const krav = kravIAnnonsen(currentLetter.job_description);
  const traff = kravTraffar(krav, currentLetter.content);
  const medTraffar = krav.length >= KRAV_MIN_FOR_INSTRUMENT;
  const traffRad = medTraffar
    ? [BREV_RUM.traffar(traff.moter.length, krav.length), traff.saknas[0] ? BREV_RUM.saknas(traff.saknas[0]) : null]
        .filter(Boolean)
        .join(' ')
    : null;
  const kortEtikett = (k: string) => (k.length > 8 ? `${k.slice(0, 7)}…` : k);
  const instrument = medTraffar ? (
    <Veckorad
      celler={krav.slice(0, 7).map((k) => ({ etikett: kortEtikett(k), status: traff.moter.includes(k) ? 'gjord' : 'kvar' }))}
      label={BREV_RUM.traffarAria(traff.moter, traff.saknas)}
      className="mt-0"
    />
  ) : null;
  const vaggRad = [klart ? null : beskrivning || null, traffRad].filter(Boolean).join(' ') || undefined;

  return (
    <>
      {/* Väggen säger var du är (spec 16.3.2, B1): rubriken, metaraden och
          länken tillbaka. Brevet är det lyfta kortet. */}
      <RumHuvud
        eyebrow={klart ? BREV_RUM.ey : undefined}
        title={klart ? BREV_RUM.titel(currentLetter.company || null) : currentLetter.title || 'Ansökningsbrev'}
        description={vaggRad}
        instrument={instrument}
        tat={false}
        handling={
          <Link href="/dashboard/mina-brev" className={`${LANK_VAGG} inline-flex min-h-11 items-center`}>
            {BREVVY.allaBrev}
          </Link>
        }
      />
    <Golv key="brev" lyft>
      <LyftKort label="Brevet" className="w-full max-w-3xl">
        {/* Brevet. Undantaget i specens avsnitt 3: dokumentet är papper. */}
        <div className="dokument overflow-hidden rounded-xl border border-kant bg-white">
          {html ? (
            <div className="px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
              <div
                className={BREV_SCOPE}
                dangerouslySetInnerHTML={{ __html: formatContent(visatInnehall(currentLetter.content || '')) }}
              />
            </div>
          ) : (
            <div className="px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
              <div
                className="mx-auto max-w-2xl text-ink-1"
                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: formatContent(visatInnehall(currentLetter.content || '')) }}
              />
            </div>
          )}
        </div>
        <div className={KNAPPRAD}>
          {/* Betalväggen under brevet bär kopparknappen när den syns. */}
          <Link href={`/dashboard/mina-brev/${id}/edit`} className={downloadGate ? KNAPP_SEKUNDAR : KNAPP_PRIMAR}>
            {BREVVY.redigera}
          </Link>
        </div>
        <div className="mt-1.5 flex flex-wrap justify-center gap-x-5">
          <button type="button" onClick={handleCopy} className={BREVLANK}>
            {copied ? BREVVY.kopierad : BREVVY.kopiera}
          </button>
          <button
            type="button"
            onClick={() => handleDownload('pdf')}
            disabled={downloading !== null}
            className={BREVLANK}
          >
            {downloading === 'pdf' ? 'Skapar PDF' : BREVVY.pdf}
          </button>
          <button
            type="button"
            onClick={() => handleDownload('docx')}
            disabled={downloading !== null}
            className={BREVLANK}
          >
            {downloading === 'docx' ? 'Skapar Word' : BREVVY.word}
          </button>
        </div>
      </LyftKort>
    <div className="w-full max-w-3xl space-y-4">

      {/* B1: nästa steg som rader. Den saknade kravet först, sedan brevet
          som sökt tjänst i Jobbsöket. */}
      <Rader label="Nästa">
        {traff.saknas[0] && medTraffar ? (
          <Rad
            titel={BREV_RUM.laggTill(traff.saknas[0])}
            meta={BREV_RUM.laggTillMeta}
            hoger={
              <Link href={`/dashboard/mina-brev/${id}/edit`} className={`${LANK} inline-flex min-h-11 items-center`}>
                {BREVVY.redigera}
              </Link>
            }
          />
        ) : null}
        <Rad
          titel={BREV_RUM.sparaSokt}
          meta={
            soktId ? (
              BREV_RUM.redanSparad
            ) : sparaFel ? (
              <span className="text-fel" role="alert">
                {BREV_RUM.sparaFel}
              </span>
            ) : (
              BREV_RUM.sparaSoktMeta
            )
          }
          hoger={
            soktId ? (
              <Link href={`/dashboard/sokta-tjanster/${soktId}`} className={`${LANK} inline-flex min-h-11 items-center`}>
                {BREV_RUM.sparadLank}
              </Link>
            ) : (
              <button
                type="button"
                onClick={sparaSomSokt}
                disabled={sparar}
                className={`${LANK} inline-flex min-h-11 items-center disabled:opacity-40`}
              >
                {sparar ? BREV_RUM.sparar : BREV_RUM.sparaKnapp}
              </button>
            )
          }
        />
      </Rader>

      {summary?.paket && summary.paket.lettersLimit !== null && summary.paket.lettersUsed >= summary.paket.lettersLimit ? (
        <StatusRow showDot wrap label={BREV_RUM.gratis}>
          {BREV_RUM.gratis}
        </StatusRow>
      ) : null}

      {copied ? (
        <StatusRow tone="positive" showDot label="Texten är kopierad">
          Texten är kopierad.
        </StatusRow>
      ) : null}

      {downloadError ? (
        <FlowError message={downloadError} onRetry={() => setDownloadError(null)} retryLabel="Stäng" />
      ) : null}

      {/* Adressen nedladdningen får. Sparade brev har adressen inbakad, så
          /api/letters/download byter den mot den aktuella. */}
      <KontaktuppgifterRad dokument="brev" />

      {/* A1: betalvägg under det fullt synliga brevet */}
      {downloadGate && (
        <PaywallCard
          variant="nedladdning"
          onCopy={() => {
            navigator.clipboard?.writeText(currentLetter.content || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-meta text-ink-3">
          {skapad ? `Skapad ${skapad}` : null}
          {skapad && uppdaterad ? ' · ' : null}
          {uppdaterad ? `Uppdaterad ${uppdaterad}` : null}
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className={`${LANK} inline-flex min-h-11 shrink-0 items-center text-fel decoration-fel/40 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {isDeleting ? 'Tar bort' : BREVVY.taBort}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAction}
        title="Ta bort brevet?"
        description={`Brevet ${currentLetter.title || 'Namnlöst'} raderas permanent och kan inte återställas.`}
        confirmLabel="Ta bort"
        destructive
      />
    </div>
    </Golv>
    </>
  );
}
