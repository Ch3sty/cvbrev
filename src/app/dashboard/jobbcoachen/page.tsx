'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  Scale,
  Lightbulb,
  Globe,
  Users,
  Monitor,
  Building,
  Info,
  CheckCircle,
  ExternalLink,
  Shield,
  Sparkles,
  Building2
} from 'lucide-react';
import MessageBubble from '@/components/jobbcoachen/MessageBubble';
import TypingIndicator from '@/components/jobbcoachen/TypingIndicator';
import ChatInput from '@/components/jobbcoachen/ChatInput';
import ExampleConversations from '@/components/jobbcoachen/ExampleConversations';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

import type { Message, MessageAttachment } from '@/types/jobbcoachen';

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: 'cv-tips', label: 'CV-tips', icon: <FileText className="w-4 h-4" />, color: 'blue' },
  { id: 'intervju', label: 'Intervju', icon: <MessageSquare className="w-4 h-4" />, color: 'purple' },
  { id: 'lon', label: 'Lön', icon: <TrendingUp className="w-4 h-4" />, color: 'green' },
  { id: 'arbetsratt', label: 'Arbetsrätt', icon: <Scale className="w-4 h-4" />, color: 'orange' },
  { id: 'karriar', label: 'Karriär', icon: <Lightbulb className="w-4 h-4" />, color: 'yellow' },
  { id: 'nyanlanda', label: 'Nyanlända', icon: <Globe className="w-4 h-4" />, color: 'teal' },
];

const SUGGESTED_QUESTIONS = [
  {
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    question: 'Vilka nyckelord ska jag inkludera för att passera ATS-system?',
    category: 'CV-tips',
    categoryId: 'cv-tips'
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
    question: 'Hur svarar jag på "Berätta om en gång du misslyckades"?',
    category: 'Intervju',
    categoryId: 'intervju'
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-green-600" />,
    question: 'Vad är marknadsmässig lön för systemutvecklare med 5 års erfarenhet?',
    category: 'Lön',
    categoryId: 'lon'
  },
  {
    icon: <Scale className="w-5 h-5 text-orange-600" />,
    question: 'Hur påverkar LAS min uppsägningstid om jag jobbat i 3 år?',
    category: 'Arbetsrätt',
    categoryId: 'arbetsratt'
  },
  {
    icon: <Lightbulb className="w-5 h-5 text-yellow-600" />,
    question: 'Vilka steg behöver jag ta för att byta från lärare till UX-designer?',
    category: 'Karriär',
    categoryId: 'karriar'
  },
  {
    icon: <Globe className="w-5 h-5 text-teal-600" />,
    question: 'Kan jag få etableringsstöd från Arbetsförmedlingen som nyutexaminerad?',
    category: 'Nyanlända',
    categoryId: 'nyanlanda'
  },
];

