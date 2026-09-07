<p align="center">
  <img src="https://raw.githubusercontent.com/rafliiar17/markforge/main/packages/web/public/banner.png" alt="MarkForge Banner" width="100%" onerror="this.style.display='none'"/>
</p>

<h1 align="center">⚡ MarkForge</h1>

<p align="center">
  <strong>Universal Markdown to Document (PDF & OpenXML DOCX) Compiler with ATS Optimization, Developer CLI, Web Studio, and Model Context Protocol (MCP) Server.</strong>
</p>

<p align="center">
  <a href="https://github.com/rafliiar17/markforge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun%201.4-fbf0df.svg" alt="Bun 1.4" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/web-Next.js%2015-black.svg" alt="Next.js 15" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/protocol-MCP%20Ready-7c3aed.svg" alt="MCP Ready" /></a>
  <a href="https://ui.shadcn.com"><img src="https://img.shields.io/badge/ui-shadcn%2Fui-000000.svg" alt="shadcn/ui" /></a>
  <a href="https://mark.arafz.id"><img src="https://img.shields.io/badge/deployed-mark.arafz.id-f38020.svg?logo=cloudflare" alt="Cloudflare Edge" /></a>
  <a href="https://github.com/rafliiar17/markforge/actions"><img src="https://img.shields.io/badge/CI-passing-emerald.svg" alt="CI Status" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/typescript-strict-3178c6.svg" alt="TypeScript Strict" /></a>
</p>

---

