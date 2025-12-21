import { useState, useEffect, useCallback, useRef } from 'react';
import type { CVDraft } from '../components/CVCreatorWizard';

const STORAGE_KEY = 'jobbcoach_cv_draft';
const DRAFT_EXPIRY_DAYS = 7;
const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds

interface StoredDraft {
  data: CVDraft;
  timestamp: number;
  expiresAt: number;
}

export function useAutoSave(cvData: CVDraft) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const previousDataRef = useRef<string>('');
  const initialLoadDoneRef = useRef(false);

  // Check for existing draft on mount
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      const draft = loadDraftFromStorage();
      setHasDraft(draft !== null);
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      setIsSavingDraft(true);

      const storedDraft: StoredDraft = {
        data: cvData,
        timestamp: Date.now(),
        expiresAt: Date.now() + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedDraft));
      setLastSaved(new Date());
      setHasDraft(true);
      previousDataRef.current = JSON.stringify(cvData);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  }, [cvData]);

  // Load draft from localStorage
  const loadDraftFromStorage = (): CVDraft | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const storedDraft: StoredDraft = JSON.parse(stored);

      // Check if expired
      if (storedDraft.expiresAt < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return storedDraft.data;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  };

  // Public load draft function
  const loadDraft = useCallback((): CVDraft | null => {
    return loadDraftFromStorage();
  }, []);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasDraft(false);
      setLastSaved(null);
      previousDataRef.current = '';
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    const currentData = JSON.stringify(cvData);
    return currentData !== previousDataRef.current;
  }, [cvData]);

  // Auto-save every 30 seconds if data has changed
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasDataChanged()) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasDataChanged, saveDraft]);

  // Save on window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasDataChanged()) {
        // Synchronous save for unload
        try {
          const storedDraft: StoredDraft = {
            data: cvData,
            timestamp: Date.now(),
            expiresAt: Date.now() + (DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedDraft));
        } catch (error) {
          console.error('Failed to save on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cvData, hasDataChanged]);

  return {
    lastSaved,
    isSavingDraft,
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}
