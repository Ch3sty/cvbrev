'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Skriv ditt meddelande...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage('');

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
    <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-3 sm:py-4 z-10" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
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
            disabled={disabled || !message.trim()}
            whileHover={{ scale: disabled || !message.trim() ? 1 : 1.02 }}
            whileTap={{ scale: disabled || !message.trim() ? 1 : 0.98 }}
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
