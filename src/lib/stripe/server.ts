// src/lib/stripe/server.ts
// =========================
// KORRIGERAD: Uppdaterat apiVersion till den som förväntas av TypeScript

import Stripe from 'stripe';

// Kontrollera att den hemliga nyckeln finns i miljövariablerna
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Skapa Stripe-klienten med den förväntade API-versionen
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // ***** KORRIGERING: Använd den API-version som TS förväntar sig *****
  apiVersion: '2025-02-24.acacia', 
  // ***** SLUT PÅ KORRIGERING *****
  typescript: true, // Aktivera TypeScript-stöd i biblioteket
});