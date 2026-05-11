// IPIP-NEO-50 (Big Five Aspects, 50 items)
// Public domain via International Personality Item Pool (https://ipip.ori.org)
// Svensk översättning – formulerad naturligt och utan psykologi-jargong.
//
// Skala: 1 (stämmer inte alls) - 5 (stämmer perfekt)
// 10 items per dimension, varav 5 reverse-coded.

import type { PersonalityItem } from './types';

export const ITEMS_GRUND: PersonalityItem[] = [
  // ============ EXTRAVERSION (10) ============
  { id: 'g-01', dimension: 'extraversion', reverse: false, text: 'Jag är den som ofta drar igång samtal.' },
  { id: 'g-02', dimension: 'extraversion', reverse: true,  text: 'Jag pratar inte särskilt mycket.' },
  { id: 'g-03', dimension: 'extraversion', reverse: false, text: 'Jag trivs i sällskap med många människor.' },
  { id: 'g-04', dimension: 'extraversion', reverse: true,  text: 'Jag håller mig gärna i bakgrunden.' },
  { id: 'g-05', dimension: 'extraversion', reverse: false, text: 'Jag tar lätt initiativ i grupper.' },
  { id: 'g-06', dimension: 'extraversion', reverse: true,  text: 'Jag har inte mycket att säga i nya sammanhang.' },
  { id: 'g-07', dimension: 'extraversion', reverse: false, text: 'Jag pratar gärna med främlingar.' },
  { id: 'g-08', dimension: 'extraversion', reverse: true,  text: 'Jag föredrar lugna kvällar hemma framför fester.' },
  { id: 'g-09', dimension: 'extraversion', reverse: false, text: 'Jag känner mig fylld av energi i livliga miljöer.' },
  { id: 'g-10', dimension: 'extraversion', reverse: true,  text: 'Jag tycker att jag är ganska tystlåten.' },

  // ============ AGREEABLENESS / VÄNLIGHET (10) ============
  { id: 'g-11', dimension: 'agreeableness', reverse: false, text: 'Jag bryr mig genuint om hur andra mår.' },
  { id: 'g-12', dimension: 'agreeableness', reverse: true,  text: 'Jag är inte särskilt intresserad av andras problem.' },
  { id: 'g-13', dimension: 'agreeableness', reverse: false, text: 'Jag är hjälpsam och ställer upp för andra.' },
  { id: 'g-14', dimension: 'agreeableness', reverse: true,  text: 'Jag tycker att de flesta är ute efter sitt eget bästa.' },
  { id: 'g-15', dimension: 'agreeableness', reverse: false, text: 'Jag tar mig tid att lyssna på andra.' },
  { id: 'g-16', dimension: 'agreeableness', reverse: true,  text: 'Jag har ganska lätt för att förolämpa andra.' },
  { id: 'g-17', dimension: 'agreeableness', reverse: false, text: 'Jag försöker se det bästa i människor.' },
  { id: 'g-18', dimension: 'agreeableness', reverse: true,  text: 'Jag har svårt att bry mig om personer jag inte känner.' },
  { id: 'g-19', dimension: 'agreeableness', reverse: false, text: 'Jag samarbetar gärna och söker kompromisser.' },
  { id: 'g-20', dimension: 'agreeableness', reverse: true,  text: 'Jag kan vara hård och kritisk mot andra.' },

  // ============ CONSCIENTIOUSNESS / SAMVETSGRANNHET (10) ============
  { id: 'g-21', dimension: 'conscientiousness', reverse: false, text: 'Jag är alltid förberedd när jag ska göra något viktigt.' },
  { id: 'g-22', dimension: 'conscientiousness', reverse: true,  text: 'Jag lämnar ofta saker stökigt omkring mig.' },
  { id: 'g-23', dimension: 'conscientiousness', reverse: false, text: 'Jag är noggrann med detaljer.' },
  { id: 'g-24', dimension: 'conscientiousness', reverse: true,  text: 'Jag skjuter ofta upp saker.' },
  { id: 'g-25', dimension: 'conscientiousness', reverse: false, text: 'Jag följer en plan när jag har bestämt mig.' },
  { id: 'g-26', dimension: 'conscientiousness', reverse: true,  text: 'Jag glömmer ofta lägga tillbaka saker där de hör hemma.' },
  { id: 'g-27', dimension: 'conscientiousness', reverse: false, text: 'Jag gör mitt jobb grundligt.' },
  { id: 'g-28', dimension: 'conscientiousness', reverse: true,  text: 'Jag struntar i regler jag tycker är onödiga.' },
  { id: 'g-29', dimension: 'conscientiousness', reverse: false, text: 'Jag håller mig till mina åtaganden.' },
  { id: 'g-30', dimension: 'conscientiousness', reverse: true,  text: 'Jag tappar lätt fokus.' },

  // ============ NEUROTICISM / KÄNSLOMÄSSIG SÄRBARHET (10) ============
  { id: 'g-31', dimension: 'neuroticism', reverse: false, text: 'Jag oroar mig lätt över saker.' },
  { id: 'g-32', dimension: 'neuroticism', reverse: true,  text: 'Jag är oftast avspänd.' },
  { id: 'g-33', dimension: 'neuroticism', reverse: false, text: 'Jag blir lätt stressad.' },
  { id: 'g-34', dimension: 'neuroticism', reverse: true,  text: 'Jag tappar sällan humöret.' },
  { id: 'g-35', dimension: 'neuroticism', reverse: false, text: 'Mina känslor svänger ofta.' },
  { id: 'g-36', dimension: 'neuroticism', reverse: true,  text: 'Jag känner mig sällan nedstämd.' },
  { id: 'g-37', dimension: 'neuroticism', reverse: false, text: 'Jag grubblar mycket på saker.' },
  { id: 'g-38', dimension: 'neuroticism', reverse: true,  text: 'Jag hanterar motgångar utan att tappa fattningen.' },
  { id: 'g-39', dimension: 'neuroticism', reverse: false, text: 'Jag blir lätt irriterad.' },
  { id: 'g-40', dimension: 'neuroticism', reverse: true,  text: 'Jag är trygg i mig själv även när saker går fel.' },

  // ============ OPENNESS / ÖPPENHET (10) ============
  { id: 'g-41', dimension: 'openness', reverse: false, text: 'Jag har ett rikt ordförråd och gillar att uttrycka mig.' },
  { id: 'g-42', dimension: 'openness', reverse: true,  text: 'Jag är inte särskilt intresserad av abstrakta idéer.' },
  { id: 'g-43', dimension: 'openness', reverse: false, text: 'Jag har livlig fantasi.' },
  { id: 'g-44', dimension: 'openness', reverse: true,  text: 'Jag föredrar det välbekanta framför det nya.' },
  { id: 'g-45', dimension: 'openness', reverse: false, text: 'Jag funderar gärna på filosofiska frågor.' },
  { id: 'g-46', dimension: 'openness', reverse: true,  text: 'Jag har svårt att förstå konst eller poesi.' },
  { id: 'g-47', dimension: 'openness', reverse: false, text: 'Jag är nyfiken på många olika saker.' },
  { id: 'g-48', dimension: 'openness', reverse: true,  text: 'Jag tycker att teoretiska diskussioner är slöseri med tid.' },
  { id: 'g-49', dimension: 'openness', reverse: false, text: 'Jag uppskattar skönheten i naturen och konsten.' },
  { id: 'g-50', dimension: 'openness', reverse: true,  text: 'Jag tänker hellre konkret än abstrakt.' },
];
