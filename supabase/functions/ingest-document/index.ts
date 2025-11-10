import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface IngestRequest {
  documentId?: string; // If provided, will use existing document
  filePath?: string; // Storage path to file
  fileContent?: string; // OR direct text content
  title: string;
  topic?: string;
  sourceUrl?: string;
  publishedAt?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

interface DocumentChunk {
  text: string;
  heading?: string;
  metadata: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const requestData: IngestRequest = await req.json();
    const {
      documentId,
      filePath,
      fileContent,
      title,
      topic,
      sourceUrl,
      publishedAt,
      isPublic = false,
      metadata = {},
    } = requestData;

    console.log("Starting document ingest:", { title, topic, filePath });

    // Step 1: Get document content
    let content = fileContent;

    if (!content && filePath) {
      // Download from storage
      const { data: fileData, error: downloadError } =
        await supabaseClient.storage
          .from("ai-documents")
          .download(filePath);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      // For now, we'll handle text files and PDFs need external processing
      // In production, you'd use pdf-parse or similar
      const fileType = filePath.split(".").pop()?.toLowerCase();

      if (fileType === "txt" || fileType === "md") {
        content = await fileData.text();
      } else if (fileType === "pdf") {
        // For PDF, you need to process with pdf-parse or external service
        // For now, return error asking for pre-processed text
        throw new Error(
          "PDF processing not yet implemented. Please provide fileContent as pre-extracted text."
        );
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
    }

    if (!content) {
      throw new Error("No content provided (filePath or fileContent required)");
    }

    // Step 2: Create or get document record
    let docId = documentId;

    if (!docId) {
      const { data: doc, error: docError } = await supabaseClient
        .from("ai_documents")
        .insert({
          user_id: user.id,
          title,
          storage_path: filePath,
          source_url: sourceUrl,
          topic,
          published_at: publishedAt,
          is_public: isPublic,
          file_type: filePath
            ? filePath.split(".").pop()?.toLowerCase()
            : "text",
          word_count: content.split(/\s+/).length,
        })
        .select()
        .single();

      if (docError) {
        throw new Error(`Failed to create document: ${docError.message}`);
      }

      docId = doc.id;
      console.log("Created document:", docId);
    }

    // Step 3: Chunk the content
    const chunks = chunkText(content, {
      chunkSize: 800,
      chunkOverlap: 100,
      metadata,
    });

    console.log(`Created ${chunks.length} chunks`);

    // Step 4: Create embeddings and insert chunks
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        // Create embedding using OpenAI
        const embeddingResponse = await fetch(
          "https://api.openai.com/v1/embeddings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "text-embedding-3-small",
              input: chunk.text,
            }),
          }
        );

        if (!embeddingResponse.ok) {
          const error = await embeddingResponse.text();
          console.error(`Embedding error for chunk ${i}:`, error);
          errorCount++;
          continue;
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Insert chunk with embedding
        const { error: chunkError } = await supabaseClient
          .from("ai_document_chunks")
          .insert({
            document_id: docId,
            user_id: user.id,
            chunk_index: i,
            heading: chunk.heading,
            content: chunk.text,
            metadata: chunk.metadata,
            embedding,
          });

        if (chunkError) {
          console.error(`Failed to insert chunk ${i}:`, chunkError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        errorCount++;
      }
    }

    console.log(
      `Ingest complete: ${successCount} success, ${errorCount} errors`
    );

    return new Response(
      JSON.stringify({
        success: true,
        documentId: docId,
        chunksProcessed: chunks.length,
        chunksSuccess: successCount,
        chunksError: errorCount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Ingest error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

/**
 * Chunk text into smaller pieces with overlap
 */
function chunkText(
  text: string,
  options: {
    chunkSize: number;
    chunkOverlap: number;
    metadata?: Record<string, any>;
  }
): DocumentChunk[] {
  const { chunkSize, chunkOverlap, metadata = {} } = options;
  const chunks: DocumentChunk[] = [];

  // Split by paragraphs first
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let currentChunk = "";
  let currentHeading: string | undefined;

  for (const paragraph of paragraphs) {
    // Check if this looks like a heading (short line, possibly with markdown #)
    const isHeading =
      paragraph.length < 100 &&
      (paragraph.match(/^#{1,6}\s/) || paragraph.match(/^[A-ZÅÄÖ]/) !== null);

    if (isHeading && currentChunk.length === 0) {
      currentHeading = paragraph.replace(/^#{1,6}\s/, "");
      continue;
    }

    // If adding this paragraph would exceed chunk size, save current chunk
    if (
      currentChunk.length > 0 &&
      currentChunk.length + paragraph.length > chunkSize
    ) {
      chunks.push({
        text: currentChunk.trim(),
        heading: currentHeading,
        metadata: { ...metadata },
      });

      // Start new chunk with overlap
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-chunkOverlap);
      currentChunk = overlapWords.join(" ") + " " + paragraph;
      currentHeading = undefined;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      heading: currentHeading,
      metadata: { ...metadata },
    });
  }

  return chunks;
}
