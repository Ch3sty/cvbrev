// src/lib/mobilapp/appvag.ts
// Appen för Android (och senare iOS) laddar samma domän som webben, men
// visar testerna i sin egen ram (docs/plan-app.md, avsnitt 2). Webbens kod
// ändras inte: proxyn skriver om appens förfrågningar till sidorna under
// /app, som återanvänder webbens testsidor med appens layout runt.
//
// Adressen i appens webbvy står kvar på /dashboard/tester/..., så varje länk
// och router.push i testflödena fungerar oförändrat.

/** Appskalet lägger till det här i user agent (mobilapp/capacitor.config.ts). */
export const APP_UA_MARKERING = 'JobbcoachApp/';

export function arAppen(userAgent: string | null | undefined): boolean {
  return !!userAgent && userAgent.includes(APP_UA_MARKERING);
}

/** Plattformen ur markeringen, "JobbcoachApp/0.1 (android)". */
export function appPlattform(userAgent: string | null | undefined): 'android' | 'ios' | null {
  if (!arAppen(userAgent)) return null;
  const m = /JobbcoachApp\/[^\s]+ \((android|ios)\)/.exec(userAgent!);
  return (m?.[1] as 'android' | 'ios' | undefined) ?? null;
}

/** Skalets version ur markeringen, "0.1.0". */
export function appVersion(userAgent: string | null | undefined): string | null {
  if (!arAppen(userAgent)) return null;
  return /JobbcoachApp\/([^\s]+)/.exec(userAgent!)?.[1] ?? null;
}

/** Sidan som säger att en del av Jobbcoach bara finns på webben. */
export const WEBBEN_VAG = '/app/webben';

/**
 * Appens tre flikar och kontot (konceptet docs/design/app-koncept-2026-11-13.html).
 * Adresserna i appen är webbens, så en omstart eller en länk ur passen
 * landar rätt: /dashboard är Idag, /dashboard/tester är Tester,
 * /dashboard/tester/kurvan är Utveckling och /dashboard/installningar är
 * kontot bakom profilbilden.
 */
export const APP_FLIK = {
  idag: '/dashboard',
  tester: '/dashboard/tester',
  utveckling: '/dashboard/tester/kurvan',
  konto: '/dashboard/installningar',
} as const;

/** Appens egna vyer, dit proxyn skriver om flikarnas adresser. */
const EGNA_VYER: Record<string, string> = {
  [APP_FLIK.tester]: '/app/katalog',
  [APP_FLIK.utveckling]: '/app/utveckling',
  [APP_FLIK.konto]: '/app/konto',
  // Passens betalväggar går till webbens köpsteg (kopstegHref) och
  // prenumerationssida. I appen är båda appens köpvy (Google Play).
  '/dashboard/valj-spar': '/app/premium',
  '/dashboard/profil/prenumeration': '/app/premium',
};

/** Flikens nyckel för en adress i appen, null i passen och undersidorna (helskärm). */
export function appFlik(pathname: string): 'idag' | 'tester' | 'utveckling' | null {
  const p = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (p === APP_FLIK.idag) return 'idag';
  if (p === APP_FLIK.tester) return 'tester';
  if (p === APP_FLIK.utveckling) return 'utveckling';
  return null;
}

const TESTER = /^\/dashboard\/tester(\/.*)?$/;

/**
 * Var en förfrågan från appen ska renderas. null betyder att den går som
 * vanligt (API, inloggning, Next-filer, appens egna /app-sidor).
 */
export function appVag(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return '/app';
  const egen = EGNA_VYER[pathname.replace(/\/$/, '')];
  if (egen) return egen;
  const tester = TESTER.exec(pathname);
  if (tester) {
    const rest = tester[1] ?? '';
    // Förhandsvisningarna är verktyg för oss, inte en del av appen.
    if (rest.startsWith('/forhandsvisning')) return WEBBEN_VAG;
    return `/app/tester${rest}`;
  }
  if (pathname.startsWith('/dashboard/')) return WEBBEN_VAG;
  if (pathname === '/login') return '/app/logga-in';
  // Registreringen är appens egen: onboarding, Nivåkollen före kontot.
  if (pathname === '/register' || pathname.startsWith('/register/')) return '/app/valkommen';
  // Köp går via Google Play i appen, aldrig via webbens priser och Stripe.
  if (pathname === '/priser' || pathname.startsWith('/priser/')) return APP_PREMIUM;
  return null;
}

/** Appens köpvy (Google Play). Webbens betalväggar i passen leder hit. */
export const APP_PREMIUM = '/app/premium';

/**
 * Stripes kassor får aldrig öppnas från appen (Google Plays regler för
 * digitala köp). Proxyn svarar på dem med appens köpvy i stället.
 */
export function arStripeKassa(pathname: string): boolean {
  return /^\/api\/stripe\/create-(plan|upgrade|checkout)-session\/?$/.test(pathname);
}

/** /app är bara till för appen. Webbläsare skickas till webbens tester. */
export function arAppSida(pathname: string): boolean {
  return pathname === '/app' || pathname.startsWith('/app/');
}
