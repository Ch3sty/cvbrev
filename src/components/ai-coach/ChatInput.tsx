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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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
    <div className="border-t border-slate-200 bg-white/90 backdrop-blur-xl p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={placeholder}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 placeholder-slate-500"
              style={{
                fontSize: '16px', // Prevent iOS zoom
                minHeight: '48px',
                maxHeight: '200px'
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
              {message.length > 0 && `${message.length} tecken`}
            </div>
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={disabled || !message.trim()}
            whileHover={{ scale: disabled || !message.trim() ? 1 : 1.05 }}
            whileTap={{ scale: disabled || !message.trim() ? 1 : 0.95 }}
            className="px-5 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex-shrink-0 min-h-[48px] touch-manipulation"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <p className="text-xs text-slate-500 mt-2 text-center">
          Tryck <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Enter</kbd> för att skicka, <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono">Shift+Enter</kbd> för ny rad
        </p>
      </div>
    </div>
  );
}
