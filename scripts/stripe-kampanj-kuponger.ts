/**
 * Kupongerna för kampanjerna i lib/kampanj (Black Week, Cyber Monday).
 *
 *   npx tsx scripts/stripe-kampanj-kuponger.ts            testläget (STRIPE_SECRET_KEY_TEST)
 *   npx tsx scripts/stripe-kampanj-kuponger.ts --live     live (STRIPE_SECRET_KEY), kräver ägarens ja
 *   npx tsx scripts/stripe-kampanj-kuponger.ts --live --ta-bort   efter kampanjen
 *
 * Varje kupong har samma id som kampanjens nyckel, eftersom create-plan-
 * session lägger på discounts: [{ coupon: nyckel }]. amount_off är rabatten
 * i öre, SEK, duration once (bara första fakturan), och redeem_by en timme
 * efter kampanjens slut: servern är facit på minuten, kupongen är
 * skyddsnätet.
 *
 * Idempotent: en kupong som redan finns med rätt belopp lämnas orörd. Finns
 * den med fel belopp avbryts skriptet, för en kupong kan inte ändras i
 * Stripe, bara raderas och skapas om.
 *
 * Nycklarna skrivs aldrig ut.
 */

import fs from 'node:fs'
import path from 'node:path'
import Stripe from 'stripe'
import { KAMPANJER } from '../src/lib/kampanj/kampanj'

function lasEnv(fil: string): Record<string, string> {
  const p = path.join(process.cwd(), fil)
  if (!fs.existsSync(p)) return {}
  const ut: Record<string, string> = {}
  for (const rad of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = rad.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) ut[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return ut
}

const live = process.argv.includes('--live')
const taBort = process.argv.includes('--ta-bort')
const env = { ...lasEnv('.env.local'), ...process.env }
const nyckel = live ? env.STRIPE_SECRET_KEY : env.STRIPE_SECRET_KEY_TEST

if (!nyckel) {
  console.error(live ? 'STRIPE_SECRET_KEY saknas.' : 'STRIPE_SECRET_KEY_TEST saknas.')
  process.exit(1)
}
if (live ? !nyckel.startsWith('sk_live_') && !nyckel.startsWith('rk_live_') : !nyckel.startsWith('sk_test_')) {
  console.error(`Nyckeln är inte en ${live ? 'live' : 'test'}nyckel. Avbryter.`)
  process.exit(1)
}

const stripe = new Stripe(nyckel)

async function main() {
  console.log(`Läge: ${live ? 'LIVE' : 'test'}${taBort ? ', tar bort' : ''}`)
  for (const k of KAMPANJER) {
    let finns: Stripe.Coupon | null = null
    try {
      finns = await stripe.coupons.retrieve(k.nyckel)
    } catch (e: any) {
      if (e?.statusCode !== 404) throw e
    }

    if (taBort) {
      if (finns) {
        await stripe.coupons.del(k.nyckel)
        console.log(`${k.nyckel}: borttagen`)
      } else {
        console.log(`${k.nyckel}: fanns inte`)
      }
      continue
    }

    const amountOff = k.rabattKr * 100
    const redeemBy = Math.floor(Date.parse(k.slut) / 1000) + 60 * 60

    if (finns) {
      if (finns.amount_off !== amountOff || finns.currency !== 'sek' || finns.duration !== 'once') {
        console.error(`${k.nyckel}: finns med fel villkor (${finns.amount_off} ${finns.currency} ${finns.duration}). Ta bort och kör igen.`)
        process.exit(1)
      }
      console.log(`${k.nyckel}: finns redan, ${amountOff / 100} kr, redeem_by ${new Date((finns.redeem_by ?? 0) * 1000).toISOString()}`)
      continue
    }

    const c = await stripe.coupons.create({
      id: k.nyckel,
      name: k.namn,
      amount_off: amountOff,
      currency: 'sek',
      duration: 'once',
      redeem_by: redeemBy,
      metadata: { kampanj: k.nyckel, start: k.start, slut: k.slut },
    })
    console.log(`${c.id}: skapad, ${amountOff / 100} kr, redeem_by ${new Date(redeemBy * 1000).toISOString()}`)
  }
}

main().catch((e) => {
  console.error('Fel:', e?.message ?? e)
  process.exit(1)
})
