// src/store/cv-store.ts
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { parseCV } from '@/lib/cv-parser'

interface CV {
  id: string
  user_id: string
  file_name: string
  original_file_path: string
  cv_text: string
  created_at: string
}

interface CVStore {
  cvs: CV[]
  selectedCV: CV | null
  isLoading: boolean
  error: string | null
  
  fetchCVs: () => Promise<void>
  uploadCV: (file: File, title?: string) => Promise<boolean>
  selectCV: (id: string) => void
  deleteCV: (id: string) => Promise<boolean>
}

export const useCVStore = create<CVStore>((set, get) => ({
  cvs: [],
  selectedCV: null,
  isLoading: false,
  error: null,
  
  fetchCVs: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Ej autentiserad')
      }
      
      const { data, error } = await supabase
        .from('cv_texts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      
      set({ 
        cvs: data, 
        isLoading: false,
        // Om det finns CV:n och inget är valt, välj det första
        selectedCV: get().selectedCV || (data.length > 0 ? data[0] : null)
      })
    } catch (error: any) {
      console.error('Error fetching CVs:', error)
      set({ error: error.message, isLoading: false })
    }
  },
  
  uploadCV: async (file: File, title?: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Ej autentiserad')
      }
      
      // Parsa CV för att extrahera text
      const cvText = await parseCV(file)
      
      // Ladda upp fil till Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file)
        
      if (uploadError) throw uploadError
      
      // Skapa en publik URL för filen
      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName)
      
      // Spara metadata i databasen
      const displayName = title || file.name
      
      const { data, error } = await supabase
        .from('cv_texts')
        .insert({
          user_id: user.id,
          file_name: displayName,
          original_file_path: publicUrl,
          cv_text: cvText
        })
        .select()
        
      if (error) throw error
      
      // Uppdatera lokal state
      await get().fetchCVs()
      
      return true
    } catch (error: any) {
      console.error('Error uploading CV:', error)
      set({ error: error.message, isLoading: false })
      return false
    }
  },
  
  selectCV: (id: string) => {
    const cv = get().cvs.find(cv => cv.id === id) || null
    set({ selectedCV: cv })
  },
  
  deleteCV: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClient()
      
      // Ta bort från databasen
      const { error } = await supabase
        .from('cv_texts')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      // Om det var det valda CV:t, återställ valet
      if (get().selectedCV?.id === id) {
        set({ selectedCV: null })
      }
      
      // Uppdatera listan
      await get().fetchCVs()
      
      return true
    } catch (error: any) {
      console.error('Error deleting CV:', error)
      set({ error: error.message, isLoading: false })
      return false
    }
  }
}))