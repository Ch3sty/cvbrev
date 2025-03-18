export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  preferred_tonality?: 'professional' | 'enthusiastic' | 'creative' | 'confident' | 'balanced';
  cv_path?: string;
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
}