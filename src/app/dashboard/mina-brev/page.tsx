'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Eye, Pencil, Trash2, Plus, Search, Filter,
  Calendar, TrendingUp, Target, MoreVertical, X,
  Building2, Briefcase, MessageSquare, Palette, Grid3x3, LayoutGrid,
  ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw, Download
} from 'lucide-react';

// UI Components
import Notification from '@/components/ui/notification';
import DownloadButton from '@/components/letters/download-button';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import { htmlToPlainText, createPreview } from '@/utils/helpers';

// Extrahera ren förhandsgranskning utan kontaktuppgifter
const getCleanPreview = (content: string, maxLength = 120): string => {
  if (!content) return 'Ingen förhandsgranskning tillgänglig';

  // Ta bort HTML-tags
  let cleaned = htmlToPlainText(content);

  // Ta bort email-adresser
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
  // Ta bort telefonnummer
  cleaned = cleaned.replace(/(\+46|0)[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}/g, '');
  cleaned = cleaned.replace(/\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '');
  // Ta bort postnummer
  cleaned = cleaned.replace(/\d{3}\s?\d{2}\s+[A-ZÅÄÖ][a-zåäö]+/g, '');
  // Ta bort datum i början
  cleaned = cleaned.replace(/^\d{1,2}[\s/.-]\w+[\s/.-]?\d{2,4}\s*/i, '');
  cleaned = cleaned.replace(/^Stockholm,?\s*\d{1,2}[\s/.-]?\w+[\s/.-]?\d{2,4}\s*/i, '');

  // Rensa upp extra mellanslag
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Hitta första meningsfulla mening (hoppa över hälsningar som "Hej!")
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const meaningfulSentence = sentences.find(s => s.length > 30) || sentences[0] || cleaned;

  return createPreview(meaningfulSentence, maxLength);
};

