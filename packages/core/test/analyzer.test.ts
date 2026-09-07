import { describe, it, expect } from "bun:test";
import {
  analyzeMarkdownDocument,
  getDocumentType,
  listDocumentTypes,
  BUILTIN_DOCUMENT_TYPES,
  DocumentCategory,
  DocumentTypeDefinition,
  AuditRubricConfig,
  DocumentAuditResult,
} from "../src";

describe("MarkForge Multi-Document Types Registry", () => {
  it("should list all builtin document types including cv, portfolio, and tech-spec", () => {
    const docTypes = listDocumentTypes();
    expect(docTypes.length).toBeGreaterThanOrEqual(3);

    const ids = docTypes.map((d) => d.id);
    expect(ids).toContain("cv");
    expect(ids).toContain("portfolio");
    expect(ids).toContain("tech-spec");
  });

  it("should retrieve specific document types by ID with correct defaults", () => {
    const cv = getDocumentType("cv");
    expect(cv.id).toBe("cv");
    expect(cv.category).toBe("resume");
    expect(cv.defaultTemplateId).toBe("ats-classic");
    expect(cv.recommendedTemplateIds).toContain("ats-classic");
    expect(cv.recommendedTemplateIds).toContain("modern-accent");
    expect(cv.recommendedTemplateIds).toContain("executive");
    expect(cv.auditRubric.type).toBe("ats");
    expect(cv.starterMarkdown).toContain("Alex Morgan");

    const portfolio = getDocumentType("portfolio");
    expect(portfolio.id).toBe("portfolio");
    expect(portfolio.category).toBe("portfolio");
    expect(portfolio.defaultTemplateId).toBe("modern-accent");
    expect(portfolio.recommendedTemplateIds).toContain("modern-accent");
    expect(portfolio.recommendedTemplateIds).toContain("tech-spec");
    expect(portfolio.auditRubric.type).toBe("portfolio");
    expect(portfolio.starterMarkdown).toContain("Featured Projects");
    expect(portfolio.starterMarkdown).toContain("Live Demo");

    const techSpec = getDocumentType("tech-spec");
    expect(techSpec.id).toBe("tech-spec");
    expect(techSpec.category).toBe("tech-spec");
    expect(techSpec.defaultTemplateId).toBe("tech-spec");
    expect(techSpec.recommendedTemplateIds).toContain("tech-spec");
    expect(techSpec.recommendedTemplateIds).toContain("academic");
    expect(techSpec.auditRubric.type).toBe("tech-spec");
    expect(techSpec.starterMarkdown).toContain("```mermaid");
    expect(techSpec.starterMarkdown).toContain("Architecture & System Design");
  });

  it("should fallback to \"cv\" when getDocumentType is called without arguments or unknown ID", () => {
    const defaultDoc = getDocumentType();
    expect(defaultDoc.id).toBe("cv");

    const unknownDoc = getDocumentType("non-existent-type");
    expect(unknownDoc.id).toBe("cv");
  });

  it("should verify BUILTIN_DOCUMENT_TYPES definitions structure", () => {
    for (const [id, def] of Object.entries(BUILTIN_DOCUMENT_TYPES)) {
      expect(def.id).toBe(id);
      expect(def.name).toBeDefined();
      expect(def.description).toBeDefined();
      expect(def.defaultTemplateId).toBeDefined();
      expect(Array.isArray(def.recommendedTemplateIds)).toBe(true);
      expect(def.starterMarkdown.length).toBeGreaterThan(100);
      expect(def.auditRubric).toBeDefined();
      expect(def.auditRubric.type).toBeDefined();
    }
  });
});

