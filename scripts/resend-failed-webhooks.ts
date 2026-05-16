// scripts/resend-failed-webhooks.ts
// Kör med: npx tsx scripts/resend-failed-webhooks.ts

import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

const WEBHOOK_ENDPOINT_ID = 'we_1SADCzPWMWdjmTDjhlw31Szn' // vibrant-excellence

async function main() {
  console.log('Hämtar events sedan 9 maj...\n')

  const since = Math.floor(new Date('2026-05-09').getTime() / 1000)

  const affectedCustomers = new Map<string, { email: string; events: string[] }>()
  const eventIds: string[] = []

  for await (const event of stripe.events.list({
    created: { gte: since },
    limit: 100,
  })) {
    const data = event.data.object as any
    const customerId: string | null = data.customer ?? null

    if (customerId) {
      eventIds.push(event.id)

      if (!affectedCustomers.has(customerId)) {
        try {
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
          if (!customer.deleted && customer.email) {
            affectedCustomers.set(customerId, { email: customer.email, events: [] })
          }
        } catch {
          // Kund hittades inte, hoppa över
        }
      }

      affectedCustomers.get(customerId)?.events.push(event.type)
    }
  }

  console.log('=== DRABBADE KUNDER ===')
  for (const [, { email, events }] of affectedCustomers) {
    const uniqueEvents = [...new Set(events)].join(', ')
    console.log(`${email} | ${uniqueEvents}`)
  }
  console.log(`\nTotal: ${affectedCustomers.size} unika kunder`)
  console.log(`Total events: ${eventIds.length}\n`)

  console.log('\nEvent-IDs (klistra in i Stripe Dashboard för manuell resend):')
  for (const eventId of eventIds) {
    console.log(`  ${eventId}`)
  }
}

main().catch(console.error)