// Statistik-widget
const StatWidget = ({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
  </div>
);

// Brev-kort komponent
const LetterCard = ({ letter, onView, onEdit, onDelete, isDeleting }: {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-pink-300 hover:shadow-lg transition-all group"
    >
      {/* Header med gradient */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-pink-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-md flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                {letter.title || 'Ansökningsbrev'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(letter.updated_at || letter.created_at || new Date()), {
                  addSuffix: true,
                  locale: sv
                })}
              </p>
            </div>
          </div>

          {/* Mer-meny */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-white/80 transition-colors touch-manipulation"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20 min-w-[140px]"
                  onMouseLeave={() => setShowActions(false)}
                >
                  <button
                    onClick={() => { onView(letter.id); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Visa
                  </button>
                  <button
                    onClick={() => { onEdit(letter.id); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4" /> Redigera
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => { onDelete(letter.id); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Ta bort
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tags - max 2 synliga */}
      <div className="px-4 sm:px-5 pt-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {letter.company && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              <Building2 className="w-3 h-3 mr-1" />
              {letter.company.length > 15 ? letter.company.slice(0, 15) + '...' : letter.company}
            </span>
          )}
          {letter.job_title && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
              <Briefcase className="w-3 h-3 mr-1" />
              {letter.job_title.length > 20 ? letter.job_title.slice(0, 20) + '...' : letter.job_title}
            </span>
          )}
        </div>

        {/* Ren förhandsvisning */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
          {getCleanPreview(letter.content, 120)}
        </p>
      </div>

      {/* Action buttons - alltid synliga */}
      <div className="px-4 sm:px-5 pb-4 flex items-center gap-2">
        <motion.button
          onClick={() => onView(letter.id)}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 touch-manipulation"
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-4 h-4" />
          Visa
        </motion.button>

        <motion.button
          onClick={() => onEdit(letter.id)}
          className="flex-1 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 touch-manipulation"
          whileTap={{ scale: 0.98 }}
        >
          <Pencil className="w-4 h-4" />
          Redigera
        </motion.button>

        <motion.button
          onClick={() => onDelete(letter.id)}
          disabled={isDeleting}
          className="px-3 py-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all disabled:opacity-50 touch-manipulation"
          whileTap={{ scale: 0.98 }}
        >
          {isDeleting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Dokument-förhandsgranskning modal
const DocumentPreview = ({ letter, onClose }: { letter: any; onClose: () => void }) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isTemplateHTML = (content: string) => {
    return content.includes('<div') || content.includes('<style');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-5/6'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{letter.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 rounded hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[50px] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-2 rounded hover:bg-gray-100 transition-colors touch-manipulation"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-white/80 transition-colors touch-manipulation"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <DownloadButton
              format="pdf"
              letterContent={letter.content || ''}
              metadata={{
                title: letter.title,
                company: letter.company,
                position: letter.job_title
              }}
              className="!px-3 !py-2 !text-sm"
              showTemplateSelector={false}
              showPreview={false}
            />

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dokument-vy */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-8">
          <div
            className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            <div className="aspect-[210/297] p-8 sm:p-12 bg-white">
              <div
                className={isTemplateHTML(letter.content || '') ? '' : 'prose prose-sm max-w-none text-gray-900 leading-relaxed'}
                dangerouslySetInnerHTML={{ __html: letter.content || '' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function MinaBrevPage() {
  const router = useRouter();
  const { letters, isLoading, removeLetter, refreshLetters } = useLetters();
  const { successWithMascot } = useNotification();
  const { maxSavedLetters, profile, hasReachedLetterLimit } = useProfile();

  // UI State
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch letters
  const refreshLettersRef = useRef(refreshLetters);
  useEffect(() => {
    refreshLettersRef.current = refreshLetters;
  }, [refreshLetters]);

  useEffect(() => {
    if (profile) {
      refreshLettersRef.current();
    }
  }, [profile]);

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && profile) {
        refreshLettersRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [profile]);

  // Filter letters
  const filteredLetters = useMemo(() => {
    if (!letters) return [];
    return letters.filter(letter =>
      letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [letters, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    if (!letters) return { total: 0, thisMonth: 0, avgPerMonth: 0 };

    const thisMonth = letters.filter(letter => {
      if (!letter.created_at) return false;
      const letterDate = new Date(letter.created_at);
      const now = new Date();
      return letterDate.getMonth() === now.getMonth() && letterDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total: letters.length,
      thisMonth,
      avgPerMonth: letters.length > 0 ? Math.round(letters.length / 3) : 0
    };
  }, [letters]);

  const handleView = (letterId: string) => {
    router.push(`/dashboard/mina-brev/${letterId}`);
  };

  const handleEdit = (letterId: string) => {
    router.push(`/dashboard/mina-brev/${letterId}/edit`);
  };

  const handleDelete = async (letterId: string) => {
    if (confirm('Är du säker på att du vill ta bort detta brev?')) {
      setDeletingId(letterId);
      try {
        await removeLetter(letterId);
        successWithMascot(
          'Brevet har tagits bort',
          '/images/maskot/success-letter-deleted.svg',
          3000,
          false
        );
      } catch (error) {
        setNotification({
          message: 'Kunde inte ta bort brevet',
          type: 'error',
          isVisible: true
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Mina Brev
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Hantera dina sparade ansökningsbrev
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/skapa-brev"
              className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              <Plus className="w-5 h-5" />
              Skapa nytt brev
            </Link>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatWidget
              title="Totalt antal brev"
              value={stats.total}
              subtitle=""
              icon={FileText}
              color="from-pink-500 to-purple-500"
            />
            <StatWidget
              title="Denna månaden"
              value={stats.thisMonth}
              subtitle="Skapade"
              icon={Calendar}
              color="from-green-500 to-emerald-500"
            />
            <StatWidget
              title="Genomsnitt/månad"
              value={stats.avgPerMonth}
              subtitle="Senaste 3 mån"
              icon={TrendingUp}
              color="from-blue-500 to-cyan-500"
            />
            <StatWidget
              title="Brevutrymme"
              value={`${letters?.length || 0}/${maxSavedLetters === Infinity ? '∞' : maxSavedLetters}`}
              subtitle={hasReachedLetterLimit ? 'Fullt' : 'Tillgängligt'}
              icon={Target}
              color="from-orange-500 to-amber-500"
            />
          </div>

          {/* Sök och kontroller */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Sök i dina brev..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedView('grid')}
                className={`p-2.5 rounded-xl transition-all touch-manipulation ${
                  selectedView === 'grid'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`p-2.5 rounded-xl transition-all touch-manipulation ${
                  selectedView === 'list'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Brev-lista */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
                  <div className="flex-1 h-9 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLetters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'Inga brev hittades' : 'Inga brev ännu'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm
                ? 'Prova att ändra din sökning.'
                : 'Skapa ditt första personliga brev för att komma igång.'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/skapa-brev"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Plus className="w-5 h-5" />
                Skapa ditt första brev
              </Link>
            )}
          </motion.div>
        ) : (
          <div className={`grid gap-4 ${
            selectedView === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredLetters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === letter.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedLetter && (
          <DocumentPreview
            letter={selectedLetter}
            onClose={() => {
              setShowPreview(false);
              setSelectedLetter(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Notification */}
      {notification?.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
