import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createMcpServer } from '../src/index';

describe('MarkForge MCP Server Automated Test Suite', () => {
  let client: Client;
  let serverTransport: any;
  let clientTransport: any;

  beforeAll(async () => {
    const server = createMcpServer();
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client(
      {
        name: 'test-mcp-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  describe('Tool Registration', () => {
    it('should register required tools: convert_markdown, analyze_document, list_templates, doctor', async () => {
      const response = await client.listTools();
      expect(response.tools).toBeDefined();
      expect(Array.isArray(response.tools)).toBe(true);

      const toolNames = response.tools.map((t) => t.name);
      expect(toolNames).toContain('convert_markdown');
      expect(toolNames).toContain('analyze_document');
      expect(toolNames).toContain('list_templates');
      expect(toolNames).toContain('doctor');
      expect(toolNames).toContain('get_template_skeleton');
    });

    it('should provide schema descriptions and required properties for tools', async () => {
      const response = await client.listTools();
      const convertTool = response.tools.find((t) => t.name === 'convert_markdown');
      expect(convertTool).toBeDefined();
      expect(convertTool?.inputSchema.properties).toHaveProperty('markdown');
      expect(convertTool?.inputSchema.properties).toHaveProperty('template');
      expect(convertTool?.inputSchema.properties).toHaveProperty('format');

      const analyzeTool = response.tools.find((t) => t.name === 'analyze_document');
      expect(analyzeTool).toBeDefined();
      expect(analyzeTool?.inputSchema.properties).toHaveProperty('markdown');
    });
  });

  describe('convert_markdown Tool Logic', () => {
    it('should compile sample markdown to HTML format successfully', async () => {
      const sampleMarkdown = `# John Doe
*Staff Platform Engineer*
john.doe@example.com

## Summary
Experienced engineer specialized in distributed systems and cloud architecture.

## Experience
- Designed event-driven messaging layer with 99.99% availability.
`;

      const result = await client.callTool({
        name: 'convert_markdown',
        arguments: {
          markdown: sampleMarkdown,
          format: 'html',
          template: 'ats-classic',
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);

      const payload = JSON.parse((result.content as any)[0].text);
      expect(payload.template).toBe('ats-classic');
      expect(payload.format).toBe('html');
      expect(payload.files).toBeDefined();
      expect(payload.files.html).toBeDefined();
      expect(payload.files.html.length).toBeGreaterThan(0);
    });

    it('should compile sample markdown to DOCX format and return byte telemetry', async () => {
      const sampleMarkdown = `# Jane Smith
*Principal Architect*

## Experience
- Spearheaded modern microservices migration saving $120k annually.
`;

      const result = await client.callTool({
        name: 'convert_markdown',
        arguments: {
          markdown: sampleMarkdown,
          format: 'docx',
          template: 'modern-accent',
        },
      });

      expect(result.isError).toBeFalsy();
      const payload = JSON.parse((result.content as any)[0].text);
      expect(payload.template).toBe('modern-accent');
      expect(payload.format).toBe('docx');
      expect(payload.files.docx).toBeDefined();
      expect(payload.files.docx.sizeBytes).toBeGreaterThan(100);
      expect(payload.files.docx.base64Length).toBeGreaterThan(0);
    });
  });

  describe('analyze_document Tool Logic', () => {
    it('should audit resume markdown and return ATS score and checklist', async () => {
      const resumeMarkdown = `# Robert Davis
*Senior Software Engineer*
robert@example.com | San Francisco, CA

## Summary
Accomplished distributed systems engineer with 8+ years experience.

## Experience
### TechCorp Inc.
- Spearheaded database optimization reducing response times by 50%.
- Engineered distributed cache serving 100k requests/second.

## Education
B.S. Computer Science

## Skills
- Go, TypeScript, Docker, Kubernetes
`;

      const result = await client.callTool({
        name: 'analyze_document',
        arguments: {
          markdown: resumeMarkdown,
        },
      });

      expect(result.isError).toBeFalsy();
      const report = JSON.parse((result.content as any)[0].text);

      expect(typeof report.score).toBe('number');
      expect(report.score).toBeGreaterThan(0);
      expect(typeof report.grade).toBe('string');
      expect(typeof report.wordCount).toBe('number');
      expect(report.wordCount).toBeGreaterThan(10);

      // Verify checklist of sections
      expect(report).toHaveProperty('sections');
      expect(Array.isArray(report.sections)).toBe(true);
      expect(report.sections.length).toBeGreaterThan(0);

      // Every item in the checklist must specify section name and boolean found status
      for (const item of report.sections) {
        expect(typeof item.section).toBe('string');
        expect(typeof item.found).toBe('boolean');
        expect(typeof item.weight).toBe('number');
      }

      // Check action verbs and metrics detection
      expect(typeof report.actionVerbsCount).toBe('number');
      expect(report.actionVerbsCount).toBeGreaterThanOrEqual(1);
      expect(typeof report.quantifiedMetricsCount).toBe('number');
    });

    it('should return warnings and suggestions for incomplete document', async () => {
      const incompleteMarkdown = `Bare minimal note with no clear sections or contact.`;

      const result = await client.callTool({
        name: 'analyze_document',
        arguments: {
          markdown: incompleteMarkdown,
        },
      });

      expect(result.isError).toBeFalsy();
      const report = JSON.parse((result.content as any)[0].text);
      expect(report.score).toBeLessThan(70);
      expect(Array.isArray(report.warnings)).toBe(true);
      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Doctor & Template Discovery Tools', () => {
    it('should return system engines via doctor tool', async () => {
      const result = await client.callTool({
        name: 'doctor',
        arguments: {},
      });

      expect(result.isError).toBeFalsy();
      const engines = JSON.parse((result.content as any)[0].text);
      expect(typeof engines.bun).toBe('boolean');
      expect(typeof engines.node).toBe('boolean');
      expect(typeof engines.soffice).toBe('boolean');
    });

    it('should list all available document templates via list_templates tool', async () => {
      const result = await client.callTool({
        name: 'list_templates',
        arguments: {},
      });

      expect(result.isError).toBeFalsy();
      const templates = JSON.parse((result.content as any)[0].text);
      expect(templates).toHaveProperty('ats-classic');
      expect(templates).toHaveProperty('modern-accent');
      expect(templates).toHaveProperty('tech-spec');
      expect(templates).toHaveProperty('academic');
      expect(templates).toHaveProperty('executive');
    });
  });
});
