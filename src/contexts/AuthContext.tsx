'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { KLIENT_SKAPAD, harSessionscookie } from '@/lib/supabase/klient-signal';

/**
 * Supabase-klienten laddas bara när den behövs. AuthProvider ligger i rot-
 * layouten och alltså på varje publik sida; en statisk import lade supabase-js
 * (drygt 40 kB komprimerat) i varje besökares JavaScript, också för den som
 * aldrig loggat in. Nu laddas klienten när det finns en sessionscookie, eller
 * när inloggningen eller registreringen skapar den (klient-signal.ts).
 */
async function laddaKlient() {
  const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
  return getSupabaseClient();
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Användaren läst på servern. Finns den slipper klienten en rundtur till
   * Supabase Auth vid varje sidladdning, och isLoading är false direkt så
   * inget behöver vänta på hydrering.
   */
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refreshUser = useCallback(async () => {
    try {
      const supabase = await laddaKlient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let avbruten = false;
    let avsluta: (() => void) | null = null;
    let kopplar = false;

    const koppla = async () => {
      if (kopplar || avbruten) return;
      kopplar = true;
      try {
        const supabase = await laddaKlient();
        if (avbruten) return;

        // Fångar in- och utloggning, också den som sker på sidan efter att
        // klienten skapats av inloggningsformuläret.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setUser(session?.user ?? null);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          }
        );
        avsluta = () => subscription.unsubscribe();

        // Servern har redan verifierat sessionen och skickat ner användaren.
        if (!initialUser) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!avbruten) setUser(user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (!avbruten && !initialUser) setUser(null);
      } finally {
        if (!avbruten) setIsLoading(false);
      }
    };

    if (initialUser || harSessionscookie(document.cookie)) {
      void koppla();
    } else {
      // Ingen session: ingen användare, och inget att ladda.
      setIsLoading(false);
    }

    const narKlientenSkapas = () => void koppla();
    window.addEventListener(KLIENT_SKAPAD, narKlientenSkapas);

    return () => {
      avbruten = true;
      window.removeEventListener(KLIENT_SKAPAD, narKlientenSkapas);
      avsluta?.();
    };
  }, [initialUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
