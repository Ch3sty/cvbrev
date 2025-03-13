"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ClientLayout from '../../components/ClientLayout';
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Timeout för att tvinga visa formuläret
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowForm(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Omdirigera om användaren är inloggad
  useEffect(() => {
    if ((!authLoading || forceShowForm) && user) {
      router.push('/');
    }
  }, [user, authLoading, router, forceShowForm]);

  // Validera formulär
  const validateForm = () => {
    if (password !== confirmPassword) {
      setErrorMessage('Lösenorden matchar inte.');
      return false;
    }
    
    if (password.length < 6) {
      setErrorMessage('Lösenordet måste vara minst 6 tecken långt.');
      return false;
    }
    
    return true;
  };

  // Hantera registrering med email och lösenord
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Registrera användare
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        // Hantera specifika Supabase-felmeddelanden
        switch (error.message) {
          case 'User already exists':
            setErrorMessage('En användare med denna e-post finns redan.');
            break;
          case 'Invalid email':
            setErrorMessage('Ogiltig e-postadress.');
            break;
          default:
            setErrorMessage('Ett fel uppstod vid registrering: ' + error.message);
        }
        setIsLoading(false);
        return;
      }

      // Skapa användarprofil i profiles-tabellen
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: name,
            created_at: new Date().toISOString(),
            preferred_tonality: 'professional'
          })
          .select();

        if (profileError) {
          console.error('Fel vid skapande av användarprofil:', profileError);
        }
      }

      // Inloggning lyckades, omdirigering hanteras av AuthContext
    } catch (error) {
      console.error('Oväntat registreringsfel:', error);
      setErrorMessage('Ett oväntat fel uppstod. Försök igen.');
      setIsLoading(false);
    }
  };

  // Hantera Google-registrering
  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        setErrorMessage('Kunde inte registrera med Google: ' + error.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Google-registreringsfel:', error);
      setErrorMessage('Ett fel uppstod med Google-registrering');
      setIsLoading(false);
    }
  };

  // Visa laddningsskärm
  if (authLoading && !forceShowForm) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-pink-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Kontrollerar autentiseringsstatus...</p>
        <button 
          onClick={() => setForceShowForm(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
        >
          Fortsätt utan att vänta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ClientLayout>
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-2">Skapa <span className="text-pink-500">konto</span></h1>
              <p className="text-gray-400">Registrera dig för att börja skapa personliga ansökningsbrev</p>
            </div>
            
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden p-8">
              {errorMessage && (
                <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Namn
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-500" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ditt namn"
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    E-postadress
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="din@email.se"
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Lösenord
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-500" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    Bekräfta lösenord
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                    isLoading
                      ? 'bg-indigo-800/50 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  } transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Registrerar...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="mr-2" /> Skapa konto
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">Eller fortsätt med</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-2 px-4 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-medium transition-colors"
                  >
                    <FcGoogle className="text-xl mr-2" /> Registrera med Google
                  </button>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-400">
                  Har du redan ett konto?{' '}
                  <Link href="/login" className="text-pink-500 hover:text-pink-400 transition-colors">
                    Logga in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
      </ClientLayout>
    </div>
  );
}