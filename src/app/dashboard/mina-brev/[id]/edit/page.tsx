'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, AlertTriangle, FileText, Building2, Briefcase,
  X, Loader2, Copy, Check, ZoomIn, ZoomOut, Edit3, Palette,
} from 'lucide-react';

import DownloadButton from '@/components/letters/download-button';
import { extractEditableContent, isTemplateHTML } from '@/lib/letters/extract-editable-content';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

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
  const [zoom, setZoom] = useState(1.0);
  const previewRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (id && !initialLoadRef.current) {
      initialLoadRef.current = true;
      getLetter(id);
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
        setSaveError('Titel är obligatoriskt');
        return;
      }

      const contentToSave = isEditing ? editableText : formData.content;
      if (!contentToSave.trim()) {
        setSaveError('Brevinnehåll är obligatoriskt');
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
        setSaveError('Ett fel uppstod när brevet skulle sparas');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Ett fel uppstod');
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

  const PageBackground = (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)',
      }}
    />
  );

  if (isLoading) {
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

  if (error || !currentLetter) {
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
            href={`/dashboard/mina-brev/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="uppercase tracking-[0.14em]">Tillbaka till brevet</span>
          </Link>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
              Redigera
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {currentLetter.title || 'Ansökningsbrev'}
            </h1>
          </div>

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

        {/* Felmeddelande */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Kunde inte spara</p>
              <p className="text-red-700 text-sm">{saveError}</p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="text-red-600 hover:text-red-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Brevinfo-formulär */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl border border-orange-200/50 p-5"
          style={{ boxShadow: '0 6px 24px -16px rgba(249, 115, 22, 0.15)' }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
            Brevinfo
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Titel
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
                placeholder="Ansökningsbrev"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="company" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Företag
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
                  placeholder="Företagsnamn"
                />
              </div>
              <div>
                <label
                  htmlFor="job_title"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Tjänstetitel
                </label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/40 transition-all"
                  placeholder="Jobbtitel"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verktygsfält */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
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

            <div className="flex flex-wrap items-center gap-2">
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
                    Kopiera
                  </>
                )}
              </button>
              <button
                onClick={isEditing ? handleCancelEdit : handleStartEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-sm font-semibold transition-colors min-h-[40px]"
              >
                <Edit3 className="w-4 h-4" strokeWidth={2.5} />
                {isEditing ? 'Avbryt redigering' : 'Redigera text'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow min-h-[40px] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                    Sparar…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={2.5} />
                    Spara
                  </>
                )}
              </button>
              <DownloadButton
                format="pdf"
                letterContent={formData.content}
                metadata={{
                  title: formData.title || undefined,
                  company: formData.company || undefined,
                  position: formData.job_title || undefined,
                }}
                className="!px-3.5 !py-2 !text-sm !font-semibold !min-h-[40px] !rounded-lg"
                showTemplateSelector={false}
                showPreview={false}
              />
            </div>
          </div>
        </motion.div>

        {/* Preview / Editor */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl border border-orange-200/50 overflow-hidden"
          style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
        >
          {isEditing ? (
            <div className="p-5">
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="w-full min-h-[500px] p-5 bg-white border border-slate-200 rounded-xl text-slate-900 text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-200/40 focus:border-orange-400 transition-all"
                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                placeholder="Skriv ditt brev här…"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-colors text-sm font-semibold min-h-[40px]"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow min-h-[40px]"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  Spara ändringar
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={previewRef}
              className="w-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            >
              {isTemplateHTML(formData.content) ? (
                <div className="px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              ) : (
                <div className="px-6 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-16">
                  <div className="max-w-2xl mx-auto">
                    <div
                      className="prose prose-slate"
                      style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                      dangerouslySetInnerHTML={{ __html: formatContent(formData.content) }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
