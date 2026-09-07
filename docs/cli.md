# 💻 MarkForge CLI Documentation

The MarkForge Command-Line Interface (`markforge`) is a high-performance developer tool built on Bun, designed for local document compilation, watch-mode authoring, ATS scoring, and automated CI/CD document pipelines.

---

## 1. Installation

### 1.1. Monorepo Usage (Bun)
From the root of the MarkForge repository:
```bash
bun run packages/cli/src/index.ts <command> [options]
```
Or use the pre-configured package script:
```bash
bun run markforge --help
```

### 1.2. Global Installation
```bash
# Via Bun
bun install -g markforge

# Or via npm
npm install -g markforge
```

---

## 2. Global Options

| Flag | Shorthand | Description | Default |
|---|---|---|---|
| `--help` | `-h` | Display command help and usage syntax | — |
| `--version` | `-v` | Output MarkForge version number | `1.0.0` |

---

## 3. Command Reference

### 3.1. `markforge build`
Compiles a Markdown file into one or more output formats.

```bash
markforge build <file> [options]
```

#### Options:
- `-f, --format <format>`: Output format. Values: `docx`, `pdf`, `html`, `both` (DOCX & PDF). Default: `docx`.
- `-t, --template <name>`: Styling preset. Values: `ats-classic`, `modern-accent`, `tech-spec`, `academic`, `executive`. Default: `ats-classic`.
- `-o, --out <path>`: Output directory or destination file path. Default: `./output`.
- `-e, --engine <engine>`: PDF engine to utilize. Values: `libreoffice`, `weasyprint`, `pandoc`. Default: `libreoffice`.

#### Examples:
```bash
# Compile resume into both ATS-friendly DOCX and PDF
markforge build resume.md --template ats-classic --format both

# Compile technical specification with modern emerald accents
markforge build spec.md --template tech-spec --format pdf --out ./dist

# Compile academic paper into DOCX
markforge build thesis.md --template academic --format docx
```

---

### 3.2. `markforge watch`
Watches a Markdown file for real-time filesystem changes and recompiles automatically with intelligent debouncing.

```bash
markforge watch <file> [options]
```

#### Options:
- `-f, --format <format>`: Output format (`docx`, `pdf`, `html`, `both`). Default: `docx`.
- `-t, --template <name>`: Styling preset (`ats-classic`, `modern-accent`, etc.). Default: `ats-classic`.
- `-o, --out <path>`: Destination directory for compiled files. Default: `./output`.

#### Example:
```bash
# Continuously rebuild resume as you edit in VS Code / Neovim
markforge watch resume.md --template modern-accent --format both
```

---

### 3.3. `markforge analyze`
Runs the AST-based ATS (Applicant Tracking System) scoring algorithm on a Markdown document and outputs an audit scorecard.

```bash
markforge analyze <file> [options]
```

#### Options:
- `--json`: Output full audit scorecard as machine-readable JSON (ideal for CI/CD gates).
- `--min-score <number>`: Minimum required score (0-100). If the document score falls below this threshold, the command exits with code `1`.

#### Output Breakdown:
- **Overall Score**: 0 to 100 rating.
- **Section Completeness**: Checks presence of Summary, Experience, Education, Skills, and Projects.
- **Action Verbs**: Count and list of detected high-impact power verbs.
- **Quantifiable Metrics**: Metrics containing percentages, numbers, KPIs, or monetary amounts.
- **Optimization Suggestions**: Actionable recommendations to improve interview callback rates.

#### Example:
```bash
# Run interactive visual audit
markforge analyze resume.md

# Enforce quality gate in CI pipeline (exit 1 if score < 80)
markforge analyze resume.md --min-score 80 --json
```

---

### 3.4. `markforge doctor`
Diagnoses your local environment and verifies installed rendering engines, dependencies, and PDF capabilities.

```bash
markforge doctor
```

#### Diagnostic Checks:
- **Runtime Version**: Bun or Node.js runtime compatibility.
- **LibreOffice (`soffice`)**: Detects path and version (required for 1:1 DOCX-to-PDF conversion).
- **WeasyPrint**: Detects Python WeasyPrint installation.
- **Pandoc**: Detects Pandoc availability.
- **Font Availability**: Verifies system fonts (Liberation Sans, Times New Roman, Arial).

---

### 3.5. `markforge templates`
Lists all available built-in typography and document presets with descriptions and typographic parameters.

```bash
markforge templates
```

---

## 4. Configuration File (`markforge.config.json`)

You can define project defaults in a `markforge.config.json` file in your repository root:

```json
{
  "$schema": "https://markforge.dev/schema.json",
  "defaultTemplate": "modern-accent",
  "defaultFormat": "both",
  "outputDir": "./dist",
  "pdfEngine": "libreoffice",
  "minAtsScore": 85
}
```

When present, the CLI automatically inherits these settings unless overridden by command-line flags.

---

## 5. CI/CD Pipeline Integration

### GitHub Actions Example:
```yaml
name: Document Quality Gate
on: [push, pull_request]

jobs:
  validate-resume:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - name: Enforce ATS Quality Score >= 85
        run: bun run packages/cli/src/index.ts analyze resume.md --min-score 85
```
