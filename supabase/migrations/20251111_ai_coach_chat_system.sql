-- AI Coach Chat System
-- Implements RAG (Retrieval-Augmented Generation) for Swedish job market coaching

-- ============================================================================
-- 1. ENABLE PGVECTOR EXTENSION
-- ============================================================================
create extension if not exists vector;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Profiles extension (optional, auth.users already exists)
-- Stores user context for personalized coaching
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  city text,
  goal_role text,
  industry text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations table
-- Each user can have multiple chat conversations
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  topic text, -- e.g., 'CV', 'salary', 'interview', 'AF-rules'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table
-- Stores all messages in conversations (user, assistant, tool)
create table public.ai_messages (
  id bigserial primary key,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text check (role in ('user', 'assistant', 'system', 'tool')) not null,
  content jsonb not null, -- { text: string, sources?: array, tool_calls?: array }
  tokens int default 0,
  model text, -- e.g., 'gpt-4o-mini'
  created_at timestamptz default now()
);

-- Documents table
-- Stores metadata about uploaded/ingested documents
create table public.ai_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_url text, -- if crawled from web
  storage_path text, -- Supabase Storage path
  topic text, -- e.g., 'AF-regler', 'lön', 'CV-tips'
  lang text default 'sv',
  published_at date, -- source publication date
  file_type text, -- 'pdf', 'docx', 'markdown'
  page_count int,
  word_count int,
  is_public boolean default false, -- true for system/global documents
  is_archived boolean default false,
  version int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Document chunks table
-- Stores text chunks with embeddings for RAG
create table public.ai_document_chunks (
  id bigserial primary key,
  document_id uuid not null references public.ai_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chunk_index int not null,
  heading text, -- section heading if available
  content text not null,
  content_tsv tsvector generated always as (
    to_tsvector('simple', coalesce(heading, '') || ' ' || content)
  ) stored, -- for full-text search
  metadata jsonb default '{}'::jsonb, -- flexible metadata (page_start, page_end, etc)
  embedding vector(1536), -- text-embedding-3-small dimension (or ada-002 compatible)
  created_at timestamptz default now()
);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- Conversation indexes
create index ai_conversations_user_id_idx on public.ai_conversations(user_id);
create index ai_conversations_created_at_idx on public.ai_conversations(created_at desc);

-- Message indexes
create index ai_messages_conversation_id_idx on public.ai_messages(conversation_id, created_at desc);
create index ai_messages_user_id_idx on public.ai_messages(user_id);

-- Document indexes
create index ai_documents_user_id_idx on public.ai_documents(user_id);
create index ai_documents_topic_idx on public.ai_documents(topic);
create index ai_documents_is_public_idx on public.ai_documents(is_public) where is_public = true;

-- Document chunk indexes
create index ai_document_chunks_document_id_idx on public.ai_document_chunks(document_id, chunk_index);
create index ai_document_chunks_user_id_idx on public.ai_document_chunks(user_id);

-- HNSW index for fast vector similarity search (pgvector)
-- m = 16 (max connections per layer), ef_construction = 64 (build quality)
create index ai_document_chunks_embedding_hnsw_idx
  on public.ai_document_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- GIN index for full-text search (hybrid with vector)
create index ai_document_chunks_tsv_idx
  on public.ai_document_chunks
  using gin (content_tsv);

-- ============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_documents enable row level security;
alter table public.ai_document_chunks enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Conversations policies
create policy "Users can manage own conversations"
  on public.ai_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Messages policies
create policy "Users can manage own messages"
  on public.ai_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Documents policies
-- Users can access their own documents + public documents
create policy "Users can view own and public documents"
  on public.ai_documents for select
  using (
    auth.uid() = user_id
    or is_public = true
  );

create policy "Users can manage own documents"
  on public.ai_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.ai_documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.ai_documents for delete
  using (auth.uid() = user_id);

-- Document chunks policies
-- Users can read their own chunks + chunks from public documents
create policy "Users can view own and public chunks"
  on public.ai_document_chunks for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.ai_documents
      where id = document_id and is_public = true
    )
  );

create policy "Users can manage own chunks"
  on public.ai_document_chunks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chunks"
  on public.ai_document_chunks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own chunks"
  on public.ai_document_chunks for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 5. HYBRID SEARCH FUNCTION (RAG)
-- ============================================================================

