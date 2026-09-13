'use client';

import { useState, useEffect } from 'react';
import Sheet from '@/components/shell/Sheet';
import Segment from '@/components/shell/Segment';
import EmptyState from '@/components/shell/EmptyState';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { IlluTomMapp } from '@/components/illustrations/TradenScener';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { extractEditableContent } from '@/lib/letters/extract-editable-content';

interface Document {
  id: string;
  file_name: string;
  cv_text: string;
  created_at: string;
  type: 'cv' | 'letter';
}

interface DocumentSelectorProps {
  onSelect: (doc: Document) => void;
  onClose: () => void;
  selectedDocs: Document[];
}

/**
 * Välj vilka sparade dokument frågan gäller. Ett ark med två segment, en
 * lista i panel och valt tillstånd som kant i ink. Ingen egen modal.
 */

export default function DocumentSelector({ onSelect, onClose, selectedDocs }: DocumentSelectorProps) {
  const [cvs, setCvs] = useState<Document[]>([]);
  const [letters, setLetters] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const supabase = getSupabaseClient();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load CVs
      const { data: cvData } = await supabase
        .from('cv_texts')
        .select('id, file_name, cv_text, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load Letters (only saved ones, not previews)
      const { data: letterData } = await supabase
        .from('letters')
        .select('id, job_title, content, created_at')
        .eq('user_id', user.id)
        .eq('is_saved', true)
        .order('created_at', { ascending: false });

      setCvs((cvData || []).map(cv => ({ ...cv, type: 'cv' as const })));
      setLetters((letterData || []).map(letter => ({
        id: letter.id,
        file_name: letter.job_title || 'Utan titel',
        cv_text: letter.content,
        created_at: letter.created_at,
        type: 'letter' as const
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSelected = (doc: Document) => {
    return selectedDocs.some(d => d.id === doc.id && d.type === doc.type);
  };

  const handleSelect = (doc: Document) => {
    onSelect(doc);
  };

  const documents = activeTab === 'cv' ? cvs : letters;

  return (
    <Sheet
      open
      onClose={onClose}
      title="Välj vad du vill fråga om"
      description="Vi läser dokumenten och svarar utifrån just din situation."
      size="lg"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover"
        >
          {selectedDocs.length > 0 ? `Klart, ${selectedDocs.length} valda` : 'Stäng'}
        </button>
      }
    >
      <Segment
        value={activeTab}
        onChange={setActiveTab}
        label="Typ av dokument"
        options={[
          { value: 'cv', label: `CV (${cvs.length})` },
          { value: 'letter', label: `Brev (${letters.length})` },
        ]}
      />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton variant="list" count={3} label="Hämtar dina dokument" />
        ) : documents.length === 0 ? (
          <EmptyState
            illustration={IlluTomMapp}
            bare
            title={activeTab === 'cv' ? 'Inga CV sparade' : 'Inga brev sparade'}
            description={
              activeTab === 'cv'
                ? 'Skapa eller ladda upp ett CV först.'
                : 'Skapa ett personligt brev först.'
            }
          />
        ) : (
          <ul className="space-y-2" role="listbox" aria-label="Dina dokument">
            {documents.map((doc) => {
              const selected = isSelected(doc);
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(doc)}
                    className={`w-full rounded-lg border bg-panel p-3 text-left transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
                      selected ? 'border-ink-1 shadow-val' : 'border-kant'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-kort text-ink-1">{doc.file_name}</p>
                      {selected && (
                        <span className="shrink-0 text-meta font-medium text-ink-1">Vald</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-meta text-ink-3">
                      {new Date(doc.created_at).toLocaleDateString('sv-SE')}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-meta text-ink-2">
                      {extractEditableContent(doc.cv_text).substring(0, 120)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
