// src/hooks/use-applications.ts
// Datahook för Sökta tjänster: lista, skapa, uppdatera och ta bort ansökningar.
// Samma enkla fasadmönster som use-letters (fetch mot API-routes, lokal state).

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { JobApplication } from '@/lib/applications/status';

export interface CreateApplicationInput {
  job_title: string;
  company: string;
  location?: string | null;
  application_channel?: string;
  job_ad_url?: string | null;
  letter_id?: string | null;
  cv_id?: string | null;
  notes?: string | null;
  applied_at?: string;
}

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/applications');
      const json = await res.json();
      if (res.ok && json.success) {
        setApplications(json.data as JobApplication[]);
      }
    } catch (error) {
      console.error('Kunde inte hämta ansökningar:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createApplication = useCallback(async (input: CreateApplicationInput): Promise<JobApplication> => {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Kunde inte logga ansökan');
    }
    const created = json.data as JobApplication;
    setApplications((prev) => {
      const rest = (prev ?? []).filter((a) => a.id !== created.id);
      return [created, ...rest];
    });
    return created;
  }, []);

  const updateApplication = useCallback(async (id: string, updates: Partial<CreateApplicationInput>): Promise<JobApplication> => {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Kunde inte uppdatera ansökan');
    }
    const updated = json.data as JobApplication;
    setApplications((prev) => (prev ?? []).map((a) => (a.id === updated.id ? updated : a)));
    return updated;
  }, []);

  const removeApplication = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Kunde inte ta bort ansökan');
    }
    setApplications((prev) => (prev ?? []).filter((a) => a.id !== id));
  }, []);

  return {
    applications,
    isLoading,
    refresh,
    createApplication,
    updateApplication,
    removeApplication,
  };
}
