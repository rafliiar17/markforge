---
name: 'Bug Report'
about: 'Report an issue or unexpected behavior in MarkForge'
title: '[BUG] '
labels: ['bug', 'triage']
assignees: ''
---

## 🐛 Bug Description
A clear and concise description of the bug or unexpected behavior encountered.

## 📋 Steps to Reproduce
1. Command run or action taken (e.g. `markforge build resume.md --template modern-accent --format pdf`)
2. Or in Web Studio: [e.g. paste sample markdown and click PDF export]
3. Or in MCP Server: [e.g. invoke `convert_markdown` tool]
4. Error message or unexpected result observed

## 📝 Markdown Snippet to Reproduce
```markdown
# Paste minimal reproducible markdown here
```

## 🎯 Target Format & Engine
- [ ] OpenXML DOCX (`docx-js`)
- [ ] Headless PDF (LibreOffice `soffice`)
- [ ] Fallback PDF (WeasyPrint)
- [ ] Pure HTML5 (`print` CSS)
- [ ] Web Studio Canvas
- [ ] MCP Server Tool

## 💻 Environment & Diagnostics
Run `markforge doctor` and paste the output below:

```text
# Output from `markforge doctor`:
OS: [e.g. Linux Arch/Ubuntu, macOS Sequoia, Windows 11]
Bun / Node Version: [e.g. Bun 1.4.0 / Node 22.x]
LibreOffice Version: [e.g. LibreOffice 24.8.x]
WeasyPrint: [e.g. Installed / Not Installed]
```

## 📸 Screenshots or Artifacts
If applicable, attach screenshots or generated document artifacts illustrating the issue.

## 🔍 Additional Context
Add any other context, such as special characters, custom fonts, or operating system quirks.
