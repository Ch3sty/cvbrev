'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';
import type { MessageAttachment } from '@/types/jobbcoachen';

interface ChatInputProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  conversationId?: string | null;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Skriv ditt meddelande...',
  conversationId = null,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Endast PDF, DOCX och TXT tillåtna');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Filen är för stor. Max 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }

      const response = await fetch('/api/jobbcoachen/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kunde inte ladda upp filen');
      }

      setAttachments([...attachments, result.data]);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Kunde inte ladda upp filen');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if ((!message.trim() && attachments.length === 0) || disabled || isUploading) return;

    onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
    setUploadError(null);

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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 sm:py-4 z-10" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
      <div className="max-w-4xl mx-auto">
        {/* Attachments preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {attachments.map((attachment, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm"
                >
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-blue-900 truncate max-w-[200px]">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {formatFileSize(attachment.file_size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1 hover:bg-blue-100 rounded-md transition-colors"
                    aria-label="Ta bort fil"
                  >
                    <X className="w-4 h-4 text-blue-600" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload error */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-800"
            >
              {uploadError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 sm:gap-3">
          {/* File attachment button */}
          <div className="relative flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
              aria-label="Bifoga fil"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="p-3 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
              aria-label="Bifoga CV eller personligt brev"
              title="Bifoga CV eller personligt brev"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isUploading}
              placeholder={placeholder}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 placeholder-slate-500"
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

          <motion.button
            onClick={handleSubmit}
            disabled={disabled || isUploading || (!message.trim() && attachments.length === 0)}
            whileHover={{ scale: (disabled || isUploading || (!message.trim() && attachments.length === 0)) ? 1 : 1.02 }}
            whileTap={{ scale: (disabled || isUploading || (!message.trim() && attachments.length === 0)) ? 1 : 0.98 }}
            className="px-4 sm:px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 min-h-[48px] min-w-[48px] flex items-center justify-center touch-manipulation"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline ml-2">Skicka</span>
          </motion.button>
        </div>

        {/* Keyboard hint - desktop only */}
        <p className="hidden sm:block text-xs text-slate-500 mt-2 text-center">
          <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-xs">Enter</kbd> skickar,
          <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-xs ml-1">Shift+Enter</kbd> ny rad
        </p>
      </div>
    </div>
  );
}
