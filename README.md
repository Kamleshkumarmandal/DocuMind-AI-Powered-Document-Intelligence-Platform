# DocuMind — AI-Powered Document Intelligence Platform

DocuMind is an AI-ready document workspace built with Next.js, React, TypeScript and Tailwind CSS. The project is designed to grow from an interactive portfolio prototype into a secure document intelligence platform.

## Current demo experience

- Responsive knowledge workspace dashboard
- Sample document library with file type, category, size and update details
- Search documents by filename, type or category
- Filter the library by collection-style categories
- Select a document to use as the chat context
- Upload PDF, DOCX and TXT files into the current browser session
- Interactive AI-assistant chat flow with sample illustrative answers
- Workspace navigation, recent activity notices and sample usage metrics

## Important: demo vs. production

The current interface is a front-end prototype. File selection adds document metadata to temporary browser state; it does **not** upload file bytes to a server or persist after refresh. The chat responses are sample text and are **not generated from uploaded documents**. Document parsing, OCR, embeddings, vector retrieval, real AI answers, authentication, storage and billing are not connected yet.

A Supabase PostgreSQL starter schema is included at `supabase/schema.sql`. It includes owner-scoped Row Level Security policies and a vector column for document chunks. The UI is not connected to it yet.

## Tech stack

- Next.js 15.5.29 (patched Next.js 15 line)
- React 19
- TypeScript
- Tailwind CSS 3
- Supabase / PostgreSQL with pgvector schema starter

## Run locally

Install Node.js 20 or newer, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a production build with:

```bash
npm run build
npm start
```

## Supabase foundation

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and anon key.
5. Implement authentication, private Storage bucket policies and server-side document processing before storing real user files.

## Recommended development roadmap

- [ ] Connect Supabase authentication and user profiles
- [ ] Add private document Storage and signed upload/download URLs
- [ ] Validate file size and MIME type on the server
- [ ] Extract PDF, DOCX and TXT text
- [ ] Chunk document text and generate embeddings
- [ ] Implement secure vector search scoped to the signed-in user
- [ ] Add an AI chat API with page-level source citations
- [ ] Persist conversations and document summaries
- [ ] Add collection management, tests and CI checks
- [ ] Deploy and configure production environment variables

## Project structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
supabase/
  schema.sql
.env.example
```

## Security notes

Never commit API keys, database passwords, Supabase service-role keys or other secrets. Keep privileged credentials in server-only environment variables. Validate uploaded files and enforce ownership checks at every storage and database boundary.

## License

MIT. See [LICENSE](LICENSE).
