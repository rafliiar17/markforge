## 📌 Summary of Changes
Provide a clear and concise description of the motivation, changes made, and impact.

Fixes #(issue number)

## 📦 Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 🎨 Template / Style update
- [ ] ⚡ Performance improvement
- [ ] ♻️ Refactoring / Code cleanup
- [ ] 📖 Documentation update
- [ ] 🤖 MCP Server enhancement
- [ ] 🧪 Test suite additions

## 🧱 Affected Monorepo Packages
- [ ] `@markforge/core`
- [ ] `markforge` (CLI)
- [ ] `@markforge/mcp` (MCP Server)
- [ ] `@markforge/web` (Next.js Studio)
- [ ] Documentation / Config / CI

## 🧪 Testing Performed
Describe the manual and automated tests conducted:
- [ ] `bun test` passed (100% test pass rate across monorepo)
- [ ] `bun --cwd packages/core tsc --noEmit` passed
- [ ] `bun --cwd packages/web tsc --noEmit` passed
- [ ] Verified CLI conversion (`markforge build ...`)
- [ ] Verified Web Studio in browser / E2E
- [ ] Verified MCP tools invocation (if MCP changes were made)

## 📸 Screenshots or Output Diffs (if applicable)
Attach before/after screenshots, PDF/DOCX preview diffs, or terminal outputs.

## ✅ Contributor Checklist
- [ ] My code adheres to the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented complex or non-obvious algorithms
- [ ] I have updated the corresponding documentation (`docs/`)
- [ ] My changes generate no new TypeScript errors or lint warnings
- [ ] New and existing tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
