'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { use } from 'react';
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
  Eye,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Edit3,
  MessageSquare
} from 'lucide-react';

// Import DownloadButton for PDF functionality
import DownloadButton from '@/components/letters/download-button';

// Reuse LetterTag component for consistency
const LetterTag = ({
  label,
  value,
  type
}: {
  label: string;
  value: string | null;
  type: 'company' | 'job' | 'tone'
}) => {
  if (!value) return null;
  const iconAndColor = {
    company: { icon: <Building2 className="w-3 h-3 mr-1" />, bgClass: "bg-blue-50 text-blue-700 border-blue-200" },
    job: { icon: <Briefcase className="w-3 h-3 mr-1" />, bgClass: "bg-purple-50 text-purple-700 border-purple-200" },
    tone: { icon: <MessageSquare className="w-3 h-3 mr-1" />, bgClass: "bg-pink-50 text-pink-700 border-pink-200" }
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

export default function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, editLetter } = useLetters();

  // Unwrap params with React.use()
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
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(0.7);
  const previewRef = useRef<HTMLDivElement>(null);

  // Ref to prevent duplicate loads
  const initialLoadRef = useRef(false);

  // Fetch letter data when component mounts, but only once
  useEffect(() => {
    if (id && !initialLoadRef.current) {
      initialLoadRef.current = true;
      getLetter(id);
    }
  }, [id, getLetter]);

  // Update form when letter data is fetched
  useEffect(() => {
    if (currentLetter) {
      setFormData({
        title: currentLetter.title || '',
        company: currentLetter.company || '',
        job_title: currentLetter.job_title || '',
        content: currentLetter.content || ''
      });
      setEditedContent(currentLetter.content || '');
    }
  }, [currentLetter]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Validate form
      if (!formData.title.trim()) {
        setSaveError('Titel är obligatoriskt');
        return;
      }

      const contentToSave = isEditing ? editedContent : formData.content;
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

  const handleCopy = async () => {
    const contentToCopy = isEditing ? editedContent : formData.content;
    await navigator.clipboard.writeText(contentToCopy.replace(/<[^>]*>/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    setFormData(prev => ({ ...prev, content: editedContent }));
    setIsEditing(false);
  };

  const formatContent = (content: string) => {
    // Simple formatting for preview
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

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error || !currentLetter) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="mb-2 text-xl font-bold text-red-800">Ett fel uppstod</h2>
          <p className="text-red-700">{error || 'Brevet kunde inte hittas'}</p>
          <Link href="/dashboard/mina-brev" className="inline-block px-4 py-2 mt-4 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            Tillbaka till mina brev
          </Link>
        </div>
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
        <Link href={`/dashboard/mina-brev/${id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:scale-105 transition-all duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till brev
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
          Redigera brev
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <LetterTag label="Företag" value={currentLetter.company} type="company" />
          <LetterTag label="Tjänst" value={currentLetter.job_title} type="job" />
          <LetterTag label="Tonalitet" value={currentLetter.tonality} type="tone" />
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Error message */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Fel vid sparning</h4>
              <p className="text-red-700 text-sm">{saveError}</p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Metadata Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-6 bg-white rounded-xl border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brevinfo</h2>
          <div className="space-y-4">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="flex items-center mb-2 text-sm font-medium text-gray-900">
                <FileText className="w-4 h-4 mr-2 text-pink-600" />
                Titel
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                placeholder="Ansökningsbrev"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Company field */}
              <div>
                <label htmlFor="company" className="flex items-center mb-2 text-sm font-medium text-gray-900">
                  <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                  Företag
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Företagsnamn"
                />
              </div>

              {/* Job title field */}
              <div>
                <label htmlFor="job_title" className="flex items-center mb-2 text-sm font-medium text-gray-900">
                  <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                  Tjänstetitel
                </label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="w-full p-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Jobbtitel"
                />
              </div>
            </div>
          </div>
        </motion.div>

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
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">{isEditing ? 'Avbryt' : 'Redigera'}</span>
            </motion.button>

            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Sparar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Spara brev</span>
                </>
              )}
            </motion.button>

            <DownloadButton
              format="pdf"
              letterContent={isEditing ? editedContent : formData.content}
              metadata={{
                title: formData.title || undefined,
                company: formData.company || undefined,
                position: formData.job_title || undefined
              }}
              className="!px-4 !py-2"
              showTemplateSelector={false}
              showPreview={false}
            />
          </div>
        </div>

        {/* Document Preview - EXACT copy from PreviewStep */}
        <div className="bg-gray-50 rounded-2xl p-6 min-h-[600px] flex items-center justify-center">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl"
            >
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-[600px] p-8 bg-white border border-gray-200 rounded-xl text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <div className="flex justify-end gap-2 mt-4">
                <motion.button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(formData.content);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Avbryt
                </motion.button>
                <motion.button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Spara ändringar
                </motion.button>
              </div>
            </motion.div>
          ) : (
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
                className="p-16 text-gray-800"
                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: formatContent(formData.content) }}
              />

              {/* Page Footer */}
              <div className="border-t border-gray-100 px-8 py-4 bg-gradient-to-r from-white to-gray-50">
                <p className="text-xs text-gray-400 text-center">
                  Genererat med Jobbcoach.ai
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Help Text */}
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-600"
          >
            💡 Tips: Du kan redigera texten direkt eller ladda ner som PDF
          </motion.div>
        )}
      </div>
    </div>
  );
}