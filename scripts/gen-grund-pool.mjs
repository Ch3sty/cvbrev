// Generera grundnivåns 3c-frågor (våg 3c, spec-rummen avsnitt 6).
//
// Kör: node scripts/gen-grund-pool.mjs
//
// Skriver src/lib/logicTestV7/questionBankGrund3c.v7.json. Ursprungsbanken
// (questionBankGrund.v7.json, 28 frågor) rörs inte; family och misstag på den
// sätts av scripts/berika-v7-banker.mjs. Recepten står i
// scripts/lib/matris/recept.mjs, byggarna i scripts/lib/matris/generera.mjs.
import { genereraNiva } from './lib/matris/kor-generator.mjs';

genereraNiva('grund');
