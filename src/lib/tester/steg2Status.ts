// src/lib/tester/steg2Status.ts
// =============================================================================
// Vilka av testplanens steg 2-typer som syns för användare. En testtyp blir
// synlig först när både motorn (src/lib/<typ>V1, motoragentens) och vyn är
// klara och klicktestade. Flaggan sätts till true i samma commit som vyn
// klicktestats. NEXT_PUBLIC_STEG2_QA=1 visar allt som finns lokalt, för
// klicktest före den commiten. Ren fil, går att importera från klienten.
// =============================================================================

export type Steg2Typ = 'talserie' | 'spatial' | 'ordforrad';

/** Sätts per typ när motor och vy är klara och klicktestade. */
export const VY_KLAR: Record<Steg2Typ, boolean> = {
  talserie: false,
  spatial: false,
  ordforrad: false,
};

/** I-prov-provet (provpaketet): kräver alla tre typerna och sin egen vy. */
export const IPROV_PROV_KLART = false;

const qa = () => process.env.NEXT_PUBLIC_STEG2_QA === '1';

export function steg2Synlig(t: Steg2Typ): boolean {
  return VY_KLAR[t] || qa();
}

export function iprovProvSynligt(): boolean {
  return IPROV_PROV_KLART || qa();
}

/** Valet Polisen eller Försvarsmakten syns när minst en av I-provets typer finns. */
export function iprovValSynligt(): boolean {
  return steg2Synlig('talserie') || steg2Synlig('spatial') || steg2Synlig('ordforrad');
}
