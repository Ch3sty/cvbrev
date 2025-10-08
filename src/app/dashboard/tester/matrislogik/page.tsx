'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Clock, Target } from 'lucide-react';
import DisclaimerBanner from './components/DisclaimerBanner';

export default function MatrislogikStartPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleStartTest = async () => {
    if (!accepted) {
      alert('Du måste acceptera villkoren för att starta testet.');
      return;
    }

    setStarting(true);

    try {
      const response = await fetch('/api/tester/start', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to start test');

      const { sessionToken } = await response.json();

      // Navigera till test med session token
      router.push(`/dashboard/tester/matrislogik/test/${sessionToken}`);

    } catch (error) {
      console.error('Error starting test:', error);
      alert('Kunde inte starta testet. Försök igen.');
      setStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Matrislogik-test (Raven-stil)
        </h1>
        <p className="text-gray-600">
          Träna på abstrakt problemlösning och mönsterigenkänning
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
          <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="font-semibold">20 minuter</p>
          <p className="text-sm text-gray-600">Total tid</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
          <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="font-semibold">15 frågor</p>
          <p className="text-sm text-gray-600">Varierande svårighetsgrad</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
          <Brain className="w-8 h-8 text-pink-600 mx-auto mb-2" />
          <p className="font-semibold">Poäng 1-10</p>
          <p className="text-sm text-gray-600">Övningsskala</p>
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Instruktioner */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Så fungerar testet
        </h2>

        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold text-purple-600">1.</span>
            <span>
              Du får se en 3x3 matris med geometriska former. En cell (nedre högra hörnet) är tom med ett frågetecken.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-bold text-purple-600">2.</span>
            <span>
              Din uppgift är att hitta det logiska mönstret i matrisen och välja rätt form bland 6 svarsalternativ (A-F).
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-bold text-purple-600">3.</span>
            <span>
              Mönster kan vara: färgförändring, rotation, antal shapes, spatial förflyttning, eller kombinationer.
            </span>
          </li>

          <li className="flex gap-3">
            <span className="font-bold text-purple-600">4.</span>
            <span>
              Tips: Kolla rader, kolumner OCH diagonaler. Hoppa över svåra frågor och kom tillbaka senare.
            </span>
          </li>
        </ol>
      </div>

      {/* Samtycke */}
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="w-5 h-5 mt-0.5 text-purple-600"
        />
        <span className="text-sm text-gray-700">
          Jag förstår att detta är ett övningstest (inte diagnostik),
          och att mina svar sparas för progresstracking enligt GDPR.
        </span>
      </label>

      {/* Start Button */}
      <button
        onClick={handleStartTest}
        disabled={!accepted || starting}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {starting ? 'Startar test...' : 'Starta Test'}
      </button>
    </div>
  );
}
