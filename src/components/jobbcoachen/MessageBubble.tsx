'use client';

import { motion } from 'framer-motion';
import { Briefcase, User, ArrowUpRight, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { MessageAttachment } from '@/types/jobbcoachen';

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
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
                    href={attachment.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors group max-w-[250px]"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs opacity-90">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                    <Download className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}

            {/* Message content */}
            {content && (
              <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-md">
                <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                  {content}
                </p>
              </div>
            )}
          </div>
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-slate-600" />
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
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
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
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
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
            {isStreaming && (
              <div className="flex items-center gap-1 mt-2">
                <motion.div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            )}
          </div>

          {/* Improved Sources Display */}
          {sources && sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 ml-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-xs font-semibold text-slate-700">
                  Källor ({sources.length})
                </p>
              </div>
              <div className="space-y-1.5">
                {sources.map((source, idx) => {
                  const hasExtractedLink = source.title && source.url;

                  return (
                    <a
                      key={idx}
                      href={source.url || source.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <span className="text-xs font-semibold text-blue-600 flex-shrink-0 mt-0.5">
                        [{idx + 1}]
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 group-hover:text-blue-600 truncate">
                          {hasExtractedLink ? source.title : (source.heading || source.source_url || 'Dokument')}
                        </p>
                        {source.published_at && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {source.published_at}
                          </p>
                        )}
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5" />
                    </a>
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
