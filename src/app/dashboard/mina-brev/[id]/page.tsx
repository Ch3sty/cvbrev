'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import Lucide icons
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  FileText,
  Info,
  Plus,
  Building2,
  Briefcase,
  MessageSquare,
  Clock,
  Download,
  Calendar,
  Eye,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Palette
} from 'lucide-react';

// Import DownloadButton for PDF functionality
import DownloadButton from '@/components/letters/download-button';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

// Reuse LetterTag component with light theme
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
  const iconAndColor = {
    company: { icon: <Building2 className="w-3 h-3 mr-1" />, bgClass: "bg-blue-50 text-blue-700 border-blue-200" },
    job: { icon: <Briefcase className="w-3 h-3 mr-1" />, bgClass: "bg-purple-50 text-purple-700 border-purple-200" },
    tone: { icon: <MessageSquare className="w-3 h-3 mr-1" />, bgClass: "bg-pink-50 text-pink-700 border-pink-200" },
    template: { icon: <Palette className="w-3 h-3 mr-1" />, bgClass: "bg-green-50 text-green-700 border-green-200" }
  };
  const { icon, bgClass } = iconAndColor[type];
  const displayValue = type === 'tone' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${bgClass}`} title={`${label}: ${displayValue}`} style={{maxWidth: '180px'}}>
      {icon}
      <span className="truncate">{displayValue}</span>
    </span>
  );
};

export default function ViewLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter, isDeleting } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(0.7);
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

  // Handle initial loading
  if (isLoading && !currentLetter) {
    return (
      <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  // Handle error or letter not found
  if (error || (!isLoading && !currentLetter)) {
    return (
      <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Ett fel uppstod</h4>
              <p className="text-red-700 text-sm">
                {error || 'Brevet kunde inte hittas eller laddas.'}
              </p>
              <Link
                href="/dashboard/mina-brev"
                className="inline-flex items-center mt-3 px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors border border-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till mina brev
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLetter) {
    console.error("ViewLetterPage: Rendering condition met, but currentLetter is still null.");
    return (
      <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
        <p className="text-center text-red-600">Ett oväntat fel inträffade vid rendering av brevet.</p>
        <Link href="/dashboard/mina-brev" className="block text-center mt-4 text-pink-600 hover:text-pink-700 underline">
          Tillbaka till mina brev
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Link href="/dashboard/mina-brev" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till mina brev
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentLetter.title || 'Ansökningsbrev'}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <LetterTag label="Företag" value={currentLetter.company} type="company" />
          <LetterTag label="Tjänst" value={currentLetter.job_title} type="job" />
          <LetterTag
            label="Mall"
            value={currentLetter.template_id && DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES] ? DOCX_TEMPLATES[currentLetter.template_id as keyof typeof DOCX_TEMPLATES].name : null}
            type="template"
          />
          <LetterTag label="Tonalitet" value={currentLetter.tonality} type="tone" />
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Action Bar - EXACT copy from PreviewStep */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg hover:scale-105 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <motion.button
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg hover:scale-105 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Kopiera</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">Redigera</span>
            </motion.button>

            {/* PDF Download */}
            <DownloadButton
              format="pdf"
              letterContent={currentLetter.content || ''}
              metadata={{
                title: currentLetter.title || undefined,
                company: currentLetter.company || undefined,
                position: currentLetter.job_title || undefined
              }}
              className="!px-4 !py-2"
              showTemplateSelector={false}
              showPreview={false}
            />

            {/* DOCX Download */}
            <DownloadButton
              format="docx"
              letterContent={currentLetter.content || ''}
              metadata={{
                title: currentLetter.title || undefined,
                company: currentLetter.company || undefined,
                position: currentLetter.job_title || undefined
              }}
              className="!px-4 !py-2"
              showTemplateSelector={false}
              showPreview={false}
            />

            <motion.button
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{isDeleting ? 'Tar bort...' : 'Ta bort'}</span>
            </motion.button>
          </div>
        </div>

        {/* Document Preview - EXACT copy from PreviewStep */}
        <div className="bg-gray-50 rounded-2xl p-6 min-h-[600px] flex items-center justify-center">
          <motion.div
            ref={previewRef}
            className="bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Page Header */}
            <div className="border-b border-gray-100 px-8 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Personligt brev</span>
              </div>
            </div>

            {/* Page Content */}
            <div
              className={isTemplateHTML(currentLetter.content || '') ? '' : 'p-16 text-gray-800'}
              style={isTemplateHTML(currentLetter.content || '') ? {} : { fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: formatContent(currentLetter.content || '') }}
            />

            {/* Page Footer */}
            <div className="border-t border-gray-100 px-8 py-4 bg-gradient-to-r from-white to-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Genererat med Jobbcoach.ai
              </p>
            </div>
          </motion.div>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600"
        >
          💡 Tips: Du kan redigera texten eller ladda ner som PDF
        </motion.div>

        {/* Meta info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-5 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
            <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            Information
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-gray-600 mb-0.5">Skapad</p>
              <p className="text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
                {currentLetter.created_at ? new Date(currentLetter.created_at).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short'}) : 'Okänt datum'}
              </p>
            </div>
            {currentLetter.updated_at && currentLetter.created_at &&
               new Date(currentLetter.updated_at) > new Date(currentLetter.created_at) && (
              <div>
                <p className="text-gray-600 mb-0.5">Senast uppdaterad</p>
                <p className="text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                  {new Date(currentLetter.updated_at).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short'})}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200 mx-4"
          >
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Bekräfta borttagning
              </h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                Är du säker på att du vill ta bort brevet
                <span className="font-medium text-gray-900 mx-1">"{currentLetter?.title || 'detta brev'}"</span>?
              </p>
              <div className="bg-yellow-50 p-3 border border-yellow-200 rounded-md flex items-start">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800 text-sm">
                  Denna åtgärd kan inte ångras och brevet raderas permanent.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
              <motion.button onClick={cancelDeleteAction} disabled={isDeleting} className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 disabled:opacity-50 border border-gray-300 font-medium shadow-sm hover:shadow-md" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                Avbryt
              </motion.button>
              <motion.button onClick={confirmDeleteAction} disabled={isDeleting} className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:scale-105 flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tar bort...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Ta bort brevet
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}