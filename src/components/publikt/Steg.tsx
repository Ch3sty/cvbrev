/**
 * Numrerad lista: siffran i en 40 × 40 ruta med rummets ton (i CSS, så att
 * siffrorna inte blir text). Utan rubrik blir det meningsraden.
 */

import type { ReactNode } from 'react'

export interface StegRad {
  rubrik?: ReactNode
  text: ReactNode
}

export default function Steg({
  rader,
  rubrikNiva = 'h3',
  kolumner = 1,
  className = '',
}: {
  rader: readonly StegRad[]
  rubrikNiva?: 'h3' | 'h4'
  kolumner?: 1 | 2
  className?: string
}) {
  const Rubrik = rubrikNiva
  const mening = rader.every((r) => !r.rubrik)
  const klasser = ['pub-steg', kolumner === 2 ? 'pub-steg-2' : '', mening ? 'pub-steg-mening' : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <ol className={klasser}>
      {rader.map((r, i) => (
        <li key={i}>
          <div>
            {r.rubrik ? <Rubrik>{r.rubrik}</Rubrik> : null}
            <p>{r.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
