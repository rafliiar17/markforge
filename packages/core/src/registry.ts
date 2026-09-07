import { TemplateDefinition, TemplateId, CompileOptions } from './types';
import { BUILTIN_TEMPLATES } from './templates';
import { createLogger } from './logger';

const logger = createLogger('markforge:registry');

export interface EngineConversionContext {
  markdown: string;
  options: CompileOptions;
  tempDir: string;
  docxBuffer?: Buffer;
  htmlContent?: string;
}

export interface DocumentConverterEngine {
  name: string;
  targetFormat: 'pdf' | 'docx' | 'html';
  priority: number; // Higher number = executed first in fallback chain
  isAvailable(): boolean | Promise<boolean>;
  convert(ctx: EngineConversionContext): Promise<Buffer>;
}

class TemplateRegistry {
  private templates: Map<string, TemplateDefinition> = new Map();

  constructor() {
    // Load built-in templates
    for (const [id, def] of Object.entries(BUILTIN_TEMPLATES)) {
      this.templates.set(id, def);
    }
  }

  register(template: TemplateDefinition): void {
    this.templates.set(template.id, template);
    logger.debug({ name: template.name }, `Registered template "${template.id}"`);
  }

  unregister(id: string): boolean {
    return this.templates.delete(id);
  }

  get(id?: string): TemplateDefinition {
    if (id && this.templates.has(id)) {
      return this.templates.get(id)!;
    }
    return this.templates.get('ats-classic')!;
  }

  list(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  has(id: string): boolean {
    return this.templates.has(id);
  }
}

class EngineRegistry {
  private engines: DocumentConverterEngine[] = [];

  register(engine: DocumentConverterEngine): void {
    this.engines.push(engine);
    // Sort descending by priority
    this.engines.sort((a, b) => b.priority - a.priority);
    logger.debug({ format: engine.targetFormat, priority: engine.priority }, `Registered engine "${engine.name}"`);
  }

  getEnginesForFormat(format: 'pdf' | 'docx' | 'html'): DocumentConverterEngine[] {
    return this.engines.filter((e) => e.targetFormat === format);
  }

  list(): DocumentConverterEngine[] {
    return [...this.engines];
  }
}

export const templateRegistry = new TemplateRegistry();
export const engineRegistry = new EngineRegistry();
