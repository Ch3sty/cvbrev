// src/store/cv-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { parseCV } from '@/lib/cv-parser'
import type { CVTemplateType } from '@/lib/cv/cv-metadata'
import type { ParsedCV } from '@/lib/cv/cv-parser'
// AI recommendations removed - using simple static recommendations instead

interface CV {
  id: string
  user_id: string
  file_name: string
  original_file_path: string
  cv_text: string
  created_at: string
  structured_data: ParsedCV | null
}

// Template preview cache interface
interface TemplatePreviewCache {
  [key: string]: {
    imageUrl: string
    timestamp: number
    templateId: CVTemplateType
    cvId: string
  }
}

// Template usage analytics - Import from types.ts
import type { TemplateUsage } from '@/lib/cv/types'

interface CVStore {
  cvs: CV[]
  selectedCV: CV | null
  isLoading: boolean
  error: string | null
  
  // Preview cache
  previewCache: TemplatePreviewCache
  templateUsage: TemplateUsage[]
  
  // Basic CV operations
  fetchCVs: () => Promise<void>
  uploadCV: (file: File, title?: string) => Promise<boolean>
  selectCV: (id: string) => void
  deleteCV: (id: string) => Promise<boolean>
  
  // Preview cache operations
  getCachedPreview: (templateId: CVTemplateType, cvId: string) => string | null
  setCachedPreview: (templateId: CVTemplateType, cvId: string, imageUrl: string) => void
  clearPreviewCache: () => void
  cleanExpiredPreviews: () => void
  
  // Template analytics
  trackTemplateUsage: (templateId: CVTemplateType, generationTime: number) => void
  getMostUsedTemplates: () => TemplateUsage[]
  // User choice only - no recommendations
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minuter
const MAX_CACHE_SIZE = 20; // Maximalt antal cachade förhandsvisningar

export const useCVStore = create<CVStore>()(
  persist(
    (set, get) => ({
      cvs: [],
      selectedCV: null,
      isLoading: false,
      error: null,
      
      // Initialize cache and analytics
      previewCache: {},
      templateUsage: [],
  
  fetchCVs: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const supabase = getSupabaseClient()
      
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
      const supabase = getSupabaseClient()
      
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
      const supabase = getSupabaseClient()
      
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
  },
  
  // Preview cache operations
  getCachedPreview: (templateId: CVTemplateType, cvId: string) => {
    const cacheKey = `${templateId}_${cvId}`;
    const cached = get().previewCache[cacheKey];
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      // Remove expired entry
      const { [cacheKey]: removed, ...rest } = get().previewCache;
      set({ previewCache: rest });
      
      // Clean up blob URL
      if (cached.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cached.imageUrl);
      }
      
      return null;
    }
    
    return cached.imageUrl;
  },
  
  setCachedPreview: (templateId: CVTemplateType, cvId: string, imageUrl: string) => {
    const cacheKey = `${templateId}_${cvId}`;
    const currentCache = get().previewCache;
    
    // Clean expired entries first
    get().cleanExpiredPreviews();
    
    // If cache is full, remove oldest entry
    const cacheEntries = Object.entries(get().previewCache);
    if (cacheEntries.length >= MAX_CACHE_SIZE) {
      const oldestEntry = cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldestEntry) {
        const { [oldestEntry[0]]: removed, ...rest } = get().previewCache;
        if (removed.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(removed.imageUrl);
        }
        set({ previewCache: rest });
      }
    }
    
    // Add new entry
    set({
      previewCache: {
        ...get().previewCache,
        [cacheKey]: {
          imageUrl,
          timestamp: Date.now(),
          templateId,
          cvId
        }
      }
    });
  },
  
  clearPreviewCache: () => {
    // Clean up all blob URLs
    Object.values(get().previewCache).forEach(cached => {
      if (cached.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cached.imageUrl);
      }
    });
    
    set({ previewCache: {} });
  },
  
  cleanExpiredPreviews: () => {
    const now = Date.now();
    const currentCache = get().previewCache;
    const cleanedCache: TemplatePreviewCache = {};
    
    Object.entries(currentCache).forEach(([key, cached]) => {
      if (now - cached.timestamp <= CACHE_DURATION) {
        cleanedCache[key] = cached;
      } else {
        // Clean up expired blob URLs
        if (cached.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(cached.imageUrl);
        }
      }
    });
    
    set({ previewCache: cleanedCache });
  },
  
  // Template analytics
  trackTemplateUsage: (templateId: CVTemplateType, generationTime: number) => {
    const currentUsage = get().templateUsage;
    const existingIndex = currentUsage.findIndex(usage => usage.templateId === templateId);
    
    if (existingIndex >= 0) {
      // Update existing usage
      const existing = currentUsage[existingIndex];
      const newAvgTime = (existing.averageGenerationTime * existing.count + generationTime) / (existing.count + 1);
      
      const updatedUsage = [...currentUsage];
      updatedUsage[existingIndex] = {
        ...existing,
        count: existing.count + 1,
        lastUsed: new Date(),
        averageGenerationTime: newAvgTime,
        successRate: existing.successRate
      };
      
      set({ templateUsage: updatedUsage });
    } else {
      // Add new usage entry
      set({
        templateUsage: [
          ...currentUsage,
          {
            templateId,
            count: 1,
            lastUsed: new Date(),
            averageGenerationTime: generationTime,
            successRate: 1.0
          }
        ]
      });
    }
  },
  
  getMostUsedTemplates: () => {
    return get().templateUsage
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },
  
  // All recommendation functions removed - users choose freely
}),
{
  name: 'cv-store',
  // Only persist non-sensitive data
  partialize: (state) => ({
    templateUsage: state.templateUsage,
    // Don't persist preview cache (contains blob URLs) or CVs (sensitive data)
  })
}
))