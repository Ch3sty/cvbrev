/**
 * Kontots nycklar i webbläsaren (klicktestet på live 2026-11-22, punkt 2):
 * utloggningen tar bort dem, ett nytt konto får aldrig det förra kontots, och
 * besökarens utkast står kvar tills hennes konto finns.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  AGARE_NYCKEL,
  KONTOTS_NYCKLAR,
  KONTOTS_PREFIX,
  WEBBLASARENS_NYCKLAR,
  WEBBLASARENS_PREFIX,
  horTillKontot,
  rensaKontoLagring,
  utanSession,
  vidInloggning,
  vidUtloggning,
} from '../kontoLagring'
import { rensaFelskrivnaNycklar } from '@/lib/supabase/storage-sanitizer'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

function fyllMedEttKonto() {
  localStorage.setItem('jc_cv_prova', '{"cv":1}')
  localStorage.setItem('jobbcoachen_conversation_id', 'k1')
  localStorage.setItem('cv-store', '{"state":{}}')
  localStorage.setItem('flow:brev:v1', '{}')
  localStorage.setItem('jobbcoach_uiflag_intro', '1')
  sessionStorage.setItem('dashboard_summary_v1_u1', '{}')
  sessionStorage.setItem('jobbmatchning:senaste:u1:cv1', '{}')
  sessionStorage.setItem('jc_pending_draft', 'tok')
  // Webbläsarens.
  localStorage.setItem('tema', 'morkt')
  localStorage.setItem('jc_pwa_dismissed_at', '1')
  sessionStorage.setItem('jc_signup_entry', 'header')
  sessionStorage.setItem('jc_sticky_dismissed:/cv-mallar', '1')
  // Andras: Supabase och mätningen.
  localStorage.setItem('sb-abc-auth-token', 'x')
  localStorage.setItem('ph_phc_123_posthog', '{}')
}

describe('utloggningen', () => {
  it('tar bort kontots nycklar i båda lagringarna och lämnar resten', () => {
    fyllMedEttKonto()
    localStorage.setItem(AGARE_NYCKEL, 'u1')
    vidUtloggning()
    expect(Object.keys(localStorage).sort()).toEqual(['jc_pwa_dismissed_at', 'ph_phc_123_posthog', 'sb-abc-auth-token', 'tema'])
    expect(Object.keys(sessionStorage).sort()).toEqual(['jc_signup_entry', 'jc_sticky_dismissed:/cv-mallar'])
  })

  it('rensaKontoLagring säger hur många nycklar som togs bort', () => {
    fyllMedEttKonto()
    expect(rensaKontoLagring()).toBe(8)
    expect(rensaKontoLagring()).toBe(0)
  })
})

describe('inloggningen', () => {
  it('ett annat konto: det förra kontots nycklar och utkast bort, ny ägare', () => {
    fyllMedEttKonto()
    localStorage.setItem(AGARE_NYCKEL, 'u1')
    vidInloggning('u2')
    expect(localStorage.getItem('jc_cv_prova')).toBeNull()
    expect(sessionStorage.getItem('jc_pending_draft')).toBeNull()
    expect(localStorage.getItem('jobbcoachen_conversation_id')).toBeNull()
    expect(localStorage.getItem('tema')).toBe('morkt')
    expect(localStorage.getItem(AGARE_NYCKEL)).toBe('u2')
  })

  it('samma konto igen: inget rensas', () => {
    fyllMedEttKonto()
    localStorage.setItem(AGARE_NYCKEL, 'u1')
    vidInloggning('u1')
    expect(localStorage.getItem('jobbcoachen_conversation_id')).toBe('k1')
  })

  it('besökarens utkast följer med in i hennes nya konto (ingen ägare)', () => {
    localStorage.setItem('jc_sokt_prova', '{"tjanst":"Testledare"}')
    sessionStorage.setItem('jc_pending_draft', 'tok')
    localStorage.setItem('jc_pending_draft_val', '{}')
    vidInloggning('ny')
    expect(localStorage.getItem('jc_sokt_prova')).not.toBeNull()
    expect(sessionStorage.getItem('jc_pending_draft')).toBe('tok')
    expect(localStorage.getItem(AGARE_NYCKEL)).toBe('ny')
  })

  it('utloggning, besökare, nytt konto: det nya kontot får besökarens utkast men inget av det förra kontots', () => {
    fyllMedEttKonto()
    localStorage.setItem(AGARE_NYCKEL, 'u1')
    vidUtloggning()
    localStorage.setItem('jc_jobb_prova', '{"cv":"nytt"}')
    vidInloggning('u2')
    expect(localStorage.getItem('jc_jobb_prova')).toBe('{"cv":"nytt"}')
    expect(localStorage.getItem('jc_cv_prova')).toBeNull()
  })
})

describe('utan session', () => {
  it('en kvarlämnad ägare (utloggad i en annan flik) rensas vid första sidladdningen', () => {
    fyllMedEttKonto()
    localStorage.setItem(AGARE_NYCKEL, 'u1')
    utanSession()
    expect(localStorage.getItem('jobbcoachen_conversation_id')).toBeNull()
    expect(localStorage.getItem(AGARE_NYCKEL)).toBeNull()
  })

  it('en besökare utan ägare behåller sina utkast', () => {
    localStorage.setItem('jc_cv_prova', '{}')
    utanSession()
    expect(localStorage.getItem('jc_cv_prova')).toBe('{}')
  })
})

describe('setItem och getItem som nycklar', () => {
  it('den gamla lappningens nycklar tas bort, en nyckel med annat värde står kvar', () => {
    localStorage.setItem('setItem', 'function(key, value) { return 1 }')
    localStorage.setItem('getItem', 'egen data')
    expect(rensaFelskrivnaNycklar(localStorage)).toBe(1)
    expect(localStorage.getItem('setItem')).toBeNull()
    expect(localStorage.getItem('getItem')).toBe('egen data')
  })

  it('ingen kod i src tilldelar metoder eller nycklar på lagringsobjektet', () => {
    const traffar = allaFiler(SRC)
      .filter((f) => /(localStorage|sessionStorage)(\.\w+|\[[^\]]+\])\s*=[^=]/.test(fs.readFileSync(f, 'utf8')))
      .map(rel)
    expect(traffar).toEqual([])
  })
})

/* -------------------------------------------- varje nyckel är klassad */

