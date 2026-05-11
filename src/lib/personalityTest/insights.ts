// Texter och insikter för Big Five-profilen.
// Allt är på svenska och formulerat utan psykologi-jargong.
//
// Vi använder tre band per dimension: låg (0-39), medel (40-69), hög (70-100).
// Vi ger varje användare en sammansatt bild – inte "rätt eller fel".

import type { BigFiveScores, Dimension, Facet, FacetScores } from './types';

export type Band = 'low' | 'mid' | 'high';

export function bandFor(score: number): Band {
  if (score >= 70) return 'high';
  if (score >= 40) return 'mid';
  return 'low';
}

// ============================================================
// DIMENSIONER
// ============================================================

export interface DimensionMeta {
  key: Dimension;
  name: string;
  shortName: string;
  description: string;
  poles: { low: string; high: string };
}

export const DIMENSION_META: Record<Dimension, DimensionMeta> = {
  openness: {
    key: 'openness',
    name: 'Öppenhet',
    shortName: 'Öppenhet',
    description: 'Hur nyfiken och öppen du är för nya idéer, känslor och upplevelser.',
    poles: { low: 'Praktisk och konventionell', high: 'Nyfiken och idérik' },
  },
  conscientiousness: {
    key: 'conscientiousness',
    name: 'Samvetsgrannhet',
    shortName: 'Samvetsgrannhet',
    description: 'Hur strukturerad, målmedveten och uthållig du är.',
    poles: { low: 'Spontan och flexibel', high: 'Organiserad och målmedveten' },
  },
  extraversion: {
    key: 'extraversion',
    name: 'Utåtriktning',
    shortName: 'Utåtriktning',
    description: 'Hur mycket energi du får av att vara med andra människor.',
    poles: { low: 'Reflekterande och självständig', high: 'Energisk och social' },
  },
  agreeableness: {
    key: 'agreeableness',
    name: 'Vänlighet',
    shortName: 'Vänlighet',
    description: 'Hur mycket du värdesätter harmoni, samarbete och omtanke om andra.',
    poles: { low: 'Rak och självständig', high: 'Empatisk och samarbetsvillig' },
  },
  neuroticism: {
    key: 'neuroticism',
    name: 'Känslomässig särbarhet',
    shortName: 'Särbarhet',
    description: 'Hur starkt och ofta du reagerar känslomässigt på påfrestningar.',
    poles: { low: 'Lugn och stabil', high: 'Känslig och reaktiv' },
  },
};

interface DimensionBandText {
  headline: string;
  description: string;
  strengths: string[];
  watchOuts: string[];
  workContext: string;
}

