# PRD — Personal Whiteboard

## Problem
No single private space to dump project understanding, design refs, notes, and research on an infinite canvas — synced across phone and desktop.

## Goal
A personal-only infinite whiteboard (like Miro/n8n canvas) for:
- Project/system understanding (diagrams, flows)
- Design references (images, screenshots)
- Freeform notes
- Research dumps

## Users
Just you. Single-user, auth-gated.

## Core Features (v1)
1. Infinite canvas — pan, zoom, freeform placement
2. Sticky notes / text blocks
3. Image upload & placement (design refs, screenshots)
4. Freehand draw/pen tool
5. Shapes + connectors (for flow/system diagrams)
6. Boards — multiple named boards, switch between them
7. Auto-save + cross-device sync (phone ↔ desktop)
8. Auth (just you — email/password or magic link)

## Out of Scope (v1)
- Multiplayer/sharing/collaboration
- Comments, mentions
- Native app store distribution
- Version history / undo beyond session

## Platforms
- Web app (primary)
- Installed as PWA on phone (add to home screen)
- Desktop wrapper (later phase)

## Success Criteria
- Can open the same board on phone and desktop and see the same content within seconds
- Can drop an image + note + shape on canvas in under 10 seconds
- Works offline-ish on phone (loads last synced state)
