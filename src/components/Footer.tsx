/**
 * Publika footern (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 5).
 *
 * På mark med en hårlinje, fyra kolumner: varumärket med kontaktvägarna,
 * sedan samma grupper som menyn (Skriv och förbättra, Hitta och träna) och
 * Läs. Ingen glöd, inga prickar, ingen våg och inga guidekort: de åtta
 * populära guiderna står nu som relaterade artiklar i artikelramen, där de
 * gör nytta. Sociala länkar som text i första kolumnen (ägarens beslut:
 * behåll dem som finns).
 *
 * Inga hooks: renderas som den är, även inuti klientlayouten.
 */

import Link from 'next/link'
import { FORETAG, GRUPPER, LAS, type NavLank } from '@/components/landing/nav-data'

const SOCIALA = [
  { label: 'Facebook', href: 'https://www.facebook.com/jobbcoachai' },
  { label: 'Instagram', href: 'https://www.instagram.com/jobbcoach.ai/' },
  { label: 'info@jobbcoach.ai', href: 'mailto:info@jobbcoach.ai' },
] as const

const [SKRIV, HITTA, TRANA] = GRUPPER

const LANK =
  'inline-flex min-h-11 items-center text-sm text-ink-2 transition-colors duration-[120ms] hover:text-ink-1 lg:min-h-0'

function Kolumn({ rubrik, lankar }: { rubrik: string; lankar: readonly NavLank[] }) {
  return (
    <div>
      <p className="text-steg uppercase text-ink-3">{rubrik}</p>
      <ul className="mt-2 lg:mt-4 lg:space-y-3">
        {lankar.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={LANK}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const ar = new Date().getFullYear()
  return (
    <footer
      data-site-chrome="footer"
      className="border-t border-kant bg-mark"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Sidfot
      </h2>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:py-16">
          <div>
            <p className="font-display text-[22px] font-bold leading-7 tracking-[-0.025em] text-ink-1">
              Jobbcoach.ai
            </p>
            <p className="mt-3 max-w-[36ch] text-sm leading-[22px] text-ink-2">
              CV, personligt brev, tester och matchning för svensk arbetsmarknad. Byggt i Sverige,
              med svenska källor.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {FORETAG.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {SOCIALA.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    {...(s.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className={LANK}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Kolumn rubrik={SKRIV.rubrik} lankar={SKRIV.lankar} />
          <Kolumn rubrik="Hitta och träna" lankar={[...HITTA.lankar, ...TRANA.lankar]} />
          <Kolumn rubrik={LAS.rubrik} lankar={LAS.lankar} />
        </div>

        <div className="flex flex-col gap-3 border-t border-kant py-6 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© {ar} Jobbcoach.ai</span>
            <span aria-hidden="true">·</span>
            <Link href="/integritetspolicy" className="hover:text-ink-1">
              Integritetspolicy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/anvandarvillkor" className="hover:text-ink-1">
              Användarvillkor
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/integritetspolicy#cookies" className="hover:text-ink-1">
              Cookies
            </Link>
          </p>
          <p>Byggt i Sverige</p>
        </div>
      </div>
    </footer>
  )
}
