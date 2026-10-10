// src/lib/traning/imorgon.ts
// =============================================================================
// "I morgon"-raden efter ett pass (granskningen 3.1 punkt 6, spec 3b.6):
// - Nästa dag är ett pass: "I morgon: samma familj en nivå upp" när passet
//   gick bra (minst två tredjedelar rätt), annars "I morgon: ny familj".
// - Nästa dag är vila: veckodagen tar över. "Söndag är vilodag. Måndag: samma
//   familj en nivå upp." (lördagsexemplet i P4).
// - Nästa dag är ommätning: veckodagen i stället för "I morgon":
//   "Tisdag: ommätning, 8 minuter."
// - Generalrepetition och provdagen: "I morgon: generalrepetition",
//   "I morgon: provet. Tre uppvärmningsfrågor, inget mer."
// Utan plan (ingen mätning) står "I morgon: nästa grundpass".
// =============================================================================

import { laggTill, veckodagNamn, type Dag } from './datum';
import { TRANING_COPY, versal } from './copy';
import { planTyp, type PlanTyp } from './plan';

export type Nasta = 'familj_upp' | 'ny_familj';

export interface Imorgon {
  typ: PlanTyp;
  /** Dagen raden handlar om (första dagen som inte är vila). */
  dag: Dag;
  /** Vad nästa pass gör, när nästa aktivitet är ett pass. */
  nasta: Nasta | null;
  text: string;
}

/** Gick passet bra nog för "samma familj en nivå upp"? */
export function nastaForPass(ratt: number, antal: number): Nasta {
  return antal > 0 && ratt / antal >= 2 / 3 ? 'familj_upp' : 'ny_familj';
}

export function imorgonRad(inp: {
  idag: Dag;
  /** Mätningens dag; null utan mätning. */
  start: Dag | null;
  prov?: Dag | null;
  /** Utfallet av passet som just gjordes. */
  ratt: number;
  antal: number;
  /** Utan paket är nästa pass ett grundpass. */
  grundpass?: boolean;
}): Imorgon {
  const imorgon = laggTill(inp.idag, 1);
  const nasta = nastaForPass(inp.ratt, inp.antal);
  const passText = inp.grundpass
    ? TRANING_COPY.imorgon.grundpass
    : nasta === 'familj_upp'
      ? TRANING_COPY.imorgon.familjUpp
      : TRANING_COPY.imorgon.nyFamilj;

  if (!inp.start) {
    return { typ: 'pass', dag: imorgon, nasta, text: `I morgon: ${TRANING_COPY.imorgon.grundpass}` };
  }

  const typ = planTyp(imorgon, inp.start, inp.prov && inp.prov >= inp.start ? inp.prov : null);
  const aktivitet = (t: PlanTyp): string =>
    t === 'ommatning'
      ? TRANING_COPY.imorgon.ommatning
      : t === 'general'
        ? TRANING_COPY.imorgon.general
        : t === 'prov'
          ? TRANING_COPY.imorgon.prov
          : passText;

  if (typ === 'vila') {
    let dag = laggTill(imorgon, 1);
    let t = planTyp(dag, inp.start, inp.prov ?? null);
    // Två vilodagar i rad finns inte i planen, men räkna säkert.
    for (let i = 0; i < 6 && t === 'vila'; i++) {
      dag = laggTill(dag, 1);
      t = planTyp(dag, inp.start, inp.prov ?? null);
    }
    return {
      typ: 'vila',
      dag,
      nasta: t === 'pass' ? nasta : null,
      text: `${TRANING_COPY.imorgon.vila(veckodagNamn(imorgon))} ${versal(veckodagNamn(dag))}: ${aktivitet(t)}.`.replace(/\.\.$/, '.'),
    };
  }

  if (typ === 'ommatning') {
    return { typ, dag: imorgon, nasta: null, text: `${versal(veckodagNamn(imorgon))}: ${aktivitet(typ)}.` };
  }

  return { typ, dag: imorgon, nasta: typ === 'pass' ? nasta : null, text: `I morgon: ${aktivitet(typ)}` };
}
