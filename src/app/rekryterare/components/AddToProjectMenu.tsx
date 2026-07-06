'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, FolderKanban, FolderPlus, Loader2 } from 'lucide-react';
import type { ProjectSummary } from './types';

interface AddToProjectMenuProps {
  /** En eller flera kandidater (bulk från CompareToolbar). */
  candidateUserIds: string[];
  /** 'button' = sekundär knapp med text, 'compact' = liten ghost-variant. */
  variant?: 'button' | 'compact';
  /** Anropas efter lyckad tilläggning (t.ex. rensa markering). */
  onAdded?: (projectId: string, projectName: string) => void;
}

/**
 * Återanvändbar "Lägg i projekt"-dropdown: listar rekryterarens projekt,
 * lägger till kandidaten/kandidaterna, och kan skapa nytt projekt inline.
 * Används i tabellrad, peek-panel och detaljprofilens action-bar.
 */
export default function AddToProjectMenu({
  candidateUserIds,
  variant = 'button',
  onAdded,
}: AddToProjectMenuProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Stäng vid klick utanför.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/recruiter/projects');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { projects: ProjectSummary[] };
      setProjects(data.projects);
    } catch {
      setProjects([]);
      setError('Kunde inte hämta projekten.');
    }
  }, []);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && projects === null) fetchProjects();
      if (next) {
        setAddedId(null);
        setError(null);
      }
      return next;
    });
  };

  const addTo = async (projectId: string, projectName: string) => {
    setBusyId(projectId);
    setError(null);
    try {
      for (const candidateUserId of candidateUserIds) {
        const res = await fetch(`/api/recruiter/projects/${projectId}/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setAddedId(projectId);
      onAdded?.(projectId, projectName);
      setTimeout(() => setOpen(false), 700);
    } catch {
      setError('Det gick inte att lägga till. Försök igen.');
    } finally {
      setBusyId(null);
    }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => null)) as {
        project?: ProjectSummary;
        error?: string;
      } | null;
      if (!res.ok || !data?.project) {
        setError(data?.error ?? 'Kunde inte skapa projektet.');
        return;
      }
      setProjects((prev) => [data.project!, ...(prev ?? [])]);
      setNewName('');
      await addTo(data.project.id, data.project.name);
    } catch {
      setError('Kunde inte skapa projektet.');
    } finally {
      setCreating(false);
    }
  };

  const count = candidateUserIds.length;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === 'compact'
            ? 'inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg text-[12.5px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors'
            : 'inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-[13px] font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-colors'
        }
      >
        <FolderKanban className="w-4 h-4 text-slate-400" aria-hidden="true" />
        Lägg i projekt
        {count > 1 && <span className="text-slate-400">({count})</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-64 rounded-2xl border border-slate-200 bg-white shadow-lg p-1.5 z-50"
        >
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Välj projekt
          </p>

          {projects === null ? (
            <p className="px-2.5 py-2 text-[12.5px] text-slate-400 inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Hämtar projekt…
            </p>
          ) : projects.length === 0 ? (
            <p className="px-2.5 py-2 text-[12.5px] text-slate-400">
              Inga projekt ännu. Skapa ett nedan.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="menuitem"
                  disabled={busyId !== null}
                  onClick={() => addTo(p.id, p.name)}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-[13px] font-semibold text-slate-700 hover:bg-orange-50 transition-colors disabled:opacity-60"
                >
                  <span className="truncate">{p.name}</span>
                  {addedId === p.id ? (
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  ) : busyId === p.id ? (
                    <Loader2
                      className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="text-[11.5px] text-slate-400 flex-shrink-0">
                      {p.candidateCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 mt-1.5 pt-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    createAndAdd();
                  }
                }}
                placeholder="Nytt projekt…"
                maxLength={80}
                className="flex-1 min-w-0 min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
              />
              <button
                type="button"
                onClick={createAndAdd}
                disabled={creating || !newName.trim()}
                className="flex-shrink-0 inline-flex items-center justify-center w-[34px] h-[34px] rounded-lg text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-40"
                aria-label="Skapa projekt och lägg till"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FolderPlus className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {error && <p className="px-1 pt-1.5 text-[11.5px] text-red-600">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
