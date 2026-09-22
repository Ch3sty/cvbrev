// src/lib/email/lifecycle/templates/vecka.ts
//
// Veckomejlen, M1 till M16 (docs/plan-paket-och-onboarding.md, Fas 2B
// avsnitt 7). Två serier, cv_day1 till cv_day7 och test_day1 till test_day7,
// plus förnyelsepåminnelsen och uppsägningskvittot.
//
// De ersätter rt_day0 till rt_day10, som föll med reverse trial (ägarens
// beslut 3). Inget trialmejl behålls.
//
// Två regler styr när ett dagsmejl går iväg, och båda finns i shouldSend:
//
//   1. Mejlet för dag n skickas bara om week_progress_day är mindre än eller
//      lika med n. Annars påminner vi om saker användaren redan gjort, och
//      det är det snabbaste sättet att bli avprenumererad.
//   2. Mejlet skickas bara till den som fortfarande betalar. En uppsagd
//      vecka ska inte fortsätta mejla dagsprogram.
//
// Knappens länk bär ?source=email, som skjuter week_day_opened med
// source: 'email' när dagen öppnas.

import type { LifecycleEmail, LifecycleContext } from '../types';
import { renderLayout, heading, paragraph, firstName } from './layout';
import { isPayingNow } from './helpers';
import { CV_VECKAN, TEST_VECKAN, type Dag, type WeekTrack } from '@/lib/onboarding/program';

function greet(ctx: LifecycleContext): string {
  const name = firstName(ctx.profile.full_name);
  return name ? `Hej ${name},` : 'Hej,';
}

/** Har användaren redan passerat dagen mejlet gäller? */
async function harPasseratDagen(ctx: LifecycleContext, dag: number): Promise<boolean> {
  const { data } = await (ctx.admin as any)
    .from('profiles')
    .select('week_progress_day')
    .eq('id', ctx.userId)
    .maybeSingle();
  const framsteg = Number(data?.week_progress_day ?? 0) || 0;
  return framsteg > dag;
}

/** Dagsmejlets gemensamma villkor: betalande, och dagen är inte redan gjord. */
function dagsVillkor(dag: number) {
  return async (ctx: LifecycleContext): Promise<boolean> => {
    if (!isPayingNow(ctx.profile)) return false;
    return !(await harPasseratDagen(ctx, dag));
  };
}

/** Texterna per dag och spår. Ämne, preheader och första stycke ur 2B. */
interface Dagsmejl {
  subject: string;
  preheader: string;
  body: string;
  cta: string;
}

