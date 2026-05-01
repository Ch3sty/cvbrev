'use client';

import { motion } from 'framer-motion';
import {
  Briefcase, User, ArrowUpRight, FileText, Download,
  Building2, TrendingUp, Users, Shield, CheckCircle,
  Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { MessageAttachment } from '@/types/jobbcoachen';
import { useState, useId, useCallback, ReactNode } from 'react';

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

/** Identifierar källtyp baserat på titel/URL — påverkar färg och ikon. */
function getSourceMeta(source: Source) {
  const url = (source.url || source.source_url || '').toLowerCase();
  const title = (source.title || source.heading || '').toLowerCase();

  if (title.includes('arbetsförmedlingen') || url.includes('arbetsformedlingen') || url.includes('af.se')) {
    return { type: 'Arbetsförmedlingen', icon: Building2, dotColor: 'bg-blue-500', textColor: 'text-blue-700' };
  }
  if (title.includes('scb') || url.includes('scb.se')) {
    return { type: 'SCB', icon: TrendingUp, dotColor: 'bg-emerald-500', textColor: 'text-emerald-700' };
  }
  if (title.includes('unionen') || title.includes('facklig') || title.includes('a-kassa') ||
      url.includes('unionen') || url.includes('lo.se') || url.includes('tco.se')) {
    return { type: 'Fackförbund', icon: Users, dotColor: 'bg-purple-500', textColor: 'text-purple-700' };
  }
  if (title.includes('försäkringskassan') || url.includes('forsakringskassan.se')) {
    return { type: 'Försäkringskassan', icon: Shield, dotColor: 'bg-orange-500', textColor: 'text-orange-700' };
  }
  if (title.includes('csn') || url.includes('csn.se')) {
    return { type: 'CSN', icon: Building2, dotColor: 'bg-cyan-500', textColor: 'text-cyan-700' };
  }
  if (title.includes('skatteverket') || url.includes('skatteverket.se')) {
    return { type: 'Skatteverket', icon: Building2, dotColor: 'bg-slate-500', textColor: 'text-slate-700' };
  }
  return { type: 'Karriärexpert', icon: Briefcase, dotColor: 'bg-indigo-500', textColor: 'text-indigo-700' };
}

/** Inline-fotnot som ersätter "(Källa N)" i AI-text. Klick scrollar och highlightar källkortet. */
function CitationBadge({
  n,
  source,
  onClick,
}: {
  n: number;
  source?: Source;
  onClick: () => void;
}) {
  const title = source?.title || source?.heading || `Källa ${n}`;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-baseline align-baseline mx-0.5 px-1.5 rounded text-[11px] font-bold text-orange-700 bg-orange-100/80 hover:bg-orange-200 hover:text-orange-900 transition-colors leading-tight"
      aria-label={`Källa ${n}: ${title}`}
    >
      <sup className="leading-none">
        {n}
      </sup>
    </button>
  );
}

/**
 * Tar text-noder från ReactMarkdown och ersätter "(Källa N)" med klickbara
 * fotnoter. Måste hantera blandade children (text + inline-element).
 */
function renderWithCitations(
  children: ReactNode,
  sources: Source[],
  scrollToSource: (n: number) => void
): ReactNode {
  const transform = (node: ReactNode, keyPrefix: string): ReactNode => {
    if (typeof node === 'string') {
      const parts: ReactNode[] = [];
      const regex = /\(K[äa]lla\s+(\d+)\)/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let i = 0;
      while ((match = regex.exec(node)) !== null) {
        if (match.index > lastIndex) {
          parts.push(node.substring(lastIndex, match.index));
        }
        const n = parseInt(match[1], 10);
        const source = sources[n - 1];
        // Bara rendera fotnot om kallan faktiskt finns - annars bevara
        // ursprungstexten sa AI:n inte verkar ha hittat pa en kalla.
        if (source) {
          parts.push(
            <CitationBadge
              key={`${keyPrefix}-cite-${i}`}
              n={n}
              source={source}
              onClick={() => scrollToSource(n)}
            />
          );
        } else {
          parts.push(match[0]);
        }
        lastIndex = match.index + match[0].length;
        i++;
      }
      if (lastIndex < node.length) {
        parts.push(node.substring(lastIndex));
      }
      return parts.length > 0 ? parts : node;
    }
    if (Array.isArray(node)) {
      return node.map((child, idx) => transform(child, `${keyPrefix}-${idx}`));
    }
    return node;
  };
  return transform(children, 'r');
}

export default function MessageBubble({
  role,
  content,
  sources,
  attachments,
  isStreaming = false,
}: MessageBubbleProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [highlightedSourceIdx, setHighlightedSourceIdx] = useState<number | null>(null);
  const rawId = useId();
  const baseId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  const scrollToSource = useCallback((n: number) => {
    const idx = n - 1;
    if (!sources || idx < 0 || idx >= sources.length) return;
    const el = document.getElementById(`${baseId}-source-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedSourceIdx(idx);
      setTimeout(() => setHighlightedSourceIdx((cur) => (cur === idx ? null : cur)), 1600);
    }
  }, [baseId, sources]);

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

  const safeSources = sources || [];

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
          {/* Message bubble */}
          <div className="relative group">
            <div
              className="relative bg-white border border-orange-200/50 px-4 py-3 rounded-3xl rounded-bl-md transition-shadow"
              style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}
            >
              <div className="prose prose-sm sm:prose-base max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 text-slate-800">
                        {renderWithCitations(children, safeSources, scrollToSource)}
                      </p>
                    ),
                    ul: ({ children }) => <ul className="mb-3 ml-4 list-disc text-slate-800">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal text-slate-800">{children}</ol>,
                    li: ({ children }) => (
                      <li className="mb-1">
                        {renderWithCitations(children, safeSources, scrollToSource)}
                      </li>
                    ),
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

          {/* Kompakta källrader */}
          {safeSources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2 ml-1"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3 h-3" strokeWidth={2.5} />
                {safeSources.length} {safeSources.length === 1 ? 'källa' : 'källor'}
              </div>
              <div className="space-y-1">
                {safeSources.map((source, idx) => {
                  const meta = getSourceMeta(source);
                  const Icon = meta.icon;
                  const title = source.title || source.heading || source.source_url || 'Dokument';
                  const url = source.url || source.source_url;
                  const isHighlighted = highlightedSourceIdx === idx;

                  const inner = (
                    <>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <Icon className={`w-3 h-3 flex-shrink-0 ${meta.textColor}`} strokeWidth={2.5} />
                      <span className={`font-semibold flex-shrink-0 ${meta.textColor}`}>{meta.type}</span>
                      <span className="text-slate-300 flex-shrink-0">·</span>
                      <span className="text-slate-700 truncate flex-1 min-w-0">{title}</span>
                      {source.published_at && (
                        <span className="text-slate-400 hidden sm:inline flex-shrink-0">{source.published_at}</span>
                      )}
                      {url && (
                        <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-orange-600 flex-shrink-0" strokeWidth={2.5} />
                      )}
                    </>
                  );

                  const baseClass = `group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    isHighlighted
                      ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-slate-200 bg-white'
                  }`;

                  if (url) {
                    return (
                      <a
                        key={idx}
                        id={`${baseId}-source-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${baseClass} hover:border-orange-300 hover:bg-orange-50/40`}
                      >
                        {inner}
                      </a>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      id={`${baseId}-source-${idx}`}
                      className={baseClass}
                    >
                      {inner}
                    </div>
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