const SRC = path.resolve(__dirname, '../../..')
const rel = (f: string) => path.relative(SRC, f).split(path.sep).join('/')

function allaFiler(dir: string, ut: string[] = []): string[] {
  for (const namn of fs.readdirSync(dir)) {
    const full = path.join(dir, namn)
    if (fs.statSync(full).isDirectory()) {
      if (namn === 'node_modules' || namn === '__tests__' || namn.startsWith('.')) continue
      allaFiler(full, ut)
    } else if (/\.(ts|tsx)$/.test(namn) && !/\.test\.tsx?$/.test(namn)) ut.push(full)
  }
  return ut
}

/** Filerna som skriver i lagringen i dag. En ny fil fäller testet tills dess nycklar är klassade i kontoLagring.ts. */
const KANDA_FILER = [
  'app/dashboard/(oversikt)/ProfilKomplettering.tsx',
  'app/dashboard/arbetsstil/components/InterviewPractice.tsx',
  'app/dashboard/bli-upptackt/hooks/useCollapsedSections.ts',
  'app/dashboard/skapa-cv/ByggareClient.tsx',
  'app/rekryterare/components/messageTemplates.ts',
  'app/rekryterare/page.tsx',
  'app/rekryterare/registrera/page.tsx',
  'components/artiklar/personlighetsprov/Personlighetsprov.tsx',
  'components/cv/Dokument/Dokument.tsx',
  'components/cv/rum3/mallar/MallarVy.tsx',
  'components/dashboard/DowngradedNotice.tsx',
  'components/dashboard/KomIgangContext.tsx',
  'components/dashboard/SetPasswordPrompt.tsx',
  'components/jobb3/coach/CoachVy.tsx',
  'components/jobb3/intervju/IntervjuFraga.tsx',
  'components/jobb3/jobb/MatchadeJobb.tsx',
  'components/jobb3/sokta/Backfill.tsx',
  'components/landing/LandingNavbar.tsx',
  'components/mobilapp/notiser/NotisFraga.tsx',
  'components/mobilapp/skalet/Skalet.tsx',
  'components/registrering/LoginFlode.tsx',
  'components/shared/StickyMobileCTA.tsx',
  'components/tester-v4/hem/HemMatning.tsx',
  'components/tester-v4/hem/HintSparning.tsx',
  'components/tester-v4/hem/PlanKort.tsx',
  'components/tester-v4/hem/TjanstFraga.tsx',
  'contexts/DashboardDataContext.tsx',
  'hooks/useNextBestAction.ts',
  'hooks/useUiFlag.ts',
  'hooks/useUnusedFeatures.ts',
  'lib/cv/mallval/utkast.ts',
  'lib/flow/draft.ts',
  'lib/flow/flodeshistorik.ts',
  'lib/jobbsok/forifyllning.ts',
  'lib/jobbsok/provaFraga.ts',
  'lib/jobbsok/provaSokt.ts',
  'lib/jobmatching/provaCv.ts',
  'lib/letters/claim-draft-client.ts',
  'lib/letters/publikt-brev-val.ts',
  'lib/mobilapp/onboarding.ts',
  'lib/pwa/installPrompt.ts',
  'lib/tema.ts',
  'lib/tests/prova-lokalt.ts',
  'lib/traning/hjalp.ts',
  'store/cover-letter-store.ts',
  'store/cv-store.ts',
  'utils/demoMessageTracking.ts',
].sort()