const CV_MEJL: Record<number, Dagsmejl> = {
  1: {
    subject: 'Ansökan kan vara inne i kväll',
    preheader: 'Ladda upp CV:t, se hela analysen, välj mall och ladda ner.',
    body: 'Du har CV-veckan till söndag, och dag 1 är den som ger snabbast utdelning. Ladda upp ditt CV, läs hela analysen, välj en mall och ladda ner den. Då har du en färdig ansökan att skicka i kväll, och resten av veckan handlar om att göra den vassare.',
    cta: 'Ladda upp ditt CV',
  },
  2: {
    subject: 'Rätta de tre tyngsta fynden',
    preheader: 'Kör om analysen efteråt, så ser du skillnaden svart på vitt.',
    body: 'Analysen från i går rangordnade fynden efter vad som väger tyngst. Ta de tre översta i dag, ett i taget, och kör om analysen när du är klar. Läsbarhetspoängen rör sig direkt, och du ser vilken ändring som gjorde mest.',
    cta: 'Öppna analysen',
  },
  3: {
    subject: 'Brevet till annonsen du sökte',
    preheader: 'Klistra in annonsen, vi läser kravprofilen och skriver.',
    body: 'Ett CV utan brev är en halv ansökan i de flesta svenska urval. Klistra in annonsen du redan sökt, så läser vi ut kravprofilen och skriver brevet mot den. Läs igenom, ändra det du vill, ladda ner som PDF eller Word.',
    cta: 'Skriv brevet',
  },
  4: {
    subject: 'En mall till, för en annan sorts roll',
    preheader: 'Samma innehåll, annat uttryck. Tar under fem minuter.',
    body: 'Söker du brett behöver du sällan skriva om CV:t, men du tjänar på att byta uttryck. En stramare mall till de traditionella arbetsgivarna, en öppnare till de mindre bolagen. Innehållet följer med av sig självt, du väljer bara en ny mall och laddar ner.',
    cta: 'Välj en ny mall',
  },
  5: {
    subject: 'Läsbarhetspoängen, och vad som sänker den',
    preheader: 'Tabeller, kolumner och grafik är det som oftast går fel.',
    body: 'Hos de flesta arbetsgivare läses ansökan av ett rekryteringssystem (ATS) innan en människa ser den. Läsbarhetspoängen visar hur väl systemet tolkar ditt CV, från 0 till 100. Vi pekar ut vad som sänker den och vad du ändrar. Oftast är det tabeller, kolumner eller en grafisk rubrik.',
    cta: 'Se din läsbarhetspoäng',
  },
  6: {
    subject: 'LinkedIn mot samma CV',
    preheader: 'Rubrik, om mig och kompetenser mot det CV du just gjort.',
    body: 'Rekryterare söker i LinkedIn med samma ord som står i kravprofilen. Ditt CV innehåller de orden nu, men din profil gör det sällan. Vi läser båda och föreslår ny rubrik, ny om mig-text och de kompetenser som bör ligga överst.',
    cta: 'Optimera profilen',
  },
  7: {
    subject: 'Din vecka, och om du vill ha en till',
    preheader: 'Så här långt kom du. Förnyelsen sker i morgon om du inget gör.',
    body: 'Här är veckan: vad du laddat ner, vad du skrivit och vad som är kvar. Har du fått intervju är vi glada, och då behöver du inte göra något mer än att säga upp. Söker du vidare förnyas CV-veckan i morgon med 79 kr, och vi fortsätter där du slutade.',
    cta: 'Se veckans sammanställning',
  },
};

const TEST_MEJL: Record<number, Dagsmejl> = {
  1: {
    subject: 'Ditt diagnostest och veckans plan',
    preheader: 'Tjugo minuter nu ger en plan för resten av veckan.',
    body: 'Vi börjar med ett diagnostest på grundnivå i varje testtyp: matrislogik, verbalt, numeriskt. Resultatet visar var du tappar, och utifrån det lägger vi en träningsplan för veckan. Du behöver inte gissa vad du ska öva på, planen säger det.',
    cta: 'Gör diagnostestet',
  },
  2: {
    subject: 'Din svagaste testtyp, en nivå upp',
    preheader: 'Avancerad nivå, med förklaring till varje fråga du missar.',
    body: 'Diagnostestet pekade ut var du tappade mest. I dag kör vi den typen på avancerad nivå, och du får förklaringen till varje fråga direkt efteråt. Läs förklaringarna även på de frågor du klarade. Mönstret bakom en matrislogikfråga återkommer, och det är mönstret du tränar.',
    cta: 'Kör avancerad nivå',
  },
  3: {
    subject: 'Verbalt resonemang, med klockan på',
    preheader: 'Samma tidspress som i ett skarpt urval.',
    body: 'Verbala test faller sällan på förståelsen, de faller på tiden. I dag kör du med klockan igång och automatisk inlämning när tiden är ute, precis som i ett skarpt urval. Räkna med att det känns stressigt första gången. Det är hela poängen med att öva.',
    cta: 'Starta det tidsatta testet',
  },
  4: {
    subject: 'Tabeller, diagram och klockan',
    preheader: 'Läs frågan före tabellen, så slipper du räkna i onödan.',
    body: 'Numeriska test ger dig en tabell eller ett diagram och en fråga du ska svara på under tidspress. Det snabbaste greppet är att läsa frågan först och sedan leta upp bara de tal du behöver. I dag kör vi tidsatt, och förklaringen efteråt visar vilken väg som var kortast.',
    cta: 'Kör det numeriska testet',
  },
  5: {
    subject: 'Expertnivå i det du är bäst på',
    preheader: 'Marginalen uppåt är det som skiljer i ett tätt urval.',
    body: 'I dag går vi uppåt i stället för nedåt. Expertnivå i din starkaste testtyp, eftersom det är där du kan flytta dig från godkänt till särskiljande. I ett tätt urval är det sällan svagheten som avgör, det är om något i din profil sticker ut.',
    cta: 'Kör expertnivån',
  },
  6: {
    subject: 'Fullt prov under skarp tidspress',
    preheader: 'Alla typer i följd, automatisk inlämning, inga pauser.',
    body: 'I dag kör du ett fullt prov: alla testtyper i följd, klockan igång, automatisk inlämning när tiden går ut. Inga pauser och ingen möjlighet att backa, precis som när det gäller. Sätt dig ostört och lägg undan telefonen. Resultatet blir det mest ärliga besked du får den här veckan.',
    cta: 'Starta provet',
  },
  7: {
    subject: 'Så mycket flyttade du dig på sju dagar',
    preheader: 'Alla sessioner i en kurva. Förnyelsen sker i morgon om du inget gör.',
    body: 'Alla dina sessioner ligger nu i en kurva, per testtyp. Du ser var du började, var du landade och vilken typ som flyttade sig mest. Har du testet bakom dig är du klar och säger upp. Väntar det fortfarande förnyas Testveckan i morgon med 79 kr, och kurvan fortsätter.',
    cta: 'Se din utveckling',
  },
};

