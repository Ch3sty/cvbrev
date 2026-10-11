// src/lib/traning/pass-copy.ts
// =============================================================================
// Texterna i passflödet och resultatskärmarna, våg 3b av Rummen (P1 till P4,
// S1, M1, O1, K1 och provdagens uppvärmning). Spec-rummen avsnitt 8: aldrig
// i JSX. Utkasten är art-directors ur konceptet (koncept-testvy-2026-10-10)
// med testansvarigs rättelser (spec 12, 14, 15, 17) och gäller tills
// svensk-ux-copywriter ersatt dem (avsnitt 9, våg 3b).
//
// Regler: vi-form, svenska facktermer, inga tankstreck, "samma format som",
// aldrig "samma test", aldrig "poäng" i Rekryteringstester (spec 6 våg 4
// acceptans 2). Regeltexterna i passet kommer ur banken (rule, misstag),
// aldrig härifrån. Paketnamn och pris ur PLANS (paketNamn, paketMedPris),
// bytet till Premium sker i våg 5.
// =============================================================================

import { paketKort } from '@/lib/plans/plans';
import { talord, versal } from './copy';

/** Nivån med en decimal och komma: 5,6. */
export function nivaText(niva: number): string {
  return (Math.round(niva * 10) / 10).toFixed(1).replace('.', ',');
}

/** Heltalet i huvudet och i M1 (spec 14.1: heltalet stort, decimalen på kurvan). */
export function nivaHeltal(niva: number): number {
  return Math.floor(niva + 1e-9);
}

/** Förflyttningen med tecken: +0,2, 0,0, -0,1 (minus som U+2212). */
export function deltaText(delta: number): string {
  const d = Math.round(delta * 10) / 10;
  if (d > 0) return `+${nivaText(d)}`;
  if (d < 0) return `−${nivaText(-d)}`;
  return nivaText(0);
}

