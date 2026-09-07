import { TemplateDefinition, TemplateId, DocumentTypeDefinition } from './types';

export const BUILTIN_TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  'ats-classic': {
    id: 'ats-classic',
    name: 'ATS Classic (Standard)',
    description: 'Ultra-clean single-column layout strictly formatted for 100% Applicant Tracking System parseability.',
    category: 'resume',
    features: ['Zero parsing errors', 'High ATS compliance score', 'Standard bullet glyphs', 'Compact spacing'],
    style: {
      fontPrimary: 'Calibri',
      fontHeading: 'Calibri',
      fontCode: 'Courier New',
      textColor: '1A1A1A',
      headingColor: '000000',
      accentColor: '1155CC',
      borderColor: '000000',
      lineHeight: 260,
      margins: { top: 560, right: 720, bottom: 560, left: 720 },
    },
  },
  'modern-accent': {
    id: 'modern-accent',
    name: 'Modern Emerald',
    description: 'Contemporary tech styling featuring deep emerald accents, refined horizontal dividers, and crisp hierarchy.',
    category: 'resume',
    features: ['Teal/Emerald brand headers', 'Clean metadata rows', 'Modern sans-serif typography', 'Subtle dividers'],
    style: {
      fontPrimary: 'Arial',
      fontHeading: 'Arial',
      fontCode: 'Courier New',
      textColor: '1F2937',
      headingColor: '0F766E',
      accentColor: '0D9488',
      borderColor: '0F766E',
      lineHeight: 280,
      margins: { top: 720, right: 720, bottom: 720, left: 720 },
    },
  },
  'tech-spec': {
    id: 'tech-spec',
    name: 'Technical Architecture & Spec',
    description: 'Ideal for engineering designs, RFCs, architectural blueprints, and open-source documentation.',
    category: 'document',
    features: ['Monospace inline code & blocks', 'Structured data tables', 'Callout blocks', 'Standard technical margins'],
    style: {
      fontPrimary: 'Calibri',
      fontHeading: 'Calibri',
      fontCode: 'Consolas',
      textColor: '0F172A',
      headingColor: '1E293B',
      accentColor: '2563EB',
      borderColor: 'CBD5E1',
      lineHeight: 280,
      margins: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
    },
  },
  'academic': {
    id: 'academic',
    name: 'Academic Paper & Whitepaper',
    description: 'Formal double or single spaced serif typography tailored for academic papers, thesis summaries, and legal briefs.',
    category: 'academic',
    features: ['Times/Georgia serif elegance', 'Formal 1-inch margins', 'Strict academic heading structure', 'Numbered sections'],
    style: {
      fontPrimary: 'Times New Roman',
      fontHeading: 'Times New Roman',
      fontCode: 'Courier New',
      textColor: '000000',
      headingColor: '000000',
      accentColor: '1E3A8A',
      borderColor: '52525B',
      lineHeight: 320,
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    },
  },
  'executive': {
    id: 'executive',
    name: 'Executive & Leadership',
    description: 'Warm, distinguished executive profile with refined serif headings, bronze accents, and balanced whitespace.',
    category: 'report',
    features: ['Executive serif styling', 'Subtle warm bronze accents', 'Polished executive hierarchy', 'Generous whitespace'],
    style: {
      fontPrimary: 'Georgia',
      fontHeading: 'Georgia',
      fontCode: 'Courier New',
      textColor: '18181B',
      headingColor: '27272A',
      accentColor: '92400E',
      borderColor: '71717A',
      lineHeight: 270,
      margins: { top: 720, right: 860, bottom: 720, left: 860 },
    },
  },
};

export function getTemplate(id?: string): TemplateDefinition {
  if (id && id in BUILTIN_TEMPLATES) {
    return BUILTIN_TEMPLATES[id as TemplateId];
  }
  return BUILTIN_TEMPLATES['ats-classic'];
}