export const DIMENSION_TEXTS: Record<Dimension, Record<Band, DimensionBandText>> = {
  openness: {
    low: {
      headline: 'Praktiskt sinne och fokus på det beprövade',
      description:
        'Du föredrar det konkreta och välbekanta. Du litar på erfarenhet och vill se att en lösning fungerar innan du investerar tid i den.',
      strengths: [
        'Stabil och förutsägbar i ditt arbete',
        'Bra på att utföra etablerade processer',
        'Tappar inte fokus på det praktiska',
      ],
      watchOuts: [
        'Kan uppfattas som ovillig till förändring',
        'Risk att missa möjligheter i nya idéer',
      ],
      workContext:
        'Du trivs i roller med tydliga rutiner, beprövade metoder och konkreta resultat. Branscher som tillverkning, logistik, ekonomi och drift passar ofta bra.',
    },
    mid: {
      headline: 'Pragmatisk men öppen för nytt',
      description:
        'Du balanserar nyfikenhet med praktiskt förnuft. Du tar gärna till dig nya idéer, men vill att de ska kunna omsättas i verkligheten.',
      strengths: [
        'Flexibel mellan rutin och förändring',
        'Tar till dig nya idéer utan att tappa fokus',
        'Bra brygga mellan visionärer och utförare',
      ],
      watchOuts: [
        'Kan tveka i mycket innovativa miljöer',
      ],
      workContext:
        'Du fungerar i de flesta yrken. Särskilt bra i roller där du behöver omsätta nya idéer i praktisk handling.',
    },
    high: {
      headline: 'Nyfiken och idérik',
      description:
        'Du dras till nya idéer, perspektiv och upplevelser. Du tycker om att tänka i nya banor och utforska vad som är möjligt.',
      strengths: [
        'Kreativ och lösningsorienterad',
        'Lär dig snabbt nya saker',
        'Ser möjligheter där andra ser hinder',
      ],
      watchOuts: [
        'Risk att tappa intresset för långa, repetitiva uppgifter',
        'Kan behöva extra disciplin för att slutföra projekt',
      ],
      workContext:
        'Du trivs i kreativa, föränderliga miljöer. Branscher som forskning, design, marknadsföring, tech och innovation passar ofta bra.',
    },
  },
  conscientiousness: {
    low: {
      headline: 'Spontan och flexibel',
      description:
        'Du gillar att hålla saker öppna och anpassa dig efter situationen. Du jobbar bäst när du har frihet att hitta din egen rytm.',
      strengths: [
        'Anpassningsbar och flexibel',
        'Bra på att hantera oförutsedda situationer',
        'Inte fast i rutiner',
      ],
      watchOuts: [
        'Kan ha svårt med deadlines och struktur',
        'Risk att slutföra projekt blir en utmaning',
      ],
      workContext:
        'Du trivs i kreativa eller akutbaserade roller där flexibilitet är viktigare än struktur. Detaljarbete och långa projekt kan kräva extra system.',
    },
    mid: {
      headline: 'Balanserad och pålitlig',
      description:
        'Du är ordentlig när det krävs, men inte stelbent. Du klarar både struktur och flexibilitet.',
      strengths: [
        'Tillförlitlig utan att vara rigid',
        'Klarar både rutin och förändring',
        'Anpassar din arbetsstil efter situationen',
      ],
      watchOuts: [
        'Kan behöva externa deadlines för stora projekt',
      ],
      workContext:
        'Du passar i de flesta yrken. Du fungerar både i strukturerade och i mer flytande arbetsmiljöer.',
    },
    high: {
      headline: 'Organiserad och målmedveten',
      description:
        'Du är strukturerad, pålitlig och slutför det du tagit på dig. Du planerar framåt och håller deadlines.',
      strengths: [
        'Pålitlig och konsekvent',
        'Bra på planering och uppföljning',
        'Hög arbetsmoral',
      ],
      watchOuts: [
        'Kan bli stressad av oförutsedda förändringar',
        'Risk för överarbete och svårighet att släppa kontroll',
      ],
      workContext:
        'Du är en idealisk medarbetare i de flesta sammanhang. Särskilt värdefull i roller som kräver noggrannhet, ansvar och uthållighet — projektledning, ekonomi, vård, juridik, ingenjörsyrken.',
    },
  },
  extraversion: {
    low: {
      headline: 'Reflekterande och självständig',
      description:
        'Du får energi av lugn och eget arbete. Du tänker innan du talar och föredrar djupa samtal framför ytligt småprat.',
      strengths: [
        'Kan jobba koncentrerat i lugn miljö',
        'Tänker innan du agerar',
        'Bra på djupgående analys',
      ],
      watchOuts: [
        'Kan tystna i stora möten',
        'Risk att inte synas i grupper med starka röster',
      ],
      workContext:
        'Du trivs i roller där fokus och eget arbete värdesätts — utveckling, analys, forskning, skrivande. Du kan absolut leda, men ofta med en lugnare stil.',
    },
    mid: {
      headline: 'Balanserad mellan socialt och självständigt',
      description:
        'Du klarar både att jobba ensam och i grupp. Du kan vara den som tar plats, men behöver inte alltid göra det.',
      strengths: [
        'Anpassningsbar mellan teamarbete och eget arbete',
        'Inte beroende av en specifik energinivå',
        'Lyssnar lika gärna som du pratar',
      ],
      watchOuts: [
        'Kan ibland upplevas som svår att läsa',
      ],
      workContext:
        'Du passar i de flesta yrkesroller. Bra brygga mellan introverta och extroverta i team.',
    },
    high: {
      headline: 'Energisk och social',
      description:
        'Du får energi av att vara med andra. Du tar lätt initiativ, syns i grupper och trivs när det händer mycket.',
      strengths: [
        'Bra på nätverkande och relationer',
        'Tar initiativ och syns',
        'Hög energi i grupp',
      ],
      watchOuts: [
        'Kan ha svårt med långt eget fokusarbete',
        'Risk att prata innan du tänkt klart',
      ],
      workContext:
        'Du trivs i sälj, kundkontakt, ledarskap, undervisning, kommunikation. Roller där du får interagera mycket med andra.',
    },
  },
  agreeableness: {
    low: {
      headline: 'Rak och självständig',
      description:
        'Du säger som det är och låter dig inte styras av vad andra tycker. Du värdesätter ärlighet framför harmoni.',
      strengths: [
        'Bra på att fatta tuffa beslut',
        'Står på dig under press',
        'Ärlig återkoppling',
      ],
      watchOuts: [
        'Kan uppfattas som direkt eller kall',
        'Risk att skapa onödiga konflikter',
      ],
      workContext:
        'Du fungerar bra i förhandling, ledarskap som kräver impopulära beslut, juridik, ekonomistyrning och konkurrensutsatta miljöer.',
    },
    mid: {
      headline: 'Samarbetsvillig men ärlig',
      description:
        'Du strävar efter gott samarbete utan att tappa din egen röst. Du säger din mening utan att trampa folk på tårna.',
      strengths: [
        'Bra balans mellan empati och rakhet',
        'Kan både samarbeta och stå på sig',
        'Pålitlig i konflikthantering',
      ],
      watchOuts: [
        'Kan behöva tänka aktivt på när du ska prioritera samarbete vs. tydlighet',
      ],
      workContext:
        'Du fungerar i de flesta yrken. Särskilt värdefull i ledar- och samordningsroller.',
    },
    high: {
      headline: 'Empatisk och samarbetsvillig',
      description:
        'Du värdesätter goda relationer och vill att alla ska må bra. Du är hjälpsam, omtänksam och bra på att läsa av andra.',
      strengths: [
        'Bra på samarbete och teamkänsla',
        'Empatisk och stöttande',
        'Skapar trygghet omkring dig',
      ],
      watchOuts: [
        'Kan ha svårt att säga nej',
        'Risk att hamna i andras prioriteringar istället för dina egna',
        'Konflikträdsla kan göra svåra samtal svåra',
      ],
      workContext:
        'Du trivs i människonära yrken — vård, utbildning, HR, kundtjänst, socialt arbete. Också värdefull i team där samarbete är avgörande.',
    },
  },
  neuroticism: {
    low: {
      headline: 'Lugn och stabil',
      description:
        'Du behåller fattningen även när det stormar. Stress och motgångar påverkar dig mindre än de flesta.',
      strengths: [
        'Stabil under press',
        'Hanterar motgångar bra',
        'Trygg i osäkra situationer',
      ],
      watchOuts: [
        'Kan ibland missa att andra inte hanterar press lika lugnt',
        'Risk att underskatta verkliga risker',
      ],
      workContext:
        'Du fungerar bra i akut-, krishanterings- och högtempo-miljöer. Också i roller med högt ansvar där lugn är värdefullt.',
    },
    mid: {
      headline: 'Normalt känslomässigt spann',
      description:
        'Du reagerar på påfrestningar som de flesta — du känner av stress men hanterar den oftast bra.',
      strengths: [
        'Realistisk uppfattning av risker och påfrestningar',
        'Empati för andras stress',
        'Balanserad emotionellt',
      ],
      watchOuts: [
        'Vissa stressiga perioder kan kännas tunga',
      ],
      workContext:
        'Du passar i de flesta yrkesmiljöer. Hittar din rytm i såväl lugna som mer pressande sammanhang.',
    },
    high: {
      headline: 'Känslig och uppmärksam',
      description:
        'Du känner djupt och reagerar starkt på påfrestningar. Det gör dig också uppmärksam på faror, detaljer och andras mående.',
      strengths: [
        'Hög känslomässig medvetenhet',
        'Bra på att uppmärksamma risker och problem',
        'Empatisk för andras stress',
      ],
      watchOuts: [
        'Stress och press kan kännas tungt',
        'Risk för grubbel och oro',
        'Behöver återhämtning för att hålla i längden',
      ],
      workContext:
        'Du fungerar bäst i miljöer med tydlighet, rimliga deadlines och stöd. Roller med extremt högt tempo eller stor osäkerhet kan kräva extra återhämtning.',
    },
  },
};

