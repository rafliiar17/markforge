export type TemplateId = 
  | 'ats-classic'
  | 'modern-accent'
  | 'tech-spec'
  | 'academic'
  | 'executive';

export type PaperSize = 'A4' | 'LETTER';

export interface MarginConfig {
  top: number;    // dxa (1 inch = 1440 dxa)
  right: number;
  bottom: number;
  left: number;
}

export interface TemplateStyleConfig {
  fontPrimary: string;
  fontHeading?: string;
  fontCode?: string;
  textColor: string;
  headingColor: string;
  accentColor: string;
  borderColor: string;
  lineHeight: number; // 240 = 1.0, 260 = ~1.15
  margins: MarginConfig;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  category: 'resume' | 'document' | 'report' | 'academic';
  style: TemplateStyleConfig;
  features: string[];
}

export interface CompileOptions {
  template?: TemplateId | string;
  paperSize?: PaperSize;
  title?: string;
  author?: string;
  customStyle?: Partial<TemplateStyleConfig>;
}

export interface ConvertResult {
  buffer: Buffer;
  format: 'docx' | 'pdf' | 'html';
  sizeBytes: number;
  engineUsed: string;
  warnings?: string[];
}

export interface ASTNode {
  type: 
    | 'h1' 
    | 'h2' 
    | 'h3' 
    | 'h4' 
    | 'paragraph' 
    | 'bullet' 
    | 'quote' 
    | 'horizontal_rule' 
    | 'contact_bar' 
    | 'subtitle' 
    | 'code_block' 
    | 'table';
  text?: string;
  level?: number;
  items?: string[];
  tableRows?: string[][];
  language?: string;
}

export interface ATSSectionCheck {
  section: string;
  found: boolean;
  weight: number;
}

export interface ATSReport {
  score: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  wordCount: number;
  readingTimeMinutes: number;
  actionVerbsCount: number;
  actionVerbsFound: string[];
  quantifiedMetricsCount: number; // e.g. %, $, numbers
  sections: ATSSectionCheck[];
  warnings: string[];
  suggestions: string[];
}

export interface SystemEngineCheck {
  soffice: boolean;
  pandoc: boolean;
  weasyprint: boolean;
  node: boolean;
  bun: boolean;
}
