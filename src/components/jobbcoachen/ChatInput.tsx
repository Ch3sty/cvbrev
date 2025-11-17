'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, X, ChevronRight, Sparkles } from 'lucide-react';
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
  hasMessages?: boolean; // To control banner visibility
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Skriv ditt meddelande...',
  conversationId = null,
  hasMessages = false,
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
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 sm:py-4 z-10" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-4xl mx-auto">
          {/* Call-out banner for document sharing - only shown when no messages */}
          <AnimatePresence>
            {!hasMessages && (cvCount + letterCount) > 0 && selectedDocs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-sm flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-1">
                      Du har {cvCount + letterCount} sparade dokument
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      Dela ditt CV eller personliga brev för personlig feedback och förslag
                    </p>
                    <motion.button
                      onClick={() => setShowDocSelector(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                    >
                      <span>Välj dokument att dela</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </motion.button>
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-blue-900 truncate max-w-[200px]">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {doc.type === 'cv' ? 'CV' : 'Personligt brev'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveDoc(doc.id, doc.type)}
                      className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                      aria-label="Ta bort dokument"
                    >
                      <X className="w-4 h-4 text-blue-600" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium input with glow effect */}
          <div className="relative group">
            {/* Glow effect on focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-focus-within:opacity-20 blur-lg transition-opacity" />

            <div className="relative flex items-end gap-2 sm:gap-3">
              {/* Document selector button with premium glow effects */}
              <motion.div className="relative flex-shrink-0">
                {/* Animated glow effect */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity"
                  animate={{
                    opacity: (cvCount + letterCount) > 0 ? [0.2, 0.4, 0.2] : 0
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                <motion.button
                  onClick={() => setShowDocSelector(true)}
                  disabled={disabled}
                  whileHover={{ scale: disabled ? 1 : 1.08, rotate: disabled ? 0 : 3 }}
                  whileTap={{ scale: disabled ? 1 : 0.95 }}
                  className="relative p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation group"
                  aria-label="Dela CV eller personligt brev"
                  title={
                    (cvCount + letterCount) > 0
                      ? `Du har ${cvCount + letterCount} sparade dokument`
                      : 'Dela CV eller personligt brev'
                  }
                >
                  <FileText className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" />

                  {/* Premium pulse badge */}
                  {(cvCount + letterCount) > 0 && (
                    <>
                      <motion.span
                        className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        animate={{
                          scale: [1, 1.15, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {cvCount + letterCount}
                      </motion.span>

                      {/* Pulse ring */}
                      <motion.span
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-blue-600"
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [0.6, 0, 0.6]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    </>
                  )}
                </motion.button>
              </motion.div>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  placeholder={placeholder}
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 placeholder-slate-500 focus:shadow-lg"
                  style={{
                    fontSize: '16px', // Prevent iOS zoom
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                />
                {/* Character count - only on desktop */}
                {message.length > 0 && (
                  <div className="hidden sm:block absolute bottom-2 right-2 text-xs text-slate-400">
                    {message.length}
                  </div>
                )}
              </div>

              {/* Premium send button with multi-layer glow */}
              <motion.div className="relative group/send flex-shrink-0">
                {/* Outer glow ring */}
                <motion.div
                  className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur-lg opacity-40"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.95, 1.05, 0.95]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Middle glow layer */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-50 group-hover/send:opacity-75 transition-opacity" />

                <motion.button
                  onClick={handleSubmit}
                  disabled={disabled || (!message.trim() && selectedDocs.length === 0)}
                  whileHover={{ scale: (disabled || (!message.trim() && selectedDocs.length === 0)) ? 1 : 1.08, y: (disabled || (!message.trim() && selectedDocs.length === 0)) ? 0 : -2 }}
                  whileTap={{ scale: (disabled || (!message.trim() && selectedDocs.length === 0)) ? 1 : 0.95 }}
                  className="relative px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
                >
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">Skicka</span>
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Keyboard hint - desktop only */}
          <p className="hidden sm:block text-xs text-slate-500 mt-2 text-center">
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-xs">Enter</kbd> skickar,
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-xs ml-1">Shift+Enter</kbd> ny rad
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
