/**
 * Navigeringen i Rekryteringstester (skissen Hem A, 2026-11-19): tre stora
 * kort, Hem, Tester och Din utveckling, med ikon, namn och en undertext ur
 * datan (hemData.navTexter). Ersätter flikraden på alla tre sidorna.
 *
 *   Dator   tre kort i rad, sticky överst i golvet när sidan rullar
 *   Mobil   tre lika breda kort, ikon ovanför texten, i flödet
 *
 * Det aktiva kortet har väggens mörka färg, "Du är här" och
 * aria-current="page". Riktiga länkar. Server component.
 */

import Link from 'next/link'
import { HEM_HREF, TESTER_HREF, UTVECKLING_HREF } from '@/lib/tester/v4/rutter'
import { HEM_V4 } from './copy'
import type { NavTexter, NavVal } from './hemData'

const N = HEM_V4.nav

function IkonHem() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    </svg>
  )
}

function IkonTester() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
        <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" opacity=".5" />
      </g>
      <rect x="15" y="15" width="4.4" height="4.4" rx="1" style={{ fill: 'var(--koppar)' }} />
    </svg>
  )
}

function IkonKurva() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M3.5 17.5c3-1 4.5-6.5 7.5-7.5s4.5 3.5 8 1.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="19" cy="11.5" r="2.3" style={{ fill: 'var(--koppar)' }} />
    </svg>
  )
}

const VAL: { id: NavVal; href: string; namn: string; Ikon: () => React.JSX.Element }[] = [
  { id: 'hem', href: HEM_HREF, namn: N.hem, Ikon: IkonHem },
  { id: 'tester', href: TESTER_HREF, namn: N.tester, Ikon: IkonTester },
  { id: 'utveckling', href: UTVECKLING_HREF, namn: N.utveckling, Ikon: IkonKurva },
]

export default function Navigering({ aktiv, texter }: { aktiv: NavVal; texter: NavTexter }) {
  return (
    <nav
      aria-label={N.etikett}
      className="grid grid-cols-3 gap-2 lg:sticky lg:top-0 lg:z-[3] lg:-my-2.5 lg:gap-3 lg:bg-golv lg:py-2.5"
      data-nav-tester
    >
      {VAL.map(({ id, href, namn, Ikon }) => {
        const ar = id === aktiv
        return (
          <Link
            key={id}
            href={href}
            aria-current={ar ? 'page' : undefined}
            prefetch={ar ? false : undefined}
            data-nav={id}
            className={`flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-1 rounded-[14px] px-1.5 py-2.5 text-center lg:min-h-[72px] lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-left ${
              ar ? 'bg-vagg text-vagg-ink shadow-[inset_0_0_0_1.5px_var(--vagg-2)]' : 'border border-kant bg-papper text-ink-1 hover:border-kant-stark'
            }`}
          >
            <span
              className={`grid shrink-0 place-items-center lg:h-10 lg:w-10 lg:rounded-xl ${ar ? 'lg:bg-white/[.12]' : 'lg:bg-papper-2'}`}
            >
              <Ikon />
            </span>
            <span className="grid min-w-0 gap-0.5">
              <b className="text-[13px] font-bold leading-4 lg:text-[15px] lg:leading-[19px]">{namn}</b>
              <span className={`text-[11px] leading-[14px] lg:hidden ${ar ? 'text-vagg-mjuk' : 'text-ink-3'}`}>{texter.kort[id]}</span>
              <span className={`hidden text-[12.5px] leading-[17px] lg:block ${ar ? 'text-vagg-mjuk' : 'text-ink-3'}`}>{texter.rad[id]}</span>
            </span>
            {ar ? (
              <span className="ml-auto hidden shrink-0 text-[11px] font-semibold uppercase tracking-[.06em] text-vagg-mjuk xl:inline">{N.duArHar}</span>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="ml-auto hidden shrink-0 text-ink-3 lg:block">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