export default function JobbcoachenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load conversation ID from localStorage
  useEffect(() => {
    const savedConvId = localStorage.getItem('jobbcoachen_conversation_id');
    if (savedConvId) {
      setConversationId(savedConvId);
    }
  }, []);

  const handleSendMessage = async (messageText: string, attachments?: MessageAttachment[]) => {
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      ...(attachments && { attachments }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Du måste vara inloggad');
      }

      const response = await fetch('/api/jobbcoachen/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: messageText,
          conversationId,
          ...(attachments && { attachments }),
        }),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skicka meddelande');
      }

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
                  localStorage.setItem('jobbcoachen_conversation_id', newConvId);
                } else if (data.type === 'sources') {
                  sources = data.sources;
                } else if (data.type === 'text') {
                  assistantMessage += data.content;
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
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const filteredQuestions = selectedCategory
    ? SUGGESTED_QUESTIONS.filter(q => q.categoryId === selectedCategory)
    : SUGGESTED_QUESTIONS;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-white via-slate-50/30 to-slate-100/50 relative overflow-hidden">
      {/* Subtle animated gradient orbs */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-[400px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, rgba(99, 102, 241, 0.02) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-10 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            {/* Premium animated logo */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md opacity-30" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Jobbcoachen
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 truncate">
                Din AI-karriärcoach för svenska arbetsmarknaden
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(true)}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0"
              aria-label="Information om Jobbcoachen"
            >
              <Info className="w-4 h-4 text-slate-600" />
            </button>
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
              transition={{ delay: 0.1 }}
              className="py-8 sm:py-12"
            >
              {/* Premium Hero section */}
              <div className="text-center mb-8">
                {/* Premium animated icon with particles effect */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  {/* Animated particles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
                      animate={{
                        x: [0, (i - 2) * 40, 0],
                        y: [0, -40 - i * 10, 0],
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-2xl opacity-30 animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3"
                >
                  Välkommen till Jobbcoachen
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-6"
                >
                  Få konkret vägledning om svensk arbetsmarknad baserat på verifierade källor.
                </motion.p>

                {/* Premium source credibility card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-xl mx-auto mb-6 overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 shadow-lg"
                >
                  {/* Premium top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-slate-900">Verifierade källor</p>
                      <p className="text-xs text-slate-600">Alla svar baserade på officiell information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Building2, label: 'Arbetsförmedlingen', color: 'blue' },
                      { icon: Users, label: 'Fackförbund', color: 'purple' },
                      { icon: TrendingUp, label: 'SCB Statistik', color: 'emerald' },
                      { icon: Briefcase, label: 'Karriärexperter', color: 'indigo' }
                    ].map((source, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (0.1 * i) }}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className={`p-1.5 rounded-md bg-${source.color}-100`}>
                          <source.icon className={`w-3.5 h-3.5 text-${source.color}-600`} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 flex-1">{source.label}</span>
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Premium feature highlight */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="relative flex items-center justify-center gap-2 text-xs text-blue-700 mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 max-w-md mx-auto overflow-hidden group hover:border-blue-300 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-indigo-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FileText className="w-4 h-4 text-blue-600 relative z-10" />
                  <span className="font-medium relative z-10">Dela dina sparade CV eller personliga brev för personlig feedback</span>
                  <Sparkles className="w-4 h-4 text-blue-600 relative z-10" />
                </motion.div>
              </div>

              {/* Category Pills - Grid layout */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 px-1">
                  Populära områden:
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        {cat.icon}
                        <span className="hidden sm:inline">{cat.label}</span>
                        <span className="sm:hidden">{cat.label.split('-')[0]}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Example Conversations */}
              <ExampleConversations />

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredQuestions.map((item, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestedQuestion(item.question)}
                    className="group bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-500 hover:shadow-md transition-all touch-manipulation min-h-[88px]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-blue-600 mb-1">
                          {item.category}
                        </p>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">
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
                  attachments={msg.attachments}
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
        conversationId={conversationId}
        hasMessages={messages.length > 0}
        placeholder={
          isLoading ? 'Jobbcoachen tänker...' : 'Ställ en fråga om arbetsmarknaden...'
        }
      />

      {/* Info Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowInfoModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Om Jobbcoachen
                </h2>
                <p className="text-slate-600">
                  Din guide till svensk arbetsmarknad med pålitliga källor
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Vad kan Jobbcoachen hjälpa dig med?
                </h3>
                <p className="text-slate-700 mb-3">
                  Jobbcoachen ger dig svar baserat på svensk arbetsmarknadsdata från officiella källor som:
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Arbetsförmedlingen</strong> - Program och stöd för arbetssökande</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Fackförbund</strong> - Lönestatistik och arbetsrätt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>SCB</strong> - Officiell arbetsmarknadsstatistik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Karriärexperter</strong> - Best practices för CV och intervjuer</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Kunskapsområden
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {cat.icon}
                      </div>
                      <span>{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tips:</strong> Varje svar innehåller klickbara källhänvisningar så du kan läsa mer på originalskällorna.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Stäng
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
