'use client'

/**
 * Mallgalleriet på /verktyg/cv-mallar: alla mallar ur registret som
 * miniatyrer, filtrerade per stil med Segment. Varje mall länkar till
 * registreringen, som förut.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Segment from '@/components/shell/Segment'
import { MallMiniatyr } from '@/components/cv/MallMiniatyrer'
import { SIMPLE_TEMPLATES, TEMPLATE_COUNT, type SimpleTemplate } from '@/lib/cv/simple-templates'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

type Filter = 'all' | SimpleTemplate['category']

const CATEGORY_LABEL: Record<SimpleTemplate['category'], string> = {
  modern: 'Modern',
  traditional: 'Traditionell',
  creative: 'Kreativ',
}

function antal(id: Filter) {
  return id === 'all' ? TEMPLATE_COUNT : SIMPLE_TEMPLATES.filter((t) => t.category === id).length
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: `Alla ${antal('all')}` },
  { value: 'modern', label: `Modern ${antal('modern')}` },
  { value: 'traditional', label: `Traditionell ${antal('traditional')}` },
  { value: 'creative', label: `Kreativ ${antal('creative')}` },
]

function egenskaper(tpl: SimpleTemplate) {
  const e: string[] = []
  if (tpl.features?.supportsPhoto) e.push('foto')
  if (tpl.features?.supportsLinkedIn) e.push('LinkedIn')
  if (tpl.features?.columns === 2) e.push('två kolumner')
  return e
}

export default function CVMallarGalleri() {
  const [filter, setFilter] = useState<Filter>('all')

  const synliga = useMemo(
    () => (filter === 'all' ? SIMPLE_TEMPLATES : SIMPLE_TEMPLATES.filter((t) => t.category === filter)),
    [filter]
  )

  return (
    <section id="mall-galleri" aria-label="Mallgalleri" className="scroll-mt-24">
      <p className="text-steg uppercase text-ink-3">Mallgalleri</p>
      <h2 className="mt-2 text-h2-pub text-ink-1">Alla våra mallar. På ett ställe.</h2>
      <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">
        Bläddra bland alla mallar och filtrera på stil. Du kan byta mall efter att du fyllt i ditt CV utan att förlora
        något av innehållet.
      </p>

      <Segment
        value={filter}
        onChange={setFilter}
        options={FILTERS}
        label="Filtrera mallar efter stil"
        className="mt-6 max-w-[560px] flex-wrap sm:flex-nowrap"
      />

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {synliga.map((tpl) => {
          const e = egenskaper(tpl)
          return (
            <li key={tpl.id}>
              <Link
                href="/register"
                aria-label={`Bygg CV med mallen ${tpl.name}`}
                className="group block rounded-lg"
              >
                <MallMiniatyr
                  mall={tpl}
                  under={`${CATEGORY_LABEL[tpl.category]} · ${
                    tpl.tier === 'premium' ? PLAN_BY_KEY.cv_week.name : 'gratis'
                  }`}
                  className="transition-opacity group-hover:opacity-90"
                />
                <p className="mt-1 line-clamp-2 text-sm leading-[22px] text-ink-2">{tpl.description}</p>
                {e.length ? <p className="mt-1 text-meta text-ink-3">Med {e.join(', ')}</p> : null}
                <span className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 group-hover:decoration-ink-1">
                  Använd den här mallen
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
