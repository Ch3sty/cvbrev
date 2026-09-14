'use client';

/**
 * Steg 6: brevet. Bekräftelsen ligger ovanför (CreateLetterClient), här är
 * handlingarna och själva brevet. En primär handling (Spara) i ink, resten
 * sekundära. Tillstånd är rader: sparat och loggat som statusrad, fel som
 * FlowError. Mallbytet visas som "brevet skrivs" i stället för en snurra
 * över dokumentet. Ingen rörelse.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates';
import {
  extractEditableContent,
  isTemplateHTML as checkIsTemplateHTML,
} from '@/lib/letters/extract-editable-content';
import StatusRow from '@/components/shell/StatusRow';
import FlowError from '@/components/shell/FlowError';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { scopeLetterHtml, BREV_SCOPE } from '@/app/dashboard/mina-brev/scopeLetterHtml';
import FontSelector, { type FontId, FONTS } from '../FontSelector';

interface PreviewStepProps {
  letterContent: string;
  templateId: string;
  onEdit: (content: string) => void;
  onDownload: (format: 'pdf' | 'docx') => void;
  onSave?: () => void;
  /**
   * Visa "Spara brevet" i innehållet. Standard är false: i FlowShell ligger
   * den i foten, inom räckhåll utan att scrolla. Kvotspärren renderar steget
   * utanför skalet och sätter därför true.
   */
  showInlineSave?: boolean;
  /** Loggar brevet som en sökt tjänst; returnerar ansökans id (för ångra). */
  onMarkAsApplied?: () => Promise<string>;
  onUndoMarkAsApplied?: (applicationId: string) => Promise<void>;
  selectedFont: FontId;
  onFontChange: (fontId: FontId) => void;
  saveError?: string | null;
  isPremium?: boolean;
  isRegeneratingTemplate?: boolean;
  registerRef?: (el: HTMLElement | null) => void;
}

const PRIMARY =
  'inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';
const SECONDARY =
  'inline-flex h-11 items-center justify-center rounded-lg border border-kant bg-panel px-3 text-sm font-medium text-ink-1 transition-[border-color] duration-[120ms] hover:border-kant-stark disabled:cursor-not-allowed disabled:opacity-60';
const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1';

