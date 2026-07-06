'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Pencil, Trash2, X } from 'lucide-react';
import CandidateTable from '../../components/CandidateTable';
import CompareToolbar from '../../components/CompareToolbar';
import PeekPanel from '../../components/PeekPanel';
import {
  CTA_GRADIENT,
  formatLongDate,
  type PoolCandidate,
  type ProjectCandidate,
} from '../../components/types';

interface ProjectShape {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Projektvyn: samma tabellkomponent som sökningen men utan filterpanel, med
 * status per kandidat (ny → kontaktad → väntar → dialog), ta bort-knapp samt
 * byt namn/radera för själva projektet.
 */
export default function ProjektDetaljPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId;
  const router = useRouter();

  const [project, setProject] = useState<ProjectShape | null>(null);
  const [members, setMembers] = useState<ProjectCandidate[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [peekCandidate, setPeekCandidate] = useState<PoolCandidate | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/recruiter/projects/${encodeURIComponent(projectId)}`);
      if (res.status === 404) {
        setState('notfound');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        project: ProjectShape;
        candidates: ProjectCandidate[];
      };
      setProject(data.project);
      setMembers(data.candidates);
      setState('ready');
    } catch (error) {
      console.error('Projekt: kunde inte hämta', error);
      setState('error');
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Tabellen matas med PoolCandidate-formen (utan sökkontext).
  const tableCandidates: PoolCandidate[] = useMemo(
    () =>
      members.map((m) => ({
        ...m.card,
        matchReasons: [],
        interestStatus: null,
      })),
    [members]
  );

  const statusByCandidate = useMemo(
    () => Object.fromEntries(members.map((m) => [m.candidateUserId, m.status])),
    [members]
  );

  const changeStatus = async (candidateUserId: string, status: string) => {
    const prev = members;
    setMembers((list) =>
      list.map((m) => (m.candidateUserId === candidateUserId ? { ...m, status } : m))
    );
    try {
      const res = await fetch(
        `/api/recruiter/projects/${encodeURIComponent(projectId!)}/candidates`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId, status }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setMembers(prev);
      setNotice('Kunde inte uppdatera statusen. Försök igen.');
    }
  };

  const removeCandidate = async (candidateUserId: string) => {
    const prev = members;
    setMembers((list) => list.filter((m) => m.candidateUserId !== candidateUserId));
    setSelectedIds((ids) => ids.filter((id) => id !== candidateUserId));
    try {
      const res = await fetch(
        `/api/recruiter/projects/${encodeURIComponent(projectId!)}/candidates`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setMembers(prev);
      setNotice('Kunde inte ta bort kandidaten. Försök igen.');
    }
  };

  const rename = async () => {
    const name = renameValue.trim();
    if (!name || !projectId) return;
    try {
      const res = await fetch(`/api/recruiter/projects/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => null)) as {
        project?: ProjectShape;
        error?: string;
      } | null;
      if (!res.ok || !data?.project) {
        setNotice(data?.error ?? 'Kunde inte byta namn.');
        return;
      }
      setProject(data.project);
      setRenaming(false);
    } catch {
      setNotice('Kunde inte byta namn.');
    }
  };

  const deleteProject = async () => {
    if (!projectId) return;
    if (!window.confirm('Radera projektet? Kandidaterna finns kvar i poolen.')) return;
    try {
      const res = await fetch(`/api/recruiter/projects/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push('/rekryterare/projekt');
    } catch {
      setNotice('Kunde inte radera projektet. Försök igen.');
    }
  };

  const handleInterest = useCallback(
    async (candidateUserId: string) => {
      setSendingId(candidateUserId);
      setNotice(null);
      try {
        const res = await fetch('/api/recruiter/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateUserId }),
        });
        const data = await res.json().catch(() => null);
        if (res.status === 429) {
          setNotice(data?.error ?? 'Du har nått gränsen på 10 intressen per dygn.');
          return;
        }
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        const status = data?.interest?.status ?? 'pending';
        setPeekCandidate((prev) =>
          prev && prev.userId === candidateUserId ? { ...prev, interestStatus: status } : prev
        );
      } catch {
        setNotice('Det gick inte att skicka intresset. Försök igen.');
      } finally {
        setSendingId(null);
      }
    },
    []
  );

  const toggleSelect = (userId: string) =>
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );

  const toggleSelectAll = () => {
    const all = tableCandidates.map((c) => c.userId);
    setSelectedIds((prev) => (all.every((id) => prev.includes(id)) ? [] : all));
  };

  if (state === 'loading') {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="rounded-3xl bg-orange-50/60 h-14 animate-pulse" />
        <div className="rounded-3xl bg-orange-50/60 h-64 animate-pulse" />
      </div>
    );
  }

  if (state === 'notfound' || state === 'error' || !project) {
    return (
      <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
        <h1 className="text-base font-bold text-slate-900 mb-1.5">
          {state === 'notfound' ? 'Projektet finns inte' : 'Något gick fel'}
        </h1>
        <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
          {state === 'notfound'
            ? 'Projektet kan ha raderats.'
            : 'Vi kunde inte hämta projektet. Ladda om sidan och försök igen.'}
        </p>
        <Link
          href="/rekryterare/projekt"
          className="inline-flex items-center gap-1.5 justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: CTA_GRADIENT }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Till projekten
        </Link>
      </div>
    );
  }

  const fromPath = `/rekryterare/projekt/${project.id}`;

  return (
    <div className="space-y-4">
      <Link
        href="/rekryterare/projekt"
        className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Till projekten
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-end justify-between gap-3 flex-wrap"
      >
        <div className="min-w-0">
          {renaming ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    rename();
                  }
                  if (e.key === 'Escape') setRenaming(false);
                }}
                maxLength={80}
                autoFocus
                className="min-h-[42px] px-3 rounded-xl border border-slate-200 bg-white text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-300"
              />
              <button
                type="button"
                onClick={rename}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label="Spara namnet"
              >
                <Check className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setRenaming(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors"
                aria-label="Avbryt"
              >
                <X className="w-[18px] h-[18px]" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
              {project.name}
            </h1>
          )}
          <p className="text-[12.5px] text-slate-500 mt-1">
            {members.length === 1 ? '1 kandidat' : `${members.length} kandidater`} · Uppdaterad{' '}
            {formatLongDate(project.updatedAt) ?? 'nyss'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRenameValue(project.name);
              setRenaming(true);
            }}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-[12.5px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            Byt namn
          </button>
          <button
            type="button"
            onClick={deleteProject}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-[12.5px] font-bold text-red-600 border border-red-200 bg-white hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Radera
          </button>
        </div>
      </motion.div>

      {notice && (
        <p
          className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
          role="alert"
        >
          {notice}
        </p>
      )}

      {selectedIds.length > 0 && (
        <CompareToolbar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
      )}

      {members.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white p-8 sm:p-12 text-center">
          <h2 className="text-base font-bold text-slate-900 mb-1.5">Projektet är tomt</h2>
          <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-md mx-auto mb-5">
            Lägg i kandidater från sökningen via Lägg i projekt-knappen på
            raden, i peek-panelen eller på profilen.
          </p>
          <Link
            href="/rekryterare"
            className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: CTA_GRADIENT }}
          >
            Sök kandidater
          </Link>
        </div>
      ) : (
        <CandidateTable
          candidates={tableCandidates}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onRowClick={setPeekCandidate}
          fromPath={fromPath}
          projectMode={{
            statusByCandidate,
            onStatusChange: changeStatus,
            onRemove: removeCandidate,
          }}
        />
      )}

      <PeekPanel
        candidate={peekCandidate}
        onClose={() => setPeekCandidate(null)}
        onInterest={handleInterest}
        sendingInterest={sendingId !== null}
        fromPath={fromPath}
      />
    </div>
  );
}
