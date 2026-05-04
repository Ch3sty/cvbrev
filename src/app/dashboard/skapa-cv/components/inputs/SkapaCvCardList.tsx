'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'

interface CardItem {
  id: string
  /** Visas som kortets rubrik */
  title: string
  /** Visas som underrubrik (företag, period, etc) */
  subtitle?: string
  /** Det redigerbara innehållet — formulärfält */
  content: ReactNode
}

interface Props {
  items: CardItem[]
  emptyTitle?: string
  emptyDescription?: string
  addLabel: string
  onAdd: () => void
  onRemove: (id: string) => void
  /** Index på kort som expanderats (nytt tillagt) */
  expandedId?: string | null
  onToggleExpand?: (id: string) => void
}

/**
 * Lista av kort som kan läggas till och tas bort. Används för
 * Erfarenhet, Utbildning, Kompetenser-grupper, Språk etc.
 *
 * Varje kort kan vara expanderat (med formulärinnehåll) eller
 * kollapsat (bara rubriken).
 */
export default function SkapaCvCardList({
  items,
  emptyTitle = 'Inget tillagt än',
  emptyDescription = 'Klicka på knappen nedan för att lägga till.',
  addLabel,
  onAdd,
  onRemove,
  expandedId,
  onToggleExpand,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Lista med kort */}
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const isExpanded = expandedId === item.id
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div
                className={`rounded-2xl border bg-white transition-all ${
                  isExpanded
                    ? 'border-orange-300'
                    : 'border-slate-200 hover:border-orange-200'
                }`}
                style={
                  isExpanded
                    ? {
                        boxShadow:
                          '0 8px 24px -10px rgba(249, 115, 22, 0.25)',
                      }
                    : { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }
                }
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleExpand?.(item.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p
                      className={`text-sm font-bold truncate ${
                        item.title ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {item.title || 'Ny post'}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Ta bort"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Expanderbart innehåll */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-orange-50">
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Tom-state */}
      {items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/30 p-6 text-center">
          <p className="text-sm font-bold text-slate-900 mb-1">{emptyTitle}</p>
          <p className="text-xs text-slate-600">{emptyDescription}</p>
        </div>
      )}

      {/* Add-knapp */}
      <button
        type="button"
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 text-orange-700 font-bold text-sm hover:border-orange-300 hover:bg-orange-50/60 transition-colors min-h-[48px]"
      >
        <Plus className="w-4 h-4" strokeWidth={2.4} />
        {addLabel}
      </button>
    </div>
  )
}
