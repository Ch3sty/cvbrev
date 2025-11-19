/**
 * REVOLUTIONERANDE Mina Brev Dashboard - Apple-nivå design
 * Helt ny implementation från grunden med wow-faktorer!
 * Bento-box layout, 3D-transformationer, Glassmorphism och premium micro-interactions
 */
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import { useProfile } from '@/hooks/use-profile';
import { useNotification } from '@/context/notificationcontext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  FileText, Eye, Pencil, Trash2, Download, Plus, Search, Filter,
  Calendar, TrendingUp, Sparkles, Zap, Target, Globe, Users,
  BarChart3, PieChart, Activity, Clock, Star, Award, Rocket,
  ArrowUpRight, ArrowDownRight, MoreVertical, ExternalLink,
  Layers, Grid3x3, LayoutGrid, Maximize2, Minimize2, RefreshCw,
  ChevronDown, ChevronRight, X, Check, AlertTriangle, Info,
  Building2, Briefcase, MessageSquare, Palette, Share2, Copy,
  ZoomIn, ZoomOut, RotateCcw, Settings, Heart, Bookmark
} from 'lucide-react';

// Premium UI Components
import Notification from '@/components/ui/notification';
import DownloadButton from '@/components/letters/download-button';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

// New Premium Components - We'll create these inline for now
const BentoCard = ({ children, className = "", spotlight = false, ...props }: any) => (
  <motion.div
    className={`
      relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50
      shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group
      ${spotlight ? 'ring-2 ring-pink-500/20 shadow-pink-500/10' : ''}
      ${className}
    `}
    whileHover={{
      scale: 1.02,
      y: -4,
      rotateX: 2,
      rotateY: 2,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{
      transformStyle: "preserve-3d",
      perspective: "1000px"
    }}
    {...props}
  >
    {/* Glassmorphism glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

    {/* Hover gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0
                    group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5
                    transition-all duration-500 pointer-events-none" />

    {/* Shimmer effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                      bg-gradient-to-r from-transparent via-white/20 to-transparent
                      transition-transform duration-1000 ease-out" />
    </div>

    <div className="relative z-10">{children}</div>
  </motion.div>
);

const StatWidget = ({ title, value, change, icon: Icon, trend, color }: any) => (
  <BentoCard className="p-3 sm:p-4 md:p-6">
    <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
      <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${color} shadow-lg flex-shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
      </div>
      <motion.div
        className={`flex items-center text-xs sm:text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
        }`}
        animate={{ y: trend === 'up' ? [-2, 0] : trend === 'down' ? [2, 0] : 0 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        {trend === 'up' && <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />}
        {trend === 'down' && <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />}
        {change}
      </motion.div>
    </div>
    <motion.h3
      className="text-2xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {value}
    </motion.h3>
    <p className="text-gray-600 text-xs sm:text-sm truncate">{title}</p>
  </BentoCard>
);

const LetterPreviewCard = ({ letter, onView, onEdit, onDelete, isDeleting }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BentoCard
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      spotlight={isHovered}
    >
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <motion.div
              className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg flex-shrink-0"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                {letter.title || 'Ansökningsbrev'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {formatDistanceToNow(new Date(letter.updated_at || letter.created_at || new Date()), {
                  addSuffix: true,
                  locale: sv
                })}
              </p>
            </div>
          </div>

          {/* Action menu */}
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            <button className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
              <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
            </button>
          </motion.div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {letter.company && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-3 h-3 mr-1" />
              {letter.company}
            </span>
          )}
          {letter.job_title && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <Briefcase className="w-3 h-3 mr-1" />
              {letter.job_title}
            </span>
          )}
          {letter.template_id && DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES] && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <Palette className="w-3 h-3 mr-1" />
              {DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES].name}
            </span>
          )}
          {letter.tonality && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
              <MessageSquare className="w-3 h-3 mr-1" />
              {letter.tonality}
            </span>
          )}
        </div>

        {/* Preview text with gradient fade */}
        <div className="relative mb-4">
          <div className="text-sm text-gray-700 leading-relaxed line-clamp-3 italic">
            {letter.content?.replace(/<[^>]*>/g, '').slice(0, 120)}...
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={() => onView(letter.id)}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 touch-manipulation flex items-center justify-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Visa</span>
          </motion.button>

          <motion.button
            onClick={() => onEdit(letter.id)}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 touch-manipulation flex items-center justify-center gap-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Pencil className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Redigera</span>
          </motion.button>

          <motion.button
            onClick={() => onDelete(letter.id)}
            disabled={isDeleting}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 touch-manipulation flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDeleting ? (
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </BentoCard>
  );
};