describe('kartan över nycklarna', () => {
  const skriver = allaFiler(SRC).filter((f) => {
    const t = fs.readFileSync(f, 'utf8')
    return /Storage\.setItem\(|\bpersist\(\s*\(?/.test(t) && !/storage-sanitizer/.test(f)
  })

  it('varje fil som skriver i lagringen är känd', () => {
    expect(skriver.map(rel).sort()).toEqual(KANDA_FILER)
  })

  it('varje nyckelkonstant i de filerna är klassad som kontots eller webbläsarens', () => {
    const oklassade: string[] = []
    for (const f of skriver) {
      const t = fs.readFileSync(f, 'utf8')
      const re = /\b[A-Z][A-Z_]*(?:NYCKEL|KEY|PREFIX|RESERV|AKTIV|VISAD|STANGD|FOLLOW_UP|_AF|INTERVJU|PERSONLIGHET)\b[^=\n]*=\s*(?:\([^)]*\)\s*=>\s*)?['"`]([^'"`$]{2,60})/g
      for (const m of t.matchAll(re)) {
        const v = m[1]
        // PREF_KEY är en rad i user_ui_preferences i databasen, inte lagringen.
        if (m[0].startsWith('PREF_KEY')) continue
        if (v.startsWith('/') || v.includes(' ')) continue
        const kontots = horTillKontot(v) || horTillKontot(v + 'x')
        const webbens = WEBBLASARENS_NYCKLAR.includes(v) || WEBBLASARENS_PREFIX.some((p) => v.startsWith(p))
        if (!kontots && !webbens) oklassade.push(`${rel(f)}: ${v}`)
      }
      for (const m of t.matchAll(/Storage\.(?:setItem|getItem)\(\s*['"]([^'"]+)['"]/g)) {
        const v = m[1]
        if (!horTillKontot(v) && !WEBBLASARENS_NYCKLAR.includes(v)) oklassade.push(`${rel(f)}: ${v}`)
      }
    }
    expect(oklassade).toEqual([])
  })

  it('ingen nyckel är både kontots och webbläsarens', () => {
    for (const k of WEBBLASARENS_NYCKLAR) expect(horTillKontot(k)).toBe(false)
    for (const k of KONTOTS_NYCKLAR) expect(WEBBLASARENS_NYCKLAR).not.toContain(k)
    expect(KONTOTS_PREFIX.length).toBeGreaterThan(0)
  })
})