/** Dagens adress i appen, med ?source=email så week_day_opened kan skiljas åt. */
function dagsLank(dag: Dag): string {
  const skiljetecken = dag.href.includes('?') ? '&' : '?';
  return `${dag.href}${skiljetecken}source=email&vecka=${dag.dag}`;
}

function byggDagsmejl(spar: WeekTrack, dagNr: number): LifecycleEmail {
  const type = `${spar === 'cv' ? 'cv' : 'test'}_day${dagNr}`;
  const dagar = spar === 'cv' ? CV_VECKAN : TEST_VECKAN;
  const dag = dagar[dagNr - 1];
  const mejl = (spar === 'cv' ? CV_MEJL : TEST_MEJL)[dagNr];

  return {
    type,
    shouldSend: dagsVillkor(dagNr),
    render: (ctx) => ({
      subject: mejl.subject,
      preheader: mejl.preheader,
      html: renderLayout({
        type,
        userId: ctx.userId,
        preheader: mejl.preheader,
        body: heading(dag.titel) + paragraph(`${greet(ctx)} ${mejl.body}`),
        ctaLabel: mejl.cta,
        ctaUrl: dagsLank(dag),
        footNote:
          dagNr === 7
            ? `<a href="/dashboard/profil/prenumeration" style="color:#94A3B8;">Säg upp ${spar === 'cv' ? 'CV-veckan' : 'Testveckan'}</a>`
            : undefined,
      }),
    }),
  };
}

export const CV_VECKA_MEJL: LifecycleEmail[] = [1, 2, 3, 4, 5, 6, 7].map((n) =>
  byggDagsmejl('cv', n)
);
export const TEST_VECKA_MEJL: LifecycleEmail[] = [1, 2, 3, 4, 5, 6, 7].map((n) =>
  byggDagsmejl('tester', n)
);

/**
 * M15, förnyelse i morgon. Skickas dagen före förnyelse tre och framåt
 * (avsnitt 8). Ämnet säger beloppet: ett påminnelsemejl som döljer summan är
 * sämre än inget påminnelsemejl.
 */
export const fornyelseImorgon: LifecycleEmail = {
  type: 'renewal_tomorrow',
  transactional: true,
  shouldSend: async (ctx) => isPayingNow(ctx.profile),
  render: (ctx) => {
    const paket = (ctx.metadata?.planName as string) || 'CV-veckan';
    const belopp = Number(ctx.metadata?.amount ?? 79) || 79;
    const subject = `${paket} förnyas i morgon, ${belopp} kr`;
    const preheader = 'Vill du inte fortsätta säger du upp i dag, det tar ett klick.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'renewal_tomorrow',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('En påminnelse innan nästa dragning') +
          paragraph(
            `${greet(ctx)} i morgon dras ${belopp} kr för ytterligare en period med ${paket}. Har du fått jobbet, eller är du klar för den här gången, säger du upp i ditt konto under Prenumeration. Det tar ett klick, du behöver inte ange skäl, och perioden du redan betalat gäller ut.`
          ),
        ctaLabel: 'Fortsätt veckan',
        ctaUrl: '/dashboard',
        footNote:
          '<a href="/dashboard/profil/prenumeration" style="color:#94A3B8;">Säg upp</a>',
      }),
    };
  },
};

