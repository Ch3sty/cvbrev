// src/lib/supabase/client-manager.ts
import { createClient } from '@/lib/supabase/client';
import { type Database } from '@/types/database.types';

// Singleton-mönster: En delad instans för hela applikationen
let clientInstance: ReturnType<typeof createClient> | null = null;

/**
 * Returnerar en delad Supabase-klient-instans.
 * Säkerställer att endast en instans av Supabase-klienten används i hela applikationen
 * för att undvika "Multiple GoTrueClient instances" varningen.
 */
export const getSupabaseClient = () => {
  try {
    // Kontrollera om vi är på serversidan (för att undvika problem med SSR)
    if (typeof window === 'undefined') {
      // På serversidan skapar vi alltid en ny instans
      // eftersom varje request bör ha sin egen klient
      return createClient();
    }

    // På klientsidan - återanvänd befintlig instans eller skapa en ny om ingen finns
    if (!clientInstance) {
      clientInstance = createClient();
    }

    return clientInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a mock client to prevent app crashes
    throw new Error('Supabase client initialization failed');
  }
};

/**
 * Återställ klientinstansen (främst användbart för testning)
 */
export const resetSupabaseClient = () => {
  clientInstance = null;
};