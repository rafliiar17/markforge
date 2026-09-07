import {
  AuditRubricConfig,
  DocumentAuditResult,
  DocumentAuditChecklistItem,
  ATSSectionCheck,
} from './types';
import { BUILTIN_DOCUMENT_TYPES } from './templates';
import { parseMarkdownToAST } from './parser';

const POWER_ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'analyzed', 'architected',
  'automated', 'boosted', 'built', 'centralized', 'championed',
  'collaborated', 'consolidated', 'constructed', 'converted', 'cut',
  'decreased', 'delivered', 'deployed', 'designed', 'developed',
  'devised', 'doubled', 'drove', 'engineered', 'enhanced',
  'established', 'executed', 'expanded', 'expedited', 'facilitated',
  'formulated', 'generated', 'governed', 'guided', 'implemented',
  'improved', 'increased', 'initiated', 'innovated', 'installed',
  'instituted', 'integrated', 'introduced', 'invented', 'launched',
  'lead', 'led', 'maintained', 'managed', 'maximized',
  'mentored', 'migrated', 'minimized', 'modernized', 'negotiated',
  'orchestrated', 'overhauled', 'oversaw', 'partnered', 'pioneered',
  'planned', 'produced', 'programmed', 'projected', 'published',
  'rebuilt', 'recruited', 'redesigned', 'reduced', 'refactored',
  'remodeled', 'reorganized', 'replaced', 'resolved', 'restructured',
  'revamped', 'revitalized', 'saved', 'scaled', 'scheduled',
  'secured', 'simplified', 'slashed', 'solved', 'spearheaded',
  'standardized', 'streamlined', 'strengthened', 'supervised', 'surpassed',
  'tested', 'trained', 'transformed', 'troubleshot', 'unified',
  'upgraded', 'validated', 'yielded'
];

const STANDARD_SECTIONS = [
  { name: 'Summary / Profile', regex: /(summary|profile|about\s*me|objective)/i, weight: 15 },
  { name: 'Work Experience', regex: /(experience|employment|work\s*history|career)/i, weight: 30 },
  { name: 'Education', regex: /(education|academic|qualifications|degrees)/i, weight: 15 },
  { name: 'Skills', regex: /(skills|competencies|technical\s*skills|tech\s*stack)/i, weight: 20 },
  { name: 'Projects / Achievements', regex: /(projects|portfolio|achievements|certifications)/i, weight: 10 },
];

const TECH_KEYWORDS = [
  'typescript', 'javascript', 'python', 'go', 'golang', 'rust', 'java', 'c++', 'c#',
  'react', 'next.js', 'vue', 'angular', 'svelte', 'node', 'node.js', 'bun',
  'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'cloudflare',
  'postgresql', 'postgres', 'mysql', 'redis', 'mongodb', 'clickhouse', 'sqlite', 'dynamodb',
  'kafka', 'graphql', 'rest', 'grpc', 'tailwind', 'tailwindcss', 'openxml',
  'webassembly', 'wasm', 'terraform', 'ci/cd', 'git', 'github actions'
];