/** Sekunder som 0:38, 1:08. */
export function mmss(sekunder: number): string {
  const s = Math.max(0, Math.floor(sekunder));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** "Fråga 4 och 7", "Fråga 2, 4 och 7". */
export function fragorText(nummer: readonly number[]): string {
  if (nummer.length === 0) return '';
  if (nummer.length === 1) return `Fråga ${nummer[0]}`;
  return `Fråga ${nummer.slice(0, -1).join(', ')} och ${nummer[nummer.length - 1]}`;
}

const MANADER = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
const MANADER_KORT = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
const VECKODAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

function delar(dag: string): { d: number; m: number; vd: number } {
  const [y, m, d] = dag.split('-').map(Number);
  return { d, m: m - 1, vd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "24 oktober". */
export function datumLangt(dag: string): string {
  const { d, m } = delar(dag);
  return `${d} ${MANADER[m]}`;
}

/** "24 okt". */
export function datumKort(dag: string): string {
  const { d, m } = delar(dag);
  return `${d} ${MANADER_KORT[m]}`;
}

/** "tisdag 13 oktober" (veckodag gemen, spec avsnitt 8). */
export function datumMedVeckodag(dag: string): string {
  const { d, m, vd } = delar(dag);
  return `${VECKODAGAR[vd]} ${d} ${MANADER[m]}`;
}

/** "13 och 20 okt", "13 okt och 2 nov", "7 okt". */
export function datumLista(dagar: readonly string[]): string {
  if (dagar.length === 0) return '';
  if (dagar.length === 1) return datumKort(dagar[0]);
  const m = new Set(dagar.map((d) => delar(d).m));
  if (m.size === 1) {
    const siffror = dagar.map((d) => String(delar(d).d));
    return `${siffror.slice(0, -1).join(', ')} och ${siffror[siffror.length - 1]} ${MANADER_KORT[delar(dagar[0]).m]}`;
  }
  const t = dagar.map(datumKort);
  return `${t.slice(0, -1).join(', ')} och ${t[t.length - 1]}`;
}

/** Serieraden före "I morgon": "Fem dagar i rad." */
export function serieText(dagar: number, status: 'pagar' | 'pausad' | 'bruten' | 'ingen'): string {
  if (status === 'bruten' || status === 'ingen' || dagar <= 0) return 'Serien börjar om i dag.';
  if (status === 'pausad') return 'Serien pausar, inget bryts.';
  if (dagar === 1) return 'Serien har börjat.';
  return `${versal(talord(dagar))} dagar i rad.`;
}

/**
 * Nivåmeningen i M1, per heltal (testansvarig 19.2 fråga 3). Nivån räknas
 * på rätt och fel, tempot är ett eget tal, så meningen säger vad hon klarar.
 * Kalibrerad mot priorerna (klass 1 till 4 ger nivå 2,35, 3,7, 5,05 och 6,4
 * där chansen är hälften). 8 till 10 nås inte före BANK_KALIBRERAD_OVER_7_5
 * men ska finnas.
 */
const NIVAMENING: Record<number, string> = {
  1: 'Du står längst ner på skalan. Uppgifter med en regel i taget är inom räckhåll, och det är där passen börjar.',
  2: 'Du klarar en del av de enklaste uppgifterna, de med en regel i taget. Passen börjar där.',
  3: 'Du klarar de flesta uppgifter med en regel i taget. Två regler samtidigt går oftast fel än.',
  4: 'Du klarar uppgifter med en regel i taget. Två regler samtidigt, som rotation med byte, går oftast fel än.',
  5: 'Du klarar de flesta uppgifter på grundnivå. Två regler samtidigt, som rotation med byte, går ungefär varannan gång.',
  6: 'Du klarar grundnivån, och oftare rätt än fel när två regler ska följas samtidigt. De svåraste uppgifterna går ungefär varannan gång.',
  7: 'Du klarar de flesta uppgifter, också de med två regler samtidigt. De svåraste, med tre saker att följa, går oftare rätt än fel.',
  8: 'Du klarar nästan allt, också de svåraste uppgifterna. Det som skiljer nu är tempot.',
  9: 'Du klarar nästan alla uppgifter, också de svåraste. Det som finns kvar att träna är tempot under provets tid.',
  10: 'Du klarar hela skalan. Det som finns kvar att träna är tempot under provets tid.',
};

export const PASS_COPY = {
  topp: {
    avsluta: 'Avsluta passet',
    stang: 'Stäng',
    passRad: (heltal: number | null) => (heltal == null ? 'Dagens pass' : `Dagens pass · nivå ${heltal}`),
    passGrundRad: 'Dagens pass · grundnivå',
    riktatRad: (heltal: number | null) => (heltal == null ? 'Riktat pass' : `Riktat pass · nivå ${heltal}`),
    blandat: 'Blandade mönster',
    matning: 'Nivåmätningen',
    matningRad: 'Tolv uppgifter, svårare efter rätt svar',
    /** Spec 14.5: "fråga 1 av 7, fem räknas från smakprovet". */
    matningSmakprov: (n: number) => `${versal(talord(n, 'en'))} räknas från smakprovet`,
    ommatning: 'Veckans ommätning',
    ommatningRad: 'Tolv uppgifter, tyngre punkt på kurvan',
    general: 'Generalrepetition',
    generalRad: (namn: string | null) => (namn ? `Samma format som ${namn}` : 'Vårt provläge'),
    uppvarmning: 'Uppvärmning',
    uppvarmningRad: 'Ingen tid, ingen nivå, inget sparas',
  },
  tid: {
    aria: 'Tid på frågan mot provets tid',
    provetsTid: (budget: number) => `provets tid ${mmss(budget)}`,
  },
  fraga: {
    text: 'Vilken figur passar i den tomma rutan?',
    alternativ: 'Svarsalternativ',
    alternativAria: (bokstav: string) => `Alternativ ${bokstav}`,
    matrisAria: 'Rutnät tre gånger tre, nedre högra rutan saknas',
    matrisAriaRatt: 'Rutnätet med rätt figur i den tomma rutan',
    vald: 'ditt svar',
    ratt: 'rätt svar',
  },
  vetInte: 'Vet inte, visa regeln',
  regel: {
    fel: (s: number) => `Inte den här · ${s} s`,
    ratt: (s: number) => `Rätt · ${s} s`,
    vetInte: (s: number) => `Vet inte · ${s} s`,
    tidenUte: (s: number) => `Tiden tog slut · ${s} s`,
    /* Raden efter regeln (19.2 fråga 1): bandet ur urvalet och tiden mot provets. */
    strackRatt: 'Sträckuppgift över din nivå, klarad inom provets tid.',
    strackRattOverTid: 'Sträckuppgift över din nivå. Rätt, men över provets tid.',
    rattOverTid: 'Rätt, men över provets tid. Tempot räknas i resultatet.',
    strackFel: 'Sträckuppgift över din nivå.',
  },
  knapp: {
    nasta: 'Nästa fråga',
    visaResultat: 'Visa resultatet',
    sparar: 'Sparar svaret',
    raknar: 'Räknar fram resultatet',
    forsokIgen: 'Försök igen',
    tillbaka: 'Tillbaka till Rekryteringstester',
    visaKurvan: 'Visa kurvan',
    genomga: (n: number) => (n === 1 ? 'Gå igenom missen' : `Gå igenom de ${talord(n)} missarna`),
    genomgaAlla: 'Gå igenom alla frågor',
    visaKvittot: 'Visa kvittot',
    startaPass: 'Starta dagens pass',
  },
  fel: {
    hamta: 'Passet gick inte att hämta.',
    hamtaRad: 'Försök igen. Din nivå och dina pass är sparade, ingenting försvann.',
    svar: 'Svaret gick inte att spara. Inget är förlorat, försök igen.',
    avslut: 'Resultatet gick inte att räkna fram. Svaren är sparade, försök igen.',
    tidenUte: 'Provets tid tog slut. Svaren du hann ge är sparade.',
    kvot: 'Dagens grundpass är gjort.',
    kvotRad: 'Nästa grundpass i morgon.',
    familj: 'Den familjen har inte tillräckligt många uppgifter än.',
    familjRad: 'Välj ett annat riktat pass, eller gör dagens pass.',
  },
  laddar: {
    session: 'Hämtar passet',
    resultat: 'Räknar fram resultatet',
  },
  /* -------------------------------- Resultaten ------------------------------- */
  resultat: {
    sparat: {
      pass: 'Dagens pass · sparat',
      riktat: 'Riktat pass · sparat',
      matning: 'Nivåmätningen · sparad',
      ommatning: 'Ommätning · sparad',
      general: 'Generalrepetition · sparad',
    },
    passKlart: 'Passet klart',
    riktatKlart: 'Riktat pass klart',
    generalKlar: 'Generalrepetitionen klar',
    ringKlar: 'Dagens pass gjort',
    /** P4: "7 av 9 rätt. Nivån steg till 5,6." */
    rubrikUpp: (ratt: number, antal: number, niva: number) => `${ratt} av ${antal} rätt. Nivån steg till ${nivaText(niva)}.`,
    /** S1: "5 av 9 rätt. Nivån 5,1, ner en tiondel." */
    rubrikNer: (ratt: number, antal: number, niva: number, delta: number) =>
      `${ratt} av ${antal} rätt. Nivån ${nivaText(niva)}, ner ${tiondelar(delta)}.`,
    rubrikStill: (ratt: number, antal: number, niva: number) => `${ratt} av ${antal} rätt. Nivån står kvar på ${nivaText(niva)}.`,
    rubrikUtanNiva: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    riktatRad: 'Riktade pass räknas i familjen, inte i nivån.',
    tal: {
      ratt: 'rätt',
      nivaFran: (fore: number) => `nivå, från ${nivaText(fore)}`,
      overTid: 'över provets tid',
      snitt: (budget: number) => `snitt, provet ger ${budget}`,
      sekunder: (s: number) => `${s} s`,
      av: (a: number, b: number) => `${a} av ${b}`,
    },
    /**
     * P4 s3 (19.2 fråga 4): "Rotation med byte: fem av sex rätt i dag, mot
     * två av tre förra gången." Jämförelsen är senaste sessionen där
     * familjen hade minst två frågor, "i mätningen" när det var mätningen.
     */
    familjIdag: (ratt: number, antal: number, familj: string, forra: { ratt: number; antal: number; matning: boolean } | null) =>
      `${versal(familj)}: ${talord(ratt)} av ${talord(antal)} rätt i dag${
        forra ? `, mot ${talord(forra.ratt)} av ${talord(forra.antal)} ${forra.matning ? 'i mätningen' : 'förra gången'}` : ''
      }.`,
    /** Generalrepetitionen (19.2 fråga 8): formatet i stället för familjen. */
    generalMening: (format: string) => `${format}. Punkten väger som en ommätning på kurvan.`,
    passFlyttar: (ommatningDag: string | null) =>
      ommatningDag ? `Pass flyttar nivån lite i taget, ommätningen på ${ommatningDag} mer.` : 'Pass flyttar nivån lite i taget, ommätningen mer.',
    /** S1 (19.2 fråga 5): villkorad på missarna som var sträckuppgifter över nivån. */
    sjonk: (overMissar: number) =>
      overMissar >= 2
        ? `${versal(talord(overMissar))} av missarna var sträckuppgifter över din nivå. De räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass.`
        : overMissar === 1
          ? 'En av missarna var en sträckuppgift över din nivå. Den räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass.'
          : 'En dag säger lite. Nivån rör sig högst 0,5 per pass, och genomgången säger mer än talet.',
    grundpass: 'Grundpassen flyttar sällan nivån när du redan är över 4.',
    tempo: {
      eyebrow: 'Tempo',
      over: (fragor: string) => `${fragor} tog över provets tid`,
      inga: 'Alla frågor inom provets tid',
      snitt: (snitt: number, budget: number) => `Snitt ${snitt} s, provet ger ${budget}.`,
      gaIgenom: 'Gå igenom dem först.',
      /** Används inte längre i kortet (19.2 fråga 7); copywritern städar. */
      naraNivan: 'Tempot mäts på frågor nära din nivå. De säkra räknas inte.',
      axelStart: 'fråga 1',
      axelMitt: 'streckad linje: provets tid',
      /** S1: fel svar ritas ihåliga (20.3 punkt 4). */
      axelFel: 'ihåliga staplar: fel svar',
      axelSlut: (n: number) => `fråga ${n}`,
      aria: (budget: number) => `Tid per fråga. Streckad linje: provets tid, ${budget} sekunder.`,
    },
    vadHande: {
      eyebrow: 'Vad som hände',
      titel: (fel: number, iFamilj: number) =>
        iFamilj > 1
          ? `${versal(talord(fel, 'en'))} ${fel === 1 ? 'miss' : 'missar'}, ${talord(iFamilj)} i samma familj`
          : fel === 1
            ? 'En miss'
            : `${versal(talord(fel, 'en'))} missar, ingen familj sticker ut`,
      /** Efter familjens beskrivning (19.2 fråga 5). */
      familjOvas: 'Familjen går att öva med riktade pass.',
      ingenFamilj: 'Gå igenom dem, regeln och misstaget står på varje.',
    },
    genomgang: {
      rubrik: 'Genomgången',
      fel: (n: number) => `Fråga ${n}, fel`,
      vetInte: (n: number) => `Fråga ${n}, vet inte`,
      tidenUte: (n: number) => `Fråga ${n}, tiden tog slut`,
      sekunder: (s: number) => `${s} s.`,
      visa: 'Visa',
      allaRatt: (n: number) => (n === 1 ? 'En rätt' : `${versal(talord(n))} rätt`),
      allaRattMeta: 'Regel och förklaring finns på alla.',
    },
    milstolpe: {
      eyebrow: 'Milstolpe nådd',
    },
  },
  matning: {
    eyebrow: 'Din nivå',
    av10: 'av 10',
    mening: (heltal: number) => NIVAMENING[Math.min(10, Math.max(1, heltal))],
    familjerFel: (n: number) =>
      n === 1 ? 'En familj drar ner mest, den står under Var du tappar.' : 'Två familjer drar ner mest, de står under Var du tappar.',
    skalaAria: (niva: number, sikte: number | null) =>
      `Nivåskala 1 till 10. Du: ${nivaText(niva)}.${sikte != null ? ` Föreslaget sikte: ${nivaText(sikte)}.` : ''}`,
    siktetMening: (dagar: number | null) =>
      dagar != null && dagar > 0
        ? `Siktet är vårt förslag för ${dagar} dagars träning i det här formatet. Det är ditt mål, inte arbetsgivarens krav, och du kan ändra det.`
        : 'Siktet är vårt förslag för en veckas träning. Det är ditt mål, inte arbetsgivarens krav, och du kan ändra det.',
    ratt: (ratt: number, antal: number) => `${ratt} av ${antal}`,
    varDuTappar: 'Var du tappar',
    familjMeta: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    langsam: (familj: string) => `Rätt men långsamma: ${familj.toLowerCase()}`,
    langsamMeta: (over: number, antal: number) => `${over} av ${antal} över provets tid. Tempot tränas med egna pass.`,
    ingaFamiljer: 'Inga familjer där du tappar i mätningen. Passen börjar på din nivå.',
    plan: {
      rubrik: (prov: string | null, dagar: number | null) =>
        prov && dagar != null ? `Planen till ${datumLangt(prov)} · ${dagar} dagar` : 'Planen, en vecka framåt',
      idag: 'I dag: mätningen',
      idagMeta: 'Klar. Första punkten på kurvan.',
      klart: 'Klart',
      grundIdag: 'I dag: ett grundpass',
      grundIdagMeta: 'Nio uppgifter, cirka tio minuter. Gratis i dag.',
      gratis: 'Gratis',
      passNiva: (fran: string) => `${fran} och varje dag: passet på din nivå`,
      passNivaMeta: (familj: string | null, heltal: number) =>
        familj ? `Riktat mot ${familj.toLowerCase()}, nivå ${heltal}.` : `Nio uppgifter nära nivå ${heltal}.`,
      ommatning: (dagar: string) => `${dagar}: ommätning`,
      ommatningMeta: 'Åtta minuter, tyngre punkt på kurvan.',
      general: (dagar: string) => `${dagar}: generalrepetition`,
      generalMeta: (format: string) => format,
      prov: (dag: string) => `${dag}: provdagen`,
      provMeta: 'Tre uppvärmningsfrågor, inget mer.',
    },
    betalvagg: {
      rubrik: (dagar: number | null) =>
        dagar != null && dagar > 0 ? `${dagar} dagar kvar. Månaden täcker hela vägen.` : 'Passen på din nivå, varje dag.',
      /** 19.4 punkt 1: "samma format som" när leverantören är känd. */
      text: (formatNamn: string | null) =>
        `Passen på din nivå, riktade pass, ommätning var sjunde dag, hela kurvan och generalrepetitionen ${
          formatNamn ? `i samma format som ${formatNamn}` : 'i vårt provläge'
        }. Plus personliga brev, Jobbcoachen och matchade jobb.`,
      grundpassLank: 'Gör dagens grundpass gratis',
    },
  },
  ommatning: {
    eyebrow: 'Veckans ommätning',
    /** O1: "5,8. Passen hade räknat dig till 5,7." */
    rubrik: (niva: number, fore: number | null) =>
      fore == null || Math.abs(fore - niva) < 0.05
        ? `${nivaText(niva)}. Samma nivå som passen räknat fram.`
        : `${nivaText(niva)}. Passen hade räknat dig till ${nivaText(fore)}.`,
    skalaAria: (forsta: { dag: string; niva: number } | null, niva: number, sikte: number | null) =>
      `Nivåskala.${forsta ? ` Mätningen ${datumLangt(forsta.dag)} ${nivaText(forsta.niva)},` : ''} nu ${nivaText(niva)}.${sikte != null ? ` Sikte ${nivaText(sikte)}.` : ''}`,
    franEtikett: (dag: string, niva: number) => `${datumKort(dag)} ${nivaText(niva)}`,
    delta: 'sedan mätningen',
    deltaVecka: 'på en vecka',
    kurvaRubrik: 'Kurvan med den nya punkten',
    /** O1 utan milstolpe: "Var du tappar nu" (art-director 20.2 fråga 8). */
    varDuTapparNu: 'Var du tappar nu',
    /** "mot 2 av 4 den 6 okt" (19.5 fråga 5). */
    familjMot: (ratt: number, antal: number, r: number, a: number, dag: string) => `${ratt} av ${antal} rätt, mot ${r} av ${a} den ${dag}.`,
    /** Ingen familj nådde tröskeln: det ackumulerade (19.5 fråga 5). */
    familjHittills: (ratt: number, antal: number) => `${ratt} av ${antal} rätt hittills.`,
    nastaOmmatning: (dag: string) => `Nästa ommätning ${datumMedVeckodag(dag)}.`,
  },
  kvitto: {
    eyebrow: (dag: string) => `Milstolpe · ${datumMedVeckodag(dag)}`,
    tillbaka: 'Tillbaka till Rekryteringstester',
    markeAria: (namn: string) => `Märket ${namn}`,
    /** Meningar per märke. Första veckan har två varianter i copy.ts (spec 14.3). */
    forsta_matningen: (niva: number) => `Din första punkt på kurvan, nivå ${nivaText(niva)}. Varje pass och varje ommätning bygger vidare på den.`,
    nivan_upp: (fran: number, till: number) => `Från ${nivaText(fran)} i mätningen till ${nivaText(till)}. Första hela nivån över där du började.`,
    generalrepetitionen: 'Första generalrepetitionen gjord, i provets format och på provets tid.',
    provdagen: 'Provdagen är passerad. Kurvan står kvar, och nästa datum sätter du när du vill.',
    nivaGick: (fran: number, till: number) => `Nivån gick från ${nivaText(fran)} till ${nivaText(till)}.`,
    nastaMarke: (namn: string, vid: number | null) => (vid != null ? `Nästa märke: ${namn}, vid ${nivaText(vid)}.` : `Nästa märke: ${namn}.`),
  },
  genomgangVy: {
    titel: 'Genomgången',
    rad: (nr: number, antal: number) => `Fråga ${nr} av ${antal}`,
    nasta: 'Nästa',
    tillResultatet: 'Tillbaka till resultatet',
    foregaende: 'Föregående',
    fortsattRatta: (n: number) => (n === 1 ? 'Fortsätt med den rätta' : `Fortsätt med de ${talord(n)} rätta`),
  },
  uppvarmning: {
    ratt: 'Rätt',
    fel: 'Inte den här',
    nasta: 'Nästa fråga',
    klarKnapp: 'Klar',
    klar: 'Uppvärmningen är klar',
    klarText: 'Inget sparades, och inget mer behövs i dag. Stäng det här och öppna länken från rekryteraren när du är redo.',
  },
  betalvagg: {
    pass: 'Dagens pass ingår i',
    riktat: 'Riktade pass ingår i',
    general: 'Generalrepetitionen ingår i',
    ommatning: 'Ommätningen ingår i',
    text: `Resultat och genomgång av det du redan gjort är alltid dina, med eller utan ${paketKort()}.`,
  },
} as const;

/** "en tiondel", "två tiondelar". */
function tiondelar(delta: number): string {
  const n = Math.round(Math.abs(delta) * 10);
  return n === 1 ? 'en tiondel' : `${talord(n)} tiondelar`;
}
