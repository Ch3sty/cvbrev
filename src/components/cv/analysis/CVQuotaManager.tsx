// src/components/cv/analysis/CVQuotaManager.tsx
'use client';

import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface CV {
  id: string;
  file_name: string;
  created_at: string;
}

interface CVQuotaManagerProps {
  cvCount: number;
  maxCvs: number;
  subscriptionTier: 'free' | 'premium';
  onCVDeleted: () => void;
}

export default function CVQuotaManager({
  cvCount,
  maxCvs,
  subscriptionTier,
  onCVDeleted
}: CVQuotaManagerProps) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('cv_texts')
        .select('id, file_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCvs(data || []);
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCV || isDeleting) return;

    setIsDeleting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('cv_texts')
        .delete()
        .eq('id', selectedCV);

      if (error) throw error;

      // Remove from local state
      setCvs(cvs.filter(cv => cv.id !== selectedCV));
      setSelectedCV(null);
      onCVDeleted();
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Kunde inte radera CV. Försök igen.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If user has quota available, don't show
  if (cvCount < maxCvs) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-amber-50 border-2 border-amber-300 p-6">
        <div className="flex items-start gap-4 mb-4">
          <AlertTriangle className="w-5 h-5 text-neutral-700 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">
              CV-gräns nådd ({cvCount}/{maxCvs})
            </h4>
            <p className="text-sm text-amber-800 mb-3">
              {subscriptionTier === 'free' ? (
                <>
                  {PAKETRADER.cvFullt(maxCvs)}
                </>
              ) : (
                <>
                  Du har nått din gräns på {maxCvs} sparade CV:n. Radera ett befintligt CV för att spara det nya.
                </>
              )}
            </p>

            {subscriptionTier === 'free' && (
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white mb-4"
                onClick={() => window.location.href = '/profile?tab=subscription'}
              >
                <Crown className="w-4 h-4 mr-2" />
                {PAKETRADER.kopCv}
              </Button>
            )}
          </div>
        </div>

        {/* CV List */}
        {loading ? (
          <div className="text-center py-4 text-amber-700">Laddar dina CV:n...</div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-900 mb-3">
              Välj ett CV att radera:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2">
              <AnimatePresence>
                {cvs.map((cv) => (
                  <motion.label
                    key={cv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCV === cv.id
                        ? 'border-amber-600 bg-amber-100'
                        : 'border-amber-200 bg-white hover:border-amber-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cv-to-delete"
                      value={cv.id}
                      checked={selectedCV === cv.id}
                      onChange={() => setSelectedCV(cv.id)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{cv.file_name}</div>
                      <div className="text-xs text-gray-600">
                        Skapad: {formatDate(cv.created_at)}
                      </div>
                    </div>
                  </motion.label>
                ))}
              </AnimatePresence>
            </div>

            <Button
              onClick={handleDelete}
              disabled={!selectedCV || isDeleting}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Raderar...' : 'Radera valt CV'}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
