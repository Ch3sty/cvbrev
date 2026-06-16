'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, X, Target, Zap, TrendingUp } from 'lucide-react';

/**
 * Kompakt 3-stegs-instruktion ovanfor CV-listan pa /dashboard/jobbmatchning.
 * Ersatter den tidigare MatchingInfoCard som tog for mycket plats.
 *
 * En info-ikon oppnar en popover med teknisk forklaring - sa anvandaren
 * forstar varfor matchningen ar kraftfull utan att den dominerar layouten.
 */
export default function MatchingHowItWorks() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
        <ol className="flex items-center gap-3 sm:gap-5 text-sm text-slate-700 flex-wrap">
          <Step n={1} label="Välj ett CV" />
          <Divider />
          <Step n={2} label="Vi matchar mot tusentals jobb" />
          <Divider />
          <Step n={3} label="Sök till de som passar" />
        </ol>

        <button
          onClick={() => setShowInfo(true)}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors"
          aria-label="Visa hur matchningen fungerar"
        >
          <Info className="w-4 h-4" />
          <span className="hidden sm:inline">Hur fungerar det?</span>
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfo(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">
                  Så fungerar matchningen
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-2 -mr-2 -mt-2 rounded-full hover:bg-slate-100 text-slate-500"
                  aria-label="Stäng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Vi analyserar ditt CV och letar inte bara efter din senaste yrkestitel.
                Algoritmen identifierar även <strong>närliggande roller</strong>,{' '}
                <strong>branschövergångar</strong> och{' '}
                <strong>dolda möjligheter</strong> som du annars skulle missa.
              </p>

              <div className="space-y-3">
                <Feature
                  icon={Target}
                  iconBg="bg-orange-100 text-orange-600"
                  title="Hierarkisk matchning"
                  body="Matchar exakt titel, yrkesgrupp och yrkesområde – hittar både specifika och bredare roller."
                />
                <Feature
                  icon={Zap}
                  iconBg="bg-amber-100 text-amber-600"
                  title="Kompetensbaserad analys"
                  body="Identifierar dina överförbara färdigheter och matchar mot kravprofiler."
                />
                <Feature
                  icon={TrendingUp}
                  iconBg="bg-red-100 text-red-600"
                  title="Geografisk intelligens"
                  body="Prioriterar jobb i din närhet och identifierar distansarbeten automatiskt."
                />
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-3 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
              >
                Okej, kör igång
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
          boxShadow: '0 2px 6px -1px rgba(220, 38, 38, 0.35)',
        }}
      >
        {n}
      </span>
      <span className="font-medium text-slate-700">{label}</span>
    </li>
  );
}

function Divider() {
  return <span className="text-orange-300 hidden sm:inline" aria-hidden="true">→</span>;
}

function Feature({
  icon: Icon,
  iconBg,
  title,
  body,
}: {
  icon: typeof Target;
  iconBg: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
