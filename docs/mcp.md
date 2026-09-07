# 🤖 MarkForge Model Context Protocol (MCP) Server

The MarkForge MCP Server implements the open **Model Context Protocol (MCP)** specification, turning AI assistants such as **Claude Desktop**, **Cursor IDE**, and **Antigravity** into document compilers, resume auditors, and technical writers.

---

## 1. Quick Setup & Configuration

### 1.1. Claude Desktop
Add MarkForge to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "markforge": {
      "command": "bun",
      "args": [
        "run",
        "/absolute/path/to/markforge/packages/mcp/src/index.ts"
      ]
    }
  }
}
```

### 1.2. Cursor IDE
Add to `.cursor/mcp.json` or your user settings:

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

### 1.3. Google Antigravity
Add to `~/.gemini/antigravity-cli/mcp/markforge/mcp.json` or your workspace settings:

```json
{
  "command": "bun",
  "args": ["run", "/absolute/path/to/markforge/packages/mcp/src/index.ts"],
  "env": {
    "LOG_LEVEL": "info"
  }
}
```

---

## 2. Available MCP Tools Catalog

The MarkForge MCP server exposes 5 specialized tools over `stdio`:

### 2.1. `convert_markdown`
Compiles a Markdown string into a physical OpenXML DOCX, PDF, or HTML document on disk.

#### Input Schema:
```json
{
  "type": "object",
  "properties": {
    "markdown": {
      "type": "string",
      "description": "The Markdown source text to compile"
    },
    "format": {
      "type": "string",
      "enum": ["docx", "pdf", "html", "both"],
      "default": "docx",
      "description": "Target output document format"
    },
    "template": {
      "type": "string",
      "enum": ["ats-classic", "modern-accent", "tech-spec", "academic", "executive"],
      "default": "ats-classic",
      "description": "Typographic style preset to apply"
    },
    "outputPath": {
      "type": "string",
      "description": "Optional absolute path for the generated file"
    }
  },
  "required": ["markdown"]
}
```

#### Output:
Returns the path to the generated document file(s) and execution telemetry.

---

### 2.2. `analyze_document`
Evaluates a Markdown document against ATS (Applicant Tracking System) criteria and technical writing standards.

#### Input Schema:
```json
{
  "type": "object",
  "properties": {
    "markdown": {
      "type": "string",
      "description": "The Markdown text of the resume or document to evaluate"
    }
  },
  "required": ["markdown"]
}
```

#### Output Schema:
```json
{
  "overallScore": 88,
  "breakdown": {
    "sectionScore": 35,
    "actionVerbScore": 25,
    "quantifiedMetricScore": 15,
    "formattingScore": 13
  },
  "detectedSections": ["Summary", "Experience", "Education", "Skills", "Projects"],
  "missingSections": [],
  "actionVerbs": ["Architected", "Spearheaded", "Optimized", "Engineered"],
  "quantifiedMetrics": ["+40%", "$1.5M", "100k daily active users"],
  "recommendations": [
    "Add quantifiable metrics to bullet points in your Education or Projects section."
  ]
}
```

---

### 2.3. `list_templates`
Returns metadata, font configurations, line-heights, and color schemes for all available document templates.

#### Input Schema:
*No parameters required.*

#### Output:
Array of template objects containing:
- `id`: Template identifier (e.g. `ats-classic`).
- `name`: Display name.
- `description`: Target use cases.
- `typography`: Font family, font sizes, margins, accent colors.

---

### 2.4. `get_template_skeleton`
Retrieves pre-formatted starter markdown templates for resumes, technical specifications, and portfolios.

#### Input Schema:
```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["cv", "portfolio", "tech-spec", "general"],
      "default": "cv",
      "description": "Document category to retrieve skeleton for"
    }
  }
}
```

---

### 2.5. `doctor`
Performs an environment health check, testing LibreOffice, WeasyPrint, and Pandoc installations.

#### Input Schema:
*No parameters required.*

---

## 3. Sample AI Prompts

Once configured, you can interact naturally with your AI assistant:

### Example 1: Resume Optimization
> **User**: *"Audit my resume in `resume.md`. If the ATS score is below 85, suggest improvements, rewrite the bullet points to include strong action verbs, and compile it to an ATS-friendly PDF using the `ats-classic` template."*

### Example 2: Technical Architecture Spec
> **User**: *"Write a technical specification for our new payment gateway microservice, include a Mermaid flowchart showing the payment retry lifecycle, and compile it to DOCX using the `tech-spec` template."*
