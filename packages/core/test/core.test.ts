import { describe, it, expect } from 'bun:test';
import {
  parseMarkdownToAST,
  compileMarkdownToDocx,
  compileMarkdownToHtml,
  analyzeMarkdownDocument,
  checkSystemEngines,
  getTemplate,
  BUILTIN_TEMPLATES,
  loggerRegistry,
  createLogger,
  generateTraceId,
  extractASTStats,
  formatServerTiming,
  templateRegistry,
  withSpan,
} from '../src';
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';

const SAMPLE_MD = `# Jane Doe
*Senior Staff Software Engineer*
jane.doe@example.com | (555) 123-4567 | linkedin.com/in/janedoe | github.com/janedoe | New York, NY

## Professional Summary
Spearheaded high-throughput distributed systems serving 50M+ daily active users. Architected microservices yielding a 40% reduction in latency and $120,000 annual cloud savings.

## Work Experience
### Staff Software Engineer | CloudScale Inc.
*2021 - Present | New York, NY*
- Engineered event-driven streaming pipeline handling 1.2M events/sec with 99.99% uptime.
- Optimized PostgreSQL database queries, slashing p99 latency from 450ms to 32ms.
- Mentored 8 junior and mid-level engineers across 2 cross-functional squads.

### Senior Backend Engineer | DataCorp
*2018 - 2021 | San Francisco, CA*
- Automated CI/CD deployment workflows, reducing release cycles from 2 weeks to daily.
- Built real-time analytics dashboards using Next.js, Node.js, and Redis.

## Education
### B.S. in Computer Science | University of Michigan
*2014 - 2018*

## Technical Skills
- **Languages:** TypeScript, Go, Python, SQL, Rust
- **Technologies:** Next.js, Docker, Kubernetes, AWS, PostgreSQL, Redis

## Featured Projects
### MarkForge
- Open-source markdown-to-document engine supporting ATS compliance and custom themes.
`;

describe('MarkForge Core', () => {
  it('should parse markdown AST correctly', () => {
    const nodes = parseMarkdownToAST(SAMPLE_MD);
    expect(nodes.length).toBeGreaterThan(5);

    const h1 = nodes.find((n) => n.type === 'h1');
    expect(h1).toBeDefined();
    expect(h1?.text).toBe('Jane Doe');

    const subtitle = nodes.find((n) => n.type === 'subtitle');
    expect(subtitle).toBeDefined();
    expect(subtitle?.text).toBe('Senior Staff Software Engineer');

    const contactBar = nodes.find((n) => n.type === 'contact_bar');
    expect(contactBar).toBeDefined();

    const h2s = nodes.filter((n) => n.type === 'h2');
    expect(h2s.length).toBeGreaterThanOrEqual(4);
  });

  it('should list and retrieve templates', () => {
    expect(Object.keys(BUILTIN_TEMPLATES)).toContain('ats-classic');
    expect(Object.keys(BUILTIN_TEMPLATES)).toContain('modern-accent');
    const template = getTemplate('modern-accent');
    expect(template.id).toBe('modern-accent');
    expect(template.style.headingColor).toBe('0F766E');
  });

  it('should compile markdown to DOCX buffer', async () => {
    const buffer = await compileMarkdownToDocx(SAMPLE_MD, { template: 'ats-classic' });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(4000);
  });

  it('should compile markdown to HTML with print styles', () => {
    const html = compileMarkdownToHtml(SAMPLE_MD, { template: 'modern-accent' });
    expect(html).toContain('Jane Doe');
    expect(html).toContain('doc-contact-bar');
    expect(html).toContain('#0F766E');
  });

  it('should compile mermaid code blocks into mermaid diagram elements', () => {
    const mdWithMermaid = `\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\``;
    const html = compileMarkdownToHtml(mdWithMermaid);
    expect(html).toContain('<div class="mermaid">');
    expect(html).toContain('graph TD');
  });

  it('should analyze ATS score and metrics', () => {
    const report = analyzeMarkdownDocument(SAMPLE_MD);
    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.grade).toMatch(/A|A\+/);
    expect(report.actionVerbsCount).toBeGreaterThanOrEqual(5);
    expect(report.quantifiedMetricsCount).toBeGreaterThanOrEqual(4);
    expect(report.sections.find((s) => s.section === 'Work Experience')?.found).toBe(true);
  });

  it('should detect system engines', () => {
    const engines = checkSystemEngines();
    expect(typeof engines.soffice).toBe('boolean');
    expect(typeof engines.pandoc).toBe('boolean');
  });
});