describe("ATS / CV Audit Rubric", () => {
  const sampleResume = `# Jane Doe
*Senior Software Engineer*
jane.doe@example.com | (555) 123-4567 | linkedin.com/in/janedoe | github.com/janedoe | New York, NY

## Professional Summary
Spearheaded distributed high-throughput microservices serving 40M+ daily active users, reducing latency by 45% and saving $120,000 annually in cloud expenditure.

## Work Experience
### Staff Software Engineer | CloudScale Inc.
*2021 - Present | New York, NY*
- Spearheaded distributed high-throughput microservices serving 40M+ daily active users.
- Architected event-driven streaming pipeline handling 1.2M events/sec with 99.99% uptime.
- Engineered automated CI/CD deployment workflows, reducing release cycles from 2 weeks to daily.
- Optimized PostgreSQL database queries, slashing p99 latency from 450ms to 32ms.
- Mentored 8 junior and mid-level engineers across 2 cross-functional squads.
- Delivered mission-critical compliance audits yielding $120,000 in operational savings.

## Education
### B.S. in Computer Science | University of Michigan
*2014 - 2018*

## Technical Skills
- TypeScript, Go, Python, Docker, Kubernetes, AWS, PostgreSQL, Redis

## Featured Projects
### MarkForge Engine
- Open-source document engine supporting ATS compliance and custom styling.
`;

  it("should analyze CV with backward-compatible ATS scoring when docTypeId is undefined or \"cv\"", () => {
    const reportDefault = analyzeMarkdownDocument(sampleResume);
    expect(reportDefault.score).toBeGreaterThanOrEqual(80);
    expect(reportDefault.grade).toMatch(/A|A\+/);
    expect(reportDefault.label).toContain("ATS");
    expect(reportDefault.checklist.length).toBeGreaterThanOrEqual(5);
    expect(reportDefault.checklist.every((c) => c.weight > 0)).toBe(true);

    // Backward-compatibility properties
    expect(reportDefault.actionVerbsCount).toBeGreaterThanOrEqual(5);
    expect(reportDefault.actionVerbsFound?.length).toBeGreaterThanOrEqual(5);
    expect(reportDefault.quantifiedMetricsCount).toBeGreaterThanOrEqual(4);
    expect(reportDefault.sections?.length).toBe(5);
    expect(reportDefault.wordCount).toBeGreaterThan(50);
    expect(reportDefault.readingTimeMinutes).toBeGreaterThanOrEqual(1);

    // Explicit cv docTypeId
    const reportExplicit = analyzeMarkdownDocument(sampleResume, "cv");
    expect(reportExplicit.score).toBe(reportDefault.score);
    expect(reportExplicit.grade).toBe(reportDefault.grade);
  });

  it("should detect missing email and sections in incomplete resume", () => {
    const incompleteResume = `# Incomplete Person
## Summary
Software person.

## Education
College degree.
`;
    const report = analyzeMarkdownDocument(incompleteResume, "cv");
    expect(report.score).toBeLessThan(70);
    expect(report.warnings.some((w) => w.includes("No email address detected"))).toBe(true);
    expect(report.warnings.some((w) => w.includes("Missing recommended standard sections"))).toBe(true);
    expect(report.checklist.find((c) => c.title === "Contact Information")?.passed).toBe(false);
  });
});

describe("Portfolio Audit Rubric", () => {
  const fullPortfolio = `# Alex Morgan
*Full-Stack Engineer & Open-Source Creator*
alex.morgan@example.com | [Website](https://alexmorgan.dev) | [GitHub](https://github.com/alexmorgan)

## About / Contact
Systems engineer and open-source builder passionate about high-throughput engines.
Reach out at alex.morgan@example.com or visit https://alexmorgan.dev.

## Featured Projects

### CloudPulse — Distributed Tracing Engine
[Live Demo](https://cloudpulse.dev) | [GitHub Repository](https://github.com/alexmorgan/cloudpulse)
*Tech Stack: TypeScript, Go, ClickHouse, Docker*
- Ingested 2.5M events/sec across 8 distributed nodes with sub-10ms response time.
- Scaled to 100,000+ monthly active developers while slashing query latency by 55%.

### MarkForge Document Engine
[Live Demo](https://markforge.dev) | [GitHub](https://github.com/alexmorgan/markforge)
*Tech Stack: TypeScript, Bun, Next.js, React, TailwindCSS*
- Implemented high-fidelity document generation serving 15,000+ users.
- Increased automated test coverage from 40% to 98%.

## Tech Stack
- TypeScript, Go, Python, React, Next.js, PostgreSQL, Docker, Kubernetes, AWS
`;

  it("should evaluate high-quality developer portfolio with links, metrics, and tech tags", () => {
    const result = analyzeMarkdownDocument(fullPortfolio, "portfolio");

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.grade).toBe("A+");
    expect(result.label).toContain("Portfolio");
    expect(result.metrics.linkCount).toBeGreaterThanOrEqual(2);
    expect(result.metrics.metricPointsCount).toBeGreaterThanOrEqual(2);

    const checklistTitles = result.checklist.map((c) => c.title);
    expect(checklistTitles).toContain("Featured Projects Section");
    expect(checklistTitles).toContain("Tech Stack Section");
    expect(checklistTitles).toContain("About / Contact Section");
    expect(checklistTitles).toContain("Project Links & Repositories");
    expect(checklistTitles).toContain("Quantified Impact Metrics");
    expect(checklistTitles).toContain("Technology Stack Tags");

    // All portfolio checklist items should pass
    const failedItems = result.checklist.filter((c) => !c.passed);
    expect(failedItems.length).toBe(0);
  });

  it("should flag missing links and metrics in bare portfolio", () => {
    const barePortfolio = `# Developer Portfolio
## Featured Projects
### My Project
A web app built with cool tools.

## Tech Stack
TypeScript
`;
    const result = analyzeMarkdownDocument(barePortfolio, "portfolio");

    expect(result.score).toBeLessThan(70);
    expect(result.grade).toMatch(/C|D/);

    const linkItem = result.checklist.find((c) => c.title === "Project Links & Repositories");
    expect(linkItem?.passed).toBe(false);

    const metricsItem = result.checklist.find((c) => c.title === "Quantified Impact Metrics");
    expect(metricsItem?.passed).toBe(false);

    expect(result.warnings.some((w) => w.includes("No project demo or repository links found"))).toBe(true);
    expect(result.suggestions.some((s) => s.includes("Incorporate quantifiable impact metrics"))).toBe(true);
  });
});

