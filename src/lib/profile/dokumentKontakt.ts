/**
 * Kontaktuppgifter i CV och brev (2026-10-10): namn, telefon, e-post och ort.
 *
 * Samma regel som e-posten (dokumentEpost.ts) gäller nu för alla fyra:
 *
 *  - Brev: profilens värden. Namnet ur full_name, telefonen och orten bara
 *    när användaren valt att visa dem i brev (include_*_in_letters), e-posten
 *    ur dokumentEpost().
 *  - CV med strukturerad data (CV-byggaren, LinkedIn-importen, tolkade CV:n):
 *    det som står i CV:t vinner. Profilens värde används bara när fältet är
 *    tomt eller en platshållare ([NAMN], "Ditt namn", 070-123 45 67 och så
 *    vidare). Profilen skrev tidigare över namn, telefon och ort i varje PDF.
 *  - CV som bara finns som text: profilen vinner som förut, eftersom det
 *    tolkade namnet ur en löptext är en gissning och inte ett val.
 *
 * När profilens värden ändras flyttar /api/profile/contact med dem in i de
 * CV:n där fältet fortfarande har det gamla profilvärdet (alltså kom från
 * förifyllningen). Ett värde användaren själv skrivit annorlunda i CV:t
 * lämnas orört.
 *
 * Inget av det här skickas till AI-modellen: brevhuvudet sätts på efter
 * modellanropet, och CV-text maskas i src/lib/privacy/pii.ts med både
 * profilens och CV:ts namn och telefonnummer (se letters/generate).
 */

import { arTomEllerPlatshallare, dokumentEpost, epostForCv } from './dokumentEpost';

export const NAMN_MAX = 120;
export const TELEFON_MAX = 32;
export const ORT_MAX = 64;

export type ProfilKontakt = {
  full_name?: string | null;
  phone?: string | null;
  location?: string | null;
  email?: string | null;
  contact_email?: string | null;
  include_phone_in_letters?: boolean | null;
  include_location_in_letters?: boolean | null;
} | null | undefined;

type Anvandare = { email?: string | null } | null | undefined;

/* ------------------------------------------------------------------ */
/* Platshållare                                                         */
/* ------------------------------------------------------------------ */

/** Exempelnamn som förifyllningar, mallar och importer har satt. */
export const NAMN_PLATSHALLARE: readonly string[] = [
  'ditt namn',
  'ditt för- och efternamn',
  'för- och efternamn',
  'förnamn efternamn',
  'namn efternamn',
  'namn saknas',
  'namn',
  'your name',
  'full name',
  'name',
  'användare',
];

/** Exempelnummer, jämförda som bara siffror. */
export const TELEFON_PLATSHALLARE: readonly string[] = [
  '0701234567',
  '0700000000',
  '0123456789',
  '0712345678',
];

/** Exempelorter. */
export const ORT_PLATSHALLARE: readonly string[] = ['ort', 'din ort', 'stad', 'city'];

function arHakparentes(t: string): boolean {
  return /^\[.*\]$/.test(t);
}

export function arPlatshallareNamn(v: string | null | undefined): boolean {
  const t = (v ?? '').trim();
  if (!t) return true;
  if (arHakparentes(t)) return true;
  return NAMN_PLATSHALLARE.includes(t.toLowerCase());
}

function siffror(v: string): string {
  return v.replace(/^\s*\+46\s*(\(0\))?/, '0').replace(/\D/g, '');
}

export function arPlatshallareTelefon(v: string | null | undefined): boolean {
  const t = (v ?? '').trim();
  if (!t) return true;
  if (arHakparentes(t)) return true;
  const s = siffror(t);
  if (s.length < 6) return true;
  return TELEFON_PLATSHALLARE.includes(s);
}

export function arPlatshallareOrt(v: string | null | undefined): boolean {
  const t = (v ?? '').trim();
  if (!t) return true;
  if (arHakparentes(t)) return true;
  return ORT_PLATSHALLARE.includes(t.toLowerCase());
}

/** Yrkestiteln som LinkedIn-importen satte när den saknades. */
export function arPlatshallareTitel(v: string | null | undefined): boolean {
  const t = (v ?? '').trim().toLowerCase();
  return t === 'professionell titel' || t === 'din titel' || /^\[.*\]$/.test(t);
}

