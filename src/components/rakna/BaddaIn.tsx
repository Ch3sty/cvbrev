'use client'

import { useState } from 'react'

/**
 * "Bädda in kalkylatorn"-sektion på verktygssidorna. Genererar en
 * iframe-snutt med automatisk höjdanpassning och en källrad i värdsidans
 * egen HTML. Källraden använder varumärkesankare (jobbcoach.ai), inte
 * sökordsankare, i linje med Googles riktlinjer för widgetlänkar.
 */

export default function BaddaIn({ slug, titel }: { slug: string; titel: string }) {
  const [oppen, setOppen] = useState(false)
  const [kopierat, setKopierat] = useState(false)

  const iframeId = `jbc-${slug}`
  const snutt = [
    `<iframe src="https://www.jobbcoach.ai/embed/${slug}" id="${iframeId}" title="${titel}" style="width:100%;max-width:760px;border:0;border-radius:16px;" height="700" loading="lazy"></iframe>`,
    `<script>window.addEventListener("message",function(e){if(e.origin==="https://www.jobbcoach.ai"&&e.data&&e.data.jbcVerktyg==="${slug}"){document.getElementById("${iframeId}").height=e.data.jbcHeight}});</script>`,
    `<p style="font-size:14px;">Kalkylator från <a href="https://www.jobbcoach.ai/rakna-ut/${slug}">jobbcoach.ai</a></p>`,
  ].join('\n')

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(snutt)
      setKopierat(true)
      setTimeout(() => setKopierat(false), 2000)
    } catch {
      /* markera och kopiera manuellt ur textarean */
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
      <button
        type="button"
        onClick={() => setOppen(!oppen)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-bold text-slate-900">
          Bädda in kalkylatorn på er webbplats, gratis
        </span>
        <span className={`text-lg leading-none text-orange-600 transition-transform ${oppen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>

      {oppen && (
        <div className="mt-4">
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            Klistra in koden nedan så får era läsare kalkylatorn direkt på er
            sida, alltid uppdaterad med årets siffror utan att ni behöver göra
            något. Enda villkoret är att källraden med länken till jobbcoach.ai
            står kvar.
          </p>
          <textarea
            readOnly
            value={snutt}
            rows={6}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-lg border border-orange-200 bg-white p-3 font-mono text-xs text-slate-700 focus:border-orange-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={kopiera}
            className="mt-2 rounded-lg border border-orange-600 bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
          >
            {kopierat ? 'Kopierad ✓' : 'Kopiera inbäddningskoden'}
          </button>
        </div>
      )}
    </section>
  )
}
