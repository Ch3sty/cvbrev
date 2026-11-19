// src/lib/tester/v4/rutter.ts
// Adresserna i v4, per testtyp. Bara befintliga sidor (planen 1.1): en ny
// adress under /dashboard/tester/ ger 404 i appen. Typens meny öppnas med
// ?typ= på Tester, grafen filtreras med ?typ= på Din utveckling.
//
// Ren, går att importera från klienten.

import { TRANING_RUTT, nivakollHref, ovningsprovHref, passHref, sessionHref, steg2PassHref, vnPassHref } from '@/lib/traning/rutter';
import type { TestTypId, Zon } from './typer';
import { NIVA_TEST_ANTAL } from './copy';

export const HEM_HREF = '/dashboard/tester';
export const TESTER_HREF = '/dashboard/tester/alla';
export const UTVECKLING_HREF = '/dashboard/tester/kurvan';
export const PLAN_HREF = '/dashboard/tester/installningar';
export const PROVDATUM_HREF = '/dashboard/tester/installningar?steg=3';
export const IPROV_HREF = '/dashboard/tester/iprov';
export const PERSONLIGHET_HREF = TRANING_RUTT.personlighet;

/** Typens meny på Tester. Fungerar i appen (/app/tester/alla). */
export function menyHref(typ: TestTypId): string {
  return `${TESTER_HREF}?typ=${typ}`;
}

/** Din utveckling med grafen filtrerad på typen. */
export function utvecklingHref(typ?: TestTypId | null): string {
  return typ ? `${UTVECKLING_HREF}?typ=${typ}` : UTVECKLING_HREF;
}

/** Träna i typen, med familj (mönster) ett riktat pass. */
export function tranaHref(typ: TestTypId, familj?: string | null): string {
  switch (typ) {
    case 'matris':
      return familj ? passHref('riktat', { family: familj }) : passHref('pass');
    case 'verbal':
    case 'numerisk':
      return vnPassHref(typ, familj);
    // Figur- och deduktivpassen tar ingen familj; motorn väljer det svagaste själv.
    case 'figurserie':
      return TRANING_RUTT.figurpass;
    case 'deduktiv':
      return TRANING_RUTT.deduktivpass;
    case 'talserie':
    case 'spatial':
    case 'ordforrad':
      return steg2PassHref(typ, familj);
  }
}

/**
 * Typerna där Nivåkollen finns i dag. Talserie, spatial och ordförråd får sin
 * i A7; till dess visar kortet omätt band och hinten pekar på grundnivån.
 */
export const NIVAKOLL_FINNS: Readonly<Record<TestTypId, boolean>> = {
  matris: true,
  figurserie: true,
  deduktiv: true,
  verbal: true,
  numerisk: true,
  talserie: false,
  spatial: false,
  ordforrad: false,
};

/** Nivåkollen i typen. Null där den inte finns än. */
export function nivakollHrefV4(typ: TestTypId): string | null {
  if (typ === 'matris') return passHref('matning');
  if (typ === 'figurserie' || typ === 'deduktiv' || typ === 'verbal' || typ === 'numerisk') return nivakollHref(typ);
  return NIVAKOLL_FINNS[typ] ? `/dashboard/tester/pass?typ=nivakoll&kind=${typ}` : null;
}

const SLUG_PREFIX: Readonly<Record<TestTypId, string>> = {
  matris: 'matrislogik',
  figurserie: 'figurserier',
  deduktiv: 'deduktiv',
  talserie: 'talserier',
  spatial: 'spatial',
  ordforrad: 'ordforrad',
  verbal: '',
  numerisk: '',
};

/** Sluggen för typens fasta nivåtest (testConfig.ts). */
export function nivaTestSlug(typ: TestTypId, zon: Zon): string {
  if (typ === 'verbal') return zon === 'grund' ? 'verbal-resonemang' : zon === 'avancerad' ? 'verbal-resonemang-v2' : 'verbal-resonemang-expert';
  if (typ === 'numerisk') return zon === 'grund' ? 'numeriskt-test' : zon === 'avancerad' ? 'numeriskt-test-v2' : 'numeriskt-test-expert';
  return `${SLUG_PREFIX[typ]}-${zon}`;
}

/** Startsidan för typens nivåtest ("Testa dig på en nivå"). */
export function nivaTestHref(typ: TestTypId, zon: Zon): string {
  return `/dashboard/tester/${nivaTestSlug(typ, zon)}`;
}

/** Övningsprovet mot klockan för typen. Null där typen saknar eget prov. */
export function ovningsprovHrefV4(typ: TestTypId): string | null {
  switch (typ) {
    case 'matris':
      return ovningsprovHref('logik');
    case 'verbal':
    case 'numerisk':
    case 'deduktiv':
      return ovningsprovHref(typ);
    case 'figurserie':
      return ovningsprovHref('figurer');
    default:
      return null;
  }
}

/** Genomgången av en slutförd session i passflödet. */
export function genomgangHref(sessionId: string): string {
  return sessionHref(sessionId);
}

/**
 * Raden för en omätt testtyp: Nivåkollen där den finns, annars nivåtestet på
 * grundnivå (talserier, spatial förmåga, ordförråd har ingen Nivåkoll).
 */
export function omattMeta(typ: TestTypId): string {
  return NIVAKOLL_FINNS[typ] ? 'Nivåkoll, 8 min' : `Nivåtest, ${NIVA_TEST_ANTAL[typ].grund} uppgifter`;
}
