// src/types/database.types.ts (KORRIGERAD)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // --- Definition för admin_users ---
      admin_users: {
        Row: {
          id: string // uuid
          role: string | null // text
          created_at: string | null // timestamptz
          last_login: string | null // timestamptz
        }
        Insert: {
          id?: string
          role?: string | null
          created_at?: string | null
          last_login?: string | null
        }
        Update: {
          id?: string
          role?: string | null
          created_at?: string | null
          last_login?: string | null
        }
        Relationships: []
      }
      // --- Slut admin_users ---

      profiles: {
        Row: {
          id: string
          created_at: string | null
          email: string | null
          full_name: string | null
          phone: string | null
          preferred_tonality: string | null
          updated_at: string | null
          subscription_tier: string | null
          weekly_letter_count: number | null
          last_count_reset: string | null
          next_reset_date: string | null
          // --- STRIPE-FÄLT ---
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_end: string | null
          // --- SLUT STRIPE-FÄLT ---
          // *** NYA FÄLT FÖR ANALYS ***
          weekly_analysis_count: number
          last_analysis_reset: string | null
        }
        Insert: {
          id: string
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          phone?: string | null
          preferred_tonality?: string | null
          updated_at?: string | null
          subscription_tier?: string | null
          weekly_letter_count?: number | null
          last_count_reset?: string | null
          next_reset_date?: string | null
          // --- STRIPE ---
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          price_id?: string | null
          current_period_end?: string | null
          // --- ANALYS ---
          weekly_analysis_count?: number
          last_analysis_reset?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          phone?: string | null
          preferred_tonality?: string | null
          updated_at?: string | null
          subscription_tier?: string | null
          weekly_letter_count?: number | null
          last_count_reset?: string | null
          next_reset_date?: string | null
           // --- STRIPE ---
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          price_id?: string | null
          current_period_end?: string | null
          // --- ANALYS ---
          weekly_analysis_count?: number
          last_analysis_reset?: string | null
        }
         Relationships: []
      }
      cv_texts: {
        Row: {
          id: string
          user_id: string
          file_name: string
          original_file_path: string | null
          cv_text: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          original_file_path?: string | null
          cv_text: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          original_file_path?: string | null
          cv_text?: string
          created_at?: string | null
          updated_at?: string | null
        }
         Relationships: []
      }
      letters: {
        Row: {
          id: string
          user_id: string
          title: string | null
          company: string | null
          job_title: string | null
          content: string
          tonality: string | null
          job_description: string | null
          cv_text: string | null
          is_saved: boolean
          cv_path: string | null
          cv_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          company?: string | null
          job_title?: string | null
          content: string
          tonality?: string | null
          job_description?: string | null
          cv_text?: string | null
          is_saved?: boolean
          cv_path?: string | null
          cv_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          company?: string | null
          job_title?: string | null
          content?: string
          tonality?: string | null
          job_description?: string | null
          cv_text?: string | null
          is_saved?: boolean
          cv_path?: string | null
          cv_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
         Relationships: []
      }
    } // Slut Tables
    Views: { // --- Definition för system_statistics ---
      system_statistics: {
        Row: {
          total_users: number | null
          premium_users: number | null
          free_users: number | null
          total_letters: number | null
          total_saved_letters: number | null
          total_cvs: number | null
        }
      }
      // --- Slut system_statistics ---
      // RADEN [_ in never]: never ÄR BORTTAGEN HÄRIFRÅN
    } // Slut Views
    Functions: {
      // Behåll denna om den behövs/fanns
      [_ in never]: never
    }
    Enums: {
      // Behåll denna om den behövs/fanns
      [_ in never]: never
    }
     CompositeTypes: { // Lade till detta tomma objekt för fullständighet
       // Behåll denna om den behövs/fanns
       [_ in never]: never
     }
  } // Slut public
} // Slut Database

// Hjälptyper (oförändrade)
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']