// ============================================================
// FACETTER (för avancerad)
// ============================================================

export const FACET_META: Record<Facet, { name: string; description: string }> = {
  // Neuroticism
  n1_anxiety: { name: 'Oro', description: 'Tendens att känna oro, rädsla och nervositet.' },
  n2_anger: { name: 'Lättirritation', description: 'Hur lätt du blir arg eller frustrerad.' },
  n3_depression: { name: 'Nedstämdhet', description: 'Tendens att känna sig låg eller modlös.' },
  n4_self_consciousness: { name: 'Genans', description: 'Hur självmedveten och blyg du är i sociala situationer.' },
  n5_immoderation: { name: 'Impulskontroll', description: 'Hur lätt du ger efter för impulser och frestelser.' },
  n6_vulnerability: { name: 'Stresskänslighet', description: 'Hur sårbar du är under press.' },
  // Extraversion
  e1_friendliness: { name: 'Värme', description: 'Hur vänlig och tillgänglig du är mot andra.' },
  e2_gregariousness: { name: 'Sällskaplighet', description: 'Hur mycket du söker sällskap med andra.' },
  e3_assertiveness: { name: 'Självhävdelse', description: 'Hur mycket du tar plats och leder.' },
  e4_activity_level: { name: 'Aktivitetsnivå', description: 'Ditt energi- och tempotempo i livet.' },
  e5_excitement_seeking: { name: 'Spänningssökande', description: 'Hur mycket du dras till risk och adrenalin.' },
  e6_cheerfulness: { name: 'Glädje', description: 'Hur ofta du upplever positiva känslor.' },
  // Openness
  o1_imagination: { name: 'Fantasi', description: 'Hur livlig din inre föreställningsvärld är.' },
  o2_artistic_interests: { name: 'Estetik', description: 'Hur mycket du värdesätter konst och skönhet.' },
  o3_emotionality: { name: 'Känslomedvetenhet', description: 'Hur väl du känner och kan benämna dina känslor.' },
  o4_adventurousness: { name: 'Äventyrslust', description: 'Hur öppen du är för nya upplevelser.' },
  o5_intellect: { name: 'Intellekt', description: 'Hur mycket du dras till abstrakt tänkande och idéer.' },
  o6_liberalism: { name: 'Värderingsöppenhet', description: 'Hur öppen du är för att utmana traditioner.' },
  // Agreeableness
  a1_trust: { name: 'Tillit', description: 'Hur mycket du litar på andra människor.' },
  a2_morality: { name: 'Rakhet', description: 'Hur ärlig och rättfram du är.' },
  a3_altruism: { name: 'Hjälpsamhet', description: 'Hur mycket du ställer upp för andra.' },
  a4_cooperation: { name: 'Samarbetsvilja', description: 'Hur gärna du söker harmoni framför konflikt.' },
  a5_modesty: { name: 'Anspråkslöshet', description: 'Hur lite du framhäver dig själv.' },
  a6_sympathy: { name: 'Medkänsla', description: 'Hur mycket du berörs av andras lidande.' },
  // Conscientiousness
  c1_self_efficacy: { name: 'Självtillit', description: 'Hur mycket du tror på din egen förmåga.' },
  c2_orderliness: { name: 'Ordning', description: 'Hur mycket struktur och ordning du föredrar.' },
  c3_dutifulness: { name: 'Plikttrogenhet', description: 'Hur mycket du följer löften och regler.' },
  c4_achievement_striving: { name: 'Prestationsdrift', description: 'Hur mycket du strävar efter att uppnå mer.' },
  c5_self_discipline: { name: 'Självdisciplin', description: 'Hur mycket du fullföljer det du börjat.' },
  c6_cautiousness: { name: 'Eftertänksamhet', description: 'Hur mycket du tänker innan du handlar.' },
};

