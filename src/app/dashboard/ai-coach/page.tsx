'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, TrendingUp, FileText, Briefcase } from 'lucide-react';
import MessageBubble from '@/components/ai-coach/MessageBubble';
import TypingIndicator from '@/components/ai-coach/TypingIndicator';
import ChatInput from '@/components/ai-coach/ChatInput';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

const SUGGESTED_QUESTIONS = [
  {
    icon: <Briefcase className="w-5 h-5" />,
    question: 'Vilka arbetsmarknadsprogram finns för nyanlända?',
    category: 'Arbetsmarknad'
  },
  {
    icon: <FileText className="w-5 h-5" />,
    question: 'Hur skriver jag ett effektivt CV för den svenska arbetsmarknaden?',
    category: 'CV & Ansökan'
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    question: 'Vad är medellönen för min yrkesroll?',
    category: 'Lön'
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    question: 'Hur förhandlar jag lön på bästa sätt?',
    category: 'Karriär'
  },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load conversation ID from localStorage
  useEffect(() => {
    const savedConvId = localStorage.getItem('ai_coach_conversation_id');
    if (savedConvId) {
      setConversationId(savedConvId);
      // Optionally load conversation history here
    }
  }, []);

  const handleSendMessage = async (messageText: string) => {
    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Du måste vara inloggad');
      }

      // Call chat API with SSE
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: messageText,
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skicka meddelande');
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = '';
      let sources: any[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.type === 'conversation_id') {
                  const newConvId = data.conversationId;
                  setConversationId(newConvId);
                  localStorage.setItem('ai_coach_conversation_id', newConvId);
                } else if (data.type === 'sources') {
                  sources = data.sources;
                } else if (data.type === 'text') {
                  assistantMessage += data.content;
                  // Update message in real-time
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: assistantMessage },
                      ];
                    } else {
                      return [
                        ...prev,
                        {
                          role: 'assistant',
                          content: assistantMessage,
                          sources,
                        },
                      ];
                    }
                  });
                } else if (data.type === 'done') {
                  // Finalize message with sources
                  setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, sources },
                      ];
                    }
                    return prev;
                  });
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.error('Parse error:', parseError);
              }
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Send message error:', error);
      setError(error.message || 'Ett fel uppstod');
      setIsLoading(false);

      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-white via-slate-50/30 to-slate-100/50 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, rgba(147, 51, 234, 0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -80, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-xl p-4 sm:p-6 shadow-sm relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Coach
              </h1>
              <p className="text-sm text-slate-600">
                Din personliga karriärcoach för den svenska arbetsmarknaden
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 elegant-scrollbar relative z-10">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Välkommen till AI Coach!
              </h2>
              <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                Ställ frågor om den svenska arbetsmarknaden, CV-tips, löneförhandling,
                intervjuförberedelser och mycket mer. Jag baserar mina svar på aktuell
                information och ger dig konkreta nästa steg.
              </p>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {SUGGESTED_QUESTIONS.map((item, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestedQuestion(item.question)}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl p-4 text-left hover:shadow-lg hover:shadow-pink-500/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-pink-600 mb-1">
                          {item.category}
                        </p>
                        <p className="text-sm text-slate-700 font-medium">
                          {item.question}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  sources={msg.sources}
                  isStreaming={
                    idx === messages.length - 1 &&
                    msg.role === 'assistant' &&
                    isLoading
                  }
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <TypingIndicator />
              )}
            </>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
            >
              <p className="text-red-800 text-sm font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 text-xs underline mt-1"
              >
                Stäng
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={
          isLoading ? 'AI Coach tänker...' : 'Ställ en fråga om arbetsmarknaden...'
        }
      />
    </div>
  );
}
