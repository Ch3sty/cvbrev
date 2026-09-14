/**
 * Formatering for Anvandare.
 *
 * Talen skrivs alltid med svenska tusentalsavgransare och renderas i
 * tabular-nums, sa kolumner star i linje nedat. Datum skrivs kort och
 * relativt: en admin som skummar en lista pa 50 rader laser "3 dagar sedan"
 * snabbare an ett ISO-datum, men behover det exakta i title-attributet.
 */

/** Ett antal, till exempel 1 204. Null blir tankstreck. */
export function tal(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '–';
  return n.toLocaleString('sv-SE');
}

/** Datum och tid, exakt. Anvands i title och i tidslinjen. */
export function exaktTid(iso: string | null | undefined): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Bara datum, till exempel 14 sep 2026. */
export function kortDatum(iso: string | null | undefined): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Relativ tid pa svenska, avrundad nedat. "Nyss" under en minut.
 *
 * Tar en referenstidpunkt sa att server och klient kan rakna fran samma nu
 * och texten inte hoppar vid hydrering.
 */
export function sedan(
  iso: string | null | undefined,
  nu: number = Date.now()
): string {
  if (!iso) return 'Aldrig';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Aldrig';

  const sek = Math.max(0, Math.floor((nu - t) / 1000));
  if (sek < 60) return 'Nyss';

  const min = Math.floor(sek / 60);
  if (min < 60) return `${min} min sedan`;

  const tim = Math.floor(min / 60);
  if (tim < 24) return `${tim} h sedan`;

  const dag = Math.floor(tim / 24);
  if (dag < 30) return `${dag} ${dag === 1 ? 'dag' : 'dagar'} sedan`;

  const man = Math.floor(dag / 30);
  if (man < 12) return `${man} ${man === 1 ? 'manad' : 'manader'} sedan`;

  const ar = Math.floor(dag / 365);
  return `${ar} ${ar === 1 ? 'ar' : 'ar'} sedan`;
}

export type NivaEtikett = 'Gratis' | 'Trial' | 'Premium';

/**
 * Nivan for en rad, med samma regel som filtret i data.ts.
 *
 * Trial gar fore premium: en reverse trial ar formellt premium_tier men har
 * inte betalat, och att blanda ihop dem gor "trial till betalt" omojlig att
 * lasa.
 */
export function niva(rad: {
  subscription_tier: string | null;
  subscription_status: string | null;
  premium_source: string | null;
}): NivaEtikett {
  if (
    rad.subscription_status === 'trialing' ||
    rad.premium_source === 'signup_trial' ||
    rad.premium_source === 'oauth_signup_trial'
  ) {
    return 'Trial';
  }
  return rad.subscription_tier === 'premium' ? 'Premium' : 'Gratis';
}

/** Ett namn att visa nar full_name saknas. */
export function visningsnamn(namn: string | null, epost: string | null): string {
  if (namn && namn.trim()) return namn.trim();
  if (epost) return epost.split('@')[0];
  return 'Namnlos';
}
