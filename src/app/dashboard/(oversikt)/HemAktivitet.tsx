/**
 * "Det här har du gjort": aktiviteten som meningar grupperade per dag
 * (regel 6 i docs/design/analys-visuell-linje-2026-09-22.html). Aldrig
 * loggrader.
 *
 * Serverkomponent som strömmas in i en Suspense-gräns efter resten av
 * hemskärmen, så den varken kostar en klientrundtur efter mount eller
 * fördröjer första målningen.
 */

import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getAktivitet } from '@/lib/dashboard/aktivitet'

export default async function HemAktivitet() {
  let dagar: Awaited<ReturnType<typeof getAktivitet>> = []
  // cookies() utanför try: Next signalerar dynamisk rendering med ett kast
  // som inte får fångas här.
  const kakor = await cookies()
  try {
    const supabase = createServerClient({ cookies: kakor })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    dagar = await getAktivitet(supabase, user.id)
  } catch (fel) {
    console.error('Hemskärmens aktivitet kunde inte läsas:', fel)
    return null
  }
  if (dagar.length === 0) return null

  return (
    <section aria-label="Det här har du gjort">
      <h2 className="text-sm font-medium text-ink-3">Det här har du gjort</h2>
      <div className="mt-2 space-y-4">
        {dagar.map((d) => (
          <div key={d.datum}>
            <p className="text-steg uppercase text-ink-3">{d.rubrik}</p>
            <ul className="mt-1 divide-y divide-kant border-y border-kant">
              {d.meningar.map((m) => (
                <li key={m.text} className="flex items-start gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink-1">{m.text}</span>
                    {m.under ? <span className="block text-meta text-ink-3">{m.under}</span> : null}
                  </span>
                  {m.lank ? (
                    <Link
                      href={m.lank.href}
                      className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                    >
                      {m.lank.text}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
