'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, CheckCircle2, ArrowDown, Clock } from 'lucide-react';

type Match = {
  cvIndex: number;
  jobIndex: number;
};

type Scenario = {
  fromRole: string;
  toRole: string;
  company: string;
  cvLines: string[];
  jobRequirements: string[];
  matches: Match[];
  letter: string;
};

const SCENARIOS: Scenario[] = [
  {
    fromRole: 'Projektledare',
    toRole: 'DevOps Engineer',
    company: 'Spotify',
    cvLines: [
      'Projektledare på Klarna, 4 år',
      'Ledde agila team med 8 utvecklare',
      'Implementerat CI/CD-pipelines i AWS',
      'Drivit migration till Kubernetes',
    ],
    jobRequirements: ['CI/CD', 'Kubernetes', 'Agile', 'Cloud', 'Automation'],
    matches: [
      { cvIndex: 1, jobIndex: 2 }, // Agila team → Agile
      { cvIndex: 2, jobIndex: 0 }, // CI/CD-pipelines → CI/CD
      { cvIndex: 2, jobIndex: 3 }, // AWS → Cloud
      { cvIndex: 3, jobIndex: 1 }, // Kubernetes → Kubernetes
    ],
    letter:
      'Hej Spotify!\n\nSom projektledare på Klarna har jag de senaste fyra åren lett agila team genom komplexa CI/CD-implementationer i AWS och drivit en omfattande migration till Kubernetes. Den erfarenheten gör mig redo att kliva in som DevOps Engineer hos er.',
  },
  {
    fromRole: 'Marknadsförare',
    toRole: 'UX Designer',
    company: 'Klarna',
    cvLines: [
      'Marknadschef på Boxer, 3 år',
      'Drivit 40+ A/B-tester för konvertering',
      'Designat användarflöden i Figma',
      'Skapat designsystem för kampanjsidor',
    ],
    jobRequirements: ['Användarinsikter', 'Figma', 'Prototyping', 'A/B-testning', 'Design System'],
    matches: [
      { cvIndex: 0, jobIndex: 0 }, // Marknadschef → Användarinsikter
      { cvIndex: 1, jobIndex: 3 }, // A/B-tester → A/B-testning
      { cvIndex: 2, jobIndex: 1 }, // Figma → Figma
      { cvIndex: 3, jobIndex: 4 }, // Designsystem → Design System
    ],
    letter:
      'Hej Klarna!\n\nMin bakgrund som marknadschef har gett mig djup förståelse för användarinsikter, och jag har drivit över 40 A/B-tester samt byggt ett designsystem i Figma. Nu vill jag ta steget till UX Designer och göra användarupplevelsen till mitt huvudfokus.',
  },
  {
    fromRole: 'Controller',
    toRole: 'Business Analyst',
    company: 'H&M',
    cvLines: [
      'Group Controller på Trelleborg',
      'Byggt KPI-dashboards i Power BI',
      'Avancerade SQL-analyser i Snowflake',
      'Lett strategiska budgetprocesser',
    ],
    jobRequirements: ['Dataanalys', 'SQL', 'Process', 'KPIs', 'Strategisk planering'],
    matches: [
      { cvIndex: 1, jobIndex: 3 }, // KPI-dashboards → KPIs
      { cvIndex: 2, jobIndex: 1 }, // SQL → SQL
      { cvIndex: 2, jobIndex: 0 }, // SQL-analyser → Dataanalys
      { cvIndex: 3, jobIndex: 4 }, // Strategisk → Strategisk planering
    ],
    letter:
      'Hej H&M!\n\nSom Group Controller har jag byggt KPI-dashboards och drivit strategiska budgetprocesser där dataanalys i SQL och Snowflake varit kärnan. Den kombinationen gör mig till en stark Business Analyst för er digitala transformation.',
  },
];

