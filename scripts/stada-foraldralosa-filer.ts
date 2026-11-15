/**
 * Engångsstädning: filer i lagringen som tillhör konton som redan är raderade
 * (före 2026-11-15 tog kontoraderingen inte bort filerna). Körs bara med
 * ägarens ja (saas-lead 2026-11-15, minnet feedback_testdata_stadning).
 *
 *   npx tsx scripts/stada-foraldralosa-filer.ts                       # torrkörning: listar exakta vägar till <ut>
 *   npx tsx scripts/stada-foraldralosa-filer.ts --kor --lista <fil>   # raderar exakt vägarna i listan, efter en ny kontroll
 *
 * Urvalet: objekt i hinken cvs vars väg är users/<uuid>/... eller <uuid>/...
 * där uuid:t inte finns i auth.users. profile-photos rörs inte (inga
 * föräldralösa där 2026-11-15). Raderingen går på exakta vägar, aldrig på
 * prefix, och varje väg kontrolleras igen mot auth.users innan den raderas.
 */
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

for (const rad of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = rad.indexOf('=')
  if (i < 0 || rad.trim().startsWith('#')) continue
  const k = rad.slice(0, i).trim()
  if (!process.env[k]) process.env[k] = rad.slice(i + 1).trim().replace(/^["']|["']$/g, '')
}
const arg = (n: string) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const HINK = 'cvs'

async function finns(id: string): Promise<boolean> {
  const { data, error } = await sb.auth.admin.getUserById(id)
  if (error && !/not found|User not found/i.test(error.message)) throw new Error(error.message)
  return !!data?.user
}

async function lista(mapp: string, ut: string[]) {
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await sb.storage.from(HINK).list(mapp, { limit: 1000, offset })
    if (error) throw new Error(error.message)
    for (const p of data ?? []) {
      const vag = mapp ? `${mapp}/${p.name}` : p.name
      if (p.id === null) await lista(vag, ut)
      else ut.push(vag)
    }
    if ((data ?? []).length < 1000) return
  }
}

function agare(vag: string): string | null {
  const d = vag.split('/')
  const id = d[0] === 'users' ? d[1] : d[0]
  return id && UUID.test(id) ? id : null
}

async function torr() {
  const alla: string[] = []
  await lista('', alla)
  const cache = new Map<string, boolean>()
  const valda: string[] = []
  for (const v of alla) {
    const id = agare(v)
    if (!id) continue
    if (!cache.has(id)) cache.set(id, await finns(id))
    if (!cache.get(id)) valda.push(v)
  }
  const ut = arg('ut') ?? 'docs/qa/foraldralosa-filer-torr.json'
  fs.writeFileSync(ut, JSON.stringify(valda, null, 2))
  console.log(`${alla.length} objekt i ${HINK}, ${valda.length} föräldralösa i ${new Set(valda.map(agare)).size} konton. Lista: ${ut}`)
}

async function kor() {
  const fil = arg('lista')
  if (!fil) throw new Error('--lista <fil> krävs')
  const vagar = JSON.parse(fs.readFileSync(fil, 'utf8')) as string[]
  let raderade = 0
  for (const v of vagar) {
    const id = agare(v)
    if (!id) throw new Error(`väg utan uuid: ${v}`)
    if (await finns(id)) {
      console.log(`HOPPAR ÖVER (kontot finns): ${v}`)
      continue
    }
    const { error } = await sb.storage.from(HINK).remove([v])
    if (error) throw new Error(`${v}: ${error.message}`)
    raderade++
  }
  console.log(`Raderade ${raderade} av ${vagar.length}`)
}

;(process.argv.includes('--kor') ? kor() : torr()).catch((e) => {
  console.error(e)
  process.exit(1)
})
