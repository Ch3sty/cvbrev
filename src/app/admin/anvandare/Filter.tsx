'use client';

/**
 * Filterraden over anvandarlistan.
 *
 * Filtret bor i URL:en, inte i komponentens tillstand. Da ar en filtrerad vy
 * en lank som gar att spara och dela, tillbakaknappen fungerar, och sidan
 * fortsatter vara serverrenderad: klienten byter bara adress, servern kor om
 * fragan. Ingen Supabase-fraga sker har.
 *
 * Soket ar en form med metod get i praktiken, men gar via router.replace sa
 * att vi kan stada bort tomma parametrar och alltid nollstalla sidnumret nar
 * filtret andras. Ett filter som behaller sida 7 ger en tom lista och ser ut
 * som en bugg.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  filterFranSok,
  sokFranFilter,
  GRUPPER,
  type AnvandarFilter,
  type Grupp,
} from './data';

const FALT_KLASS =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-sm text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1';

const KRYSS_KLASS =
  'inline-flex h-11 cursor-pointer items-center gap-2 text-sm text-ink-2';

export interface FilterProps {
  /** Källorna som finns i datan, for rullgardinen. */
  kallor: string[];
  /** Antal konton utan anskaffningskalla, for alternativet "Saknas". */
  utanKalla: number;
  /**
   * Kallfiltret visas forst nar minst en tiondel av kontona har en kalla,
   * samma regel som kolumnen. Ett filter med ett enda meningsfullt val ar
   * brus.
   */
  visaKalla: boolean;
  /** Antal per grupp, efter etiketten i menyn. */
  antal: Record<Grupp, number>;
}

export default function Filter({ kallor, utanKalla, visaKalla, antal }: FilterProps) {
  const router = useRouter();
  const sokparametrar = useSearchParams();
  const [vantar, startaOvergang] = useTransition();

  const aktivt = filterFranSok(
    Object.fromEntries(sokparametrar.entries())
  );

  // Fritexten halls lokalt sa att inskrivningen inte gor en rundtur per
  // tangenttryck. Den skickas vid submit eller efter 400 ms stillhet.
  const [sok, setSok] = useState(aktivt.sok);

  useEffect(() => {
    setSok(aktivt.sok);
    // Bara nar adressen andras utifran, till exempel via tillbakaknappen.
  }, [aktivt.sok]);

  const navigera = (nasta: Partial<AnvandarFilter>) => {
    const kombinerat: AnvandarFilter = {
      ...aktivt,
      ...nasta,
      // Ett byte av filter borjar alltid om pa sida ett.
      sida: nasta.sida ?? 1,
    };
    startaOvergang(() => {
      router.replace(`/admin/anvandare${sokFranFilter(kombinerat)}`, {
        scroll: false,
      });
    });
  };

  useEffect(() => {
    if (sok === aktivt.sok) return;
    const id = window.setTimeout(() => navigera({ sok }), 400);
    return () => window.clearTimeout(id);
    // navigera beror pa aktivt, som beror pa adressen. Effekten ska bara
    // reagera pa att texten andrats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sok, aktivt.sok]);

  const harFilter =
    aktivt.grupp !== 'alla' ||
    aktivt.aktivitet !== 'alla' ||
    aktivt.harCv ||
    aktivt.harBrev ||
    Boolean(aktivt.kalla) ||
    Boolean(aktivt.sok);

  return (
    <div
      className="rounded-xl border border-kant bg-panel p-4"
      aria-busy={vantar}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigera({ sok });
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm font-medium text-ink-2">
            Sök
          </span>
          <input
            type="search"
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            placeholder="E-post eller namn"
            className={FALT_KLASS}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-2">
            Visa
          </span>
          <select
            value={aktivt.grupp}
            onChange={(e) => navigera({ grupp: e.target.value as Grupp })}
            className={FALT_KLASS}
          >
            {GRUPPER.map((g) => (
              <option key={g.nyckel} value={g.nyckel}>
                {g.etikett} ({antal[g.nyckel].toLocaleString('sv-SE')})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-2">
            Aktivitet
          </span>
          <select
            value={aktivt.aktivitet}
            onChange={(e) =>
              navigera({
                aktivitet: e.target.value as AnvandarFilter['aktivitet'],
              })
            }
            className={FALT_KLASS}
          >
            <option value="alla">När som helst</option>
            <option value="7">Senaste 7 dagarna</option>
            <option value="30">Senaste 30 dagarna</option>
          </select>
        </label>

        {visaKalla ? (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-2">
            Anskaffningskälla
          </span>
          <select
            value={aktivt.kalla}
            onChange={(e) => navigera({ kalla: e.target.value })}
            className={FALT_KLASS}
          >
            <option value="">Alla källor</option>
            {kallor.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
            <option value="saknas">
              Saknas ({utanKalla.toLocaleString('sv-SE')})
            </option>
          </select>
        </label>
        ) : null}

        <div className="flex flex-wrap items-end gap-6 sm:col-span-2 lg:col-span-3">
          <label className={KRYSS_KLASS}>
            <input
              type="checkbox"
              checked={aktivt.harCv}
              onChange={(e) => navigera({ harCv: e.target.checked })}
              className="h-4 w-4 rounded border-kant-stark text-ink-1 focus:ring-ink-1"
            />
            Har CV
          </label>

          <label className={KRYSS_KLASS}>
            <input
              type="checkbox"
              checked={aktivt.harBrev}
              onChange={(e) => navigera({ harBrev: e.target.checked })}
              className="h-4 w-4 rounded border-kant-stark text-ink-1 focus:ring-ink-1"
            />
            Har brev
          </label>

          {harFilter ? (
            <button
              type="button"
              onClick={() => {
                setSok('');
                startaOvergang(() => {
                  router.replace('/admin/anvandare', { scroll: false });
                });
              }}
              className="inline-flex h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
            >
              Rensa filter
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
