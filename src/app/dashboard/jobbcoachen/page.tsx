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
  Building2,
  ArrowRight,
  MessageCircle,
  Search,
  UserPlus
} from 'lucide-react';
import MessageBubble from '@/components/jobbcoachen/MessageBubble';
import TypingIndicator from '@/components/jobbcoachen/TypingIndicator';
import ChatInput from '@/components/jobbcoachen/ChatInput';
import DocumentSelector from '@/components/jobbcoachen/DocumentSelector';
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
  { id: 'jobbsok', label: 'Jobbsök', icon: <Search className="w-4 h-4" />, color: 'indigo' },
  { id: 'natverk', label: 'Nätverk', icon: <UserPlus className="w-4 h-4" />, color: 'pink' },
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
  {
    icon: <Search className="w-5 h-5 text-indigo-600" />,
    question: 'Hur hittar jag dolda jobbannonser som inte publiceras öppet?',
    category: 'Jobbsök',
    categoryId: 'jobbsok'
  },
  {
    icon: <UserPlus className="w-5 h-5 text-pink-600" />,
    question: 'Hur bygger jag ett professionellt nätverk på LinkedIn från scratch?',
    category: 'Nätverk',
    categoryId: 'natverk'
  },
];

export default function JobbcoachenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [cvCount, setCvCount] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [showDocSelector, setShowDocSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
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
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0"
              aria-label="Information om Jobbcoachen"
            >
              <Info className="w-5 h-5 text-slate-600" />
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
                      <MessageCircle className="w-10 h-10 text-white" />
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

                {/* Diskret källhint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-xl mx-auto mb-6"
                >
                  <p className="text-xs text-center text-slate-500">
                    <CheckCircle className="w-3 h-3 inline mr-1 text-green-600" />
                    Svar baseras på verifierade källor och redovisas alltid med källhänvisning
                  </p>
                </motion.div>
              </div>

              {/* Category Pills - Cleanare design */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Välj ämne:
                  </h3>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Visa alla
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium transition-all touch-manipulation flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Suggested Questions - Clean design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredQuestions.map((item, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.03 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSuggestedQuestion(item.question)}
                    className="group bg-white border border-slate-200 rounded-lg p-3 text-left hover:border-blue-300 hover:bg-blue-50/50 transition-all touch-manipulation"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-slate-500 mb-0.5 uppercase tracking-wide">
                          {item.category}
                        </p>
                        <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
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

      {/* Document Selector Modal */}
      {showDocSelector && (
        <DocumentSelector
          onSelect={(doc) => {
            // Handle document selection - will be passed to ChatInput
            setShowDocSelector(false);
          }}
          onClose={() => setShowDocSelector(false)}
          selectedDocs={[]}
        />
      )}
    </div>
  );
}
