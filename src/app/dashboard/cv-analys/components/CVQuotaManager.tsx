// src/components/cv/analysis/CVQuotaManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';

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
    <div>
      <h4 className="text-kort text-ink-1">
        CV-gräns nådd, {cvCount} av {maxCvs}
      </h4>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">
        {subscriptionTier === 'free'
          ? `Du har nått din gräns på ${maxCvs} sparade CV. Radera ett befintligt CV för att spara det nya, eller uppgradera till Premium för 50 CV.`
          : `Du har nått din gräns på ${maxCvs} sparade CV. Radera ett befintligt CV för att spara det nya.`}
      </p>

      {subscriptionTier === 'free' && (
        <a
          href="/dashboard/profil/prenumeration"
          className="mt-3 inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
        >
          Uppgradera till Premium
        </a>
      )}

      {/* CV List */}
      {loading ? (
        <LoadingSkeleton variant="list" count={3} label="Laddar dina CV" />
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-ink-3">Välj ett CV att radera</p>

          <ul className="max-h-60 space-y-2 overflow-y-auto">
            {cvs.map((cv) => (
              <li key={cv.id}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedCV === cv.id
                      ? 'border-ink-1 bg-panel'
                      : 'border-kant bg-panel hover:border-kant-stark'
                  }`}
                >
                  <input
                    type="radio"
                    name="cv-to-delete"
                    value={cv.id}
                    checked={selectedCV === cv.id}
                    onChange={() => setSelectedCV(cv.id)}
                    className="h-4 w-4 accent-ink-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-kort text-ink-1">{cv.file_name}</div>
                    <div className="text-meta text-ink-3">
                      Skapad {formatDate(cv.created_at)}
                    </div>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedCV || isDeleting}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-fel-kant bg-panel px-4 text-sm font-medium text-fel transition-colors hover:bg-insunken disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {isDeleting ? 'Raderar' : 'Radera valt CV'}
          </button>
        </div>
      )}
    </div>
  );
}
