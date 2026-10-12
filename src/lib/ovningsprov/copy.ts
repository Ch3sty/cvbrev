// src/lib/ovningsprov/copy.ts
// =============================================================================
// Texterna i övningsprovet mot klockan (Testerna v2, skiss 2 och 3,
// riktlinjerna 1.3, 1.4 och 5.1). Aldrig i JSX. Regler: vi-form, inga
// talstreck, "samma format som", aldrig "samma test", ordet "lätt" används
// inte om någon fråga, tal aldrig uppradade i löptext. Aldrig percentil,
// "godkänd" eller "du hade klarat".
// =============================================================================

import { paketKort, paketNamn, prisPeriod, SALD_PLAN, kopKnapp } from '@/lib/plans/plans';
import { talord, versal } from '@/lib/traning/copy';
import { antalTid, formatTitel, type Ovningsformat, type Provtyp } from './format';

export const TYP_NAMN: Record<Provtyp, string> = { logik: 'Logik', verbal: 'Verbalt', numerisk: 'Numeriskt', figurer: 'Figurserier' };
const TYP_GEMEN: Record<Provtyp, string> = { logik: 'logik', verbal: 'verbalt', numerisk: 'numeriskt', figurer: 'figurserier' };

/** Ordet för en uppgift i texterna. */
export const PUNKT_ORD: Record<Provtyp, { en: string; flera: string; best: string; bestFlera: string }> = {
  logik: { en: 'uppgift', flera: 'uppgifter', best: 'uppgiften', bestFlera: 'uppgifterna' },
  verbal: { en: 'påstående', flera: 'påståenden', best: 'påståendet', bestFlera: 'påståendena' },
  numerisk: { en: 'fråga', flera: 'frågor', best: 'frågan', bestFlera: 'frågorna' },
  figurer: { en: 'uppgift', flera: 'uppgifter', best: 'uppgiften', bestFlera: 'uppgifterna' },
};

export const START = {
  tillbaka: 'Tillbaka',
  brand: 'Övningsprov',
  rubrik: 'Övningsprov mot klockan',
  eyebrow: (typ: Provtyp, dagarKvar: number | null) =>
    dagarKvar === 1
      ? `${TYP_NAMN[typ]} · dagen före provet`
      : dagarKvar === 2
        ? `${TYP_NAMN[typ]} · två dagar före provet`
        : TYP_NAMN[typ],
  formatTitel: (f: Ovningsformat) => formatTitel(f),
  regler: [
    { titel: 'Klockan räknar ned', text: 'Provet lämnas in självt när tiden är ute.' },
    { titel: 'Ingen hjälp under tiden', text: 'Ingen regel, inget facit och ingen paus förrän efteråt.' },
    { titel: 'Obesvarade räknas som fel', text: 'Gissa hellre än att lämna tomt.' },
  ],
  reglerAria: 'Tre regler',
  efterLogik: 'Resultatet blir en punkt på kurvan med samma vikt som en nivåkoll. Genomgången med alla uppgifter kommer direkt efteråt.',
  efter: 'Genomgången med rätt svar och förklaring kommer direkt efteråt.',
  /** Figurserier (copy-omgang3 3.3). */
  efterFigurer: 'Genomgången med regeln och rätt svar vid varje uppgift visas direkt efteråt.',
  tvaFormer: 'Två sorters uppgifter: fortsätt raden, eller hitta figuren som bryter mönstret. Frågan står över varje uppgift.',
  knapp: 'Starta övningsprovet',
  startar: 'Startar provet',
  avbryt: 'Avbryter du sparas inget resultat.',
  /** Pågående prov i dag: samma knapp tar henne tillbaka dit. */
  fortsatt: 'Fortsätt provet',
  pagar: 'Ett övningsprov pågår. Klockan har gått sedan du startade.',
  gjortIdag: 'Dagens övningsprov är gjort.',
  gjortIdagText: 'Ett övningsprov per testtyp och dag. Genomgången finns kvar, och i morgon kan du göra ett nytt.',
  visaResultat: 'Visa resultatet',
  fel: 'Provet gick inte att starta. Försök igen.',
  betalvagg: {
    eyebrow: 'Ingår i Premium',
    text: (f: Ovningsformat, dagarKvar: number | null) =>
      [
        `Övningsprovet i ${f.namn ? `samma format som ${f.namn}` : 'vårt format'}, ${antalTid(f)}.`,
        dagarKvar != null && dagarKvar > 0 ? `${dagarKvar === 1 ? 'En dag' : `${dagarKvar} dagar`} till provet.` : null,
        'Månaden täcker hela vägen.',
      ]
        .filter(Boolean)
        .join(' '),
    prisrad: `${paketNamn(SALD_PLAN)}, ${prisPeriod(SALD_PLAN)}. Säg upp när du vill.`,
    knapp: kopKnapp(SALD_PLAN),
    lank: 'Till Alla tester',
  },
} as const;