export function analyzeMarkdownDocument(
  markdown: string,
  docTypeId?: string,
  customRubric?: AuditRubricConfig
): DocumentAuditResult {
  const nodes = parseMarkdownToAST(markdown || '');
  const textContent = (markdown || '').replace(/[#*`_\[\]()\-+|]/g, ' ');
  const words = textContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Find Action Verbs
  const lowerWords = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ''));
  const foundVerbsSet = new Set<string>();
  for (const w of lowerWords) {
    if (POWER_ACTION_VERBS.includes(w)) {
      foundVerbsSet.add(w);
    }
  }
  const actionVerbsFound = Array.from(foundVerbsSet);
  const actionVerbsCount = actionVerbsFound.length;

  // Quantified metrics (e.g. 25%, $50K, 10x, 500ms, 99.9%, 10,000)
  const metricRegex = /(\b\d+([.,]\d+)?\s*(%|\$|x|ms|s|k|m|users|requests|req\/s|tps|clients|pts)?\b|\$\d+)/gi;
  const metricsMatches = (markdown || '').match(metricRegex) || [];
  const quantifiedMetricsCount = metricsMatches.length;

  // Detect Links (markdown links [text](url), raw URLs, github.com links)
  const rawUrlMatches = (markdown || '').match(/https?:\/\/[^\s\)\],]+/gi) || [];
  const mdLinkMatches = (markdown || '').match(/\[([^\]]+)\]\(([^)]+)\)/gi) || [];
  const distinctLinks = new Set<string>([...rawUrlMatches, ...mdLinkMatches]);
  const linkCount = distinctLinks.size;

  // Detect Diagrams (Mermaid code blocks in AST or markdown source)
  const mermaidBlockRegex = /```mermaid[\s\S]*?```/gi;
  const mermaidRawMatches = (markdown || '').match(mermaidBlockRegex) || [];
  const mermaidAstNodes = nodes.filter(
    (n) =>
      n.type === 'code_block' &&
      (n.language?.toLowerCase() === 'mermaid' ||
        /^\s*(graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|flowchart|architecture)/m.test(
          n.text || ''
        ))
  );
  const diagramCount = Math.max(mermaidRawMatches.length, mermaidAstNodes.length);

  // Detect Code Snippets / Schemas (non-mermaid code blocks)
  const codeSnippetNodes = nodes.filter(
    (n) => n.type === 'code_block' && n.language?.toLowerCase() !== 'mermaid'
  );
  const codeSnippetCount = codeSnippetNodes.length;

  // Detect Tech Stack Keywords
  const lowerMarkdown = (markdown || '').toLowerCase();
  const detectedTechs = new Set<string>();
  for (const kw of TECH_KEYWORDS) {
    const kwEscaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const kwRegex = new RegExp(`(\\b|[\`\\[])${kwEscaped}(\\b|[\`\\]])`, 'i');
    if (kwRegex.test(lowerMarkdown)) {
      detectedTechs.add(kw);
    }
  }
  const techStackCount = detectedTechs.size;

  // Extract all AST header texts
  const allHeaders = nodes
    .filter((n) => n.type === 'h1' || n.type === 'h2' || n.type === 'h3' || n.type === 'h4')
    .map((n) => (n.text || '').toLowerCase());

  // Determine effective rubric
  let effectiveRubric: AuditRubricConfig;
  if (customRubric) {
    effectiveRubric = customRubric;
  } else if (docTypeId && BUILTIN_DOCUMENT_TYPES[docTypeId]) {
    effectiveRubric = BUILTIN_DOCUMENT_TYPES[docTypeId].auditRubric;
  } else if (docTypeId === 'portfolio') {
    effectiveRubric = {
      type: 'portfolio',
      label: 'Developer Portfolio & Project Showcase Audit',
      requiredHeadings: ['Featured Projects', 'Tech Stack', 'About / Contact'],
      detectLinks: true,
      detectMetrics: true,
    };
  } else if (docTypeId === 'tech-spec') {
    effectiveRubric = {
      type: 'tech-spec',
      label: 'Technical Spec & RFC Rigor Audit',
      requiredHeadings: ['Architecture', 'API Design', 'Security', 'Trade-offs'],
      detectDiagrams: true,
    };
  } else if (docTypeId === 'custom-checklist') {
    effectiveRubric = {
      type: 'custom-checklist',
      label: 'Custom Document Checklist Audit',
    };
  } else {
    effectiveRubric = BUILTIN_DOCUMENT_TYPES['cv']?.auditRubric || {
      type: 'ats',
      label: 'ATS Resume Compliance Audit',
    };
  }

  // Handle Rubrics based on type
  if (effectiveRubric.type === 'portfolio') {
    const hasFeaturedProjects = allHeaders.some((h) =>
      /(featured\s*projects|projects|portfolio|case\s*studies|work)/i.test(h)
    );
    const hasTechStack = allHeaders.some((h) =>
      /(tech(nical)?\s*stack|skills|technologies|tools)/i.test(h)
    );
    const hasAboutContact = allHeaders.some((h) =>
      /(about|contact|bio|profile|connect)/i.test(h)
    );
    const hasProjectLinks = linkCount >= 2;
    const hasMetrics = quantifiedMetricsCount >= 2;
    const hasTechStackTags = techStackCount >= 3;

    const checklist: DocumentAuditChecklistItem[] = [
      {
        title: 'Featured Projects Section',
        passed: hasFeaturedProjects,
        detail: hasFeaturedProjects
          ? 'Featured Projects showcase section is present.'
          : 'Missing "# Featured Projects" section.',
        weight: 25,
      },
      {
        title: 'Tech Stack Section',
        passed: hasTechStack,
        detail: hasTechStack
          ? 'Tech Stack section is present.'
          : 'Missing "# Tech Stack" section.',
        weight: 20,
      },
      {
        title: 'About / Contact Section',
        passed: hasAboutContact,
        detail: hasAboutContact
          ? 'About / Contact section is present.'
          : 'Missing "# About / Contact" section.',
        weight: 15,
      },
      {
        title: 'Project Links & Repositories',
        passed: hasProjectLinks,
        detail: hasProjectLinks
          ? `${linkCount} project/repository/demo link(s) detected.`
          : 'Add live demo and GitHub repository links for your projects.',
        weight: 20,
      },
      {
        title: 'Quantified Impact Metrics',
        passed: hasMetrics,
        detail: hasMetrics
          ? `${quantifiedMetricsCount} quantified metric(s) found.`
          : 'Include measurable project impact (e.g. "Scaled to 50k users", "Reduced latency by 40%").',
        weight: 10,
      },
      {
        title: 'Technology Stack Tags',
        passed: hasTechStackTags,
        detail: hasTechStackTags
          ? `${techStackCount} tech stack tag(s) detected.`
          : 'Highlight specific technologies used (e.g. TypeScript, React, Go, Docker).',
        weight: 10,
      },
    ];

    const score = Math.max(
      0,
      Math.min(
        100,
        checklist.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0)
      )
    );

    let grade: DocumentAuditResult['grade'] = 'C';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!hasFeaturedProjects) {
      warnings.push('Missing "Featured Projects" section to showcase key works.');
    }
    if (!hasProjectLinks) {
      warnings.push(
        'No project demo or repository links found. High-impact portfolios require live links or GitHub repos.'
      );
    }
    if (!hasTechStack) {
      suggestions.push('Add a "Tech Stack" section categorizing your languages, frameworks, and infrastructure.');
    }
    if (!hasAboutContact) {
      suggestions.push('Add an "About / Contact" section with direct contact information and profile links.');
    }
    if (!hasMetrics) {
      suggestions.push('Incorporate quantifiable impact metrics in project descriptions (e.g. latency, user scale, efficiency).');
    }
    if (!hasTechStackTags) {
      suggestions.push('Tag each project with technology keywords (e.g. TypeScript, Next.js, PostgreSQL).');
    }
    if (effectiveRubric.minWordCount && wordCount < effectiveRubric.minWordCount) {
      suggestions.push(
        `Portfolio is concise (${wordCount} words). Expand project descriptions to reach at least ${effectiveRubric.minWordCount} words.`
      );
    }
    if (effectiveRubric.maxWordCount && wordCount > effectiveRubric.maxWordCount) {
      warnings.push(
        `Portfolio length (${wordCount} words) exceeds recommended maximum of ${effectiveRubric.maxWordCount} words.`
      );
    }

    return {
      score,
      grade,
      label: effectiveRubric.label,
      checklist,
      metrics: {
        wordCount,
        readingTimeMinutes,
        linkCount,
        diagramCount,
        metricPointsCount: quantifiedMetricsCount,
      },
      warnings,
      suggestions,
      actionVerbsCount,
      actionVerbsFound,
      quantifiedMetricsCount,
      sections: [],
      wordCount,
      readingTimeMinutes,
    };
  }

  if (effectiveRubric.type === 'tech-spec') {
    const hasArchitecture = allHeaders.some((h) =>
      /(architecture|system\s*design|component\s*design)/i.test(h)
    );
    const hasApiDesign = allHeaders.some((h) =>
      /(api(\s*design|\s*spec(ification)?|\s*contracts?|\s*endpoints?)?|interfaces?|schemas?)/i.test(h)
    );
    const hasSecurity = allHeaders.some((h) =>
      /(security|privacy|authentication|authorization|compliance)/i.test(h)
    );
    const hasTradeoffs = allHeaders.some((h) =>
      /(trade-?offs?|alternatives|decisions?|risks)/i.test(h)
    );
    const hasDiagrams = diagramCount >= 1;
    const hasCodeSnippets = codeSnippetCount >= 1;

    const checklist: DocumentAuditChecklistItem[] = [
      {
        title: 'Architecture & System Design Section',
        passed: hasArchitecture,
        detail: hasArchitecture
          ? 'Architecture & System Design section is present.'
          : 'Missing Architecture & System Design section.',
        weight: 20,
      },
      {
        title: 'API Design & Contracts Section',
        passed: hasApiDesign,
        detail: hasApiDesign
          ? 'API Design / Data Contracts section is present.'
          : 'Missing API Design or Schema Contracts section.',
        weight: 20,
      },
      {
        title: 'Security & Privacy Considerations Section',
        passed: hasSecurity,
        detail: hasSecurity
          ? 'Security & Privacy Considerations section is present.'
          : 'Missing Security & Privacy Considerations section.',
        weight: 15,
      },
      {
        title: 'Trade-offs & Alternatives Considered Section',
        passed: hasTradeoffs,
        detail: hasTradeoffs
          ? 'Trade-offs & Alternatives section is present.'
          : 'Missing Trade-offs & Alternatives Considered section.',
        weight: 15,
      },
      {
        title: 'Architecture Mermaid Diagrams',
        passed: hasDiagrams,
        detail: hasDiagrams
          ? `${diagramCount} Mermaid diagram(s) detected.`
          : 'Add a Mermaid diagram (```mermaid) to visualize system components and data flows.',
        weight: 15,
      },
      {
        title: 'Code Snippets & Data Schemas',
        passed: hasCodeSnippets,
        detail: hasCodeSnippets
          ? `${codeSnippetCount} code/schema snippet(s) detected.`
          : 'Include code snippets or data schema definitions (TypeScript, OpenAPI, SQL, etc.).',
        weight: 15,
      },
    ];

    const score = Math.max(
      0,
      Math.min(
        100,
        checklist.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0)
      )
    );

    let grade: DocumentAuditResult['grade'] = 'C';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!hasDiagrams) {
      warnings.push(
        'No architecture diagrams detected. Include a Mermaid diagram (```mermaid) to visualize component flows.'
      );
    }
    if (!hasArchitecture) {
      warnings.push('Missing Architecture & System Design section.');
    }
    if (!hasApiDesign) {
      warnings.push('Missing API Design or Schema Contracts section.');
    }
    if (!hasSecurity) {
      suggestions.push(
        'Document Security & Privacy considerations to detail threat modeling and data protection.'
      );
    }
    if (!hasTradeoffs) {
      suggestions.push(
        'Include Trade-offs & Alternatives Considered to justify design decisions.'
      );
    }
    if (!hasCodeSnippets) {
      suggestions.push(
        'Add code snippets or schema contracts to clarify payload structures.'
      );
    }
    if (effectiveRubric.minWordCount && wordCount < effectiveRubric.minWordCount) {
      suggestions.push(
        `Tech spec is concise (${wordCount} words). Elaborate on failure scenarios and system constraints.`
      );
    }

    return {
      score,
      grade,
      label: effectiveRubric.label,
      checklist,
      metrics: {
        wordCount,
        readingTimeMinutes,
        linkCount,
        diagramCount,
        metricPointsCount: quantifiedMetricsCount,
      },
      warnings,
      suggestions,
      actionVerbsCount,
      actionVerbsFound,
      quantifiedMetricsCount,
      sections: [],
      wordCount,
      readingTimeMinutes,
    };
  }

  if (effectiveRubric.type === 'custom-checklist') {
    const rawItems: Array<{ title: string; passed: boolean; detail: string }> = [];

    // 1. Required Headings
    if (effectiveRubric.requiredHeadings && effectiveRubric.requiredHeadings.length > 0) {
      for (const heading of effectiveRubric.requiredHeadings) {
        const headingLower = heading.toLowerCase();
        const found = allHeaders.some((h) => h.includes(headingLower));
        rawItems.push({
          title: `Required Section: "${heading}"`,
          passed: found,
          detail: found
            ? `Section "${heading}" is present.`
            : `Missing required section "${heading}".`,
        });
      }
    }

    // 2. Link presence
    if (effectiveRubric.detectLinks) {
      const passed = linkCount > 0;
      rawItems.push({
        title: 'Links Presence',
        passed,
        detail: passed ? `${linkCount} link(s) detected.` : 'No hyperlinks detected in document.',
      });
    }

    // 3. Diagram presence
    if (effectiveRubric.detectDiagrams) {
      const passed = diagramCount > 0;
      rawItems.push({
        title: 'Diagrams Presence',
        passed,
        detail: passed
          ? `${diagramCount} Mermaid diagram(s) detected.`
          : 'No Mermaid diagrams detected.',
      });
    }

    // 4. Metric presence
    if (effectiveRubric.detectMetrics) {
      const passed = quantifiedMetricsCount > 0;
      rawItems.push({
        title: 'Quantified Metrics Presence',
        passed,
        detail: passed
          ? `${quantifiedMetricsCount} metric point(s) detected.`
          : 'No quantified metrics detected.',
      });
    }

    // 5. Min word count
    if (typeof effectiveRubric.minWordCount === 'number') {
      const min = effectiveRubric.minWordCount;
      const passed = wordCount >= min;
      rawItems.push({
        title: `Minimum Word Count (>= ${min})`,
        passed,
        detail: passed
          ? `Word count (${wordCount}) satisfies minimum requirement of ${min}.`
          : `Word count (${wordCount}) is below minimum requirement of ${min}.`,
      });
    }

    // 6. Max word count
    if (typeof effectiveRubric.maxWordCount === 'number') {
      const max = effectiveRubric.maxWordCount;
      const passed = wordCount <= max;
      rawItems.push({
        title: `Maximum Word Count (<= ${max})`,
        passed,
        detail: passed
          ? `Word count (${wordCount}) is within maximum limit of ${max}.`
          : `Word count (${wordCount}) exceeds maximum limit of ${max}.`,
      });
    }

    // Calculate weights
    let checklist: DocumentAuditChecklistItem[] = [];
    if (rawItems.length === 0) {
      checklist = [
        {
          title: 'General Document Formatting',
          passed: wordCount > 0,
          detail: wordCount > 0 ? 'Document contains content.' : 'Document is empty.',
          weight: 100,
        },
      ];
    } else {
      const baseWeight = Math.floor(100 / rawItems.length);
      const remainder = 100 - baseWeight * rawItems.length;
      checklist = rawItems.map((item, idx) => ({
        ...item,
        weight: idx === rawItems.length - 1 ? baseWeight + remainder : baseWeight,
      }));
    }

    const score = Math.max(
      0,
      Math.min(
        100,
        checklist.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0)
      )
    );

    let grade: DocumentAuditResult['grade'] = 'C';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else grade = 'D';

    const warnings: string[] = [];
    const suggestions: string[] = [];

    for (const item of checklist) {
      if (!item.passed) {
        if (item.title.startsWith('Required Section') || item.title.includes('Word Count')) {
          warnings.push(item.detail);
        } else {
          suggestions.push(item.detail);
        }
      }
    }

    return {
      score,
      grade,
      label: effectiveRubric.label,
      checklist,
      metrics: {
        wordCount,
        readingTimeMinutes,
        linkCount,
        diagramCount,
        metricPointsCount: quantifiedMetricsCount,
      },
      warnings,
      suggestions,
      actionVerbsCount,
      actionVerbsFound,
      quantifiedMetricsCount,
      sections: [],
      wordCount,
      readingTimeMinutes,
    };
  }

  // Default: ATS Rubric
  const h2Headers = nodes
    .filter((n) => n.type === 'h2')
    .map((n) => (n.text || '').toLowerCase());

  const sectionResults: ATSSectionCheck[] = STANDARD_SECTIONS.map((sec) => {
    const found = h2Headers.some((h) => sec.regex.test(h));
    return {
      section: sec.name,
      found,
      weight: sec.weight,
    };
  });

  // Calculate score
  let score = 0;

  // 1. Sections score (up to 90 points based on weights)
  for (const sec of sectionResults) {
    if (sec.found) score += sec.weight;
  }

  // 2. Contact details check (up to 10 points)
  let contactScore = 0;
  if (/@/.test(markdown)) contactScore += 3;
  if (/linkedin\.com/i.test(markdown)) contactScore += 3;
  if (/github\.com|portfolio/i.test(markdown)) contactScore += 2;
  if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(markdown)) contactScore += 2;
  score += Math.min(10, contactScore);

  // Bonus / deductions
  if (actionVerbsCount >= 8) score += 5;
  else if (actionVerbsCount < 3) score -= 5;

  if (quantifiedMetricsCount >= 6) score += 5;
  else if (quantifiedMetricsCount === 0) score -= 8;

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine Grade
  let grade: DocumentAuditResult['grade'] = 'C';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else grade = 'D';

  // Warnings and suggestions
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const missingSections = sectionResults.filter((s) => !s.found);
  if (missingSections.length > 0) {
    warnings.push(
      `Missing recommended standard sections: ${missingSections.map((s) => s.section).join(', ')}`
    );
  }

  if (actionVerbsCount < 5) {
    suggestions.push(
      'Incorporate more high-impact action verbs (e.g. Engineered, Spearheaded, Automated, Delivered) in experience bullets.'
    );
  }

  if (quantifiedMetricsCount < 4) {
    suggestions.push(
      'Add quantifiable accomplishments and metrics (e.g., "Increased performance by 42%", "Saved $15k/mo", "Handled 1M+ req/day").'
    );
  }

  if (!/@/.test(markdown)) {
    warnings.push('No email address detected. Contact information is critical for ATS parsing.');
  }

  // Check long bullets
  const longBullets = nodes.filter(
    (n) => n.type === 'bullet' && (n.text || '').split(/\s+/).length > 40
  );
  if (longBullets.length > 0) {
    suggestions.push(
      `${longBullets.length} bullet point(s) exceed 40 words. Keep bullet points punchy and concise (15-30 words) for readability.`
    );
  }

  const checklist: DocumentAuditChecklistItem[] = [
    ...sectionResults.map((sec) => ({
      title: `${sec.section} Section`,
      passed: sec.found,
      detail: sec.found
        ? `Section "${sec.section}" is properly formatted.`
        : `Missing recommended standard section "${sec.section}".`,
      weight: sec.weight,
    })),
    {
      title: 'Contact Information',
      passed: contactScore >= 6,
      detail:
        contactScore >= 6
          ? 'Detected email, phone, and professional profiles.'
          : 'Missing complete contact info (email, phone, or LinkedIn).',
      weight: 10,
    },
    {
      title: 'Action Verbs & Impact',
      passed: actionVerbsCount >= 5,
      detail: `${actionVerbsCount} high-impact action verb(s) identified.`,
      weight: 5,
    },
    {
      title: 'Quantified Metrics',
      passed: quantifiedMetricsCount >= 4,
      detail: `${quantifiedMetricsCount} quantified metric(s) found.`,
      weight: 5,
    },
  ];

  return {
    score,
    grade,
    label: effectiveRubric.label || 'ATS Resume Compliance',
    checklist,
    metrics: {
      wordCount,
      readingTimeMinutes,
      linkCount,
      diagramCount: 0,
      metricPointsCount: quantifiedMetricsCount,
    },
    warnings,
    suggestions,
    actionVerbsCount,
    actionVerbsFound,
    quantifiedMetricsCount,
    sections: sectionResults,
    wordCount,
    readingTimeMinutes,
  };
}
