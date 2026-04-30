'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, FileText, Sparkles, Plus, Minus, ArrowDown } from 'lucide-react';

interface CVComparisonViewerProps {
  originalCV: string;
  improvedCV: string;
}

interface BlockDiff {
  type: 'unchanged' | 'changed' | 'added' | 'removed';
  originalBlock?: string | null;
  improvedBlock?: string | null;
}

function generateBlockDiff(original: string, improved: string): BlockDiff[] {
  const originalBlocks = original.split(/\n\n+/).filter((b) => b.trim());
  const improvedBlocks = improved.split(/\n\n+/).filter((b) => b.trim());

  const blocks: BlockDiff[] = [];
  const maxLength = Math.max(originalBlocks.length, improvedBlocks.length);

  for (let i = 0; i < maxLength; i++) {
    const origBlock = originalBlocks[i] || null;
    const impBlock = improvedBlocks[i] || null;

    if (!origBlock && impBlock) {
      blocks.push({ type: 'added', improvedBlock: impBlock });
    } else if (origBlock && !impBlock) {
      blocks.push({ type: 'removed', originalBlock: origBlock });
    } else if (origBlock === impBlock) {
      blocks.push({
        type: 'unchanged',
        originalBlock: origBlock,
        improvedBlock: impBlock,
      });
    } else {
      blocks.push({
        type: 'changed',
        originalBlock: origBlock,
        improvedBlock: impBlock,
      });
    }
  }

  return blocks;
}

export default function CVComparisonViewer({
  originalCV,
  improvedCV,
}: CVComparisonViewerProps) {
  const [highlightChanges, setHighlightChanges] = useState(true);
  const [mobileView, setMobileView] = useState<'original' | 'improved'>('improved');

  const blockDiff = highlightChanges ? generateBlockDiff(originalCV, improvedCV) : null;

  // Räkna ändringar för stat-bar
  const stats = blockDiff
    ? {
        changed: blockDiff.filter((b) => b.type === 'changed').length,
        added: blockDiff.filter((b) => b.type === 'added').length,
        removed: blockDiff.filter((b) => b.type === 'removed').length,
        unchanged: blockDiff.filter((b) => b.type === 'unchanged').length,
      }
    : null;

  return (
    <div className="space-y-4 p-4 sm:p-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {stats && (stats.changed > 0 || stats.added > 0) && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Sparkles className="w-3 h-3" strokeWidth={2.5} />
              {stats.changed + stats.added} ändringar
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setHighlightChanges(!highlightChanges)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors min-h-[36px]"
          style={
            highlightChanges
              ? {
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  border: 'none',
                  color: 'white',
                  boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.35)',
                }
              : {
                  background: 'white',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  color: '#9A3412',
                }
          }
        >
          {highlightChanges ? (
            <>
              <Eye className="w-3.5 h-3.5" strokeWidth={2.25} />
              Markera ändringar
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" strokeWidth={2.25} />
              Dölj markeringar
            </>
          )}
        </button>
      </div>

      {/* Mobile: Tab Navigation */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-orange-50/60 border border-orange-200/60">
          <button
            type="button"
            onClick={() => setMobileView('original')}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px]"
            style={
              mobileView === 'original'
                ? {
                    background: 'white',
                    color: '#0F172A',
                    boxShadow: '0 2px 6px -2px rgba(15, 23, 42, 0.1)',
                  }
                : { color: '#94A3B8' }
            }
          >
            Nuvarande
          </button>
          <button
            type="button"
            onClick={() => setMobileView('improved')}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px]"
            style={
              mobileView === 'improved'
                ? {
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    color: 'white',
                    boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.35)',
                  }
                : { color: '#94A3B8' }
            }
          >
            Förbättrad
          </button>
        </div>
      </div>

      {/* Mobile: Single view */}
      <div className="lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mobileView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {mobileView === 'original' ? (
              <CVPanel
                title="Nuvarande CV"
                accent="slate"
                content={
                  <PlainCVText text={originalCV} />
                }
              />
            ) : (
              <CVPanel
                title="Förbättrat CV"
                accent="orange"
                badge={stats ? `${stats.changed + stats.added} ändringar` : undefined}
                content={
                  highlightChanges && blockDiff ? (
                    <DiffView blocks={blockDiff} />
                  ) : (
                    <PlainCVText text={improvedCV} />
                  )
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop: Side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-4">
        <CVPanel
          title="Nuvarande CV"
          accent="slate"
          content={<PlainCVText text={originalCV} />}
        />
        <CVPanel
          title="Förbättrat CV"
          accent="orange"
          badge={stats ? `${stats.changed + stats.added} ändringar` : undefined}
          content={
            highlightChanges && blockDiff ? (
              <DiffView blocks={blockDiff} />
            ) : (
              <PlainCVText text={improvedCV} />
            )
          }
        />
      </div>

      {/* Legend */}
      {highlightChanges && (
        <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600 px-3 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 flex-wrap">
          <LegendItem
            color="emerald"
            label="Förbättrat / tillagt"
          />
          <LegendItem
            color="rose"
            label="Original / borttaget"
          />
          <LegendItem color="slate" label="Oförändrat" />
        </div>
      )}
    </div>
  );
}

