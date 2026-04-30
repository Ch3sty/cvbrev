'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from '@/components/jobbcoachen/MessageBubble';
import TypingIndicator from '@/components/jobbcoachen/TypingIndicator';
import ChatInput from '@/components/jobbcoachen/ChatInput';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import type { Message, MessageAttachment } from '@/types/jobbcoachen';

import JobbcoachenLayout from './components/JobbcoachenLayout';
import WelcomeMessage from './components/WelcomeMessage';
import ChatTrustStrip from './components/ChatTrustStrip';
import MiniSuggestionChips from './components/MiniSuggestionChips';

export default function JobbcoachenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cvCount, setCvCount] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [shouldOpenDocSelector, setShouldOpenDocSelector] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  // Load document counts
  useEffect(() => {
    const loadDocCounts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count: cvs } = await supabase
          .from('cv_texts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

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

  const handleSendMessage = async (
    messageText: string,
    attachments?: MessageAttachment[]
  ) => {
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
          Authorization: `Bearer ${session.access_token}`,
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

  const isWelcomeView = messages.length === 0;

  return (
    <>
      <JobbcoachenLayout>
        {isWelcomeView ? (
          <div className="min-h-[60vh] sm:min-h-[55vh] flex flex-col justify-center">
            <WelcomeMessage
              cvCount={cvCount}
              letterCount={letterCount}
              onOpenSelector={() => setShouldOpenDocSelector((v) => v + 1)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <ChatTrustStrip />
            <div className="space-y-2">
              {messages.map((message, idx) => (
                <MessageBubble
                  key={idx}
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                  attachments={message.attachments}
                  isStreaming={
                    isLoading &&
                    idx === messages.length - 1 &&
                    message.role === 'assistant'
                  }
                />
              ))}
              {isLoading &&
                messages[messages.length - 1]?.role === 'user' && (
                  <TypingIndicator />
                )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </JobbcoachenLayout>

      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Fråga vad du vill veta om jobb, lön, intervju eller arbetsrätt…"
        conversationId={conversationId}
        hasMessages={messages.length > 0}
        externalOpenSignal={shouldOpenDocSelector}
        suggestionChips={isWelcomeView ? <MiniSuggestionChips onPick={handleSendMessage} /> : null}
      />
    </>
  );
}
