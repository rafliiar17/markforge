# Security Policy

MarkForge treats the security of our users and their documents with the highest priority.

## Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within MarkForge (such as command injection during LibreOffice/WeasyPrint shellouts, unsafe AST deserialization, cross-site scripting in HTML generation, or SSRF in preview fetching):

1. **Do NOT report the issue publicly** on GitHub issues, pull requests, or discussions.
2. Submit a report privately via **[GitHub Private Vulnerability Reporting](https://github.com/rafliiar17/markforge/security/advisories/new)**.
3. Or email the maintainer directly at: `rafliiar17@gmail.com` with the subject prefix `[SECURITY] MarkForge Vulnerability`.

### Please Include:
- A clear description of the vulnerability and its potential impact.
- Exact steps to reproduce the issue, including minimal reproducible Markdown content or CLI command.
- The affected component(s): `@markforge/core`, `markforge` (CLI), `@markforge/mcp`, or `@markforge/web`.
- Any suggested fix or remediation steps (if known).

## Our Response Commitment
- **Acknowledgement**: Within 48 hours of initial report.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Disclosure**: Coordinated vulnerability disclosure and patch release within 30 days.

## Security Practices in MarkForge
- **Sandboxing**: Headless LibreOffice conversion utilizes `--headless --invisible --nologo --nodefault --nofirststartwizard` to isolate runtime execution.
- **Input Sanitization**: Markdown AST parsing does not execute embedded scripts, and HTML preview generation escapes raw script tags.
- **Zero Network Egress in Core**: The `@markforge/core` compilation pipeline runs entirely offline and in-memory with zero third-party telemetry or cloud dependencies.
