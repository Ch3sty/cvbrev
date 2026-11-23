/**
 * Läget för kampanjmejlen på Mejl-sidan: före start, pågår eller slut, och
 * meningen som säger det. Rena funktioner utan serverberoenden, så att sidan,
 * klientkortet och testerna kan använda dem.
 *
 * Klockan är kampanjNu() på servern och kampanjens egna fält i
 * lib/kampanj/kampanj.ts. Mejlet skickas av morgonkörningen
 * (cron/pricing-sync, 06.00 UTC, alltså 07.00 svensk vintertid) på
 * kampanjens första dag.
 */

import { aktivKampanj, svenskDag, type Kampanj, type KampanjNyckel } from '@/lib/kampanj/kampanj';

export type KampanjLage = 'fore' | 'pagar' | 'slut';

/** Talen från kampanjMottagare, samma källa som admin-rutten. */
export interface KampanjTal {
  kvar: number;
  skickade: number;
}

/** Det klientkortet behöver om en kampanj. Serialiserbart. */
export interface KampanjRuta {
  nyckel: KampanjNyckel;
  namn: string;
  lage: KampanjLage;
  /** "23 nov kl. 07.00" */
  utskicksdag: string;
  /** Meningen om läget, i klartext. */
  lageText: string;
  /** Null när urvalet inte gick att läsa. */
  tal: KampanjTal | null;
}

/** Utskicksdagen kl. 07.00 svensk tid som ISO, för tidKort. */
export function sjuSvenskTid(dag: string): string {
  // Vintertid är UTC+1 och sommartid UTC+2: prova båda och ta den som blir 07.
  for (const utc of ['06', '05']) {
    const iso = `${dag}T${utc}:00:00Z`;
    const tim = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', hour: '2-digit', hour12: false }).format(new Date(iso));
    if (Number(tim) === 7) return iso;
  }
  return `${dag}T06:00:00Z`;
}

/** Kampanjens utskick: startdagen kl. 07.00 svensk tid, som ISO. */
export function kampanjUtskick(k: Pick<Kampanj, 'start'>): string {
  return sjuSvenskTid(svenskDag(new Date(Date.parse(k.start))));
}

/** "måndag 30 november", svensk tid. */
export function langDag(iso: string | number): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}

/** "07.00", svensk tid. */
function klocka(iso: string | number): string {
  const delar = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
  const tim = delar.find((d) => d.type === 'hour')?.value ?? '00';
  const min = delar.find((d) => d.type === 'minute')?.value ?? '00';
  return `${tim}.${min}`;
}

export function kampanjLage(k: Kampanj, nu: Date): KampanjLage {
  if (aktivKampanj(nu)?.nyckel === k.nyckel) return 'pagar';
  return nu.getTime() < Date.parse(k.start) ? 'fore' : 'slut';
}

/**
 * Meningen om läget:
 *   före   "Går ut av sig självt måndag 30 november kl. 07.00."
 *   pågår  "Pågår. Mejlet gick ut med morgonkörningen måndag 23 november
 *          kl. 07.00, och priset gäller till och med söndag 29 november 23.59."
 *   slut   "Slutade söndag 29 november kl. 23.59. Inget mer skickas."
 */
export function kampanjLageText(k: Kampanj, nu: Date): string {
  const lage = kampanjLage(k, nu);
  const utskick = kampanjUtskick(k);
  if (lage === 'fore') {
    return `Går ut av sig självt ${langDag(utskick)} kl. ${klocka(utskick)}.`;
  }
  if (lage === 'pagar') {
    const priset = `priset gäller ${k.giltigTill}`;
    if (nu.getTime() < Date.parse(utskick)) {
      return `Pågår. Mejlet går ut av sig självt i dag kl. ${klocka(utskick)}, och ${priset}.`;
    }
    return `Pågår. Mejlet gick ut med morgonkörningen ${langDag(utskick)} kl. ${klocka(utskick)}, och ${priset}.`;
  }
  // slut är exklusivt: sista minuten är en minut före.
  const sista = Date.parse(k.slut) - 60_000;
  return `Slutade ${langDag(sista)} kl. ${klocka(sista)}. Inget mer skickas.`;
}

/** "Skicka till de 99 som återstår", och för en: "Skicka till den som återstår". */
export function skickaKnapp(kvar: number): string {
  return kvar === 1 ? 'Skicka till den som återstår' : `Skicka till de ${kvar.toLocaleString('sv-SE')} som återstår`;
}

/** "Ja, skicka 99 mejl nu" */
export function bekraftaKnapp(kvar: number): string {
  return `Ja, skicka ${kvar.toLocaleString('sv-SE')} mejl nu`;
}

/** "99 mejl skickade, inga misslyckades." */
export function resultatText(skickade: number, misslyckade: number): string {
  const fel = misslyckade === 0 ? 'inga misslyckades' : `${misslyckade.toLocaleString('sv-SE')} misslyckades`;
  return `${skickade.toLocaleString('sv-SE')} mejl skickade, ${fel}.`;
}
