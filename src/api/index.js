// API-klient för att kommunicera med backend
import { auth } from '../firebase';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Hjälpfunktion för att hantera API-anrop
async function fetchWithAuth(endpoint, options = {}) {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Om ingen användare är inloggad, kasta ett tydligt fel
      throw new Error("Användare ej inloggad. Vänligen logga in för att fortsätta.");
    }
    
    // Hämta token från den inloggade användaren
    const token = await user.getIdToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
    
    // Om vi begär en blob (t.ex. filnedladdning), returnera response direkt
    if (options.responseType === 'blob') {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Något gick fel vid begäran.');
      }
      return response;
    }
    
    // Hämta response-data som JSON
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Något gick fel.');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Hjälpfunktion för att hantera filuppladdningar
async function uploadFile(endpoint, file, additionalData = {}) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Du måste vara inloggad för att ladda upp filer');
    }
    
    const token = await user.getIdToken();
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Lägg till ytterligare data om det finns
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
      throw new Error(data.error?.message || data.message || 'Något gick fel vid uppladdningen');
    }
    
    return data;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

// API-funktioner
const api = {
  // Auth-relaterade funktioner
  auth: {
    validateToken: async () => {
      const user = auth.currentUser;
      if (!user) return null;
      
      const token = await user.getIdToken();
      return fetchWithAuth('/auth/validate-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },
    
    getMe: async () => {
      return fetchWithAuth('/auth/me');
    },
  },
  
  // Brevgenerering
  letters: {
    generate: async (cv, jobDescription, language = 'swedish', tonality = 'professional') => {
      if (!cv || typeof cv !== 'string') {
        throw new Error('CV måste tillhandahållas som text');
      }
      
      if (!jobDescription || typeof jobDescription !== 'string') {
        throw new Error('Jobbannons måste tillhandahållas som text');
      }
      
      console.log(`API Client: Skickar CV (${cv.length} tecken), jobbannons (${jobDescription.length} tecken), tonalitet: ${tonality}`);
      
      return fetchWithAuth('/letters/generate', {
        method: 'POST',
        body: JSON.stringify({ cv, jobDescription, language, tonality }),
      });
    },
    
    getHistory: async () => {
      return fetchWithAuth('/letters/history');
    },
    
    get: async (id) => {
      return fetchWithAuth(`/letters/${id}`);
    },
    
    delete: async (id) => {
      return fetchWithAuth(`/letters/${id}`, {
        method: 'DELETE',
      });
    },
    
    save: async (letterData) => {
      return fetchWithAuth('/letters/save', {
        method: 'POST',
        body: JSON.stringify(letterData),
      });
    },
    
    update: async (id, letterData) => {
      return fetchWithAuth(`/letters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(letterData),
      });
    },
  },
  
  // Användarprofil-funktioner
  user: {
    getProfile: async () => {
      return fetchWithAuth('/user/profile');
    },
    
    updateProfile: async (profileData) => {
      return fetchWithAuth('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    
    uploadCV: async (file) => {
      return uploadFile('/user/profile/cv', file);
    },
    
    getCV: async () => {
      return fetchWithAuth('/user/profile/cv', {
        responseType: 'blob',
      }).then(response => {
        // Extrahera filnamn från Content-Disposition header
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'cv.pdf';
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        return response.blob().then(blob => ({
          blob,
          filename,
        }));
      });
    },
  },
};

export default api;
