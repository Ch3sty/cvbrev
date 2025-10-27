// src/lib/activity-logger.ts
import { getSupabaseClient } from '@/lib/supabase/client-manager';

// Aktivitetstyper
export type ActivityType =
  | 'login'                     // Inloggning
  | 'logout'                    // Utloggning
  | 'registered'                // Ny registrering
  | 'letter_generation_started' // Generering påbörjad
  | 'letter_created'            // Brev skapades (används för lyckad generering)
  | 'letter_generation_failed'  // Generering misslyckades
  | 'letter_saved'              // Brev sparades
  | 'letter_save_failed'        // Misslyckades spara brev
  | 'save_limit_reached'        // Försökte spara över gränsen
  | 'letter_exported'           // Brev exporterades (PDF, DOCX)
  | 'letter_edit_initiated'     // Påbörjade redigering av sparat brev
  | 'letter_edit_attempt_unsaved' // Försökte redigera osparat brev
  | 'cv_uploaded'               // Ny CV laddades upp
  | 'cv_deleted'                // CV togs bort
  | 'cv_analysis_started'       // CV-analys startades
  | 'cv_analysis_completed'     // CV-analys slutfördes framgångsrikt
  | 'subscription_upgraded'     // Uppgraderade till premium
  | 'subscription_downgraded'   // Nedgraderade från premium
  | 'password_reset'            // Återställning av lösenord
  | 'profile_updated'           // Profiluppdatering
  | 'email_verified'            // E-post verifierad
  | 'password_changed'          // Lösenord ändrat
  | 'upgrade_clicked'           // Klickade på uppgraderingsknapp
  | 'premium_feature_attempt'   // Försökte använda premium-funktion (som gratis)
  | 'setting_changed'          // Ändrade inställning (t.ex. språk, tonalitet)
  | 'competence_analysis_started'   // Kompetensanalys startades
  | 'competence_analysis_completed' // Kompetensanalys slutfördes
  | 'competence_analysis_failed'    // Kompetensanalys misslyckades
  | 'cv_parsing_started'            // CV-parsing startades
  | 'cv_parsing_completed'          // CV-parsing slutfördes
  | 'cv_parsing_failed'             // CV-parsing misslyckades
  | 'cv_improvement_started'        // CV-förbättring startades
  | 'cv_improvement_completed'      // CV-förbättring slutfördes
  | 'cv_improvement_failed'         // CV-förbättring misslyckades
  | 'linkedin_optimization_started' // LinkedIn-optimering startades
  | 'linkedin_optimization_completed' // LinkedIn-optimering slutfördes
  | 'linkedin_optimization_failed'; // LinkedIn-optimering misslyckades
  // Lägg till fler typer vid behov

/**
 * Loggar en användaraktivitet i databasen
 *
 * @param userId - Användarens ID
 * @param activityType - Typ av aktivitet (en sträng som matchar ActivityType)
 * @param description - Beskrivning av aktiviteten
 * @param metadata - Valfri extra information
 * @returns - Sant om loggningen lyckades, annars falskt
 */
export async function logUserActivity(
  userId: string,
  activityType: ActivityType,
  description: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        description,
        metadata,
      });

    if (error) {
      console.warn(`Kunde inte logga aktivitet (${activityType}):`, error.message);
      return false;
    }

    // console.log(`Aktivitet loggad: ${activityType} för ${userId}`);
    return true;
  } catch (error) {
    console.warn('Oväntat fel vid aktivitetsloggning:', error);
    return false;
  }
}

/**
 * Hämtar senaste aktiviteter för en specifik användare
 * @param userId - Användarens ID
 * @param limit - Maxantal aktiviteter att hämta
 * @returns Promise<any[]> - Array med användaraktiviteter
 */
export async function getUserActivities(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Fel vid hämtning av användaraktiviteter:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Oväntat fel vid hämtning av aktiviteter:', error);
    return [];
  }
}

/**
 * Hämtar senaste aktiviteter för alla användare - admin-funktion
 * @param limit - Maxantal aktiviteter att hämta
 * @returns Promise<any[]> - Array med aktiviteter inklusive användarinfo
 */
export async function getSystemActivities(limit: number = 20): Promise<any[]> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_activities')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Fel vid hämtning av systemaktiviteter:', error.message);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      email: item.profiles?.email,
      full_name: item.profiles?.full_name,
      activity_type: item.activity_type,
      description: item.description,
      created_at: item.created_at,
      metadata: item.metadata
    }));
  } catch (error) {
    console.warn('Oväntat fel vid hämtning av systemaktiviteter:', error);
    return [];
  }
}