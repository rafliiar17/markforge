import type { TranslationSchema } from '../types';

export const enTranslations: TranslationSchema = {
  common: {
    appTitle: 'MarkForge',
    tagLine: 'Universal Markdown-to-Document Compilation Engine',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    loading: 'Loading...',
    error: 'Error Occurred',
    success: 'Success',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    version: 'v1.0.0 Open Source',
  },
  header: {
    docType: 'Document Type',
    templateStyle: 'Template Style',
    exportDocx: 'Export DOCX',
    exportPdf: 'Export PDF',
    printBrowser: 'Print / Browser PDF',
    compiling: 'Compiling...',
    mcpServer: 'MCP Server',
    syntaxGuide: 'Syntax Guide',
    langSwitch: 'Switch Language',
    standardTypes: 'Standard Types',
    customTypesGroup: 'Custom Types ({count})',
    addCustomType: '+ Add Custom Type...',
    recommendedStyles: '⭐ Recommended for {type}',
    allStyles: '🌐 All Available Styles',
    otherStyles: '🌐 Other Styles',
    exportPdfTooltip: 'Export high-fidelity 1:1 PDF via Server Engine (LibreOffice / Weasyprint)',
    printBrowserTooltip: 'Print directly or save as PDF via Browser Print',
    mcpTitle: 'Model Context Protocol (MCP) Setup',
    mcpDesc:
      'Connect MarkForge directly into Claude Desktop, Cursor, or Antigravity to convert documents and analyze ATS scores via AI prompts.',
    mcpToolsIncluded: 'AI Tools Included:',
  },
  editor: {
    sourceTitle: 'MARKDOWN SOURCE',
    dropzoneHint: 'Drop any .md or .txt file here',
    formatGuide: 'Format Guide',
    mermaidFlow: 'Mermaid Flow',
    analyzeAts: 'Analyze ATS',
    analyzePortfolio: 'Analyze Portfolio',
    analyzeSpec: 'Analyze Spec',
    analyzing: 'Analyzing...',
    wordsCount: '{count} words',
    placeholder: 'Paste or write your markdown document here...',
    mermaidTemplatesTitle: 'Production Architecture Templates',
    mermaidTemplatesDesc: 'Select a production-grade system pattern to insert into your document:',
  },
  tabs: {
    documentPreview: 'Document Preview',
    auditScorecard: 'Audit Scorecard',
    rawOutput: 'Raw Output',
    parityBadge: 'A4 Canvas 1:1 Parity',
  },
  audit: {
    scoreLabel: 'DOCUMENT COMPLIANCE AUDIT',
    gradeLabel: 'Grade',
    metrics: {
      words: 'Words',
      readingTime: 'Read Time',
      links: 'Links',
      diagrams: 'Diagrams',
      metricPoints: 'Metric Points',
      actionVerbs: 'Action Verbs',
      quantified: 'Quantified',
    },
    checklistTitle: 'Requirements & Compliance Checklist',
    passed: 'Passed',
    failed: 'Needs Improvement',
    recommendationsTitle: 'Suggestions to improve document',
    scoreSummaryExcellent:
      'Excellent! Meets comprehensive document standards and conventions.',
    scoreSummaryGood:
      'Good baseline, but addressing checklist items can significantly elevate impact.',
    scoreSummaryNeedsWork:
      'Needs refinement. Critical sections or recommended elements are missing.',
    pts: '+{weight} pts',
    found: 'Found',
    missing: 'Missing',
  },
  switchDialog: {
    title: 'Switch Document Type',
    currentDoc: 'Current Type',
    targetDoc: 'Target Type',
    loadStarter: 'Load {target} Starter',
    keepText: 'Keep Current Text',
    cancel: 'Cancel',
    description:
      'Choose whether you want to load the official starter template for the new type or preserve your current document content.',
    tip: 'Tip: Choosing "Load Starter" will overwrite the editor with the official starter template. Choosing "Keep Current Text" will preserve all your document content while updating audit rules & styling.',
  },
  customTypeModal: {
    title: 'Manage Custom Document Types',
    subtitle:
      'Define custom document types with tailored audit rules, default templates, and your own starter Markdown.',
    formLabels: {
      name: 'Document Type Name',
      category: 'Category',
      description: 'Brief Description',
      defaultTemplate: 'Default Template',
      starterMarkdown: 'Default Starter Markdown',
      requiredHeadings: 'Required Headings (comma separated)',
      detectLinks: 'Detect External Links',
      detectDiagrams: 'Detect Diagrams (Mermaid / Flowchart)',
      detectMetrics: 'Detect Quantified Metrics & Numbers',
    },
    addHeading: 'Add Heading',
    detectLinks: 'Require at least one external hyperlink',
    detectDiagrams: 'Require at least one Mermaid architecture diagram',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    saveType: 'Save Document Type',
    cancel: 'Cancel',
    deleteType: 'Delete Type',
    successCreated: 'Document type created successfully',
    successUpdated: 'Document type updated successfully',
    validationError: 'Document type name cannot be empty',
  },
  cheatsheet: {
    title: 'Markdown Syntax Guide & Formatting Legend',
    subtitle:
      'Learn how to format resumes, portfolios, and technical specs for pixel-perfect PDF & DOCX export.',
    tabs: {
      links: 'Links & Contact',
      typography: 'Typography & Headings',
      lists: 'Lists & Tables',
      mermaid: 'Mermaid Diagrams',
      tips: 'ATS Score Tips',
    },
    copy: 'Copy Syntax',
    copied: 'Copied!',
    insertToEditor: 'Insert into Editor',
    tipFooter:
      'All syntax above is automatically compiled into high-resolution Word DOCX and PDF elements with precise A4 typography.',
  },
  starters: {
    cv: `# Jane Doe
*Senior Staff Software Engineer*
San Francisco, CA • jane.doe@example.com • +1 (555) 019-2834 • linkedin.com/in/janedoe • github.com/janedoe • janedoe.dev

## Professional Summary
Accomplished distributed systems engineer with 8+ years architecting high-throughput cloud infrastructure serving 60M+ monthly active users. Specialized in high-availability backend microservices, performance optimization, and developer tooling. Spearheaded initiatives cutting cloud expenditures by $180,000 annually.

## Work Experience
### Staff Software Engineer | ApexCloud Technologies
*2022 - Present | San Francisco, CA*
- Architected multi-region event-streaming platform using Go, Kafka, and Redis processing 2.4M msgs/sec with 99.999% uptime.
- Optimized database query caching layers, slashing p99 latency by 45% (from 320ms to 42ms).
- Spearheaded company-wide zero-trust network migration across 140+ Kubernetes microservices.
- Mentored 12 senior and mid-level software engineers across 3 distributed engineering squads.

### Senior Backend Engineer | DataSphere Systems
*2019 - 2022 | Austin, TX*
- Engineered automated CI/CD validation pipelines, decreasing release deployment cycle from 2 weeks to 35 minutes.
- Automated database indexing and migration scripts, saving an estimated 15 engineering hours weekly.
- Built high-performance gRPC gateway serving 15,000 requests/second with sub-10ms latency.

## Education
### B.S. in Computer Science & Engineering | University of California, Berkeley
*2015 - 2019 | GPA: 3.85 / 4.0*

## Technical Skills
- **Languages:** TypeScript, Go, Rust, Python, SQL, C++
- **Cloud & DevOps:** Kubernetes, Docker, AWS, Cloudflare Workers, Terraform, Prometheus
- **Databases & Queues:** PostgreSQL, Redis, Apache Kafka, ClickHouse, SQLite

## Featured Projects
### MarkForge Open Source
- Author and lead maintainer of open-source universal markdown-to-document compilation engine with ATS optimization and Model Context Protocol (MCP) server support.
`,
    portfolio: `# Portfolio: Jane Doe
*Staff Software Engineer & Cloud Systems Architect*
San Francisco, CA • jane.doe@example.com • github.com/janedoe • janedoe.dev

## About Me
Distributed systems engineer passionate about resilient cloud architecture, developer tooling, and high-performance services. Experienced in driving technical vision from initial RFCs to global deployments.

## System Architecture
\`\`\`mermaid
graph TD
  Client[Web / Mobile Clients] --> CDN[Cloudflare Edge CDN]
  CDN --> Gateway[Envoy API Gateway]
  Gateway --> Auth[Auth Service]
  Gateway --> Core[Core Application Engine]
  Core --> Cache[(Redis Cluster)]
  Core --> DB[(PostgreSQL Primary)]
  Core --> Bus[Kafka Event Stream]
  Bus --> AsyncWorkers[Worker Pool]
\`\`\`

## Featured Projects
### 1. MarkForge Universal Compiler
- **Stack:** Next.js 15, TypeScript, Tailwind CSS, Bun, WebAssembly
- Markdown to DOCX/PDF document compilation engine with 1:1 visual parity, real-time live preview, and automated ATS compliance scoring.
- Integrated with Model Context Protocol (MCP) for direct IDE & agent workflows.

### 2. High-Throughput Event Streaming Gateway
- **Stack:** Go, Kafka, Redis, gRPC, Docker, Kubernetes
- Scalable event ingestion gateway processing 2.4 million events per second with sub-5ms p99 latency across multiple cloud regions.

## Core Technical Skills
- **Languages:** TypeScript, Go, Rust, Python, SQL
- **Cloud & DevOps:** Kubernetes, Docker, AWS, Terraform, Prometheus, CI/CD
- **Databases & Messaging:** PostgreSQL, Redis, Apache Kafka, ClickHouse

## Contact & Links
- **Website:** [janedoe.dev](https://janedoe.dev)
- **GitHub:** [github.com/janedoe](https://github.com/janedoe)
- **LinkedIn:** [linkedin.com/in/janedoe](https://linkedin.com/in/janedoe)
- **Email:** [jane.doe@example.com](mailto:jane.doe@example.com)
`,
  },
};
