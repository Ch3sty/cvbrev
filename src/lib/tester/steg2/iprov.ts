// src/lib/tester/steg2/iprov.ts
// =============================================================================
// Övningsprovet för I-prov 2025 (brief-tester-steg2 avsnitt 5, skissen fliken
// I-prov-provet): sex deltester i provets ordning, maxtid per deltest, ingen
// väg tillbaka till ett avslutat deltest. Halva provet är förval (skissens
// beslut 9). Resultatet är antal rätt per deltest, aldrig stanine.
//
// Antal och tider är våra: ordningen är belagd, Pliktverket publicerar inte
// antal och tider. Rena typer, konstanter och texter.
// =============================================================================

export const IPROV_TEST_TYPE = 'iprov-prov';

export type IprovDelKind = 'ordforrad' | 'spatial' | 'talserie';

export interface IprovDelDef {
  nr: number;
  namn: string;
  /** Kort namn i resultatets staplar ("Vikning med klipp"). */
  kort: string;
  kind: IprovDelKind;
  /** ordforrad: synonym eller antonym. spatial: B, Bklipp eller C. */
  form: 'synonym' | 'antonym' | 'B' | 'Bklipp' | 'C' | 'talpar';
  antal: number;
  minuter: number;
  /** Mellanbladets rad om uppgiftens form. */
  beskrivning: string;
}

/** Hela provet: 72 uppgifter på 58 minuter (briefen 5.1). */
export const IPROV_DELAR: readonly IprovDelDef[] = [
  { nr: 1, namn: 'Synonymer', kort: 'Synonymer', kind: 'ordforrad', form: 'synonym', antal: 12, minuter: 6, beskrivning: 'Ett ord i versaler, fem alternativ. Välj ordet som betyder ungefär detsamma.' },
  { nr: 2, namn: 'Pappersvikning', kort: 'Pappersvikning', kind: 'spatial', form: 'B', antal: 12, minuter: 10, beskrivning: 'Arket viks och stansas. Välj hur det ser ut när det viks upp.' },
  { nr: 3, namn: 'Talserier', kort: 'Talserier', kind: 'talserie', form: 'talpar', antal: 12, minuter: 12, beskrivning: 'Två tomma rutor sist i varje rad, du väljer talparet i rätt ordning.' },
  { nr: 4, namn: 'Motsatsord', kort: 'Motsatsord', kind: 'ordforrad', form: 'antonym', antal: 12, minuter: 6, beskrivning: 'Ett ord i versaler, fem alternativ. Välj ordet som betyder motsatsen.' },
  { nr: 5, namn: 'Tärningar', kort: 'Tärningar', kind: 'spatial', form: 'C', antal: 12, minuter: 12, beskrivning: 'En tärning och fyra till. Välj den som kan vara samma tärning sedd från ett annat håll.' },
  { nr: 6, namn: 'Pappersvikning med klipp', kort: 'Vikning med klipp', kind: 'spatial', form: 'Bklipp', antal: 12, minuter: 12, beskrivning: 'Arket viks, stansas och klipps. Välj hur det ser ut uppvikt.' },
];

/** Halva provet: sex uppgifter per deltest och halva tiden, avrundad uppåt (skissen: 29 minuter). */
export function iprovDelar(halvt: boolean): IprovDelDef[] {
  return IPROV_DELAR.map((d) => (halvt ? { ...d, antal: d.antal / 2, minuter: Math.ceil(d.minuter / 2) } : { ...d }));
}

export function iprovSumma(halvt: boolean): { antal: number; minuter: number } {
  const d = iprovDelar(halvt);
  return { antal: d.reduce((s, x) => s + x.antal, 0), minuter: d.reduce((s, x) => s + x.minuter, 0) };
}

/** Ett deltest i sessionen, som klienten ser det. */
export interface IprovDelVy {
  nr: number;
  namn: string;
  kort: string;
  kind: IprovDelKind;
  max_s: number;
  /** Uppgifterna utan facit, i visad ordning, med nyckel. */
  uppgifter: ({ nyckel: string } & Record<string, unknown>)[];
  startad: string | null;
  avslutad: string | null;
  /** Visade svar per nyckel. */
  svar: Record<string, number>;
}

