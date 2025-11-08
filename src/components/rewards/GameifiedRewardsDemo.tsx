'use client';

import React, { useState } from 'react';
import GameifiedRewardsView from './GameifiedRewardsView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Settings, Star } from 'lucide-react';

// Demo component to showcase the GameifiedRewardsView
const GameifiedRewardsDemo: React.FC = () => {
  const [demoLevel, setDemoLevel] = useState(12);
  const [demoXp, setDemoXp] = useState(2450);

  // Mock user level data for demonstration
  const mockUserLevel = {
    current_level: demoLevel,
    current_xp: demoXp,
    title: getDemoTitle(demoLevel),
    xp_to_next_level: Math.max(0, ((demoLevel + 1) * 250) - demoXp),
    total_xp_for_current_level: demoLevel * 250,
    total_xp_for_next_level: (demoLevel + 1) * 250
  };

  function getDemoTitle(level: number): string {
    if (level < 5) return 'Nybörjare';
    if (level < 10) return 'Aktiv Användare';
    if (level < 15) return 'Dedikerad Student';
    if (level < 20) return 'Karriärfokuserad';
    if (level < 25) return 'Framgångsrik Expert';
    if (level < 30) return 'Branschprofessionell';
    if (level < 35) return 'Karriärmästare';
    if (level < 40) return 'Elite Medlem';
    if (level < 45) return 'Branschledare';
    if (level < 50) return 'Karriärguru';
    return 'Genesis Mästare';
  }

  const handleClaimReward = (rewardId: string) => {
    console.log(`Demo: Claiming reward ${rewardId}`);
    // In a real implementation, this would trigger the actual claim logic
    alert(`Demo: Belöning ${rewardId} hämtad!`);
  };

  const increaseLevelDemo = () => {
    if (demoLevel < 50) {
      const newLevel = demoLevel + 1;
      setDemoLevel(newLevel);
      setDemoXp(newLevel * 250 - 50); // Set XP close to next level
    }
  };

  const decreaseLevelDemo = () => {
    if (demoLevel > 1) {
      const newLevel = demoLevel - 1;
      setDemoLevel(newLevel);
      setDemoXp(newLevel * 250 - 50);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Demo Controls */}
      <Card className="bg-navy-800 border-navy-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-pink-500" />
            <span>Demo Kontroller</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseLevelDemo}
                disabled={demoLevel <= 1}
              >
                Level -
              </Button>
              <div className="text-center">
                <div className="text-lg font-bold text-white">Level {demoLevel}</div>
                <div className="text-sm text-gray-400">{mockUserLevel.title}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseLevelDemo}
                disabled={demoLevel >= 50}
              >
                Level +
              </Button>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-purple-400">{demoXp.toLocaleString()} XP</div>
              <div className="text-sm text-gray-400">
                {mockUserLevel.xp_to_next_level} XP till nästa level
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-navy-900/50 rounded-lg">
            <p className="text-sm text-gray-300">
              <Star className="w-4 h-4 inline mr-1 text-yellow-400" />
              Använd kontrollerna ovan för att testa olika levels och se hur belöningarna låses upp!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gamified Rewards View */}
      <GameifiedRewardsView
        userLevel={mockUserLevel}
        rewards={[]} // Empty for demo
        onClaimReward={handleClaimReward}
      />

      {/* Integration Instructions */}
      <Card className="bg-navy-800 border-navy-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-pink-500" />
            <span>Integration Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">To integrate this component:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Import GameifiedRewardsView i din rewards page</li>
                <li>Lägg till en ny tab "Spelifierad" i TabsList</li>
                <li>Skapa TabsContent med GameifiedRewardsView komponenten</li>
                <li>Passa in userLevel data från din API</li>
                <li>Koppla onClaimReward till din claim logic</li>
              </ol>
            </div>

            <div className="bg-navy-900/50 p-3 rounded-lg">
              <h5 className="font-semibold text-white mb-2">Key Features:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>✨ Kompakt progress card med level, XP och nästa milstolpe</li>
                <li>🎮 Spelifierad milestone path med 10 riktiga belöningar</li>
                <li>🏆 Game-like achievement badges med visuella indikatorer</li>
                <li>💫 Hover effects med detaljerad information</li>
                <li>🎯 Click-to-claim funktionalitet med smooth animationer</li>
                <li>📱 Mobile-first responsive design</li>
                <li>🇸🇪 Svensk text och kulturell anpassning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameifiedRewardsDemo;