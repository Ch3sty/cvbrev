// src/lib/email/lifecycle/templates/komigang.ts
//
// Hjälpredans mejl (docs/design/spec-onboarding-2026-09-22.html, sektion 6).
//
// Ett mejl om dagen, om nästa föreslagna bricka. Har användaren provat allt
// skickas inget förrän dagen före förnyelsen, då "förnyas i morgon" går ut
// med siffror som betyder något och två lika synliga val: fortsätt eller
// avsluta.
//
// Två typer, båda med datumsuffix i email_type så unique-indexet på
// (user_id, email_type) blir dubblettspärr inom dagen men släpper igenom
// nästa dag:
//
//   komigang_2026-09-25        nästa bricka
//   paket_fornyas_2026-09-28   dagen före förnyelsen
//
// Urvalet görs av scheduleKomIgangMejl i runner.ts, i morgonslotten.
// shouldSend räknar om läget vid sändning, så ett mejl om något användaren
// hann göra samma morgon aldrig går iväg.

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, firstName, escapeHtml } from './layout';
import { isPayingNow } from './helpers';
import { hamtaProvadeUnderlag, harledProvade } from '@/lib/onboarding/komigang-server';
import {
  brickaText,
  komIgangLage,
  type BrickaKey,
  type KomIgangLage,
  type Paket,
} from '@/lib/onboarding/komigang';
import { PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans';

export const KOMIGANG_TYPE = 'komigang';
export const PAKET_FORNYAS_TYPE = 'paket_fornyas';

function greet(ctx: LifecycleContext): string {
  const name = firstName(ctx.profile.full_name);
  return name ? `Hej ${name}.` : 'Hej.';
}

function paketNamn(plan: PlanKey | null): string {
  if (!plan) return 'paketet';
  return plan === 'cv_week' || plan === 'test_week' ? PLAN_BY_KEY[plan].name : 'Allt';
}

function svensktDatum(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(d);
}

/** Hela dagar kvar till en tidpunkt, aldrig under noll. */
function dagarKvar(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((t - now.getTime()) / 86400000));
}

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva'];
function talOrd(n: number, hankon = false): string {
  if (n === 1) return hankon ? 'ett' : 'en';
  return TALORD[n] ?? String(n);
}

