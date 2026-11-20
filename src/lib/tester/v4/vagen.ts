// src/lib/tester/v4/vagen.ts
// =============================================================================
// Omgång 3, steg 3a: väggens "Dagens träning", väggens bana och "Vägen till
// provet". Ren. Allt väljs ur det som redan finns i modellen: hintarna (i
// prioritetsordning), typernas menyer (Träna, Nivåkollen, nivåtesten,
// övningsprovet med sina lås) och banans förslag (nivåkoll sju dagar efter
// den senaste, övningsprov två dagar före provet). Ingen ny motor.
//
//   Dagens träning   Nivåkollen när typen inte är mätt (första steget,
//                    nivakoll_saknas, påbörjad). Annars Träna i provets del,
//                    eller i typen hinten pekar ut utan plan. Utan Premium
//                    det som är öppet: Nivåkollen en gång, sedan dagens
//                    grundnivåtest, och när det är gjort Träna med låset.
//   Väggens bana     Med plan: två dagar bakåt, i dag och dagarna fram till
//                    provet (högst fyra, sedan provdagen). Utan plan: dagarna
//                    i rad bakåt (högst tre) ur aktivaDagar, i dag, öppna
//                    dagar och "provdagen, när du vet den".
//   Vägen            Ett förslag per dag från i dag: dagens träning, banans
//                    nivåkoll och övningsprov på sina dagar, däremellan nästa
//                    oanvända hint, annars Träna. Sist provdagen (eller
//                    Lägg till provdatum, eller Har du ett prov?).
// =============================================================================

import { dagarMellan, laggTill, veckodagNamn, type Dag } from '@/lib/traning/datum';
import { nivakollOmfang } from '@/lib/nivakoll/omfang';
import { ETIKETT, LAS_CHIP, NIVA_TEST_ANTAL, typNamn, typNamnSmall } from './copy';
import { menyHref } from './rutter';
import type {
  BanaDag,
  DagensTraning,
  DagsmalLage,
  Gratislage,
  Handling,
  Hint,
  HintTyp,
  PlanV4,
  TestTypId,
  TesttypKort,
  TypMeny,
  VagDag,
  VaggNod,
} from './typer';

/** Väggens bana har åtta platser (skissens kurva): bakåt, i dag, framåt och flaggan. */
export const VAGG_PLATSER = 8;
/** Vägen till provet visar högst så här många kort, provdagen inräknad. */
export const VAGEN_MAX = 6;

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
const ord = (n: number) => ORD[n] ?? String(n);
const versal = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const MAL_ORD = { 1: 'ett test', 2: 'två test', 3: 'tre test' } as const;
const MANAD = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** "11 nov" */
export function kortDatumV(dag: Dag): string {
  const [, m, d] = dag.split('-').map(Number);
  return `${d} ${MANAD[m - 1]}`;
}

/** "ons", "tors", "fre" */
export function kortVeckodag(dag: Dag): string {
  const n = veckodagNamn(dag);
  return n === 'torsdag' ? 'tors' : n.slice(0, 3);
}

/** "dag" eller "dagar" */
const dagar = (n: number) => (n === 1 ? 'dag' : 'dagar');

/** Nivåkoll-läget: typen inte mätt än, eller en påbörjad Nivåkoll. */
const NIVAKOLL_HINTAR: ReadonlySet<HintTyp> = new Set(['forsta_steg', 'nivakoll_saknas', 'nivakoll_paborjad']);

/** Hintar som startar direkt (samma regel som hintLank.ts). */
const STARTAR_DIREKT: ReadonlySet<HintTyp> = new Set(['forsta_steg', 'nivakoll_saknas', 'nivakoll_paborjad', 'prova_nytt']);

function hintHrefV(h: Pick<Hint, 'typ' | 'testtyp' | 'knapp'>): string {
  if (!h.testtyp) return h.knapp.href;
  if (!h.knapp.las && h.knapp.slag === 'nivakoll' && STARTAR_DIREKT.has(h.typ)) return h.knapp.href;
  return menyHref(h.testtyp);
}

/** Vart en handling leder från Hem: låst går till typens meny, som visar låset och betalväggen. */
export function handlingHref(h: Handling, typ: TestTypId | null): string {
  return h.las && typ ? menyHref(typ) : h.href;
}

const hintRef = (h: Hint | null | undefined): DagensTraning['hint'] => (h ? { id: h.id, typ: h.typ, testtyp: h.testtyp } : null);