/** Samma telefonnummer oavsett mellanslag, bindestreck och +46. */
export function sammaTelefon(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = siffror(a ?? '');
  const y = siffror(b ?? '');
  return x.length > 0 && x === y;
}

/** Samma text oavsett skiftläge och mellanslag runt om. */
export function sammaText(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = (a ?? '').trim().toLowerCase();
  const y = (b ?? '').trim().toLowerCase();
  return x.length > 0 && x === y;
}

/* ------------------------------------------------------------------ */
/* CV                                                                   */
/* ------------------------------------------------------------------ */

export type CvKontakt = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  location?: string | null;
};

export type KontaktForCv = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

/**
 * Vilka kontaktuppgifter ett CV ska visa.
 *
 * kalla 'strukturerad': det som står i CV:t vinner, profilen fyller tomma
 * fält och platshållare. kalla 'text': profilen vinner när den har ett värde
 * (CV:t tolkades ur löptext, namnet där är en gissning).
 */
export function kontaktForCv(
  cv: CvKontakt | null | undefined,
  profile: ProfilKontakt,
  user?: Anvandare,
  kalla: 'strukturerad' | 'text' = 'strukturerad'
): KontaktForCv {
  const p = profile ?? {};
  const cvNamn = (cv?.fullName ?? '').trim();
  const cvTel = (cv?.phone ?? '').trim();
  const cvOrt = ((cv?.address ?? '') || (cv?.location ?? '')).trim();
  const profNamn = (p.full_name ?? '').trim();
  const profTel = (p.phone ?? '').trim();
  const profOrt = (p.location ?? '').trim();

  const valj = (cvVarde: string, profVarde: string, platshallare: (v: string) => boolean) => {
    if (kalla === 'text') return profVarde || (platshallare(cvVarde) ? '' : cvVarde);
    if (platshallare(cvVarde)) return profVarde;
    return cvVarde;
  };

  return {
    fullName: valj(cvNamn, profNamn, arPlatshallareNamn),
    email: epostForCv(cv?.email ?? '', profile, user),
    phone: valj(cvTel, profTel, arPlatshallareTelefon),
    address: valj(cvOrt, profOrt, arPlatshallareOrt),
  };
}

/**
 * Skriver kontaktuppgifter i ett CV:s structured_data. Klarar båda schemana
 * (CVMetadata med personalInfo, och det äldre ParsedCV med name och
 * contact). Fält som inte skickas med lämnas orörda. Returnerar null när
 * strukturen inte går att känna igen.
 */
export function sattKontaktIStrukturerad(
  data: unknown,
  patch: { fullName?: string; email?: string; phone?: string | null; address?: string | null }
): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, any>;

  if (obj.personalInfo && typeof obj.personalInfo === 'object') {
    const pi = { ...obj.personalInfo };
    if (patch.fullName !== undefined) pi.fullName = patch.fullName;
    if (patch.email !== undefined) pi.email = patch.email;
    if (patch.phone !== undefined) pi.phone = patch.phone ?? '';
    if (patch.address !== undefined) {
      pi.address = patch.address ?? '';
      if ('location' in pi) pi.location = patch.address ?? '';
    }
    return { ...obj, personalInfo: pi };
  }

  if (Array.isArray(obj.roles) && (typeof obj.name === 'string' || typeof obj.profile === 'string')) {
    const contact = { ...(obj.contact ?? {}) };
    if (patch.email !== undefined) contact.email = patch.email;
    if (patch.phone !== undefined) contact.phone = patch.phone ?? '';
    if (patch.address !== undefined) contact.address = patch.address ?? '';
    const ut: Record<string, unknown> = { ...obj, contact };
    if (patch.fullName !== undefined) ut.name = patch.fullName;
    return ut;
  }

  return null;
}

/** Läser kontaktfälten ur structured_data i något av de två schemana. */
export function lasKontaktIStrukturerad(data: unknown): CvKontakt | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, any>;
  if (obj.personalInfo && typeof obj.personalInfo === 'object') {
    const pi = obj.personalInfo;
    return {
      fullName: typeof pi.fullName === 'string' ? pi.fullName : '',
      email: typeof pi.email === 'string' ? pi.email : '',
      phone: typeof pi.phone === 'string' ? pi.phone : '',
      address: typeof pi.address === 'string' ? pi.address : typeof pi.location === 'string' ? pi.location : '',
    };
  }
  if (Array.isArray(obj.roles) && (typeof obj.name === 'string' || typeof obj.profile === 'string')) {
    const c = obj.contact ?? {};
    return {
      fullName: typeof obj.name === 'string' ? obj.name : '',
      email: typeof c.email === 'string' ? c.email : '',
      phone: typeof c.phone === 'string' ? c.phone : '',
      address: typeof c.address === 'string' ? c.address : '',
    };
  }
  return null;
}

