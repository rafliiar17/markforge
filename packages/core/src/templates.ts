import { TemplateDefinition, TemplateId } from './types';

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