-- This function combines vector similarity search with full-text search
-- for optimal retrieval quality (hybrid ranking)
create or replace function public.search_ai_chunks_hybrid(
  query_embedding vector(1536),
  query_text text,
  match_count int default 6,
  for_user uuid default null,
  for_topic text default null
)
returns table (
  chunk_id bigint,
  document_id uuid,
  content text,
  heading text,
  source_url text,
  storage_path text,
  published_at date,
  topic text,
  metadata jsonb,
  vec_score float,
  fts_score float,
  combined_rank float
)
language sql stable
as $$
  with vec_results as (
    -- Vector similarity search (cosine distance)
    select
      dc.id as chunk_id,
      dc.document_id,
      dc.content,
      dc.heading,
      d.source_url,
      d.storage_path,
      d.published_at,
      d.topic,
      dc.metadata,
      1 - (dc.embedding <=> query_embedding) as vec_score
    from public.ai_document_chunks dc
    join public.ai_documents d on d.id = dc.document_id
    where
      (for_user is null or dc.user_id = for_user or d.is_public = true)
      and (for_topic is null or d.topic = for_topic)
      and dc.embedding is not null
    order by dc.embedding <=> query_embedding
    limit match_count * 3 -- over-fetch for hybrid reranking
  ),
  fts_results as (
    -- Full-text search (BM25-style ranking)
    select
      dc.id as chunk_id,
      ts_rank_cd(dc.content_tsv, plainto_tsquery('simple', query_text)) as fts_score
    from public.ai_document_chunks dc
    join public.ai_documents d on d.id = dc.document_id
    where
      (for_user is null or dc.user_id = for_user or d.is_public = true)
      and (for_topic is null or d.topic = for_topic)
      and dc.content_tsv @@ plainto_tsquery('simple', query_text)
    order by fts_score desc
    limit match_count * 3
  )
  -- Combine and rerank with weighted scores
  select
    v.chunk_id,
    v.document_id,
    v.content,
    v.heading,
    v.source_url,
    v.storage_path,
    v.published_at,
    v.topic,
    v.metadata,
    v.vec_score,
    coalesce(f.fts_score, 0.0) as fts_score,
    -- Weighted combination: 70% vector, 30% full-text
    (v.vec_score * 0.7 + coalesce(f.fts_score, 0.0) * 0.3) as combined_rank
  from vec_results v
  left join fts_results f on f.chunk_id = v.chunk_id
  order by combined_rank desc
  limit match_count;
$$;

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to get or create a conversation
create or replace function public.get_or_create_ai_conversation(
  p_user_id uuid,
  p_title text default null,
  p_topic text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  -- Check if user has auth
  if auth.uid() != p_user_id then
    raise exception 'Unauthorized';
  end if;

  -- Try to find recent conversation with same topic
  select id into v_conversation_id
  from public.ai_conversations
  where user_id = p_user_id
    and (p_topic is null or topic = p_topic)
    and created_at > now() - interval '1 day'
  order by updated_at desc
  limit 1;

  -- Create new if not found
  if v_conversation_id is null then
    insert into public.ai_conversations (user_id, title, topic)
    values (p_user_id, p_title, p_topic)
    returning id into v_conversation_id;
  end if;

  return v_conversation_id;
end;
$$;

-- Function to update conversation timestamp
create or replace function public.update_ai_conversation_timestamp()
returns trigger
language plpgsql
as $$
begin
  update public.ai_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

-- Trigger to auto-update conversation timestamp on new message
create trigger update_conversation_timestamp_trigger
  after insert on public.ai_messages
  for each row
  execute function public.update_ai_conversation_timestamp();

-- ============================================================================
-- 7. COMMENTS (documentation)
-- ============================================================================

comment on table public.ai_conversations is 'Chat conversations between users and AI coach';
comment on table public.ai_messages is 'Individual messages in conversations (user/assistant/tool)';
comment on table public.ai_documents is 'Source documents for RAG (PDFs, articles, guides)';
comment on table public.ai_document_chunks is 'Text chunks with embeddings for semantic search';
comment on function public.search_ai_chunks_hybrid is 'Hybrid search combining vector similarity and full-text search for RAG';

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
grant usage on sequence public.ai_messages_id_seq to authenticated;
grant usage on sequence public.ai_document_chunks_id_seq to authenticated;

-- Grant access to tables for authenticated users (RLS handles row-level access)
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert, update, delete on public.ai_messages to authenticated;
grant select, insert, update, delete on public.ai_documents to authenticated;
grant select, insert, update, delete on public.ai_document_chunks to authenticated;

-- Grant execute on functions
grant execute on function public.search_ai_chunks_hybrid to authenticated;
grant execute on function public.get_or_create_ai_conversation to authenticated;
