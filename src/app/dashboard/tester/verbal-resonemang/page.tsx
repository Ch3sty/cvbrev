'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target, Brain, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function VerbalResonemangPage() {
  const router = useRouter();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async () => {
    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await fetch('/api/verbalTestV1/session', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to create test session');
      }

      const data = await response.json();
      router.push(`/dashboard/tester/verbal-resonemang/test/${data.session.id}`);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Det gick inte att starta testet. Försök igen.');
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Verbal Resonemang
            </h1>
            <p className="text-slate-600 mt-1">
              Kritiskt tänkande & läsförståelse
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Om testet
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            Detta test utvärderar din förmåga att förstå, analysera och tolka skriftlig information.
            Du kommer att läsa textpassager och bedöma om påståenden är <strong>sanna</strong>,{' '}
            <strong>falska</strong> eller <strong>kan inte avgöras</strong> baserat på informationen
            i texten.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Viktigt att veta
            </h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Basera dina svar endast på informationen i textpassagen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Använd inte extern kunskap eller antaganden</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>\"Kan inte avgöra\" betyder att informationen inte finns i texten</span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <BookOpen className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Passager</p>
                <p className="text-lg font-bold text-green-900">12</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Target className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-medium">Påståenden</p>
                <p className="text-lg font-bold text-emerald-900">48</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <Clock className="w-4 h-4 text-teal-600" />
              <div>
                <p className="text-xs text-teal-600 font-medium">Tid</p>
                <p className="text-lg font-bold text-teal-900">25 min</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <Brain className="w-4 h-4 text-cyan-600" />
              <div>
                <p className="text-xs text-cyan-600 font-medium">Nivå</p>
                <p className="text-lg font-bold text-cyan-900">1-3</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Example Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Exempel
          </h2>

          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed italic">
              Företaget Tech Solutions grundades 2018 och har idag 45 anställda. De har kontor
              i Stockholm och Göteborg.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-700 mb-2">
                  Tech Solutions har fler än 50 anställda.
                </p>
                <p className="text-xs font-semibold text-green-700">
                  Svar: <span className="text-red-600">Falskt</span> (Företaget har 45 anställda)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-700 mb-2">
                  Tech Solutions planerar att öppna kontor i Malmö.
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Svar: <span className="text-slate-600">Kan inte avgöra</span> (Ingen information om framtida planer)
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <Button
            onClick={handleStartTest}
            disabled={isCreatingSession}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isCreatingSession ? (
              <span>Startar test...</span>
            ) : (
              <>
                <span>Starta test</span>
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
