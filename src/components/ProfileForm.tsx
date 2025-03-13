'use client';

import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import api from '@/api';

interface ProfileFormProps {
  user: User | null;
  initialData?: {
    fullName?: string;
    phone?: string;
    preferredTonality?: string;
    email?: string;
    [key: string]: string | number | boolean | object | null | undefined;
  };
}

interface FormDataType {
  fullName: string;
  phone: string;
  preferredTonality: string;
}

export default function ProfileForm({ user, initialData = {} }: ProfileFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    preferredTonality: initialData?.preferredTonality || 'professional',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserData = useCallback(async (uid: string): Promise<void> => {
    try {
      setLoading(true);
      
      if (!db) {
        console.error('Firestore-databasen är inte initierad');
        toast.error('Databasanslutning misslyckades');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as FormDataType;
        setFormData({
          fullName: userData.fullName || '',
          phone: userData.phone || '',
          preferredTonality: userData.preferredTonality || 'professional'
        });
      }
    } catch (error) {
      console.error('Fel vid hämtning av användardata:', error);
      toast.error('Kunde inte hämta användardata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      console.log('Uppdaterar formulär med initialData:', initialData);
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        preferredTonality: initialData.preferredTonality || 'professional',
      });
    }
  }, [initialData]);

  useEffect(() => {
  if (!auth) return; // 💡 Förhindra att null skickas

  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUserId(currentUser.uid);
      if (!initialData || Object.keys(initialData).length === 0) {
        fetchUserData(currentUser.uid);
      }
    }
  });

  return () => unsubscribe();
}, [initialData, fetchUserData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!userId || !db) {
      toast.error('Autentisering eller databasanslutning misslyckades');
      return;
    }
    
    try {
      setLoading(true);
      
      let success = false;
      
      try {
        await api.user.updateProfile(formData);
        success = true;
        console.log('Profil uppdaterad via API');
      } catch (apiError) {
        console.log('API-anrop misslyckades, försöker med Firestore:', apiError);
      }
      
      if (!success) {
        try {
          await setDoc(doc(db, 'users', userId), formData, { merge: true });
          success = true;
          console.log('Profil uppdaterad via Firestore');
        } catch (firestoreError) {
          console.error('Firestore-anrop misslyckades:', firestoreError);
          if (firestoreError instanceof Error && 'code' in firestoreError) {
            console.error('Firestore error code:', (firestoreError as { code: string }).code);
          }
        }
      }
      
      if (success) {
        toast.success('Profilen har sparats!');
        console.log('Profil uppdaterad:', formData);
      } else {
        toast.error('Kunde inte spara profiländringar. Försök igen senare.');
      }
    } catch (error) {
      console.error('Fel vid sparande av profil:', error);
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
        <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Fullständigt namn
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
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
        <label htmlFor="preferredTonality" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Föredragen tonalitet
        </label>
        <select
          id="preferredTonality"
          name="preferredTonality"
          value={formData.preferredTonality}
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