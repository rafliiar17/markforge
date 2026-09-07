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
