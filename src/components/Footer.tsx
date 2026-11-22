/**
 * Publika foten i publikt omgång 3 (skissen docs/design/publikt-omgang3/delar/fot.html,
 * byggbriefens beslut 2).
 *
 * Sidans mörkaste ton (--vagg-3), aldrig beige och aldrig svart. Varumärket
 * med företagslänkarna och de sociala länkarna, sedan de fyra delarna i
 * samma ordning som menyn: Rekryteringstester, CV, Personliga brev,
 * Jobbsöket. Ingen länk från dagens fot försvinner (nav-data.ts, FOT_DELAR
 * och FORETAG). Vanliga länkar i serverns HTML, inget som öppnas med skript.
 *
 * Inga hooks: renderas som den är, även inuti klientlayouten. Utanför de
 * publika sidorna står den i grafit (ram.css).
 */

import Link from 'next/link'
import { FORETAG, FOT_DELAR } from '@/components/landing/nav-data'
import '@/components/publikt/v3/ram.css'

const SOCIALA = [
  { label: 'Facebook', href: 'https://www.facebook.com/jobbcoachai' },
  { label: 'Instagram', href: 'https://www.instagram.com/jobbcoach.ai/' },
  { label: 'info@jobbcoach.ai', href: 'mailto:info@jobbcoach.ai' },
] as const

export default function Footer() {
  const ar = new Date().getFullYear()
  return (
    <footer data-site-chrome="footer" className="p3-fot" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Sidfot
      </h2>

      <div className="p3-nav-bredd">
        <div className="p3-fot-rad">
          <div>
            <Link className="p3-logga" href="/" aria-label="Jobbcoach.ai, till startsidan">
              <i aria-hidden="true">J</i>
              <b>
                Jobbcoach<span>.ai</span>
              </b>
            </Link>
            <p className="p3-fot-om">
              CV, personligt brev, tester och matchning för svensk arbetsmarknad. Byggt i Sverige, med svenska källor.
            </p>
            <ul className="p3-fot-inline">
              {FORETAG.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
            <ul className="p3-fot-inline">
              {SOCIALA.map((s) => (
                <li key={s.href}>
                  <a href={s.href} {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOT_DELAR.map((d) => (
            <div key={d.farg} className="p3-fot-kol">
              <p className="p3-fot-rubrik">{d.rubrik}</p>
              <ul>
                {d.lankar.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="p3-fot-botten">
          {/* Luft mellan leden, aldrig mittpunkt (ägarens regel). Cookies är
              avsnittet med id="cookies" i integritetspolicyn; /cookies finns inte. */}
          <span>© {ar} Jobbcoach.ai</span>
          <Link href="/integritetspolicy">Integritetspolicy</Link>
          <Link href="/anvandarvillkor">Användarvillkor</Link>
          <Link href="/integritetspolicy#cookies">Cookies</Link>
          <span>Byggt i Sverige</span>
        </div>
      </div>
    </footer>
  )
}
