/**
 * Facit i matrislogiken får inte hamna i klientpaketet.
 *
 * Banken (questionBank*.v7.json) har correctAnswer per fråga. Importeras den,
 * direkt eller via urvalet, från en 'use client'-fil följer den med till
 * webbläsaren, och då hjälper ingen blandning: urvalet och ordningen går att
 * räkna fram ur sessionId. Frågorna byggs därför på servern
 * (fragor.server.ts) och klienten får dem utan facit.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROT = join(__dirname, '..', '..', '..')

function filer(dir: string): string[] {
  return readdirSync(dir).flatMap((namn) => {
    const p = join(dir, namn)
    if (statSync(p).isDirectory()) return namn === 'node_modules' ? [] : filer(p)
    return /\.(ts|tsx)$/.test(namn) ? [p] : []
  })
}

const FORBJUDNA = [
  /logicTestV7\/questionBank[A-Za-z0-9]*\.v7(\.json)?['"]/,
  /logicTestV7\/selectQuestions\.v7['"]/,
  /logicTestV7\/selectProv\.v7['"]/,
  /logicTestV7\/fragor\.server['"]/,
  /logicTestV5\/questionBank\.v5(\.json)?['"]/,
]

describe('klientpaketet', () => {
  it('ingen klientkomponent importerar matrisbanken eller urvalet', () => {
    const brott: string[] = []
    for (const fil of filer(ROT)) {
      const text = readFileSync(fil, 'utf8')
      if (!/^\s*['"]use client['"]/m.test(text.slice(0, 400))) continue
      for (const rad of text.split(/\r?\n/)) {
        if (!/^\s*import\s/.test(rad) || /^\s*import\s+type\s/.test(rad)) continue
        if (FORBJUDNA.some((re) => re.test(rad))) brott.push(`${fil}: ${rad.trim()}`)
      }
    }
    expect(brott).toEqual([])
  })
})
