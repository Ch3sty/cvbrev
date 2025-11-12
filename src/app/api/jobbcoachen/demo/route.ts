import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// System prompt for Jobbcoachen demo
const DEMO_SYSTEM_PROMPT = `Du är "Jobbcoachen" på jobbcoach.ai - en expert på den svenska arbetsmarknaden och karriärutveckling.

Din roll:
- Ge konkreta, handlingsorienterade råd om jobb, CV, intervjuer, lön och arbetsmarknadsfrågor
- Var empatisk, uppmuntrande och professionell
- Använd ENDAST information från de tillhandahållna källorna
- Om du är osäker eller informationen saknas i källorna: säg det ärligt
- Inkludera alltid källor när du refererar till fakta, regler eller statistik
- Håll svaren kortfattade (max 400 ord) för demo-användare
- Avsluta med att nämna att användaren kan få mer djupgående svar genom att skapa gratis konto

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
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return new Response('Invalid message', { status: 400 });
    }

    // Rate limiting check (optional: could add IP-based rate limiting here)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create embedding for user query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Perform RAG search (no user_id needed for demo)
    const { data: chunks, error: searchError } = await supabase.rpc(
      'search_ai_chunks_hybrid',
      {
        query_embedding: queryEmbedding,
        query_text: message,
        match_count: 5, // Slightly fewer for demo
        for_user: null, // No user filter for demo
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

    // Prepare messages for OpenAI
    const messages: any[] = [
      {
        role: 'system',
        content: DEMO_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `KONTEXT FRÅN KUNSKAPSBAS:
${context || 'Ingen relevant information hittades i kunskapsbasen.'}

ANVÄNDARENS FRÅGA:
${message}

Svara på svenska med konkreta råd baserat på kontexten ovan. Inkludera källor och håll svaret kortfattat (max 400 ord).`,
      },
    ];

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      stream: true,
      max_tokens: 800, // Lower limit for demo
    });

    // Create streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        try {
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

          // Extract sources from AI's actual response
          const extractedSources: Array<{ title: string; url: string; domain: string }> = [];
          const seenUrls = new Set<string>();

          // Find all markdown links: [text](url) in the AI's response
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let match;

          while ((match = linkRegex.exec(fullResponse)) !== null) {
            const title = match[1];
            const url = match[2];

            // Only add unique URLs
            if (!seenUrls.has(url)) {
              seenUrls.add(url);

              // Extract domain from URL
              let domain = 'okänd källa';
              try {
                const urlObj = new URL(url);
                domain = urlObj.hostname.replace('www.', '');
              } catch (e) {
                // If URL parsing fails, keep default domain
              }

              extractedSources.push({ title, url, domain });
            }
          }

          // Send sources only if AI actually used any
          if (extractedSources.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'sources',
                sources: extractedSources.slice(0, 5) // Max 5 sources for demo
              })}\n\n`)
            );
          }

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
    console.error('Demo chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
