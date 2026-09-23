// src/app/api/stripe/webhooks/route.ts
// =====================================
// Hanterar INKOMMANDE WEBHOOKS från Stripe
// Uppdaterad: Hanterar nu även 'subscription_tier' baserat på Stripe status
// Och referral-konverteringar för belöningar

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { grantPremiumDays } from '@/lib/stripe/grantPremiumDays';
import { PLAN_BY_KEY, isPlanKey, type PlanKey, type PlanScope } from '@/lib/plans/plans';
import { priceIdToPlanKey } from '@/lib/stripe/planPrices';
import { captureServer } from '@/lib/analytics/server';
import { scopeFromSubscription } from '@/lib/stripe/subscriptionScope';
import type { Database } from '@/types/database.types';
import {
  onPaymentFailed,
  onSubscriptionDeleted,
  onPaketStarted,
  onPaketEnded,
} from '@/lib/email/lifecycle/hooks';

// Slår upp user_id från Stripe-kunden, för livscykelmailen (spår D5).
const userIdForCustomer = async (customerId: string): Promise<string | null> => {
    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
    return data?.id ?? null;
};

/**
 * Ångerrättssamtycket, docs/plan-paket-och-onboarding.md avsnitt 8.
 *
 * Kryssrutan sattes i kassan och följde med som metadata på sessionen.
 * Här skrivs den ned på kontot, för det är först nu köpet är ett köp.
 * Tidsstämpeln kommer från kassan och inte från webhooken: samtycket lämnades
 * när kunden kryssade, inte när Stripe råkade ringa oss.
 *
 * Skriver bara när kolumnen är tom. Ett andra köp ska inte flytta datumet på
 * det första, och en omsänd webhook ska inte ändra någonting alls.
 *
 * Fire and forget-säker: fel loggas men fäller aldrig svaret till Stripe.
 */
const skrivSamtycke = async (
    userId: string | null | undefined,
    metadata: Record<string, string | undefined> | null | undefined
): Promise<void> => {
    const vid = metadata?.angerratt_samtycke_at;
    if (!userId || !vid) return;
    try {
        const admin = getSupabaseAdmin() as any;
        const { error } = await admin
            .from('profiles')
            .update({ angerratt_samtycke_at: vid })
            .eq('id', userId)
            .is('angerratt_samtycke_at', null);
        if (error) {
            console.error('[SAMTYCKE] Kunde inte skriva angerratt_samtycke_at:', error.message);
        } else {
            console.log(`[SAMTYCKE] ${userId}: ${vid}`);
        }
    } catch (error) {
        console.error('[SAMTYCKE] Fel vid skrivning:', error);
    }
};

/**
 * Serverside-mätning av betalningen (docs/plan-paket-och-onboarding.md
 * avsnitt 6). Klienten kommer tillbaka från Stripe utan att veta beloppet,
 * så det här är den enda platsen där betalningen kan mätas säkert.
 *
 * Går via captureServer i src/lib/analytics/server.ts, som är fire and
 * forget: ingen await i webhookflödet, och alltid en catch. PostHog får
 * aldrig fälla ett svar till Stripe, för då kommer eventet om igen och vi
 * bokför det två gånger.
 */
const capturePaidServerside = (params: {
    userId: string;
    plan: string;
    scope: string;
    amountSek?: number;
}): void => {
    captureServer('subscription_paid', params.userId, {
        plan: params.plan,
        scope: params.scope,
        amount_sek: params.amountSek,
    });
};

/**
 * Förnyelsens ordningstal: 1 för första förnyelsen. Räknas på tiden mellan
 * prenumerationens start och fakturan, delat med paketets längd, så att
 * ingen extra lista över fakturor behöver hämtas i webhooken.
 */
