'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, Loader2, AlertTriangle,
  Building2, Briefcase, Clock, Calendar, Copy, Check,
  ZoomIn, ZoomOut, Palette,
} from 'lucide-react';

import DownloadButton from '@/components/letters/download-button';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

export default function ViewLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter, isDeleting } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const previewRef = useRef<HTMLDivElement>(null);

  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (id && !initialLoadRef.current && !currentLetter) {
      initialLoadRef.current = true;
      getLetter(id);
    }
  }, [id, currentLetter, getLetter]);

  const handleEdit = () => {
    router.push(`/dashboard/mina-brev/${id}/edit`);
  };

  const handleDeleteRequest = () => setShowDeleteConfirm(true);
  const cancelDeleteAction = () => {
    if (!isDeleting) setShowDeleteConfirm(false);
  };
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

  const isTemplateHTML = (content: string) =>
    content.includes('<div') || content.includes('<style');

  const formatContent = (content: string) => {
    if (isTemplateHTML(content)) return content;
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

  // Sidspecifik bakgrund
  const PageBackground = (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)',
      }}
    />
  );

  if (isLoading && !currentLetter) {
    return (
      <>
        {PageBackground}
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-sm text-slate-600">Laddar brev…</p>
          </div>
        </div>
      </>
    );
  }

  if (error || (!isLoading && !currentLetter)) {
    return (
      <>
        {PageBackground}
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Brevet kunde inte hittas</h4>
                <p className="text-slate-600 text-sm mb-4">
                  {error || 'Brevet finns inte eller har tagits bort.'}
                </p>
                <Link
                  href="/dashboard/mina-brev"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tillbaka till mina brev
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!currentLetter) return null;

  const templateName =
    currentLetter.template_id &&
    DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES]
      ? DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES].name
      : null;

  return (
    <>
      {PageBackground}

      <div className="max-w-5xl mx-auto pb-16 space-y-5">
        {/* Kompakt breadcrumb-header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <Link
            href="/dashboard/mina-brev"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="uppercase tracking-[0.14em]">Mina brev</span>
          </Link>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
              Personligt brev
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {currentLetter.title || 'Ansökningsbrev'}
            </h1>
          </div>

          {/* Taggar */}
          <div className="flex flex-wrap gap-1.5">
            {currentLetter.company && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                <Building2 className="w-3 h-3" strokeWidth={2.5} />
                {currentLetter.company}
              </span>
            )}
            {currentLetter.job_title && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                <Briefcase className="w-3 h-3" strokeWidth={2.5} />
                {currentLetter.job_title}
              </span>
            )}
            {templateName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold">
                <Palette className="w-3 h-3" strokeWidth={2.5} />
                {templateName}
              </span>
            )}
          </div>
        </motion.div>

        {/* Verktygsfält */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl border border-orange-200/50 p-3 sm:p-4"
          style={{ boxShadow: '0 6px 24px -16px rgba(249, 115, 22, 0.18)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Zoom */}
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="p-2 text-slate-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Zooma ut"
              >
                <ZoomOut className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="text-sm font-semibold text-slate-700 min-w-[52px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                className="p-2 text-slate-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Zooma in"
              >
                <ZoomIn className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Knappar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow min-h-[40px]"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              >
                <Edit className="w-4 h-4" strokeWidth={2.5} />
                Redigera
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-sm font-semibold transition-colors min-h-[40px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    Kopierat
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={2.5} />
                    Kopiera text
                  </>
                )}
              </button>
              <DownloadButton
                format="pdf"
                letterContent={currentLetter.content || ''}
                metadata={{
                  title: currentLetter.title || undefined,
                  company: currentLetter.company || undefined,
                  position: currentLetter.job_title || undefined,
                }}
                className="!px-3.5 !py-2 !text-sm !font-semibold !min-h-[40px] !rounded-lg"
                showTemplateSelector={false}
                showPreview={false}
              />
              <DownloadButton
                format="docx"
                letterContent={currentLetter.content || ''}
                metadata={{
                  title: currentLetter.title || undefined,
                  company: currentLetter.company || undefined,
                  position: currentLetter.job_title || undefined,
                }}
                className="!px-3.5 !py-2 !text-sm !font-semibold !min-h-[40px] !rounded-lg"
                showTemplateSelector={false}
                showPreview={false}
              />
              <button
                onClick={handleDeleteRequest}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 text-sm font-semibold transition-colors min-h-[40px] disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                ) : (
                  <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                )}
                <span className="hidden sm:inline">Ta bort</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Brev-förhandsvisning */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-orange-200/50 overflow-hidden"
          style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
        >
          <div
            ref={previewRef}
            className="w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
            }}
          >
            {isTemplateHTML(currentLetter.content || '') ? (
              <div className="px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
                <div dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }} />
              </div>
            ) : (
              <div className="px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
                <div className="max-w-2xl mx-auto">
                  <div
                    className="prose prose-slate"
                    style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Metainfo */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 px-1"
        >
          <div className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
            <span>
              Skapad{' '}
              <span className="text-slate-700 font-semibold">
                {currentLetter.created_at
                  ? new Date(currentLetter.created_at).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'okänt'}
              </span>
            </span>
          </div>
          {currentLetter.updated_at &&
            currentLetter.created_at &&
            new Date(currentLetter.updated_at) > new Date(currentLetter.created_at) && (
              <div className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                <span>
                  Uppdaterad{' '}
                  <span className="text-slate-700 font-semibold">
                    {new Date(currentLetter.updated_at).toLocaleDateString('sv-SE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </span>
              </div>
            )}
        </motion.div>
      </div>

      {/* Bekräftelsedialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Ta bort brevet?</h3>
                  <p className="text-slate-600 text-sm">
                    Brevet "{currentLetter?.title || 'Namnlöst'}" kommer att raderas permanent och
                    kan inte återställas.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={cancelDeleteAction}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Tar bort…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Ta bort
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
