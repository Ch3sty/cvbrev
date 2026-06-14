export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  location?: string; // Ort/plats för användaren
  goal_role?: string; // Målroll/drömjobb - personaliserar chatt & jobbmatchning
  include_phone_in_letters?: boolean; // Inkludera telefon i personliga brev
  include_location_in_letters?: boolean; // Inkludera plats i personliga brev
  linkedin_url?: string | null; // LinkedIn profile URL
  profile_photo_url?: string; // Profile photo URL
  profile_photo_path?: string; // Profile photo storage path
  profile_photo_uploaded_at?: string; // Profile photo upload timestamp
  preferred_tonality?: 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
  cv_path?: string;
  subscription_tier?: 'free' | 'premium'; // Nytt fält för användartyp
  weekly_letter_count?: number; // Nytt fält för veckogränsräknare
  last_count_reset?: string; // Nytt fält för tidsstämpel av senaste återställning
  next_reset_date?: string; // Nytt fält för när nästa nollställning sker
  
  // Gamla fältnamn för analys (hålls för bakåtkompatibilitet)
  weekly_analysis_count?: number;
  last_analysis_reset?: string;
  
  // Nya fältnamn för kompetensanalys i databasen
  weekly_competence_analysis_count?: number;
  last_competence_analysis_reset?: string;

  // LinkedIn-optimeringar kvot
  weekly_linkedin_count?: number;
  weekly_linkedin_reset_at?: string;
  weekly_linkedin_first_used_at?: string;

  // Premium gästinbjudningar
  guest_invitations_remaining?: number;
  premium_until?: string;
  premium_source?: string | null;

  // Email verification
  email_verified_at?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface CV {
  name: string;
  url: string | null;
  lastUpdated: string | null;
}

export interface ProfileUpdateParams {
  full_name?: string;
  phone?: string;
  location?: string; // Ort/plats
  goal_role?: string; // Målroll/drömjobb - personaliserar chatt & jobbmatchning
  include_phone_in_letters?: boolean; // Inkludera telefon i brev
  include_location_in_letters?: boolean; // Inkludera plats i brev
  linkedin_url?: string | null; // LinkedIn profile URL
  profile_photo_url?: string; // Profile photo URL
  profile_photo_path?: string; // Profile photo storage path
  profile_photo_uploaded_at?: string; // Profile photo upload timestamp
  preferred_tonality?: 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced' | 'auto';
  subscription_tier?: 'free' | 'premium'; // Möjlighet att uppdatera prenumerationsnivå
  weekly_letter_count?: number; // Möjlighet att uppdatera antal brev
  last_count_reset?: string; // Möjlighet att uppdatera tidpunkt för senaste nollställning
  next_reset_date?: string; // Möjlighet att uppdatera datum för nästa nollställning
  
  // Gamla fältnamn för CV-analys (för bakåtkompatibilitet)
  weekly_analysis_count?: number; 
  last_analysis_reset?: string;
  next_analysis_reset_date?: string;
  
  // Nya fältnamn för kompetensanalys i databasen
  weekly_competence_analysis_count?: number;
  last_competence_analysis_reset?: string;
  // next_analysis_reset_date används för både gamla och nya funktionaliteten
}