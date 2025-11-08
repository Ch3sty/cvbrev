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
import type { Database } from '@/types/database.types'; 

// Funktion för att uppdatera användarprofilen i Supabase (inklusive subscription_tier)
const updateUserSubscription = async (customerId: string, subscription: Stripe.Subscription) => {
    const supabaseAdmin = getSupabaseAdmin() as any; 
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
    const supabaseAdmin = getSupabaseAdmin() as any;
    console.log(`Checking for referral conversion for customer ${customerId}`);

    try {
        // Find the user by Stripe customer ID
        const { data: newCustomer, error: customerError } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('stripe_customer_id', customerId)
            .single();

        if (customerError || !newCustomer) {
            console.log('No user found for customer ID');
            return;
        }

        // Check if this user accepted an invitation
        const { data: invitation } = await supabaseAdmin
            .from('guest_invitations')
            .select('*')
            .eq('guest_user_id', newCustomer.id)
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
            user_id_param: invitation.inviter_id,
            xp_amount: 500,
            source_param: 'referral_conversion',
            description_param: 'Vän blev Premium-medlem'
        });

        // Grant 7 days premium to inviter by extending their Stripe trial
        const { data: inviterProfile, error: inviterError } = await supabaseAdmin
            .from('profiles')
            .select('id, subscription_id, subscription_status, stripe_customer_id')
            .eq('id', invitation.inviter_id)
            .single();

        if (!inviterError && inviterProfile) {
            try {
                // Check if inviter has an active Stripe subscription
                if (inviterProfile.subscription_id) {
                    console.log(`Extending Stripe trial for inviter ${invitation.inviter_id}, subscription ${inviterProfile.subscription_id}`);

                    // Retrieve the current subscription from Stripe
                    const subscription = await stripe.subscriptions.retrieve(inviterProfile.subscription_id);

                    // Calculate new trial end date (current trial_end + 7 days)
                    const currentTrialEnd = subscription.trial_end || Math.floor(Date.now() / 1000);
                    const newTrialEnd = currentTrialEnd + (7 * 24 * 60 * 60); // Add 7 days in seconds

                    // Update the subscription to extend trial
                    await stripe.subscriptions.update(inviterProfile.subscription_id, {
                        trial_end: newTrialEnd,
                        proration_behavior: 'none' // Don't prorate when extending trial
                    });

                    console.log(`Extended Stripe trial to ${new Date(newTrialEnd * 1000).toISOString()} for inviter ${invitation.inviter_id}`);
                } else if (inviterProfile.stripe_customer_id) {
                    // Inviter has no active subscription but has a Stripe customer ID
                    // Create a new trial subscription for them
                    console.log(`Creating new trial subscription for inviter ${invitation.inviter_id}`);

                    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
                    if (!priceId) {
                        throw new Error('Missing STRIPE_PRICE_ID environment variable');
                    }

                    await stripe.subscriptions.create({
                        customer: inviterProfile.stripe_customer_id,
                        items: [{ price: priceId }],
                        trial_period_days: 7,
                        payment_behavior: 'default_incomplete',
                        payment_settings: {
                            save_default_payment_method: 'on_subscription'
                        }
                    });

                    console.log(`Created new 7-day trial subscription for inviter ${invitation.inviter_id}`);
                } else {
                    // Fallback: No Stripe integration, use old premium_until method
                    console.log(`Inviter has no Stripe subscription, using fallback premium_until method`);
                    const inviterPremiumEndDate = new Date();
                    inviterPremiumEndDate.setDate(inviterPremiumEndDate.getDate() + 7);

                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            premium_until: inviterPremiumEndDate.toISOString(),
                            premium_source: 'referral'
                        })
                        .eq('id', invitation.inviter_id);
                }

                // Mark reward as granted
                await supabaseAdmin
                    .from('guest_invitations')
                    .update({ reward_granted: true })
                    .eq('id', invitation.id);

                console.log(`Granted 7 days premium to inviter ${invitation.inviter_id}`);

            } catch (premiumError) {
                console.error('Failed to grant premium to inviter:', premiumError);
                // Still mark as converted even if premium grant fails
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

             // Hantera ny Moz-stil signup flow
             if (eventData.metadata?.signupFlow === 'moz-style' && eventData.metadata?.isNewUser === 'true') {
               const userId = eventData.metadata.userId
               const userEmail = eventData.metadata.email

               if (userId && userEmail) {
                 console.log(`[TRIAL WEBHOOK MOZ] Processing new signup for user: ${userId}`)

                 try {
                   const supabaseAdmin = getSupabaseAdmin() as any

                   // Update user metadata to mark signup as complete
                   await supabaseAdmin.auth.admin.updateUserById(userId, {
                     user_metadata: {
                       signup_incomplete: false,
                       trial_started_at: new Date().toISOString()
                     }
                   })

                   console.log(`[TRIAL WEBHOOK MOZ] User metadata updated for: ${userId}`)

                   // Skicka välkomst-email (utan login-länk since user auto-logs in)
                   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'

                   try {
                     const emailResponse = await fetch(`${baseUrl}/api/email/send-trial-welcome-moz`, {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({
                         email: userEmail,
                         userId
                       })
                     })

                     if (emailResponse.ok) {
                       console.log(`[TRIAL WEBHOOK MOZ] Welcome email sent to: ${userEmail}`)
                     } else {
                       console.error('[TRIAL WEBHOOK MOZ] Failed to send welcome email:', await emailResponse.text())
                     }
                   } catch (emailError) {
                     console.error('[TRIAL WEBHOOK MOZ] Error sending welcome email:', emailError)
                   }
                 } catch (error) {
                   console.error('[TRIAL WEBHOOK MOZ] Error in moz-style trial handler:', error)
                 }
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