<p align="center">
  <img src="https://raw.githubusercontent.com/rafliiar17/markforge/main/packages/web/public/banner.png" alt="MarkForge Banner" width="100%" onerror="this.style.display='none'"/>
</p>

<h1 align="center">⚡ MarkForge</h1>

<p align="center">
  <strong>Universal Markdown to Document (PDF & DOCX) Engine with ATS Optimization, Developer CLI, Web Studio, and Model Context Protocol (MCP) Server.</strong>
</p>

<p align="center">
  <a href="https://github.com/rafliiar17/markforge/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun%201.4-fbf0df.svg" alt="Bun 1.4" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/web-Next.js%2015-black.svg" alt="Next.js 15" /></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/protocol-MCP%20Ready-7c3aed.svg" alt="MCP Ready" /></a>
  <a href="https://ui.shadcn.com"><img src="https://img.shields.io/badge/ui-shadcn%2Fui-000000.svg" alt="shadcn/ui" /></a>
  <a href="https://github.com/rafliiar17/markforge/actions"><img src="https://img.shields.io/badge/CI-passing-emerald.svg" alt="CI Status" /></a>
</p>

---

## 🌟 Why MarkForge?

Transforming Markdown into polished documents usually forces you to choose between messy Word conversions or clunky PDF rendering. **MarkForge** bridges this gap:

- 🎯 **1:1 Visual Parity**: Generates genuine OpenXML (.docx) and high-fidelity PDF documents using the exact same typographic scale and page margins.
- 🤖 **Built-in ATS Auditor**: Parses your markdown AST to calculate ATS parseability scores (0-100), detects high-impact action verbs, counts quantifiable accomplishments, and alerts you to missing standard sections.
- 🎨 **5 Curated Document Presets**:
  - `ats-classic`: Minimalist, zero graphics, 100% parseable by legacy and modern Applicant Tracking Systems.
  - `modern-accent`: Contemporary emerald accents, refined headers, and crisp dividers.
  - `tech-spec`: Engineered for RFCs, architectural blueprints, tables, and code snippets.
  - `academic`: Formal serif typography, numbered sections, and 1-inch margins.
  - `executive`: Polished serif headers with bronze accents for leadership profiles.
- 🔌 **Model Context Protocol (MCP) Server**: Turn Claude Desktop, Cursor, or Antigravity into your document compiler and ATS editor.
- 💻 **Modern Web Studio**: Split-screen live editor, simulated A4 canvas preview, and official **shadcn/ui** components with shimmer skeletons.

---

## 🚀 Quickstart

### 1. Developer CLI

Install globally or run instantly via `bun` / `npx`:

```bash
# Compile a markdown resume into both PDF & DOCX
markforge build resume.md --template ats-classic --format both

# Watch mode for real-time live compilation while writing
markforge watch resume.md --template modern-accent

# Run ATS & document quality audit
markforge analyze resume.md

# Check installed rendering engines on your machine
markforge doctor
```

### 2. Interactive Web Studio

```bash
git clone https://github.com/rafliiar17/markforge.git
cd markforge
bun install
bun dev:web
```

Navigate to `http://localhost:3030` to launch the split-screen live editor with real-time A4 preview.

---

## 🤖 Model Context Protocol (MCP) Setup

MarkForge includes an official MCP server. To enable AI assistants like Claude Desktop, Cursor, or Antigravity to compile documents and audit resumes:

### For Claude Desktop (`claude_desktop_config.json`):

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

### Available AI Tools:
| Tool | Description |
|---|---|
| `convert_markdown` | Compiles markdown text to DOCX, PDF, or HTML with chosen styling |
| `analyze_document` | Audits ATS score, action verbs, quantified metrics, and missing sections |
| `list_templates` | Returns metadata, typography specs, and categories for all templates |
| `get_template_skeleton` | Returns starter markdown templates (ATS Resume, Tech Spec, etc.) |
| `doctor` | Verifies system conversion engines (LibreOffice, Weasyprint, Pandoc) |

---

## 🏗️ Architecture

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

---

## 📦 Monorepo Structure

| Package | Path | Description |
|---|---|---|
| `@markforge/core` | [`packages/core`](./packages/core) | Parser, OpenXML DOCX builder, PDF engine, ATS auditor |
| `markforge` | [`packages/cli`](./packages/cli) | Developer CLI (`build`, `watch`, `analyze`, `doctor`) |
| `@markforge/mcp` | [`packages/mcp`](./packages/mcp) | Model Context Protocol server for AI assistants |
| `@markforge/web` | [`packages/web`](./packages/web) | Next.js 15 studio with Tailwind & shadcn/ui |
| `examples` | [`examples`](./examples) | Real-world ATS resumes and technical documentation |

---

## 🩺 System Requirements & PDF Rendering

MarkForge operates out-of-the-box for DOCX and HTML generation on any system with Node.js or Bun. For PDF generation:

- **Recommended**: **LibreOffice** (`soffice`) for 100% visual parity between DOCX and PDF.
  - Arch/CachyOS: `sudo pacman -S libreoffice-still`
  - Ubuntu/Debian: `sudo apt install libreoffice-writer`
  - macOS: `brew install --cask libreoffice`
- **Fallback**: **Weasyprint** (`pip install weasyprint`) or **Pandoc**.

Run `markforge doctor` at any time to verify your system setup.

---

## 🐳 Docker Deployment

Run the complete MarkForge environment (including LibreOffice and Web Studio) in an isolated container:

```bash
docker-compose up --build
```

Access the studio at `http://localhost:3030`.

---

## 🤝 Contributing

We welcome pull requests! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before submitting.

---

## 📄 License

Distributed under the [MIT License](./LICENSE). Built with ❤️ by [Rafli Arraafi Albaasith](https://github.com/rafliiar17).
