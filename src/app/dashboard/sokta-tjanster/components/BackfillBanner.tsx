'use client';

// Backfill-erbjudande: hittar sparade brev som ännu inte är loggade som
// ansökningar och erbjuder att importera dem med ett klick. Avfärdas
// permanent via localStorage.

import { useEffect, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

const DISMISS_KEY = 'sokta_tjanster_backfill_dismissed';

interface BackfillCandidate {
  id: string;
  title: string | null;
  company: string | null;
  job_title: string | null;
  created_at: string | null;
}

interface BackfillBannerProps {
  onImported: (count: number) => void;
}

export default function BackfillBanner({ onImported }: BackfillBannerProps) {
  const [candidates, setCandidates] = useState<BackfillCandidate[] | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    setDismissed(false);
    fetch('/api/applications/backfill')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCandidates(json.data as BackfillCandidate[]);
      })
      .catch(() => undefined);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const handleImport = async () => {
    if (!candidates || isImporting) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/applications/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds: candidates.map((c) => c.id) }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        localStorage.setItem(DISMISS_KEY, '1');
        setDismissed(true);
        onImported(json.created as number);
      }
    } catch (error) {
      console.error('Backfill misslyckades:', error);
    } finally {
      setIsImporting(false);
    }
  };

  if (dismissed || !candidates || candidates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-orange-50/70 border border-orange-200/70 rounded-2xl px-4 py-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
          <FileText className="w-4.5 h-4.5 w-[18px] h-[18px]" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-slate-900">
            {candidates.length === 1
              ? 'Vi hittade 1 sparat brev som inte är loggat'
              : `Vi hittade ${candidates.length} sparade brev som inte är loggade`}
          </div>
          <div className="text-[12.5px] text-slate-600 mt-0.5">
            Lägg till dem som sökta tjänster så är din historik komplett från start.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="px-4 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all disabled:opacity-60 min-h-[44px]"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
        >
          {isImporting ? 'Importerar…' : 'Lägg till alla'}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Avfärda"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-orange-100/60 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}
