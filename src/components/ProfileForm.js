"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import {
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import TonalitySelector from './TonalitySelector';

const ProfileForm = ({ user, userProfile }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTonality, setPreferredTonality] = useState('professional');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Set initial form values from user profile
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
    }
    
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setPhone(userProfile.phone || '');
      if (userProfile.preferred_tonality) {
        setPreferredTonality(userProfile.preferred_tonality);
      }
    }
  }, [user, userProfile]);

  // Clear messages when input changes
  useEffect(() => {
    if (error) setError('');
    if (success) setSuccess('');
  }, [fullName, phone, preferredTonality]);

  const saveProfile = async () => {
    // Validate phone number (optional but recommended)
    const sanitizedPhone = phone.replace(/[^\d]/g, '');
    if (sanitizedPhone && !/^(070|072|073|076|079)\d{7}$/.test(sanitizedPhone)) {
      setError('Ange ett giltigt svenskt mobilnummer');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Log the data being sent
      console.log('Updating profile with:', {
        full_name: fullName,
        phone: sanitizedPhone,
        preferred_tonality: preferredTonality,
        updated_at: new Date().toISOString()
      });

      // Verify user ID
      if (!user || !user.id) {
        throw new Error('Ingen användare är inloggad');
      }

      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: sanitizedPhone,
          preferred_tonality: preferredTonality,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select(); // Add select to get more information

      // Log the response
      console.log('Supabase update response:', { data, error });

      if (error) throw error;

      setSuccess('Din profil har uppdaterats!');
      toast.success('Profilinformationen har sparats');
    } catch (error) {
      console.error('Detailed error updating profile:', error);
      
      // More detailed error message
      const errorMessage = error.message || 'Ett okänt fel inträffade';
      setError(`Kunde inte uppdatera profil: ${errorMessage}`);
      toast.error('Kunde inte spara profilen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <h2 className="text-xl font-semibold mb-4">Profilinformation</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-start">
          <FiAlertCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded-lg flex items-start">
          <FiCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 opacity-70 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Din e-postadress kan inte ändras</p>
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Fullständigt namn</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ditt namn"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Telefonnummer</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ditt telefonnummer"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Föredragen tonalitet</label>
          <p className="text-xs text-gray-500 mb-2">Detta blir din standard när du genererar nya brev</p>
          <TonalitySelector selectedTonality={preferredTonality} onChange={setPreferredTonality} />
        </div>
      </div>
      
      <button
        onClick={saveProfile}
        disabled={isLoading}
        className={`w-full sm:w-auto py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
          isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-pink-500 hover:bg-pink-600 text-white'
        }`}
      >
        {isLoading ? (
          <>
            <FiRefreshCw className="mr-2 animate-spin" /> Sparar...
          </>
        ) : (
          <>
            <FiSave className="mr-2" /> Spara ändringar
          </>
        )}
      </button>
    </div>
  );
};

export default ProfileForm;