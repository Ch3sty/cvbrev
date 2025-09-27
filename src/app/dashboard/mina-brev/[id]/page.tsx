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
  Calendar
} from 'lucide-react';

// Reuse LetterTag component with light theme
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
    company: { icon: <Building2 className="w-4 h-4 mr-1.5 text-blue-600" />, bgClass: "bg-blue-50 text-blue-700 border-blue-200" },
    job: { icon: <Briefcase className="w-4 h-4 mr-1.5 text-purple-600" />, bgClass: "bg-purple-50 text-purple-700 border-purple-200" },
    tone: { icon: <MessageSquare className="w-4 h-4 mr-1.5 text-pink-600" />, bgClass: "bg-pink-50 text-pink-700 border-pink-200" }
  };
  const { icon, bgClass } = iconAndColor[type];
  const displayValue = type === 'tone' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${bgClass}`} title={`${label}: ${displayValue}`} style={{maxWidth: '180px'}}>
      {icon}
      <span className="truncate">{displayValue}</span>
    </span>
  );
};

export default function ViewLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter, isDeleting } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex-1 mb-4 md:mb-0 md:mr-6">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">{currentLetter.title || 'Ansökningsbrev'}</h1>
          <div className="flex flex-wrap gap-2">
            <LetterTag label="Företag" value={currentLetter.company} type="company" />
            <LetterTag label="Tjänst" value={currentLetter.job_title} type="job" />
            <LetterTag label="Tonalitet" value={currentLetter.tonality} type="tone" />
          </div>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-purple-500/25"
          >
            <Edit className="w-4 h-4 mr-2" />
            Redigera
          </button>
          <button
            onClick={handleDeleteRequest}
            disabled={isDeleting}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-red-500/25 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Ta bort
          </button>
        </div>
      </motion.div>

      {/* Letter content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="p-6 md:p-8 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80 mb-6"
      >
        <div
          className="prose prose-gray max-w-none text-gray-800 view-letter-content"
          style={{ lineHeight: '1.7' }}
          dangerouslySetInnerHTML={{ __html: currentLetter.content?.replace(/\n/g, '<br />') || '' }}
        />
      </motion.div>

      {/* Meta info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="p-5 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80 mb-6"
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

      {/* Download section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="p-5 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/80 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
          <Download className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
          Ladda ned brev
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all shadow-md hover:shadow-green-500/25">
            <Download className="w-4 h-4 mr-2" />
            Ladda ned som PDF
          </button>
          <button className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-md hover:shadow-blue-500/25">
            <Download className="w-4 h-4 mr-2" />
            Ladda ned som DOCX
          </button>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8"
      >
        <Link href="/dashboard/mina-brev" className="inline-flex items-center w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border border-gray-300 shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tillbaka till mina brev
        </Link>
        <Link href="/dashboard/skapa-brev" className="inline-flex items-center w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-all shadow-md hover:shadow-pink-500/25">
          <Plus className="w-4 h-4 mr-2" />
          Skapa nytt brev
        </Link>
      </motion.div>

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
              <button onClick={cancelDeleteAction} disabled={isDeleting} className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 border border-gray-300">
                Avbryt
              </button>
              <button onClick={confirmDeleteAction} disabled={isDeleting} className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
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
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}