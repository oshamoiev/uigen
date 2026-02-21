# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (installs deps, generates Prisma client, runs migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset the database
npm run db:reset

# After changing prisma/schema.prisma, regenerate the client and run migrations
npx prisma generate && npx prisma migrate dev
```

The Prisma client is generated to `src/generated/prisma` (not the default location).

## Environment

Copy `.env` and set `ANTHROPIC_API_KEY`. Without it, the app uses `MockLanguageModel` in `src/lib/provider.ts`, which returns static components instead of calling Claude.

## Architecture

### Data Flow

1. User types in chat → `ChatProvider` (`src/lib/contexts/chat-context.tsx`) calls `POST /api/chat`
2. Chat route (`src/app/api/chat/route.ts`) streams a response using Vercel AI SDK's `streamText`, giving the model two tools: `str_replace_editor` and `file_manager`
3. Tool calls stream back to the client; `ChatProvider.onToolCall` forwards each call to `FileSystemProvider.handleToolCall`
4. `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) applies mutations to the in-memory `VirtualFileSystem`
5. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) watches `refreshTrigger`, re-runs `createImportMap` from `src/lib/transform/jsx-transformer.ts`, and reloads an `<iframe>` with a generated HTML blob that uses ESM import maps pointing to Babel-transpiled blob URLs

### Key Abstractions

**VirtualFileSystem** (`src/lib/file-system.ts`): In-memory tree of `FileNode` objects; no disk I/O. Supports create, read, update, delete, rename, and serialize/deserialize. Serialized as a flat `Record<string, FileNode>` stored in the `Project.data` column.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Transpiles JSX/TSX files using `@babel/standalone` in the browser, creates blob URLs, builds an ESM import map (third-party imports resolved via `esm.sh`), and produces the complete preview HTML. Missing local imports get placeholder stub modules so the preview doesn't crash.

**AI Tools**: `str_replace_editor` (view/create/str_replace/insert) and `file_manager` (rename/delete) are defined in `src/lib/tools/` and operate on the server-side `VirtualFileSystem` instance during the stream. The same tool calls are forwarded client-side to update the client's `VirtualFileSystem` via `handleToolCall`.

**Preview Model**: The preview uses `claude-haiku-4-5` (set in `src/lib/provider.ts`). Change `MODEL` there to switch models.

### Auth

JWT-based sessions via `jose`, stored in an `httpOnly` cookie (`auth-token`). `src/lib/auth.ts` is `server-only`. Anonymous users can use the app but their work is tracked in localStorage via `src/lib/anon-work-tracker.ts`; upon sign-in, anonymous work can be claimed.

### Routing

- `/` — redirects authenticated users to their most recent project; shows anonymous landing for others
- `/[projectId]` — loads project from DB, passes messages + file data to `MainContent`
- `/api/chat` — streaming POST endpoint; saves updated messages + file system to DB on finish

### Project Persistence

`Project.messages` stores the full Vercel AI SDK message array as JSON. `Project.data` stores the serialized `VirtualFileSystem` as JSON. Both are written in the `onFinish` callback of `streamText` in the chat route.

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

### UI Layout

`MainContent` (`src/app/main-content.tsx`) wraps everything in `FileSystemProvider` → `ChatProvider` and renders a two-panel resizable layout: chat on the left, preview/code editor on the right. The code view adds a nested resizable with a file tree + Monaco editor.
