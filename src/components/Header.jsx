"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase/client';

const Header = () => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Stäng dropdown när användaren klickar utanför
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hantera utloggning
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Fel vid utloggning:', error);
      }
    } catch (error) {
      console.error('Oväntat fel vid utloggning:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-indigo-950 to-purple-900 py-4 px-6 md:px-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-white font-bold text-2xl">
            cv<span className="text-pink-500">brev</span>
          </Link>
          <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full opacity-80">BETA</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Hem
          </Link>
          <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
            Funktioner
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
            Priser
          </Link>

          {/* Visa endast om användare är inloggad */}
          {user && (
            <>
              <Link href="/generator" className="text-gray-300 hover:text-white transition-colors">
                Skapa brev
              </Link>
              <Link href="/history" className="text-gray-300 hover:text-white transition-colors">
                Mina brev
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white">
                  {user.email && user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-gray-300 max-w-[150px] truncate">
                  {user.email}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Min profil
                  </Link>
                  <Link 
                    href="/history" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mina brev
                  </Link>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logga ut
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Logga in
              </Link>
              <Link 
                href="/signup" 
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Kom igång
              </Link>
            </>
          )}

          {/* Separat utloggningsknapp */}
          {user && (
            <button 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logga ut
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;