export function topFacets(
  facetScores: FacetScores,
  count: number = 5
): Array<{ facet: Facet; score: number }> {
  return Object.entries(facetScores)
    .map(([facet, score]) => ({ facet: facet as Facet, score: score as number }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function bottomFacets(
  facetScores: FacetScores,
  count: number = 5
): Array<{ facet: Facet; score: number }> {
  return Object.entries(facetScores)
    .map(([facet, score]) => ({ facet: facet as Facet, score: score as number }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

// ============================================================
// INTERVJU-TIPS PER PROFIL
// ============================================================

export function interviewTips(scores: BigFiveScores): string[] {
  const tips: string[] = [];

  if (scores.conscientiousness >= 70) {
    tips.push(
      'Lyft fram konkreta exempel där din noggrannhet och uthållighet gjort skillnad — t.ex. projekt du fört i hamn trots motstånd.'
    );
  } else if (scores.conscientiousness < 40) {
    tips.push(
      'Prata om hur du kompenserar för din flexibla stil — t.ex. system, externa deadlines eller verktyg du använder för att hålla struktur.'
    );
  }

  if (scores.extraversion >= 70) {
    tips.push(
      'Din sociala energi kommer fram naturligt — fokusera på att lyssna lika mycket som du pratar i intervjun.'
    );
  } else if (scores.extraversion < 40) {
    tips.push(
      'Förbered berättelser i förväg så du har dem nära till hands. Reflekterande stil är en styrka — visa det genom att svara genomtänkt.'
    );
  }

  if (scores.openness >= 70) {
    tips.push(
      'Visa hur din nyfikenhet leder till konkreta resultat — inte bara idéer, utan implementerade lösningar.'
    );
  }

  if (scores.agreeableness < 40) {
    tips.push(
      'Din rakhet är värdefull, men förpacka den med konstruktiv ton i intervjun. Visa exempel där din ärlighet ledde till bättre beslut.'
    );
  } else if (scores.agreeableness >= 70) {
    tips.push(
      'Visa att du kan ta tuffa beslut även när det är obekvämt — annars kan din samarbetsvilja misstolkas som konflikträdsla.'
    );
  }

  if (scores.neuroticism >= 70) {
    tips.push(
      'Ha tekniker för att hantera nervositet före intervjun — andning, förberedelse, kommer-tidigt. Din uppmärksamhet på detaljer är en styrka du kan lyfta.'
    );
  } else if (scores.neuroticism < 30) {
    tips.push(
      'Din lugna stil är en tillgång. Var noga med att också visa engagemang — för lågmäld energi kan missuppfattas som ointresse.'
    );
  }

  if (tips.length === 0) {
    tips.push(
      'Din balanserade profil ger dig bredd. Anpassa stilen efter rollens karaktär — mer rakhet i ledarroller, mer empati i kundnära.'
    );
  }

  return tips;
}
