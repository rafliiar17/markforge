import { MermaidArchitectureTemplate } from '../types';

export const BUILTIN_MERMAID_TEMPLATES: Record<string, MermaidArchitectureTemplate> = {
  'cloud-microservices': {
    id: 'cloud-microservices',
    name: 'Cloud Microservices & Zero-Trust Ingress',
    category: 'cloud-infrastructure',
    description:
      'Production enterprise cloud architecture with Cloudflare WAF/CDN edge, Envoy API Gateway, JWT auth verification, core microservices mesh, Kafka event broker, PostgreSQL HA cluster, Redis cache, and OpenTelemetry observability.',
    tags: ['Microservices', 'Kubernetes', 'Cloudflare', 'Kafka', 'PostgreSQL', 'Redis', 'OpenTelemetry'],
    diagram: `graph TD
  subgraph Ingress ["🌐 Edge & Security Ingress Layer"]
    Client([💻 Web & Mobile Clients]) -->|HTTPS / TLS 1.3| CDN[Cloudflare CDN & WAF]
    CDN -->|DDoS Shielded Traffic| ALB{{Global Application Load Balancer}}
  end

  subgraph Gateway ["🛡️ API Gateway & Security Boundary"]
    ALB -->|mTLS Ingress| APIGW[/Envoy / Kong API Gateway/]
    APIGW -->|Verify JWT & OIDC| AuthSvc[🔐 Identity & Access Service]
    APIGW -->|Rate Limit Token Bucket| RateLimit[⏱️ Distributed Rate Limiter]
  end

  subgraph Services ["⚡ Core Microservices Mesh"]
    RateLimit -->|Forward Validated| OrderSvc[📦 Order & Checkout Service]
    RateLimit -->|Forward Validated| CatalogSvc[🔍 Catalog & Search Service]
    OrderSvc -->|Publish Domain Events| EventBus([📨 Apache Kafka Event Broker])
  end

  subgraph DataTier ["💾 Persistence & Cache Tier"]
    OrderSvc -->|Read / Write| OrderDB[(🐘 PostgreSQL Primary - WAL Sync)]
    OrderDB -.->|Async Replication| ReadReplica[(🐘 PostgreSQL Read Replica)]
    CatalogSvc -->|Hot Cache Queries| RedisCache[(⚡ Redis In-Memory Cluster)]
    CatalogSvc -->|Read Queries| CatalogDB[(🐘 Catalog DB)]
  end

  subgraph Telemetry ["📊 Observability & Auditing"]
    OrderSvc -.->|OTel Spans & Metrics| Collector[🔭 OpenTelemetry Collector]
    CatalogSvc -.->|OTel Spans & Metrics| Collector
    Collector --> Prometheus[(📈 Prometheus Metrics & Grafana)]
    Collector --> Jaeger[(🕸️ Jaeger Traces)]
  end`,
  },

  'event-driven-cqrs': {
    id: 'event-driven-cqrs',
    name: 'Event-Driven CQRS & Real-Time Ingestion',
    category: 'event-driven',
    description:
      'High-throughput asynchronous stream processing architecture separating write commands from read models with partitioned Kafka topics, stream workers, append-only event store, resilient Dead Letter Queue (DLQ), and cached search projections.',
    tags: ['CQRS', 'Event Sourcing', 'Kafka', 'Elasticsearch', 'Redis', 'Streaming'],
    diagram: `graph LR
  subgraph Ingest ["📤 Event Ingestion Layer"]
    Client[Client Apps / SDKs] -->|POST /events| Gateway[/Ingress Gateway/]
    IoT[IoT Edge Sensors] -->|gRPC Telemetry| Gateway
    Gateway -->|Schema Validation| IngestTopic([📨 Kafka Topic: events.raw])
  end

  subgraph Processing ["⚙️ Stream Processing & CQRS Engine"]
    IngestTopic -->|Consume Batches| Worker[Stream Processing Worker]
    Worker -->|Append Mutated State| EventStore[(🗄️ Event Store / Append-Only Log)]
    Worker -.->|Poison Pill / Retries| DLQ([⚠️ Dead Letter Queue - DLQ])
    Worker -->|Project View State| Projector[Read Model Projector]
  end

  subgraph QuerySide ["🔍 Read Model & Query Optimization Tier"]
    Projector -->|Materialize Search| SearchIndex[(🔎 OpenSearch / Elasticsearch)]
    Projector -->|Warm Hot Keys| RedisRead[(⚡ Redis Read Cache)]
    QueryConsumer[Query Consumer / UI] -->|Fast Read API| ReadAPI[Query API Gateway]
    ReadAPI --> SearchIndex
    ReadAPI --> RedisRead
  end`,
  },

  'hexagonal-architecture': {
    id: 'hexagonal-architecture',
    name: 'Clean Hexagonal Architecture (Ports & Adapters)',
    category: 'software-design',
    description:
      'Domain-Driven Design (DDD) decoupling core business logic from external delivery mechanisms (REST/CLI/GraphQL) and infrastructure drivers (PostgreSQL, Cloudflare R2, Email Services) via explicit interfaces.',
    tags: ['Hexagonal', 'Clean Architecture', 'DDD', 'Inversion of Control', 'Decoupled Design'],
    diagram: `graph TD
  subgraph PrimaryAdapters ["🔌 Inbound / Primary Adapters (Driving)"]
    WebController[REST API Controllers]
    GraphQLResolver[GraphQL Resolvers]
    CLIHarness[MarkForge CLI Harness]
    EventConsumer[Kafka Message Consumer]
  end

  subgraph ApplicationCore ["🛡️ Application & Use Cases"]
    WebController -->|DTO / Command| UseCase[Application Core / Use Cases]
    GraphQLResolver -->|Query / Command| UseCase
    CLIHarness -->|CLI Execution| UseCase
    EventConsumer -->|Async Event| UseCase
    UseCase -->|Enforce Business Rules| DomainServices[Domain Services & Invariants]
  end

  subgraph DomainModel ["💎 Core Domain Layer (Entities & Values)"]
    DomainServices --> Entities[Domain Entities & Aggregates]
    DomainServices --> ValueObjects[Value Objects & Domain Events]
  end

  subgraph SecondaryPorts ["🧩 Outbound / Secondary Ports (Interfaces)"]
    UseCase -.-> DocRepoPort[«interface» DocumentRepository]
    UseCase -.-> StoragePort[«interface» ObjectStorageGateway]
    UseCase -.-> NotifPort[«interface» NotificationService]
  end

  subgraph SecondaryAdapters ["📦 Outbound Adapters (Driven / Infrastructure)"]
    DocRepoPort --> PostgresAdapter[PostgreSQL / Drizzle Adapter]
    StoragePort --> R2Adapter[Cloudflare R2 / S3 Adapter]
    NotifPort --> ResendAdapter[Cloudflare Email / Resend Adapter]
  end`,
  },

  'zero-trust-security': {
    id: 'zero-trust-security',
    name: 'Zero-Trust Security & Identity Mesh',
    category: 'security',
    description:
      'Strict zero-trust enterprise security topology featuring short-lived cryptographic credentials, Policy Enforcement Points (PEP), Open Policy Agent (OPA) decision engine, workload SPIFFE/SPIRE mTLS mesh, and immutable WORM audit trails.',
    tags: ['Zero-Trust', 'mTLS', 'SPIFFE', 'OPA', 'OIDC', 'SIEM', 'Compliance'],
    diagram: `graph TD
  subgraph IdentityEvaluation ["🔐 Identity & Trust Evaluation"]
    User([👤 Enterprise User / Device])
    IdP[Identity Provider / OIDC & SAML]
    User -->|1. Authenticate & MFA| IdP
    IdP -->|2. Issue Short-Lived JWT & Cert| User
  end

  subgraph EdgeEnforcement ["🛡️ Policy Enforcement Point (PEP)"]
    User -->|3. Access Request + Token| EdgePEP[/Cloudflare Zero Trust / Envoy/]
    EdgePEP -->|4. Context Evaluation| OPA[⚖️ Open Policy Agent / PDP]
    PostureCheck[Device Posture & EDR] -.->|Telemetry Signal| OPA
    OPA -->|5. Cryptographic Verdict: ALLOW| EdgePEP
  end

  subgraph SecureWorkloads ["⚡ Isolated Workload Enclaves"]
    EdgePEP -->|6. Verified mTLS Ingress| InternalMesh[SPIFFE / SPIRE Workload Mesh]
    InternalMesh --> BillingService[Core Billing & Payment Engine]
    InternalMesh --> DataVault[Customer Data Vault]
  end

  subgraph AuditLogging ["📜 Non-Repudiation & SIEM Audit"]
    EdgePEP -.->|Signed Audit Records| SIEM[(🔒 SIEM / Immutable Audit Log)]
    InternalMesh -.->|Security Tracing| SIEM
  end`,
  },

  'multi-region-resilience': {
    id: 'multi-region-resilience',
    name: 'Multi-Region High-Availability & Disaster Recovery',
    category: 'resilience',
    description:
      'Fault-tolerant multi-region cloud deployment featuring geo-anycast DNS steering, active-primary Kubernetes compute cluster, warm standby secondary region, and cross-region asynchronous database WAL stream replication.',
    tags: ['Multi-Region', 'Disaster Recovery', 'High Availability', 'Aurora', 'Kubernetes'],
    diagram: `graph TD
  subgraph TrafficSteering ["🌍 Global Anycast Traffic Steering"]
    DNS[Cloudflare Anycast DNS / Geo-Routing]
    DNS -->|Primary Region Health: OK| RegionA
    DNS -.->|Automated Failover on Outage| RegionB
  end

  subgraph RegionA ["🇺🇸 Region 1 - Primary (Active)"]
    ALB1{{Application Load Balancer 1}}
    K8sCluster1[Kubernetes Pods - Primary Mesh]
    AuroraPrimary[(🐘 PostgreSQL Primary - Multi-AZ)]
    ALB1 --> K8sCluster1
    K8sCluster1 --> AuroraPrimary
  end

  subgraph RegionB ["🇪🇺 Region 2 - Secondary (Warm Standby / DR)"]
    ALB2{{Application Load Balancer 2}}
    K8sCluster2[Kubernetes Pods - Standby Mesh]
    AuroraReplica[(🐘 Cross-Region Read Replica)]
    ALB2 --> K8sCluster2
    K8sCluster2 -.-> AuroraReplica
  end

  AuroraPrimary -.->|Cross-Region Asynchronous WAL Stream| AuroraReplica`,
  },

  'standard-flowchart': {
    id: 'standard-flowchart',
    name: 'Production Lifecycle & Decision Logic Flowchart',
    category: 'workflow',
    description:
      'Standard production workflow with explicit state transitions, conditional branching, syntax validation checkpoints, and graceful recovery paths.',
    tags: ['Flowchart', 'Logic', 'Workflow', 'Decisions'],
    diagram: `graph TD
  Start([Mulai Eksekusi]) --> Input[/Terima Dokumen Markdown/]
  Input --> Validate{Validasi Sintaks & AST?}
  Validate -->|Lolos| ParseAST[Parsing Struktur Heading, Paragraf & Tabel]
  Validate -->|Gagal / Error| LogWarning[Tampilkan Peringatan & Pertahankan State]
  ParseAST --> ApplyTheme[Terapkan Styling Templat & Palet Warna]
  ApplyTheme --> RenderOutput[/Ekspor ke Format DOCX, PDF, atau HTML/]
  RenderOutput --> End([Selesai])`,
  },
};

export function listMermaidTemplates(): MermaidArchitectureTemplate[] {
  return Object.values(BUILTIN_MERMAID_TEMPLATES);
}

export function getMermaidTemplate(id: string): MermaidArchitectureTemplate | undefined {
  return BUILTIN_MERMAID_TEMPLATES[id];
}