export interface VagenIn {
  idag: Dag;
  plan: PlanV4 | null;
  bana: readonly BanaDag[];
  typer: readonly TesttypKort[];
  menyer: Readonly<Record<TestTypId, TypMeny>>;
  hintar: readonly Hint[];
  gratis: Gratislage;
  dagsmal: DagsmalLage;
  /** Alla dagar med minst ett slutfört test. */
  aktivaDagar: readonly Dag[];
}

/** Typen som dagens träning gäller. */
function dagensTyp(inp: VagenIn): TestTypId {
  const h0 = inp.hintar[0];
  const synliga = inp.typer.filter((t) => t.synlig);
  if (inp.plan) {
    if (h0?.testtyp && inp.plan.typer.includes(h0.testtyp)) return h0.testtyp;
    return inp.plan.typer[0] ?? synliga[0]?.id ?? 'matris';
  }
  if (h0?.testtyp) return h0.testtyp;
  return synliga.find((t) => t.niva.status === 'matt')?.id ?? synliga[0]?.id ?? 'matris';
}

function stortTal(inp: VagenIn, forsta: boolean, typ: TestTypId): DagensTraning['stort'] {
  const plan = inp.plan;
  if (plan?.provdatum && plan.dagarKvar != null && plan.dagarKvar > 0) {
    return { tal: plan.dagarKvar, rad1: `${dagar(plan.dagarKvar)} kvar till`, rad2: 'provet' };
  }
  const n = inp.dagsmal.dagarIRad;
  if (n > 0) {
    const gjordIdag = inp.aktivaDagar.includes(inp.idag);
    const start = laggTill(inp.idag, -(n - (gjordIdag ? 1 : 0)));
    const rad2 = start === inp.idag ? 'från i dag' : dagarMellan(start, inp.idag) === 1 ? 'sedan i går' : `sedan i ${veckodagNamn(start)}s`;
    return { tal: n, rad1: `${dagar(n)} i rad`, rad2 };
  }
  if (forsta) {
    const o = nivakollOmfang(typ);
    if (o) return { tal: o.minuter, rad1: 'minuter till din', rad2: 'första nivå' };
  }
  return null;
}

function kortRad(inp: VagenIn, d: Pick<DagensTraning, 'slag' | 'typ' | 'forstaSteget'>): string | null {
  const plan = inp.plan;
  if (plan?.provdatum && plan.dagarKvar != null) {
    if (plan.dagarKvar === 0) return 'Provet i dag';
    if (plan.dagarKvar > 0) return `${plan.dagarKvar} ${dagar(plan.dagarKvar)} kvar`;
  }
  if (d.slag === 'nivakoll') {
    const o = nivakollOmfang(d.typ);
    return o ? `${o.uppgifter} uppgifter` : null;
  }
  const n = inp.dagsmal.dagarIRad;
  return n > 0 ? `${n} ${dagar(n)} i rad` : null;
}

function serieRad(inp: VagenIn): string | null {
  const n = inp.dagsmal.dagarIRad;
  const gjordIdag = inp.dagsmal.gjortIdag > 0;
  if (gjordIdag) return n > 1 ? `Dagens test är gjort. ${versal(ord(n))} dagar i rad.` : 'Dagens test är gjort.';
  if (n > 0) return `Tränar du i dag blir det ${ord(n + 1)} dagar i rad.`;
  return null;
}

function chipsFor(inp: VagenIn): DagensTraning['chips'] {
  const ut: DagensTraning['chips'] = [];
  const n = inp.dagsmal.dagarIRad;
  if (n > 0) ut.push({ text: `${n} ${dagar(n)} i rad`, bock: true });
  const mal = inp.dagsmal.mal;
  if (mal === 1 || mal === 2 || mal === 3) ut.push({ text: `Dagsmål: ${MAL_ORD[mal]} om dagen` });
  return ut;
}

/** Ingressen för träningen: provets del, nivån, eller bara hur träningen fungerar. */
function tranaText(inp: VagenIn, typ: TestTypId, kort: TesttypKort | undefined): string {
  const plan = inp.plan;
  const svans = 'Träningen följer din nivå och förklarar varje svar.';
  if (plan && plan.typer.includes(typ)) {
    return plan.typer.length === 1 ? `Det är delen ${plan.namn} prövar. ${svans}` : `Det är en av delarna ${plan.namn} prövar. ${svans}`;
  }
  const v = kort?.niva.status === 'matt' ? kort.niva.niva : null;
  if (v != null) return `Träningen börjar på din nivå, ${v.toFixed(1).replace('.', ',')}, och förklarar varje svar.`;
  return svans;
}

