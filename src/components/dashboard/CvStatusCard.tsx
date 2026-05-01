'use client';

/**
 * CvStatusCard
 * ------------
 * Visar antingen ett "Ladda upp / Skapa CV"-banner (när cvCount === 0)
 * eller en kompakt rad med användarens aktiva CV.
 *
 * Premissen: utan CV kan man inte skapa personliga brev, analysera CV
 * eller köra jobbmatchning. Det här är gating-elementet på dashboarden.
 *
 * Datakontrakt:
 *   cvCount        — från /api/profile eller direkt query mot cv_texts
 *   activeCvName?  — valfritt, t.ex. cv_texts.file_name
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FilePlus, Upload, PenTool, CheckCircle, Zap } from 'lucide-react';

interface CvStatusCardProps {
  cvCount: number;
  activeCvName?: string;
}

export default function CvStatusCard({ cvCount, activeCvName }: CvStatusCardProps) {
  const hasCv = cvCount > 0;

  if (!hasCv) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <FilePlus className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-slate-900">Du behöver ett CV för att börja</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                Krävs
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Personliga brev, CV-analys och jobbmatchning kräver att du först laddar upp eller skapar ett CV. Det tar ca 30 sekunder.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/profil/cv"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white shadow-sm hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(90deg, #F59E0B, #EA580C)' }}
              >
                <Upload className="w-4 h-4" strokeWidth={2.25} />
                Ladda upp CV
              </Link>
              <Link
                href="/dashboard/skapa-cv"
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <PenTool className="w-4 h-4" strokeWidth={2.25} />
                Skapa nytt CV
              </Link>
            </div>
            <div className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
              Du får +25 XP när CV:t är på plats
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Aktivt CV</div>
        <div className="font-semibold text-slate-900 truncate">
          {activeCvName || `${cvCount} ${cvCount === 1 ? 'sparat CV' : 'sparade CV'}`}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Link
          href="/dashboard/profil/cv"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          Hantera
        </Link>
        <Link
          href="/dashboard/profil/cv"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
        >
          Mina CV ({cvCount})
        </Link>
      </div>
    </motion.div>
  );
}
