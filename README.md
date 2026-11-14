# MQL Docs — The MQL4 and MQL5 Language Reference

A front-end only, structured language reference for **MQL4 and MQL5**: syntax, usage,
performance considerations, application architecture and AI integration.

## Contents

| Section | Detail |
|---|---|
| **Home** | Full-page Ghost Fibers WebGL background, contents overview |
| **MQL4 vs MQL5** | 14-row comparison (syntax / concepts / ecosystem) with platform selection guidance |
| **MQL4 Reference** | 11 topics: program structure, data types, control flow, functions and preprocessor, arrays and strings, trading functions, indicators, market information, date and time, error handling, performance patterns |
| **MQL5 Reference** | 12 topics: event model, strict typing, OOP, Standard Library, handle-based indicators, trading and CTrade, timeseries, advanced events, Strategy Tester, ONNX/ML, SQLite persistence, performance patterns |
| **Architecture and AI** | Interactive layered architecture, the execution state machine, modular folder structure, four AI integration patterns (REST / native ONNX / file handshake / socket) and the recommended hybrid |
| **Migration** | 27 MQL4 → MQL5 function mappings with search |
| **Pitfalls** | 11 documented defects (repaint, handle leaks, overfitting, etc.) with incorrect/correct code pairs |
| **Quick Reference** | Per-category signature tables for MQL4 and MQL5 |
| **Roadmap** | A structured seven-stage reading order |
| **Command Palette** | Search across all topics via `Ctrl+K` |

Each topic follows a consistent format: **Syntax → Use Cases → Performance Considerations → Implementation Example**.

## Design

- Palette **Obsidian Studio and Electric Violet**: `#0B0F19` · `#161B26` · `#8B5CF6` · `#F8FAFC`
- Components in the style of [ReactBits](https://reactbits.dev): **Ghost Fibers** (full-page WebGL background), Particles, SplitText, DecryptedText, ScrollReveal, CountUp, GlassSurface, SpotlightCard
- Syntax highlighting via [Shiki](https://shiki.style) (C++ grammar plus custom MQL token enhancement), icons from [Lucide](https://lucide.dev)
- Layout following reactbits.dev: fixed sidebar, automatic table of contents, breadcrumb

## Running Locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploying to Vercel

The project is Vercel-ready (`vercel.json` with SPA rewrite and asset cache headers):

**Option 1 — Git (recommended):**
1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. On [vercel.com](https://vercel.com) → **Add New Project** → select the repository.
3. Vercel auto-detects Vite: build `npm run build`, output `dist`. Click **Deploy**.

**Option 2 — CLI:**
```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

> 100% static front-end — no environment variables, server, or database required.

## Project Structure

```
src/
├── components/
│   ├── reactbits/     # GhostFibers, Particles, SplitText, DecryptedText, ScrollReveal, CountUp, GlassSurface, SpotlightCard
│   ├── layout/        # Sidebar, Topbar, DocsLayout, TOC, Footer
│   ├── docs/          # CodeBlock (Shiki), icon registry, document UI
│   └── CommandPalette
├── data/              # Content: mql4 (11), mql5 (12), comparison, migration, pitfalls, cheatsheet, roadmap
├── lib/               # highlight.ts (Shiki + MQL tokens), utils
└── pages/             # Home, Comparison, SectionOverview, TopicPage, Architecture, Migration, CheatSheet, Roadmap, Pitfalls
```

## Adding Content

Add a new `Topic` object in `src/data/mql4.ts` or `src/data/mql5.ts` — the sidebar,
search index and roadmap follow automatically.

---

This material is educational reference documentation, not investment advice.
