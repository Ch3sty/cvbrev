'use client';

import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  isStreaming?: boolean;
}

export default function MessageBubble({
  role,
  content,
  sources,
  isStreaming = false,
}: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end mb-4"
      >
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-lg">
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-pink-700" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%]">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg">
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
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            )}
          </div>

          {/* Sources */}
          {sources && sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 ml-2"
            >
              <p className="text-xs text-slate-600 font-medium mb-1">Källor:</p>
              <div className="space-y-1">
                {sources.map((source, idx) => {
                  // Check if source has title and url (extracted from markdown links)
                  const hasExtractedLink = source.title && source.url;

                  return (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 flex items-start gap-1"
                    >
                      <span className="text-blue-600 font-medium">[{idx + 1}]</span>
                      {hasExtractedLink ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex-1"
                        >
                          {source.title}
                        </a>
                      ) : source.source_url ? (
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex-1"
                        >
                          {source.heading || source.source_url}
                        </a>
                      ) : (
                        <span className="flex-1">
                          {source.heading || 'Dokument'}
                          {source.published_at && (
                            <span className="text-slate-500"> ({source.published_at})</span>
                          )}
                        </span>
                      )}
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
