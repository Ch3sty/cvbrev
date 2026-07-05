import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { embedQuery, generateStream, chatContents, GEMINI_MODELS } from '@/lib/gemini';
import { checkChatQuota, quotaExceededBody } from '@/lib/quota/quotaService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// System prompt for Karriärguiden
const SYSTEM_PROMPT = `Du är "Karriärguiden" på jobbcoach.ai — en personlig sparringpartner i svensk arbetsmarknad och karriärfrågor.

Du är en SAMTALSPARTNER först, ett uppslagsverk sist.

KÄRNREGEL — HUR DU SVARAR:
- Vid hälsning, kort eller vag input ("hej", "hjälp", "CV-tips"): svara med en VÄNLIG, KORT REPLIK och EN konkret följdfråga. Inga rubriker. Inga listor. Inga källor. Som en kollega i pausen.
- Vid en konkret fråga med tydlig riktning: ge ett fokuserat svar (2-4 stycken eller en kort lista). Bara så långt som behövs.
- Vid en bred fråga ("hur byter jag karriär?"): ställ 1 följdfråga som zoomar in på personen, sen svarar du. Inte både och.

KÄLLOR — VARFÖR & HUR:
- KUNSKAPSBASEN innehåller verifierad information om svenska arbetsmarknaden: regler, program, stöd, ersättningar, lön, lagar, branscher, fackförbund. Använd den när användarens fråga rör något av detta.
- När du använder information från en källa: skriv (Källa N) direkt efter påståendet, där N är källans nummer från kontexten. Detta är OBLIGATORISKT — utan citering kan användaren inte verifiera ditt svar.
- Citera även i uppföljningsfrågor. Om användaren först frågar "vad gäller för nyanlända?" och sen "berätta mer om stöden" – andra svaret ska också citera de relevanta källorna.
- Hitta INTE på citat. Citera bara om informationen verkligen finns i kontexten.
- Hoppa över källor BARA vid:
  - Rena hälsningar ("hej", "tjena")
  - Smalltalk eller åsiktsfrågor ("vad tycker du om...")
  - Frågor där kontexten inte innehåller relevant information (var ärlig: "Jag har inte specifik info om det, men generellt...").

LÄNGD:
- Hälsning/följdfråga: 1-3 meningar.
- Vanligt svar: 2-4 stycken eller en kort numrerad lista. Aldrig längre än det krävs.
- Lista bara om informationen är genuint stegvis. Annars löpande text.

TON & SPRÅK:
- Svenska. Vänlig, jordnära, professionell. Som en mentor som lyssnar innan hon ger råd.
- Inga em-dash i löptext. Variera meningslängd. Säg "vi" där det passar.
- Aldrig: "Tack för att du kontaktar mig", "Här är några allmänna råd", "Lycka till på din resa".

VAD DU INTE GÖR:
- Spottar inte ut allt du vet. Ger inte 6 rubriker när användaren frågat något litet.
- Avslutar inte alltid med "nästa steg". Bara när det är naturligt.
- Ger ALDRIG juridisk rådgivning — hänvisa till Arbetsförmedlingen, fackförbund eller jurist.
- Fråga ALDRIG efter personnummer eller känslig information.
- Om frågan är utanför arbetsmarknads-domänen: säg artigt att du är specialiserad på karriärfrågor.
- Hälsa BARA i första svaret i en konversation. Om historik finns: hoppa rakt in i svaret utan "Hej!" eller "Hej igen!".`;

