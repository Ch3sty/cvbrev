/**
 * Namnfältet togs bort ur kontosteget 2026-11-09 (docs/plan-efter-analys-2026-11-08.md,
 * punkt 21). Konton utan namn ska fungera överallt, och namnet frågas efter
 * där det behövs. Testet läser källorna, så att en platshållare eller ett
 * namnkrav som smyger tillbaka faller i CI.
 */

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { generateConfirmationEmailHTML, generateConfirmationEmailText, halsning } from '@/lib/email/confirmation-email-generator'
import { arNamnKravs, kastaOmNamnKravs, NamnKravsError } from '@/lib/cv/namnKravs'

const SRC = path.resolve(__dirname, '../..')
const las = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8')

describe('bekräftelsemejlet utan namn', () => {
  it('hälsar med förnamnet eller med bara Hej', () => {
    expect(halsning('Anna Berg')).toBe('Hej Anna!')
    expect(halsning('  ')).toBe('Hej!')
    expect(halsning(null)).toBe('Hej!')
    expect(halsning(undefined)).toBe('Hej!')
  })

  it('html och text utan namn har ingen platshållare', () => {
    const data = { userEmail: 'a@exempel.se', userName: null, confirmationUrl: 'https://x/y' }
    const html = generateConfirmationEmailHTML(data)
    const text = generateConfirmationEmailText(data)
    expect(html).toContain('Hej!')
    expect(text).toContain('Hej!')
    for (const t of [html, text]) {
      expect(t).not.toMatch(/Hej (undefined|null|Användare)/)
    }
  })

  it('namnet escapas i html', () => {
    const html = generateConfirmationEmailHTML({ userEmail: 'a', userName: '<b>x', confirmationUrl: 'u' })
    expect(html).toContain('Hej &lt;b&gt;x!')
  })

  it('send-confirmation kräver inte fullName', () => {
    const route = las('app/api/auth/send-confirmation/route.ts')
    expect(route).not.toMatch(/!fullName/)
    expect(route).toMatch(/if \(!email \|\| !userId\)/)
  })
})

describe('kontosteget', () => {
  it('har inget namnfält och skickar inget namn', () => {
    const steg = las('components/registrering/RegisterKontoSteg.tsx')
    expect(steg).not.toMatch(/autoComplete="name"/)
    expect(steg).not.toMatch(/full_name/)
    expect(steg).not.toMatch(/fullName/)
  })
})

describe('brev utan namn', () => {
  it.each(['app/api/letters/generate/route.ts', 'app/api/letters/generate-preview/route.ts'])(
    '%s frågar efter namnet i stället för att skriva en platshållare',
    (rel) => {
      const route = las(rel)
      expect(route).not.toMatch(/full_name \|\| '(Namn saknas|Ditt namn|Användare)'/)
      expect(route).toMatch(/error: 'name_required'/)
      expect(route).toMatch(/arPlatshallareNamn\(profile\.full_name\)/)
    }
  )

  it('brevflödet visar NameRequiredNotice vid name_required', () => {
    const klient = las('app/dashboard/skapa-brev/CreateLetterClient.tsx')
    expect(klient).toMatch(/name_required/)
    expect(klient).toMatch(/<NameRequiredNotice/)
  })
})

describe('CV-exporten utan namn', () => {
  it.each([
    'app/dashboard/cv-mallar/CvMallarClient.tsx',
    'app/dashboard/skapa-cv/components/CVCreatorWizard.tsx',
    'app/dashboard/cv-analys/components/CVAnalysisWizard.tsx',
  ])('%s frågar efter namnet vid 422 name_required', (rel) => {
    const klient = las(rel)
    expect(klient).toMatch(/kastaOmNamnKravs\(/)
    expect(klient).toMatch(/<NameRequiredNotice/)
  })

  it('kastaOmNamnKravs känner igen 422 name_required och släpper annat', async () => {
    const svar = (status: number, body: unknown) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
    await expect(kastaOmNamnKravs(svar(422, { error: 'name_required' }))).rejects.toBeInstanceOf(NamnKravsError)
    await expect(kastaOmNamnKravs(svar(422, { error: 'annat' }))).resolves.toBeUndefined()
    await expect(kastaOmNamnKravs(svar(200, { error: 'name_required' }))).resolves.toBeUndefined()
    // Svaret går fortfarande att läsa efteråt.
    const r = svar(422, { error: 'name_required' })
    await kastaOmNamnKravs(r).catch(() => undefined)
    expect(await r.json()).toEqual({ error: 'name_required' })
    expect(arNamnKravs(new NamnKravsError())).toBe(true)
    expect(arNamnKravs(new Error('annat'))).toBe(false)
  })
})
