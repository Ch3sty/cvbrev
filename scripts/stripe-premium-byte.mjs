/**
 * Byter Stripe-produkten för all_month till "Jobbcoach Premium"
 * (spec-rummen 17.4, docs/design/copy-premium-2026-10-11.md avsnitt 3).
 *
 * Skriptet hittar produkten via all_month-priset (NEXT_PUBLIC_STRIPE_PRICE_ID,
 * samma env som src/lib/stripe/planPrices.ts) eller, om priset saknas, via
 * produktens metadata.planKey = all_month. Det sätter product.name och
 * product.description, inget annat. Inga priser skapas eller ändras: inga
 * prices.create, inga prices.update, inga nicknames. Belopp, intervall och
 * prisid är orörda, så befintliga prenumerationer påverkas inte.
 *
 * Namn och beskrivning läses ur src/lib/plans/plans.ts (HELA_PAKETET och
 * all_month.beskrivning), så skriptet följer PLANS om texten ändras.
 *
 *   node scripts/stripe-premium-byte.mjs                    torrkörning mot live (standard)
 *   node scripts/stripe-premium-byte.mjs --skarpt           byt i live
 *   node scripts/stripe-premium-byte.mjs --testlage         torrkörning mot testläget
 *   node scripts/stripe-premium-byte.mjs --testlage --skarpt
 *
 * --testlage läser STRIPE_SECRET_KEY_TEST ur .env.local och testlägets prisid
 * ur .env.test.local. Ligger .env.test.local någon annanstans än i den
 * katalog skriptet körs från: --testenv=<sökväg>.
 *
 * Kontoutdraget (statement descriptor "JOBBCOACH PREMIUM") ändrar ägaren
 * själv i Stripe under Inställningar > Offentliga uppgifter; skriptet rör det
 * inte. Nycklar skrivs aldrig ut.
 */

import fs from 'node:fs'
import path from 'node:path'
import Stripe from 'stripe'

const args = process.argv.slice(2)
const skarpt = args.includes('--skarpt')
const testlage = args.includes('--testlage')
const testenvArg = args.find((a) => a.startsWith('--testenv='))
const okanda = args.filter((a) => !['--skarpt', '--torrkor', '--testlage'].includes(a) && !a.startsWith('--testenv='))
if (okanda.length) {
  console.error(`Okänd flagga: ${okanda.join(' ')}`)
  process.exit(1)
}
if (skarpt && args.includes('--torrkor')) {
  console.error('Välj --torrkor eller --skarpt, inte båda.')
  process.exit(1)
}

/** NYCKEL=värde ur en env-fil, utan dotenv (samma format som scripts/_env.ts). */
function lasEnv(fil) {
  const ut = {}
  if (!fs.existsSync(fil)) return null
  for (const rad of fs.readFileSync(fil, 'utf8').split(/\r?\n/)) {
    const t = rad.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i <= 0) continue
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    ut[t.slice(0, i).trim()] = v
  }
  return ut
}

const cwd = process.cwd()
const envLocal = lasEnv(path.resolve(cwd, '.env.local')) ?? {}
const fran = (nyckel, kalla) => process.env[nyckel] ?? kalla[nyckel]

let hemlighet
let prisId
let prisKalla
if (testlage) {
  hemlighet = fran('STRIPE_SECRET_KEY_TEST', envLocal)
  const testFil = testenvArg ? path.resolve(testenvArg.slice('--testenv='.length)) : path.resolve(cwd, '.env.test.local')
  const envTest = lasEnv(testFil)
  if (!envTest) {
    console.error(`Saknar ${testFil}. Testlägets prisid ligger där (reference_stripe_testlage).`)
    process.exit(1)
  }
  prisId = envTest.NEXT_PUBLIC_STRIPE_PRICE_ID
  prisKalla = `NEXT_PUBLIC_STRIPE_PRICE_ID i ${path.basename(testFil)}`
  if (!hemlighet) {
    console.error('Saknar STRIPE_SECRET_KEY_TEST i .env.local.')
    process.exit(1)
  }
} else {
  hemlighet = fran('STRIPE_SECRET_KEY', envLocal)
  prisId = fran('NEXT_PUBLIC_STRIPE_PRICE_ID', envLocal)
  prisKalla = 'NEXT_PUBLIC_STRIPE_PRICE_ID i .env.local'
  if (!hemlighet) {
    console.error('Saknar STRIPE_SECRET_KEY i .env.local.')
    process.exit(1)
  }
}

const lage = /^(sk|rk)_live_/.test(hemlighet) ? 'LIVE' : /^(sk|rk)_test_/.test(hemlighet) ? 'TEST' : 'OKÄNT'
if (testlage && lage !== 'TEST') {
  console.error(`--testlage men nyckeln är ${lage}. Avbryter.`)
  process.exit(1)
}
if (!testlage && lage !== 'LIVE') {
  console.error(`Nyckeln är ${lage}, inte LIVE. Kör med --testlage för testläget. Avbryter.`)
  process.exit(1)
}

/** Namnet och beskrivningen ur plans.ts, så att PLANS är enda källan. */
function lasPlans() {
  const fil = path.resolve(cwd, 'src/lib/plans/plans.ts')
  const s = fs.readFileSync(fil, 'utf8')
  const namn = s.match(/const HELA_PAKETET = '([^']+)'/)?.[1]
  const block = s.slice(s.indexOf("key: 'all_month'"))
  const beskrivning = block.match(/beskrivning: '([^']+)'/)?.[1]
  const belopp = Number(block.match(/amount: (\d+)/)?.[1])
  if (!namn || !beskrivning || !belopp) throw new Error('Kunde inte läsa namn, beskrivning och belopp för all_month ur plans.ts.')
  return { namn, beskrivning, belopp }
}

