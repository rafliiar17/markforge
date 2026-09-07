import { TemplateDefinition } from '../types';
import { BUILTIN_TEMPLATES } from '../templates';
import { createLogger } from '../observability';

const logger = createLogger('markforge:registry');

export class TemplateRegistry {
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

export const templateRegistry = new TemplateRegistry();

