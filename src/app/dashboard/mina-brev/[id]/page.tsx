'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  FileText,
  Building2,
  Briefcase,
  MessageSquare,
  Clock,
  Calendar,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Palette
} from 'lucide-react';

import DownloadButton from '@/components/letters/download-button';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

// Enkel tag-komponent
const LetterTag = ({
  label,
  value,
  type
}: {
  label: string;
  value: string | null;
  type: 'company' | 'job' | 'tone' | 'template'
}) => {
  if (!value) return null;

  const config = {
    company: { icon: Building2, colors: "bg-pink-50 text-pink-700 border-pink-200" },
    job: { icon: Briefcase, colors: "bg-purple-50 text-purple-700 border-purple-200" },
    tone: { icon: MessageSquare, colors: "bg-pink-50 text-pink-700 border-pink-200" },
    template: { icon: Palette, colors: "bg-purple-50 text-purple-700 border-purple-200" }
  };

  const { icon: Icon, colors } = config[type];
  const displayValue = type === 'tone' ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${colors}`}
      title={`${label}: ${displayValue}`}
    >
      <Icon className="w-3 h-3 mr-1.5" />
      <span className="truncate max-w-[140px]">{displayValue}</span>
    </span>
  );
};

export default function ViewLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter, isDeleting } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  // FIX: Default zoom 100% istället för 70% - naturlig läsbar storlek
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

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAction = async () => {
    if (await removeLetter(id)) {
      router.push('/dashboard/mina-brev');
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeleteAction = () => {
    if (!isDeleting) {
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

  const isTemplateHTML = (content: string) => {
    // Check if content is already formatted HTML from a template
    return content.includes('<div') || content.includes('<style');
  };

  const formatContent = (content: string) => {
    // If content is already template HTML, return it as-is
    if (isTemplateHTML(content)) {
      console.log('✅ Rendering template HTML with profile data');
      return content;
    }

    // Otherwise, format plain text for display (fallback for legacy content)
    console.log('⚠️ Formatting plain text content (legacy fallback)');
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
  if (isLoading && !currentLetter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
          <p className="text-sm text-gray-600">Laddar brev...</p>
        </div>
      </div>
    );
  }

  // Fel eller ej hittat
  if (error || (!isLoading && !currentLetter)) {
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

  if (!currentLetter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ett oväntat fel inträffade.</p>
          <Link
            href="/dashboard/mina-brev"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Tillbaka till mina brev
          </Link>
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
                href="/dashboard/mina-brev"
                className="inline-flex items-center text-slate-600 hover:text-purple-600 transition-colors mb-4 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till mina brev
              </Link>

              {/* Titel och taggar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {currentLetter.title || 'Ansökningsbrev'}
                </h1>
              </div>

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4 sm:space-y-6 relative z-10">
        {/* Verktygsfält med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 shadow-lg p-4"
        >
          {/* Zoom - centrerad på mobil */}
          <div className="flex items-center justify-center gap-2 pb-4 mb-4 border-b border-purple-100">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Åtgärdsknappar - Stack på mobil, rad på desktop */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2">
            {/* Redigera - Primär knapp */}
            <motion.button
              onClick={handleEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all text-sm font-medium shadow-lg hover:shadow-xl touch-manipulation min-h-[48px]"
            >
              <Edit className="w-4 h-4" />
              Redigera brev
            </motion.button>

            {/* Kopiera */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-slate-700 bg-white border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all text-sm font-medium touch-manipulation min-h-[48px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Kopierat!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Kopiera text
                </>
              )}
            </button>

            {/* Ladda ned - Rad med 2 knappar */}
            <div className="flex gap-2">
              <DownloadButton
                format="pdf"
                letterContent={currentLetter.content || ''}
                metadata={{
                  title: currentLetter.title || undefined,
                  company: currentLetter.company || undefined,
                  position: currentLetter.job_title || undefined
                }}
                className="flex-1 sm:flex-none !px-4 !py-3 sm:!py-2.5 !text-sm !font-medium !shadow-sm touch-manipulation !min-h-[48px]"
                showTemplateSelector={false}
                showPreview={false}
              />

              <DownloadButton
                format="docx"
                letterContent={currentLetter.content || ''}
                metadata={{
                  title: currentLetter.title || undefined,
                  company: currentLetter.company || undefined,
                  position: currentLetter.job_title || undefined
                }}
                className="flex-1 sm:flex-none !px-4 !py-3 sm:!py-2.5 !text-sm !font-medium !shadow-sm touch-manipulation !min-h-[48px]"
                showTemplateSelector={false}
                showPreview={false}
              />
            </div>

            {/* Ta bort */}
            <button
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-xl transition-all text-sm font-medium disabled:opacity-50 touch-manipulation min-h-[48px]"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? 'Tar bort...' : 'Ta bort'}
            </button>
          </div>
        </motion.div>

        {/* Dokumentförhandsvisning med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 shadow-lg overflow-hidden"
        >
          <div
            ref={previewRef}
            className="w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease'
            }}
          >
            {isTemplateHTML(currentLetter.content || '') ? (
              // Mallbaserad HTML - lägg till padding runt
              <div className="px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
                <div dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }} />
              </div>
            ) : (
              // Fallback för vanlig text
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

        {/* Metainformation med glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 p-4 shadow-lg"
        >
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Skapad: </span>
              <span className="text-slate-900 font-medium">
                {currentLetter.created_at
                  ? new Date(currentLetter.created_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'Okänt'}
              </span>
            </div>
            {currentLetter.updated_at && currentLetter.created_at &&
               new Date(currentLetter.updated_at) > new Date(currentLetter.created_at) && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-pink-400" />
                <span>Uppdaterad: </span>
                <span className="text-slate-900 font-medium">
                  {new Date(currentLetter.updated_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bekräftelsedialog för borttagning */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Ta bort brevet?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Brevet "{currentLetter?.title || 'Namnlöst'}" kommer att raderas permanent och kan inte återställas.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={cancelDeleteAction}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDeleteAction}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Tar bort...
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
    </div>
  );
}