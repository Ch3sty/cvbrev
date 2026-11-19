// src/lib/mobilapp/idag.ts
// =============================================================================
// Idag i appen på testernas v4-modell (TesterV4Data ur hamtaTesterV4), samma
// data och regler som webbens Hem (src/components/tester-v4/hem). Här räknas
// det appens vy ritar: toppradens rubrik, dagkortets läge, hintens mål,
// typerna i Så ligger du till, veckoraden ur dagarna med slutfört test och
// gratisraden. Ren fil, går att importera från klienten och från vitest.
// =============================================================================

import { laggTill, veckodag, type Dag } from '@/lib/traning/datum';
import { GRUND_GRATISRAD } from '@/lib/tester/v4/copy';
import { PROVET_NARA_DAGAR } from '@/lib/tester/v4/hintar';
import { menyHref } from '@/lib/tester/v4/rutter';
import type { DagsmalLage, Hint, HintTyp, PlanV4, TesterV4Data, TesttypKort } from '@/lib/tester/v4/typer';
import type { RingStatus } from './vyer';

/** Hintar vars Nivåkoll-knapp startar direkt i stället för att öppna typens meny (webbens NastaSteg). */
const STARTAR_DIREKT: ReadonlySet<HintTyp> = new Set(['forsta_steg', 'nivakoll_saknas', 'nivakoll_paborjad', 'prova_nytt']);

/** Vart hintens knapp leder: samma regel som webbens hintHref. */
export function hintMal(h: Pick<Hint, 'typ' | 'testtyp' | 'knapp'>): string {
  if (!h.testtyp) return h.knapp.href;
  if (!h.knapp.las && h.knapp.slag === 'nivakoll' && STARTAR_DIREKT.has(h.typ)) return h.knapp.href;
  return menyHref(h.testtyp);
}

export const IDAG = {
  rubrik: 'Idag',
  provIdag: 'Provet är i dag',
  tillProvet: (n: number, namn: string) => `${n} ${n === 1 ? 'dag' : 'dagar'} till ${namn}`,
  las: 'Ingår i Premium',
  tips: 'Tips:',
  flerSteg: 'Fler steg',
  saLigger: 'Så ligger du till',
  utveckling: 'Din utveckling',
  fortsatt: 'Fortsätt där du slutade',
  dagsmal: 'Dagsmål',
  dagarIRad: 'Dagar i rad',
  andra: 'Ändra',
  valj: 'Välj dagsmål',
  ingetDatum: 'Inget datum satt',
  mittTest: (namn: string) => `Mitt test: ${namn}`,
  gratisKvar: GRUND_GRATISRAD,
} as const;

/** Toppradens rubrik: nedräkningen med plan och datum, annars planens namn eller "Idag". */
export function idagRubrik(plan: PlanV4 | null): string {
  if (!plan) return IDAG.rubrik;
  const n = plan.dagarKvar;
  if (n === 0) return IDAG.provIdag;
  if (n != null && n > 0) return IDAG.tillProvet(n, plan.namn);
  return plan.namn;
}

/** Dagkortet blir natt när provet är nära, som i konceptets V.hemProv. */
export function dagkortVariant(plan: PlanV4 | null, hint: Hint | null): 'koppar' | 'natt' | 'vit' {
  if (!hint) return 'vit';
  const n = plan?.dagarKvar;
  if (n != null && n >= 0 && n <= 2) return 'natt';
  if (hint.typ === 'provet_nara' && n != null && n <= PROVET_NARA_DAGAR) return 'natt';
  return 'koppar';
}

/** Typerna i Så ligger du till: planens delar med plan, annars de mätta (webbens typerAttVisa). */
export function typerAttVisa(typer: readonly TesttypKort[], plan: PlanV4 | null): TesttypKort[] {
  const synliga = typer.filter((t) => t.synlig);
  return plan ? synliga.filter((t) => t.ingarIPlan) : synliga.filter((t) => t.niva.status !== 'omatt');
}

const VECKODAGAR = ['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön'] as const;

/**
 * Veckoraden måndag till söndag ur dagarna med minst ett slutfört test. Vi
 * räknar aldrig missar (utkast v4): en dag utan test är bara en tom ring.
 */
export function veckaV4(idag: Dag, aktivaDagar: readonly Dag[]): { etikett: string; status: RingStatus; idag: boolean }[] {
  const aktiva = new Set(aktivaDagar);
  const mandag = laggTill(idag, -((veckodag(idag) + 6) % 7));
  return VECKODAGAR.map((etikett, i) => {
    const dag = laggTill(mandag, i);
    const status: RingStatus = aktiva.has(dag) ? 'gjord' : dag === idag ? 'idag' : 'kvar';
    return { etikett, status, idag: dag === idag };
  });
}

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio'];
const versal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Meningen under veckoraden. Dagsmålet först när det finns. Aldrig skuld. */
export function dagsmalText(d: DagsmalLage): string {
  const n = d.dagarIRad;
  const rad = n <= 0 ? 'Dagarna i rad börjar med ett test i dag.' : `${versal(ORD[n] ?? String(n))} ${n === 1 ? 'dag' : 'dagar'} i rad.`;
  if (!d.mal) return rad;
  return `${IDAG.dagsmal} ${Math.min(d.gjortIdag, d.mal)} av ${d.mal} i dag. ${rad}`;
}

/** Visas veckokortet? Med plan alltid; utan plan när något är gjort. */
export function visaVecka(data: Pick<TesterV4Data, 'plan' | 'dagsmal'>, aktivaDagar: readonly Dag[]): boolean {
  return !!data.plan || data.dagsmal.dagarIRad > 0 || aktivaDagar.length > 0;
}

/** Gratisraden: kvar i dag, slut för i dag, eller ingen (Premium). */
export function gratisLage(g: TesterV4Data['gratis']): 'premium' | 'kvar' | 'slut' {
  if (g.premium) return 'premium';
  return g.grundKvarIdag > 0 ? 'kvar' : 'slut';
}
