# TRD — Personal Whiteboard

## Stack
- **Frontend/Canvas:** Next.js (App Router) + tldraw SDK
- **Backend/Sync:** Supabase (Postgres + Auth + Storage + Realtime)
- **Hosting:** Vercel
- **Phone:** PWA (manifest.json + service worker) — installable via "Add to Home Screen"
- **Desktop (phase 2):** Tauri wrapper around the same web app

## Architecture
```
Next.js App (Vercel)
 ├─ tldraw canvas (client-side rendering, local-first)
 ├─ Supabase Auth (single user, email/password)
 ├─ Supabase Postgres (board metadata + tldraw document JSON)
 ├─ Supabase Storage (uploaded images)
 └─ Supabase Realtime (optional — sync board state across sessions)
```

## Data Model
**boards**
| field | type |
|---|---|
| id | uuid |
| user_id | uuid |
| name | text |
| document | jsonb (tldraw snapshot) |
| created_at | timestamp |
| updated_at | timestamp |

**assets** (images)
| field | type |
|---|---|
| id | uuid |
| board_id | uuid |
| storage_path | text |

## Sync Strategy
- tldraw store auto-persists to local state
- Debounced write (e.g. every 2–3s of inactivity) pushes `document` JSON to Supabase
- On load, fetch latest `document` snapshot for the board
- Optional: Supabase Realtime channel per board for instant multi-device sync

## Auth
- Supabase Auth, single allow-listed email
- Session persisted, protects all routes via middleware

## PWA Setup
- `manifest.json` (name, icons, standalone display mode)
- Service worker for basic offline shell caching
- iOS/Android home-screen installable

## Phase 2 — Desktop
- Tauri wraps the deployed web app (or local build)
- Reuses same Supabase backend — no separate sync logic needed

## Non-Functional
- Load time: board should render in <2s on 4G
- Storage: images compressed on upload before storing
- Single-user only — no RLS complexity beyond `user_id = auth.uid()`
