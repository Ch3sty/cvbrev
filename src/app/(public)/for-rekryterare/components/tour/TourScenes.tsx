'use client';

import { Lock, Check, ArrowRight, Columns3, Bell, Link2 } from 'lucide-react';
import { MockPercentileDots, MockSpectrum, MockAvatar } from './TourPrimitives';
import {
  TOUR_SEARCHES,
  TOUR_SPECTRA,
  TOUR_THRIVES,
  TOUR_DISCLAIMER,
  TOUR_INTERVIEW,
  type TourRow,
} from './tour-data';

/* Scen 1: sökvyn med klickbara sökningar som omrankar raderna. */
export function SceneSearch({
  activeSearch,
  onSearch,
}: {
  activeSearch: number;
  onSearch: (i: number) => void;
}) {
  const search = TOUR_SEARCHES[activeSearch];
  return (
    <div className="p-4 sm:p-5">
      {/* Sökfält */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 mb-3">
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <span className="text-[13px] text-slate-700 font-medium truncate">{search.query}</span>
      </div>

      {/* Klickbara exempelsökningar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[11px] text-slate-400 font-semibold self-center">Testa:</span>
        {TOUR_SEARCHES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSearch(i)}
            className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border transition-colors ${
              i === activeSearch
                ? 'bg-orange-50 border-orange-300 text-orange-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Träffrader */}
      <div className="space-y-2">
        {search.rows.map((row, idx) => (
          <TourResultRow key={row.role} row={row} top={idx === 0} />
        ))}
      </div>
    </div>
  );
}

function TourResultRow({ row, top }: { row: TourRow; top: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${
        top ? 'border-orange-200 bg-orange-50/40' : 'border-slate-100 bg-white'
      }`}
    >
      <MockAvatar initial={row.initial} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-bold text-slate-900">{row.role}</span>
          <span className="text-[11px] text-slate-400">{row.region} · Anonym</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">{row.seniority}</p>
        {/* Matchförklaring: det som gör rankningen begriplig */}
        <p className="text-[11px] italic text-slate-500 mt-1 leading-snug">{row.matchReason}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <MockPercentileDots dots={row.dots} />
          <span className="text-[10.5px] font-bold rounded-full px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800">
            {row.archetype}
          </span>
          {row.skills.slice(0, 2).map((s) => (
            <span key={s} className="text-[10.5px] font-semibold rounded-full px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Scen 2: tabellen dimmad, peek-panel glider in från höger. */
export function ScenePeek() {
  const row = TOUR_SEARCHES[0].rows[0];
  return (
    <div className="relative p-4 sm:p-5 min-h-[340px]">
      {/* Dimmad tabellantydan */}
      <div className="space-y-2 opacity-40 blur-[1px] pointer-events-none">
        {TOUR_SEARCHES[0].rows.map((r) => (
          <TourResultRow key={r.role} row={r} top={false} />
        ))}
      </div>

      {/* Peek-panel */}
      <div className="absolute top-0 right-0 h-full w-[78%] sm:w-[64%] bg-white border-l border-slate-200 shadow-[-8px_0_24px_-12px_rgba(2,6,23,0.25)] p-4 overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <MockAvatar initial={row.initial} size={40} />
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-slate-900 truncate">{row.role}</div>
            <div className="text-[11.5px] text-slate-500">{row.region} · Anonym</div>
          </div>
        </div>
        <p className="text-[12px] italic text-slate-600 leading-relaxed mb-3">
          &rdquo;Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.&rdquo;
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900">
            Matrislogik · Expertnivå · topp 10 %
          </span>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900">
            Numeriskt · topp 15 %
          </span>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 mb-4">
          <p className="text-[12px] font-bold text-indigo-900">Strukturerad analytiker</p>
          <p className="text-[11px] text-indigo-900/70 mt-0.5">Metodisk problemlösare som gärna tänker nytt, men aldrig slarvigt.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11.5px] font-bold text-white rounded-lg px-3 py-1.5" style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}>
            Visa intresse
          </span>
          <span className="text-[11.5px] font-semibold text-slate-600 rounded-lg px-3 py-1.5 border border-slate-200">Lägg i projekt</span>
          <span className="text-[11.5px] font-semibold text-slate-500 rounded-lg px-3 py-1.5">Öppna full profil</span>
        </div>
      </div>
    </div>
  );
}

/* Scen 3: profilvyn med verifierade resultat + arbetsstilsrapport (låst guide). */
export function SceneProfile() {
  return (
    <div className="p-4 sm:p-5">
      {/* Snabbsammanfattning */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { k: 'Erfarenhet', v: '8 år' },
          { k: 'Bäst i', v: 'Matrislogik expert' },
          { k: 'Arbetsstil', v: 'Strukturerad analytiker' },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
            <p className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{c.k}</p>
            <p className="text-[12px] font-bold text-slate-900 leading-tight mt-0.5">{c.v}</p>
          </div>
        ))}
      </div>

      {/* Verifierade resultat */}
      <div className="rounded-xl border border-orange-100 p-3 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-orange-700 mb-2">Verifierade resultat</p>
        {[
          'Matrislogik · Expertnivå · topp 10 % av 340 testade · 1 försök',
          'Numeriskt · Standardnivå · topp 15 % av 890 testade · 1 försök',
        ].map((r) => (
          <div key={r} className="flex items-center gap-2 text-[11.5px] text-slate-700 py-1">
            <span className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45 flex-shrink-0" />
            {r}
          </div>
        ))}
      </div>

      {/* Arbetsstilsrapport */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-700 mb-3">Arbetsstil</p>
        <div className="space-y-3 mb-3">
          {TOUR_SPECTRA.map((s) => (
            <MockSpectrum key={s.left} spectrum={s} />
          ))}
        </div>
        <div className="rounded-lg bg-white border border-indigo-100 p-2.5 mb-3">
          <p className="text-[11px] text-slate-700 leading-snug">
            <span className="font-bold text-indigo-900">Trivs när</span> {TOUR_THRIVES.thrivesWhen}.{' '}
            <span className="font-bold text-slate-700">Utmanas när</span> {TOUR_THRIVES.challengedWhen}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.25} />
          Onboarding och intervjuguide låses upp när kandidaten tackar ja.
        </div>
      </div>
    </div>
  );
}

/* Scen 4: kontakt upplåst, namn synligt, intervjuguide + onboarding. */
export function SceneUnlocked() {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-4">
        <MockAvatar initial="A" size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold text-slate-900">Anna Lindqvist</div>
          <div className="text-[11.5px] text-slate-500">Redovisningsekonom · Stockholm</div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold rounded-full px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700">
          <Check className="w-3 h-3" strokeWidth={3} />
          Kontakt upplåst
        </span>
      </div>

      {/* Intervjuguide */}
      <div className="rounded-xl border border-indigo-100 bg-white p-3.5 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 mb-1.5">{TOUR_INTERVIEW.basedOn}</p>
        <p className="text-[12.5px] text-slate-800 font-semibold leading-snug mb-2.5">{TOUR_INTERVIEW.question}</p>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Lyssna efter</p>
        <ul className="space-y-1">
          {TOUR_INTERVIEW.listenFor.map((l) => (
            <li key={l} className="flex items-start gap-1.5 text-[11.5px] text-slate-600 leading-snug">
              <ArrowRight className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              {l}
            </li>
          ))}
        </ul>
      </div>

      {/* Onboarding */}
      <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">Onboarda så här</p>
        <p className="text-[11.5px] text-slate-700 leading-snug">{TOUR_INTERVIEW.onboarding}</p>
      </div>
    </div>
  );
}

/* Scen 5: jämför + bevakningsmail + delningslänk. */
export function SceneWorkflow() {
  return (
    <div className="p-4 sm:p-5 space-y-3">
      {/* Jämför-mini */}
      <div className="rounded-xl border border-slate-100 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Columns3 className="w-3.5 h-3.5 text-slate-500" strokeWidth={2.25} />
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Jämför</p>
        </div>
        <div className="grid grid-cols-[80px_1fr_1fr] gap-x-2 gap-y-1.5 text-[11px]">
          <span className="text-slate-400" />
          <span className="font-bold text-slate-700 text-center">Anna</span>
          <span className="font-bold text-slate-700 text-center">Erik</span>
          <span className="text-slate-500">Matrislogik</span>
          <span className="text-center font-semibold text-slate-800 rounded bg-orange-50/60">topp 10 %</span>
          <span className="text-center text-slate-600">topp 5 %</span>
          <span className="text-slate-500">Erfarenhet</span>
          <span className="text-center font-semibold text-slate-800 rounded bg-orange-50/60">8 år</span>
          <span className="text-center text-slate-600">6 år</span>
        </div>
      </div>

      {/* Bevakningsmail-mock */}
      <div className="rounded-xl border border-orange-100 overflow-hidden">
        <div className="h-1" style={{ background: 'linear-gradient(90deg,#FB923C,#DC2626,#BE185D)' }} />
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[13px] font-black" style={{ background: 'linear-gradient(135deg,#F97316,#DC2626 55%,#BE185D)' }}>J</div>
            <div className="flex items-center gap-1 text-[10.5px] text-orange-700 font-bold uppercase tracking-wide">
              <Bell className="w-3 h-3" strokeWidth={2.25} />
              Din bevakning
            </div>
          </div>
          <p className="text-[12.5px] font-bold text-slate-900 leading-snug mb-2">
            2 nya kandidater matchar &rdquo;Redovisningsekonom Sthlm&rdquo;
          </p>
          <span className="inline-block text-[11px] font-bold text-white rounded-lg px-3 py-1.5" style={{ background: 'linear-gradient(135deg,#F97316,#DC2626)' }}>
            Visa kandidaterna
          </span>
        </div>
      </div>

      {/* Delningslänk */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
        <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2.25} />
        <span className="text-[11px] text-slate-600 font-medium truncate">jobbcoach.ai/delad/kandidat/x7f...</span>
        <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">giltig 14 dagar</span>
      </div>
    </div>
  );
}