export interface IprovDelResultat {
  nr: number;
  namn: string;
  kort: string;
  ratt: number;
  antal: number;
  tid_s: number;
  max_s: number;
  tidenSlut: boolean;
}

export interface IprovVy {
  id: string;
  halvt: boolean;
  variant: string | null;
  skapad: string;
  avslutad: boolean;
  delar: IprovDelVy[];
  resultat: { ratt: number; antal: number; delar: IprovDelResultat[] } | null;
  /** Genomgången per deltest efter avslutat prov. */
  genomgang: unknown[][] | null;
}

export const IPROV_COPY = {
  titel: 'I-prov-provet',
  startRubrik: 'Övningsprovet',
  eyebrow: (dagar: number | null) => (dagar != null && dagar > 0 ? `I-prov 2025, ${dagar === 1 ? '1 dag' : `${dagar} dagar`} kvar` : 'I-prov 2025'),
  format: 'Samma deltester i samma ordning som I-prov 2025',
  formatRad: 'Pliktverket publicerar inte antal och tider, så de här är våra.',
  halvt: 'Halva provet',
  helt: 'Hela provet',
  valRad: (antal: number, minuter: number) => `${antal} uppgifter, ${minuter} min`,
  delRad: (antal: number, minuter: number) => `${antal} på ${minuter} min`,
  regelStark: 'Du kan inte gå tillbaka till ett avslutat deltest.',
  regel: 'Inom ett deltest kan du hoppa och ändra. Provet lämnas in när sista deltestet är klart.',
  regelLast: 'Provet lämnas in när sista deltestet är klart.',
  starta: 'Starta övningsprovet',
  mellanEyebrow: (nr: number, av: number) => `Deltest ${nr} av ${av}`,
  mellanAntal: (antal: number, minuter: number) => `${antal} uppgifter på högst ${minuter} minuter.`,
  mellanKlara: (namn: string[]) =>
    namn.length === 0 ? 'Klockan startar när du trycker.' : `${namn.join(' och ')} ${namn.length === 1 ? 'är klart och går' : 'är klara och går'} inte att öppna igen. Klockan startar när du trycker.`,
  startaDel: 'Starta deltestet',
  foregaende: 'Föregående',
  nasta: 'Nästa',
  avslutaDel: 'Avsluta deltestet',
  avslutaDelFraga: 'Avsluta deltestet?',
  avslutaDelText: (obesvarade: number) =>
    `${obesvarade === 0 ? 'Alla uppgifter är besvarade.' : `${obesvarade} ${obesvarade === 1 ? 'uppgift är obesvarad' : 'uppgifter är obesvarade'}.`} Du kan inte gå tillbaka till deltestet efteråt.`,
  tillbakaTillDel: 'Tillbaka till deltestet',
  tidenSlut: 'Tiden för deltestet tog slut.',
  resultatEyebrow: (halvt: boolean, datum: string) => `${halvt ? 'Halva provet' : 'Hela provet'}, ${datum}`,
  resultatRubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
  tappar: 'Var du tappar',
  riktat: 'Riktat pass, sex uppgifter',
  stanine: (variant: string | null) => {
    const krav = variant === 'varnplikt' ? 'Värnplikten kräver minst 3' : variant === 'officer' ? 'Officersprogrammet kräver minst 6' : 'Polisen kräver minst 4';
    return `${krav} på I-provets niogradiga skala. Den räknas mot Pliktverkets normgrupp och går inte att härleda ur ett övningsprov.`;
  },
  tidRubrik: 'Tid per deltest',
  tidRad: 'Mot maxtiden',
  tidFot: 'Strecket är maxtiden. Koppar betyder att tiden tog slut.',
  genomga: 'Gå igenom, deltest för deltest',
  tillbaka: 'Tillbaka till Min plan',
  genomgangRubrik: 'Genomgång',
  delUtfall: (ratt: number, antal: number, slut: boolean) => `${ratt} av ${antal} rätt${slut ? ', tiden tog slut' : ''}`,
  last: (paket: string, pris: string) => `Övningsprovet ingår i ${paket}, ${pris}. Säg upp när du vill.`,
} as const;