const fornyelseCykel = (
    subscriptionCreated: number | null | undefined,
    invoiceCreated: number | null | undefined,
    plan: string | null
): number => {
    if (typeof subscriptionCreated !== 'number' || typeof invoiceCreated !== 'number') return 1;
    const langd = plan && isPlanKey(plan) ? PLAN_BY_KEY[plan].length : 'vecka';
    const dagar = langd === 'dag' ? 1 : langd === 'månad' ? 30 : langd === 'kvartal' ? 90 : 7;
    const cykel = Math.round((invoiceCreated - subscriptionCreated) / (dagar * 86_400));
    return Math.max(1, cykel);
};

/**
 * Skriver när paketet började. Underlag för hours_since_purchase i
 * hjälpredans kvitteringar och för Kom igång-diagrammet i adminen. En
 * enda update; misslyckas den ska webhooken ändå svara 200.
 */
const skrivPaketStart = async (userId: string | null | undefined, vid: Date = new Date()): Promise<void> => {
    if (!userId) return;
    try {
        const admin = getSupabaseAdmin() as any;
        const { error } = await admin
            .from('profiles')
            .update({ paket_started_at: vid.toISOString() })
            .eq('id', userId);
        if (error) console.error('[PAKET] Kunde inte skriva paket_started_at:', error.message);
    } catch (error) {
        console.error('[PAKET] paket_started_at kastade:', error);
    }
};

/** Behörigheten prenumerationen ger. Regeln bor i subscriptionScope.ts. */
const scopeForSubscription = (subscription: Stripe.Subscription): PlanScope =>
    scopeFromSubscription({
        metadata: subscription.metadata ?? null,
        priceId: subscription.items.data[0]?.price?.id ?? null,
    });

// Funktion för att uppdatera användarprofilen i Supabase (inklusive subscription_tier)
const updateUserSubscription = async (customerId: string, subscription: Stripe.Subscription) => {
    const supabaseAdmin = getSupabaseAdmin() as any; 
    console.log(`Webhook: Looking for profile with stripe_customer_id: ${customerId}`);
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, premium_source')
        .eq('stripe_customer_id', customerId)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { 
         console.error(`Webhook DB Error: Error fetching profile for customer ${customerId}. Code: ${profileError.code}`, profileError.message);
         throw new Error(`Database error fetching profile: ${profileError.message}`);
    }
    if (!profile) {
         console.error(`Webhook Error: Could not find profile for customer ${customerId}.`);
         return null; 
    }

    const userId = (profile as any).id;
    const existingPremiumSource = (profile as any).premium_source as string | null;
    console.log(`Webhook: Found profile for user ${userId}. Preparing update data.`);

    // ***** NY LOGIK: Bestäm subscription_tier baserat på Stripe status *****
    // 'active' och 'trialing' räknas som premium. Alla andra (även 'canceled') blir 'free'.
    const isActiveOrTrialing = ['active', 'trialing'].includes(subscription.status);
    const newSubscriptionTier = isActiveOrTrialing ? 'premium' : 'free';
    console.log(`Webhook: Determined new subscription_tier for user ${userId}: ${newSubscriptionTier} (based on Stripe status: ${subscription.status})`);
    // ***** SLUT PÅ NY LOGIK *****

    const priceId = subscription.items.data[0]?.price.id ?? null;
    if (!priceId && isActiveOrTrialing) { 
        console.warn(`Webhook Warning: Active/Trialing subscription ${subscription.id} for user ${userId} has no price item.`);
    }

    // Skapa dataobjektet för uppdatering (inkluderar nu subscription_tier)
    const subscriptionData: any = {
        subscription_id: subscription.id,
        subscription_status: subscription.status, // Behåll den detaljerade Stripe-statusen
        price_id: priceId,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        // Lägg till den uppdaterade tier-statusen:
        subscription_tier: newSubscriptionTier
    };

    // premium_scope speglar prenumerationen, aldrig ett engångsköp
    // (docs/plan-paket-och-onboarding.md avsnitt 5). Uppåt sätts den ur
    // metadata med priset som reserv, nedåt nollas den tillsammans med
    // tier och premium_until.
    subscriptionData.premium_scope = isActiveOrTrialing
        ? scopeForSubscription(subscription)
        : null;

    // Rensa premium_until och premium_source oavsett riktning.
    //
    // Vid canceled/incomplete/unpaid: hindrar gamla onboarding/trial-premiums
    // från att kollidera med Stripe-status.
    //
    // Vid active/trialing: en betald prenumeration ersätter all gratispremie.
    // Utan detta ligger t.ex. premium_source = 'onboarding_completion' kvar
    // efter uppgraderingen, och användaren räknas för alltid som "temporär
    // premium" i gränssnittet — vilket döljer Stripe-portalen och gör det
    // omöjligt att säga upp sig. Undantaget är admin-tilldelad premium, som
    // sätts manuellt och inte får skrivas över av en webhook.
    if (existingPremiumSource !== 'admin') {
        subscriptionData.premium_until = null;
        subscriptionData.premium_source = null;
        console.log(`Webhook: Clearing premium_until/premium_source (Stripe status: ${subscription.status})`);
    }

     console.log(`Webhook: Updating profile for user ${userId} with data:`, JSON.stringify(subscriptionData));

    // Uppdatera profilen i Supabase
    const { error: updateError } = await (supabaseAdmin as any)
        .from('profiles')
        .update(subscriptionData)
        .eq('id', userId); 
        
    if (updateError) {
        console.error(`Webhook DB Error: Failed to update profile (incl. tier) for user ${userId}`, updateError);
        throw new Error(`Database error updating profile: ${updateError.message}`);
    }

     console.log(`Webhook: Successfully updated profile (incl. tier) for user ${userId}`);
     // userId och scope går vidare till mätningen, som annars hade fått slå
     // upp kunden en gång till.
     return { userId: userId as string, scope: subscriptionData.premium_scope as PlanScope | null };
};

