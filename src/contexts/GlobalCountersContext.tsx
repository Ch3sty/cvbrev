'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface GlobalCounters {
  activeUsers: number;
  todayLetters: number;
  totalUsers: number;
  totalLetters: number;
}

interface GlobalCountersContextType {
  counters: GlobalCounters;
  updateCounter: (key: keyof GlobalCounters, value: number) => void;
  /** Startar hämtningen. Anropas av useGlobalCounters, inte av konsumenten. */
  activate: () => void;
}

const GlobalCountersContext = createContext<GlobalCountersContextType | undefined>(undefined);

export function GlobalCountersProvider({ children }: { children: ReactNode }) {
  const [counters, setCounters] = useState<GlobalCounters>({
    activeUsers: 0,
    todayLetters: 0,
    totalUsers: 0,
    totalLetters: 0,
  });

  // Räknarna visas bara på publika landningsytor. Providern ligger i rotens
  // klientlager och betalades därför av varje inloggad sidladdning: ett anrop
  // till /api/public-stats (mätt till 597 ms) plus en timer var åttonde
  // sekund, för siffror ingen såg. Hämtningen startar nu först när en
  // komponent faktiskt läser räknarna.
  const [isActive, setIsActive] = useState(false);
  const activate = useCallback(() => setIsActive(true), []);

  // Fetch real stats from API
  useEffect(() => {
    if (!isActive) return;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public-stats');
        if (res.ok) {
          const data = await res.json();
          setCounters(prev => ({
            ...prev,
            totalUsers: data.totalUsers,
            totalLetters: data.totalLetters,
            todayLetters: data.todayLetters,
          }));
        }
      } catch {
        // Silently fail — counters stay at 0
      }
    };

    fetchStats();

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Simulate activeUsers (no real-time data available)
  useEffect(() => {
    if (!isActive) return;
    // Set initial value
    setCounters(prev => ({
      ...prev,
      activeUsers: 28 + Math.floor(Math.random() * 8),
    }));

    const interval = setInterval(() => {
      setCounters(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return {
          ...prev,
          activeUsers: Math.max(28, Math.min(35, prev.activeUsers + change)),
        };
      });
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  const updateCounter = (key: keyof GlobalCounters, value: number) => {
    setCounters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <GlobalCountersContext.Provider value={{ counters, updateCounter, activate }}>
      {children}
    </GlobalCountersContext.Provider>
  );
}

export function useGlobalCounters() {
  const context = useContext(GlobalCountersContext);
  if (context === undefined) {
    throw new Error('useGlobalCounters must be used within a GlobalCountersProvider');
  }
  // Att läsa räknarna är det som startar hämtningen.
  const { activate } = context;
  useEffect(() => {
    activate();
  }, [activate]);
  return context;
}
