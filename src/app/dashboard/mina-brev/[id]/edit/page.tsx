'use client';

/**
 * Redigera ett sparat brev (docs/design/overlamning-opus.md).
 *
 * PageHeader är sidans enda h1 och bär Spara som primärhandling. Brevinfon
 * är fält enligt avsnitt 2, med hjälptext under titeln. Texten redigeras i
 * en insunken textarea, annars visas brevet på papper (bg-white, specens
 * enda tillåtna undantag). Fel via FlowError. Ingen rörelse, inga orange
 * ytor, ingen zoom-rad: den lade tre knappar ovanför brevet utan att någon
 * använde dem.
 */

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';

import PageHeader from '@/components/shell/PageHeader';
import FlowError from '@/components/shell/FlowError';
import StatusRow from '@/components/shell/StatusRow';
import { extractEditableContent, isTemplateHTML } from '@/lib/letters/extract-editable-content';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import { scopeLetterHtml, BREV_SCOPE } from '../../scopeLetterHtml';

const PRIMARY =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40';
const SECONDARY =
  'inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40';
const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1';
const FALT =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1';

export default function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, editLetter } = useLetters();
  const { successWithMascot } = useNotification();

  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    job_title: '',
    content: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [copied, setCopied] = useState(false);
  const initialLoadRef = useRef(false);
  /** isLoading startar som false och currentLetter som null, så felvyn var
      sann redan på första renderingen och blinkade förbi innan hämtningen
      hann börja. Felvyn får vänta tills ett försök faktiskt är avslutat. */
  const [harForsokt, setHarForsokt] = useState(false);

  useEffect(() => {
    if (id && !initialLoadRef.current) {
      initialLoadRef.current = true;
      Promise.resolve(getLetter(id)).finally(() => setHarForsokt(true));
    }
  }, [id, getLetter]);

  useEffect(() => {
    if (currentLetter) {
      setFormData({
        title: currentLetter.title || '',
        company: currentLetter.company || '',
        job_title: currentLetter.job_title || '',
        content: currentLetter.content || '',
      });
    }
  }, [currentLetter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      if (!formData.title.trim()) {
        setSaveError('Brevet behöver en titel.');
        return;
      }

      const contentToSave = isEditing ? editableText : formData.content;
      if (!contentToSave.trim()) {
        setSaveError('Brevet är tomt. Skriv något innan du sparar.');
        return;
      }

      const success = await editLetter(id, {
        title: formData.title,
        company: formData.company,
        job_title: formData.job_title,
        content: contentToSave,
      });

      if (success) {
        successWithMascot(
          'Vi har sparat ditt brev. Du hittar det under Mina brev.',
          'letter-saved',
          4000
        );
        router.push(`/dashboard/mina-brev/${id}`);
      } else {
        setSaveError('Brevet kunde inte sparas. Försök igen om en stund.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Brevet kunde inte sparas. Försök igen om en stund.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = () => {
    const content = formData.content || '';
    const cleanText = isTemplateHTML(content) ? extractEditableContent(content) : content;
    setEditableText(cleanText);
    setIsEditing(true);
  };

  const handleCopy = async () => {
    const content = formData.content || '';
    const textToCopy = isTemplateHTML(content) ? extractEditableContent(content) : content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    setFormData((prev) => ({ ...prev, content: editableText }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableText('');
  };

  const formatContent = (content: string) => {
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
  if (!harForsokt || isLoading) {
    return (
      <div className="space-y-4" role="status" aria-busy="true" aria-label="Laddar brev">
        <div className="h-8 w-48 rounded bg-insunken" />
        <div className="loading-thread h-[520px] rounded-xl border border-kant bg-panel" />
        <div className="h-11 w-full rounded-lg bg-insunken sm:w-64" />
      </div>
    );
  }

  if (error || !currentLetter) {
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

  const templateName =
    currentLetter.template_id &&
    DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES]
      ? DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES].name
      : null;

  const html = isTemplateHTML(formData.content);

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-16">
      <PageHeader
        title="Redigera brevet"
        description={
          templateName ? `Ändringarna sparas i mallen ${templateName}.` : 'Ändringarna sparas när du trycker Spara.'
        }
        action={
          <button type="button" onClick={handleSave} disabled={isSaving} className={PRIMARY}>
            {isSaving ? 'Sparar' : 'Spara'}
          </button>
        }
      >
        <Link href={`/dashboard/mina-brev/${id}`} className={`${LINK} mt-2`}>
          Tillbaka till brevet
        </Link>
      </PageHeader>

      {saveError ? (
        <FlowError title="Brevet kunde inte sparas" message={saveError} onRetry={handleSave} />
      ) : null}

      {copied ? (
        <StatusRow tone="positive" showDot label="Texten är kopierad">
          Texten är kopierad.
        </StatusRow>
      ) : null}

      {/* Brevinfo: fälten som följer med brevet till Sökta tjänster. */}
      <section className="rounded-xl border border-kant bg-panel p-4">
        <h2 className="text-kort text-ink-1">Brevinfo</h2>
        <div className="mt-3 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink-2">Titel</span>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={FALT}
              placeholder="Ansökningsbrev"
            />
            <span className="mt-1 block text-meta text-ink-3">
              Namnet du ser i listan över dina brev.
            </span>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-2">Företag</span>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={FALT}
                placeholder="Företagsnamn"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink-2">Tjänst</span>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className={FALT}
                placeholder="Jobbtitel"
              />
            </label>
          </div>
          <p className="text-meta text-ink-3">
            Företag och tjänst följer med när du loggar brevet i Sökta tjänster.
          </p>
        </div>
      </section>

      {isEditing ? (
        <section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <label htmlFor="letter-editor" className="text-kort text-ink-1">
            Redigera texten
          </label>
          <textarea
            id="letter-editor"
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            className="mt-3 h-[480px] w-full resize-none rounded-lg border border-kant bg-insunken p-4 text-base leading-7 text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
            style={{ fontFamily: 'Georgia, serif' }}
            placeholder="Skriv ditt brev här"
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <button type="button" onClick={handleSaveEdit} className={SECONDARY}>
              Använd texten
            </button>
            <button type="button" onClick={handleCancelEdit} className={LINK}>
              Avbryt
            </button>
          </div>
          <p className="mt-3 text-meta text-ink-3">
            Texten läggs tillbaka i mallen. Tryck Spara i sidhuvudet för att spara brevet.
          </p>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button type="button" onClick={handleStartEdit} className={SECONDARY}>
              Redigera texten
            </button>
            <button type="button" onClick={handleCopy} className={SECONDARY}>
              {copied ? 'Kopierat' : 'Kopiera text'}
            </button>
          </div>

          {/* Brevet. Undantaget i specens avsnitt 3: dokumentet är papper. */}
          <div className="overflow-hidden rounded-xl border border-kant bg-white">
            {html ? (
              <div className="px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
                {/* Scopat: mallens egen `body`-regel får inte sätta padding
                    på dashboardens body och knuffa hela skalet i sidled. */}
                <div
                  className={BREV_SCOPE}
                  dangerouslySetInnerHTML={{ __html: scopeLetterHtml(formData.content) }}
                />
              </div>
            ) : (
              <div className="px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
                <div
                  className="mx-auto max-w-2xl text-ink-1"
                  style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                  dangerouslySetInnerHTML={{ __html: formatContent(formData.content) }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
