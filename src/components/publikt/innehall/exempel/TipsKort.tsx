/**
 * Tipsen (spec-publikt-v2 del B 3.3, rad 4): ett kort per tips med h3.
 * Raderna som i datan börjar med ❌ och ✅ blir rutorna Före och Efter;
 * emojierna syns aldrig. Texten i övrigt står ordagrant.
 */

import type { ReactNode } from 'react'
import { inline } from './Rik'

type Del = { typ: 'p' | 'rub' | 'efterNot'; text: string } | { typ: 'fe'; fore?: string; efter?: string }

function tolka(text: string): Del[] {
  const rader = text
    .split(/\n\s*\n/)
    .flatMap((s) => s.split(/\n(?=\s*[❌✅])/u))
    .map((s) => s.trim())
    .filter(Boolean)
  const ut: Del[] = []
  let efterPar = false
  for (const r of rader) {
    const rub = r.match(/^\*\*(Exempel[^*]*)\*\*:?\s*$/)
    if (rub) {
      ut.push({ typ: 'rub', text: rub[1] })
      continue
    }
    if (/^❌/u.test(r)) {
      ut.push({ typ: 'fe', fore: r.replace(/^❌\s*/u, '') })
      efterPar = false
      continue
    }
    if (/^✅/u.test(r)) {
      const sista = ut[ut.length - 1]
      const efter = r.replace(/^✅\s*/u, '')
      if (sista && sista.typ === 'fe' && !sista.efter) sista.efter = efter
      else ut.push({ typ: 'fe', efter })
      efterPar = true
      continue
    }
    ut.push({ typ: efterPar ? 'efterNot' : 'p', text: r })
  }
  return ut
}

function Del({ d }: { d: Del }): ReactNode {
  if (d.typ === 'rub') return <p className="ib-fe-rub">{d.text}</p>
  if (d.typ === 'fe')
    return (
      <div className="ib-fe">
        {d.fore ? (
          <div className="fore">
            <small>Före</small>
            {inline(d.fore)}
          </div>
        ) : null}
        {d.efter ? (
          <div className="efter">
            <small>Efter</small>
            {inline(d.efter)}
          </div>
        ) : null}
      </div>
    )
  return <p className={d.typ === 'efterNot' ? 'ib-efter-not' : undefined}>{inline(d.text)}</p>
}

export default function TipsKort({ tips }: { tips: { titel: string; text: string }[] }) {
  return (
    <div className="ib-tips">
      {tips.map((t, i) => (
        <div className="pub-kort" key={i}>
          <h3>{t.titel}</h3>
          {tolka(t.text).map((d, j) => (
            <Del key={j} d={d} />
          ))}
        </div>
      ))}
    </div>
  )
}
