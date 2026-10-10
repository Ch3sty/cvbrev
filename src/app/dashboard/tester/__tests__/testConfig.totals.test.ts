// Antalet frågor i testConfig styr både löftet i hubben ("32 frågor") och
// procenten på resultatsidan (poäng / totalQuestions). Urvalet bestämmer hur
// många frågor testet faktiskt har. De två ska alltid vara samma tal: när
// urvalet gick från 6 till 8 passager i juni stod konfigen kvar på 24, och
// 31 rätt visades som "31 av 24, 100 procent" (2026-10-10).

import { describe, it, expect } from 'vitest'
import { getTestConfig } from '../testConfig'
import { TOTAL_QUESTIONS as NUM_GRUND } from '@/lib/numericalTest/selectPassages'
import { TOTAL_QUESTIONS as NUM_AVANCERAD } from '@/lib/numericalTestV2/selectPassages'
import { TOTAL_QUESTIONS as NUM_EXPERT } from '@/lib/numericalTestExpert/selectPassages'
import { PROV_TOTAL_QUESTIONS as NUM_PROV } from '@/lib/numericalTestProv/selectProv'
import { QUESTIONS_PER_SESSION as MATRIS } from '@/lib/logicTestV7/selectQuestions.v7'

describe('testConfig.totalQuestions följer urvalet', () => {
  it.each([
    ['numeriskt-test', NUM_GRUND],
    ['numeriskt-test-v2', NUM_AVANCERAD],
    ['numeriskt-test-expert', NUM_EXPERT],
    ['numeriskt-test-prov', NUM_PROV],
    ['matrislogik-grund', MATRIS],
    ['matrislogik-avancerad', MATRIS],
    ['matrislogik-expert', MATRIS],
  ])('%s', (slug, faktiskt) => {
    expect(getTestConfig(slug)?.totalQuestions).toBe(faktiskt)
  })
})
