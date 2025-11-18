import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// System prompt for Karriärguiden
const SYSTEM_PROMPT = `Du är "Karriärguiden" på jobbcoach.ai - en expert på den svenska arbetsmarknaden och karriärutveckling.

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
    const { message, conversationId, attachments } = body;

    if ((!message || typeof message !== 'string') && (!attachments || attachments.length === 0)) {
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

    // Save user message (with optional attachments)
    await supabase.from('ai_messages').insert({
      conversation_id: convId,
      user_id: user.id,
      role: 'user',
      content: {
        text: message || '',
        ...(attachments && attachments.length > 0 && { attachments })
      },
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
        return `[Källa ${idx + 1}] ${chunk.title || chunk.heading || 'Utan rubrik'}
Ämne: ${chunk.topic || 'Allmänt'}
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

    // Build attachment context if present
    let attachmentContext = '';
    if (attachments && attachments.length > 0) {
      attachmentContext = '\n\nBIFOGADE DOKUMENT:\n';
      attachments.forEach((att: any, idx: number) => {
        attachmentContext += `\n[Dokument ${idx + 1}] ${att.file_name} (${att.file_type.toUpperCase()}):\n${att.extracted_text}\n---\n`;
      });
    }

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
${context || 'Ingen relevant information hittades i kunskapsbasen.'}${attachmentContext}

ANVÄNDARENS FRÅGA:
${message || '(Användaren har bifogat dokument för granskning)'}

Svara på svenska med konkreta råd baserat på kontexten ovan. Om användaren bifogat ett CV eller personligt brev, ge konstruktiv feedback med specifika förbättringsförslag. Inkludera källor och avsluta med nästa steg.`,
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

          // Build sources from RAG chunks with full metadata
          const sources = contextChunks.map((chunk: any) => ({
            // Use document title as the primary display title
            title: chunk.title || chunk.heading,
            url: chunk.source_url,
            // Original document metadata (fallback)
            heading: chunk.heading,
            source_url: chunk.source_url,
            storage_path: chunk.storage_path,
            published_at: chunk.published_at,
            topic: chunk.topic,
          }));

          // Send sources if we have any
          if (sources.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'sources',
                sources
              })}\n\n`)
            );
          }

          // Save assistant message
          await supabase.from('ai_messages').insert({
            conversation_id: convId,
            user_id: user.id,
            role: 'assistant',
            content: {
              text: fullResponse,
              sources: sources // Save the sources from RAG chunks
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