export const BUILTIN_DOCUMENT_TYPES: Record<string, DocumentTypeDefinition> = {
  cv: {
    id: 'cv',
    name: 'CV / Professional Resume',
    category: 'resume',
    description: 'Ultra-clean single-column resume strictly structured for 100% Applicant Tracking System (ATS) compliance and executive recruiters.',
    defaultTemplateId: 'ats-classic',
    recommendedTemplateIds: ['ats-classic', 'modern-accent', 'executive'],
    auditRubric: {
      type: 'ats',
      label: 'ATS Resume Compliance Audit',
      requiredHeadings: ['Summary', 'Experience', 'Education', 'Skills'],
      detectMetrics: true,
      minWordCount: 150,
      maxWordCount: 900,
    },
    starterMarkdown: `# Alex Morgan
*Lead Software Architect & Engineering Director*
alex.morgan@example.com | (555) 349-8201 | linkedin.com/in/alexmorgan | github.com/alexmorgan | San Francisco, CA

## Professional Summary
Distinguished engineering leader with 10+ years of experience architecting large-scale distributed systems and guiding high-performing cross-functional teams. Proven track record of modernizing mission-critical infrastructure, reducing cloud operational expenditure by $450,000 annually, and maintaining 99.999% availability for 40M+ active users.

## Work Experience
### Principal Architect | CloudSphere Systems
*2022 - Present | San Francisco, CA*
- Spearheaded the architectural migration of legacy monolith to event-driven microservices, slashing p99 latency by 58%.
- Scaled real-time ingestion pipeline to process 3.5B events daily while cutting compute costs by 32%.
- Mentored and coached 14 senior engineers across distributed systems design, observability, and RFC processes.

### Staff Software Engineer | DataStream Global
*2018 - 2022 | Mountain View, CA*
- Engineered high-throughput distributed caching layer using Redis and Go, achieving 250k req/s throughput.
- Automated multi-region deployment pipelines across AWS and GCP, reducing release cycle duration from 4 days to 25 minutes.
- Championed zero-trust security architecture and automated compliance auditing across 80+ microservices.

## Education
### M.S. in Computer Science | Stanford University
*2016 - 2018*

### B.S. in Computer Engineering | UC Berkeley
*2012 - 2016*

## Technical Skills
- **Languages:** TypeScript, Go, Python, Rust, SQL, C++
- **Cloud & Infrastructure:** AWS, GCP, Docker, Kubernetes, Terraform, Kafka
- **Databases & Caches:** PostgreSQL, Redis, DynamoDB, ClickHouse
- **Practices:** Distributed Systems, Event-Driven Architecture, Microservices, CI/CD, Zero-Trust Security

## Featured Projects
### MarkForge Document Engine
- Architected high-performance markdown publishing engine converting markdown into ATS-optimized DOCX and PDF documents.
- Achieved sub-50ms compile latency and 100% compliance across automated applicant tracking parsers.
`,
  },
  portfolio: {
    id: 'portfolio',
    name: 'Developer & Creative Portfolio',
    category: 'portfolio',
    description: 'Project-centric developer showcase highlighting live demos, system architectures, GitHub repositories, tech stacks, and quantifiable engineering impact.',
    defaultTemplateId: 'modern-accent',
    recommendedTemplateIds: ['modern-accent', 'tech-spec'],
    auditRubric: {
      type: 'portfolio',
      label: 'Developer Portfolio & Project Showcase Audit',
      requiredHeadings: ['Featured Projects', 'Tech Stack', 'About / Contact'],
      detectLinks: true,
      detectMetrics: true,
      minWordCount: 100,
      maxWordCount: 2000,
    },
    starterMarkdown: `# Alex Morgan
*Staff Systems Architect & Creative Technologist*
alex.morgan@example.com | San Francisco, CA | [Portfolio Website](https://alexmorgan.dev) | [GitHub](https://github.com/alexmorgan) | [LinkedIn](https://linkedin.com/in/alexmorgan)

## About / Contact
Staff Systems Engineer and open-source craftsman passionate about developer tooling, high-throughput distributed engines, and modern interactive user experiences. Available for architecture advisory and principal engineering roles.

- **Email:** alex.morgan@example.com
- **GitHub:** [github.com/alexmorgan](https://github.com/alexmorgan)
- **Live Showcase:** [https://alexmorgan.dev](https://alexmorgan.dev)

## Featured Projects

### CloudPulse — Distributed Real-Time Observability Engine
[Live Demo](https://cloudpulse.dev) | [GitHub Repository](https://github.com/alexmorgan/cloudpulse)
*Tech Stack: \`TypeScript\` \`Go\` \`Next.js\` \`ClickHouse\` \`Kafka\` \`Docker\`*

- Architected zero-overhead distributed tracing and metric aggregation pipeline processing **2.4M spans/sec** with sub-**15ms** ingestion latency.
- Implemented real-time anomaly detection engine serving **120,000+ active developers**, reducing mean-time-to-detection (MTTD) by **68%**.
- Slashed storage infrastructure costs by **45%** through custom compression algorithms and ClickHouse columnar storage optimizations.

### MarkForge — Universal Markdown-to-Document Compiler
[Live Demo](https://markforge.dev) | [GitHub Repository](https://github.com/alexmorgan/markforge)
*Tech Stack: \`TypeScript\` \`Bun\` \`React\` \`TailwindCSS\` \`OpenXML\` \`Rust\`*

- Built an extensible document generation engine translating markdown AST into pixel-perfect DOCX and PDF deliverables.
- Designed dynamic ATS and spec quality auditing heuristics yielding a **98%** first-pass parsing success rate across 10+ Applicant Tracking Systems.
- Adopted by **15,000+ engineers**, generating over **250,000 documents** with zero external cloud dependencies.

### HyperCache — In-Memory Multi-Tier Caching Mesh
[Live Demo](https://hypercache.internal.dev) | [GitHub Repository](https://github.com/alexmorgan/hypercache)
*Tech Stack: \`Rust\` \`WebAssembly\` \`Redis\` \`gRPC\`*

- Engineered lock-free concurrent LRU/LFU cache supporting **500,000 ops/sec** per core with predictable p99 latency under **250µs**.
- Integrated WebAssembly filter plugins, reducing downstream database request volume by **82%**.

## Tech Stack
- **Languages:** TypeScript, Rust, Go, Python, SQL
- **Frontend & UI:** React, Next.js, TailwindCSS, WebGL, Radix UI
- **Backend & Data:** Node.js, ClickHouse, PostgreSQL, Redis, Apache Kafka
- **Cloud & DevOps:** AWS, Cloudflare Workers, Docker, Kubernetes, Terraform, GitHub Actions
`,
  },
  'tech-spec': {
    id: 'tech-spec',
    name: 'Technical Spec / RFC',
    category: 'tech-spec',
    description: 'Comprehensive engineering RFC and design document template featuring interactive Mermaid architecture diagrams, API schemas, security invariants, and trade-off rationales.',
    defaultTemplateId: 'tech-spec',
    recommendedTemplateIds: ['tech-spec', 'academic'],
    auditRubric: {
      type: 'tech-spec',
      label: 'Technical Spec & RFC Rigor Audit',
      requiredHeadings: ['Architecture', 'API Design', 'Security', 'Trade-offs'],
      detectDiagrams: true,
      minWordCount: 150,
    },
    starterMarkdown: `# RFC 042: High-Throughput Distributed Event Ingestion Engine
**Author:** Alex Morgan & Core Architecture Team | **Status:** Proposed | **Target Release:** Q4

## Overview & Objectives
This RFC specifies the architecture, data contracts, and operational requirements for next-generation event ingestion at scale. The goal is to sustain 5M events/second ingestion with end-to-end delivery latency under 50ms while ensuring exactly-once processing guarantees and horizontal scalability.

## Architecture & System Design
The ingestion pipeline decouples HTTP producers from durable storage via distributed buffer partitions:

\`\`\`mermaid
graph TD
  Client[Client Applications / SDKs] -->|HTTPS / gRPC| LB[Global Load Balancer]
  LB --> Ingest[Ingestion Gateway Nodes]
  Ingest -->|Batch Publish| Queue[Distributed Log Broker / Kafka]
  Queue --> Worker[Stream Processing Workers]
  Worker --> Cache[(Hot Cache / Redis)]
  Worker --> Storage[(Columnar Warehouse / ClickHouse)]
  Worker --> DLQ[(Dead Letter Queue)]
\`\`\`

### Ingestion Gateway Lifecycle
1. Edge nodes terminate TLS and validate client HMAC bearer tokens.
2. Ingest payload schema validation executes in memory using WebAssembly validators.
3. Payloads are batched into 64KB micro-batches and published to Kafka partition topics.

## API Specification & Contracts

### Ingest Endpoint
\`POST /v1/events/batch\`

\`\`\`typescript
export interface EventBatchRequest {
  producerId: string;
  batchTimestamp: number; // UTC Unix Epoch in milliseconds
  events: Array<{
    eventId: string;
    topic: string;
    payload: Record<string, unknown>;
    priority?: 'low' | 'normal' | 'high';
  }>;
}

export interface EventBatchResponse {
  status: 'accepted' | 'partial' | 'rejected';
  acceptedCount: number;
  rejectedCount: number;
  traceId: string;
  errors?: Array<{ eventId: string; code: string; reason: string }>;
}
\`\`\`

## Security & Privacy Considerations
- **Authentication:** All client requests require asymmetric mTLS or Ed25519 HMAC signatures with nonce deduplication to prevent replay attacks.
- **Data Protection:** Payloads containing PII are encrypted at rest using AES-256-GCM envelope encryption with hardware security module (HSM) managed keys.
- **Audit Logging:** Immutably stream every gateway authorization decision to dedicated audit trails.

## Trade-offs & Alternatives Considered
1. **gRPC vs HTTPS REST:** Selected HTTP/2 + gRPC for internal mesh communication to reduce protocol overhead by 40%, while maintaining an HTTPS REST gateway for public client ease of integration.
2. **Kafka vs Pulsar:** Selected Kafka due to team operational maturity and ClickHouse native sink connector integration, despite Pulsar's tiered storage capabilities.
3. **At-least-once vs Exactly-once:** Implemented idempotent event IDs at consumer workers to guarantee exactly-once semantics without two-phase commit overhead.
`,
  },
  academic: {
    id: 'academic',
    name: 'Academic Paper & Whitepaper',
    category: 'academic',
    description: 'Formal double or single spaced serif typography tailored for academic papers, thesis summaries, scientific research, and legal briefs.',
    defaultTemplateId: 'academic',
    recommendedTemplateIds: ['academic', 'tech-spec'],
    auditRubric: {
      type: 'custom-checklist',
      label: 'Academic Paper Structure Audit',
      requiredHeadings: ['Abstract', 'Introduction', 'Methodology', 'Results', 'References'],
      minWordCount: 150,
    },
    starterMarkdown: `# Comparative Analysis of Distributed Consensus Protocols in Byzantine Environments
**Author:** Dr. Alex Morgan | **Institution:** Department of Computer Science, Advanced Systems Laboratory

## Abstract
Distributed consensus protocols in Byzantine fault-tolerant (BFT) environments must balance message complexity against transaction finality. This paper presents a comparative analysis of Raft, PBFT, and modern DAG-based consensus mechanisms under adversarial network partitions and high validator churn.

## Introduction
Modern decentralized and distributed systems require high-throughput consensus mechanisms capable of maintaining safety and liveness under adversarial conditions. In this paper, we evaluate performance trade-offs across multiple consensus models.

## Methodology & Experimental Design
We evaluated each protocol across a 100-node geographically distributed cluster simulated across three cloud regions. Latency distributions and throughput were measured across injected packet loss scenarios (0% to 25%).

## Results & Empirical Findings
Our findings indicate that DAG-based consensus models achieve 3.4x higher sustained throughput under high latency conditions while maintaining linear message overhead.

## References
1. Lamport, L. (1982). The Byzantine Generals Problem. ACM TOPLAS.
2. Castro, M., & Liskov, B. (2002). Practical Byzantine Fault Tolerance. ACM TOCS.
`,
  },
};

export function getDocumentType(id?: string): DocumentTypeDefinition {
  if (id && id in BUILTIN_DOCUMENT_TYPES) {
    return BUILTIN_DOCUMENT_TYPES[id];
  }
  return BUILTIN_DOCUMENT_TYPES['cv'];
}

export function listDocumentTypes(): DocumentTypeDefinition[] {
  return Object.values(BUILTIN_DOCUMENT_TYPES);
}
