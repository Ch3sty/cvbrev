/**
 * Köpreturen från spärren i Mallar (byggspecen våg 2, avsnitt 5): returen
 * bär formatet från knappen som öppnade spärren, PDF eller Word, som Brevet.
 *
 * @vitest-environment node
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { mallarKopretur } from '../klient'

describe('Mallars köpretur', () => {
  it('Word-knappen ger format=docx, PDF-knappen format=pdf', () => {
    expect(mallarKopretur('b1', 'koppar', 'docx')).toBe('/dashboard/mina-brev/mallar?brev=b1&mall=koppar&format=docx')
    expect(mallarKopretur('b1', 'linne', 'pdf')).toBe('/dashboard/mina-brev/mallar?brev=b1&mall=linne&format=pdf')
  })

  it('parametrarna kodas', () => {
    const u = new URL(mallarKopretur('a b&c', 'bjork', 'docx'), 'https://x.se')
    expect(u.searchParams.get('brev')).toBe('a b&c')
    expect(u.searchParams.get('format')).toBe('docx')
  })

  it('MallarKlient: Word-knappen kräver inte tillgång, spärren får formatet, returen bygger på det', () => {
    const kod = fs.readFileSync(path.resolve(__dirname, '../MallarKlient.tsx'), 'utf8')
    expect(kod).toMatch(/const wordKnapp =\s*\n\s*brev && visadKort\.word \?/)
    expect(kod).not.toMatch(/brev && p\.kanLaddaNer && visadKort\.word/)
    expect(kod).toContain('mallarKopretur(brev.id, visad, sparrFormat)')
    expect(kod).not.toContain("format: 'pdf' }).toString()")
    // Båda vägarna till spärren sätter formatet först.
    expect(kod.match(/setSparrFormat\(format\)\s*\n\s*setSparr\(true\)/g)?.length).toBe(2)
  })
})
