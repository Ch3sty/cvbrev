'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search,
  Calendar, TrendingUp, Target, X,
  ZoomIn, ZoomOut, Maximize2, Minimize2
} from 'lucide-react';

// UI Components
import Notification from '@/components/ui/notification';
import DownloadButton from '@/components/letters/download-button';
import PremiumLetterListItem from '@/components/letters/PremiumLetterListItem';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

// Statistik-widget med glassmorphism
const StatWidget = ({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{value}</h3>
    <p className="text-slate-600 text-sm">{title}</p>
    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
  </motion.div>
);

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

  // Download handler - placeholder, actual download happens in DownloadButton component
  const handleDownload = (letterId: string, format: 'pdf' | 'docx') => {
    const letter = letters?.find(l => l.id === letterId);
    if (letter) {
      // Navigera till visningssidan där användaren kan ladda ned
      router.push(`/dashboard/mina-brev/${letterId}`);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="purple" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
        >
          {/* Dekorativ orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-12 translate-x-12" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mina Brev
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">
                  Hantera dina sparade ansökningsbrev
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/dashboard/skapa-brev"
                className="w-full sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 touch-manipulation min-h-[48px]"
              >
                <Plus className="w-5 h-5" />
                Skapa nytt brev
              </Link>
            </motion.div>
          </div>
        </motion.div>

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

        {/* Sök med glassmorphism */}
        <div className="relative sm:max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Sök på företag, tjänst..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-xl border border-purple-200/50 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all min-h-[48px]"
          />
        </div>

        {/* Brev-lista */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 p-5 animate-pulse">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-5 bg-purple-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-purple-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="pl-[72px] space-y-2 mb-4">
                  <div className="h-3 bg-purple-100 rounded" />
                  <div className="h-3 bg-purple-100 rounded w-4/5" />
                </div>
                <div className="pl-[72px] flex gap-2">
                  <div className="flex-1 h-10 bg-purple-100 rounded-lg" />
                  <div className="flex-1 h-10 bg-purple-100 rounded-lg" />
                  <div className="flex-1 h-10 bg-purple-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLetters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-purple-200/50 p-8 sm:p-12 text-center shadow-lg"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {searchTerm ? 'Inga brev hittades' : 'Inga brev ännu'}
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchTerm
                ? 'Prova att ändra din sökning.'
                : 'Skapa ditt första personliga brev för att komma igång.'
              }
            </p>
            {!searchTerm && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/dashboard/skapa-brev"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all gap-2 min-h-[48px]"
                >
                  <Plus className="w-5 h-5" />
                  Skapa ditt första brev
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumLetterListItem
                  letter={letter}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  isDeleting={deletingId === letter.id}
                />
              </motion.div>
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
