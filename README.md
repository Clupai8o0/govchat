# GovChat — AI-assisted discovery of government datasets
Interactive Next.js UI for asking questions, reviewing retrieved datasets, and exploring related data through trust metrics, citations, and graph navigation.

## What it does
- Lets users ask free-form questions and view AI-generated answers.
- Shows supporting datasets with relevance, agency, links, and download actions.
- Surfaces trust scoring and factor breakdown per response.
- Explores related datasets through smart suggestions and an interactive tree view (with fullscreen modal).

## Key features
- **Chat experience**: Animated message history, typing indicator, mobile-friendly input with Enter-to-send.
- **Audit & trust**: Per-response trust score, factor cards (grounding, provenance, retrieval, verification, recency), audit JSON modal.
- **Sources & downloads**: Source list with similarity badges, agency info, preview snippets, download/open links, recency flags.
- **Suggestions**: Fetches similar datasets from the backend (or mock fallback) and offers one-click follow-up prompts.
- **Graph explorer**: React Flow–based tree showing the question root, retrieved datasets, and expandable similar datasets; fullscreen modal with zoom/reset controls.
- **Responsive layout**: Desktop sidebar tabs; mobile sidebar with gesture/escape handling and floating action button for quick access.

## Tech stack
- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4 (utility-first styling)
- Framer Motion (animations)
- @xyflow/react (graph visualization)
- lucide-react (icons)

## Architecture overview
- `app/page.tsx` → `components/demo.tsx` → `components/ui/gov-chat.tsx`
- `ChatProvider` (`contexts/chat-context.tsx`) holds messages/loading/mobile sidebar/settings state.
- `chatAPI` (`lib/api.ts`) talks to `/query` and `/similar/{id}` endpoints and provides mock fallbacks.
- UI pieces: chat display (`chat-history`), trust metrics (`trust-meter`), sources list (`sources-panel`), suggestions (`smart-suggestions`), graph (`tree-explorer`, modal, node renderer).

```
User → GovChat (chat UI)
       ├─ ChatHistory (Q/A)
       ├─ TrustMeter (score + factors)
       ├─ SourcesPanel (datasets/downloads)
       ├─ SmartSuggestions (similar datasets → prompt fill)
       └─ TreeExplorer (+ modal) ← chatAPI.getSimilarDatasets
                ↑
            chatAPI.askQuestion → backend /query → messages in ChatContext
```

## Getting started (local)
**Prerequisites**
- Node.js 18+ (for Next.js 15, Turbopack)
- npm (or compatible package manager)

**Install**
```bash
npm install
```

**Environment variables**
- `NEXT_PUBLIC_API_URL` (optional): Base URL for the data API. Defaults to `http://localhost:8001`.
  - Expected endpoints:
    - `GET /query?q={question}` returning `QueryResponse` (`answer`, `hits`, `trust`, etc.).
    - `GET /similar/{datasetId}` returning related datasets for suggestions/tree expansion.

**Run**
```bash
npm run dev   # start Next.js with Turbopack
# npm run build && npm start  # production build/serve
```
App serves at `http://localhost:3000` by default.

## Usage
- Ask a question in the input (Shift+Enter for newline, Enter to send).
- Review the AI answer, trust score, source count, and open the audit JSON modal.
- In the right sidebar (or mobile drawer):
  - **Trust** tab: trust score and factor cards.
  - **Datasets** tab: relevance badges, previews, agency info, download/open links.
  - **Explore** tab: related datasets; click a suggestion to prefill a follow-up question.
  - **Tree View** tab: visualize datasets; expand nodes to fetch similar datasets; open fullscreen for more space.
- On mobile, use the floating datasets button to reopen the details drawer.

## Testing / Quality
- Lint: `npm run lint` (or `npm run lint:fix`).
No automated tests or type-check scripts beyond Next.js defaults are included.

## Deployment
- Hosted on Vercel: https://govchat-dsec.vercel.app
- Build locally:
```bash
npm run build
npm start
```
Set `NEXT_PUBLIC_API_URL` to your production data API that serves `/query` and `/similar/{id}`.

## Credits / Contributors
- Design and implementation within this repo’s components (`components/ui/*`, `contexts/chat-context.tsx`, `lib/api.ts`).
