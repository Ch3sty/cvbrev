"use client";

import React, { useState } from 'react';
import { supabase } from '@/supabase/client';
import {
  FiAlertCircle,
  FiLock,
  FiLogOut,
  FiRefreshCw
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const ProfileSettings = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handlePasswordReset = async () => {
    try {
      setIsResettingPassword(true);
      setError('');

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Instruktioner för lösenordsåterställning har skickats till din e-post');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(`Kunde inte skicka lösenordsåterställning: ${error.message}`);
      toast.error('Kunde inte skicka lösenordsåterställning');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Kunde inte logga ut');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <h2 className="text-xl font-semibold mb-4">Inställningar</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-start">
          <FiAlertCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <FiLock className="mr-2 text-indigo-400" /> Säkerhet
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Du kan återställa ditt lösenord genom att klicka på knappen nedan. 
              En länk för att återställa lösenordet kommer att skickas till din e-post.
            </p>
            
            <button
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              className={`w-full sm:w-auto py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isResettingPassword
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-700 hover:bg-indigo-600 text-white'
              }`}
            >
              {isResettingPassword ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" /> Skickar...
                </>
              ) : (
                <>
                  <FiLock className="mr-2" /> Återställ lösenord
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-medium mb-4 flex items-center text-red-400">
            <FiLogOut className="mr-2" /> Logga ut
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Klicka på knappen nedan för att logga ut från ditt konto.
            </p>
            
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className={`w-full sm:w-auto py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                isLoading
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-red-700 hover:bg-red-600 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" /> Loggar ut...
                </>
              ) : (
                <>
                  <FiLogOut className="mr-2" /> Logga ut
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Ansökningsbrevgenerator &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;