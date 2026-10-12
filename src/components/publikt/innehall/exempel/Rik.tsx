/**
 * Exempeldatans text: stycken på tom rad och **fetstil**. Inga emojier och
 * ingen markdown i HTML. Serverkomponent.
 */

import type { ReactNode } from 'react'

export function inline(text: string): ReactNode {
  if (!text.includes('**')) return text
  const delar: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*/g
  let sist = 0
  let m: RegExpExecArray | null
  let n = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > sist) delar.push(text.slice(sist, m.index))
    delar.push(<b key={n++}>{m[1]}</b>)
    sist = m.index + m[0].length
  }
  if (sist < text.length) delar.push(text.slice(sist))
  return delar
}

export function stycken(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function Rik({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {stycken(text).map((s, i) => (
        <p key={i} className={className}>
          {inline(s)}
        </p>
      ))}
    </>
  )
}
