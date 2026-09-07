import { AuditRubricConfig } from '../types';

export const POWER_ACTION_VERBS = [
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

export interface StandardSectionDefinition {
  name: string;
  regex: RegExp;
  weight: number;
}

export const STANDARD_SECTIONS: StandardSectionDefinition[] = [
  { name: 'Summary / Profile', regex: /(summary|profile|about\s*me|objective)/i, weight: 15 },
  { name: 'Work Experience', regex: /(experience|employment|work\s*history|career)/i, weight: 30 },
  { name: 'Education', regex: /(education|academic|qualifications|degrees)/i, weight: 15 },
  { name: 'Skills', regex: /(skills|competencies|technical\s*skills|tech\s*stack)/i, weight: 20 },
  { name: 'Projects / Achievements', regex: /(projects|portfolio|achievements|certifications)/i, weight: 10 },
];

export const TECH_KEYWORDS = [
  'typescript', 'javascript', 'python', 'go', 'golang', 'rust', 'java', 'c++', 'c#',
  'react', 'next.js', 'vue', 'angular', 'svelte', 'node', 'node.js', 'bun',
  'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'cloudflare',
  'postgresql', 'postgres', 'mysql', 'redis', 'mongodb', 'clickhouse', 'sqlite', 'dynamodb',
  'kafka', 'graphql', 'rest', 'grpc', 'tailwind', 'tailwindcss', 'openxml',
  'webassembly', 'wasm', 'terraform', 'ci/cd', 'git', 'github actions'
];

export const ATS_RUBRIC: AuditRubricConfig = {
  type: 'ats',
  label: 'ATS Resume Compliance Audit',
  requiredHeadings: ['Summary', 'Experience', 'Education', 'Skills'],
  detectMetrics: true,
  minWordCount: 150,
  maxWordCount: 900,
};

export const PORTFOLIO_RUBRIC: AuditRubricConfig = {
  type: 'portfolio',
  label: 'Developer Portfolio & Project Showcase Audit',
  requiredHeadings: ['Featured Projects', 'Tech Stack', 'About / Contact'],
  detectLinks: true,
  detectMetrics: true,
  minWordCount: 100,
  maxWordCount: 2000,
};

export const TECH_SPEC_RUBRIC: AuditRubricConfig = {
  type: 'tech-spec',
  label: 'Technical Spec & RFC Rigor Audit',
  requiredHeadings: ['Architecture', 'API Design', 'Security', 'Trade-offs'],
  detectDiagrams: true,
  minWordCount: 150,
};

export const CUSTOM_CHECKLIST_RUBRIC: AuditRubricConfig = {
  type: 'custom-checklist',
  label: 'Custom Document Checklist Audit',
};

export const ACADEMIC_RUBRIC: AuditRubricConfig = {
  type: 'custom-checklist',
  label: 'Academic Paper Structure Audit',
  requiredHeadings: ['Abstract', 'Introduction', 'Methodology', 'Results', 'References'],
  minWordCount: 150,
};
