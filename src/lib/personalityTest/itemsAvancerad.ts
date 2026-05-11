// IPIP-NEO-120 (Big Five + 30 facetter, 120 items)
// Public domain via International Personality Item Pool (https://ipip.ori.org)
// Svensk översättning, naturligt formulerad.
//
// 4 items per facett × 30 facetter = 120 items.
// Varje facett mappar till en av Big Five-dimensionerna.

import type { PersonalityItem } from './types';

export const ITEMS_AVANCERAD: PersonalityItem[] = [
  // ============================================================
  // NEUROTICISM
  // ============================================================

  // N1: Anxiety (oro)
  { id: 'a-001', dimension: 'neuroticism', facet: 'n1_anxiety', reverse: false, text: 'Jag oroar mig för saker.' },
  { id: 'a-002', dimension: 'neuroticism', facet: 'n1_anxiety', reverse: false, text: 'Jag är rädd för många saker.' },
  { id: 'a-003', dimension: 'neuroticism', facet: 'n1_anxiety', reverse: true,  text: 'Jag är inte lätt att skrämma.' },
  { id: 'a-004', dimension: 'neuroticism', facet: 'n1_anxiety', reverse: true,  text: 'Jag är inte särskilt orolig av mig.' },

  // N2: Anger (lättirriterad)
  { id: 'a-005', dimension: 'neuroticism', facet: 'n2_anger', reverse: false, text: 'Jag blir lätt arg.' },
  { id: 'a-006', dimension: 'neuroticism', facet: 'n2_anger', reverse: false, text: 'Jag tappar humöret.' },
  { id: 'a-007', dimension: 'neuroticism', facet: 'n2_anger', reverse: true,  text: 'Jag tappar sällan humöret.' },
  { id: 'a-008', dimension: 'neuroticism', facet: 'n2_anger', reverse: true,  text: 'Jag är inte lätt att reta upp.' },

  // N3: Depression (nedstämdhet)
  { id: 'a-009', dimension: 'neuroticism', facet: 'n3_depression', reverse: false, text: 'Jag känner mig ofta nedstämd.' },
  { id: 'a-010', dimension: 'neuroticism', facet: 'n3_depression', reverse: false, text: 'Jag har svårt att se ljusa sidor av livet.' },
  { id: 'a-011', dimension: 'neuroticism', facet: 'n3_depression', reverse: true,  text: 'Jag är sällan ledsen utan anledning.' },
  { id: 'a-012', dimension: 'neuroticism', facet: 'n3_depression', reverse: true,  text: 'Jag känner mig oftast belåten med tillvaron.' },

  // N4: Self-consciousness (genans)
  { id: 'a-013', dimension: 'neuroticism', facet: 'n4_self_consciousness', reverse: false, text: 'Jag är rädd för att göra bort mig.' },
  { id: 'a-014', dimension: 'neuroticism', facet: 'n4_self_consciousness', reverse: false, text: 'Jag oroar mig för vad andra tycker om mig.' },
  { id: 'a-015', dimension: 'neuroticism', facet: 'n4_self_consciousness', reverse: true,  text: 'Jag generar mig sällan.' },
  { id: 'a-016', dimension: 'neuroticism', facet: 'n4_self_consciousness', reverse: true,  text: 'Jag är inte särskilt blyg.' },

  // N5: Immoderation (impulskontroll)
  { id: 'a-017', dimension: 'neuroticism', facet: 'n5_immoderation', reverse: false, text: 'Jag äter ofta för mycket.' },
  { id: 'a-018', dimension: 'neuroticism', facet: 'n5_immoderation', reverse: false, text: 'Jag handlar impulsivt och ångrar det sedan.' },
  { id: 'a-019', dimension: 'neuroticism', facet: 'n5_immoderation', reverse: true,  text: 'Jag kan stå emot frestelser.' },
  { id: 'a-020', dimension: 'neuroticism', facet: 'n5_immoderation', reverse: true,  text: 'Jag har god självkontroll.' },

  // N6: Vulnerability (sårbarhet under stress)
  { id: 'a-021', dimension: 'neuroticism', facet: 'n6_vulnerability', reverse: false, text: 'Jag blir lätt panikslagen.' },
  { id: 'a-022', dimension: 'neuroticism', facet: 'n6_vulnerability', reverse: false, text: 'Jag har svårt att hantera press.' },
  { id: 'a-023', dimension: 'neuroticism', facet: 'n6_vulnerability', reverse: true,  text: 'Jag håller huvudet kallt under press.' },
  { id: 'a-024', dimension: 'neuroticism', facet: 'n6_vulnerability', reverse: true,  text: 'Jag står stadigt även när allt rasar omkring mig.' },

  // ============================================================
  // EXTRAVERSION
  // ============================================================

  // E1: Friendliness (vänlighet/värme)
  { id: 'a-025', dimension: 'extraversion', facet: 'e1_friendliness', reverse: false, text: 'Jag får lätt vänner.' },
  { id: 'a-026', dimension: 'extraversion', facet: 'e1_friendliness', reverse: false, text: 'Jag visar gärna att jag tycker om människor.' },
  { id: 'a-027', dimension: 'extraversion', facet: 'e1_friendliness', reverse: true,  text: 'Jag håller mig på avstånd från andra.' },
  { id: 'a-028', dimension: 'extraversion', facet: 'e1_friendliness', reverse: true,  text: 'Jag har svårt att närma mig nya människor.' },

  // E2: Gregariousness (sällskaplighet)
  { id: 'a-029', dimension: 'extraversion', facet: 'e2_gregariousness', reverse: false, text: 'Jag trivs i stora sällskap.' },
  { id: 'a-030', dimension: 'extraversion', facet: 'e2_gregariousness', reverse: false, text: 'Jag söker mig till folksamlingar.' },
  { id: 'a-031', dimension: 'extraversion', facet: 'e2_gregariousness', reverse: true,  text: 'Jag undviker folksamlingar.' },
  { id: 'a-032', dimension: 'extraversion', facet: 'e2_gregariousness', reverse: true,  text: 'Jag föredrar att vara ensam.' },

  // E3: Assertiveness (självhävdelse)
  { id: 'a-033', dimension: 'extraversion', facet: 'e3_assertiveness', reverse: false, text: 'Jag tar ledningen i grupper.' },
  { id: 'a-034', dimension: 'extraversion', facet: 'e3_assertiveness', reverse: false, text: 'Jag tar ansvar och styr upp situationer.' },
  { id: 'a-035', dimension: 'extraversion', facet: 'e3_assertiveness', reverse: true,  text: 'Jag väntar på att andra ska ta initiativ.' },
  { id: 'a-036', dimension: 'extraversion', facet: 'e3_assertiveness', reverse: true,  text: 'Jag har svårt att hävda min åsikt.' },

  // E4: Activity level (aktivitetsnivå)
  { id: 'a-037', dimension: 'extraversion', facet: 'e4_activity_level', reverse: false, text: 'Jag är alltid sysselsatt med något.' },
  { id: 'a-038', dimension: 'extraversion', facet: 'e4_activity_level', reverse: false, text: 'Jag har högt tempo i det jag gör.' },
  { id: 'a-039', dimension: 'extraversion', facet: 'e4_activity_level', reverse: true,  text: 'Jag tar det lugnt i livet.' },
  { id: 'a-040', dimension: 'extraversion', facet: 'e4_activity_level', reverse: true,  text: 'Jag gör inte mer än vad som krävs.' },

  // E5: Excitement-seeking (spänningssökande)
  { id: 'a-041', dimension: 'extraversion', facet: 'e5_excitement_seeking', reverse: false, text: 'Jag söker äventyr och spänning.' },
  { id: 'a-042', dimension: 'extraversion', facet: 'e5_excitement_seeking', reverse: false, text: 'Jag tycker om risk och adrenalin.' },
  { id: 'a-043', dimension: 'extraversion', facet: 'e5_excitement_seeking', reverse: true,  text: 'Jag undviker farliga situationer.' },
  { id: 'a-044', dimension: 'extraversion', facet: 'e5_excitement_seeking', reverse: true,  text: 'Jag föredrar trygghet framför spänning.' },

  // E6: Cheerfulness (glättighet)
  { id: 'a-045', dimension: 'extraversion', facet: 'e6_cheerfulness', reverse: false, text: 'Jag har ofta roligt.' },
  { id: 'a-046', dimension: 'extraversion', facet: 'e6_cheerfulness', reverse: false, text: 'Jag känner mig glad och positiv.' },
  { id: 'a-047', dimension: 'extraversion', facet: 'e6_cheerfulness', reverse: true,  text: 'Jag är sällan riktigt entusiastisk.' },
  { id: 'a-048', dimension: 'extraversion', facet: 'e6_cheerfulness', reverse: true,  text: 'Jag visar sällan stark glädje.' },

  // ============================================================
  // OPENNESS
  // ============================================================

  // O1: Imagination (fantasi)
  { id: 'a-049', dimension: 'openness', facet: 'o1_imagination', reverse: false, text: 'Jag har en livlig fantasi.' },
  { id: 'a-050', dimension: 'openness', facet: 'o1_imagination', reverse: false, text: 'Jag dagdrömmer ofta.' },
  { id: 'a-051', dimension: 'openness', facet: 'o1_imagination', reverse: true,  text: 'Jag har svårt att föreställa mig saker som inte finns.' },
  { id: 'a-052', dimension: 'openness', facet: 'o1_imagination', reverse: true,  text: 'Jag är ganska jordnära och praktisk.' },

  // O2: Artistic interests (estetik)
  { id: 'a-053', dimension: 'openness', facet: 'o2_artistic_interests', reverse: false, text: 'Jag tycker om konst och estetik.' },
  { id: 'a-054', dimension: 'openness', facet: 'o2_artistic_interests', reverse: false, text: 'Jag berörs av musik och poesi.' },
  { id: 'a-055', dimension: 'openness', facet: 'o2_artistic_interests', reverse: true,  text: 'Jag bryr mig inte mycket om konst.' },
  { id: 'a-056', dimension: 'openness', facet: 'o2_artistic_interests', reverse: true,  text: 'Jag förstår sällan vad andra ser i poesi.' },

  // O3: Emotionality (känsloöppenhet)
  { id: 'a-057', dimension: 'openness', facet: 'o3_emotionality', reverse: false, text: 'Jag är medveten om mina egna känslor.' },
  { id: 'a-058', dimension: 'openness', facet: 'o3_emotionality', reverse: false, text: 'Jag känner djupt när jag berörs.' },
  { id: 'a-059', dimension: 'openness', facet: 'o3_emotionality', reverse: true,  text: 'Jag har svårt att sätta ord på vad jag känner.' },
  { id: 'a-060', dimension: 'openness', facet: 'o3_emotionality', reverse: true,  text: 'Jag bryr mig inte särskilt om mina känslor.' },

  // O4: Adventurousness (öppenhet för nytt)
  { id: 'a-061', dimension: 'openness', facet: 'o4_adventurousness', reverse: false, text: 'Jag gillar att prova nya saker.' },
  { id: 'a-062', dimension: 'openness', facet: 'o4_adventurousness', reverse: false, text: 'Jag vill se nya platser.' },
  { id: 'a-063', dimension: 'openness', facet: 'o4_adventurousness', reverse: true,  text: 'Jag håller mig till rutiner.' },
  { id: 'a-064', dimension: 'openness', facet: 'o4_adventurousness', reverse: true,  text: 'Jag är obekväm med förändringar.' },

  // O5: Intellect (intellekt)
  { id: 'a-065', dimension: 'openness', facet: 'o5_intellect', reverse: false, text: 'Jag gillar att lösa komplexa problem.' },
  { id: 'a-066', dimension: 'openness', facet: 'o5_intellect', reverse: false, text: 'Jag funderar gärna på filosofiska frågor.' },
  { id: 'a-067', dimension: 'openness', facet: 'o5_intellect', reverse: true,  text: 'Jag är inte intresserad av abstrakta idéer.' },
  { id: 'a-068', dimension: 'openness', facet: 'o5_intellect', reverse: true,  text: 'Jag undviker svåra texter och teorier.' },

  // O6: Liberalism (värderingar)
  { id: 'a-069', dimension: 'openness', facet: 'o6_liberalism', reverse: false, text: 'Jag ifrågasätter gärna traditioner.' },
  { id: 'a-070', dimension: 'openness', facet: 'o6_liberalism', reverse: false, text: 'Jag är öppen för nya sätt att se på livet.' },
  { id: 'a-071', dimension: 'openness', facet: 'o6_liberalism', reverse: true,  text: 'Jag tycker att gamla värderingar är bäst.' },
  { id: 'a-072', dimension: 'openness', facet: 'o6_liberalism', reverse: true,  text: 'Jag tror på att det mesta ska förbli som det är.' },

  // ============================================================
  // AGREEABLENESS
  // ============================================================

  // A1: Trust (tillit)
  { id: 'a-073', dimension: 'agreeableness', facet: 'a1_trust', reverse: false, text: 'Jag litar på andra människor.' },
  { id: 'a-074', dimension: 'agreeableness', facet: 'a1_trust', reverse: false, text: 'Jag tror att människor i grunden är goda.' },
  { id: 'a-075', dimension: 'agreeableness', facet: 'a1_trust', reverse: true,  text: 'Jag är skeptisk till andras motiv.' },
  { id: 'a-076', dimension: 'agreeableness', facet: 'a1_trust', reverse: true,  text: 'Jag har svårt att lita på främlingar.' },

  // A2: Morality (rakhet/ärlighet)
  { id: 'a-077', dimension: 'agreeableness', facet: 'a2_morality', reverse: false, text: 'Jag är rak och ärlig.' },
  { id: 'a-078', dimension: 'agreeableness', facet: 'a2_morality', reverse: false, text: 'Jag säger som det är, även när det är obekvämt.' },
  { id: 'a-079', dimension: 'agreeableness', facet: 'a2_morality', reverse: true,  text: 'Jag kan vara manipulativ om det gynnar mig.' },
  { id: 'a-080', dimension: 'agreeableness', facet: 'a2_morality', reverse: true,  text: 'Jag säger ibland det folk vill höra istället för sanningen.' },

  // A3: Altruism (hjälpsamhet)
  { id: 'a-081', dimension: 'agreeableness', facet: 'a3_altruism', reverse: false, text: 'Jag tycker om att hjälpa andra.' },
  { id: 'a-082', dimension: 'agreeableness', facet: 'a3_altruism', reverse: false, text: 'Jag ställer upp när någon behöver mig.' },
  { id: 'a-083', dimension: 'agreeableness', facet: 'a3_altruism', reverse: true,  text: 'Jag bryr mig inte mycket om andras problem.' },
  { id: 'a-084', dimension: 'agreeableness', facet: 'a3_altruism', reverse: true,  text: 'Jag prioriterar mitt eget framför andras.' },

  // A4: Cooperation (samarbetsvilja)
  { id: 'a-085', dimension: 'agreeableness', facet: 'a4_cooperation', reverse: false, text: 'Jag undviker konflikter när jag kan.' },
  { id: 'a-086', dimension: 'agreeableness', facet: 'a4_cooperation', reverse: false, text: 'Jag söker kompromisser.' },
  { id: 'a-087', dimension: 'agreeableness', facet: 'a4_cooperation', reverse: true,  text: 'Jag tycker om att argumentera.' },
  { id: 'a-088', dimension: 'agreeableness', facet: 'a4_cooperation', reverse: true,  text: 'Jag står på mig även om det skapar bråk.' },

  // A5: Modesty (anspråkslöshet)
  { id: 'a-089', dimension: 'agreeableness', facet: 'a5_modesty', reverse: false, text: 'Jag undviker att tala om mig själv.' },
  { id: 'a-090', dimension: 'agreeableness', facet: 'a5_modesty', reverse: false, text: 'Jag försöker hålla mig i bakgrunden.' },
  { id: 'a-091', dimension: 'agreeableness', facet: 'a5_modesty', reverse: true,  text: 'Jag tycker att jag är bättre än de flesta.' },
  { id: 'a-092', dimension: 'agreeableness', facet: 'a5_modesty', reverse: true,  text: 'Jag berättar gärna om mina framgångar.' },

  // A6: Sympathy (medkänsla)
  { id: 'a-093', dimension: 'agreeableness', facet: 'a6_sympathy', reverse: false, text: 'Jag känner med dem som har det svårt.' },
  { id: 'a-094', dimension: 'agreeableness', facet: 'a6_sympathy', reverse: false, text: 'Jag berörs av andras smärta.' },
  { id: 'a-095', dimension: 'agreeableness', facet: 'a6_sympathy', reverse: true,  text: 'Jag är inte påverkad av andras sorg.' },
  { id: 'a-096', dimension: 'agreeableness', facet: 'a6_sympathy', reverse: true,  text: 'Jag tycker att man får skylla sig själv om man hamnar i trubbel.' },

  // ============================================================
  // CONSCIENTIOUSNESS
  // ============================================================

  // C1: Self-efficacy (tilltro till egen förmåga)
  { id: 'a-097', dimension: 'conscientiousness', facet: 'c1_self_efficacy', reverse: false, text: 'Jag litar på att jag klarar de uppgifter jag tar mig an.' },
  { id: 'a-098', dimension: 'conscientiousness', facet: 'c1_self_efficacy', reverse: false, text: 'Jag är säker på min egen förmåga.' },
  { id: 'a-099', dimension: 'conscientiousness', facet: 'c1_self_efficacy', reverse: true,  text: 'Jag tvivlar ofta på min förmåga.' },
  { id: 'a-100', dimension: 'conscientiousness', facet: 'c1_self_efficacy', reverse: true,  text: 'Jag känner mig osäker när jag står inför nya uppgifter.' },

  // C2: Orderliness (ordning)
  { id: 'a-101', dimension: 'conscientiousness', facet: 'c2_orderliness', reverse: false, text: 'Jag håller ordning omkring mig.' },
  { id: 'a-102', dimension: 'conscientiousness', facet: 'c2_orderliness', reverse: false, text: 'Jag tycker om struktur och system.' },
  { id: 'a-103', dimension: 'conscientiousness', facet: 'c2_orderliness', reverse: true,  text: 'Jag lämnar saker stökigt.' },
  { id: 'a-104', dimension: 'conscientiousness', facet: 'c2_orderliness', reverse: true,  text: 'Jag har sällan ordning på mina papper.' },

  // C3: Dutifulness (plikttrogenhet)
  { id: 'a-105', dimension: 'conscientiousness', facet: 'c3_dutifulness', reverse: false, text: 'Jag håller mina löften.' },
  { id: 'a-106', dimension: 'conscientiousness', facet: 'c3_dutifulness', reverse: false, text: 'Jag följer regler och normer.' },
  { id: 'a-107', dimension: 'conscientiousness', facet: 'c3_dutifulness', reverse: true,  text: 'Jag bryter mot regler när det passar mig.' },
  { id: 'a-108', dimension: 'conscientiousness', facet: 'c3_dutifulness', reverse: true,  text: 'Jag drar mig undan ansvar.' },

  // C4: Achievement-striving (prestationsdrift)
  { id: 'a-109', dimension: 'conscientiousness', facet: 'c4_achievement_striving', reverse: false, text: 'Jag jobbar hårt för att nå mina mål.' },
  { id: 'a-110', dimension: 'conscientiousness', facet: 'c4_achievement_striving', reverse: false, text: 'Jag sätter höga krav på mig själv.' },
  { id: 'a-111', dimension: 'conscientiousness', facet: 'c4_achievement_striving', reverse: true,  text: 'Jag nöjer mig med att klara det grundläggande.' },
  { id: 'a-112', dimension: 'conscientiousness', facet: 'c4_achievement_striving', reverse: true,  text: 'Jag är inte särskilt ambitiös.' },

  // C5: Self-discipline (självdisciplin)
  { id: 'a-113', dimension: 'conscientiousness', facet: 'c5_self_discipline', reverse: false, text: 'Jag gör klart det jag börjat med.' },
  { id: 'a-114', dimension: 'conscientiousness', facet: 'c5_self_discipline', reverse: false, text: 'Jag kan hålla mig till en uppgift även när det är tråkigt.' },
  { id: 'a-115', dimension: 'conscientiousness', facet: 'c5_self_discipline', reverse: true,  text: 'Jag skjuter upp saker tills sista minuten.' },
  { id: 'a-116', dimension: 'conscientiousness', facet: 'c5_self_discipline', reverse: true,  text: 'Jag tappar sugen halvvägs.' },

  // C6: Cautiousness (eftertänksamhet)
  { id: 'a-117', dimension: 'conscientiousness', facet: 'c6_cautiousness', reverse: false, text: 'Jag tänker efter innan jag handlar.' },
  { id: 'a-118', dimension: 'conscientiousness', facet: 'c6_cautiousness', reverse: false, text: 'Jag väger för- och nackdelar innan jag bestämmer mig.' },
  { id: 'a-119', dimension: 'conscientiousness', facet: 'c6_cautiousness', reverse: true,  text: 'Jag handlar utan att tänka efter.' },
  { id: 'a-120', dimension: 'conscientiousness', facet: 'c6_cautiousness', reverse: true,  text: 'Jag tar förhastade beslut.' },
];
