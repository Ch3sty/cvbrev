'use client'

/**
 * Jobbcoachens svar i rummets bubbla (skissen Jobbcoachen): markdown, källorna
 * som fotnoter i texten och som en källrad under, och "Kopiera svaret".
 * Logiken för fotnoterna är dagens (MessageBubble), formen är kitets.
 */

import ReactMarkdown from 'react-markdown'
import { useCallback, useId, useState, type ReactNode } from 'react'
import { IkonLank, SvarBubbla, TextLank } from '@/components/jobb3/kit'

export interface Kalla {
  title?: string
  url?: string
  heading?: string
  source_url?: string
  storage_path?: string
  published_at?: string
  topic?: string
}

/** Vilken myndighet eller organisation källan kommer från (dagens regel). */
function kallTyp(k: Kalla): string {
  const url = (k.url || k.source_url || '').toLowerCase()
  const titel = (k.title || k.heading || '').toLowerCase()
  if (titel.includes('arbetsförmedlingen') || url.includes('arbetsformedlingen') || url.includes('af.se')) return 'Arbetsförmedlingen'
  if (titel.includes('scb') || url.includes('scb.se')) return 'SCB'
  if (titel.includes('unionen') || titel.includes('facklig') || titel.includes('a-kassa') || url.includes('unionen') || url.includes('lo.se') || url.includes('tco.se')) return 'Fackförbund'
  if (titel.includes('försäkringskassan') || url.includes('forsakringskassan.se')) return 'Försäkringskassan'
  if (titel.includes('csn') || url.includes('csn.se')) return 'CSN'
  if (titel.includes('skatteverket') || url.includes('skatteverket.se')) return 'Skatteverket'
  return 'Karriärexpert'
}

function medFotnoter(children: ReactNode, kallor: Kalla[], till: (n: number) => void): ReactNode {
  const om = (nod: ReactNode, nyckel: string): ReactNode => {
    if (typeof nod === 'string') {
      const delar: ReactNode[] = []
      const re = /\(K[äa]lla\s+(\d+)\)/g
      let sist = 0
      let m: RegExpExecArray | null
      let i = 0
      while ((m = re.exec(nod)) !== null) {
        if (m.index > sist) delar.push(nod.substring(sist, m.index))
        const n = parseInt(m[1], 10)
        const k = kallor[n - 1]
        if (k) {
          const titel = k.title || k.heading || `Källa ${n}`
          delar.push(
            <button key={`${nyckel}-${i}`} type="button" onClick={() => till(n)} title={titel} aria-label={`Källa ${n}: ${titel}`} className="mx-0.5 align-baseline text-[12px] font-bold text-[var(--koppar-ink)] underline underline-offset-2">
              <sup>{n}</sup>
            </button>,
          )
        } else {
          delar.push(m[0])
        }
        sist = m.index + m[0].length
        i++
      }
      if (sist < nod.length) delar.push(nod.substring(sist))
      return delar.length > 0 ? delar : nod
    }
    if (Array.isArray(nod)) return nod.map((c, j) => om(c, `${nyckel}-${j}`))
    return nod
  }
  return om(children, 'r')
}

export default function CoachSvar({ innehall, kallor = [], strommar }: { innehall: string; kallor?: Kalla[]; strommar?: boolean }) {
  const [kopierat, setKopierat] = useState(false)
  const [markerad, setMarkerad] = useState<number | null>(null)
  const bas = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const till = useCallback(
    (n: number) => {
      const el = document.getElementById(`${bas}-kalla-${n - 1}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setMarkerad(n - 1)
      setTimeout(() => setMarkerad((c) => (c === n - 1 ? null : c)), 1600)
    },
    [bas],
  )

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(innehall)
      setKopierat(true)
      setTimeout(() => setKopierat(false), 2000)
    } catch {
      // Urklippet nekat: inget att göra.
    }
  }

  const kallrad =
    kallor.length > 0 ? (
      <div className="j3-kallor">
        <p className="j3-eyebrow">Källor</p>
        <div>
          {kallor.map((k, i) => {
            const url = k.url || k.source_url
            const titel = k.title || k.heading || k.source_url || 'Dokument'
            const text = `${kallTyp(k)}, ${titel}`
            const stil = markerad === i ? { borderColor: 'var(--j3-gron)' } : undefined
            return url ? (
              <a key={i} id={`${bas}-kalla-${i}`} className="j3-kalla" href={url} target="_blank" rel="noopener noreferrer" style={stil}>
                <IkonLank />
                {text}
              </a>
            ) : (
              <span key={i} id={`${bas}-kalla-${i}`} className="j3-kalla" style={stil}>
                {text}
              </span>
            )
          })}
        </div>
      </div>
    ) : null

  return (
    <SvarBubbla
      kallor={
        <>
          {kallrad}
          {strommar ? null : (
            <div className="mt-1">
              <TextLank liten onClick={kopiera}>
                {kopierat ? 'Kopierat' : 'Kopiera svaret'}
              </TextLank>
            </div>
          )}
        </>
      }
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p>{medFotnoter(children, kallor, till)}</p>,
          ul: ({ children }) => <ul className="my-2 ml-5 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 ml-5 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{medFotnoter(children, kallor, till)}</li>,
          strong: ({ children }) => <b>{children}</b>,
          h1: ({ children }) => <p><b>{children}</b></p>,
          h2: ({ children }) => <p><b>{children}</b></p>,
          h3: ({ children }) => <p><b>{children}</b></p>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
              {children}
            </a>
          ),
        }}
      >
        {innehall}
      </ReactMarkdown>
      {strommar ? (
        <p className="j3-fin" role="status">
          Skriver
        </p>
      ) : null}
    </SvarBubbla>
  )
}
