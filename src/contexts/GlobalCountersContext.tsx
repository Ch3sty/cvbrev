'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GlobalCounters {
  activeUsers: number;
  todayLetters: number;
  totalUsers: number;
}

interface GlobalCountersContextType {
  counters: GlobalCounters;
  updateCounter: (key: keyof GlobalCounters, value: number) => void;
}

const GlobalCountersContext = createContext<GlobalCountersContextType | undefined>(undefined);

export function GlobalCountersProvider({ children }: { children: ReactNode }) {
  const [counters, setCounters] = useState<GlobalCounters>({
    activeUsers: 30,
    todayLetters: 15,
    totalUsers: 500
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => {
        // Keep active users between 28-35
        const activeChange = Math.floor(Math.random() * 3) - 1;
        const newActive = Math.max(28, Math.min(35, prev.activeUsers + activeChange));

        // Occasionally increment today's letters (15-25 range)
        let newTodayLetters = prev.todayLetters;
        if (Math.random() > 0.7 && prev.todayLetters < 25) {
          newTodayLetters = prev.todayLetters + 1;
        }

        // Slowly grow total users
        const newTotalUsers = Math.random() > 0.95 ? prev.totalUsers + 1 : prev.totalUsers;

        return {
          activeUsers: newActive,
          todayLetters: newTodayLetters,
          totalUsers: Math.min(600, newTotalUsers) // Cap at 600 for realism
        };
      });
    }, 4000 + Math.random() * 2000); // Update every 4-6 seconds

    return () => clearInterval(interval);
  }, []);

  const updateCounter = (key: keyof GlobalCounters, value: number) => {
    setCounters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <GlobalCountersContext.Provider value={{ counters, updateCounter }}>
      {children}
    </GlobalCountersContext.Provider>
  );
}

export function useGlobalCounters() {
  const context = useContext(GlobalCountersContext);
  if (context === undefined) {
    throw new Error('useGlobalCounters must be used within a GlobalCountersProvider');
  }
  return context;
}