/**
 * Allt vi vet om namn och telefon inför maskningen före ett AI-anrop:
 * profilens värden och CV:ts egna, som kan skilja sig sedan CV:t vinner i
 * dokumenten. Skickas som MaskOptions till guardCvTextForModel.
 */
export function kandaUppgifterForMaskning(
  profile: ProfilKontakt,
  structuredData?: unknown
): { fullName: string | null; extraNames: string[]; knownPhones: string[] } {
  const cv = lasKontaktIStrukturerad(structuredData);
  const profilNamn = (profile?.full_name ?? '').trim();
  const cvNamn = (cv?.fullName ?? '').trim();
  return {
    fullName: profilNamn || null,
    extraNames: cvNamn && !arPlatshallareNamn(cvNamn) && !sammaText(cvNamn, profilNamn) ? [cvNamn] : [],
    knownPhones: [profile?.phone, cv?.phone].filter(
      (t): t is string => typeof t === 'string' && !arPlatshallareTelefon(t)
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Brev                                                                 */
/* ------------------------------------------------------------------ */

export type KontaktIBrev = {
  namn: string;
  epost: string;
  /** Tom sträng betyder att raden inte ska stå i brevet. */
  telefon: string;
  /** Tom sträng betyder att raden inte ska stå i brevet. */
  ort: string;
};

/** Det som står i brevhuvudet och avslutningen enligt profilen. */
export function kontaktIBrev(profile: ProfilKontakt, user?: Anvandare): KontaktIBrev {
  const p = profile ?? {};
  return {
    namn: (p.full_name ?? '').trim(),
    epost: dokumentEpost(profile, user),
    telefon: p.include_phone_in_letters && p.phone ? p.phone.trim() : '',
    ort: p.include_location_in_letters && p.location ? p.location.trim() : '',
  };
}

const EPOST_I_TEXT = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

function escHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escRe(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textAv(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Ett telefonnummer som står ensamt i ett element eller ett fält i en |-rad. */
function arTelefonText(t: string): boolean {
  const s = t.trim();
  if (!/^\+?[\d\s\-()]{6,}$/.test(s)) return false;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; // datum
  return s.replace(/\D/g, '').length >= 7;
}

/** Textbitarna utanför taggar, delade på " | " som kompaktmallens kontaktrad. */
function textbitar(html: string): string[] {
  const ut: string[] = [];
  const re = />([^<]+)</g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    for (const del of m[1].split(' | ')) {
      const t = del.trim();
      if (t) ut.push(t);
    }
  }
  return ut;
}

/** Byter ett helt textvärde (mellan taggar eller i en |-rad) mot ett annat. */
function bytVarde(html: string, gammal: string, ny: string): string {
  // ", " efter värdet: mallen med ort framför datumet ("Malmö, 10 oktober 2026,").
  const re = new RegExp(`(>\\s*|\\| )${escRe(gammal)}(?=\\s*<| \\||, )`, 'g');
  return html.replace(re, `$1${ny}`);
}

/** Tar bort ett värde: hela <p> när det står ensamt, annars fältet i |-raden. */
function taBortVarde(html: string, gammal: string): string {
  const g = escRe(gammal);
  let ut = html.replace(new RegExp(`[ \\t]*<p[^>]*>\\s*${g}\\s*</p>\\s*\\n?`, 'g'), '');
  ut = ut.replace(new RegExp(` \\| ${g}(?=\\s*<| \\|)`, 'g'), '');
  ut = ut.replace(new RegExp(`(>\\s*)${g} \\| `, 'g'), '$1');
  return ut;
}

/**
 * Lägger in en ny rad (telefon eller ort) där kontaktuppgifterna står: före
 * e-postens <p>, eller efter e-posten i kompaktmallens |-rad. Returnerar null
 * om det inte fanns någon e-post att gå efter.
 */
function laggTillVarde(html: string, ny: string): string | null {
  const re = /(<p([^>]*)>)([^<]*)(<\/p>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[3];
    EPOST_I_TEXT.lastIndex = 0;
    const epost = text.match(EPOST_I_TEXT);
    if (!epost) continue;
    if (text.includes(' | ')) {
      const nyText = text.replace(epost[0], `${epost[0]} | ${ny}`);
      return html.slice(0, m.index) + m[1] + nyText + m[4] + html.slice(m.index + m[0].length);
    }
    const attrs = /email/i.test(m[2]) ? '' : m[2];
    const radStart = html.lastIndexOf('\n', m.index) + 1;
    const indrag = /^[ \t]*$/.test(html.slice(radStart, m.index)) ? html.slice(radStart, m.index) : '';
    return html.slice(0, m.index) + `<p${attrs}>${ny}</p>\n${indrag}` + html.slice(m.index);
  }
  return null;
}

/**
 * Byter kontaktuppgifterna i ett färdigt brevs huvud och avslutning. Brevets
 * kropp (div.body-content) och <head> lämnas orörda, så en adress eller ett
 * namn användaren själv skrivit i texten står kvar.
 *
 * Utan `gammal` letas de gamla värdena upp i brevet: namnet i underskriften,
 * telefonnumret som det enda nummerlika värdet, e-posten med mönster. Orten
 * går inte att känna igen säkert och byts bara när det gamla värdet är känt
 * (förhandsvisningen i brevflödet vet det, en sparad PDF gör det inte).
 */
export function bytKontaktIBrev(
  html: string,
  ny: Partial<KontaktIBrev>,
  gammal?: Partial<KontaktIBrev>
): string {
  if (!html) return html;
  const bodyStart = html.search(/<body[\s>]/i);
  const start = bodyStart >= 0 ? bodyStart : 0;
  const huvud = html.slice(0, start);
  const kropp = html.slice(start);
  const m = kropp.match(/<div class="body-content">[\s\S]*?<\/div>/);

  const epostNy = ny.epost ? escHtml(ny.epost) : '';
  const bytEpost = (s: string) => (epostNy ? s.replace(EPOST_I_TEXT, epostNy) : s);

  // Äldre mallar utan body-content: bara e-posten, som förut.
  if (!m || m.index === undefined) return huvud + bytEpost(kropp);

  let fore = kropp.slice(0, m.index);
  let efter = kropp.slice(m.index + m[0].length);
  const bada = (f: (s: string) => string) => {
    fore = f(fore);
    efter = f(efter);
  };

  // Namnet: underskriften är den säkra källan.
  if (ny.namn !== undefined && ny.namn.trim()) {
    const sig = efter.match(/<div class="signature">\s*<p[^>]*>([\s\S]*?)<\/p>/);
    const gammaltNamn = gammal?.namn ? escHtml(gammal.namn.trim()) : sig ? textAv(sig[1]) : '';
    const nyttNamn = escHtml(ny.namn.trim());
    if (gammaltNamn && gammaltNamn !== nyttNamn) bada((s) => bytVarde(s, gammaltNamn, nyttNamn));
  }

  // Telefon och ort: byt, ta bort eller lägg till en rad.
  const valfri = (falt: 'telefon' | 'ort', hitta: () => string) => {
    if (ny[falt] === undefined) return;
    const nyttVarde = escHtml((ny[falt] ?? '').trim());
    const gammaltVarde = gammal && gammal[falt] !== undefined ? escHtml((gammal[falt] ?? '').trim()) : hitta();
    if (gammaltVarde && nyttVarde) {
      if (gammaltVarde !== nyttVarde) bada((s) => bytVarde(s, gammaltVarde, nyttVarde));
    } else if (gammaltVarde && !nyttVarde) {
      bada((s) => taBortVarde(s, gammaltVarde));
    } else if (!gammaltVarde && nyttVarde) {
      const iFore = laggTillVarde(fore, nyttVarde);
      if (iFore !== null) fore = iFore;
      else {
        const iEfter = laggTillVarde(efter, nyttVarde);
        if (iEfter !== null) efter = iEfter;
      }
    }
  };
  valfri('telefon', () => textbitar(fore + efter).find(arTelefonText) ?? '');
  valfri('ort', () => '');

  return huvud + bytEpost(fore) + m[0] + bytEpost(efter);
}
