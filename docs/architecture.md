# 🏛 MarkForge System Architecture

MarkForge is an enterprise-grade document compiler designed for converting standard Markdown into publication-ready OpenXML (`.docx`), print-quality PDF, and semantic HTML5, with built-in Applicant Tracking System (ATS) audit capabilities, developer CLI, Web Studio, and Model Context Protocol (MCP) server for AI assistants.

This document details the architectural design, compilation pipelines, AST parsing, scoring algorithms, and observability models.

---

## 1. High-Level System Overview

```
                          ┌────────────────────────────────┐
                          │     Markdown Document (.md)    │
                          └───────────────┬────────────────┘
                                          │
                                          ▼
             ┌──────────────────────────────────────────────────────────┐
             │                  @markforge/core Engine                  │
             │  ┌──────────────────────┐      ┌──────────────────────┐  │
             │  │ AST Lexer & Parser   │ ───► │ ATS & Quality Scorer │  │
             │  └──────────┬───────────┘      └──────────────────────┘  │
             │             │                                            │
             │             ▼                                            │
             │  ┌────────────────────────────────────────────────────┐  │
             │  │ Template Registry & Styling Rules (5 Presets)      │  │
             │  └──────────────────────┬─────────────────────────────┘  │
             └─────────────────────────┼────────────────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
 ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
 │    OpenXML DOCX      │   │     Pure HTML5       │   │    Headless PDF      │
 │  Compiler (docx-js)  │   │  (Print CSS/Mermaid) │   │  (LibreOffice/Weasy) │
 └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     │                                                                   │
     ▼                                 ▼                                 ▼
┌─────────────┐               ┌─────────────────┐               ┌─────────────────┐
│     CLI     │               │   Next.js 15    │               │   MCP Server    │
│  Developer  │               │   Web Studio    │               │  (Claude, AI)   │
└─────────────┘               └─────────────────┘               └─────────────────┘
```

---

## 2. Monorepo Package Topology

MarkForge is architected as an isolated Bun monorepo, ensuring clear separation of concerns, zero circular dependencies, and high reuse:

| Package | Workspace Path | Target Runtime | Responsibility |
|---|---|---|---|
| `@markforge/core` | `packages/core` | Bun / Node.js / Browser | AST tokenizer, AST parser, DOCX compiler, PDF engine adapter, ATS audit engine, template definitions, structured Pino logger. |
| `markforge` (CLI) | `packages/cli` | Bun / Node.js CLI | Command-line interface (`build`, `watch`, `analyze`, `doctor`, `templates`). |
| `@markforge/mcp` | `packages/mcp` | Stdio JSON-RPC (Bun/Node) | Model Context Protocol server exposing conversion, analysis, and diagnostic tools to AI assistants. |
| `@markforge/web` | `packages/web` | Next.js 15 App Router | Visual document studio with split-screen editor, simulated A4 preview canvas, shadcn/ui components, and i18n support. |

---

## 3. Core Compilation Pipelines

### 3.1. AST Parsing & Inline Tokenization
MarkForge uses a lightweight, resilient recursive-descent parser that transforms raw Markdown into a strongly-typed Abstract Syntax Tree (AST):