/** Senaste analysens poäng, för ämnesraden "Ditt CV fick 74". */
async function senastePoang(ctx: LifecycleContext): Promise<number | null> {
  const { data } = await (ctx.admin as any)
    .from('cv_analysis_jobs')
    .select('result->atsFriendliness->>score')
    .eq('user_id', ctx.userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  const n = Number((data as { score?: unknown } | null)?.score);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Läget för mottagaren, räknat vid sändning. */
async function lasLage(ctx: LifecycleContext): Promise<{ lage: KomIgangLage; paket: Paket; plan: PlanKey | null }> {
  const scope = ctx.metadata?.scope;
  const paket: Paket = scope === 'cv' || scope === 'tester' || scope === 'allt' ? scope : null;
  const plan = (ctx.metadata?.planKey as PlanKey | undefined) ?? null;
  const underlag = await hamtaProvadeUnderlag(ctx.admin, ctx.userId);
  const provade = harledProvade(underlag);
  return { lage: komIgangLage(paket, provade), paket, plan };
}

/* --------------------------------------------------- nästa bricka */

interface Brickmejl {
  subject: string;
  preheader: string;
  body: string;
  cta: string;
}

/**
 * Ämne, preheader och första stycke per bricka. Sektion 6:s två exempel
 * står ordagrant (uppdatera CV:t och mallen), resten följer samma form:
 * ämnet säger vad som väntar, preheadern hur lång tid det tar.
 */
function brickmejl(key: BrickaKey, lage: KomIgangLage, ctx: LifecycleContext, fakta: { poang: number | null }): Brickmejl {
  const kvar = lage.antalTotalt - lage.antalProvade;
  const dagar = dagarKvar(ctx.profile.current_period_end);
  const kvarTitlar = lage.lista
    .filter((k) => !lage.provade.includes(k))
    .map((k) => brickaText(k, lage.paket).titel.toLowerCase());
  const hej = greet(ctx);

  switch (key) {
    case 'uppdatera_cv':
      return {
        subject:
          typeof fakta.poang === 'number'
            ? `Ditt CV fick ${fakta.poang}. Här är de två fynden som drar ned mest.`
            : 'Här är de två fynden som drar ned ditt CV mest.',
        preheader: 'Rätta dem, kör om, se poängen stiga. Tar tio minuter.',
        body: `${hej} Analysen hittade fynd i ditt CV. Två av dem väger tyngre än resten: resultaten saknar siffror, och nyckelorden för rollen du söker finns inte med. Båda går att rätta i kväll.`,
        cta: 'Öppna fynden',
      };
    case 'profil':
      return {
        subject: 'Två uppgifter, så vet vi vad vi letar efter.',
        preheader: 'Önskad roll och ort. Under en minut.',
        body: `${hej} Analysen, matchningen och brevet utgår från vilken roll du söker och var. Fyll i de två raderna i profilen, så blir allt annat träffsäkrare.`,
        cta: 'Fyll i profilen',
      };
    case 'cv_upp':
      return {
        subject: 'Ladda upp CV:t, så börjar vi.',
        preheader: 'PDF eller Word. En minut.',
        body: `${hej} Allt annat bygger på CV:t: analysen, mallen, brevet. Ladda upp det du har, hur ofärdigt det än är, så visar vi vad som saknas.`,
        cta: 'Ladda upp CV:t',
      };
    case 'analys':
    case 'analys_gratis':
      return {
        subject: 'Kör CV-analysen. Poäng, fynd, nyckelord.',
        preheader: 'Så läser ett rekryteringssystem ditt CV. Två minuter.',
        body: `${hej} Ditt CV ligger uppe. Analysen visar poängen, fynden i tyngdordning och vilka nyckelord som saknas för rollen du söker.`,
        cta: 'Kör analysen',
      };
    case 'mall':
      return {
        subject:
          dagar !== null && kvar > 0
            ? `${storForst(talOrd(dagar))} dagar kvar, och ${talOrd(kvar)} saker du inte provat än.`
            : `${storForst(talOrd(kvar))} saker du inte provat än.`,
        preheader: `${storForst(lista(kvarTitlar))}. Alla tar under tio minuter.`,
        body: `${hej} Kvar i ${paketNamn(null) === 'paketet' ? 'paketet' : ''}${paketNamnUr(lage)}: ${lista(kvarTitlar)}. Vi föreslår mallen, så att CV:t du just förbättrat blir en PDF som rekryteringssystem läser.`,
        cta: 'Välj mall',
      };
    case 'brev':
      return {
        subject: 'Ett brev som svarar på det annonsen frågar efter.',
        preheader: 'Klistra in annonsen, vi skriver. Fem minuter.',
        body: `${hej} Ett CV utan brev är en halv ansökan i de flesta svenska urval. Klistra in annonsen du sökt, så läser vi kravprofilen och skriver brevet mot den, utifrån ditt CV.`,
        cta: 'Skriv brevet',
      };
    case 'linkedin':
      return {
        subject: 'LinkedIn-profilen, mot samma CV.',
        preheader: 'Ny rubrik, ny om mig-text, kompetenserna överst.',
        body: `${hej} Rekryterare söker i LinkedIn med samma ord som står i kravprofilen. Ditt CV innehåller de orden nu, men din profil gör det sällan. Vi läser båda och föreslår vad som ska ändras.`,
        cta: 'Optimera profilen',
      };
    case 'jobbmatchning':
      return {
        subject: 'Jobb du inte hittat själv, med skälen.',
        preheader: 'Kör matchningen på det uppdaterade CV:t.',
        body: `${hej} Matchningen läser ditt CV mot dagens annonser och säger varför varje träff passar. Kör den på det uppdaterade CV:t, så blir träffarna bättre.`,
        cta: 'Se matchade jobb',
      };
    case 'bli_upptackt':
      return {
        subject: 'Gör dig synlig för rekryterare, anonymt.',
        preheader: 'Ett klick. Du svarar bara på dem du vill.',
        body: `${hej} Bli upptäckt visar din profil för rekryterare utan namn tills du själv svarar. Det kostar inget att slå på, och du stänger av när du vill.`,
        cta: 'Gör dig synlig',
      };
    case 'coach':
      return {
        subject: 'Fråga jobbcoachen om lön, intervju eller avtal.',
        preheader: 'Utan tak i ditt paket.',
        body: `${hej} Jobbcoachen känner ditt CV och din målroll. Fråga om löneanspråk, om vad du ska säga på intervjun eller om ett avtal du fått, så svarar den utifrån det.`,
        cta: 'Ställ en fråga',
      };
    case 'matris_grund':
      return {
        subject: 'Matrislogik, grundnivå. Den vanligaste typen i urvalstest.',
        preheader: 'Cirka 20 minuter, förklaring efter varje fråga.',
        body: `${hej} Matrislogik är det moment nästan alla urvalstest börjar med. Grundnivån ger dig mönstren, och förklaringen efter varje fråga visar var resonemanget brister.`,
        cta: 'Börja med matrislogik',
      };
    case 'matris_avancerad':
      return {
        subject: 'Matrislogik, avancerad nivå.',
        preheader: 'Samma mönstertyper, fler steg.',
        body: `${hej} Avancerad nivå har samma mönstertyper som grundnivån men fler steg i varje, och förklaringen efter varje fråga visar var resonemanget brister.`,
        cta: 'Starta avancerad nivå',
      };
    case 'verbalt_numeriskt_grund':
      return {
        subject: 'Två testtyper till att känna igen.',
        preheader: 'Verbalt och numeriskt, grundnivå.',
        body: `${hej} Urvalstesten blandar typerna. Verbalt mäter hur du läser, numeriskt hur du räknar under tidspress. Grundnivån i båda tar en halvtimme tillsammans.`,
        cta: 'Öppna testerna',
      };
    case 'provlage':
      return {
        subject: 'Provläge mot klockan.',
        preheader: '25 till 40 minuter, automatisk inlämning.',
        body: `${hej} Provläget kör som ett skarpt urval: klockan går, inga förklaringar under tiden, automatisk inlämning när tiden är ute. Sitt ostört.`,
        cta: 'Starta provet',
      };
    case 'personlighet':
      return {
        subject: 'Personlighetstestet, och vad det säger om dig.',
        preheader: 'Se hur rekryteraren tolkar dig.',
        body: `${hej} Personlighetstestet ger en profil, inte ett betyg. Tolkningen visar hur en rekryterare läser den, och vad du kan vänta dig för frågor.`,
        cta: 'Gör personlighetstestet',
      };
    case 'kurva':
      return {
        subject: 'Din kurva. Alla sessioner per typ.',
        preheader: 'Var du började, var du landade.',
        body: `${hej} Alla dina sessioner ligger i en kurva, per testtyp. Du ser var du började, var du landade och vilken typ som flyttade sig mest.`,
        cta: 'Se din kurva',
      };
  }
}

function paketNamnUr(lage: KomIgangLage): string {
  if (lage.paket === 'cv') return 'CV-veckan';
  if (lage.paket === 'tester') return 'Testveckan';
  if (lage.paket === 'allt') return 'Allt';
  return 'gratisnivån';
}

function storForst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "mallen, brevet och LinkedIn" */
function lista(delar: string[]): string {
  if (delar.length === 0) return '';
  if (delar.length === 1) return delar[0];
  return `${delar.slice(0, -1).join(', ')} och ${delar[delar.length - 1]}`;
}

/** Dagens mejl om nästa bricka. Registreras under bastypen, skickas med datumsuffix. */
export const komIgangMejl: LifecycleEmail = {
  type: KOMIGANG_TYPE,
  shouldSend: async (ctx) => {
    if (!isPayingNow(ctx.profile)) return false;
    const { lage } = await lasLage(ctx);
    // Allt provat: inget mejl förrän dagen före förnyelsen.
    return !lage.klar;
  },
  render: async (ctx) => {
    const { lage } = await lasLage(ctx);
    const nasta = lage.nasta ?? lage.lista[lage.lista.length - 1];
    const bricka = brickaText(nasta, lage.paket);
    const poang = await senastePoang(ctx);
    const mejl = brickmejl(nasta, lage, ctx, { poang });
    return {
      subject: mejl.subject,
      preheader: mejl.preheader,
      html: renderLayout({
        type: KOMIGANG_TYPE,
        userId: ctx.userId,
        preheader: mejl.preheader,
        body: heading(escapeHtml(bricka.titel)) + paragraph(escapeHtml(mejl.body)),
        ctaLabel: mejl.cta,
        ctaUrl: bricka.href,
      }),
    };
  },
};

/* ------------------------------------------------ förnyas i morgon */

/** Siffror som betyder något: brev, mallar, poäng före och efter, ansökningar. */
async function veckansTal(ctx: LifecycleContext, sedan: string | null) {
  const admin = ctx.admin as any;
  const fran = sedan ?? new Date(Date.now() - 7 * 86400000).toISOString();
  const [brev, mallar, ansokningar, analyser] = await Promise.all([
    admin.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', ctx.userId).gte('created_at', fran),
    admin
      .from('formatted_cv_downloads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', ctx.userId)
      .gte('downloaded_at', fran),
    admin
      .from('job_applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', ctx.userId)
      .gte('created_at', fran),
    admin
      .from('cv_analysis_jobs')
      .select('result->atsFriendliness->>score, completed_at')
      .eq('user_id', ctx.userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: true }),
  ]);
  const poang = ((analyser?.data ?? []) as Array<{ score: unknown }>)
    .map((r) => Number(r.score))
    .filter((n) => Number.isFinite(n));
  return {
    brev: brev?.count ?? 0,
    mallar: mallar?.count ?? 0,
    ansokningar: ansokningar?.count ?? 0,
    poangFore: poang.length > 0 ? Math.round(poang[0]) : null,
    poangEfter: poang.length > 1 ? Math.round(poang[poang.length - 1]) : null,
  };
}

export const paketFornyasMejl: LifecycleEmail = {
  type: PAKET_FORNYAS_TYPE,
  transactional: true,
  shouldSend: async (ctx) => isPayingNow(ctx.profile),
  render: async (ctx) => {
    const plan = (ctx.metadata?.planKey as PlanKey | undefined) ?? null;
    const namn = paketNamn(plan);
    const belopp = plan ? PLAN_BY_KEY[plan].amount : Number(ctx.metadata?.amount ?? 79) || 79;
    const { lage } = await lasLage(ctx);
    const periodStart = (ctx.metadata?.periodStart as string | undefined) ?? null;
    const tal = await veckansTal(ctx, periodStart);

    const delar: string[] = [];
    if (tal.brev > 0) delar.push(`${storForst(talOrd(tal.brev, true))} personliga brev`);
    if (tal.mallar > 0) delar.push(`${talOrd(tal.mallar)} mallar`);
    if (tal.poangFore !== null && tal.poangEfter !== null && tal.poangEfter !== tal.poangFore) {
      delar.push(`poäng ${tal.poangFore} till ${tal.poangEfter}`);
    }
    if (tal.ansokningar > 0) delar.push(`${talOrd(tal.ansokningar)} ansökningar`);
    const summering = delar.length > 0 ? `${delar.join(', ')}.` : 'Det du byggt finns kvar.';

    const subject = `${namn} förnyas i morgon. Så här gick den.`;
    const preheader = `${storForst(summering)} Fortsätt eller avsluta, ett klick.`;

    const provatRad = lage.klar
      ? 'Du har provat allt som ingår, och det du byggt finns kvar oavsett vad du väljer.'
      : `Du har provat ${lage.antalProvade} av ${lage.antalTotalt} delar, och det du byggt finns kvar oavsett vad du väljer.`;

    const nastaDatum = svensktDatum(ctx.profile.current_period_end);
    const body = `${greet(ctx)} I morgon${nastaDatum ? `, ${nastaDatum},` : ''} dras ${belopp} kr för nästa period med ${namn}. ${provatRad} Vill du inte fortsätta avslutar du här, utan skäl.`;

    return {
      subject,
      preheader,
      html: renderLayout({
        type: PAKET_FORNYAS_TYPE,
        userId: ctx.userId,
        preheader,
        transactional: true,
        body: heading(`Så här gick ${namn === 'Allt' ? 'perioden' : 'veckan'}`) + paragraph(escapeHtml(summering)) + paragraph(escapeHtml(body)),
        ctaLabel: 'Se veckan',
        ctaUrl: '/dashboard',
        footNote: '<a href="/dashboard/profil/prenumeration" style="color:#94A3B8;">Avsluta</a>',
      }),
    };
  },
};
