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
      profiles: {
        Row: {
          id: string
          created_at: string | null
          email: string | null
          full_name: string | null
          phone: string | null
          preferred_tonality: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          phone?: string | null
          preferred_tonality?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          phone?: string | null
          preferred_tonality?: string | null
          updated_at?: string | null
        }
      }
      cv_texts: {
        Row: {
          id: string
          user_id: string
          file_name: string
          original_file_path: string
          cv_text: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          original_file_path: string
          cv_text: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          original_file_path?: string
          cv_text?: string
          created_at?: string | null
          updated_at?: string | null
        }
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
          is_saved: boolean | null
          cv_path: string | null
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
          is_saved?: boolean | null
          cv_path?: string | null
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
          is_saved?: boolean | null
          cv_path?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}