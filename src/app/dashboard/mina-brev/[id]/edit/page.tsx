'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  FileText,
  Building2,
  Briefcase,
  X,
  Loader2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Edit3,
  Palette
} from 'lucide-react';

import DownloadButton from '@/components/letters/download-button';
import { extractEditableContent, isTemplateHTML } from '@/lib/letters/extract-editable-content';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

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
    content: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState('');
  const [copied, setCopied] = useState(false);
  // FIX: Default zoom 100% istället för 70% - naturlig läsbar storlek
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
        content: currentLetter.content || ''
      });
    }
  }, [currentLetter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          'Brevet har sparats! Du hittar det under "Mina brev".',
          '/images/maskot/success-letter-saved.svg',
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
    const cleanText = isTemplateHTML(content)
      ? extractEditableContent(content)
      : content;
    setEditableText(cleanText);
    setIsEditing(true);
  };

  const handleCopy = async () => {
    const content = formData.content || '';
    const textToCopy = isTemplateHTML(content)
      ? extractEditableContent(content)
      : content;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    setFormData(prev => ({ ...prev, content: editableText }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableText('');
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map(line => {
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

  // Laddar
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
          <p className="text-sm text-gray-600">Laddar brev...</p>
        </div>
      </div>
    );
  }

  // Fel
  if (error || !currentLetter) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Brevet kunde inte hittas</h4>
                <p className="text-gray-600 text-sm mb-4">
                  {error || 'Brevet finns inte eller har tagits bort.'}
                </p>
                <Link
                  href="/dashboard/mina-brev"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tillbaka till mina brev
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="purple" />

      {/* Hero Header Card */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 pt-6"
        >
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 shadow-lg relative overflow-hidden">
            {/* Dekorativ orb */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-12 translate-x-12" />

            <div className="relative z-10">
              {/* Tillbaka-länk */}
              <Link
                href={`/dashboard/mina-brev/${id}`}
                className="inline-flex items-center text-slate-600 hover:text-purple-600 transition-colors mb-4 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till brevet
              </Link>

              {/* Titel */}
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Redigera brev
                </h1>
              </div>

              {/* Taggar */}
              <div className="flex flex-wrap gap-2">
                {currentLetter.company && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    <Building2 className="w-3 h-3 mr-1.5" />
                    {currentLetter.company}
                  </span>
                )}
                {currentLetter.job_title && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200">
                    <Briefcase className="w-3 h-3 mr-1.5" />
                    {currentLetter.job_title}
                  </span>
                )}
                {currentLetter.template_id && DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES] && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
                    <Palette className="w-3 h-3 mr-1.5" />
                    {DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES].name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Huvudinnehåll */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        {/* Felmeddelande */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-xl sm:rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Kunde inte spara</p>
              <p className="text-red-700 text-sm">{saveError}</p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Brevinfo-formulär med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 p-6 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Brevinfo
          </h2>
          <div className="space-y-4">
            {/* Titel */}
            <div>
              <label htmlFor="title" className="flex items-center mb-2 text-sm font-medium text-slate-700">
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                Titel
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 text-slate-900 bg-white border border-purple-200/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px]"
                placeholder="Ansökningsbrev"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Företag */}
              <div>
                <label htmlFor="company" className="flex items-center mb-2 text-sm font-medium text-slate-700">
                  <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                  Företag
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-3 text-slate-900 bg-white border border-purple-200/50 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px]"
                  placeholder="Företagsnamn"
                />
              </div>

              {/* Tjänstetitel */}
              <div>
                <label htmlFor="job_title" className="flex items-center mb-2 text-sm font-medium text-slate-700">
                  <Briefcase className="w-4 h-4 mr-2 text-pink-600" />
                  Tjänstetitel
                </label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="w-full p-3 text-slate-900 bg-white border border-pink-200/50 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all min-h-[48px]"
                  placeholder="Jobbtitel"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verktygsfält med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 shadow-lg"
        >
          {/* Zoom-kontroller */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Åtgärdsknappar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-sm min-h-[44px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Kopierat!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopiera
                </>
              )}
            </button>

            <button
              onClick={isEditing ? handleCancelEdit : handleStartEdit}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-sm min-h-[44px]"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Avbryt' : 'Redigera text'}
            </button>

            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50 shadow-lg min-h-[48px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Spara
                </>
              )}
            </motion.button>

            <DownloadButton
              format="pdf"
              letterContent={formData.content}
              metadata={{
                title: formData.title || undefined,
                company: formData.company || undefined,
                position: formData.job_title || undefined
              }}
              className="!px-3 !py-2 !text-sm !min-h-[44px]"
              showTemplateSelector={false}
              showPreview={false}
            />
          </div>
        </motion.div>

        {/* Dokumentförhandsvisning / Redigering med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 shadow-lg overflow-hidden"
        >
          {isEditing ? (
            <div className="p-6">
              <textarea
                value={editableText}
                onChange={(e) => setEditableText(e.target.value)}
                className="w-full min-h-[500px] p-6 bg-white border border-purple-200/50 rounded-xl text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                placeholder="Skriv ditt brev här..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-slate-700 bg-white border border-purple-200 hover:bg-purple-50 rounded-xl transition-colors min-h-[48px]"
                >
                  Avbryt
                </button>
                <motion.button
                  onClick={handleSaveEdit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-colors font-medium shadow-lg min-h-[48px]"
                >
                  Spara ändringar
                </motion.button>
              </div>
            </div>
          ) : (
            <div
              ref={previewRef}
              className="w-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease'
              }}
            >
              {isTemplateHTML(formData.content) ? (
                // Mallbaserad HTML - lägg till padding runt
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
    </div>
  );
}