export const FRAGA = {
  avbryt: 'Avbryt provet',
  titel: 'Övningsprov',
  undertitel: (f: Ovningsformat) =>
    f.namn
      ? `${f.namn.replace(/^SHL Verify (verbal|numerisk)$/, 'SHL Verify')}${/[sxz]$/.test(f.namn) ? '' : 's'} format`
      : f.delar
        ? `Vårt format, ${f.delar.antal} ${f.delar.ord}`
        : 'Vårt format',
  klockaAria: (sekunder: number, perUppgift: boolean) => {
    const m = Math.floor(sekunder / 60);
    const s = sekunder % 60;
    const tid = sekunder >= 120 ? `${Math.ceil(sekunder / 60)} minuter` : m > 0 ? `${m} minut${m === 1 ? '' : 'er'} och ${s} sekunder` : `${s} sekunder`;
    return `${tid} kvar${perUppgift ? ' på uppgiften' : ''}`;
  },
  stapelAria: (typ: Provtyp, nr: number, antal: number) => `${versal(PUNKT_ORD[typ].en)} ${nr} av ${antal}`,
  delMeta: (ord: 'texter' | 'underlag', nr: number, antal: number) => `${ord === 'texter' ? 'text' : 'underlag'} ${nr} av ${antal}`,
  punktMeta: (typ: Provtyp, nr: number) => `${PUNKT_ORD[typ].en} ${nr}`,
  hoppade: (typ: Provtyp, nr: number) => `${PUNKT_ORD[typ].en} ${nr} hoppade du över`,
  rakning: 'räknare tillåten',
  texten: 'Texten',
  underlaget: 'Underlaget',
  pastaendeRubrik: (i: number, av: number) => `Påstående ${i} av ${av} om texten`,
  fragaRubrik: (i: number, av: number) => `Fråga ${i} av ${av} om underlaget`,
  svar: { true: 'Sant', false: 'Falskt', cannot_say: 'Går inte att avgöra' } as Record<string, string>,
  svarAria: 'Svar',
  foregaende: 'Föregående',
  nasta: 'Nästa',
  lamnaIn: 'Lämna in',
  svaraVidare: 'Svara och gå vidare',
  sparfel: 'Svaret gick inte att spara. Det sparas när nätet är tillbaka.',
  tidenUte: 'Provets tid är ute. Vi lämnar in det du hann.',
  lamnar: 'Lämnar in provet',
  lamnaFel: 'Provet gick inte att lämna in. Försök igen, svaren är sparade.',
  forsokIgen: 'Försök igen',
} as const;

