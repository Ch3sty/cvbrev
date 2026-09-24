// scripts/stripe-testlage-webhook.mjs
//
// Webhook för Stripes TESTLÄGE mot ett lokalt bygge, när varken Stripe CLI
// eller en publik tunnel finns (docs/qa/qa-kop-testlage-2026-09-24.md).
//
// Hämtar nya event med events.list (testnyckeln ur .env.test.local), i den
// ordning de skapades, och postar dem till den lokala webhookrutten med en
// signatur från stripe.webhooks.generateTestHeaderString och samma
// STRIPE_WEBHOOK_SECRET som bygget startades med. Rutten verifierar alltså
// signaturen precis som i produktion.
//
//   node scripts/stripe-testlage-webhook.mjs            lyssna, postar allt nytt från och med nu
//   WEBHOOK_URL=http://localhost:3461/api/stripe/webhooks node scripts/stripe-testlage-webhook.mjs
//
// Loggar eventtyp, id och svarskod till stdout och till LOGG (standard
// scratch/webhook-logg.jsonl om SCRATCH är satt). Nycklar skrivs aldrig ut.

import fs from 'node:fs'
import Stripe from 'stripe'

const env = {}
for (const rad of fs.readFileSync('.env.test.local', 'utf8').split(/\r?\n/)) {
  const t = rad.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  env[t.slice(0, i)] = t.slice(i + 1)
}
if (!env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
  console.error('.env.test.local saknar en testnyckel. Avbryter.')
  process.exit(1)
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
const URL = process.env.WEBHOOK_URL || 'http://localhost:3461/api/stripe/webhooks'
const LOGG = process.env.LOGG || (process.env.SCRATCH ? `${process.env.SCRATCH}/webhook-logg.jsonl` : null)
const start = Math.floor(Date.now() / 1000) - 5
const sedda = new Set()

async function posta(event) {
  const payload = JSON.stringify(event, null, 2)
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: env.STRIPE_WEBHOOK_SECRET })
  let status = 0
  let text = ''
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': header },
      body: payload,
    })
    status = res.status
    text = (await res.text()).slice(0, 120)
  } catch (e) {
    text = String(e?.message ?? e).slice(0, 120)
  }
  const rad = {
    tid: new Date().toISOString(),
    id: event.id,
    typ: event.type,
    objekt: event.data?.object?.id,
    kund: event.data?.object?.customer ?? null,
    status,
    svar: text,
  }
  console.log(JSON.stringify(rad))
  if (LOGG) fs.appendFileSync(LOGG, JSON.stringify(rad) + '\n')
}

async function varv() {
  const nya = []
  for await (const e of stripe.events.list({ created: { gte: start }, limit: 100 })) {
    if (sedda.has(e.id)) break
    nya.push(e)
  }
  nya.reverse() // listan är nyast först; äldst först till rutten
  for (const e of nya) {
    sedda.add(e.id)
    await posta(e)
  }
}

console.log(`Lyssnar på testlägets event från ${new Date(start * 1000).toISOString()}, postar till ${URL}`)
for (;;) {
  try {
    await varv()
  } catch (e) {
    console.error('varv misslyckades:', e?.message ?? e)
  }
  await new Promise((r) => setTimeout(r, 2000))
}
