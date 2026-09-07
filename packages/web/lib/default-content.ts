export const DEFAULT_MARKDOWN = `# Jane Doe
*Senior Staff Software Engineer*
jane.doe@example.com | +1 (555) 019-2834 | linkedin.com/in/janedoe | github.com/janedoe | San Francisco, CA

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
`;

export const MERMAID_SNIPPET = `\n\n## System Flow & Architecture
\`\`\`mermaid
graph TD
  A[Markdown Input] --> B[MarkForge Engine]
  B --> C{Output Format?}
  C -->|DOCX| D[OpenXML Document]
  C -->|PDF| E[LibreOffice / Weasyprint]
  C -->|Web| F[Live Studio + Mermaid SVG]
  D --> G[Download .docx]
  E --> H[Download .pdf]
\`\`\`\n`;