/**
 * M16, uppsagt. Ett kvitto, inget annat. Aldrig ett återköpserbjudande, en
 * rabatt eller en fråga om varför: ett försök att vinna tillbaka kunden i
 * just det här mejlet är det som gör uppsägningar till klagomål.
 */
export const uppsagtGallerUt: LifecycleEmail = {
  type: 'canceled_until_sunday',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const paket = (ctx.metadata?.planName as string) || 'CV-veckan';
    const slut = (ctx.metadata?.periodEnd as string) || '';
    const slutText = slut
      ? new Intl.DateTimeFormat('sv-SE', {
          day: 'numeric',
          month: 'long',
          timeZone: 'Europe/Stockholm',
        }).format(new Date(slut))
      : 'söndag';
    const subject = 'Uppsagt. Veckan gäller till söndag.';
    const preheader = 'Inget mer dras. Allt du skapat finns kvar att läsa och kopiera.';
    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'canceled_until_sunday',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading('Uppsagt, och veckan gäller ut') +
          paragraph(
            `${greet(ctx)} din uppsägning är registrerad och inget mer kommer att dras. ${paket} gäller till och med ${slutText}, så använd dagarna du betalat för. Därefter går kontot till gratisnivån. Allt du skapat finns kvar att läsa och kopiera, och du kan börja igen när du vill.`
          ),
        ctaLabel: 'Använd dagarna som är kvar',
        ctaUrl: '/dashboard',
      }),
    };
  },
};

/**
 * Kvittomejlet (K18 till K24). Ämnesraden ska gå att söka fram i inkorgen ett
 * halvår senare, därför paketnamnet plus beloppet.
 */
export const kvittoMejl: LifecycleEmail = {
  type: 'receipt',
  transactional: true,
  shouldSend: async () => true,
  render: (ctx) => {
    const paket = (ctx.metadata?.planName as string) || 'CV-veckan';
    const belopp = Number(ctx.metadata?.amount ?? 79) || 79;
    const start = (ctx.metadata?.periodStart as string) || '';
    const slut = (ctx.metadata?.periodEnd as string) || '';
    const fmt = (iso: string) =>
      iso
        ? new Intl.DateTimeFormat('sv-SE', {
            day: 'numeric',
            month: 'long',
            timeZone: 'Europe/Stockholm',
          }).format(new Date(iso))
        : '';
    const subject = `Kvitto: ${paket}, ${belopp} kr`;
    const preheader = `Perioden ${fmt(start)} till ${fmt(slut)}.`;

    const rader = [
      `Belopp: ${belopp} kr inklusive moms`,
      `Paket: ${paket}`,
      `Period: ${fmt(start)} till ${fmt(slut)}`,
      `Nästa dragning: ${fmt(slut)}`,
    ];

    return {
      subject,
      preheader,
      html: renderLayout({
        type: 'receipt',
        userId: ctx.userId,
        preheader,
        transactional: true,
        body:
          heading(`Kvitto för ${paket}`) +
          paragraph(
            `Här är kvittot på ${belopp} kr för ${paket}. Perioden gäller ${fmt(start)} till ${fmt(slut)} och förnyas sedan var sjunde dag med samma belopp tills du säger upp. Uppsägning görs i ditt konto under Prenumeration och tar ett klick.`
          ) +
          rader
            .map(
              (rad) =>
                `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">${rad}</p>`
            )
            .join(''),
        ctaLabel: 'Säg upp',
        ctaUrl: '/dashboard/profil/prenumeration',
      }),
    };
  },
};
