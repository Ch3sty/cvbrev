'use client';

import { motion } from 'framer-motion';
import {
  Briefcase, User, ArrowUpRight, FileText, Download,
  Building2, TrendingUp, Users, Shield, CheckCircle,
  Clock, Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { MessageAttachment } from '@/types/jobbcoachen';
import { useState } from 'react';

interface Source {
  // Extracted from markdown links
  title?: string;
  url?: string;
  // Original document metadata (fallback)
  heading?: string;
  source_url?: string;
  storage_path?: string;
  published_at?: string;
  topic?: string;
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  attachments?: MessageAttachment[];
  isStreaming?: boolean;
}

export default function MessageBubble({
  role,
  content,
  sources,
  attachments,
  isStreaming = false,
}: MessageBubbleProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Identify source type based on title or URL
  const getSourceInfo = (source: Source) => {
    const url = (source.url || source.source_url || '').toLowerCase();
    const title = (source.title || source.heading || '').toLowerCase();

    // Check title first (since many sources don't have URLs)
    if (title.includes('arbetsförmedlingen') || url.includes('arbetsformedlingen') || url.includes('af.se')) {
      return {
        type: 'Arbetsförmedlingen',
        icon: Building2,
        color: 'from-blue-600 to-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        badge: 'Officiell källa',
        badgeBg: 'bg-white',
        badgeText: 'text-blue-700'
      };
    }
    if (title.includes('scb') || url.includes('scb.se')) {
      return {
        type: 'SCB',
        icon: TrendingUp,
        color: 'from-emerald-600 to-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-900',
        badge: 'Statistik',
        badgeBg: 'bg-white',
        badgeText: 'text-emerald-700'
      };
    }
    if (title.includes('unionen') || title.includes('facklig') || title.includes('a-kassa') ||
        url.includes('unionen') || url.includes('lo.se') || url.includes('tco.se')) {
      return {
        type: 'Fackförbund',
        icon: Users,
        color: 'from-purple-600 to-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-900',
        badge: 'Facklig källa',
        badgeBg: 'bg-white',
        badgeText: 'text-purple-700'
      };
    }
    if (title.includes('försäkringskassan') || url.includes('forsakringskassan.se')) {
      return {
        type: 'Försäkringskassan',
        icon: Shield,
        color: 'from-orange-600 to-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-900',
        badge: 'Myndighet',
        badgeBg: 'bg-white',
        badgeText: 'text-orange-700'
      };
    }
    if (title.includes('csn') || url.includes('csn.se')) {
      return {
        type: 'CSN',
        icon: Building2,
        color: 'from-cyan-600 to-cyan-700',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        textColor: 'text-cyan-900',
        badge: 'Studiestöd',
        badgeBg: 'bg-white',
        badgeText: 'text-cyan-700'
      };
    }
    if (title.includes('skatteverket') || url.includes('skatteverket.se')) {
      return {
        type: 'Skatteverket',
        icon: Building2,
        color: 'from-slate-600 to-slate-700',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        textColor: 'text-slate-900',
        badge: 'Myndighet',
        badgeBg: 'bg-white',
        badgeText: 'text-slate-700'
      };
    }

    // Default for other sources
    return {
      type: 'Karriärexpert',
      icon: Briefcase,
      color: 'from-indigo-600 to-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-900',
      badge: 'Expert',
      badgeBg: 'bg-white',
      badgeText: 'text-indigo-700'
    };
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end mb-4"
      >
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <div className="flex flex-col items-end gap-2">
            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment.public_url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 transition-colors group max-w-[260px]"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}>
                      <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-900">
                        {attachment.file_name}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                    <Download className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-orange-600" />
                  </a>
                ))}
              </div>
            )}

            {/* Message content */}
            {content && (
              <div
                className="text-white px-4 py-3 rounded-3xl rounded-br-md"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.35)',
                }}
              >
                <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                  {content}
                </p>
              </div>
            )}
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
          >
            <User className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Trust badge above message */}
          {sources && sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold mb-2 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700"
            >
              <Shield className="w-3 h-3" strokeWidth={2.75} />
              <span>Baserat på {sources.length} verifierade {sources.length === 1 ? 'källa' : 'källor'}</span>
            </motion.div>
          )}

          {/* Message bubble */}
          <div className="relative group">
            <div
              className="relative bg-white border border-orange-200/50 px-4 py-3 rounded-3xl rounded-bl-md transition-shadow"
              style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
            >
              <div className="prose prose-sm sm:prose-base max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-800">{children}</p>,
                    ul: ({ children }) => <ul className="mb-3 ml-4 list-disc text-slate-800">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal text-slate-800">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-slate-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-slate-900">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-slate-900">{children}</h3>,
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-700 hover:text-orange-800 hover:underline inline-flex items-center gap-0.5 font-medium"
                      >
                        {children}
                        <ArrowUpRight className="w-3 h-3 inline" />
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>

              {/* Streaming indicator */}
              {isStreaming && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)' }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-orange-100/70">
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors group/btn relative"
                  title="Kopiera svar"
                >
                  {copiedMessage ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-orange-600" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors group/btn"
                  title="Bra svar"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-emerald-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors group/btn"
                  title="Dåligt svar"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-red-600" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Premium Sources Display */}
          {sources && sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 ml-2"
            >
              {/* Sources header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-lg shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                  >
                    <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Verifierade källor</p>
                    <p className="text-xs text-slate-600">{sources.length} {sources.length === 1 ? 'källa granskad' : 'källor granskade'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Pålitlig</span>
                </div>
              </div>

              {/* Premium source cards */}
              <div className="space-y-2">
                {sources.map((source, idx) => {
                  const sourceInfo = getSourceInfo(source);
                  const SourceIcon = sourceInfo.icon;
                  const hasExtractedLink = source.title && source.url;
                  const title = hasExtractedLink ? source.title : (source.heading || source.source_url || 'Dokument');

                  return (
                    <motion.a
                      key={idx}
                      href={source.url || source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{
                        scale: 1.03,
                        y: -4,
                      }}
                      style={{ willChange: 'transform' }}
                      className={`group relative overflow-hidden rounded-xl border-2 ${sourceInfo.borderColor} ${sourceInfo.bgColor} p-3 transition-all hover:shadow-xl block`}
                    >
                      {/* Premium gradient header */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sourceInfo.color}`} />

                      {/* Source organization badge (small, at top) */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-md bg-gradient-to-br ${sourceInfo.color} text-white shadow-sm`}>
                            <SourceIcon className="w-3 h-3" />
                          </div>
                          <span className={`text-xs font-semibold ${sourceInfo.textColor}`}>
                            {sourceInfo.type}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 ${sourceInfo.badgeBg} rounded-full font-medium ${sourceInfo.badgeText}`}>
                            {sourceInfo.badge}
                          </span>
                        </div>
                        <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
                      </div>

                      {/* Actual source title (prominent) */}
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-orange-700 transition-colors line-clamp-2 mb-1">
                        {title}
                      </p>

                      {/* Published date */}
                      {source.published_at && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                          <Clock className="w-3 h-3" />
                          <span>{source.published_at}</span>
                        </div>
                      )}

                      {/* Hover arrow indicator */}
                      <ArrowUpRight className="absolute bottom-3 right-3 w-4 h-4 text-slate-400 group-hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