export default function LiveAIShowcase() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [activeMatches, setActiveMatches] = useState<number[]>([]);
  const [typedLetter, setTypedLetter] = useState('');
  const [phase, setPhase] = useState<'idle' | 'matching' | 'writing' | 'done'>('idle');

  const scenario = SCENARIOS[scenarioIndex];

  // Roterar scenario var 18:e sek
  useEffect(() => {
    const interval = setInterval(() => {
      setScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  // Reset + matchnings-fas
  useEffect(() => {
    setActiveMatches([]);
    setTypedLetter('');
    setPhase('idle');

    const startTimer = setTimeout(() => setPhase('matching'), 600);

    const matchTimers = scenario.matches.map((_, idx) =>
      setTimeout(() => {
        setActiveMatches((prev) => [...prev, idx]);
      }, 1200 + idx * 600)
    );

    const writeTimer = setTimeout(
      () => setPhase('writing'),
      1200 + scenario.matches.length * 600 + 400
    );

    return () => {
      clearTimeout(startTimer);
      clearTimeout(writeTimer);
      matchTimers.forEach(clearTimeout);
    };
  }, [scenarioIndex, scenario.matches]);

  // Skriver brevet tecken för tecken
  useEffect(() => {
    if (phase !== 'writing') return;
    let index = 0;
    const interval = setInterval(() => {
      index += 2;
      if (index >= scenario.letter.length) {
        setTypedLetter(scenario.letter);
        setPhase('done');
        clearInterval(interval);
      } else {
        setTypedLetter(scenario.letter.slice(0, index));
      }
    }, 20);
    return () => clearInterval(interval);
  }, [phase, scenario.letter]);

  // Vilka cv-rader och job-krav som matchats
  const matchedCvLines = new Set(
    activeMatches.map((idx) => scenario.matches[idx].cvIndex)
  );
  const matchedJobReqs = new Set(
    activeMatches.map((idx) => scenario.matches[idx].jobIndex)
  );

  return (
    <div className="relative w-full">
      {/* Kontroll-bar: scenario-prickar + status */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden="true"
          />
          Live · {scenario.fromRole} söker hos {scenario.company}
        </div>

        <div className="flex items-center gap-1.5">
          {SCENARIOS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setScenarioIndex(idx)}
              aria-label={`Visa scenario ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === scenarioIndex
                  ? 'w-6 bg-gradient-to-r from-orange-500 to-red-600'
                  : 'w-1.5 bg-orange-200 hover:bg-orange-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tre-kolumn på desktop, vertikal stapel på mobil */}
      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 items-stretch">
        {/* Kolumn 1: Ditt CV */}
        <div
          className="relative bg-white rounded-2xl p-4 sm:p-5 border border-orange-100"
          style={{ boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.18)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
              }}
            >
              <FileText className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Ditt CV</h3>
          </div>

          <ul className="space-y-2">
            {scenario.cvLines.map((line, idx) => {
              const isMatched = matchedCvLines.has(idx);
              return (
                <motion.li
                  key={`${scenarioIndex}-cv-${idx}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  data-cv-index={idx}
                  className={`relative flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs leading-snug transition-all duration-500 ${
                    isMatched
                      ? 'bg-orange-50 text-slate-900 font-medium border border-orange-200'
                      : 'text-slate-600 border border-transparent'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                      isMatched ? 'bg-orange-500' : 'bg-slate-300'
                    }`}
                    aria-hidden="true"
                  />
                  {line}
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Kolumn 2 (mitten): Kopplings-streck (desktop only) */}
        <div className="hidden lg:flex flex-col items-center justify-center px-2 relative min-h-[200px]">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="match-line"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#DC2626" />
              </linearGradient>
            </defs>
            {scenario.matches.map((match, idx) => {
              const isActive = activeMatches.includes(idx);
              const totalCv = scenario.cvLines.length;
              const totalJob = scenario.jobRequirements.length;
              const startY = ((match.cvIndex + 0.5) / totalCv) * 100;
              const endY = ((match.jobIndex + 0.5) / totalJob) * 100;
              return (
                <line
                  key={idx}
                  x1="0%"
                  y1={`${startY}%`}
                  x2="100%"
                  y2={`${endY}%`}
                  stroke="url(#match-line)"
                  strokeWidth="2"
                  strokeOpacity={isActive ? 0.7 : 0}
                  strokeDasharray="4 4"
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>

          <AnimatePresence>
            {phase === 'matching' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative z-10 px-2.5 py-1 rounded-full bg-white shadow-md border border-orange-200 text-[10px] font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5"
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"
                  aria-hidden="true"
                />
                Matchar
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile-pil mellan CV och annons */}
        <div className="lg:hidden flex justify-center py-1">
          <ArrowDown
            className="w-5 h-5 text-orange-400"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        {/* Kolumn 3: Annonsens krav */}
        <div
          className="relative bg-white rounded-2xl p-4 sm:p-5 border border-orange-100"
          style={{ boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.18)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FECACA 0%, #FBCFE8 100%)',
              }}
            >
              <Briefcase className="w-4 h-4 text-rose-700" strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-slate-900 text-sm">
              Krav från annonsen
            </h3>
          </div>

          <ul className="space-y-2">
            {scenario.jobRequirements.map((req, idx) => {
              const isMatched = matchedJobReqs.has(idx);
              return (
                <motion.li
                  key={`${scenarioIndex}-job-${idx}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className={`relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all duration-500 ${
                    isMatched
                      ? 'bg-orange-50 text-orange-800 font-bold border border-orange-200'
                      : 'text-slate-600 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                        isMatched ? 'bg-orange-500' : 'bg-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                    {req}
                  </span>
                  <AnimatePresence>
                    {isMatched && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-500"
                          strokeWidth={2.5}
                        />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>

          <div className="mt-4 pt-3 border-t border-orange-100">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider">
                Matchningar
              </span>
              <span className="font-black text-orange-700 tabular-nums">
                {activeMatches.length} av {scenario.matches.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-pil mellan annons och brev */}
      <div className="lg:hidden flex justify-center py-2">
        <ArrowDown
          className="w-5 h-5 text-orange-400"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </div>

      {/* Brev (under tre-kolumnen, full bredd) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase === 'idle' ? 0.4 : 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mt-4 lg:mt-5 bg-white rounded-2xl border border-orange-100 overflow-hidden"
        style={{ boxShadow: '0 12px 32px -16px rgba(249, 115, 22, 0.22)' }}
      >
        {/* Vänster gradient-strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{
            background:
              'linear-gradient(180deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)',
                }}
              >
                <FileText
                  className="w-4 h-4 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  Personligt brev
                </h3>
                <p className="text-[11px] text-slate-500">
                  Genereras från CV + annons
                </p>
              </div>
            </div>

            <AnimatePresence>
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-3 gap-3 sm:gap-5"
                >
                  <div className="text-center">
                    <p className="text-base sm:text-lg font-black text-slate-900 tabular-nums leading-none">
                      92%
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      ATS-match
                    </p>
                  </div>
                  <div className="text-center border-x border-orange-100 px-3">
                    <p className="text-base sm:text-lg font-black text-slate-900 tabular-nums leading-none">
                      15
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      Nyckelord
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-base sm:text-lg font-black tabular-nums leading-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}
                    >
                      A+
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      Betyg
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-orange-50/40 rounded-xl border border-orange-100 p-4 min-h-[140px]">
            {phase === 'idle' || phase === 'matching' ? (
              <div className="flex items-center justify-center h-full py-6 gap-2 text-xs text-slate-400">
                <Clock
                  className="w-4 h-4 text-orange-300"
                  strokeWidth={2}
                />
                Väntar på matchningar...
              </div>
            ) : (
              <p
                className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line"
                aria-live="polite"
              >
                {typedLetter}
                {typedLetter.length < scenario.letter.length && (
                  <span
                    className="inline-block w-0.5 h-3.5 ml-0.5 bg-orange-500 align-middle animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
