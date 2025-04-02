export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  preferred_tonality?: 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced';
  cv_path?: string;
  subscription_tier?: 'free' | 'premium'; // Nytt fält för användartyp
  weekly_letter_count?: number; // Nytt fält för veckogränsräknare
  last_count_reset?: string; // Nytt fält för tidsstämpel av senaste återställning
  next_reset_date?: string; // Nytt fält för när nästa nollställning sker
  weekly_analysis_count?: number; // Nytt fält för analys-räknare
  last_analysis_reset?: string; // Nytt fält för analys-återställning
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
  preferred_tonality?: 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced';
  subscription_tier?: 'free' | 'premium'; // Möjlighet att uppdatera prenumerationsnivå
  weekly_letter_count?: number; // Möjlighet att uppdatera antal brev
  last_count_reset?: string; // Möjlighet att uppdatera tidpunkt för senaste nollställning
  next_reset_date?: string; // Möjlighet att uppdatera datum för nästa nollställning
  
  // Nya fält för CV-analys
  weekly_analysis_count?: number; // Möjlighet att uppdatera antal analyser
  last_analysis_reset?: string; // Möjlighet att uppdatera tidpunkt för senaste analys-nollställning
  next_analysis_reset_date?: string; // Möjlighet att uppdatera datum för nästa analys-nollställning
}