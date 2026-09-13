'use client';

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

/** Vilken myndighet eller organisation källan kommer från. Text, inte färg. */
function getSourceType(source: Source): string {
  const url = (source.url || source.source_url || '').toLowerCase();
  const title = (source.title || source.heading || '').toLowerCase();

  if (title.includes('arbetsförmedlingen') || url.includes('arbetsformedlingen') || url.includes('af.se')) {
    return 'Arbetsförmedlingen';
  }
  if (title.includes('scb') || url.includes('scb.se')) return 'SCB';
  if (title.includes('unionen') || title.includes('facklig') || title.includes('a-kassa') ||
      url.includes('unionen') || url.includes('lo.se') || url.includes('tco.se')) {
    return 'Fackförbund';
  }
  if (title.includes('försäkringskassan') || url.includes('forsakringskassan.se')) {
    return 'Försäkringskassan';
  }
  if (title.includes('csn') || url.includes('csn.se')) return 'CSN';
  if (title.includes('skatteverket') || url.includes('skatteverket.se')) return 'Skatteverket';
  return 'Karriärexpert';
}

/** Inline-fotnot som ersätter "(Källa N)" i AI-text. Klick scrollar till källraden. */
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
      className="mx-0.5 inline-flex items-baseline rounded px-1 align-baseline text-meta font-medium text-accent-ink underline decoration-kant-stark underline-offset-2 hover:decoration-accent-ink"
      aria-label={`Källa ${n}: ${title}`}
    >
      <sup className="leading-none">{n}</sup>
    </button>
  );
}

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

  // Användarens tur: ink-fylld bubbla till höger, utan avatar.
  if (role === 'user') {
    return (
      <div className="mb-4 flex justify-end">
        <div className="flex max-w-[85%] flex-col items-end gap-2 sm:max-w-[75%]">
          {attachments && attachments.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.public_url || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex max-w-[260px] items-center gap-2 rounded-lg border border-kant bg-panel px-3 py-2 hover:bg-insunken"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-1">
                      {attachment.file_name}
                    </span>
                    <span className="block text-meta text-ink-3">
                      {formatFileSize(attachment.file_size)}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}

          {content && (
            <div className="rounded-xl bg-ink-1 px-4 py-3">
              <p className="whitespace-pre-wrap break-words text-sm leading-[22px] text-white">
                {content}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const safeSources = sources || [];

  return (
    <div className="mb-4 flex justify-start">
      <div className="w-full min-w-0 max-w-[85%] sm:max-w-[75%]">
        <section className="rounded-xl border border-kant bg-panel px-4 py-3">
          <div className="max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-3 text-sm leading-[22px] text-ink-2 last:mb-0">
                    {renderWithCitations(children, safeSources, scrollToSource)}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 ml-4 list-disc text-sm leading-[22px] text-ink-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 ml-4 list-decimal text-sm leading-[22px] text-ink-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1">
                    {renderWithCitations(children, safeSources, scrollToSource)}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-ink-1">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => (
                  <p className="mb-2 text-kort text-ink-1">{children}</p>
                ),
                h2: ({ children }) => (
                  <p className="mb-2 text-kort text-ink-1">{children}</p>
                ),
                h3: ({ children }) => (
                  <p className="mb-2 text-sm font-medium text-ink-1">{children}</p>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {isStreaming && (
            <p className="mt-2 text-meta text-ink-3" role="status">
              Skriver
            </p>
          )}

          <div className="mt-3 border-t border-kant pt-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              {copiedMessage ? 'Kopierat' : 'Kopiera svaret'}
            </button>
          </div>
        </section>

        {safeSources.length > 0 && (
          <div className="mt-2">
            <p className="mb-1.5 text-meta text-ink-3">
              {safeSources.length} {safeSources.length === 1 ? 'källa' : 'källor'}
            </p>
            <ul className="space-y-1">
              {safeSources.map((source, idx) => {
                const type = getSourceType(source);
                const title = source.title || source.heading || source.source_url || 'Dokument';
                const url = source.url || source.source_url;
                const isHighlighted = highlightedSourceIdx === idx;

                const inner = (
                  <>
                    <span className="w-4 shrink-0 text-meta tabular-nums text-ink-3">
                      {idx + 1}.
                    </span>
                    <span className="shrink-0 text-meta font-medium text-ink-2">{type}</span>
                    <span className="min-w-0 flex-1 truncate text-meta text-ink-2">{title}</span>
                    {source.published_at && (
                      <span className="hidden shrink-0 text-meta text-ink-3 sm:inline">
                        {source.published_at}
                      </span>
                    )}
                  </>
                );

                const baseClass = `flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-[border-color] duration-[120ms] ${
                  isHighlighted ? 'border-ink-1 bg-panel' : 'border-kant bg-panel'
                }`;

                return (
                  <li key={idx}>
                    {url ? (
                      <a
                        id={`${baseId}-source-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${baseClass} hover:border-kant-stark`}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div id={`${baseId}-source-${idx}`} className={baseClass}>
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