// Exportera ENDAST POST-metoden för att hantera inkommande webhooks
export async function POST(request: Request) {
  console.log("Webhook POST request received.");
  let event: Stripe.Event;

  // Hämta headers-objektet och invänta det
  const headersList = await headers(); 
  const signature = headersList.get('stripe-signature'); 
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Validera input
  if (!signature) {
       console.error('Webhook Error: Missing stripe-signature header.');
       return new NextResponse('Missing stripe-signature header', { status: 400 });
   }
  if (!webhookSecret) {
    console.error('Webhook Error: Stripe webhook secret is not set in environment variables.');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  // Läs rå body
  let body;
  try {
      body = await request.text();
      console.log("Webhook raw body received (length):", body.length);
  } catch (error) {
       console.error('Webhook Error: Could not read request body.', error);
       return new NextResponse('Could not read request body', { status: 400 });
   }

  // Verifiera signaturen
  try {
    if (!signature) throw new Error("Signature is missing after check.");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`Webhook signature verified. Event type: ${event.type}, Event ID: ${event.id}`);
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`);
    return new NextResponse(`Webhook signature error: ${err.message}`, { status: 400 });
  }

  // Hantera det verifierade eventet
  try {
     const eventData = event.data.object as any; 
     let customerId: string | null = null;
     let relevantSubscriptionId: string | null = null;

     // Extrahera customerId och subscriptionId
     if (eventData.customer) { customerId = eventData.customer; } 
     else if (eventData.object === 'checkout.session' && eventData.customer) { customerId = eventData.customer; } 
     if (eventData.object === 'subscription') { relevantSubscriptionId = eventData.id; } 
     else if (eventData.subscription) { relevantSubscriptionId = eventData.subscription; }

     // Huvudlogik för events
     switch (event.type) {
        case 'customer.subscription.created':
             console.log(`Handling subscription event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 await updateUserSubscription(customerId, fullSubscription);

             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
             console.log(`Handling subscription event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 // Anropa den uppdaterade funktionen som nu sätter subscription_tier
                 const uppdaterad = await updateUserSubscription(customerId, fullSubscription);

                 // Spår D: uppsägningsmail direkt + uppföljning om tre dagar.
                 if (event.type === 'customer.subscription.deleted') {
                     const userId = await userIdForCustomer(customerId);
                     if (userId) await onSubscriptionDeleted(getSupabaseAdmin() as any, userId);
                 }

                 // Nedgradering: scopet nollades nyss, alltså har kunden inget
                 // paket kvar och hjälpredans mejl ska sluta.
                 // onSubscriptionDeleted sköter uppsägningen som händelse,
                 // men det är den här raden som stoppar kön: utan den skickas
                 // morgondagens förslag till någon som inte längre betalar.
                 //
                 // Gäller även 'updated' utan radering, alltså när
                 // prenumerationen går till past_due eller unpaid.
                 if (uppdaterad?.userId && !uppdaterad.scope) {
                     await onPaketEnded(getSupabaseAdmin() as any, uppdaterad.userId);
                 }
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'invoice.payment_succeeded':
             console.log(`Handling invoice event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 // Anropa den uppdaterade funktionen som nu sätter subscription_tier
                 const updated = await updateUserSubscription(customerId, fullSubscription);

                 // Betalningen är genomförd först här, inte när abonnemanget
                 // skapades, så det är den här grenen som mäter den.
                 if (updated?.userId) {
                     const planFromPrice = priceIdToPlanKey(
                         fullSubscription.items.data[0]?.price?.id ?? null
                     );
                     const metaPlan = fullSubscription.metadata?.planKey ?? fullSubscription.metadata?.plan;
                     const plan = isPlanKey(metaPlan) ? metaPlan : planFromPrice;
                     const betaltOre = typeof eventData.amount_paid === 'number' ? eventData.amount_paid : null;

                     // Hjälpredans mejl schemaläggs dag för dag av runnern. Här rensas
                     // bara kön från ett tidigare paket, och bara vid den första
                     // fakturan (subscription_create) eller ett byte (subscription_update):
                     // en förnyelse (subscription_cycle) ska inte röra något.
                     const forstaFakturan =
                         eventData.billing_reason === 'subscription_create' ||
                         eventData.billing_reason === 'subscription_update';
                     const fornyelse = eventData.billing_reason === 'subscription_cycle';

                     // Köpet mäts som subscription_paid, förnyelsen som
                     // renewal_succeeded med sitt ordningstal. Samma faktura ska
                     // aldrig räknas som båda: tratten slutar i köpet, och
                     // förnyelsekurvan börjar först efter det.
                     if (fornyelse) {
                         captureServer('renewal_succeeded', updated.userId, {
                             plan: (plan ?? 'all_week') as PlanKey,
                             cycle: fornyelseCykel(fullSubscription.created, eventData.created, plan),
                             amount_sek: betaltOre !== null ? betaltOre / 100 : undefined,
                         });
                     } else {
                         capturePaidServerside({
                             userId: updated.userId,
                             plan: plan ?? 'okant',
                             scope: updated.scope ?? 'allt',
                             amountSek: betaltOre !== null ? betaltOre / 100 : plan ? PLAN_BY_KEY[plan].amount : undefined,
                         });
                     }

                     if (updated.scope && forstaFakturan) {
                         await skrivPaketStart(updated.userId);
                         await onPaketStarted(getSupabaseAdmin() as any, updated.userId);
                     }
                 }
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'invoice.payment_failed':
             console.log(`Handling invoice event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 // Anropa den uppdaterade funktionen som nu sätter subscription_tier
                 await updateUserSubscription(customerId, fullSubscription);

                 // Spår D: transaktionellt mail, ignorerar opt-out.
                 const userId = await userIdForCustomer(customerId);
                 if (userId) await onPaymentFailed(getSupabaseAdmin() as any, userId);
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'checkout.session.completed':
             console.log(`Checkout session completed: ${eventData.id}. Mode: ${eventData.mode}`);

             // Ångerrättssamtycket skrivs före grenarna nedan, så att det
             // landar på kontot oavsett om köpet var engångs (A5) eller
             // löpande. Await: det är en enda update och samtycket är ett
             // lagkrav, inte mätning som får tappas.
             {
               const samtyckeUserId =
                 eventData.metadata?.supabaseUUID ||
                 eventData.metadata?.userId ||
                 (customerId ? await userIdForCustomer(customerId) : null);
               await skrivSamtycke(samtyckeUserId, eventData.metadata);
             }

             // === SPÅR A (A5): engångsköp, dagspass och jobbsökarveckan ===
             // Måste ligga före de befintliga grenarna: engångsköp skapar
             // ingen prenumeration, så prenumerationslogiken nedan gäller inte.
             // Idempotensen sitter i grantPremiumDays (premium_grants).
             if (eventData.mode === 'payment' && eventData.payment_status === 'paid') {
               const onetimeUserId = eventData.metadata?.supabaseUUID || eventData.metadata?.userId;
               const onetimeDays = parseInt(eventData.metadata?.grantDays ?? '0', 10);

               if (onetimeUserId && Number.isFinite(onetimeDays) && onetimeDays > 0) {
                 try {
                   const admin = getSupabaseAdmin() as any;
                   // Dagspasset är det enda engångsköpet, och den ger alltid
                   // 'allt'. Scope skrivs på premium_grants-raden, aldrig på
                   // profiles.premium_scope.
                   const result = await grantPremiumDays(admin, {
                     userId: onetimeUserId,
                     days: onetimeDays,
                     stripeEventId: event.id,
                     source: `onetime_${onetimeDays}d`,
                     scope: 'allt',
                   });
                   console.log(
                     `[ONETIME WEBHOOK] ${onetimeUserId}: ${onetimeDays} dagar, granted=${result.granted}${result.reason ? ` (${result.reason})` : ''}`
                   );

                   if (result.granted) {
                     await skrivPaketStart(onetimeUserId);
                     const onetimePlan = eventData.metadata?.planKey ?? eventData.metadata?.plan;
                     const belopp = typeof eventData.amount_total === 'number' ? eventData.amount_total / 100 : undefined;
                     capturePaidServerside({
                       userId: onetimeUserId,
                       plan: isPlanKey(onetimePlan) ? onetimePlan : 'all_day',
                       scope: 'allt',
                       amountSek: belopp,
                     });
                   }
                 } catch (error) {
                   console.error('[ONETIME WEBHOOK] Kunde inte ge premium-dagar:', error);
                 }
               } else {
                 console.warn(`[ONETIME WEBHOOK] Saknar metadata på session ${eventData.id}.`);
               }
               break;
             }
             // === SLUT SPÅR A ===
             if (eventData.metadata?.upgradeFlow === 'existing-user-upgrade' && customerId && relevantSubscriptionId) {
               console.log(`[UPGRADE WEBHOOK] Processing upgrade for customer: ${customerId}`)

               try {
                 // Hämta den fullständiga subscription från Stripe
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);

                 // Uppdatera subscription_tier baserat på Stripe status (active = premium)
                 await updateUserSubscription(customerId, fullSubscription);


                 console.log(`[UPGRADE WEBHOOK] Subscription updated successfully for customer: ${customerId}`)
               } catch (error) {
                 console.error('[UPGRADE WEBHOOK] Error handling subscription upgrade:', error)
               }
             }
             break;
         default:
             console.log(`Webhook Info: Unhandled event type ${event.type}.`);
     }

     console.log(`Webhook handler finished successfully for event ${event.id}`);
     return NextResponse.json({ received: true, message: "Webhook processed successfully." });

  } catch (error: any) {
     console.error(`Webhook Handler Error (Event ID: ${event.id}, Type: ${event.type}):`, error);
     return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 });
  }
}

// ***** INGEN DEFINITION ELLER EXPORT AV createAdminSupabaseClient HÄR LÄNGRE *****