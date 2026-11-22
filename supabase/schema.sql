-- DocuMind starter schema for Supabase PostgreSQL.
-- Run in the Supabase SQL Editor. This schema is a foundation; the demo UI
-- does not connect to Supabase or run document extraction/embedding jobs yet.

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default 'violet',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  title text not null,
  original_filename text not null,
  mime_type text not null,
  storage_path text not null,
  file_size_bytes bigint not null default 0 check (file_size_bytes >= 0),
  page_count integer,
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'processing', 'ready', 'failed')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  chunk_index integer not null,
  page_number integer,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_documents (
  collection_id uuid not null references public.collections(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, document_id)
);

create index if not exists documents_owner_updated_idx
  on public.documents(owner_id, updated_at desc);
create index if not exists documents_collection_idx
  on public.documents(collection_id);
create index if not exists chunks_document_idx
  on public.document_chunks(document_id, chunk_index);
create index if not exists conversations_owner_updated_idx
  on public.conversations(owner_id, updated_at desc);
create index if not exists messages_conversation_created_idx
  on public.messages(conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.collection_documents enable row level security;

create policy "Users manage their profile"
  on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Users manage their collections"
  on public.collections for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users manage their documents"
  on public.documents for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users manage their document chunks"
  on public.document_chunks for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users manage their conversations"
  on public.conversations for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users manage their messages"
  on public.messages for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users manage their collection links"
  on public.collection_documents for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Before production: create a private Storage bucket named "documents",
-- add owner-scoped Storage policies, and implement validated upload,
-- extraction, chunking, embedding and retrieval server-side jobs.
-- Keep service-role and model API keys on the server only.
