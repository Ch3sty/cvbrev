// Tillfälligt QA-skript för B4. Skapar och raderar tre testkonton.
// Körs med `node scripts/_b4-qa-konton.mjs skapa|radera` och tas bort efteråt.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const LOSEN = 'B4qaTest!2026'
const KONTON = [
  { epost: 'b4-qa-gratis@jobbcoach-qa.test', scope: null, track: 'cv' },
  { epost: 'b4-qa-cv@jobbcoach-qa.test', scope: 'cv', track: 'cv' },
  { epost: 'b4-qa-allt@jobbcoach-qa.test', scope: 'allt', track: 'allt' },
]

const dagar = (n) => new Date(Date.now() + n * 86400000).toISOString()

async function hittaId(epost) {
  for (let sida = 1; sida <= 10; sida++) {
    const { data } = await admin.auth.admin.listUsers({ page: sida, perPage: 200 })
    const u = data?.users?.find((x) => x.email === epost)
    if (u) return u.id
    if (!data?.users?.length || data.users.length < 200) return null
  }
  return null
}

async function skapa() {
  for (const k of KONTON) {
    const gammal = await hittaId(k.epost)
    if (gammal) await admin.auth.admin.deleteUser(gammal)

    const { data, error } = await admin.auth.admin.createUser({
      email: k.epost,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: 'B4 QA' },
    })
    if (error) {
      console.error('FEL createUser', k.epost, error.message)
      continue
    }
    const id = data.user.id

    const patch = k.scope
      ? {
          subscription_tier: 'premium',
          premium_scope: k.scope,
          premium_until: dagar(5),
          premium_source: 'stripe',
          subscription_id: 'sub_b4qa_' + k.scope,
          subscription_status: 'active',
          onboarding_track: k.track,
        }
      : {
          subscription_tier: 'free',
          premium_scope: null,
          premium_until: null,
          subscription_id: null,
          subscription_status: null,
          onboarding_track: k.track,
        }

    const { error: pe } = await admin.from('profiles').update(patch).eq('id', id)
    if (pe) console.error('FEL profiles', k.epost, pe.message)

    // Blockeringar de senaste sju dygnen, så listan och förslaget har
    // underlag. Gratis: tre CV-stopp plus ett teststopp. Spår cv: fyra
    // teststopp, alltså utanför spåret.
    const stopp =
      k.scope === 'cv'
        ? ['test:matris', 'test:verbal', 'test:numerisk', 'test:matris']
        : k.scope === null
          ? ['cv_analysis', 'cv_analysis', 'cv_analysis', 'letter_generation']
          : []

    for (const feature of stopp) {
      const { error: ae } = await admin.from('user_activities').insert({
        user_id: id,
        activity_type: 'quota_wall_hit',
        description: `Kvottak nått: ${feature}`,
        metadata: { feature },
      })
      if (ae) console.error('FEL activity', k.epost, ae.message)
    }

    console.log('SKAPAD', k.epost, id, 'stopp:', stopp.length)
  }
}

async function radera() {
  for (const k of KONTON) {
    const id = await hittaId(k.epost)
    if (!id) {
      console.log('SAKNAS', k.epost)
      continue
    }
    await admin.from('user_activities').delete().eq('user_id', id)
    const { error } = await admin.auth.admin.deleteUser(id)
    console.log(error ? `FEL radera ${k.epost}: ${error.message}` : `RADERAD ${k.epost}`)
  }
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else console.error('Ange skapa eller radera')