const DocumentPreview = ({ letter, onClose }: any) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isTemplateHTML = (content: string) => {
    // Check if content is already formatted HTML from a template
    return content.includes('<div') || content.includes('<style');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
          isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-5/6'
        }`}
        onClick={(e) => e.stopPropagation()}
        layout
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{letter.title}</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm text-gray-600 min-w-12 sm:min-w-16 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-2 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <DownloadButton
              format="pdf"
              letterContent={letter.content || ''}
              metadata={{
                title: letter.title,
                company: letter.company,
                position: letter.job_title
              }}
              className="!px-3 sm:!px-4 !py-2 !text-sm sm:!text-base !min-h-[40px] sm:!min-h-0"
              showTemplateSelector={false}
              showPreview={false}
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document view */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          <motion.div
            className="max-w-3xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center'
            }}
            layout
          >
            {/* A4 Paper simulation */}
            <div className="aspect-[210/297] p-6 sm:p-12 bg-white">
              <div
                className={isTemplateHTML(letter.content || '') ? '' : 'prose prose-sm sm:prose max-w-none text-gray-900 leading-relaxed'}
                dangerouslySetInnerHTML={{ __html: letter.content || '' }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function MinaBrevPage() {
  const router = useRouter();
  const { letters, fetchLetters, isLoading, removeLetter, refreshLetters } = useLetters();
  const { successWithMascot } = useNotification();
  const { maxSavedLetters, subscriptionTier, profile, hasReachedLetterLimit } = useProfile();

  // UI State
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<any>(null);

  // Scroll animations
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 300], [0, -50]);

  // Mouse tracking for interactive effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch letters on mount and force refresh when navigating to this page
  useEffect(() => {
    if (profile) {
      // Always force a fresh fetch to ensure newly saved letters appear
      refreshLetters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]); // Removed refreshLetters from dependencies to prevent infinite loop

  // Use ref to avoid adding refreshLetters to dependencies
  const refreshLettersRef = useRef(refreshLetters);
  useEffect(() => {
    refreshLettersRef.current = refreshLetters;
  }, [refreshLetters]);

  // Additional effect to refresh when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && profile) {
        // Use ref to call latest refreshLetters without adding it to dependencies
        refreshLettersRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [profile]); // Removed refreshLetters from dependencies to prevent infinite loop

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
    if (!letters) return {};

    const thisMonth = letters.filter(letter => {
      if (!letter.created_at) return false;
      const letterDate = new Date(letter.created_at);
      const now = new Date();
      return letterDate.getMonth() === now.getMonth() && letterDate.getFullYear() === now.getFullYear();
    }).length;

    const lastMonth = letters.filter(letter => {
      if (!letter.created_at) return false;
      const letterDate = new Date(letter.created_at);
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      return letterDate.getMonth() === lastMonthDate.getMonth() && letterDate.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    return {
      total: letters.length,
      thisMonth,
      change: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(0) : '0',
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
      try {
        await removeLetter(letterId);
        successWithMascot(
          'Brevet har tagits bort',
          '/images/maskot/success-letter-deleted.svg',
          3000,
          false // No confetti for deletion
        );
      } catch (error) {
        setNotification({
          message: 'Kunde inte ta bort brevet',
          type: 'error',
          isVisible: true
        });
      }
    }
  };

  const handlePreview = (letter: any) => {
    setSelectedLetter(letter);
    setShowPreview(true);
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-cyan-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
            filter: 'blur(40px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Hero Header */}
        <motion.div
          className="mb-6 sm:mb-8 md:mb-12"
          style={{ y: headerY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2 sm:mb-3 truncate">
                  Mina Brev
                </h1>
                <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl">
                  Din AI-drivna brevsamling. Hantera, redigera och optimera dina ansökningar med stil.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto flex-shrink-0"
              >
                <Link
                  href="/dashboard/skapa-brev"
                  className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Skapa nytt brev</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </Link>
              </motion.div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <StatWidget
                title="Totalt antal brev"
                value={stats.total || 0}
                change={`${stats.change}%`}
                trend={parseInt(stats.change || '0') > 0 ? 'up' : parseInt(stats.change || '0') < 0 ? 'down' : 'neutral'}
                icon={FileText}
                color="from-blue-500 to-cyan-500"
              />
              <StatWidget
                title="Denna månaden"
                value={stats.thisMonth || 0}
                change="Denna period"
                trend="neutral"
                icon={Calendar}
                color="from-green-500 to-emerald-500"
              />
              <StatWidget
                title="Genomsnitt/månad"
                value={stats.avgPerMonth || 0}
                change="Senaste 3 mån"
                trend="neutral"
                icon={TrendingUp}
                color="from-purple-500 to-pink-500"
              />
              <StatWidget
                title="Brevutrymme"
                value={`${letters?.length || 0}/${maxSavedLetters === Infinity ? '∞' : maxSavedLetters}`}
                change={hasReachedLetterLimit ? 'Fullt' : 'Ledigt'}
                trend={hasReachedLetterLimit ? 'down' : 'up'}
                icon={Target}
                color="from-orange-500 to-red-500"
              />
            </div>

            {/* Search and controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Sök i dina brev..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                </div>

                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-lg sm:rounded-xl font-medium border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Filter</span>
                </motion.button>
              </div>

              <div className="flex items-center gap-2 justify-end sm:justify-start">
                <motion.button
                  onClick={() => setSelectedView('grid')}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all touch-manipulation ${
                    selectedView === 'grid'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setSelectedView('list')}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all touch-manipulation ${
                    selectedView === 'list'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Letters Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <BentoCard key={i} className="p-4 sm:p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-3/5" />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
                  <div className="flex-1 h-8 bg-gray-200 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                </div>
              </BentoCard>
            ))}
          </div>
        ) : filteredLetters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 md:py-20"
          >
            <motion.div
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl sm:rounded-3xl flex items-center justify-center"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              {searchTerm ? 'Inga brev hittades' : 'Inga brev ännu'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              {searchTerm
                ? 'Prova att ändra din sökning eller ta bort filter.'
                : 'Det ser lite tomt ut här. Skapa ditt första AI-genererade brev!'
              }
            </p>
            {!searchTerm && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4"
              >
                <Link
                  href="/dashboard/skapa-brev"
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 gap-2 text-sm sm:text-base touch-manipulation"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Skapa ditt första brev</span>
                  <Rocket className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {filteredLetters.map((letter, index) => (
              <motion.div
                key={letter.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                transition={{ delay: index * 0.1 }}
              >
                <LetterPreviewCard
                  letter={letter}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  isDeleting={false}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Document Preview Modal */}
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