export function byggDagens(inp: VagenIn): DagensTraning {
  const h0 = inp.hintar[0] ?? null;
  const g = inp.gratis;

  // Nivåkoll-läget: hinten säger att typen saknar nivå, eller att Nivåkollen är påbörjad.
  if (h0 && h0.testtyp && NIVAKOLL_HINTAR.has(h0.typ) && h0.knapp.slag === 'nivakoll') {
    const typ = h0.testtyp;
    const o = nivakollOmfang(typ);
    const forsta = h0.typ === 'forsta_steg';
    const kort = inp.typer.find((t) => t.id === typ);
    const paborjad = h0.typ === 'nivakoll_paborjad' && kort?.niva.svar ? kort.niva.svar : null;
    const plan = inp.plan;
    const rubrik = paborjad ? 'Gör klart Nivåkollen' : o ? `Mät din nivå på ${ord(o.minuter)} minuter` : 'Mät din nivå';
    const text = paborjad
      ? `${paborjad.besvarade} av ${paborjad.antal} svar i ${typNamnSmall(typ)}, sparade. ${versal(ord(paborjad.antal - paborjad.besvarade))} till, så får du din nivå.`
      : `${o ? `${versal(ord(o.uppgifter))} uppgifter i ${typNamnSmall(typ)}` : typNamn(typ)}${
          plan && plan.typer.includes(typ) ? `, en del av ${plan.namn}.` : typ === 'matris' ? ', det som oftast ingår i rekryteringstest.' : '.'
        }`;
    const knapp: Handling = { ...h0.knapp, etikett: h0.knapp.las ? LAS_CHIP.premium : paborjad ? ETIKETT.fortsatt : ETIKETT.gorNivakollen };
    const d: DagensTraning = {
      slag: 'nivakoll',
      typ,
      eyebrow: forsta ? 'Första steget · Nivåkollen' : 'Dagens träning',
      forstaSteget: forsta,
      rubrik,
      text,
      knapp: { ...knapp, href: hintHrefV(h0) },
      hint: hintRef(h0),
      sidorad: paborjad ? 'Svaren sparas mellan gångerna.' : 'Sedan börjar träningen på din nivå.',
      chips: forsta && o ? [{ text: `${o.uppgifter} uppgifter` }, { text: 'Nivå på skalan 1 till 10' }] : chipsFor(inp),
      stort: null,
      kortRad: null,
    };
    d.stort = stortTal(inp, forsta, typ);
    d.kortRad = kortRad(inp, d);
    return d;
  }

  const typ = dagensTyp(inp);
  const meny = inp.menyer[typ];
  const kort = inp.typer.find((t) => t.id === typ);
  const hint = h0 && h0.testtyp === typ ? h0 : null;
  let d: DagensTraning;

  if (!g.premium && meny && kort?.niva.status !== 'matt' && meny.nivakoll && !meny.nivakoll.las) {
    // Gratis och typen inte mätt: Nivåkollen, gratis en gång.
    const o = nivakollOmfang(typ);
    d = {
      slag: 'nivakoll',
      typ,
      eyebrow: 'Dagens träning',
      forstaSteget: false,
      rubrik: o ? `Mät din nivå på ${ord(o.minuter)} minuter` : 'Mät din nivå',
      text: `${o ? `${versal(ord(o.uppgifter))} uppgifter i ${typNamnSmall(typ)}` : typNamn(typ)}. Nivåkollen ingår gratis en gång.`,
      knapp: { ...meny.nivakoll, etikett: ETIKETT.gorNivakollen },
      hint: null,
      sidorad: 'Sedan börjar träningen på din nivå.',
      chips: chipsFor(inp),
      stort: null,
      kortRad: null,
    };
  } else if (!g.premium && meny && g.grundKvarIdag > 0) {
    // Gratis: dagens grundnivåtest.
    const grund = meny.nivaer.find((n) => n.zon === 'grund')!;
    d = {
      slag: 'niva_test',
      typ,
      eyebrow: 'Dagens träning',
      forstaSteget: false,
      rubrik: `Grundnivån i ${typNamnSmall(typ)}`,
      text: `${NIVA_TEST_ANTAL[typ].grund} uppgifter på en fast nivå, resultat i procent. Ett grundnivåtest om dagen ingår gratis.`,
      knapp: { ...grund, etikett: 'Starta dagens test' },
      hint: null,
      sidorad: serieRad(inp),
      chips: chipsFor(inp),
      stort: null,
      kortRad: null,
    };
  } else {
    // Träna. Utan Premium står låset kvar och knappen leder till menyn, som visar det.
    const trana: Handling = meny?.trana ?? { slag: 'trana', etikett: ETIKETT.trana, href: menyHref(typ), las: null };
    d = {
      slag: 'trana',
      typ,
      eyebrow: 'Dagens träning',
      forstaSteget: false,
      rubrik: `Tio minuter ${typNamnSmall(typ)}`,
      text: tranaText(inp, typ, kort),
      knapp: { slag: 'trana', etikett: trana.las ? LAS_CHIP.premium : 'Starta dagens träning', href: trana.href, las: trana.las },
      hint: hintRef(hint),
      sidorad: !g.premium && g.grundKvarIdag === 0 ? 'Dagens grundnivåtest är gjort. Ett nytt i morgon.' : serieRad(inp),
      chips: chipsFor(inp),
      stort: null,
      kortRad: null,
    };
  }
  d.knapp = { ...d.knapp, href: handlingHref(d.knapp, typ) };
  d.stort = stortTal(inp, false, typ);
  d.kortRad = kortRad(inp, d);
  return d;
}

