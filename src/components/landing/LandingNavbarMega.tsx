/**
 * Innehållet i menyn "Vad vi erbjuder" och i telefonmenyn (skissen
 * docs/design/publikt-omgang3/sidor/meny.html, delar/meny-mega.html).
 * Serverkomponenter: layouten ritar dem och skickar dem till LandingNavbar,
 * så att texten och talen aldrig hamnar i klientens JavaScript och alla
 * länkar står i HTML:en även när menyn är stängd.
 *
 * Raden under varje länk: textbeslut NAV-1, ordagrant. Talen räknas ur
 * konstanter (testtyper, mallar, brevexempel), aldrig för hand.
 */

import Link from 'next/link'
import { ANTAL_TESTTYPER } from '@/lib/tester/antal-testtyper'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { BREV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { PLAN_BY_KEY, SALD_PLAN, paketMedPris } from '@/lib/plans/plans'
import { storForst, talOrd } from '@/components/publikt/talord'
import { Ikon } from '@/components/publikt/v3/Ikon'
import { DELAR, MER, TELEFON_MER, type NavLank } from './nav-data'

/** Raden under länken i menyn (NAV-1). */
const UNDER: Record<string, string> = {
  '/verktyg/rekryteringstester': `${storForst(talOrd(ANTAL_TESTTYPER))} testtyper i tre nivåer`,
  '/verktyg/personlighetstest': 'Det rekryteraren läser ut av dig',
  '/verktyg/cv-analys': 'Läsbarhetspoäng i sju delar',
  '/verktyg/skapa-cv': 'Skriv direkt på arket',
  '/cv-mallar': `${TEMPLATE_COUNT} mallar, ${talOrd(FREE_TEMPLATE_COUNT)} gratis`,
  '/verktyg/linkedin-optimering': 'Syns i rekryterarnas sök',
  '/verktyg/personligt-brev': 'Skrivet på annonsens krav',
  '/personligt-brev-exempel': `${BREV_GALLERI.length} yrken att utgå från`,
  '/verktyg/jobbmatchning': 'Annonser som passar ditt CV',
  '/verktyg/sokta-tjanster': 'Uppföljning och rapport',
  '/verktyg/jobbcoachen': 'Svar med källor',
  '/verktyg/bli-upptackt': 'Låt rekryterare hitta dig',
}

/** Premiumraden: "Jobbcoach Premium, 149 kr i månaden" och beskrivningen ur plans.ts. */
const PREMIUM_RUBRIK = paketMedPris(SALD_PLAN)
const PREMIUM_TEXT = `${PLAN_BY_KEY[SALD_PLAN].beskrivning}. Säg upp när du vill.`

function Etikett({ l }: { l: NavLank }) {
  return (
    <>
      {l.label}
      {l.nyhet ? <em className="p3-nyhet">Nyhet</em> : null}
    </>
  )
}

/** En liten matrisuppgift i testkolumnen (bild, aria-hidden). */
function MiniMatris() {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinejoin: 'round' } as const
  return (
    <div className="p3-mm-matris">
      <span>
        <svg viewBox="0 0 40 40">
          <path d="M20 6l15 27H5z" {...s} />
        </svg>
      </span>
      <span>
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="14" {...s} />
        </svg>
      </span>
      <span>
        <svg viewBox="0 0 40 40">
          <rect x="6" y="6" width="28" height="28" rx="3" {...s} />
        </svg>
      </span>
      <span className="p3-tom">?</span>
    </div>
  )
}

export function MegaMeny() {
  return (
    <div className="p3-mm">
      <div className="p3-mm-rum">
        {DELAR.map((d) => (
          <div key={d.farg} className="p3-mm-kol" data-p3-farg={d.farg}>
            <Link className="p3-mm-huvud" href={d.href}>
              <span className="p3-dorr-ram" aria-hidden="true">
                <Ikon namn={d.farg} />
              </span>
              {d.rubrik}
            </Link>
            <div className="p3-mm-lankar">
              {d.lankar.map((l) => (
                <Link key={l.href + l.label} href={l.href}>
                  <Etikett l={l} />
                  {UNDER[l.href] ? <span>{UNDER[l.href]}</span> : null}
                </Link>
              ))}
            </div>
            {d.farg === 'tran' ? (
              <div className="p3-mm-bild" aria-hidden="true">
                <MiniMatris />
                <p>Grundnivån är gratis i alla {talOrd(ANTAL_TESTTYPER)}.</p>
              </div>
            ) : null}
            {d.farg === 'brev' ? (
              <div className="p3-mm-bild" aria-hidden="true">
                <div className="p3-mm-blad">
                  <i />
                  <i />
                  <i className="p3-m" />
                  <i />
                  <i className="p3-m p3-k" />
                </div>
                <p>Första brevet är gratis.</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <div className="p3-mm-fot">
        <div className="p3-mm-prem">
          <p>
            <b>{PREMIUM_RUBRIK}</b>
            {PREMIUM_TEXT}
          </p>
          <Link className="p3-knapp-glas-ram" href="/priser">
            Se vad som ingår
          </Link>
        </div>
        <nav className="p3-mm-mer" aria-label="Mer">
          {MER.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

/** Telefonmenyns kropp: de fyra delarna som färgade block, övriga länkar och Premiumraden. */
export function MobilMenyKropp() {
  return (
    <>
      {DELAR.map((d) => (
        <div key={d.farg} className="p3-tm-block" data-p3-farg={d.farg}>
          <Link href={d.href}>
            <span className="p3-dorr-ram" aria-hidden="true">
              <Ikon namn={d.farg} />
            </span>
            {d.rubrik}
          </Link>
          <div className={`p3-tm-lankar ${d.farg === 'tran' ? 'p3-en' : ''}`.trim()}>
            {d.lankar.map((l) => (
              <Link key={l.href + l.label} href={l.href}>
                {l.label}
                {l.nyhet ? <em className="p3-nyhet">Nyhet</em> : null}
                {d.farg === 'tran' && UNDER[l.href] ? <span>{UNDER[l.href]}</span> : null}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className="p3-tm-mer">
        {TELEFON_MER.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
      <Link className="p3-tm-prem" href="/priser">
        <b>{PREMIUM_RUBRIK}</b>
        {PREMIUM_TEXT}
        <br />
        <em>Se vad som ingår</em>
      </Link>
    </>
  )
}
