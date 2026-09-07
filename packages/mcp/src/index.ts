import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import {
  compileMarkdownToDocx,
  compileMarkdownToPdf,
  compileMarkdownToHtml,
  analyzeMarkdownDocument,
  checkSystemEngines,
  BUILTIN_TEMPLATES,
  getTemplate,
  TemplateId,
} from '../../core/src';

const server = new Server(
  {
    name: 'markforge-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// ─── Tools Definition ────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'convert_markdown',
        description:
          'Convert Markdown text into professionally styled DOCX, PDF, or HTML documents with ATS compliance and customizable templates.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown: {
              type: 'string',
              description: 'The raw Markdown content to compile',
            },
            template: {
              type: 'string',
              description:
                'Template style: "ats-classic", "modern-accent", "tech-spec", "academic", or "executive" (default: "ats-classic")',
              enum: ['ats-classic', 'modern-accent', 'tech-spec', 'academic', 'executive'],
            },
            format: {
              type: 'string',
              description: 'Target format: "docx", "pdf", "html", or "both" (default: "both")',
              enum: ['docx', 'pdf', 'html', 'both'],
            },
            outputPath: {
              type: 'string',
              description: 'Optional file path or directory to save the output file(s) on disk',
            },
          },
          required: ['markdown'],
        },
      },
      {
        name: 'analyze_document',
        description:
          'Audit a markdown resume or document for ATS score, power action verbs, quantifiable metrics, and section structure.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown: {
              type: 'string',
              description: 'The markdown text to analyze',
            },
          },
          required: ['markdown'],
        },
      },
      {
        name: 'list_templates',
        description: 'Get details about all available MarkForge document templates and their design specifications.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_template_skeleton',
        description: 'Retrieve a ready-to-use markdown starter template for resumes, RFCs, or academic papers.',
        inputSchema: {
          type: 'object',
          properties: {
            template: {
              type: 'string',
              description: 'Template identifier',
              enum: ['ats-classic', 'modern-accent', 'tech-spec', 'academic', 'executive'],
            },
          },
          required: ['template'],
        },
      },
      {
        name: 'doctor',
        description: 'Check available system rendering engines (LibreOffice, Weasyprint, Pandoc) on the host.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// ─── Tool Call Handler ──────────────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'convert_markdown': {
        const markdown = String(args?.markdown || '');
        const template = String(args?.template || 'ats-classic');
        const format = String(args?.format || 'both');
        const outputPath = args?.outputPath ? String(args.outputPath) : undefined;

        const results: any = {
          template,
          format,
          files: {},
        };

        if (['docx', 'both'].includes(format)) {
          const docxBuf = await compileMarkdownToDocx(markdown, { template });
          results.files.docx = {
            sizeBytes: docxBuf.length,
            base64Length: docxBuf.toString('base64').length,
          };
          if (outputPath) {
            const out = outputPath.endsWith('.docx') ? outputPath : path.join(outputPath, 'document.docx');
            fs.mkdirSync(path.dirname(out), { recursive: true });
            fs.writeFileSync(out, docxBuf);
            results.files.docx.savedPath = out;
          }
        }

        if (['pdf', 'both'].includes(format)) {
          const pdfRes = await compileMarkdownToPdf(markdown, { template });
          results.files.pdf = {
            sizeBytes: pdfRes.sizeBytes,
            engineUsed: pdfRes.engineUsed,
          };
          if (outputPath) {
            const out = outputPath.endsWith('.pdf') ? outputPath : path.join(outputPath, 'document.pdf');
            fs.mkdirSync(path.dirname(out), { recursive: true });
            fs.writeFileSync(out, pdfRes.buffer);
            results.files.pdf.savedPath = out;
          }
        }

        if (format === 'html') {
          const html = compileMarkdownToHtml(markdown, { template });
          results.files.html = { length: html.length };
          if (outputPath) {
            const out = outputPath.endsWith('.html') ? outputPath : path.join(outputPath, 'document.html');
            fs.mkdirSync(path.dirname(out), { recursive: true });
            fs.writeFileSync(out, html, 'utf8');
            results.files.html.savedPath = out;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'analyze_document': {
        const markdown = String(args?.markdown || '');
        const report = analyzeMarkdownDocument(markdown);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(report, null, 2),
            },
          ],
        };
      }

      case 'list_templates': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(BUILTIN_TEMPLATES, null, 2),
            },
          ],
        };
      }

      case 'get_template_skeleton': {
        const tId = String(args?.template || 'ats-classic') as TemplateId;
        const template = getTemplate(tId);

        let skeleton = `# Full Name\n*Professional Title / Specialization*\nemail@example.com | +1 (555) 000-0000 | linkedin.com/in/profile | City, State\n\n## Professional Summary\nA targeted 3-4 line summary highlighting major achievements, scale handled, and domain mastery.\n\n## Work Experience\n### Senior Engineer | HighGrowth Inc.\n*2022 - Present | City, State*\n- Spearheaded architectural redesign of core data pipeline, reducing p99 latency by 35%.\n- Engineered fault-tolerant queue consumer in TypeScript/Go processing 10M+ events/day.\n\n### Software Engineer | ScaleCorp\n*2019 - 2022 | City, State*\n- Automated regression testing suite, decreasing release deployment cycle from 3 days to 2 hours.\n- Collaborated with 5 engineers to deliver multi-tenant API gateway.\n\n## Education\n### B.S. Computer Science | Top University\n*2015 - 2019*\n\n## Technical Skills\n- **Languages:** TypeScript, Go, Python, SQL\n- **Tools & Platforms:** Docker, Kubernetes, AWS, PostgreSQL, Redis, Git\n`;

        if (tId === 'tech-spec') {
          skeleton = `# RFC-001: Architecture Specification\n*Author: Engineering Team | Status: Draft | Date: 2026-09-07*\n\n## 1. Problem Statement & Context\nDescribe the business or engineering challenge being addressed.\n\n## 2. Proposed Architecture & Design\nDetailed breakdown of components, interfaces, and state flows.\n\n| Service | Language | Latency SLA |\n|---|---|---|\n| Ingestion API | Go | < 20ms |\n| Worker Engine | TypeScript | Async |\n\n## 3. Implementation Plan & Milestones\n- Phase 1: MVP Core Pipeline\n- Phase 2: Observability & Load Testing\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: skeleton,
            },
          ],
        };
      }

      case 'doctor': {
        const engines = checkSystemEngines();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(engines, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error: ${error.message}` }],
    };
  }
});

