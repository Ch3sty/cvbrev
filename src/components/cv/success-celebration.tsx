'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Download, 
  Sparkles, 
  Trophy, 
  Target, 
  TrendingUp,
  Share2,
  Copy,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  templateName: string;
  fileName: string;
  generationTime?: number;
  atsScore?: number;
  downloadUrl?: string;
  className?: string;
}

const confettiColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
];

export default function SuccessCelebration({
  isVisible,
  onClose,
  templateName,
  fileName,
  generationTime,
  atsScore,
  downloadUrl,
  className = ""
}: SuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Trigger confetti and calculate achievements when visible
  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      
      // Calculate achievements based on CV generation
      const newAchievements = [];
      
      if (atsScore && atsScore >= 90) {
        newAchievements.push('🏆 ATS-Expert: 90+ poäng!');
      }
      if (atsScore && atsScore >= 80) {
        newAchievements.push('⭐ ATS-Optimerad');
      }
      if (generationTime && generationTime < 5000) {
        newAchievements.push('⚡ Snabb Generering');
      }
      if (templateName === 'ats-optimerad') {
        newAchievements.push('🎯 Smart Val för Svenska Marknaden');
      }
      if (templateName === 'modern' || templateName === 'kreativ') {
        newAchievements.push('🎨 Kreativ Profil');
      }
      
      newAchievements.push('📄 CV-PDF Genererad');
      setAchievements(newAchievements);
      
      // Stop confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isVisible, atsScore, generationTime, templateName]);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fileName);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    }
  };
  
  // Confetti particle component
  const ConfettiParticle = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className="absolute w-2 h-2 rounded"
      style={{ 
        backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      initial={{ 
        scale: 0, 
        rotate: 0,
        y: -20
      }}
      animate={{ 
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
        y: [0, -50, 100],
        x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40]
      }}
      transition={{ 
        duration: 2 + Math.random(),
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.1} />
              ))}
            </div>
          )}
          
          {/* Success Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`bg-navy-800 border border-navy-700 rounded-2xl p-8 max-w-md w-full relative overflow-hidden ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
                className="text-center mb-6"
              >
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Fantastiskt! 🎉
                </h2>
                <p className="text-gray-300">
                  Ditt CV är redo att imponera svenska arbetsgivare
                </p>
              </motion.div>
              
              {/* Generated File Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-navy-700/50 rounded-lg p-4 mb-6 border border-navy-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">CV-PDF Genererad</h3>
                    <p className="text-gray-400 text-sm">Mall: {templateName}</p>
                  </div>
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <code className="bg-navy-800 px-2 py-1 rounded text-xs text-green-400 flex-grow truncate">
                    {fileName}
                  </code>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0 h-7 w-7 p-0 hover:bg-navy-600"
                  >
                    {copiedLink ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </Button>
                </div>
              </motion.div>
              
              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                  Prestationer
                </h4>
                <div className="space-y-2">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center text-sm text-gray-300 bg-navy-600/30 rounded-lg p-2"
                    >
                      <span className="mr-2">{achievement.split(':')[0]}</span>
                      <span className="text-gray-400">{achievement.split(':')[1] || ''}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Stats */}
              {(atsScore || generationTime) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  {atsScore && (
                    <div className="text-center p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                      <div className="text-2xl font-bold text-green-400 mb-1">{atsScore}</div>
                      <div className="text-xs text-gray-400">ATS-Poäng</div>
                    </div>
                  )}
                  
                  {generationTime && (
                    <div className="text-center p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {(generationTime / 1000).toFixed(1)}s
                      </div>
                      <div className="text-xs text-gray-400">Genereringstid</div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Premium Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-4 border border-pink-500/30 mb-6"
              >
                <div className="flex items-center mb-2">
                  <Sparkles className="w-4 h-4 text-pink-400 mr-2" />
                  <span className="text-pink-400 font-medium text-sm">Premium Kvalitet</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Ditt CV är optimerat för svenska ATS-system och följer 2024 års rekryteringstrender. 
                  Lycka till med jobbsökandet! 🇸🇪
                </p>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex space-x-3"
              >
                <Button
                  onClick={handleDownload}
                  disabled={!downloadUrl}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ladda ner CV-PDF
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="border-navy-600 hover:bg-navy-700 text-gray-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Skapa Fler
                </Button>
              </motion.div>
              
              {/* Subtle close hint */}
              <p className="text-center text-gray-500 text-xs mt-4">
                Klicka utanför eller på "Skapa Fler CV:n" för att fortsätta
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}