export default function PreviewStep({
  letterContent,
  templateId,
  onEdit,
  onDownload,
  onSave,
  showInlineSave = false,
  onMarkAsApplied,
  onUndoMarkAsApplied,
  selectedFont,
  onFontChange,
  saveError,
  isPremium = false,
  isRegeneratingTemplate = false,
  registerRef,
}: PreviewStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(letterContent);
  const [editableText, setEditableText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isDocxGenerating, setIsDocxGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isMarkingApplied, setIsMarkingApplied] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [showAppliedBanner, setShowAppliedBanner] = useState(false);

  const selectedFontData = FONTS[selectedFont];
  // Mallen läses för att hålla typen levande; namnet visas inte här.
  void DOCX_TEMPLATES[templateId as DocxTemplateId];

  // Uppdatera när innehållet ändras utifrån, till exempel efter mallbyte.
  useEffect(() => {
    setEditedContent(letterContent);
  }, [letterContent]);

  const handleCopy = async () => {
    const textToCopy = checkIsTemplateHTML(editedContent)
      ? extractEditableContent(editedContent)
      : editedContent;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    const cleanText = checkIsTemplateHTML(editedContent)
      ? extractEditableContent(editedContent)
      : editedContent;
    setEditableText(cleanText);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Den redigerade texten skickas (inte HTML); föräldern bygger om.
    onEdit(editableText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableText('');
  };

  // "Brevet är sparat" visades förut så fort onSave returnerat, oavsett hur
  // det gick, eftersom föräldern svalde sitt eget fel. Resultatet var två
  // motsatta besked på samma skärm: felrutan och bekräftelsen. Nu sätts
  // kvittot bara när onSave faktiskt resolvat.
  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave();
      setShowSaveSuccess(true);
    } catch (error) {
      console.error('Kunde inte spara brevet:', error);
      setShowSaveSuccess(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAsApplied = async () => {
    if (!onMarkAsApplied || isMarkingApplied || appliedId) return;
    setIsMarkingApplied(true);
    try {
      const applicationId = await onMarkAsApplied();
      setAppliedId(applicationId);
      setShowAppliedBanner(true);
      setTimeout(() => setShowAppliedBanner(false), 8000);
    } catch (error) {
      console.error('Kunde inte markera som sökt:', error);
    } finally {
      setIsMarkingApplied(false);
    }
  };

  const handleUndoApplied = async () => {
    if (!appliedId || !onUndoMarkAsApplied) return;
    try {
      await onUndoMarkAsApplied(appliedId);
      setAppliedId(null);
      setShowAppliedBanner(false);
    } catch (error) {
      console.error('Kunde inte ångra:', error);
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      await onDownload('pdf');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDocxGenerating(true);
    try {
      await onDownload('docx');
    } finally {
      setIsDocxGenerating(false);
    }
  };

  const isTemplateHTML = (content: string) =>
    content.includes('<div') || content.includes('<style');

  const formatContent = (content: string) => {
    if (typeof content !== 'string') {
      console.error('formatContent fick något som inte är en sträng:', typeof content);
      return '<p>Brevet kunde inte visas. Kontakta supporten om det händer igen.</p>';
    }
    if (content.trim() === '') {
      return '<p>Brevet är tomt.</p>';
    }
    // Mallens style-block scopas så dess body-regel inte träffar sidan.
    if (isTemplateHTML(content)) return scopeLetterHtml(content);

    // Ren text (äldre brev): enkel styckeindelning.
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

  const html = isTemplateHTML(editedContent);

  return (
    <section ref={registerRef} data-flow-section="preview" className="space-y-4">
      {showSaveSuccess ? (
        <StatusRow
          tone="positive"
          showDot
          label="Brevet är sparat"
          action={
            <Link href="/dashboard/mina-brev" className={LINK}>
              Mina brev
            </Link>
          }
        >
          Brevet är sparat.
        </StatusRow>
      ) : null}

      {showAppliedBanner && appliedId ? (
        <StatusRow
          tone="positive"
          showDot
          label="Loggad i Sökta tjänster"
          action={
            <span className="flex items-center gap-4">
              <Link href="/dashboard/sokta-tjanster" className={LINK}>
                Visa
              </Link>
              {onUndoMarkAsApplied ? (
                <button type="button" onClick={handleUndoApplied} className={LINK}>
                  Ångra
                </button>
              ) : null}
            </span>
          }
        >
          Loggad i Sökta tjänster.
        </StatusRow>
      ) : null}

      {saveError ? (
        <FlowError title="Brevet kunde inte sparas" message={saveError} onRetry={handleSave} />
      ) : null}

      {isEditing ? (
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <label htmlFor="letter-editor" className="text-kort text-ink-1">
            Redigera texten
          </label>
          <textarea
            id="letter-editor"
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            className="mt-3 h-[480px] w-full resize-none rounded-lg border border-kant bg-insunken p-4 text-base leading-7 text-ink-1 shadow-insunken transition-colors focus:border-kant-stark focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            style={{ fontFamily: selectedFontData.fallback }}
            placeholder="Skriv ditt brev här"
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <button type="button" onClick={handleSaveEdit} className={PRIMARY}>
              Spara ändringar
            </button>
            <button type="button" onClick={handleCancelEdit} className={LINK}>
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {/* Spara brevet ligger i FlowShells fot, alltid inom räckhåll.
                Kvar här bara när steget renderas utanför skalet (kvotspärren),
                och aldrig efter att brevet sparats: då pekar kvittot ovan mot
                Mina brev i stället. */}
            {onSave && showInlineSave && !showSaveSuccess ? (
              <button type="button" onClick={handleSave} disabled={isSaving} className={PRIMARY}>
                {isSaving ? 'Sparar' : 'Spara brevet'}
              </button>
            ) : null}

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button type="button" onClick={handleStartEdit} className={SECONDARY}>
                Redigera
              </button>
              <button type="button" onClick={handleCopy} className={SECONDARY}>
                {copied ? 'Kopierat' : 'Kopiera'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className={SECONDARY}
              >
                {isPdfGenerating ? 'Skapar PDF' : 'Ladda ner PDF'}
              </button>
              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={isDocxGenerating}
                className={SECONDARY}
              >
                {isDocxGenerating ? 'Skapar Word' : 'Ladda ner Word'}
              </button>
              {onMarkAsApplied ? (
                <button
                  type="button"
                  onClick={handleMarkAsApplied}
                  disabled={isMarkingApplied || Boolean(appliedId)}
                  className={`${SECONDARY} col-span-2`}
                >
                  {isMarkingApplied
                    ? 'Loggar'
                    : appliedId
                      ? 'Loggad som sökt'
                      : 'Markera som sökt'}
                </button>
              ) : null}
            </div>
          </div>

          <FontSelector selectedFont={selectedFont} onFontChange={onFontChange} isPremium={isPremium} />

          <div className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
            {isRegeneratingTemplate ? (
              <LoadingSkeleton
                variant="writing"
                label="Skriver om brevet i den nya mallen"
                meta="Samma innehåll, ny form. Tar cirka 15 sekunder."
              />
            ) : (
              <div
                className={html ? BREV_SCOPE : 'mx-auto max-w-2xl text-ink-1'}
                style={
                  html
                    ? { fontFamily: selectedFontData.fallback }
                    : { fontFamily: selectedFontData.fallback, lineHeight: '1.8' }
                }
                dangerouslySetInnerHTML={{ __html: formatContent(editedContent) }}
              />
            )}
          </div>

          <p className="text-meta text-ink-3">
            Dina kontaktuppgifter från profilen är redan med. Tryck på Redigera om du vill ändra något.
          </p>
        </>
      )}
    </section>
  );
}
