'use client';

/**
 * Ett sparat brev (docs/design/overlamning-opus.md, avsnitt 4, "Lista" och
 * "Flödessteg").
 *
 * PageHeader är sidans enda h1 och bär primärhandlingen (Redigera). Övriga
 * handlingar är sekundära knappar i en panel. Brevet självt ligger på papper
 * (bg-white), vilket är specens enda tillåtna undantag från bg-panel.
 * Borttagning går genom ConfirmDialog, felet genom FlowError, laddningen
 * genom samma skelett som loading.tsx. Ingen rörelse, inga orange ytor.
 */

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';

import PageHeader from '@/components/shell/PageHeader';
import FlowError from '@/components/shell/FlowError';
import StatusRow from '@/components/shell/StatusRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import PaywallCard from '@/components/paywall/PaywallCard';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import { scopeLetterHtml, BREV_SCOPE } from '../scopeLetterHtml';

const PRIMARY =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40';
const SECONDARY =
  'inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40';
const DESTRUKTIV =
  'inline-flex h-11 items-center justify-center rounded-lg border border-fel-kant bg-panel px-4 text-sm font-medium text-fel transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40';
const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1';

export default function ViewLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter, isDeleting } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  // A1: servern svarade 402 på nedladdningen. Brevet står kvar i sin helhet,
  // betalväggen läggs under det.
  const [downloadGate, setDownloadGate] = useState(false);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const initialLoadRef = useRef(false);
  /** Sant först när en hämtning har startats och avslutats. Styr när felvyn
      får visas, så den inte blinkar förbi före första hämtningen. */
  const [harForsokt, setHarForsokt] = useState(false);

  useEffect(() => {
    if (id && !initialLoadRef.current && !currentLetter) {
      initialLoadRef.current = true;
      Promise.resolve(getLetter(id)).finally(() => setHarForsokt(true));
    } else if (currentLetter) {
      setHarForsokt(true);
    }
  }, [id, currentLetter, getLetter]);

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
  if (!harForsokt || (isLoading && !currentLetter)) {
    return (
      <div className="space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
        <div className="h-8 w-48 rounded bg-insunken" />
        <div className="loading-thread h-[520px] rounded-xl border border-kant bg-panel" />
        <div className="h-11 w-full rounded-lg bg-insunken sm:w-64" />
      </div>
    );
  }

  if (error || (!isLoading && !currentLetter)) {
    return (
      <div className="mx-auto max-w-lg">
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

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-16">
      <PageHeader
        title={currentLetter.title || 'Ansökningsbrev'}
        description={beskrivning || undefined}
        action={
          <Link href={`/dashboard/mina-brev/${id}/edit`} className={PRIMARY}>
            Redigera
          </Link>
        }
      >
        <Link href="/dashboard/mina-brev" className={`${LINK} mt-2`}>
          Alla dina brev
        </Link>
      </PageHeader>

      {copied ? (
        <StatusRow tone="positive" showDot label="Texten är kopierad">
          Texten är kopierad.
        </StatusRow>
      ) : null}

      {downloadError ? (
        <FlowError message={downloadError} onRetry={() => setDownloadError(null)} retryLabel="Stäng" />
      ) : null}

      {/* Handlingar. Primärhandlingen bor i sidhuvudet, de här är sekundära. */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button type="button" onClick={handleCopy} className={SECONDARY}>
          {copied ? 'Kopierat' : 'Kopiera text'}
        </button>
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          disabled={downloading !== null}
          className={SECONDARY}
        >
          {downloading === 'pdf' ? 'Skapar PDF' : 'Ladda ner PDF'}
        </button>
        <button
          type="button"
          onClick={() => handleDownload('docx')}
          disabled={downloading !== null}
          className={SECONDARY}
        >
          {downloading === 'docx' ? 'Skapar Word' : 'Ladda ner Word'}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className={DESTRUKTIV}
        >
          {isDeleting ? 'Tar bort' : 'Ta bort'}
        </button>
      </div>

      {/* Brevet. Undantaget i specens avsnitt 3: dokumentet är papper. */}
      <div className="overflow-hidden rounded-xl border border-kant bg-white">
        {html ? (
          <div className="px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
            <div
              className={BREV_SCOPE}
              dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }}
            />
          </div>
        ) : (
          <div className="px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
            <div
              className="mx-auto max-w-2xl text-ink-1"
              style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }}
            />
          </div>
        )}
      </div>

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

      {(skapad || uppdaterad) && (
        <p className="text-meta text-ink-3">
          {skapad ? `Skapad ${skapad}` : null}
          {skapad && uppdaterad ? ' · ' : null}
          {uppdaterad ? `Uppdaterad ${uppdaterad}` : null}
        </p>
      )}

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
  );
}
