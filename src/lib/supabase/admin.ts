// src/lib/supabase/admin.ts
// =========================
// Denna fil definierar och exporterar Supabase Admin Client

import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Importera dina genererade databastyper
import { Database } from '@/types/database.types'; 

// Cache för att undvika att skapa klienten på nytt vid varje anrop inom samma serverprocess (valfritt men bra)
let supabaseAdminClient: SupabaseClient<Database> | null = null;

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
    // Om klienten redan finns, returnera den
    if (supabaseAdminClient) {
        return supabaseAdminClient;
    }

    // Hämta nödvändiga miljövariabler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

    // Validera att variablerna finns
    if (!supabaseUrl) {
        throw new Error('Supabase Admin Error: NEXT_PUBLIC_SUPABASE_URL is missing.');
    }
    if (!supabaseServiceRoleKey) {
        throw new Error('Supabase Admin Error: SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your environment variables.');
    }

    // Skapa en ny admin-klientinstans
    // OBS: ANVÄND ALDRIG SERVICE ROLE KEY PÅ KLIENTSIDAN!
    supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            // Viktigt för server-side/admin-klienter
            autoRefreshToken: false,
            persistSession: false,
            // Lägg till detectSessionInUrl: false om du använder server-side rendering
            // och vill undvika att klienten letar efter session i URL:en
             detectSessionInUrl: false 
        },
    });

    return supabaseAdminClient;
};

// Gamla namnet, kan behållas för bakåtkompatibilitet eller tas bort om du uppdaterat överallt
// export const createAdminSupabaseClient = getSupabaseAdmin; 