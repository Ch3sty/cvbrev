// src/lib/activity-logger.ts
/**
 * Supabase-klienten laddas vid första loggningen, inte med modulen. Loggern
 * importeras av rot-layoutens klientlager (ActivityTracker, notiserna), och en
 * statisk import lade hela supabase-js i varje publik sidas JavaScript, också
 * för besökare som aldrig loggar in och alltså aldrig loggar något.
 */
async function klient() {
  const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
  return getSupabaseClient();
}

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
  | 'premium_feature_used'      // Använde en premium-gatad funktion (punkt 12)
  | 'setting_changed'          // Ändrade inställning (t.ex. språk, tonalitet)
  | 'competence_analysis_started'   // Kompetensanalys startades
  | 'competence_analysis_completed' // Kompetensanalys slutfördes
  | 'competence_analysis_failed'    // Kompetensanalys misslyckades
  | 'cv_parsing_started'            // CV-parsing startades
  | 'cv_parsing_completed'          // CV-parsing slutfördes
  | 'cv_parsing_failed'             // CV-parsing misslyckades
  | 'anonymization_failed'          // Maskering lamnade kvar personuppgifter fore AI-anrop
  | 'cv_improvement_started'        // CV-förbättring startades
  | 'cv_improvement_completed'      // CV-förbättring slutfördes
  | 'cv_improvement_failed'         // CV-förbättring misslyckades
  | 'linkedin_optimization_started' // LinkedIn-optimering startades
  | 'linkedin_optimization_completed' // LinkedIn-optimering slutfördes
  | 'linkedin_optimization_failed' // LinkedIn-optimering misslyckades
  | 'cv_generated'                  // Formatterat CV genererades och laddades ner
  | 'jobs_searched'                 // Jobbmatchning utfördes
  | 'premium_activated'             // Premium-prenumeration aktiverades via Stripe
  | 'page_viewed'                   // Användaren besökte en sida
  | 'cta_clicked'                   // Användaren klickade på en CTA-knapp
  | 'feature_explored'              // Användaren utforskade en funktion/feature
  | 'pricing_viewed'                // Användaren tittade på prissidan
  | 'application_logged'            // Loggade en sökt tjänst
  | 'application_event_added'       // La till en händelse på en ansökan
  | 'application_shared'            // Skapade delningslänk för sökstatistiken
  // Aktiveringstratten (docs/plan-konvertering.md, B7)
  | 'quick_score_shown'             // Snabb-poängen visades efter uppladdning
  | 'test_completed'                // Testresultatsida visades
  | 'bridge_clicked'                // Klick i TestResultBridge
  | 'signup_method'                 // Hur kontot skapades (password/google)
  | 'activation_state'              // Vilket dashboardtillstånd som visades (A/B/C)
  | 'quota_wall_hit';               // Slog i en kvotgräns (räknas av lifecycle/hooks)

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
    const supabase = await klient();

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
    const supabase = await klient();

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
    const supabase = await klient();

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