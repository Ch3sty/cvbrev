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

// Funktion för att uppdatera användarprofilen i Supabase (inklusive subscription_tier)
const updateUserSubscription = async (customerId: string, subscription: Stripe.Subscription) => {
    const supabaseAdmin = getSupabaseAdmin(); 
    console.log(`Webhook: Looking for profile with stripe_customer_id: ${customerId}`);
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles') 
        .select('id') 
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
    const subscriptionData = {
        subscription_id: subscription.id,
        subscription_status: subscription.status, // Behåll den detaljerade Stripe-statusen
        price_id: priceId, 
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        // Lägg till den uppdaterade tier-statusen:
        subscription_tier: newSubscriptionTier 
    };

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
     return true; // Returnera success
};

// Funktion för att hantera referral-konverteringar
const handleReferralConversion = async (customerId: string) => {
    const supabaseAdmin = getSupabaseAdmin();
    console.log(`Checking for referral conversion for customer ${customerId}`);

    try {
        // Find the user by Stripe customer ID
        const { data: newCustomer } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('stripe_customer_id', customerId)
            .single();

        if (!newCustomer) {
            console.log('No user found for customer ID');
            return;
        }

        // Check if this user accepted an invitation
        const { data: invitation } = await supabaseAdmin
            .from('guest_invitations')
            .select('*')
            .eq('guest_id', newCustomer.id)
            .eq('status', 'accepted')
            .is('converted_at', null)
            .single();

        if (!invitation) {
            console.log('No pending referral found for this user');
            return;
        }

        console.log(`Found referral: User ${newCustomer.id} was invited by ${invitation.inviter_id}`);

        // Mark invitation as converted
        await supabaseAdmin
            .from('guest_invitations')
            .update({
                converted_at: new Date().toISOString(),
                reward_granted: false // Will be set to true after granting rewards
            })
            .eq('id', invitation.id);

        // Grant 500 XP to the inviter
        await supabaseAdmin.rpc('add_xp_with_cap_check', {
            p_user_id: invitation.inviter_id,
            p_amount: 500,
            p_source: 'referral_conversion',
            p_description: 'Vän blev Premium-medlem'
        });

        // Get inviter's subscription for extension
        const { data: inviterProfile } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id, subscription_id')
            .eq('id', invitation.inviter_id)
            .single();

        if (inviterProfile?.stripe_customer_id && inviterProfile?.subscription_id) {
            try {
                // Add 1 month credit to inviter's subscription
                // Using a coupon for 100% off for 1 month is the cleanest approach
                const coupon = await stripe.coupons.create({
                    percent_off: 100,
                    duration: 'once',
                    max_redemptions: 1,
                    metadata: {
                        type: 'referral_reward',
                        guest_id: newCustomer.id,
                        inviter_id: invitation.inviter_id
                    }
                });

                // Apply coupon to inviter's subscription
                await stripe.subscriptions.update(inviterProfile.subscription_id, {
                    coupon: coupon.id
                });

                console.log(`Applied 1 month free coupon to inviter's subscription`);

                // Mark reward as granted
                await supabaseAdmin
                    .from('guest_invitations')
                    .update({ reward_granted: true })
                    .eq('id', invitation.id);

            } catch (stripeError) {
                console.error('Failed to apply subscription credit:', stripeError);
                // Still mark as converted even if Stripe credit fails
            }
        }

        console.log(`Referral conversion completed for invitation ${invitation.id}`);

    } catch (error) {
        console.error('Error handling referral conversion:', error);
    }
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

                 // Check if this is a referral conversion
                 await handleReferralConversion(customerId);
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
             console.log(`Handling subscription event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 // Anropa den uppdaterade funktionen som nu sätter subscription_tier
                 await updateUserSubscription(customerId, fullSubscription);
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'invoice.payment_succeeded':
             console.log(`Handling invoice event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 // Anropa den uppdaterade funktionen som nu sätter subscription_tier
                 await updateUserSubscription(customerId, fullSubscription); 
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'invoice.payment_failed':
             console.log(`Handling invoice event: ${event.type}`);
             if (customerId && relevantSubscriptionId) {
                 const fullSubscription = await stripe.subscriptions.retrieve(relevantSubscriptionId);
                 // Anropa den uppdaterade funktionen som nu sätter subscription_tier
                 await updateUserSubscription(customerId, fullSubscription); 
             } else { console.warn(`Webhook Warning: Missing data for ${event.type}`); }
             break;
        case 'checkout.session.completed':
             console.log(`Checkout session completed: ${eventData.id}. Mode: ${eventData.mode}`);
             // Viktigt: Agera inte direkt på denna, vänta på subscription/invoice events
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