/**
 * Mallgalleriet på /verktyg/cv-mallar (plan-mallar 3.2): alla mallar ur
 * katalogen som riktiga webp-miniatyrer, var och en till provsidan med
 * mallen vald. Serverkomponent, inget JavaScript; högst lika brett som
 * arket (UX:s datorlayout, punkt 12).
 */
import Link from 'next/link'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { REMSA, wordTillagg } from '@/components/cv/Dokument/texter'

interface CVMallarGalleriProps {
  mallar: readonly MallKort[]
}

export default function CVMallarGalleri({ mallar }: CVMallarGalleriProps) {
  return (
    <section id="mall-galleri" aria-label="Mallgalleri" className="scroll-mt-24">
      <p className="text-steg uppercase text-ink-3">Mallgalleri</p>
      <h2 className="mt-2 text-h2-pub text-ink-1">Alla våra mallar. På ett ställe.</h2>
      <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">
        Bläddra bland alla mallar. Du kan byta mall efter att du fyllt i ditt CV utan att förlora något av innehållet. Vill du se
        vilken mall som passar ditt yrke har vi{' '}
        <Link href="/cv-mallar" className="text-ink-1 underline decoration-kant-stark underline-offset-[3px]">
          CV-mallar per yrke
        </Link>{' '}
        med rekryterarens tips.
      </p>

      <ul className="mt-6 grid max-w-[744px] grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
        {mallar.map((m) => (
          <li key={m.id}>
            <Link href={`/cv-mallar/prova?mall=${encodeURIComponent(m.id)}`} aria-label={`Bygg CV med mallen ${m.namn}`} className="group block rounded-lg">
              <span className="relative block aspect-[210/297] overflow-hidden rounded-md border border-kant bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.bild.stor} alt={`CV-mallen ${m.namn}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top transition-opacity group-hover:opacity-90" />
                {m.word ? (
                  <span aria-hidden className="absolute bottom-1.5 right-1.5 h-5 w-5 rounded-[3px] border border-[#C9C6BF] bg-white text-center text-[11px] font-extrabold leading-[18px] text-[#1E3A8A]">
                    W
                  </span>
                ) : null}
              </span>
              <p className="mt-2 text-sm font-semibold text-ink-1">{m.namn}</p>
              <p className="text-meta text-ink-3">
                {REMSA.niva[m.niva]}
                {wordTillagg(m.niva === 'gratis', m.word)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-[22px] text-ink-2">{m.stil}</p>
              <span className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 group-hover:decoration-ink-1">
                Använd den här mallen
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