const stripe = new Stripe(hemlighet, { apiVersion: '2025-02-24.acacia' })
const produktIdUr = (p) => (typeof p.product === 'string' ? p.product : p.product.id)

function prisText(p) {
  const belopp = `${(p.unit_amount ?? 0) / 100} ${p.currency}`
  const intervall = p.recurring ? `${p.recurring.interval_count} ${p.recurring.interval}` : 'engångs'
  return `${p.id}  ${belopp} / ${intervall}  nickname ${JSON.stringify(p.nickname)}  ${p.active ? 'aktivt' : 'inaktivt'}  metadata.planKey ${JSON.stringify(p.metadata?.planKey ?? null)}`
}

async function hittaProdukt() {
  if (prisId) {
    const pris = await stripe.prices.retrieve(prisId)
    return { produktId: produktIdUr(pris), via: `priset ur ${prisKalla}`, pris }
  }
  // Reserv: produkten med metadata.planKey = all_month.
  const traffar = []
  for await (const p of stripe.products.list({ limit: 100 })) {
    if (p.metadata?.planKey === 'all_month') traffar.push(p)
  }
  if (traffar.length !== 1) {
    throw new Error(`Saknar ${prisKalla}, och ${traffar.length} produkter har metadata.planKey all_month. Avbryter hellre än gissar.`)
  }
  return { produktId: traffar[0].id, via: 'metadata.planKey = all_month', pris: null }
}

async function main() {
  const mal = lasPlans()
  console.log(`Stripe-nyckel: ${lage}${skarpt ? ', SKARP körning' : ', torrkörning (inget ändras)'}`)
  console.log(`Mål ur plans.ts: namn "${mal.namn}", beskrivning "${mal.beskrivning}"`)

  const { produktId, via, pris } = await hittaProdukt()
  console.log(`\nProdukten hittad via ${via}: ${produktId}`)
  if (pris) {
    console.log(`  all_month-priset: ${prisText(pris)}`)
    const manad = pris.recurring?.interval === 'month' && pris.recurring?.interval_count === 1
    if (!manad || pris.unit_amount !== mal.belopp * 100 || pris.currency !== 'sek') {
      throw new Error(`Priset är inte ${mal.belopp} sek i månaden. Fel prisid? Avbryter.`)
    }
  }

  const produkt = await stripe.products.retrieve(produktId)
  console.log('\nNuläge:')
  console.log(`  name                  ${JSON.stringify(produkt.name)}`)
  console.log(`  description           ${JSON.stringify(produkt.description)}`)
  console.log(`  statement_descriptor  ${JSON.stringify(produkt.statement_descriptor ?? null)}`)
  console.log(`  active                ${produkt.active}`)
  console.log(`  metadata              ${JSON.stringify(produkt.metadata ?? {})}`)

  const priser = []
  for await (const p of stripe.prices.list({ product: produktId, limit: 100 })) priser.push(p)
  console.log(`\nPriser på produkten (${priser.length}), rörs inte:`)
  for (const p of priser) console.log(`  ${prisText(p)}`)

  // Delar ett pris för ett annat paket än Premium produkten stoppar vi:
  // namnbytet skulle då synas på det paketets kvitton.
  const frammande = priser.filter((p) => ['cv_week', 'test_week', 'all_day'].includes(p.metadata?.planKey))
  if (frammande.length) {
    throw new Error(`Produkten delas av ${frammande.map((p) => p.metadata.planKey).join(', ')}. Avbryter.`)
  }

  const andringar = {}
  if (produkt.name !== mal.namn) andringar.name = mal.namn
  if (produkt.description !== mal.beskrivning) andringar.description = mal.beskrivning

  console.log('\nVad skriptet gör:')
  if (!Object.keys(andringar).length) {
    console.log('  Ingenting. Produkten heter redan rätt och har rätt beskrivning.')
  } else {
    for (const [k, v] of Object.entries(andringar)) {
      console.log(`  products.update ${produktId}: ${k} ${JSON.stringify(produkt[k])} -> ${JSON.stringify(v)}`)
    }
  }
  console.log('  Inga priser skapas eller ändras. Nicknames, belopp och intervall står kvar.')
  console.log('  Kontoutdraget (statement descriptor) ändrar ägaren själv i Stripe: "JOBBCOACH PREMIUM".')

  if (!skarpt) {
    console.log('\nTorrkörning: inget ändrat. Kör med --skarpt för att byta.')
    return
  }
  if (!Object.keys(andringar).length) return

  await stripe.products.update(produktId, andringar)
  const efter = await stripe.products.retrieve(produktId)
  const prisEfter = []
  for await (const p of stripe.prices.list({ product: produktId, limit: 100 })) prisEfter.push(p)
  const namnOk = efter.name === mal.namn && efter.description === mal.beskrivning
  const prisOk =
    prisEfter.length === priser.length &&
    prisEfter.every((p) => {
      const f = priser.find((x) => x.id === p.id)
      return f && f.unit_amount === p.unit_amount && f.nickname === p.nickname && f.active === p.active
    })
  console.log(`\nEfter: name ${JSON.stringify(efter.name)}, description ${JSON.stringify(efter.description)}`)
  console.log(`${namnOk ? 'OK ' : 'FEL'} namn och beskrivning`)
  console.log(`${prisOk ? 'OK ' : 'FEL'} priserna oförändrade`)
  if (!namnOk || !prisOk) process.exit(1)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