describe("Tech-Spec / RFC Audit Rubric", () => {
  const fullTechSpec = `# RFC 101: Distributed Task Queue Architecture
**Author:** Architecture Committee | **Status:** Proposed

## Overview & Objectives
This RFC details the architecture of an event-driven task queue handling 50,000 tasks/second.

## Architecture & System Design
The architecture incorporates an edge proxy, a message broker, and scalable consumers:

\`\`\`mermaid
graph TD
  Client[Web Client] --> Gateway[API Gateway]
  Gateway --> Broker[Kafka Broker]
  Broker --> Consumer[Worker Consumer Pool]
  Consumer --> Storage[(PostgreSQL)]
\`\`\`

## API Design & Contracts
Specifications for task creation:

\`\`\`typescript
export interface TaskPayload {
  taskId: string;
  command: string;
  payload: Record<string, unknown>;
  retryLimit: number;
}
\`\`\`

## Security & Privacy Considerations
All inter-service traffic requires mTLS authentication and AES-256 encrypted storage.

## Trade-offs & Alternatives Considered
1. Kafka vs Redis Streams: Selected Kafka for durable persistence and partition rebalancing.
2. Synchronous RPC vs Asynchronous Events: Chose asynchronous queues to prevent cascading timeouts.
`;

  it("should evaluate complete RFC with Mermaid diagrams, code schemas, and standard sections", () => {
    const result = analyzeMarkdownDocument(fullTechSpec, "tech-spec");

    expect(result.score).toBe(100);
    expect(result.grade).toBe("A+");
    expect(result.label).toContain("Technical Spec");
    expect(result.metrics.diagramCount).toBeGreaterThanOrEqual(1);

    const checklistTitles = result.checklist.map((c) => c.title);
    expect(checklistTitles).toContain("Architecture & System Design Section");
    expect(checklistTitles).toContain("API Design & Contracts Section");
    expect(checklistTitles).toContain("Security & Privacy Considerations Section");
    expect(checklistTitles).toContain("Trade-offs & Alternatives Considered Section");
    expect(checklistTitles).toContain("Architecture Mermaid Diagrams");
    expect(checklistTitles).toContain("Code Snippets & Data Schemas");

    expect(result.checklist.every((c) => c.passed)).toBe(true);
  });

  it("should flag missing Mermaid diagrams and code snippets in incomplete spec", () => {
    const incompleteSpec = `# RFC 001: New Idea
## Architecture & System Design
We will build a simple server.

## API Design & Contracts
Just call the GET endpoint.
`;
    const result = analyzeMarkdownDocument(incompleteSpec, "tech-spec");

    expect(result.score).toBeLessThan(70);
    const diagramItem = result.checklist.find((c) => c.title === "Architecture Mermaid Diagrams");
    expect(diagramItem?.passed).toBe(false);

    const codeItem = result.checklist.find((c) => c.title === "Code Snippets & Data Schemas");
    expect(codeItem?.passed).toBe(false);

    const securityItem = result.checklist.find((c) => c.title === "Security & Privacy Considerations Section");
    expect(securityItem?.passed).toBe(false);

    expect(result.warnings.some((w) => w.includes("No architecture diagrams detected"))).toBe(true);
  });
});

