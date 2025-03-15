'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProfileFormProps {
  user: any | null;
  initialData?: {
    full_name?: string;
    phone?: string;
    preferred_tonality?: string;
    email?: string;
    [key: string]: any;
  };
  onSubmit?: (formData: any) => Promise<void>;
}

interface FormDataType {
  full_name: string;
  phone: string;
  preferred_tonality: string;
}

export default function ProfileForm({ user, initialData = {}, onSubmit }: ProfileFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    preferred_tonality: initialData?.preferred_tonality || 'professional',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const { refreshUserProfile } = useAuth();

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('Uppdaterar formulär med initialData:', initialData);
      setFormData({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        preferred_tonality: initialData.preferred_tonality || 'professional',
      });
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Du måste vara inloggad för att uppdatera din profil');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the provided onSubmit function if available
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default implementation using Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            preferred_tonality: formData.preferred_tonality,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }

        // Refresh user profile in context
        await refreshUserProfile();
        toast.success('Profilen har sparats!');
      }
    } catch (error) {
      console.error('Fel vid uppdatering av profil:', error);
      toast.error('Kunde inte spara profiländringar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={user?.email || ''}
          disabled
          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Din e-postadress kan inte ändras
        </p>
      </div>

      <div>
        <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Fullständigt namn
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
          placeholder="Ditt namn"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Telefonnummer
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
          placeholder="Ditt telefonnummer"
        />
      </div>
      
      <div>
        <label htmlFor="preferred_tonality" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Föredragen tonalitet
        </label>
        <select
          id="preferred_tonality"
          name="preferred_tonality"
          value={formData.preferred_tonality}
          onChange={handleChange}
          className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
        >
          <option value="professional">Professionell</option>
          <option value="enthusiastic">Entusiastisk</option>
          <option value="creative">Kreativ</option>
          <option value="confident">Självsäker</option>
          <option value="balanced">Balanserad</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Detta blir din standard när du genererar nya brev
        </p>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Sparar...' : 'Spara ändringar'}
      </button>
    </form>
  );
}