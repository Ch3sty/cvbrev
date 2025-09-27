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
  Loader2
} from 'lucide-react';

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

      if (!formData.content.trim()) {
        setSaveError('Brevinnehåll är obligatoriskt');
        return;
      }

      const success = await editLetter(id, {
        title: formData.title,
        company: formData.company,
        job_title: formData.job_title,
        content: formData.content,
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

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show error message if something went wrong
  if (error || !currentLetter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="mb-2 text-xl font-bold text-red-800">Ett fel uppstod</h2>
          <p className="text-red-700">{error || 'Brevet kunde inte hittas'}</p>
          <Link href="/dashboard/mina-brev" className="inline-block px-4 py-2 mt-4 text-white bg-red-600 rounded-md hover:bg-red-700">
            Tillbaka till mina brev
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <div className="flex items-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-xl opacity-20"></div>
            <h1 className="relative text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Redigera brev
            </h1>
          </div>
        </div>
        <p className="text-gray-700">
          Gör ändringar i ditt personliga brev och spara när du är nöjd.
        </p>
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

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-6 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80"
        >
          <div className="space-y-6">
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

            {/* Content field */}
            <div>
              <label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-900">
                Brevinnehåll
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                className="w-full p-4 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all resize-none"
                placeholder="Brevets innehåll..."
              />
              <p className="mt-2 text-xs text-gray-600">
                Skriv eller klistra in ditt brevinnehåll här. Du kan använda grundläggande formatering.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-3"
        >
          <Link
            href={`/dashboard/mina-brev/${id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-300 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Avbryt
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-all shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Spara ändringar
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}