describe("Custom Checklist Rubric", () => {
  it("should enforce custom required headings, link checks, diagram checks, and word limits", () => {
    const customRubric: AuditRubricConfig = {
      type: "custom-checklist",
      label: "Security Advisory Audit",
      requiredHeadings: ["Vulnerability Summary", "Impact Analysis", "Remediation Steps"],
      detectLinks: true,
      detectDiagrams: true,
      minWordCount: 50,
      maxWordCount: 500,
    };

    const validAdvisory = `# Security Advisory CVE-2026-0001

## Vulnerability Summary
A buffer overflow exists in legacy parser module affecting version 1.0.0.
See official CVE database entry at https://nvd.nist.gov/vuln/detail/CVE-2026-0001 for full disclosure.

## Impact Analysis
Allows authenticated remote attackers to execute arbitrary shell commands within worker container boundary.
The impact severity is rated CVSS 9.8 Critical with high network exploitability.

\`\`\`mermaid
sequenceDiagram
  Attacker->>Server: Malicious payload
  Server-->>Attacker: Remote code execution
\`\`\`

## Remediation Steps
Upgrade to version 1.0.1 immediately. Apply configuration patch disabling untrusted inputs.
More details available at https://security.markforge.dev/patches/CVE-2026-0001.
`;

    const result = analyzeMarkdownDocument(validAdvisory, undefined, customRubric);

    expect(result.score).toBe(100);
    expect(result.grade).toBe("A+");
    expect(result.label).toBe("Security Advisory Audit");
    expect(result.checklist.every((c) => c.passed)).toBe(true);

    const titles = result.checklist.map((c) => c.title);
    expect(titles.some((t) => t.includes("Vulnerability Summary"))).toBe(true);
    expect(titles.some((t) => t.includes("Impact Analysis"))).toBe(true);
    expect(titles.some((t) => t.includes("Remediation Steps"))).toBe(true);
    expect(titles).toContain("Links Presence");
    expect(titles).toContain("Diagrams Presence");
    expect(titles.some((t) => t.includes("Minimum Word Count"))).toBe(true);
    expect(titles.some((t) => t.includes("Maximum Word Count"))).toBe(true);
  });

  it("should detect violations of custom rubric constraints", () => {
    const customRubric: AuditRubricConfig = {
      type: "custom-checklist",
      label: "Strict Policy Checklist",
      requiredHeadings: ["Compliance Report", "Executive Sign-off"],
      detectDiagrams: true,
      minWordCount: 100,
    };

    const failingDoc = `# Short Note
This is just a quick message without the required sections.
`;

    const result = analyzeMarkdownDocument(failingDoc, undefined, customRubric);

    expect(result.score).toBeLessThan(50);
    expect(result.grade).toBe("D");
    expect(result.warnings.some((w) => w.includes("Compliance Report"))).toBe(true);
    expect(result.warnings.some((w) => w.includes("Executive Sign-off"))).toBe(true);
    expect(result.warnings.some((w) => w.includes("below minimum requirement"))).toBe(true);
  });
});

describe("Edge Cases and Fallbacks", () => {
  it("should handle empty or null-like markdown gracefully", () => {
    const result = analyzeMarkdownDocument("");
    expect(result).toBeDefined();
    expect(result.score).toBe(0);
    expect(result.grade).toBe("D");
    expect(result.metrics.wordCount).toBe(0);
    expect(result.checklist.length).toBeGreaterThan(0);
  });

  it("should allow custom rubric override even when docTypeId is passed", () => {
    const customRubric: AuditRubricConfig = {
      type: "custom-checklist",
      label: "Custom Override",
      requiredHeadings: ["Custom Header"],
    };

    const doc = `# Custom Header\nSome sample content.`;
    const result = analyzeMarkdownDocument(doc, "cv", customRubric);

    expect(result.label).toBe("Custom Override");
    expect(result.checklist[0].title).toContain("Custom Header");
    expect(result.checklist[0].passed).toBe(true);
  });
});
