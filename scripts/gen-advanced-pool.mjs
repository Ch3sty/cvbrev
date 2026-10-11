// Generera avancerad nivås 3c-frågor (våg 3c, spec-rummen avsnitt 6).
//
// Kör: node scripts/gen-advanced-pool.mjs
//
// Skriver src/lib/logicTestV7/questionBankAvancerad3c.v7.json.
//
// Tidigare skrev det här skriptet om questionBank.v7.json (avancerad, 28
// frågor) från grunden. Den banken är nu fryst: sessioner härleder sitt urval
// ur den, och den har handredigerats efter genereringen. Den gamla
// generatorn finns i git-historiken (commit 2277b833 och framåt). family och
// misstag på de 28 sätts av scripts/berika-v7-banker.mjs.
import { genereraNiva } from './lib/matris/kor-generator.mjs';

genereraNiva('avancerad');
