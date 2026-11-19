// src/lib/tester/v4/gratis.ts
// Gratisläget (ägarens beslut 2026-11-19, omgång 7): ett grundnivåtest om
// dagen, valfri testtyp; Nivåkollen en gång per testtyp; genomgången alltid
// öppen. Premium: Träna, avancerad och expert, Nivåkollen när de vill,
// övningsprov, historik och kurva. Ren.
//
// Priset läses ur paketet och kampanjen, så att Black Week syns utan
// kodändring i vyerna.

import { kampanjPrisPeriod, premiumKnapp, type KampanjPrisInfo } from '@/lib/kampanj/kampanj';
import { paketNamn, prisPeriod, SALD_PLAN } from '@/lib/plans/plans';
import { nextMidnightStockholm } from '@/lib/quota/quotaService';
import { GRATISNIVA } from '@/lib/traning/gratisniva';
import { LAS_CHIP, META } from './copy';
import type { Gratislage, Handling, TestTypId } from './typer';

export function prisFor(kampanj: KampanjPrisInfo | null): Gratislage['pris'] {
  return {
    namn: paketNamn(SALD_PLAN),
    prisrad: kampanj ? kampanjPrisPeriod(kampanj) : prisPeriod(SALD_PLAN),
    knapp: premiumKnapp(kampanj),
  };
}

export function byggGratislage(args: {
  premium: boolean;
  harHistorik: boolean;
  /** Slutförda sessioner i dag som räknas mot grundnivåkvoten. */
  grundIdag: number;
  nivakollGjord: Partial<Record<TestTypId, boolean>>;
  kampanj: KampanjPrisInfo | null;
  nu?: Date;
}): Gratislage {
  const grans = GRATISNIVA.grundnivaTestPerDag;
  return {
    premium: args.premium,
    harHistorik: args.harHistorik,
    grundKvarIdag: args.premium ? grans : Math.max(0, grans - args.grundIdag),
    pafyllning: nextMidnightStockholm(args.nu ?? new Date()).toISOString(),
    nivakollGjord: args.nivakollGjord,
    pris: prisFor(args.kampanj),
  };
}

const PREMIUM = { skal: 'premium' as const, chip: LAS_CHIP.premium };

/** Låset på Träna: alltid Premium utan paket. */
export function lasTrana(g: Gratislage): Handling['las'] {
  return g.premium ? null : PREMIUM;
}

/** Låset och metan på ett nivåtest. Grund: kvoten; avancerad och expert: Premium. */
export function lasNivaTest(g: Gratislage, zon: 'grund' | 'avancerad' | 'expert'): Pick<Handling, 'las' | 'meta'> {
  if (g.premium) return { las: null };
  if (zon !== 'grund') return { las: PREMIUM };
  return g.grundKvarIdag > 0 ? { las: null, meta: META.kvarIdag } : { las: { skal: 'kvot', chip: LAS_CHIP.kvot } };
}

/** Nivåkollen: gratis en gång per testtyp, sedan Premium. */
export function lasNivakoll(g: Gratislage, typ: TestTypId): Pick<Handling, 'las' | 'meta'> {
  if (g.premium) return { las: null };
  return g.nivakollGjord[typ] ? { las: { skal: 'nivakoll_gjord', chip: LAS_CHIP.nivakollGjord } } : { las: null, meta: META.gratisEnGang };
}

/** Övningsprov: Premium. */
export function lasOvningsprov(g: Gratislage): Handling['las'] {
  return g.premium ? null : { skal: 'premium', chip: LAS_CHIP.premiumKort };
}
