import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// System prompt for AI Coach
const SYSTEM_PROMPT = `Du är "AI Coach" för jobbcoach.ai - en expert på den svenska arbetsmarknaden och karriärutveckling.

Din roll:
- Ge konkreta, handlingsorienterade råd om jobb, CV, intervjuer, lön och arbetsmarknadsfrågor
- Var empatisk, uppmuntrande och professionell
- Använd ENDAST information från de tillhandahållna källorna
- Om du är osäker eller informationen saknas i källorna: säg det ärligt och föreslå var användaren kan verifiera
- Inkludera alltid källor när du refererar till fakta, regler eller statistik
- Avsluta alltid med 2-3 konkreta nästa steg

Språk: Svenska
Ton: Vänlig men professionell, som en erfaren karriärcoach

VIKTIGT:
- Ge ALDRIG juridisk rådgivning - hänvisa till Arbetsförmedlingen, fackförbund eller jurist
- Fråga ALDRIG efter personnummer eller känslig information
- Om frågan är utanför arbetsmarknads-domänen: förklara artigt att du är specialiserad på karriärfrågor`;

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  try {
    // Get request body
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string') {
      return new Response('Invalid message', { status: 400 });
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get or create conversation
    let convId = conversationId;

    if (!convId) {
      const { data: conversation, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 100),
          topic: 'general',
        })
        .select()
        .single();

      if (convError) throw convError;
      convId = conversation.id;
    }

    // Save user message
    await supabase.from('ai_messages').insert({
      conversation_id: convId,
      user_id: user.id,
      role: 'user',
      content: { text: message },
    });

    // Get user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('city, goal_role, industry')
      .eq('id', user.id)
      .single();

    // Create embedding for user query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Perform RAG search
    const { data: chunks, error: searchError } = await supabase.rpc(
      'search_ai_chunks_hybrid',
      {
        query_embedding: queryEmbedding,
        query_text: message,
        match_count: 6,
        for_user: user.id,
        for_topic: null,
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Build context from retrieved chunks
    const contextChunks = chunks || [];
    const context = contextChunks
      .map((chunk: any, idx: number) => {
        return `[Källa ${idx + 1}] ${chunk.heading || 'Utan rubrik'}
Dokument: ${chunk.storage_path || chunk.source_url || 'Okänd källa'}
${chunk.published_at ? `Datum: ${chunk.published_at}` : ''}
Innehåll:
${chunk.content}
---`;
      })
      .join('\n\n');

    // Build user context
    const userContext = profile
      ? `Användarens mål: ${profile.goal_role || 'Ej angivet'}
Stad: ${profile.city || 'Ej angivet'}
Bransch: ${profile.industry || 'Ej angivet'}`
      : 'Ingen profilinformation tillgänglig';

    // Prepare messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `ANVÄNDARPROFIL:
${userContext}

KONTEXT FRÅN KUNSKAPSBAS:
${context || 'Ingen relevant information hittades i kunskapsbasen.'}

ANVÄNDARENS FRÅGA:
${message}

Svara på svenska med konkreta råd baserat på kontexten ovan. Inkludera källor och avsluta med nästa steg.`,
      },
    ];

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      stream: true,
      max_tokens: 1500,
    });

    // Create streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
          // Send conversation ID first
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'conversation_id',
              conversationId: convId
            })}\n\n`)
          );

          // Send sources - extract URLs from markdown links in chunks
          if (contextChunks.length > 0) {
            // Extract all unique URLs from markdown links in the chunks
            const extractedSources: Array<{ title: string; url: string }> = [];
            const seenUrls = new Set<string>();

            contextChunks.forEach((c: any) => {
              // Find all markdown links: [text](url)
              const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
              let match;

              while ((match = linkRegex.exec(c.content)) !== null) {
                const title = match[1];
                const url = match[2];

                // Only add unique URLs
                if (!seenUrls.has(url)) {
                  seenUrls.add(url);
                  extractedSources.push({ title, url });
                }
              }
            });

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'sources',
                sources: extractedSources.length > 0
                  ? extractedSources
                  : contextChunks.map((c: any) => ({
                      heading: c.heading,
                      source_url: c.source_url,
                      storage_path: c.storage_path,
                      published_at: c.published_at,
                      topic: c.topic,
                    }))
              })}\n\n`)
            );
          }

          // Stream text
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'text',
                  content
                })}\n\n`)
              );
            }
          }

          // Save assistant message
          await supabase.from('ai_messages').insert({
            conversation_id: convId,
            user_id: user.id,
            role: 'assistant',
            content: {
              text: fullResponse,
              sources: contextChunks.map((c: any) => ({
                heading: c.heading,
                source_url: c.source_url,
                published_at: c.published_at,
              }))
            },
            model: 'gpt-4o-mini',
            tokens: Math.ceil(fullResponse.length / 4), // Rough estimate
          });

          // Send done signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: 'Ett fel uppstod vid generering av svar'
            })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
