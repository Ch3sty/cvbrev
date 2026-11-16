/**
 * Varje mall i katalogen har sina miniatyrer (scripts/mallbilder.ts), i
 * rätt storlek och under budgeten för artikelkomponenten (plan avsnitt 4:
 * webp under 12 kB i den lilla storleken).
 */
import { describe, it, expect } from 'vitest'
import { existsSync, statSync } from 'fs'
import path from 'path'
import { MALL_KATALOG } from '../katalog'

const PUBLIC = path.resolve(__dirname, '../../../../../public')

describe('miniatyrerna', () => {
  for (const m of MALL_KATALOG) {
    it(`${m.id} har båda bilderna`, () => {
      const liten = path.join(PUBLIC, m.bild.liten)
      const stor = path.join(PUBLIC, m.bild.stor)
      expect(existsSync(liten), `${m.bild.liten} saknas: kör npx tsx scripts/mallbilder.ts`).toBe(true)
      expect(existsSync(stor), `${m.bild.stor} saknas: kör npx tsx scripts/mallbilder.ts`).toBe(true)
      expect(statSync(liten).size).toBeLessThan(12 * 1024)
    })
  }
})
