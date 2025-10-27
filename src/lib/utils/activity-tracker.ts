// src/lib/utils/activity-tracker.ts
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Uppdaterar användarens last_active timestamp om det är äldre än 1 timme.
 * Detta förhindrar för många DB-uppdateringar och minskar belastning.
 *
 * @param supabase - Supabase client instans
 * @param userId - Användarens ID
 * @returns Promise som resolvar när uppdateringen är klar (eller hoppas över)
 */
export async function updateLastActive(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    // Hämta användarens nuvarande last_active värde
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('last_active')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('[Activity Tracker] Fel vid hämtning av profil:', fetchError);
      return;
    }

    // Beräkna tidsskillnad
    const now = new Date();
    const lastActive = profile?.last_active ? new Date(profile.last_active) : null;

    // Om last_active är null eller äldre än 1 timme, uppdatera
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const shouldUpdate = !lastActive || lastActive < oneHourAgo;

    if (shouldUpdate) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ last_active: now.toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('[Activity Tracker] Fel vid uppdatering av last_active:', updateError);
      } else {
        // Logga endast i development-miljö för att minska logs
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Activity Tracker] Uppdaterade last_active för användare ${userId}`);
        }
      }
    }
  } catch (error) {
    // Fånga alla oväntade fel och logga dem, men låt inte detta stoppa requesten
    console.error('[Activity Tracker] Oväntat fel:', error);
  }
}
