# Frontend Architecture Note: AstraVest Intelligence (Light-Theme Multipage Rebuild)

> **Document Status:** Complete (Phase 0 Audit Gate Deliverable)  
> **Author:** Principal Frontend Architect & Product Designer  
> **Repository:** Multi-Agent Autonomous Financial Intelligence System for Retail Investors (VIT Chennai 2026 / Hackverse PS-01)  
> **Date:** September 2026  

---

## 1. Executive Redesign Rationale & Architecture Decision

The user requested a complete redesign of the initial prototype single-page dark console into an **editorial, light-theme, multipage financial intelligence research workstation and website**.

### Key Architectural Shift
* **From Single-Page Console -> To Dedicated Multipage Product:** Information is segregated across 7 dedicated routes (`/`, `/analyze`, `/analysis/:sessionId`, `/portfolio`, `/evidence`, `/sessions`, `/settings`).
* **From Dark Cyberpunk -> To Premium Editorial Light Theme:** Replaced dense dark background panels with warm off-white canvas (`#f8fafc`), clean white cards (`#ffffff`), slate hairline borders (`#e2e8f0`), deep ink typography (`#0f172a`), cobalt blue primary accents (`#2563eb`), and generous 8px spatial grid padding.
* **Onboarding & Tour Engine:** Built a 11-step interactive product tour (`StepTourManager`) anchored to real UI landmarks across routes with local storage persistence (`astravest_tour_completed`).

---

## 2. Multipage Information Architecture & Route Map

| Route Path | Screen Name | Strategic Purpose & Content Modules |
| :--- | :--- | :--- |
| `/` | **Overview** | Executive briefing: market pulse, active ticker summary, portfolio snapshot, recent session history, system health strip, getting started checklist. |
| `/analyze` | **Analyze Workflow** | Guided analysis workflow: ticker search input, behavioral profile selector (Conservative vs Aggressive), data sources preview, parallel 3-agent progress lanes, synthesis preview. |
| `/analysis/:sessionId` | **Analysis Detail** | Premium research memo: synthesized recommendation status (BUY, WATCH, ACCUMULATE, etc.), decision rationale, signal breakdown, agent reasoning timeline, grounded SEBI citations, profile effect comparison, sensitivity analysis ("What could change this view?"). |
| `/portfolio` | **Portfolio Intelligence** | Holdings breakdown table, asset allocation chart, Herfindahl-Hirschman Index (HHI) concentration meter ($HHI > 0.25$ threshold alert), active ticker exposure, risk insight panel. |
| `/evidence` | **Evidence Library** | Searchable & filterable regulatory disclosure library: filter by source type (SEBI Filings, BSE Disclosures, NSE Tick Feed, Corporate Transcripts), publication date, locator ID, and verbatim excerpt slide-over viewer. |
| `/sessions` | **Session History** | Filterable table of past interaction sessions (Session ID, ticker, profile, timestamp, recommendation label, confidence score, degraded state flag, instant replay link). |
| `/settings` | **Settings & Tour Replay** | Risk profile preferences, system connection status (FastAPI REST & WS health), reduced motion toggle, QA scenario simulator, and "Replay Guided Product Tour" button. |

---

## 3. Light-Theme Design System & Visual Tokens

| Design Role | Value Token | Visual Purpose |
| :--- | :--- | :--- |
| `--bg-base` | `#f8fafc` (slate-50) | Warm off-white canvas. Never stark white everywhere. |
| `--bg-surface` | `#ffffff` | Clean white cards and elevated panels. |
| `--bg-elevated` | `#f1f5f9` (slate-100) | Subtle contrast fill for input fields, badges, and headers. |
| `--fg-primary` | `#0f172a` (slate-900) | Deep ink for headings, primary titles, and bold metrics. |
| `--fg-secondary` | `#334155` (slate-700) | Slate gray for body copy, rationale prose, and agent reasoning. |
| `--fg-tertiary` | `#64748b` (slate-500) | Muted slate for metadata, timestamps, and section subtitles. |
| `--accent-cobalt` | `#2563eb` (blue-600) | Primary brand cobalt for Analyze buttons, active nav, focus rings. |
| `--positive-emerald` | `#059669` (emerald-600) | Mint emerald for healthy feeds, BULLISH signals, positive gains. |
| `--warning-amber` | `#d97706` (amber-600) | Amber for degraded data state banners and concentration warnings. |
| `--degraded-coral` | `#dc2626` (red-600) | Coral red for error states, feed timeouts, or high concentration alerts. |
| `--border-hairline` | `#e2e8f0` (slate-200) | Hairline 1px border for clean panel separation. |

---

## 4. Guided 11-Step Product Tour Specification

The product tour (`ProductTour.tsx`) guides retail investors and judges step by step:

1. **Welcome to AstraVest Intelligence:** Overview of explainable AI investment intelligence.
2. **Multipage Navigation Model:** Explains Overview, Analyze, Analysis Detail, Portfolio, Evidence, Sessions, Settings.
3. **Behavioral Profile Selector:** Explains Conservative (capital preservation) vs Aggressive (momentum growth).
4. **Analyze a Ticker:** Demonstrates ticker search, profile choice, and starting analysis.
5. **Parallel Agent Progress:** Shows Fundamental RAG, Technical Momentum, and Media Sentiment agents executing in parallel.
6. **Synthesized Intelligence Output:** Explains status labels (WATCH, BUY, ACCUMULATE), confidence scores, and non-authoritative disclaimers.
7. **Inspect Grounded Citations:** Demonstrates opening SEBI filing excerpts and verifying source attributions.
8. **Portfolio State & HHI Concentration:** Explains asset allocation and the Herfindahl-Hirschman Index ($HHI > 0.25$ high risk threshold).
9. **Review Session History:** Shows how to revisit and replay past research sessions.
10. **Degraded Data Safety Enforcement:** Explains how feed timeouts, missing filings, or conflicting signals trigger amber safety banners and block uncited recommendations.
11. **Finish & Getting Started Checklist:** Completes tour, persists `astravest_tour_completed=true` in localStorage, and reveals the Overview checklist.

---

## 5. Backend Contract & Integration Integrity

* **FastAPI Backend:** Runs at `http://localhost:8000`.
* **REST Endpoint:** `POST /api/v1/analyze` (supports `scenario` query/header for QA testing: `timeout`, `missing_filing`, `conflicting`, `uncited`).
* **WebSocket Endpoint:** `ws://localhost:8000/ws/agent-trace` (streams monotonically sequenced `WSEvent` frames: `connected` -> `agent_started` -> `agent_progress` -> `agent_completed` -> `synthesis_started` -> `synthesis_completed` -> `completed`).
* **Zero Backend Code Changes:** No backend files modified; 38/38 backend pytest tests pass.
* **Build Verification:** `npx tsc --noEmit; npm run build` compiles cleanly.

---
