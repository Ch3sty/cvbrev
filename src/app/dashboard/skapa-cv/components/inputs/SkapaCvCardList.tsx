'use client'

import { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface CardItem {
  id: string
  /** Visas som kortets rubrik */
  title: string
  /** Visas som underrubrik (företag, period, etc) */
  subtitle?: string
  /** Det redigerbara innehållet, formulärfält */
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
 * Lista av kort som kan läggas till och tas bort. Används för Erfarenhet,
 * Utbildning, Kompetenser-grupper, Språk etc.
 *
 * Varje kort är en panel. Det expanderade kortet får stark kant, precis som
 * ett framhävt kort i sidmallen. Ingen rörelse vid tillägg och borttagning:
 * CSS-transition på kanten räcker.
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
      {items.map((item) => {
        const isExpanded = expandedId === item.id
        return (
          <div
            key={item.id}
            className={`rounded-xl border bg-panel transition-[border-color] duration-[120ms] ${
              isExpanded ? 'border-kant-stark' : 'border-kant hover:border-kant-stark'
            }`}
          >
            <div className="flex items-center gap-2 py-1 pl-4 pr-1">
              <button
                type="button"
                onClick={() => onToggleExpand?.(item.id)}
                aria-expanded={isExpanded}
                className="min-h-11 min-w-0 flex-1 py-1 text-left"
              >
                <p
                  className={`truncate text-sm font-semibold ${
                    item.title ? 'text-ink-1' : 'text-ink-3'
                  }`}
                >
                  {item.title || 'Ny post'}
                </p>
                {item.subtitle && (
                  <p className="mt-0.5 truncate text-meta text-ink-3">{item.subtitle}</p>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-fel-mjuk hover:text-fel"
                aria-label={`Ta bort ${item.title || 'posten'}`}
              >
                <Trash2 className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            {isExpanded && (
              <div className="border-t border-kant px-4 pb-4 pt-1">{item.content}</div>
            )}
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="rounded-lg bg-insunken px-4 py-5 text-center shadow-insunken">
          <p className="text-sm font-medium text-ink-1">{emptyTitle}</p>
          <p className="mt-0.5 text-meta text-ink-3">{emptyDescription}</p>
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
      >
        <Plus className="h-5 w-5" strokeWidth={1.75} />
        {addLabel}
      </button>
    </div>
  )
}
