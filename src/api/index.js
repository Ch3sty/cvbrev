// API client for communicating with backend
import { supabase } from '@/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper function to handle API calls
async function fetchWithAuth(endpoint, options = {}) {
  try {
    // Get session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error("Authentication error. Please sign in again.");
    }
    
    if (!sessionData.session) {
      throw new Error("No authenticated user. Please sign in.");
    }
    
    // Get token from the session
    const token = sessionData.session.access_token;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
    
    // If requesting a blob (e.g., file download), return response directly
    if (options.responseType === 'blob') {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Something went wrong with the request.');
      }
      return response;
    }
    
    // Get response data as JSON
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Something went wrong.');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper function to handle file uploads
async function uploadFile(endpoint, file, additionalData = {}) {
  try {
    // Get session from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw new Error("Authentication error. Please sign in again.");
    }
    
    if (!sessionData.session) {
      throw new Error("No authenticated user. Please sign in.");
    }
    
    // Get token from the session
    const token = sessionData.session.access_token;
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data if provided
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Something went wrong with the upload');
    }
    
    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

// API functions
const api = {
  // Auth-related functions
  auth: {
    validateToken: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session) return null;
      
      return fetchWithAuth('/auth/validate-token', {
        method: 'POST',
        body: JSON.stringify({ token: session.access_token }),
      });
    },
    
    getMe: async () => {
      return fetchWithAuth('/auth/me');
    },
  },
  
  // Letter generation
  letters: {
    generate: async (cv, jobDescription, language = 'swedish', tonality = 'professional') => {
      if (!cv || typeof cv !== 'string') {
        throw new Error('CV must be provided as text');
      }
      
      if (!jobDescription || typeof jobDescription !== 'string') {
        throw new Error('Job description must be provided as text');
      }
      
      console.log(`API Client: Sending CV (${cv.length} chars), job description (${jobDescription.length} chars), tonality: ${tonality}`);
      
      return fetchWithAuth('/letters/generate', {
        method: 'POST',
        body: JSON.stringify({ cv, jobDescription, language, tonality }),
      });
    },
    
    getHistory: async () => {
      // This can now be done directly with Supabase
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    get: async (id) => {
      // This can now be done directly with Supabase
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { letter: data };
    },
    
    delete: async (id) => {
      // This can now be done directly with Supabase
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    
    save: async (letterData) => {
      // Get user_id from Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("No authenticated user");
      
      const user_id = sessionData.session.user.id;
      
      // Prepare data for Supabase
      const dbLetterData = {
        user_id,
        content: letterData.content,
        title: letterData.title || 'Namnlöst brev',
        company: letterData.company || '',
        job_title: letterData.jobTitle || '',
        tonality: letterData.tonality,
        cv_text: letterData.cvText || '',
        job_description: letterData.jobDescription || '',
        is_saved: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (letterData.letterId) {
        // Update existing letter
        const { data, error } = await supabase
          .from('letters')
          .update(dbLetterData)
          .eq('id', letterData.letterId)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      } else {
        // Insert new letter
        const { data, error } = await supabase
          .from('letters')
          .insert(dbLetterData)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      }
      
      return result;
    },
    
    update: async (id, letterData) => {
      // Prepare data for Supabase
      const dbLetterData = {
        content: letterData.content,
        title: letterData.title || '',
        company: letterData.company || '',
        job_title: letterData.jobTitle || '',
        tonality: letterData.tonality || 'professional',
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('letters')
        .update(dbLetterData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data?.[0];
    },
  },
  
  // User profile functions
  user: {
    getProfile: async () => {
      // Get user_id from Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("No authenticated user");
      
      const user_id = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    updateProfile: async (profileData) => {
      // Get user_id from Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("No authenticated user");
      
      const user_id = sessionData.session.user.id;
      
      // Prepare data for Supabase
      const dbProfileData = {
        id: user_id,
        full_name: profileData.full_name || profileData.fullName || '',
        phone: profileData.phone || '',
        preferred_tonality: profileData.preferred_tonality || profileData.preferredTonality || 'professional',
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(dbProfileData)
        .select();
      
      if (error) throw error;
      return data?.[0];
    },
    
    uploadCV: async (file) => {
      // Get user_id from Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("No authenticated user");
      
      const user_id = sessionData.session.user.id;
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user_id}/cv.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });
      
      if (uploadError) throw uploadError;
      
      // Update profile with CV information
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user_id,
          cv: {
            name: file.name,
            last_updated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        });
      
      if (profileError) throw profileError;
      
      return { success: true, filename: file.name };
    },
    
    getCV: async () => {
      // Get user_id from Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("No authenticated user");
      
      const user_id = sessionData.session.user.id;
      
      // Get profile to find CV information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cv')
        .eq('id', user_id)
        .single();
      
      if (profileError) throw profileError;
      if (!profile?.cv) throw new Error("No CV found");
      
      const fileExt = profile.cv.name.split('.').pop();
      const fileName = `${user_id}/cv.${fileExt}`;
      
      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('cvs')
        .download(fileName);
      
      if (downloadError) throw downloadError;
      
      return {
        blob: fileData,
        filename: profile.cv.name,
      };
    },
  },
};

export default api;