export const RESULTAT = {
  brand: (typ: Provtyp) => `Övningsprov, ${TYP_GEMEN[typ]}`,
  stang: 'Stäng',
  eyebrow: 'Övningsprovet klart',
  rubrik: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
  ringAria: (ratt: number, antal: number) => `${ratt} av ${antal} rätt, ${antal ? Math.round((ratt / antal) * 100) : 0} procent`,
  tid: (sekunder: number) => {
    const s = Math.max(0, Math.round(sekunder));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  },
  tidEtikett: (minuter: number) => `av ${minuter} min`,
  obesvaradeEtikett: 'obesvarade, räknade som fel',
  tidenRackte: 'Tiden räckte',
  allaBesvarade: (typ: Provtyp) => `alla ${PUNKT_ORD[typ].flera} besvarade`,
  /** Väggens mening för verbalt och numeriskt, utan nivå (ingen nivåskala finns för dem än). */
  mening: (obesvarade: number, andelBesvaradeRatt: number, svagast: string | null, typ?: Provtyp) => {
    if (obesvarade > 0) {
      return andelBesvaradeRatt >= 0.75
        ? typ === 'figurer'
          ? 'Tiden var det som fattades, inte mönstren. De obesvarade kostar lika mycket som ett fel, så gissa hellre nästa gång.'
          : 'Tiden var det som fattades, inte reglerna. De obesvarade kostar lika mycket som ett fel, så gissa hellre nästa gång.'
        : 'Både tiden och några av svaren drog ned. Genomgången visar vilka, och tempot under den var tiden tog slut.';
    }
    return svagast
      ? `Det som skiljer nu är ${svagast.toLowerCase()}. Missarna står i genomgången.`
      : 'Alla rätt inom tiden. Nästa steg är ett nytt övningsprov i morgon, på kortare tid.';
  },
  genomgang: {
    rub: 'Genomgång',
    titel: (n: number, typ: Provtyp) =>
      n === 0
        ? `Inga ${PUNKT_ORD[typ].flera} att titta på`
        : n === 1
          ? `${typ === 'verbal' ? 'Ett' : 'En'} ${PUNKT_ORD[typ].en} att titta på`
          : `${versal(talord(n))} ${PUNKT_ORD[typ].flera} att titta på`,
    text: (fel: number, obesvarade: number) =>
      obesvarade > 0 && fel > 0
        ? 'Fel och obesvarade, med rätt svar och förklaringen vid var och en.'
        : obesvarade > 0
          ? 'De obesvarade, med rätt svar och förklaringen vid var och en.'
          : 'Rätt svar och förklaringen vid var och en.',
    knapp: (n: number, typ: Provtyp) =>
      n === 1 ? `Gå igenom ${PUNKT_ORD[typ].best}` : `Gå igenom de ${talord(n)} ${PUNKT_ORD[typ].bestFlera}`,
    dolj: 'Dölj genomgången',
    obesvarad: 'Obesvarad',
    ditt: (svar: string) => `Ditt svar: ${svar}`,
    ratt: (svar: string) => `Rätt: ${svar}`,
    punkt: (typ: Provtyp, delNr: number, iDel: number, ord: 'texter' | 'underlag') =>
      typ === 'figurer' ? `Uppgift ${delNr}` : `${ord === 'texter' ? 'Text' : 'Underlag'} ${delNr}, ${PUNKT_ORD[typ].en} ${iDel}`,
    bryterEtikett: 'Bryter mönstret',
    regel: 'Regeln',
  },
  tappade: {
    rub: 'Var du tappade i provet',
    titel: (n: number) => (n <= 1 ? 'En sak bar de flesta missarna' : 'Två saker bar de flesta missarna'),
    meta: (ratt: number, antal: number) => `${ratt} av ${antal}`,
  },
  tempo: {
    rub: 'Tempo mot provets tid',
    titel: (over: number, antal: number, ord: string) =>
      over === 0 ? `Alla ${ord} inom provets tid` : `${versal(talord(over))} av ${talord(antal)} ${ord} över provets tid`,
    text: (budget: number, enhet: string) => `Provet ger ${budget} sekunder per ${enhet}.`,
    axelStart: (ord: string) => `${ord} 1`,
    axelMitt: 'streckad linje: provets tid',
    axelSlut: (ord: string, n: number) => `${ord} ${n}`,
    aria: (budget: number) => `Tid per del mot provets tid, ${budget} sekunder. Ihåliga staplar: fel eller obesvarade.`,
  },
  status: {
    imorgonProv: 'I morgon är det provet. Tre uppvärmningsfrågor på morgonen, inget mer.',
    imorgonPass: 'I morgon: dagens pass, nio uppgifter.',
    minPlan: 'Min plan',
  },
  tillbaka: 'Tillbaka till Rekryteringstester',
  allaTester: 'Till Alla tester',
} as const;

export { paketKort };