describe('Logging, Telemetry & Registry', () => {
  it('should support Pino structured logger and OpenTelemetry withSpan', async () => {
    const logger = createLogger('test:pino');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');

    loggerRegistry.setLevel('debug');
    expect(loggerRegistry.getLevel()).toBe('debug');
    loggerRegistry.setLevel('info');

    const result = await withSpan('test.span', { 'test.attr': 'markforge' }, (span) => {
      expect(span).toBeDefined();
      return 'otel-success';
    });

    expect(result).toBe('otel-success');
  });

  it('should generate W3C traceId and compute telemetry metrics', () => {
    const traceId = generateTraceId();
    expect(traceId).toHaveLength(32);
    expect(typeof traceId).toBe('string');

    const nodes = parseMarkdownToAST(SAMPLE_MD);
    const stats = extractASTStats(nodes);
    expect(stats.totalNodes).toBeGreaterThan(5);
    expect(stats.headings).toBeGreaterThanOrEqual(4);

    const timing = formatServerTiming({ parseTimeMs: 1.2, docxTimeMs: 35.4, totalTimeMs: 36.6 });
    expect(timing).toContain('parse;dur=1.2');
    expect(timing).toContain('docx;dur=35.4');
  });

  it('should support dynamic template registration', () => {
    templateRegistry.register({
      id: 'custom-template' as any,
      name: 'Custom User Template',
      description: 'Test custom template',
      category: 'document',
      features: ['custom'],
      style: {
        fontPrimary: 'Arial',
        textColor: '000000',
        headingColor: '000000',
        accentColor: 'FF0000',
        borderColor: 'CCCCCC',
        lineHeight: 240,
        margins: { top: 500, right: 500, bottom: 500, left: 500 },
      },
    });

    const custom = templateRegistry.get('custom-template');
    expect(custom).toBeDefined();
    expect(custom.name).toBe('Custom User Template');
    expect(templateRegistry.has('custom-template')).toBe(true);
  });
});

