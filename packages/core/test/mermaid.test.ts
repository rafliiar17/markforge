import { describe, it, expect } from 'bun:test';
import {
  listMermaidTemplates,
  getMermaidTemplate,
  BUILTIN_MERMAID_TEMPLATES,
  compileMarkdownToHtml,
  compileMarkdownToDocx,
  parseMarkdownToAST,
} from '../src';

describe('Mermaid Architecture Production Templates', () => {
  it('should list all built-in production architecture templates', () => {
    const templates = listMermaidTemplates();
    expect(templates.length).toBe(6);

    const ids = templates.map((t) => t.id);
    expect(ids).toContain('cloud-microservices');
    expect(ids).toContain('event-driven-cqrs');
    expect(ids).toContain('hexagonal-architecture');
    expect(ids).toContain('zero-trust-security');
    expect(ids).toContain('multi-region-resilience');
    expect(ids).toContain('standard-flowchart');
  });

  it('should retrieve individual templates by ID with full metadata', () => {
    const cloud = getMermaidTemplate('cloud-microservices');
    expect(cloud).toBeDefined();
    expect(cloud?.name).toBe('Cloud Microservices & Zero-Trust Ingress');
    expect(cloud?.category).toBe('cloud-infrastructure');
    expect(cloud?.tags).toContain('Microservices');
    expect(cloud?.tags).toContain('Kafka');
    expect(cloud?.tags).toContain('PostgreSQL');
    expect(cloud?.diagram).toContain('subgraph Ingress');
    expect(cloud?.diagram).toContain('subgraph Services');

    const cqrs = getMermaidTemplate('event-driven-cqrs');
    expect(cqrs).toBeDefined();
    expect(cqrs?.category).toBe('event-driven');
    expect(cqrs?.diagram).toContain('graph LR');
    expect(cqrs?.diagram).toContain('subgraph Ingest');
    expect(cqrs?.diagram).toContain('DLQ');

    const hex = getMermaidTemplate('hexagonal-architecture');
    expect(hex).toBeDefined();
    expect(hex?.category).toBe('software-design');
    expect(hex?.diagram).toContain('PrimaryAdapters');
    expect(hex?.diagram).toContain('SecondaryPorts');

    const sec = getMermaidTemplate('zero-trust-security');
    expect(sec).toBeDefined();
    expect(sec?.category).toBe('security');
    expect(sec?.diagram).toContain('EdgeEnforcement');
    expect(sec?.diagram).toContain('OPA');

    const mr = getMermaidTemplate('multi-region-resilience');
    expect(mr).toBeDefined();
    expect(mr?.category).toBe('resilience');
    expect(mr?.diagram).toContain('RegionA');
    expect(mr?.diagram).toContain('RegionB');

    const wf = getMermaidTemplate('standard-flowchart');
    expect(wf).toBeDefined();
    expect(wf?.category).toBe('workflow');
  });

  it('should return undefined for non-existent template ID', () => {
    expect(getMermaidTemplate('invalid-id')).toBeUndefined();
  });

  it('should parse markdown AST containing production Mermaid diagrams correctly', () => {
    const cloudTmpl = BUILTIN_MERMAID_TEMPLATES['cloud-microservices'];
    const markdown = `# Architecture RFC\n\n\`\`\`mermaid\n${cloudTmpl.diagram}\n\`\`\`\n`;

    const nodes = parseMarkdownToAST(markdown);
    const codeBlock = nodes.find((n) => n.type === 'code_block');
    expect(codeBlock).toBeDefined();
    expect(codeBlock?.language).toBe('mermaid');
    expect(codeBlock?.text).toContain('subgraph Ingress');
    expect(codeBlock?.text).toContain('Cloudflare CDN');
  });

  it('should compile production architecture diagrams to HTML with mermaid classes', () => {
    const cloudTmpl = BUILTIN_MERMAID_TEMPLATES['cloud-microservices'];
    const markdown = `# System Blueprint\n\n\`\`\`mermaid\n${cloudTmpl.diagram}\n\`\`\`\n`;

    const html = compileMarkdownToHtml(markdown, 'tech-spec');
    expect(html).toContain('class="doc-mermaid-container"');
    expect(html).toContain('class="mermaid"');
    expect(html).toContain('Cloudflare CDN & WAF');
  });

  it('should compile production architecture diagrams to DOCX callouts without throwing', async () => {
    const hexTmpl = BUILTIN_MERMAID_TEMPLATES['hexagonal-architecture'];
    const markdown = `# Clean Architecture Spec\n\n\`\`\`mermaid\n${hexTmpl.diagram}\n\`\`\`\n`;

    const docxResult = await compileMarkdownToDocx(markdown, 'tech-spec');
    expect(docxResult).toBeInstanceOf(Buffer);
    expect(docxResult.length).toBeGreaterThan(1000);
  });
});

