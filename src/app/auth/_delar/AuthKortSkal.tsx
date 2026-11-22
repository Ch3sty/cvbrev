/**
 * Kortet för auth-sidorna (publikt omgång 3, skissen inloggning): Glömt
 * lösenordet, Välj nytt lösenord, Bekräfta din e-post, Byte av e-postadress
 * och felsidan står i samma kort som Logga in och Skapa konto. Mörk topprad
 * utan meny, väggen på grafit, det vita kortet med klack och, om sidan har
 * en, en panel bredvid kortet.
 *
 * Ren markup utan hooks, så att både server- och klientsidor kan använda
 * den. Sida sätter indigo (data-p3-sida, som skissens bilder) och laddar grundens CSS; formen
 * står i registrering.css (rg-*), samma som Logga in.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Sida } from '@/components/publikt/v3/Sida'
import { InloggadVaxel } from '@/components/publikt/v3/Inloggad'
import '@/components/registrering/registrering.css'

export function AuthKortSkal({
  toppLank = { href: '/login', text: 'Logga in' },
  panel,
  children,
}: {
  /** Länken till höger i toppraden, med en valfri fråga före. */
  toppLank?: { href: string; text: string; fraga?: string } | null
  /** Panelen bredvid kortet (under det i telefonen). */
  panel?: ReactNode
  children: ReactNode
}) {
  return (
    <Sida farg="tran">
      <div className="rg-skal rg-auto">
        <header className="rg-topp">
          <div className="p3-bredd rg-topp-rad">
            <Link href="/" aria-label="Till startsidan" className="rg-logga">
              <i aria-hidden="true">J</i>
              {/* Ordet i ett eget element, som i menyn: annars blir "Jobbcoach" och ".ai" två flexdelar med mellanrum emellan. */}
              <b>
                Jobbcoach<span>.ai</span>
              </b>
            </Link>
            {toppLank ? (
              <InloggadVaxel
                className="p3-vaxel-topp"
                kontoKlass="rg-topp-lank"
                ut={
                  <>
                    {toppLank.fraga ? <span className="rg-topp-fraga">{toppLank.fraga}</span> : null}
                    <Link href={toppLank.href} className="rg-topp-lank">
                      {toppLank.text}
                    </Link>
                  </>
                }
              />
            ) : null}
          </div>
        </header>
        <main className="p3-vagg rg-vagg rg-auto-mitt">
          <section className="rg-konto">
            <div className={`p3-bredd rg-konto-rad ${panel ? 'rg-med-panel' : 'rg-ensam'}`}>
              <div className="rg-kort">{children}</div>
              {panel ? <div className="rg-tillbaka">{panel}</div> : null}
            </div>
          </section>
        </main>
      </div>
    </Sida>
  )
}

/** Beskedsraden högst upp i kortet: grön för klart, röd för fel, grå för väntan. */
export function AuthRad({ ton, children, role }: { ton: 'bra' | 'fel' | 'vanta'; children: ReactNode; role?: 'alert' | 'status' }) {
  return (
    <div className={`rg-rad rg-${ton}`} role={role ?? (ton === 'fel' ? 'alert' : 'status')}>
      <i aria-hidden="true">
        {ton === 'bra' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            <path d="M6.5 12.5l3.8 3.8 7.4-8.3" />
          </svg>
        ) : ton === 'fel' ? (
          '!'
        ) : (
          '…'
        )}
      </i>
      <div>{children}</div>
    </div>
  )
}

/** Brevikonen i rutan "Mejl skickat" (skissen inloggning). */
export function MejlIkon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M4 7.5l8 6 8-6" />
    </svg>
  )
}
