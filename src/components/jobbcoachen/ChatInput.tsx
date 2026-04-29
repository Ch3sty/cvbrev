'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, X } from 'lucide-react';
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
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Skriv ditt meddelande...',
  conversationId = null,
  hasMessages = false,
  externalOpenSignal = 0,
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

  return (
    <>
      <div
        className="sticky bottom-0 border-t border-orange-200/50 bg-white/95 backdrop-blur-xl px-4 py-3 sm:py-4 z-10 pb-[calc(0.75rem+env(safe-area-inset-bottom)+72px)] lg:pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-3xl mx-auto">
          {/* Selected documents preview */}
          <AnimatePresence>
            {selectedDocs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 flex flex-wrap gap-2"
              >
                {selectedDocs.map((doc) => (
                  <motion.div
                    key={`${doc.type}-${doc.id}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}>
                      <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate max-w-[200px]">
                        {doc.file_name}
                      </p>
                      <p className="text-[11px] text-orange-700">
                        {doc.type === 'cv' ? 'CV' : 'Personligt brev'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDoc(doc.id, doc.type)}
                      className="p-1 hover:bg-orange-100 rounded-md transition-colors"
                      aria-label="Ta bort dokument"
                    >
                      <X className="w-4 h-4 text-orange-700" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="relative group">
            <div className="relative flex items-end gap-2 sm:gap-3">
              {/* Document selector button */}
              <motion.div className="relative flex-shrink-0">
                <motion.button
                  onClick={() => setShowDocSelector(true)}
                  disabled={disabled}
                  whileHover={{ scale: disabled ? 1 : 1.05 }}
                  whileTap={{ scale: disabled ? 1 : 0.95 }}
                  className="relative p-3 bg-white border-2 border-orange-300 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation group"
                  aria-label="Dela CV eller personligt brev"
                  title={
                    (cvCount + letterCount) > 0
                      ? `Dela ${cvCount + letterCount} sparade dokument för feedback`
                      : 'Dela CV eller personligt brev'
                  }
                >
                  <FileText className="w-5 h-5 text-orange-600 group-hover:text-orange-700 transition-colors" strokeWidth={2.25} />

                  {/* Pulse badge */}
                  {(cvCount + letterCount) > 0 && (
                    <>
                      <motion.span
                        className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {cvCount + letterCount}
                      </motion.span>
                      <motion.span
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-orange-500"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </>
                  )}
                </motion.button>
              </motion.div>

              <div className="flex-1 relative">
                {(cvCount + letterCount) > 0 && selectedDocs.length === 0 && (
                  <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
                    <p className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 font-semibold">
                      <FileText className="w-2.5 h-2.5 inline mr-1" />
                      {cvCount + letterCount} dokument redo att dela
                    </p>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  placeholder={placeholder}
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-200/40 focus:border-orange-400 transition-all resize-none disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 placeholder-slate-400"
                  style={{
                    fontSize: '16px',
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                />
                {message.length > 0 && (
                  <div className="hidden sm:block absolute bottom-2 right-2 text-xs text-slate-400 tabular-nums">
                    {message.length}
                  </div>
                )}
              </div>

              {/* Send button */}
              <motion.button
                onClick={handleSubmit}
                disabled={disabled || (!message.trim() && selectedDocs.length === 0)}
                whileHover={{ scale: (disabled || (!message.trim() && selectedDocs.length === 0)) ? 1 : 1.05 }}
                whileTap={{ scale: (disabled || (!message.trim() && selectedDocs.length === 0)) ? 1 : 0.95 }}
                className="relative px-5 py-3 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation flex-shrink-0"
                style={{
                  background:
                    disabled || (!message.trim() && selectedDocs.length === 0)
                      ? '#94A3B8'
                      : 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow:
                    disabled || (!message.trim() && selectedDocs.length === 0)
                      ? 'none'
                      : '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
                }}
              >
                <Send className="w-5 h-5" strokeWidth={2.25} />
                <span className="hidden sm:inline ml-2">Skicka</span>
              </motion.button>
            </div>
          </div>

          {/* Keyboard hint - desktop only */}
          <p className="hidden sm:block text-xs text-slate-500 mt-2 text-center">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono text-xs">Enter</kbd> skickar,
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono text-xs ml-1">Shift+Enter</kbd> ny rad
          </p>
        </div>
      </div>

      {/* Document Selector Modal */}
      <AnimatePresence>
        {showDocSelector && (
          <DocumentSelector
            onSelect={handleDocumentSelect}
            onClose={() => setShowDocSelector(false)}
            selectedDocs={selectedDocs}
          />
        )}
      </AnimatePresence>
    </>
  );
}
