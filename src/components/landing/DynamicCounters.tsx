'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, CheckCircle2 } from 'lucide-react';
import { useGlobalCounters } from '@/contexts/GlobalCountersContext';

const NAMES = [
  'Anna L.',
  'Marcus S.',
  'Sofia A.',
  'Erik J.',
  'Maria K.',
  'Johan P.',
  'Emma N.',
  'Viktor H.',
  'Lisa M.',
  'Oscar B.',
];

const CITIES = [
  'Stockholm',
  'Göteborg',
  'Malmö',
  'Uppsala',
  'Linköping',
  'Örebro',
  'Västerås',
  'Helsingborg',
  'Jönköping',
  'Norrköping',
];

export default function DynamicCounters() {
  const { counters } = useGlobalCounters();
  const [recentUser, setRecentUser] = useState<string | null>(null);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      setRecentUser(`${name} från ${city} skapade just ett brev`);
      hideTimer = setTimeout(() => setRecentUser(null), 4000);
    }, 9000);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, []);

  const items = [
    {
      label: 'brev idag',
      value: counters.todayLetters,
      suffix: '',
      icon: FileText,
      live: true,
    },
    {
      label: 'aktiva just nu',
      value: counters.activeUsers,
      suffix: '',
      icon: Users,
      live: false,
    },
    {
      label: 'användare totalt',
      value: counters.totalUsers,
      suffix: '+',
      icon: CheckCircle2,
      live: false,
    },
  ];

  return (
    <div className="relative">
      <AnimatePresence>
        {recentUser && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute -top-11 left-0 z-10 max-w-full"
          >
            <div className="bg-white shadow-lg rounded-full px-3 py-1.5 inline-flex items-center gap-2 border border-orange-100">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] sm:text-xs font-medium text-slate-700 whitespace-nowrap">
                {recentUser}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {items.map((item) => (
          <div key={item.label} className="relative">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                }}
              >
                <item.icon
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-600"
                  strokeWidth={2.2}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-0.5 leading-none">
                  <span className="text-base sm:text-xl font-black text-slate-900 tabular-nums">
                    {item.value > 0 ? item.value.toLocaleString('sv-SE') : '—'}
                  </span>
                  {item.value > 0 && item.suffix && (
                    <span className="text-base sm:text-xl font-black text-slate-900">
                      {item.suffix}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5 leading-tight">
                  {item.label}
                </p>
              </div>
            </div>

            {item.live && counters.todayLetters > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5"
                aria-hidden="true"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