/* ----------- Subkomponenter ----------- */

function CVPanel({
  title,
  accent,
  badge,
  content,
}: {
  title: string;
  accent: 'slate' | 'orange';
  badge?: string;
  content: React.ReactNode;
}) {
  const isOrange = accent === 'orange';
  return (
    <div
      className="rounded-2xl bg-white overflow-hidden"
      style={{
        border: isOrange
          ? '1px solid rgba(249, 115, 22, 0.3)'
          : '1px solid #E2E8F0',
        boxShadow: isOrange
          ? '0 8px 24px -12px rgba(249, 115, 22, 0.18)'
          : '0 2px 8px -4px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Topp-band */}
      <div
        className="h-[3px] w-full"
        style={{
          background: isOrange
            ? 'linear-gradient(90deg, #F97316, #DC2626, #BE185D)'
            : '#CBD5E1',
        }}
      />
      <div
        className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-b"
        style={{
          background: isOrange ? 'rgba(255, 247, 237, 0.6)' : '#F8FAFC',
          borderColor: isOrange ? 'rgba(249, 115, 22, 0.15)' : '#E2E8F0',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{
              background: isOrange
                ? 'linear-gradient(135deg, #F97316, #DC2626)'
                : 'linear-gradient(135deg, #94A3B8, #64748B)',
            }}
          >
            <FileText className="w-4 h-4" strokeWidth={2.25} />
          </div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
            {title}
          </h4>
        </div>
        {badge && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 sm:px-5 py-4 max-h-[600px] overflow-auto">
        {content}
      </div>
    </div>
  );
}

function PlainCVText({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700">
      {text.split(/\n\n+/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function DiffView({ blocks }: { blocks: BlockDiff[] }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === 'unchanged') {
          return (
            <p
              key={index}
              className="whitespace-pre-wrap text-slate-700"
            >
              {block.originalBlock}
            </p>
          );
        }

        if (block.type === 'changed') {
          return (
            <div key={index} className="space-y-2">
              <DiffBlock
                kind="removed"
                label="Original"
                text={block.originalBlock || ''}
              />
              <DiffArrow />
              <DiffBlock
                kind="added"
                label="Förbättrad"
                text={block.improvedBlock || ''}
              />
            </div>
          );
        }

        if (block.type === 'added') {
          return (
            <DiffBlock
              key={index}
              kind="added"
              label="Ny text"
              text={block.improvedBlock || ''}
            />
          );
        }

        if (block.type === 'removed') {
          return (
            <DiffBlock
              key={index}
              kind="removed"
              label="Borttagen"
              text={block.originalBlock || ''}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

function DiffBlock({
  kind,
  label,
  text,
}: {
  kind: 'added' | 'removed';
  label: string;
  text: string;
}) {
  const isAdded = kind === 'added';
  return (
    <div
      className="rounded-xl px-3.5 py-3 border"
      style={
        isAdded
          ? {
              background:
                'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              borderLeftWidth: '3px',
            }
          : {
              background: 'rgba(254, 226, 226, 0.4)',
              borderColor: 'rgba(244, 63, 94, 0.3)',
              borderLeftWidth: '3px',
            }
      }
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {isAdded ? (
          <Plus className="w-3 h-3 text-emerald-700" strokeWidth={3} />
        ) : (
          <Minus className="w-3 h-3 text-rose-700" strokeWidth={3} />
        )}
        <span
          className="text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: isAdded ? '#047857' : '#9F1239' }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={
          isAdded
            ? { color: '#0F172A', fontWeight: 500 }
            : {
                color: '#9F1239',
                textDecoration: 'line-through',
                opacity: 0.75,
              }
        }
      >
        {text}
      </p>
    </div>
  );
}

function DiffArrow() {
  return (
    <div className="flex justify-center">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #10B981, #059669)',
          boxShadow: '0 4px 8px -2px rgba(16, 185, 129, 0.4)',
        }}
      >
        <ArrowDown className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: 'emerald' | 'rose' | 'slate';
  label: string;
}) {
  const styles = {
    emerald: {
      background:
        'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
    },
    rose: {
      background: 'rgba(254, 226, 226, 0.6)',
      border: '1px solid rgba(244, 63, 94, 0.4)',
    },
    slate: {
      background: '#F1F5F9',
      border: '1px solid #CBD5E1',
    },
  }[color];

  return (
    <div className="flex items-center gap-1.5">
      <span className="block w-3 h-3 rounded" style={styles} />
      <span>{label}</span>
    </div>
  );
}
