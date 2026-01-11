// src/app/api/stripe/create-portal-session/route.ts
// ================================================
// Stöder både GET (redirect) och POST (JSON response)
// GET används för <a href="..."> länkar, POST för fetch/axios

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';
import { getURL } from '@/utils/helpers';

// Gemensam logik för att skapa portal session
async function createPortalSession(): Promise<{ url?: string; error?: string; status?: number }> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Portal Session Error: User not authenticated:', userError);
    return { error: 'Du måste vara inloggad', status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Portal Session Error: Error fetching profile:', profileError);
    return { error: 'Kunde inte hämta profil', status: 500 };
  }

  if (!profile || !profile.stripe_customer_id) {
    console.error(`Portal Session Error: Missing Stripe Customer ID for user ${user.id}.`);
    return { error: 'Ingen aktiv prenumeration hittades', status: 404 };
  }

  const customerId = profile.stripe_customer_id;
  console.log(`Portal Session Info: Creating portal session for customer ${customerId}`);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: getURL('dashboard/profil/prenumeration'),
  });

  if (!portalSession.url) {
    console.error(`Portal Session Error: Failed to create portal session for customer ${customerId}`);
    return { error: 'Kunde inte skapa Stripe Portal', status: 500 };
  }

  console.log(`Portal Session Info: Created session ${portalSession.id}. Redirect URL: ${portalSession.url}`);

  return { url: portalSession.url };
}

// GET: Direct redirect to Stripe Portal (för <a href="..."> länkar)
export async function GET() {
  try {
    const result = await createPortalSession();

    if (result.error) {
      // Redirect till prenumerationssidan med felmeddelande
      const errorUrl = getURL(`dashboard/profil/prenumeration?error=${encodeURIComponent(result.error)}`);
      return NextResponse.redirect(errorUrl);
    }

    return NextResponse.redirect(result.url!);
  } catch (error: any) {
    console.error('Error creating Stripe Portal session (GET):', error);
    const errorUrl = getURL(`dashboard/profil/prenumeration?error=${encodeURIComponent('Kunde inte öppna Stripe Portal')}`);
    return NextResponse.redirect(errorUrl);
  }
}

// POST: Return JSON with portal URL (för fetch/axios anrop)
export async function POST() {
  try {
    const result = await createPortalSession();

    if (result.error) {
      return new NextResponse(result.error, { status: result.status || 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error: any) {
    console.error('Error creating Stripe Portal session (POST):', error);
    return new NextResponse(`Error creating portal session: ${error.message}`, { status: 500 });
  }
}