// ─── Resources ──────────────────────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = Object.keys(BUILTIN_TEMPLATES).map((id) => ({
    uri: `markforge://templates/${id}`,
    name: BUILTIN_TEMPLATES[id as TemplateId].name,
    description: BUILTIN_TEMPLATES[id as TemplateId].description,
    mimeType: 'text/markdown',
  }));

  return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^markforge:\/\/templates\/(.+)$/);
  if (!match) throw new Error(`Resource not found: ${uri}`);

  const templateId = match[1] as TemplateId;
  const t = getTemplate(templateId);

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(t, null, 2),
      },
    ],
  };
});

// ─── Prompts ────────────────────────────────────────────────────────────────
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'optimize_ats_resume',
        description: 'Optimize user raw resume markdown for maximum ATS compatibility, action verbs, and quantifiable impact.',
      },
      {
        name: 'generate_tech_spec',
        description: 'Generate an RFC / Technical Specification in MarkForge format.',
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;
  if (name === 'optimize_ats_resume') {
    return {
      description: 'Optimize resume for ATS compatibility and impactful metrics.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Please review and enhance my markdown resume for ATS compliance. Ensure standard headings (Summary, Experience, Education, Skills, Projects), start bullet points with power action verbs (e.g. Spearheaded, Engineered, Automated), and include quantifiable metrics (% improvements, scale, savings).',
          },
        },
      ],
    };
  }

  throw new Error(`Prompt not found: ${name}`);
});

// ─── Start Server Transport ─────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MarkForge MCP Server error:', err);
  process.exit(1);
});