/** Väggens bana: högst åtta noder, flaggan sist. */
export function byggVaggBana(inp: Pick<VagenIn, 'idag' | 'plan' | 'bana' | 'aktivaDagar' | 'dagsmal'>): VaggNod[] {
  const { idag, plan } = inp;
  const aktiva = new Set(inp.aktivaDagar);
  if (plan) {
    const bakat: VaggNod[] = [];
    for (const n of [2, 1]) {
      const d = laggTill(idag, -n);
      if (plan.planStart <= d || aktiva.has(d)) bakat.push({ dag: d, status: aktiva.has(d) ? 'gjord' : 'missad' });
    }
    const fram: VaggNod[] = [];
    const prov = plan.provdatum && plan.provdatum > idag ? plan.provdatum : null;
    const fritt = VAGG_PLATSER - bakat.length - 2;
    for (let i = 1; i <= fritt; i++) {
      const d = laggTill(idag, i);
      if (prov && d >= prov) break;
      const b = inp.bana.find((x) => x.dag === d);
      fram.push({ dag: d, status: 'kommande', ...(b?.forslag ? { forslag: b.forslag } : {}) });
    }
    const flagga: VaggNod = prov ? { dag: prov, status: 'prov' } : { dag: laggTill(idag, fritt + 1), status: 'prov_okand' };
    const idagNod: VaggNod = { dag: idag, status: plan.provdatum === idag ? 'prov' : 'idag' };
    return plan.provdatum === idag ? [...bakat, idagNod] : [...bakat, idagNod, ...fram, flagga];
  }
  // Utan plan: dagarna i rad bakåt, högst tre.
  const bakat: VaggNod[] = [];
  for (let n = 1; n <= 3; n++) {
    const d = laggTill(idag, -n);
    if (!aktiva.has(d)) break;
    bakat.unshift({ dag: d, status: 'gjord' });
  }
  const fritt = VAGG_PLATSER - bakat.length - 2;
  const fram: VaggNod[] = [];
  for (let i = 1; i <= fritt; i++) fram.push({ dag: laggTill(idag, i), status: 'kommande' });
  return [...bakat, { dag: idag, status: 'idag' }, ...fram, { dag: laggTill(idag, fritt + 1), status: 'prov_okand' }];
}

/** Ett hintkort i vägen: kort rubrik, hintens skäl. */
function hintKort(h: Hint): Pick<VagDag, 'ikon' | 'rubrik' | 'text'> {
  switch (h.typ) {
    case 'svagt_monster':
      return { ikon: 'monster', rubrik: h.rubrik.replace(/^Träna på /, 'Öva på '), text: h.skal };
    case 'tempo':
      return { ikon: 'klocka', rubrik: 'Träna mot klockan', text: h.skal };
    case 'nivakoll_igen':
    case 'nivakoll_saknas':
    case 'nivakoll_paborjad':
    case 'prova_nytt':
    case 'forsta_steg':
      return { ikon: 'kurva', rubrik: h.rubrik, text: h.skal };
    default:
      return { ikon: 'stjarna', rubrik: h.rubrik, text: h.skal };
  }
}

