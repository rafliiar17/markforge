# Contributing to MarkForge

Thank you for your interest in contributing to **MarkForge**! As an open-source project, we welcome contributions of all kinds: bug fixes, new document templates, CLI enhancements, MCP tool extensions, and documentation improvements.

This guide outlines our development workflow, coding standards, and pull request process.

---

## 🏛 Monorepo Architecture

MarkForge is structured as an ultra-fast Bun monorepo:

```
markforge/
├── packages/
│   ├── core/      # AST parser, DOCX & PDF compilers, ATS analyzer, template registry
│   ├── cli/       # Developer CLI (`markforge build`, `watch`, `analyze`, `doctor`)
│   ├── mcp/       # Model Context Protocol (MCP) server for Claude / Cursor / Antigravity
│   └── web/       # Next.js 15 App Router studio with Tailwind & shadcn/ui
├── docs/          # Deep technical documentation (architecture, cli, mcp, templates, i18n)
├── examples/      # Sample ATS resumes, technical specifications, and portfolios
└── .github/       # CI/CD workflows, issue templates, PR template
```

---

## 🛠 Prerequisites & Local Setup

### 1. Requirements
- **Runtime**: [Bun](https://bun.sh) `^1.2` or later (Bun 1.4+ recommended).
- **Node.js**: (Optional) `v20+` or `v22+`.
- **System Engines for PDF Compilation**:
  - **LibreOffice** (`soffice`): Recommended for 1:1 DOCX to PDF visual fidelity.
    - *Arch / CachyOS*: `sudo pacman -S libreoffice-still`
    - *Ubuntu / Debian*: `sudo apt install libreoffice-writer`
    - *macOS*: `brew install --cask libreoffice`
  - **WeasyPrint** (Alternative fallback): `pip install weasyprint`

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/rafliiar17/markforge.git
cd markforge

# Install monorepo dependencies
bun install

# Verify your system rendering engines
bun run packages/cli/src/index.ts doctor
```

---

## 🧪 Testing & Quality Gates

Every pull request must pass the automated quality gate:

```bash
# 1. Run full monorepo test suite (Core, CLI, MCP, Web unit & E2E)
bun test

# 2. Typecheck all packages
bun --cwd packages/core tsc --noEmit
bun --cwd packages/cli tsc --noEmit
bun --cwd packages/mcp tsc --noEmit
bun --cwd packages/web tsc --noEmit

# 3. Verify Web Studio production build
bun run --cwd packages/web build
```

---

## 🌿 Git & SDLC Workflow

We strictly adhere to GitHub Flow SDLC principles:

### 1. Branch Naming Conventions
- `feature/<feature-name>` or `feat/<feature-name>` — New user-facing features or capabilities.
- `fix/<bug-description>` — Bug fixes.
- `chore/<task-description>` — Dependency updates, tooling, configuration, documentation.
- `hotfix/<issue>` — Urgent production fixes.

> ⚠️ **Rule**: Never push directly to `main`. All changes must go through a dedicated branch and Pull Request.

### 2. TDD & Commit Conventions
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(scope): ...` — New capability or feature.
- `fix(scope): ...` — Bug fix.
- `docs(scope): ...` — Documentation only.
- `test(scope): ...` — Unit or E2E tests.
- `refactor(scope): ...` — Code improvement without behavioral change.
- `chore(scope): ...` — Build, config, dependencies.

When practicing TDD (Test-Driven Development):
1. **Red**: Write the failing test first (`test(scope): red — ...`).
2. **Green**: Write the minimal implementation (`wip(scope): green — ...`).
3. **Refactor**: Clean up and optimize (`refactor(scope): ...`).

### 3. Pull Request Process
1. Ensure your branch is rebased on latest `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Run quality checks (`bun test` and typechecks).
3. Open a Pull Request on GitHub using our PR template.
4. Fill in all checklist items, link the relevant issue, and attach screenshots for UI/visual document changes.
5. Once CI passes and maintainer approves, PR will be merged.

---

## 🎨 Coding & Style Guidelines

- **TypeScript**: Strict mode enabled across all packages. Avoid `any`; use well-typed interfaces and generics.
- **UI Components**: In `@markforge/web`, use official **shadcn/ui** components (`Select`, `Dialog`, `Alert`, `Button`, `Input`, `Tabs`). Avoid unstyled native elements.
- **Loading & Performance**: Use shimmer skeleton animations (`animate-shimmer` / `animate-pulse`) for async operations to prevent layout shift.
- **Internationalization**: All user-facing strings in Web Studio must use the `useI18n()` hook with keys in `packages/web/lib/i18n/dictionaries/`.
- **AST Portability**: AST node definitions in `@markforge/core` must remain zero-dependency on browser APIs so they run smoothly in Node.js, Bun, CLI, and MCP.

---

## 💬 Getting Help

- Join [GitHub Discussions](https://github.com/rafliiar17/markforge/discussions) to ask questions or share feedback.
- If you notice a security issue, please read [SECURITY.md](./SECURITY.md).