describe('Mermaid Diagram Architecture & Compilation', () => {
  function readDocxXml(buffer: Buffer): string {
    const tmpPath = `/tmp/test-docx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.docx`;
    try {
      writeFileSync(tmpPath, buffer);
      return execSync(`unzip -p ${tmpPath} word/document.xml`).toString('utf-8');
    } finally {
      try {
        unlinkSync(tmpPath);
      } catch {
        // ignore cleanup error
      }
    }
  }

  describe('Flowcharts (graph TD / graph LR)', () => {
    it('should parse flowchart code blocks into AST with mermaid language', () => {
      const md = `\`\`\`mermaid
graph TD
  A[Client] --> B[API Gateway]
  B --> C[Microservice]
\`\`\``;
      const nodes = parseMarkdownToAST(md);
      expect(nodes.length).toBe(1);
      expect(nodes[0].type).toBe('code_block');
      expect(nodes[0].language).toBe('mermaid');
      expect(nodes[0].text).toContain('graph TD');
      expect(nodes[0].text).toContain('A[Client] --> B[API Gateway]');
    });

    it('should compile top-down flowchart (graph TD) to HTML with responsive container and styles', () => {
      const md = `\`\`\`mermaid
graph TD
  Start([Start Process]) --> Step1[Validate Input]
  Step1 --> Decision{Valid?}
  Decision -- Yes --> Finish([Complete])
  Decision -- No --> Error([Return 400])
\`\`\``;
      const html = compileMarkdownToHtml(md, { template: 'tech-spec' });
      expect(html).toContain('<div class="doc-mermaid-container"><div class="mermaid">');
      expect(html).toContain('graph TD');
      expect(html).toContain('Validate Input');
      expect(html).toContain('.doc-mermaid-container {');
      expect(html).toContain('.mermaid {');
      expect(html).toContain('overflow-x: auto;');
      expect(html).toContain('break-inside: avoid;');
    });

    it('should compile left-to-right flowchart (graph LR) to HTML with responsive container', () => {
      const md = `\`\`\`mermaid
graph LR
  Client[Web Client] --> CDN[Cloudflare CDN] --> Origin[Application Server]
\`\`\``;
      const html = compileMarkdownToHtml(md);
      expect(html).toContain('<div class="doc-mermaid-container"><div class="mermaid">');
      expect(html).toContain('graph LR');
      expect(html).toContain('Web Client');
      expect(html).toContain('Cloudflare CDN');
    });
  });

  describe('Sequence Diagrams (sequenceDiagram)', () => {
    it('should compile sequence diagram to HTML container properly wrapped', () => {
      const md = `\`\`\`mermaid
sequenceDiagram
  autonumber
  actor User
  participant Web as Frontend UI
  participant Core as MarkForge Core
  User->>Web: Click "Compile"
  Web->>Core: compileMarkdownToHtml(md)
  Core-->>Web: Return HTML
  Web-->>User: Display Document Preview
\`\`\``;
      const html = compileMarkdownToHtml(md, { template: 'modern-accent' });
      expect(html).toContain('<div class="doc-mermaid-container"><div class="mermaid">');
      expect(html).toContain('sequenceDiagram');
      expect(html).toContain('Frontend UI');
      expect(html).toContain('MarkForge Core');
      expect(html).toContain('Display Document Preview');
    });

    it('should handle case-insensitive and trimmed mermaid code block tags', () => {
      const md = `\`\`\`Mermaid
sequenceDiagram
  Alice->>Bob: Hello
\`\`\``;
      const html = compileMarkdownToHtml(md);
      expect(html).toContain('<div class="doc-mermaid-container"><div class="mermaid">');
      expect(html).toContain('sequenceDiagram');
      expect(html).toContain('Alice->>Bob: Hello');
    });
  });

  describe('DOCX Compilation with Mermaid Blocks', () => {
    it('should format flowchart into an architectural callout block with [Mermaid Flowchart] language tag', async () => {
      const md = `# System Architecture
Here is the system workflow:

\`\`\`mermaid
graph TD
  A[Client Request] --> B[API Gateway]
  B --> C[Auth Handler]
  C --> D[Document Engine]
\`\`\`

The workflow completes synchronously.`;

      const buffer = await compileMarkdownToDocx(md, { template: 'tech-spec' });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(4000);

      const xml = readDocxXml(buffer);
      expect(xml).toContain('[Mermaid Flowchart]');
      expect(xml).toContain('graph TD');
      expect(xml).toContain('Client Request');
      expect(xml).toContain('API Gateway');
      expect(xml).toContain('Document Engine');
      // Verify callout table borders and shading
      expect(xml).toContain('w:tbl');
      expect(xml).toContain('F8FAFC');
    });

    it('should format sequence diagram into an architectural callout block in DOCX', async () => {
      const md = `\`\`\`mermaid
sequenceDiagram
  actor Client
  participant Server
  Client->>Server: POST /documents
  Server-->>Client: 201 Created
\`\`\``;

      const buffer = await compileMarkdownToDocx(md, { template: 'modern-accent' });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(4000);

      const xml = readDocxXml(buffer);
      expect(xml).toContain('[Mermaid Flowchart]');
      expect(xml).toContain('sequenceDiagram');
      expect(xml).toContain('POST /documents');
      expect(xml).toContain('201 Created');
    });

    it('should preserve both regular code blocks and mermaid callout blocks in the same document', async () => {
      const md = `# Hybrid Document

Standard code snippet:
\`\`\`typescript
export const greeting = "Hello World";
\`\`\`

Architecture diagram:
\`\`\`mermaid
graph LR
  Input --> Output
\`\`\`
`;

      const html = compileMarkdownToHtml(md);
      expect(html).toContain('<pre class="doc-code-block"><code>export const greeting = "Hello World";</code></pre>');
      expect(html).toContain('<div class="doc-mermaid-container"><div class="mermaid">graph LR');

      const docx = await compileMarkdownToDocx(md);
      expect(docx).toBeInstanceOf(Buffer);
      const xml = readDocxXml(docx);
      expect(xml).toContain('[Mermaid Flowchart]');
      expect(xml).toContain('greeting');
      expect(xml).toContain('graph LR');
    });
  });
});

