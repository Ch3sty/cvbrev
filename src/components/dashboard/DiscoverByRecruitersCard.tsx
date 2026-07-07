'use client';

import Link from 'next/link';
import { Search, Check, ArrowRight, X } from 'lucide-react';
import { useCandidateInterests } from '@/hooks/useCandidateInterests';
import { useUiFlag } from '@/hooks/useUiFlag';

/**
 * Introkort på dashboarden som säljer rekryteringsfunktionen till den som inte
 * gjort sig synlig än. Budskapet är HELA profilen (CV, kompetenser, erfarenhet),
 * inte tester. Villkorat: visas bara när isVisible=false och kortet inte
 * stängts. Ett stängt kort kommer aldrig tillbaka.
 */
export default function DiscoverByRecruitersCard() {
  const { isVisible, loaded } = useCandidateInterests();
  const [dismissed, dismiss] = useUiFlag('discover_recruiters_card');

  // Visa bara för den som inte gjort sig synlig och inte stängt kortet.
  if (!loaded || isVisible || dismissed) return null;

  const POINTS = [
    'Din erfarenhet och dina kompetenser syns direkt',
    'Anonym tills du själv säger ja',
    'Du väljer alltid vem du pratar med',
  ];

  return (
    <div
      className="relative grid grid-cols-1 lg:grid-cols-[1fr_320px] rounded-[28px] border border-[#E7E4F5] bg-white overflow-hidden"
      style={{ boxShadow: '0 20px 60px -20px rgba(79,70,229,0.22)' }}
    >
      {/* Vänster: text */}
      <div className="p-7 sm:p-9 lg:p-10 order-2 lg:order-1">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white rounded-full px-3 py-1"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)', boxShadow: '0 6px 14px -6px rgba(220,38,38,0.4)' }}
        >
          <Search className="w-3 h-3" strokeWidth={2.5} />
          Bli upptäckt
        </span>
        <h3 className="mt-4 text-[26px] sm:text-[30px] font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-[14ch] text-balance">
          Sluta jaga jobb. Låt din erfarenhet göra jobbet.
        </h3>
        <p className="mt-3.5 text-[15px] text-slate-600 leading-relaxed max-w-[44ch]">
          Din profil visar vem du är: din bakgrund, dina kompetenser, det du
          faktiskt kan. Rekryterare som söker precis det du erbjuder hittar dig
          direkt, och du slipper skicka ansökan efter ansökan i mörkret.
        </p>
        <ul className="mt-6 flex flex-col gap-2.5">
          {POINTS.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[14px] font-semibold text-slate-700">
              <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-[13px] h-[13px]" strokeWidth={3.2} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <Link
          href="/dashboard/bli-upptackt"
          className="group mt-7 inline-flex items-center gap-2 rounded-[14px] text-white text-[15px] font-extrabold px-7 py-3.5 transition-transform hover:-translate-y-0.5"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 28px -8px rgba(220,38,38,0.4)',
          }}
        >
          Skapa din profil
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Höger: illustration */}
      <div
        className="relative order-1 lg:order-2 min-h-[180px] lg:min-h-0"
        style={{ background: 'radial-gradient(circle at 50% 42%, #4F46E5 0%, #3730A3 68%, #2E2A7A 100%)' }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Stäng"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-[10px] border border-white/30 bg-white/15 text-white flex items-center justify-center hover:bg-white/25 backdrop-blur-sm"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
        <RecruiterRadar />
      </div>
    </div>
  );
}

/** Radar-motiv: en hel profil i mitten som rekryterare (orange) dras mot. */
function RecruiterRadar() {
  return (
    <svg
      viewBox="0 0 320 320"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Rekryterare hittar din profil"
    >
      <defs>
        <linearGradient id="drc-og" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FB923C" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      {/* radarringar, minskande opacitet utåt */}
      <circle cx="160" cy="150" r="140" stroke="#fff" strokeWidth="1" opacity="0.08" />
      <circle cx="160" cy="150" r="98" stroke="#fff" strokeWidth="1" opacity="0.12" />
      <circle cx="160" cy="150" r="58" stroke="#fff" strokeWidth="1" opacity="0.16" />
      {/* streckade ledlinjer mot profilen */}
      <path d="M160 150 L44 66" stroke="#F97316" strokeWidth="1" strokeDasharray="2 4" opacity="0.28" />
      <path d="M160 150 L286 96" stroke="#F97316" strokeWidth="1" strokeDasharray="2 4" opacity="0.28" />
      <path d="M160 150 L40 232" stroke="#F97316" strokeWidth="1" strokeDasharray="2 4" opacity="0.28" />
      <path d="M160 150 L280 244" stroke="#F97316" strokeWidth="1" strokeDasharray="2 4" opacity="0.28" />
      <path d="M160 150 L162 40" stroke="#F97316" strokeWidth="1" strokeDasharray="2 4" opacity="0.22" />
      {/* rekryterarprickar */}
      <circle cx="44" cy="66" r="6" fill="url(#drc-og)" />
      <circle cx="286" cy="96" r="5" fill="url(#drc-og)" />
      <circle cx="40" cy="232" r="5" fill="url(#drc-og)" />
      <circle cx="280" cy="244" r="6" fill="url(#drc-og)" />
      <circle cx="162" cy="40" r="5" fill="url(#drc-og)" />
      {/* profilkapsel: ett helt CV, inte ett test */}
      <rect x="118" y="98" width="84" height="104" rx="18" fill="#fff" />
      <circle cx="141" cy="124" r="13" fill="#EEF0FF" stroke="#4F46E5" strokeWidth="1.5" />
      <path d="M141 124a4 4 0 100-8 4 4 0 000 8zM134 132a7 5 0 0114 0z" fill="#4F46E5" />
      <rect x="160" y="118" width="30" height="5" rx="2.5" fill="#334155" />
      <rect x="160" y="127" width="20" height="4" rx="2" fill="#94A3B8" />
      <rect x="132" y="150" width="56" height="4" rx="2" fill="#E2E8F0" />
      <rect x="132" y="159" width="44" height="4" rx="2" fill="#E2E8F0" />
      <rect x="132" y="174" width="18" height="8" rx="4" fill="#818CF8" />
      <rect x="154" y="174" width="14" height="8" rx="4" fill="#A5B4FC" />
      <rect x="172" y="174" width="16" height="8" rx="4" fill="#C7D2FE" />
      {/* verifierat-bock som hörndetalj, inte huvudmotiv */}
      <circle cx="196" cy="102" r="11" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
      <path d="M191 102l3 3 6-6" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
