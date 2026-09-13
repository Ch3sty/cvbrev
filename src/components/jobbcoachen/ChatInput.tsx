'use client';

import { useState, useRef, useEffect, KeyboardEvent, ReactNode } from 'react';
import type { MessageAttachment } from '@/types/jobbcoachen';
import DocumentSelector from './DocumentSelector';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface Document {
  id: string;
  file_name: string;
  cv_text: string;
  created_at: string;
  type: 'cv' | 'letter';
}

interface ChatInputProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  conversationId?: string | null;
  hasMessages?: boolean;
  /** Increment from parent to trigger document selector from outside */
  externalOpenSignal?: number;
  /** Optional content rendered above the input (e.g. suggestion chips) */
  suggestionChips?: ReactNode;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Skriv ditt meddelande...',
  conversationId = null,
  hasMessages = false,
  externalOpenSignal = 0,
  suggestionChips = null,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<Document[]>([]);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [cvCount, setCvCount] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = getSupabaseClient();

  // Load document counts
  useEffect(() => {
    const loadDocCounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Count CVs
        const { count: cvs } = await supabase
          .from('cv_texts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Count Letters (only saved ones)
        const { count: letters } = await supabase
          .from('letters')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_saved', true);

        setCvCount(cvs || 0);
        setLetterCount(letters || 0);
      } catch (error) {
        console.error('Error loading document counts:', error);
      }
    };

    loadDocCounts();
  }, [supabase]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // External trigger to open document selector (from ShareDocumentsCard)
  useEffect(() => {
    if (externalOpenSignal > 0) {
      setShowDocSelector(true);
    }
  }, [externalOpenSignal]);

  const handleDocumentSelect = (doc: Document) => {
    // Toggle selection
    const isAlreadySelected = selectedDocs.some(d => d.id === doc.id && d.type === doc.type);
    if (isAlreadySelected) {
      setSelectedDocs(selectedDocs.filter(d => !(d.id === doc.id && d.type === doc.type)));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const handleRemoveDoc = (docId: string, docType: 'cv' | 'letter') => {
    setSelectedDocs(selectedDocs.filter(d => !(d.id === docId && d.type === docType)));
  };

  const handleSubmit = () => {
    if ((!message.trim() && selectedDocs.length === 0) || disabled) return;

    // Convert selected docs to MessageAttachment format
    const attachments: MessageAttachment[] | undefined = selectedDocs.length > 0
      ? selectedDocs.map(doc => ({
          file_name: doc.file_name,
          file_type: doc.type === 'cv' ? 'cv' : 'letter',
          file_size: new Blob([doc.cv_text]).size,
          storage_path: '', // Not needed for existing docs
          public_url: '', // Not needed for existing docs
          extracted_text: doc.cv_text,
          uploaded_at: doc.created_at,
        }))
      : undefined;

    onSend(message.trim(), attachments);
    setMessage('');
    setSelectedDocs([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const totalDocs = cvCount + letterCount;
  const canSend = !disabled && (message.trim().length > 0 || selectedDocs.length > 0);

  return (
    <>
      <div className="px-3 pb-3 pt-4 sm:px-6 sm:pb-4">
        {suggestionChips && <div className="mb-3">{suggestionChips}</div>}

        {selectedDocs.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {selectedDocs.map((doc) => (
              <li
                key={`${doc.type}-${doc.id}`}
                className="flex items-center gap-2 rounded-lg border border-kant bg-panel px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block max-w-[200px] truncate text-sm font-medium text-ink-1">
                    {doc.file_name}
                  </span>
                  <span className="block text-meta text-ink-3">
                    {doc.type === 'cv' ? 'CV' : 'Personligt brev'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveDoc(doc.id, doc.type)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-medium text-ink-2 hover:bg-insunken hover:text-ink-1"
                  aria-label={`Ta bort ${doc.file_name}`}
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            enterKeyHint="send"
            className="min-h-11 w-full flex-1 resize-none rounded-lg border border-kant bg-insunken px-3 py-2.5 text-base leading-[22px] text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1 disabled:opacity-60"
            style={{ maxHeight: '120px' }}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40"
          >
            Skicka
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => setShowDocSelector(true)}
            disabled={disabled}
            className="inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1 disabled:no-underline disabled:opacity-40"
          >
            {totalDocs > 0
              ? `Dela ett av dina ${totalDocs} dokument`
              : 'Dela CV eller personligt brev'}
          </button>
          <p className="hidden text-meta text-ink-3 sm:block">
            Enter skickar, Shift och Enter ger ny rad
          </p>
        </div>
      </div>

      {showDocSelector && (
        <DocumentSelector
          onSelect={handleDocumentSelect}
          onClose={() => setShowDocSelector(false)}
          selectedDocs={selectedDocs}
        />
      )}
    </>
  );
}