- **Block Elements**:
  - Headings (`h1` through `h6`)
  - Paragraphs & Text runs
  - Unordered (`-`, `*`) and Ordered (`1.`) Lists (with nested sub-lists)
  - Blockquotes & Callout boxes (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`)
  - Tables with column alignment (`:---`, `:---:`, `---:`)
  - Code blocks with syntax highlighting language tags
  - Mermaid diagram blocks (````mermaid ... ````)
  - Thematic breaks / Horizontal rules (`---`)
- **Inline Elements**:
  - Bold (`**text**`), Italic (`*text*`), Strikethrough (`~~text~~`)
  - Inline code (`` `code` ``)
  - Hyperlinks (`[text](url)`)
  - Escaped characters and standard markdown entities

### 3.2. OpenXML (.docx) Compiler
Located in `packages/core/src/compiler/docx-compiler.ts`:
- Employs `docx` (OpenXML specification) to generate native `.docx` files readable by Microsoft Word, LibreOffice Writer, and Google Docs.
- **Typographic Scale & Spacing**: Margins (1440 dxa = 1 inch), line-heights, and paragraph spacings are dynamically mapped from the selected `DocumentTemplate`.
- **Tables**: Built using `Table`, `TableRow`, and `TableCell` with explicit column widths, cell padding, and borders matching the template palette.
- **Bullet Lists**: Preserves native Word bullet points and numbered hierarchies rather than plain character simulations.

### 3.3. Headless PDF Compilation
Located in `packages/core/src/compiler/pdf-compiler.ts`:
- **Primary Engine**: Headless **LibreOffice** (`soffice --headless --convert-to pdf`). By converting the generated DOCX directly into PDF via LibreOffice, MarkForge guarantees **100% visual parity** between the DOCX and PDF deliverables.
- **Secondary Engine**: **WeasyPrint** (`weasyprint input.html output.pdf`) for lightweight Linux/serverless environments without LibreOffice.
- **Tertiary Engine**: In-browser Print CSS fallback (`window.print()`) in the Web Studio with `@page { size: A4; margin: 20mm; }` media queries.

### 3.4. Mermaid Diagram Architecture
- In HTML & Web Studio: Mermaid syntax blocks are transpiled into `<div class="mermaid">` elements and rendered via `mermaid.js` into scalable, vector SVG diagrams with theme palettes matched to the document style.
- In DOCX output: Diagrams render clean monospace code block fallbacks with descriptive headers, ensuring formatting stability across all Word processors.

---

## 4. ATS & Document Quality Scoring Engine

Located in `packages/core/src/analyzer/ats-scorer.ts`, the ATS audit engine evaluates documents against recruitment industry standards:

$$\text{Total Score} = \text{Section Completeness} (35\%) + \text{Action Verbs} (25\%) + \text{Quantified Accomplishments} (20\%) + \text{Formatting \& Readability} (20\%)$$

### 4.1. Audit Criteria
1. **Mandatory Sections (35 pts)**:
   - Evaluates presence of standard sections: `Summary / Profil`, `Experience / Pengalaman Kerja`, `Education / Pendidikan`, `Skills / Keahlian`, `Projects / Portofolio`.
2. **Action Verbs Density (25 pts)**:
   - Scans bullet points for high-impact action verbs in both English (*Architected, Spearheaded, Engineered, Orchestrated, Optimized*) and Indonesian (*Merancang, Memimpin, Mengembangkan, Mengoptimalkan*).
3. **Quantifiable Metrics (20 pts)**:
   - Detects numerical achievements, percentages, monetary impact, and KPIs (e.g., `+45%`, `$1.2M`, `500k MAU`, `10x latency reduction`).
4. **Formatting & Parsing Hygiene (20 pts)**:
   - Flags non-parseable structures: multi-column tables, excessive graphics, nested tables, or irregular fonts that cause legacy ATS parsers (Taleo, Workday, Greenhouse) to drop candidate information.

---

## 5. Observability, Telemetry & Logging

Located in `packages/core/src/logger/logger.ts` and integrated across `@markforge/web`:
- **Structured Pino Logger**: JSON output with timestamp, ISO 8601 formatting, error stacks, and execution durations.
- **OpenTelemetry Span Correlation**: Automatically captures or generates `traceId` and `spanId` across compilation requests.
- **W3C Server-Timing Headers**: The Web Studio API routes (`/api/compile/*`, `/api/analyze`) emit `Server-Timing: docx;dur=12.4, pdf;dur=85.2` headers for performance auditing.
- **Health Probes**: Next.js API `/api/health` exposes live engine status (LibreOffice availability, memory footprint, uptime).

---

## 6. Model Context Protocol (MCP) Server Architecture

Located in `packages/mcp/src/index.ts`:
- **Protocol**: JSON-RPC 2.0 over standard I/O (`stdio`).
- **Tool Isolation**: Exposes 5 sandboxed tools to LLMs (Claude Desktop, Cursor, Antigravity):
  1. `convert_markdown`: Transpiles Markdown into DOCX, PDF, or HTML.
  2. `analyze_document`: Runs ATS heuristics and returns structural recommendations.
  3. `list_templates`: Returns styling metadata, font families, and categories.
  4. `get_template_skeleton`: Returns starter templates for various document genres.
  5. `doctor`: Verifies system dependencies and rendering engines.
- **Zero Hallucination Guarantee**: The MCP server validates all inputs against strict schemas, providing actionable error diagnostics back to the AI assistant.
