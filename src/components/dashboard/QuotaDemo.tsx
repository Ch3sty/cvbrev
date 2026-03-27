'use client';
import { useState } from 'react';
import QuotaIndicator from './QuotaIndicator';
import StatsWidget from './StatsWidget';
import { PenTool, Brain, Users, Star } from 'lucide-react';

/**
 * Demo-komponent för att visa kvot-systemets funktionalitet
 * Denna komponent visar olika scenarier för kvot-användning
 */
export default function QuotaDemo() {
  const [demoMode, setDemoMode] = useState<'free_low' | 'free_warning' | 'free_exhausted' | 'premium'>('free_low');

  // Demo-data för olika scenarier
  const scenarios = {
    free_low: {
      title: 'Gratis - Låg användning (40%)',
      letterUsed: 2,
      letterLimit: 5,
      analysisUsed: 1,
      analysisLimit: 3,
      isPremium: false
    },
    free_warning: {
      title: 'Gratis - Varning (80%)',
      letterUsed: 4,
      letterLimit: 5,
      analysisUsed: 3,
      analysisLimit: 3,
      isPremium: false
    },
    free_exhausted: {
      title: 'Gratis - Kvot slut (100%)',
      letterUsed: 5,
      letterLimit: 5,
      analysisUsed: 3,
      analysisLimit: 3,
      isPremium: false
    },
    premium: {
      title: 'Premium - Obegränsad',
      letterUsed: 15,
      letterLimit: 999,
      analysisUsed: 8,
      analysisLimit: 999,
      isPremium: true
    }
  };

  const currentScenario = scenarios[demoMode];

  // Demo-datum för återställning
  const nextMonthlyReset = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 dagar
  const nextWeeklyReset = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 dagar

  return (
    <div className="p-8 bg-gradient-to-br from-white via-slate-50/30 to-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Jobbcoach.ai Kvot-System Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Interaktiv demonstration av det förbättrade kvot-systemet med progress bars, countdown-timers och varningar.
          </p>

          {/* Scenario-väljare */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setDemoMode(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  demoMode === key
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {scenario.title}
              </button>
            ))}
          </div>
        </div>

        {/* Current Scenario Info */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aktuellt Scenario: {currentScenario.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Brev:</span> {currentScenario.letterUsed}/{currentScenario.isPremium ? '∞' : currentScenario.letterLimit}
              </div>
              <div>
                <span className="font-medium">Analyser:</span> {currentScenario.analysisUsed}/{currentScenario.isPremium ? '∞' : currentScenario.analysisLimit}
              </div>
              <div>
                <span className="font-medium">Status:</span> {currentScenario.isPremium ? 'Premium ✨' : 'Gratis'}
              </div>
              <div>
                <span className="font-medium">Återställning:</span> {currentScenario.isPremium ? 'Ej tillämpligt' : 'Automatisk'}
              </div>
            </div>
          </div>
        </div>

        {/* StatsWidget Demo */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            StatsWidget med Kvot-funktioner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brev Widget */}
            <StatsWidget
              title={currentScenario.isPremium ? "Skapade Brev" : "Brev denna månad"}
              value={currentScenario.isPremium ? currentScenario.letterUsed : `${currentScenario.letterUsed}/${currentScenario.letterLimit}`}
              subtitle={currentScenario.isPremium ? "Obegränsade brev" : `${Math.max(0, currentScenario.letterLimit - currentScenario.letterUsed)} kvar denna månad`}
              icon={PenTool}
              color="pink"
              isPremium={currentScenario.isPremium}
              quotaInfo={!currentScenario.isPremium ? {
                used: currentScenario.letterUsed,
                limit: currentScenario.letterLimit,
                resetDate: nextMonthlyReset,
                resetType: 'monthly',
                showProgress: true,
                showCountdown: true
              } : undefined}
            />

            {/* CV-Analyser Widget */}
            <StatsWidget
              title={currentScenario.isPremium ? "CV-Analyser" : "Analyser denna vecka"}
              value={currentScenario.isPremium ? "Obegränsade" : `${currentScenario.analysisUsed}/${currentScenario.analysisLimit}`}
              subtitle={currentScenario.isPremium ? "Alla funktioner tillgängliga" : `${Math.max(0, currentScenario.analysisLimit - currentScenario.analysisUsed)} kvar denna vecka`}
              icon={Brain}
              color="blue"
              isPremium={currentScenario.isPremium}
              quotaInfo={!currentScenario.isPremium ? {
                used: currentScenario.analysisUsed,
                limit: currentScenario.analysisLimit,
                resetDate: nextWeeklyReset,
                resetType: 'weekly',
                showProgress: true,
                showCountdown: true
              } : undefined}
            />

            {/* Prenumeration Widget */}
            <StatsWidget
              title="Prenumeration"
              value={currentScenario.isPremium ? "Premium ✨" : "Gratis"}
              subtitle={currentScenario.isPremium ? "Obegränsad tillgång" : "Uppgradera för full åtkomst"}
              icon={Star}
              color={currentScenario.isPremium ? "green" : "orange"}
              isPremium={currentScenario.isPremium}
            />

            {/* Demo Widget */}
            <StatsWidget
              title="Demo Status"
              value="Aktiv"
              subtitle="Visar kvot-systemets funktioner"
              icon={Users}
              color="purple"
              isPremium={true}
              liveUpdate={true}
            />
          </div>
        </div>

        {/* QuotaIndicator Demo */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            QuotaIndicator Komponenter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brev Kvot */}
            <QuotaIndicator
              type="monthly"
              used={currentScenario.letterUsed}
              limit={currentScenario.letterLimit}
              isPremium={currentScenario.isPremium}
              resetDate={nextMonthlyReset}
              label="Månatliga Brev"
              description="Personliga brev genererade denna månad"
              color="pink"
            />

            {/* Analys Kvot */}
            <QuotaIndicator
              type="weekly"
              used={currentScenario.analysisUsed}
              limit={currentScenario.analysisLimit}
              isPremium={currentScenario.isPremium}
              resetDate={nextWeeklyReset}
              label="Veckovisa Analyser"
              description="CV-analyser utförda denna vecka"
              color="blue"
            />
          </div>
        </div>

        {/* Funktioner */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Kvot-System Funktioner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <PenTool className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Progress Bars</h4>
              <p className="text-sm text-gray-600">
                Visuell representation av kvot-användning med färgkodning för olika statusnivåer.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Countdown Timers</h4>
              <p className="text-sm text-gray-600">
                Live-uppdaterade timers som visar exakt när kvoterna återställs.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Varningar</h4>
              <p className="text-sm text-gray-600">
                Automatiska varningar vid 80% och 100% användning med uppgraderings-förslag.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200/40">
            <h4 className="font-semibold text-gray-900 mb-3 text-center">
              Premium Fördelar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Obegränsade brev per månad</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Obegränsade CV-analyser</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Fler funktioner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Prioriterat stöd</span>
              </div>
            </div>
            <div className="text-center mt-4">
              <button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Uppgradera till Premium - 149 SEK/månad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}