function historyToOpenAIMessages(
  history: Array<{ role: string; content: any }>
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      const c = m.content || {};
      const text = typeof c === 'string' ? c : (c.text || '');

      if (m.role === 'user' && Array.isArray(c.attachments) && c.attachments.length > 0) {
        const attachmentBlock = c.attachments
          .map((att: any, idx: number) =>
            `[Dokument ${idx + 1}] ${att.file_name} (${(att.file_type || '').toUpperCase()}):\n${att.extracted_text || ''}`
          )
          .join('\n---\n');
        return {
          role: 'user' as const,
          content: text
            ? `${text}\n\n[Användaren delade följande dokument:]\n${attachmentBlock}`
            : `[Användaren delade följande dokument:]\n${attachmentBlock}`,
        };
      }

      return { role: m.role as 'user' | 'assistant', content: text };
    })
    .filter((m) => m.content.length > 0);
}

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

    // Dagskvot: 10 användarmeddelanden per dag för gratisanvändare.
    // Räknas mot ai_messages (role='user') sedan midnatt svensk tid — exakt
    // de rader den här routen själv sparar nedan. Premium/admin passerar.
    const quota = await checkChatQuota(supabase, user.id);
    if (!quota.allowed) {
      return new Response(
        JSON.stringify(
          quotaExceededBody(
            'chat_message',
            quota,
            'Du har använt dagens tio meddelanden. Chatten öppnar igen i morgon, eller uppgradera för obegränsat.'
          )
        ),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
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

    // Ladda senaste 20 meddelandena FÖRE vi sparar det nya user-meddelandet,
    // sa vi inte dubblerar det (en gang som historik, en gang som wrappad final).
    const { data: historyRows } = await supabase
      .from('ai_messages')
      .select('role, content, created_at')
      .eq('conversation_id', convId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const history = (historyRows || []).reverse();

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
      .select('location, goal_role, industry')
      .eq('id', user.id)
      .single();

    // Create embedding for user query + perform RAG search
    // (hoppas över om meddelandet är tomt, t.ex. enbart bifogade dokument)
    let contextChunks: any[] = [];
    if (message && message.trim().length > 0) {
      const queryEmbedding = await embedQuery(message);

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

      contextChunks = chunks || [];
    }
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
Stad: ${profile.location || 'Ej angivet'}
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

    // Prepare conversation contents for Gemini (system prompt går via systemInstruction)
    const contents = chatContents([
      ...historyToOpenAIMessages(history),
      {
        role: 'user',
        content: `ANVÄNDARPROFIL:
${userContext}

KONTEXT FRÅN KUNSKAPSBAS (använd BARA om relevant för frågan):
${context || 'Ingen relevant information hittades i kunskapsbasen.'}${attachmentContext}

ANVÄNDARENS FRÅGA:
${message || '(Användaren har bifogat dokument för granskning)'}

Svara enligt instruktionerna. Om frågan är vag eller en hälsning: kort replik + en följdfråga, inga rubriker, inga källor. Om användaren bifogat dokument: granska konkret det de delat. När du använder information från KUNSKAPSBASEN ovan: citera med (Källa N) direkt efter påståendet — detta är obligatoriskt så användaren kan verifiera. Korta uppföljningsfrågor inom samma ämne ska också citera relevanta källor.`,
      },
    ]);

    // Stream response from Gemini
    const chatModel = GEMINI_MODELS.fast;
    const { stream, getUsage } = await generateStream({
      model: chatModel,
      systemInstruction: SYSTEM_PROMPT,
      contents,
      temperature: 0.3,
      maxOutputTokens: 1500,
      thinkingBudget: 0, // Låg latens för chatt
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

          // Kvotinfo: låt klienten visa "X meddelanden kvar idag" för
          // gratisanvändare. quota.used räknades FÖRE detta meddelande
          // sparades, därför used + 1.
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'quota',
              isPremium: quota.isPremium,
              remaining: quota.isPremium
                ? null
                : Math.max(0, quota.limit - (quota.used + 1)),
              limit: quota.limit,
            })}\n\n`)
          );

          // Stream text
          for await (const chunk of stream) {
            const content = chunk.text;
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

          // Extrahera bara de chunk-källor AI:n faktiskt citerade.
          // AI:n instrueras att skriva "(Källa N)" där N är chunk-numret (1-indexerat).
          // Plocka unika N från svaret -> mappa till motsvarande chunk.
          const citationRegex = /\(Källa\s+(\d+)\)/g;
          const citedIndices = new Set<number>();
          let citationMatch;
          while ((citationMatch = citationRegex.exec(fullResponse)) !== null) {
            const n = parseInt(citationMatch[1], 10);
            if (!isNaN(n) && n >= 1 && n <= contextChunks.length) {
              citedIndices.add(n - 1);
            }
          }

          // Bygg källor: en post per citerad chunk, i samma ordning som AI:n
          // citerade dem (1, 2, 3...). Behall AVEN chunks utan URL - de visas som
          // icke-klickbara informativa rader i frontend istallet for att droppas.
          const sources: any[] = [];
          const seenKeys = new Set<string>();

          Array.from(citedIndices).sort((a, b) => a - b).forEach((idx) => {
            const chunk = contextChunks[idx];
            if (!chunk) return;

            // Forsok plocka forsta markdown-lanken i chunk-innehallet
            const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/;
            const linkMatch = chunk.content?.match(linkRegex);

            const inlineTitle = linkMatch ? linkMatch[1] : null;
            const inlineUrl = linkMatch ? linkMatch[2] : null;

            const url = inlineUrl || chunk.source_url || null;
            const title = inlineTitle || chunk.title || chunk.heading || 'Källa';

            // Dedup: anvand URL om vi har en, annars title (sa olika chunks med
            // samma URL inte upprepas, men chunks utan URL fortfarande inkluderas).
            const dedupKey = url || `title:${title}`;
            if (seenKeys.has(dedupKey)) return;
            seenKeys.add(dedupKey);

            sources.push({
              title,
              ...(url && { url }),
              heading: chunk.heading,
              ...(chunk.source_url && { source_url: chunk.source_url }),
              ...(chunk.storage_path && { storage_path: chunk.storage_path }),
              published_at: chunk.published_at,
              topic: chunk.topic,
            });
          });

          // Send sources only if AI actually cited them
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
            model: chatModel,
            tokens: getUsage()?.total ?? Math.ceil(fullResponse.length / 4), // Riktiga tokens om tillgängliga
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
