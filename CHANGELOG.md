# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-07

### Added
- **Core Document Compiler**:
  - High-fidelity Markdown AST parser & inline tokenizer with zero external parser dependencies.
  - Native OpenXML (`.docx`) compiler generating standards-compliant Word documents with styled tables, callouts, lists, and headings.
  - Headless PDF engine supporting primary LibreOffice (`soffice`) headless conversion for 1:1 visual parity with DOCX.
  - Secondary WeasyPrint PDF fallback and in-browser Print CSS engine.
- **ATS & Document Quality Auditor**:
  - Algorithmic evaluation scoring documents from 0 to 100 based on standard section detection, action verb density, quantifiable metrics, and format readability.
  - Bimodal dictionary for action verb detection supporting both English and Indonesian.
  - JSON reporting mode for automated CI/CD quality gates.
- **Templates & Typographic Presets**:
  - 5 built-in presets: `ats-classic` (100% parseable standard), `modern-accent` (contemporary emerald styling), `tech-spec` (engineering RFCs & code blocks), `academic` (formal serif styling), and `executive` (refined leadership profile).
  - Dynamic Custom Document Type builder supporting schema definition, custom audit rubrics, and localStorage persistence.
- **Developer CLI (`markforge`)**:
  - `markforge build`: Compiles Markdown to DOCX, PDF, HTML, or both.
  - `markforge watch`: Live file-watcher with debounced auto-recompilation.
  - `markforge analyze`: Interactive ATS audit scorecard with threshold exit codes.
  - `markforge doctor`: System environment diagnostic checking LibreOffice, WeasyPrint, and Pandoc.
  - `markforge templates`: Interactive terminal table listing all registered templates.
- **Model Context Protocol (MCP) Server**:
  - Standards-compliant JSON-RPC 2.0 stdio server for Claude Desktop, Cursor IDE, and Antigravity.
  - Exposes 5 AI tools: `convert_markdown`, `analyze_document`, `list_templates`, `get_template_skeleton`, and `doctor`.
- **Next.js 15 Web Studio**:
  - Split-screen live editing with simulated A4 preview canvas and dashed page-break guides.
  - Two-tier cascading document type and template selector.
  - Type-safe dual-language support (Bahasa Indonesia `id` and English `en`).
  - Native Mermaid.js flowchart and architecture diagram vector rendering.
  - Browser print fallback (`window.print()`) with dedicated print styles.
  - React Error Boundary with dark-mode crash fallback.
- **Observability & Infrastructure**:
  - Structured Pino JSON logging with OpenTelemetry span correlation (`traceId`, `spanId`).
  - W3C `Server-Timing` headers on all compilation and audit endpoints.
  - `/api/health` diagnostic probe.
  - Docker containerization with pre-installed LibreOffice and WeasyPrint.
- **Monorepo Test Suite**:
  - 112 automated unit and E2E tests across `@markforge/core`, `markforge` CLI, `@markforge/mcp`, and `@markforge/web`.

### Fixed
- Fixed monorepo import portability by switching from relative paths to canonical package imports (`@markforge/core`).
- Resolved duplicate template dropdown text in Web Studio header.
- Fixed cursor-position insertion for Mermaid flowcharts in editor pane.
- Added automatic tab switching to ATS Audit Scorecard upon clicking audit button.
- Enabled monorepo Hot Module Replacement (HMR) via `transpilePackages: ['@markforge/core']` in `next.config.ts`.
- Pruned redundant shim components and dead registry code.

---

## [Initial Development] - 2026-09-06
- Initial project conceptualization and core prototype.
