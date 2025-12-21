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
    <div className="min-h-screen bg-gray-50">
      {/* Header med gradient */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Tillbaka-länk */}
          <Link
            href="/dashboard/mina-brev"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till mina brev
          </Link>

          {/* Titel och taggar */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            {currentLetter.title || 'Ansökningsbrev'}
          </h1>

          <div className="flex flex-wrap gap-2">
            {currentLetter.company && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                <Building2 className="w-3 h-3 mr-1.5" />
                {currentLetter.company}
              </span>
            )}
            {currentLetter.job_title && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                <Briefcase className="w-3 h-3 mr-1.5" />
                {currentLetter.job_title}
              </span>
            )}
            {currentLetter.template_id && DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES] && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                <Palette className="w-3 h-3 mr-1.5" />
                {DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES].name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Huvudinnehåll */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4 sm:space-y-6">
        {/* Verktygsfält - Mobil-first */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          {/* Zoom - centrerad på mobil */}
          <div className="flex items-center justify-center gap-2 pb-4 mb-4 border-b border-gray-100">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Åtgärdsknappar - Stack på mobil, rad på desktop */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2">
            {/* Redigera - Primär knapp */}
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-medium shadow-md hover:shadow-lg touch-manipulation"
            >
              <Edit className="w-4 h-4" />
              Redigera brev
            </button>

            {/* Kopiera */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all text-sm font-medium touch-manipulation"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
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
                className="flex-1 sm:flex-none !px-4 !py-3 sm:!py-2.5 !text-sm !font-medium !shadow-sm touch-manipulation"
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
                className="flex-1 sm:flex-none !px-4 !py-3 sm:!py-2.5 !text-sm !font-medium !shadow-sm touch-manipulation"
                showTemplateSelector={false}
                showPreview={false}
              />
            </div>

            {/* Ta bort */}
            <button
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-lg transition-all text-sm font-medium disabled:opacity-50 touch-manipulation"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? 'Tar bort...' : 'Ta bort'}
            </button>
          </div>
        </div>

        {/* Dokumentförhandsvisning - MED PADDING */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                    className="prose prose-gray"
                    style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                    dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metainformation */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Skapad: </span>
              <span className="text-gray-900">
                {currentLetter.created_at
                  ? new Date(currentLetter.created_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'Okänt'}
              </span>
            </div>
            {currentLetter.updated_at && currentLetter.created_at &&
               new Date(currentLetter.updated_at) > new Date(currentLetter.created_at) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Uppdaterad: </span>
                <span className="text-gray-900">
                  {new Date(currentLetter.updated_at).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
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