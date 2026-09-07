# Contributing to MarkForge

Thank you for your interest in contributing to **MarkForge**! As an open-source project, we welcome contributions of all kinds: bug fixes, new document templates, CLI enhancements, MCP tool extensions, and documentation improvements.

## Repository Architecture

MarkForge is structured as a modular monorepo:

```
markforge/
├── packages/
│   ├── core/      # AST parser, DOCX & PDF compilers, ATS analyzer
│   ├── cli/       # Command-line interface (`markforge`)
│   ├── mcp/       # Model Context Protocol (MCP) server
│   └── web/       # Next.js 15 + Tailwind + shadcn/ui studio
├── examples/      # Sample ATS resumes and technical documents
└── .github/       # CI/CD workflows and issue templates
```

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rafliiar17/markforge.git
   cd markforge
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Verify tests**:
   ```bash
   bun test
   ```

4. **Run development environments**:
   - Web Studio: `bun dev:web` (opens at `http://localhost:3030`)
   - CLI testing: `bun run packages/cli/src/index.ts doctor`
   - MCP Server: `bun run packages/mcp/src/index.ts`

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feat/your-feature-name`.
2. Follow commit message conventions: `feat:`, `fix:`, `docs:`, `perf:`, `test:`.
3. Add unit tests for any new parser rules or compilation features.
4. Ensure `bun test` and `bun run lint` pass.
5. Submit a pull request targeting `main`.