## 📑 Table of Contents
- [🌟 Why MarkForge?](#-why-markforge)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🎨 Document Templates & Presets](#-document-templates--presets)
- [🚀 Quickstart](#-quickstart)
  - [1. Developer CLI](#1-developer-cli)
  - [2. Interactive Web Studio](#2-interactive-web-studio)
  - [3. Docker Container](#3-docker-container)
- [🤖 Model Context Protocol (MCP) Setup](#-model-context-protocol-mcp-setup)
- [📖 Deep Documentation](#-deep-documentation)
- [📦 Monorepo Topology](#-monorepo-topology)
- [🧪 Quality Gates & Testing](#-quality-gates--testing)
- [🤝 Contributing & Community](#-contributing--community)
- [📄 License & Author](#-license--author)

---

## 🌟 Why MarkForge?

Writing documents in Markdown is frictionless, but converting them into corporate-ready formats is notoriously painful:
- Pandoc often strips formatting nuances or requires complex LaTeX toolchains.
- Manual word processor exports lead to broken margins, inconsistent fonts, and mangled tables.
- Standard resume templates trigger parsing failures in legacy Applicant Tracking Systems (ATS).

**MarkForge** bridges this gap:
1. **1:1 Visual Parity**: Generates native OpenXML (`.docx`) and print-quality PDF files that share identical typography, margins, and section spacing.
2. **Built-in ATS & Quality Auditor**: Evaluates your markdown AST against recruitment criteria (scores 0-100, action verb density, quantifiable metrics, section completeness).
3. **AI-Native via MCP**: Enables LLMs (Claude Desktop, Cursor, Antigravity) to directly compile, audit, and optimize documents without leaving chat.
4. **Developer-First DX**: Watch mode for instantaneous recompilation, debounced AST evaluation, and structured Pino/OpenTelemetry observability.

---

## ✨ Key Features

- 📄 **Universal Output**: Compile to OpenXML (`.docx`), Headless PDF (via LibreOffice or WeasyPrint), Pure HTML5 with Print CSS, or both simultaneously.
- 🎯 **ATS Optimization Engine**: AST-based parser that calculates ATS parseability, flags missing sections, counts high-impact action verbs (EN/ID), and highlights quantifiable metrics.
- 🎨 **5 Curated Document Presets**:
  - `ats-classic`: Minimalist, zero graphics, 100% parseable by legacy and modern Applicant Tracking Systems.
  - `modern-accent`: Contemporary emerald accents, refined headers, and crisp dividers.
  - `tech-spec`: Engineered for RFCs, architectural blueprints, tables, and code snippets.
  - `academic`: Formal serif typography, numbered sections, and standard 1-inch margins.
  - `executive`: Polished serif headers with bronze accents for leadership profiles.
- 📊 **Native Mermaid Flowcharts**: Transpile ````mermaid```` code blocks into scalable vector SVG diagrams in Web Studio and high-fidelity representations in exports.
- 🌐 **Type-Safe Dual-Language Support**: Complete bilingual interface (Bahasa Indonesia `id` and English `en`) across Web Studio, error messages, and starter templates.
- 🖥️ **Next.js 15 Web Studio**: Split-screen live editor, simulated A4 preview canvas, dashed page-break guides, browser print fallback, and official **shadcn/ui** components.
- 🔌 **Official MCP Server**: Turn Claude Desktop, Cursor IDE, or Antigravity into your document compiler and ATS editor over standard I/O (`stdio`).

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Markdown Input (.md)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   MarkForge Core Engine                     │
│  - AST Parser & Inline Tokenizer                            │
│  - ATS & Quality Analyzer (Scores, Verbs, Metrics)         │
│  - Template Registry (ATS Classic, Modern, Tech Spec...)    │
│  - Structured Pino Logger & OpenTelemetry Spans             │
└──────────────┬────────────────┬─────────────────┬───────────┘
               │                │                 │
               ▼                ▼                 ▼
      ┌────────────────┐ ┌──────────────┐ ┌───────────────┐
      │  OpenXML DOCX  │ │  Pure HTML5  │ │ Headless PDF  │
      │   (docx-js)    │ │ (Print CSS)  │ │ (LibreOffice) │
      └────────────────┘ └──────────────┘ └───────────────┘
               ▲                ▲                 ▲
               └────────────────┼─────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
   ┌─────────┐                                    ┌───────────┐
   │ CLI DX  │                                    │  Web UI   │
   │ (bun)   │                                    │ (Next.js) │
   └─────────┘                                    └───────────┘
                                                        ▲
                                                        │
                                                 ┌─────────────┐
                                                 │ MCP Server  │
                                                 │ (Claude/AI) │
                                                 └─────────────┘
```

> 📖 *For in-depth compiler pipeline specifications, read [System Architecture](docs/architecture.md).*

---

## 🎨 Document Templates & Presets

| Template | Primary Font | Accent | Best For | ATS Compatibility |
|---|---|---|---|:---:|
| `ats-classic` | Arial / Helvetica | Charcoal | Standard Resumes, Applications | ⭐️⭐️⭐️⭐️⭐️ (100%) |
| `modern-accent` | Inter / Calibri | Emerald | Tech Portfolios, Modern CVs | ⭐️⭐️⭐️⭐️ (95%) |
| `tech-spec` | JetBrains Mono / Arial | Indigo | Architecture RFCs, Technical Specs | ⭐️⭐️⭐️⭐️ (N/A) |
| `academic` | Times New Roman | Slate | Research Proposals, Theses | ⭐️⭐️⭐️⭐️ (90%) |
| `executive` | Garamond | Bronze | Senior Leadership Biographies | ⭐️⭐️⭐️⭐️ (92%) |

---

## 🚀 Quickstart

### 1. Developer CLI

Run directly with `bun` or `npx`:

```bash
# Compile markdown into both DOCX & PDF
bun run packages/cli/src/index.ts build resume.md --template ats-classic --format both

# Watch mode for real-time live compilation while editing
bun run packages/cli/src/index.ts watch resume.md --template modern-accent

# Run ATS & document quality audit
bun run packages/cli/src/index.ts analyze resume.md

# Enforce minimum ATS score threshold in CI (exit code 1 if < 85)
bun run packages/cli/src/index.ts analyze resume.md --min-score 85 --json

# Preview formatted markdown directly in terminal via native Bun.markdown
bun run packages/cli/src/index.ts preview resume.md

# Verify local rendering engines
bun run packages/cli/src/index.ts doctor
```

> 📖 *For complete command parameters and flags, read [CLI Documentation](docs/cli.md).*

---

### 2. Interactive Web Studio

🌐 **Live Edge Deployment**: [https://mark.arafz.id](https://mark.arafz.id) *(Global Next.js 15 deployment on Cloudflare Workers)*

Or launch the split-screen web studio locally:

```bash
# Clone the repository
git clone https://github.com/rafliiar17/markforge.git
cd markforge

# Install dependencies
bun install

# Start Next.js development server
bun dev:web
```

Open `http://localhost:3030` to access the studio.

---

### 3. Docker Container

Deploy the complete environment (including pre-configured LibreOffice, WeasyPrint, and Web Studio) in an isolated container:

```bash
docker-compose up --build
```

Access the studio at `http://localhost:3030`.

---

## 🤖 Model Context Protocol (MCP) Setup

Turn your AI assistant into an autonomous document compiler and resume coach.

### Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "markforge": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/markforge/packages/mcp/src/index.ts"]
    }
  }
}
```

### Cursor IDE (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "markforge": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/markforge/packages/mcp/src/index.ts"]
    }
  }
}
```

### Available MCP Tools:
| Tool | Description |
|---|---|
| `convert_markdown` | Compiles markdown text to DOCX, PDF, or HTML with chosen styling |
| `analyze_document` | Audits ATS score, action verbs, quantified metrics, and missing sections |
| `list_templates` | Returns metadata, typography specs, and categories for all templates |
| `get_template_skeleton` | Returns starter markdown templates (ATS Resume, Tech Spec, etc.) |
| `doctor` | Verifies system conversion engines (LibreOffice, WeasyPrint, Pandoc) |

> 📖 *For complete MCP setup guides and sample AI prompts, read [MCP Documentation](docs/mcp.md).*

---

## 📖 Deep Documentation

Explore our comprehensive technical guides:
- [🏛 Architecture & Compiler Pipelines](docs/architecture.md)
- [💻 CLI Command Manual & Flags](docs/cli.md)
- [🤖 Model Context Protocol (MCP) Integration](docs/mcp.md)
- [🎨 Templates & Dynamic Document Types](docs/templates.md)
- [🌐 Internationalization (i18n) Architecture](docs/i18n.md)
- [📝 Markdown Syntax Reference & Cheatsheet](docs/MARKDOWN_CHEATSHEET.md)

---

## 📦 Monorepo Topology

```
markforge/
├── packages/
│   ├── core/      # AST parser, DOCX & PDF compilers, ATS analyzer, Pino logger
│   ├── cli/       # Developer CLI (`markforge build`, `watch`, `analyze`, `doctor`)
│   ├── mcp/       # Model Context Protocol (MCP) server for Claude / Cursor / AI
│   └── web/       # Next.js 15 App Router studio with Tailwind & shadcn/ui
├── docs/          # Deep technical documentation
├── examples/      # Sample ATS resumes, technical specifications, and portfolios
└── .github/       # CI/CD workflows, issue templates, PR template
```

---

## 🧪 Quality Gates & Testing

MarkForge maintains a 100% automated test pass rate across all packages:

```bash
# Run 112 automated unit and E2E tests
bun test

# Typecheck all packages with strict TypeScript
bun --cwd packages/core tsc --noEmit
bun --cwd packages/cli tsc --noEmit
bun --cwd packages/mcp tsc --noEmit
bun --cwd packages/web tsc --noEmit

# Test production Web Studio build
bun run --cwd packages/web build
```

---

## 🤝 Contributing & Community

Contributions are warmly welcome! Please review:
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

---

## 📄 License & Author

Distributed under the [MIT License](LICENSE).  
Engineered with ❤️ by **[Rafli Arraafi Albaasith](https://github.com/rafliiar17)**.
