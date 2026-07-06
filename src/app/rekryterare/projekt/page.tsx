'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FolderKanban, Plus } from 'lucide-react';
import {
  CTA_GRADIENT,
  formatLongDate,
  type ProjectSummary,
} from '../components/types';

/**
 * Projektöversikten: ett kort per shortlist med kandidatantal, senast
 * uppdaterad och avatar-stack med de senaste kandidaternas roll-initialer.
 */
export default function ProjektPage() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/recruiter/projects');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { projects: ProjectSummary[] };
      setProjects(data.projects);
    } catch {
      setProjects([]);
      setError('Kunde inte hämta projekten. Ladda om sidan och försök igen.');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async () => {
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
      setCreateOpen(false);
    } catch {
      setError('Kunde inte skapa projektet.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-end justify-between gap-3 flex-wrap"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Projekt</h1>
          <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed max-w-xl">
            Samla kandidater per roll eller uppdrag. Vi håller status på var ni
            är i dialogen med varje kandidat.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: CTA_GRADIENT }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nytt projekt
        </button>
      </motion.div>

      {createOpen && (
        <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white p-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                createProject();
              }
            }}
            placeholder="Projektnamn, t.ex. Redovisningsekonom Malmö"
            maxLength={80}
            autoFocus
            className="flex-1 min-w-0 min-h-[42px] px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
          />
          <button
            type="button"
            onClick={createProject}
            disabled={creating || !newName.trim()}
            className="flex-shrink-0 min-h-[42px] px-5 rounded-xl text-[13px] font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {creating ? 'Skapar…' : 'Skapa'}
          </button>
        </div>
      )}

      {error && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {error}
        </p>
      )}

      {projects === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-orange-50/60 h-36 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <FolderKanban className="w-6 h-6 text-orange-600" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">Inga projekt ännu</h2>
          <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto">
            Skapa ett projekt för rollen du rekryterar till och lägg i kandidater
            direkt från sökningen.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3), ease: 'easeOut' }}
            >
              <Link
                href={`/rekryterare/projekt/${project.id}`}
                className="block rounded-2xl border border-orange-100 bg-white p-4 sm:p-5 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                style={{ boxShadow: '0 4px 14px -10px rgba(2, 6, 23, 0.18)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
                    {project.name}
                  </h2>
                  <span className="flex-shrink-0 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-800">
                    {project.candidateCount === 1
                      ? '1 kandidat'
                      : `${project.candidateCount} kandidater`}
                  </span>
                </div>

                {/* Avatar-stack med roll-initialer */}
                <div className="flex items-center mb-3 min-h-[32px]">
                  {project.recentInitials.length === 0 ? (
                    <span className="text-[12px] text-slate-400">Tomt än så länge</span>
                  ) : (
                    <>
                      {project.recentInitials.map((initials, idx) => (
                        <span
                          key={`${initials}-${idx}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold border-2 border-white -ml-1.5 first:ml-0"
                          style={{
                            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                          }}
                          aria-hidden="true"
                        >
                          {initials}
                        </span>
                      ))}
                      {project.candidateCount > project.recentInitials.length && (
                        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white text-slate-500 text-[10.5px] font-bold -ml-1.5">
                          +{project.candidateCount - project.recentInitials.length}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <p className="text-[11.5px] text-slate-400">
                  Uppdaterad {formatLongDate(project.updatedAt) ?? 'nyss'}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
