import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CLI_SRC = path.resolve(__dirname, '../src/index.ts');
const CLI_BIN = path.resolve(__dirname, '../bin/markforge.js');

function runCli(args: string[]) {
  const result = Bun.spawnSync(['bun', 'run', CLI_SRC, ...args], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, NO_COLOR: '1' },
  });
  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

function runBin(args: string[]) {
  const result = Bun.spawnSync(['bun', CLI_BIN, ...args], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, NO_COLOR: '1' },
  });
  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

describe('MarkForge CLI Automated Test Suite', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markforge-cli-test-'));
  });

  afterAll(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('Help and Version Flags', () => {
    it('should display help menu with --help flag', () => {
      const res = runCli(['--help']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('Usage: markforge [options] [command]');
      expect(res.stdout).toContain('Universal Markdown to Document');
      expect(res.stdout).toContain('build');
      expect(res.stdout).toContain('doctor');
      expect(res.stdout).toContain('analyze');
      expect(res.stdout).toContain('templates');
    });

    it('should display help menu with -h flag', () => {
      const res = runCli(['-h']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('Usage: markforge');
      expect(res.stdout).toContain('Commands:');
    });

    it('should output correct version with --version flag', () => {
      const res = runCli(['--version']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout.trim()).toBe('1.0.0');
    });

    it('should output correct version with -V flag', () => {
      const res = runCli(['-V']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout.trim()).toBe('1.0.0');
    });

    it('should execute successfully via the binary entrypoint bin/markforge.js', () => {
      const res = runBin(['--version']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout.trim()).toBe('1.0.0');
    });
  });

  describe('Doctor Diagnostics & Template Detection', () => {
    it('should run markforge doctor and output system rendering engines', () => {
      const res = runCli(['doctor']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('MarkForge Environment Doctor');
      expect(res.stdout).toContain('LibreOffice (soffice)');
      expect(res.stdout).toContain('Weasyprint');
      expect(res.stdout).toContain('Pandoc');
      expect(res.stdout).toContain('Node.js runtime');
      expect(res.stdout).toContain('Bun runtime');
      expect(res.stdout).toContain('Native Bun Markdown (Bun.markdown)');
    });

    it('should verify document templates detection in doctor output', () => {
      const res = runCli(['doctor']);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('Document Templates Detected');
      expect(res.stdout).toContain('ats-classic');
      expect(res.stdout).toContain('modern-accent');
      expect(res.stdout).toContain('tech-spec');
      expect(res.stdout).toContain('academic');
      expect(res.stdout).toContain('executive');
    });

    it('should support markforge doctor --json flag with structured engines and templates', () => {
      const res = runCli(['doctor', '--json']);
      expect(res.exitCode).toBe(0);

      const parsed = JSON.parse(res.stdout);
      expect(parsed).toHaveProperty('engines');
      expect(parsed.engines).toHaveProperty('soffice');
      expect(parsed.engines).toHaveProperty('weasyprint');
      expect(parsed.engines).toHaveProperty('pandoc');
      expect(parsed.engines).toHaveProperty('node');
      expect(parsed.engines).toHaveProperty('bun');
      expect(parsed.engines).toHaveProperty('bunMarkdown');
      expect(typeof parsed.engines.bun).toBe('boolean');
      expect(typeof parsed.engines.bunMarkdown).toBe('boolean');

      expect(parsed).toHaveProperty('templates');
      expect(Array.isArray(parsed.templates)).toBe(true);
      expect(parsed.templates).toContain('ats-classic');
      expect(parsed.templates).toContain('modern-accent');
      expect(parsed.templates).toContain('tech-spec');
      expect(parsed.templates).toContain('academic');
      expect(parsed.templates).toContain('executive');
    });
  });

  describe('Preview Command & Native Bun Markdown Engine', () => {
    it('should preview markdown document in terminal via markforge preview', () => {
      const sampleMd = path.join(tmpDir, 'preview-sample.md');
      fs.writeFileSync(sampleMd, '# Preview Test Document\n\nThis is a **bold** preview test.\n', 'utf8');

      const res = runCli(['preview', sampleMd]);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('MarkForge Terminal Preview: preview-sample.md');
      expect(res.stdout).toContain('Preview Test Document');
    });

    it('should support markforge view alias', () => {
      const sampleMd = path.join(tmpDir, 'view-sample.md');
      fs.writeFileSync(sampleMd, '## Subheading View\n\n- Bullet 1\n- Bullet 2\n', 'utf8');

      const res = runCli(['view', sampleMd]);
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('MarkForge Terminal Preview: view-sample.md');
      expect(res.stdout).toContain('Subheading View');
    });

    it('should exit with error if preview target file does not exist', () => {
      const missingFile = path.join(tmpDir, 'missing-preview.md');
      const res = runCli(['preview', missingFile]);
      expect(res.exitCode).not.toBe(0);
      expect(res.stderr).toContain('File not found');
    });
  });

  describe('Build Command & Markdown Compilation', () => {
    it('should compile markdown document to HTML without throwing', () => {
      const sampleMdPath = path.join(tmpDir, 'sample-cv.md');
      const outDir = path.join(tmpDir, 'build-html-out');

      fs.writeFileSync(
        sampleMdPath,
        `# Alex Morgan
*Lead Systems Architect*
alex.morgan@example.com | San Francisco, CA

## Professional Summary
Accomplished software engineer with 10+ years architecting highly scalable distributed platforms.

## Work Experience
### Principal Architect | CloudScale Inc.
*2022 - Present | San Francisco, CA*
- Spearheaded zero-trust distributed architecture, reducing security surface by 70%.
- Accelerated CI/CD delivery pipeline from 45 minutes to 4 minutes.

## Technical Skills
- **Languages:** TypeScript, Go, Rust, SQL
- **Cloud & DevOps:** Kubernetes, Docker, Terraform
`,
        'utf8'
      );

      const res = runCli(['build', sampleMdPath, '-f', 'html', '-o', outDir]);
      expect(res.exitCode).toBe(0);

      const expectedHtmlFile = path.join(outDir, 'sample-cv.html');
      expect(fs.existsSync(expectedHtmlFile)).toBe(true);

      const htmlContent = fs.readFileSync(expectedHtmlFile, 'utf8');
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('Alex Morgan');
      expect(htmlContent).toContain('Lead Systems Architect');
      expect(htmlContent.toLowerCase()).toContain('professional summary');
      expect(htmlContent.toLowerCase()).toContain('work experience');
      expect(htmlContent.toLowerCase()).toContain('technical skills');
    });

    it('should compile markdown with specific template and produce valid HTML output', () => {
      const techSpecMdPath = path.join(tmpDir, 'tech-spec.md');
      const outDir = path.join(tmpDir, 'build-tech-out');

      fs.writeFileSync(
        techSpecMdPath,
        `# RFC-104: Telemetry Pipeline Architecture
*Status: Approved | Author: Platform Team*

## Abstract
This document specifies the unified event pipeline for MarkForge observability.

## Architecture
\`\`\`mermaid
graph TD
  Client[MarkForge CLI] --> Collector[OTel Agent]
  Collector --> Traceway[Observability Platform]
\`\`\`
`,
        'utf8'
      );

      const res = runCli(['build', techSpecMdPath, '-t', 'tech-spec', '-f', 'html', '-o', outDir]);
      expect(res.exitCode).toBe(0);

      const generatedHtml = path.join(outDir, 'tech-spec.html');
      expect(fs.existsSync(generatedHtml)).toBe(true);
      const content = fs.readFileSync(generatedHtml, 'utf8');
      expect(content).toContain('RFC-104: Telemetry Pipeline Architecture');
      expect(content).toContain('mermaid');
    });

    it('should return machine-readable JSON when --json flag is passed to build', () => {
      const samplePath = path.join(tmpDir, 'json-build.md');
      fs.writeFileSync(samplePath, '# Minimal Test\n\nTesting CLI JSON output.\n', 'utf8');

      const outDir = path.join(tmpDir, 'json-out');
      const res = runCli(['build', samplePath, '-f', 'html', '-o', outDir, '--json']);
      expect(res.exitCode).toBe(0);

      const json = JSON.parse(res.stdout);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.files)).toBe(true);
      expect(json.files.length).toBeGreaterThan(0);
      expect(json.files[0].format).toBe('html');
      expect(fs.existsSync(json.files[0].path)).toBe(true);
      expect(json.telemetry).toBeDefined();
      expect(json.telemetry.templateId).toBe('ats-classic');
    });

    it('should exit with non-zero code if input file does not exist', () => {
      const nonExistent = path.join(tmpDir, 'does-not-exist.md');
      const res = runCli(['build', nonExistent, '-f', 'html']);
      expect(res.exitCode).not.toBe(0);
      expect(res.stderr).toContain('Input file not found');
    });
  });
});