export function byggVagen(inp: VagenIn, dagens: DagensTraning): VagDag[] {
  const { idag, plan } = inp;
  // Den som inte har gjort något än får "Så här går det till" i stället.
  if (dagens.forstaSteget) return [];

  const ut: VagDag[] = [];
  const idagKort: VagDag = {
    dag: idag,
    slag: 'idag',
    ikon: dagens.slag === 'nivakoll' ? 'kurva' : 'spela',
    rubrik:
      dagens.slag === 'trana'
        ? `Träna ${typNamnSmall(dagens.typ)}`
        : dagens.slag === 'niva_test'
          ? `Grundnivån i ${typNamnSmall(dagens.typ)}`
          : dagens.rubrik === 'Gör klart Nivåkollen'
            ? 'Gör klart Nivåkollen'
            : `Nivåkollen i ${typNamnSmall(dagens.typ)}`,
    text:
      dagens.slag === 'trana'
        ? 'Tio minuter på din nivå, förklaring efter varje svar.'
        : dagens.slag === 'niva_test'
          ? `${NIVA_TEST_ANTAL[dagens.typ].grund} uppgifter, ingår gratis i dag.`
          : dagens.text,
    handling: dagens.knapp,
    href: dagens.knapp.href,
    hint: dagens.hint,
  };
  ut.push(idagKort);

  const prov = plan?.provdatum && plan.provdatum > idag ? plan.provdatum : null;
  const fram = prov ? Math.min(dagarMellan(idag, prov) - 1, VAGEN_MAX - 2) : VAGEN_MAX - 2;

  const anvanda = new Set<string>(dagens.hint ? [dagens.hint.id] : []);
  const hintar = inp.hintar.filter((h) => h.typ !== 'provet_nara' && h.typ !== 'forsta_steg');
  const tranaTyp = dagens.typ;
  const tranaH = inp.menyer[tranaTyp]?.trana;

  for (let i = 1; i <= fram; i++) {
    const d = laggTill(idag, i);
    const b = inp.bana.find((x) => x.dag === d);
    if (b?.forslag === 'ovningsprov' && plan?.ovningsprov) {
      const typ = plan.typer[0] ?? null;
      const h: Handling = (typ && inp.menyer[typ]?.ovningsprov[0]) || {
        slag: 'ovningsprov',
        etikett: ETIKETT.ovningsprov,
        href: plan.ovningsprov.href,
        las: inp.gratis.premium ? null : { skal: 'premium', chip: LAS_CHIP.premiumKort },
      };
      ut.push({ dag: d, slag: 'forslag', ikon: 'prov', rubrik: plan.ovningsprov.namn, text: `${plan.ovningsprov.meta}, som provet.`, handling: h, href: handlingHref(h, typ), hint: null });
      continue;
    }
    if (b?.forslag === 'nivakoll') {
      const typ = plan?.typer[0] ?? tranaTyp;
      const meny = inp.menyer[typ];
      const senaste = meny?.nivakoll.senaste ?? null;
      if (meny) {
        ut.push({
          dag: d,
          slag: 'forslag',
          ikon: 'kurva',
          rubrik: 'Nivåkollen',
          text: senaste ? `Senast ${kortDatumV(senaste.dag)}. Se om nivån har rört sig.` : `Mät din nivå i ${typNamnSmall(typ)}.`,
          handling: meny.nivakoll,
          href: handlingHref(meny.nivakoll, typ),
          hint: null,
        });
        // Hinten om samma Nivåkoll behövs inte en dag till.
        for (const h of hintar) if (h.typ === 'nivakoll_igen' && h.testtyp === typ) anvanda.add(h.id);
        continue;
      }
    }
    const h = hintar.find((x) => !anvanda.has(x.id));
    if (h) {
      anvanda.add(h.id);
      ut.push({ dag: d, slag: 'forslag', ...hintKort(h), handling: h.knapp, href: hintHrefV(h), hint: hintRef(h) });
      continue;
    }
    if (tranaH) {
      ut.push({
        dag: d,
        slag: 'forslag',
        ikon: 'spela',
        rubrik: `Träna ${typNamnSmall(tranaTyp)}`,
        text: 'Tio minuter på din nivå.',
        handling: tranaH,
        href: handlingHref(tranaH, tranaTyp),
        hint: null,
      });
    }
  }

  if (prov && plan) {
    ut.push({
      dag: prov,
      slag: 'prov',
      ikon: 'flagga',
      rubrik: 'Provet',
      text: plan.ovningsprov ? `${plan.namn}, ${plan.ovningsprov.meta}.` : `${plan.namn}.`,
      handling: null,
      href: null,
      hint: null,
    });
  } else if (plan && !plan.provdatum) {
    ut.push({ dag: null, slag: 'valfritt', ikon: 'flagga', rubrik: 'Lägg till provdatum', text: 'Datumet ger nedräkning och ett förslag per dag fram till provet.', handling: null, href: '/dashboard/tester/installningar?steg=3', hint: null });
  } else if (!plan) {
    ut.push({ dag: null, slag: 'valfritt', ikon: 'flagga', rubrik: 'Vet du vilket test du ska göra?', text: 'Välj, så framhäver vi det och föreslår vad du övar fram till provdagen.', handling: null, href: '/dashboard/tester/installningar', hint: null });
  }
  return ut;
}
