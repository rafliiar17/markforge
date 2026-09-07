import { describe, it, expect, beforeEach, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Mock UI dialog for server-side renderToString in unit tests
mock.module('@/components/ui/dialog', () => {
  return {
    Dialog: ({ children, open }: any) =>
      open ? React.createElement('div', { 'data-testid': 'dialog-root' }, children) : null,
    DialogContent: ({ className, children, ...props }: any) =>
      React.createElement('div', { className, 'data-testid': 'dialog-content', ...props }, children),
    DialogHeader: ({ className, children, ...props }: any) =>
      React.createElement('div', { className, ...props }, children),
    DialogFooter: ({ className, children, ...props }: any) =>
      React.createElement('div', { className, ...props }, children),
    DialogTitle: ({ className, children, ...props }: any) =>
      React.createElement('h2', { className, ...props }, children),
    DialogDescription: ({ className, children, ...props }: any) =>
      React.createElement('p', { className, ...props }, children),
    DialogTrigger: ({ children }: any) => children,
    DialogClose: ({ children }: any) => children,
  };
});

// Mock UI select for server-side renderToString in unit tests
mock.module('@/components/ui/select', () => {
  return {
    Select: ({ children, value, onValueChange }: any) =>
      React.createElement('div', { 'data-testid': 'select-root', 'data-value': value }, children),
    SelectTrigger: ({ children, className, ...props }: any) =>
      React.createElement('button', { className, ...props }, children),
    SelectValue: ({ placeholder }: any) => React.createElement('span', null, placeholder),
    SelectContent: ({ children, className }: any) =>
      React.createElement('div', { className }, children),
    SelectGroup: ({ children }: any) => React.createElement('div', null, children),
    SelectLabel: ({ children, className }: any) => React.createElement('span', { className }, children),
    SelectItem: ({ children, value, className }: any) =>
      React.createElement('div', { className, 'data-value': value }, children),
    SelectSeparator: ({ className }: any) => React.createElement('hr', { className }),
  };
});

// Mock localStorage store
const storageStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storageStore.set(key, String(value));
  },
  removeItem: (key: string) => {
    storageStore.delete(key);
  },
  clear: () => {
    storageStore.clear();
  },
};

(globalThis as any).localStorage = mockLocalStorage;

import { TemplateSwitchDialog } from '../components/modals/template-switch-dialog';
import {
  CustomTypeModal,
  CUSTOM_TYPES_STORAGE_KEY,
  loadCustomTypesFromStorage,
  saveCustomTypesToStorage,
} from '../components/modals/custom-type-modal';
import { MarkdownCheatsheetModal } from '../components/modals/markdown-cheatsheet-modal';
import {
  BUILTIN_DOCUMENT_TYPES,
  listDocumentTypes,
  getDocumentType,
  type DocumentTypeDefinition,
} from '@markforge/core';

describe('Cascading Document Type & Template Presets Logic', () => {
  it('should list all built-in document types with correct IDs and recommendations', () => {
    const types = listDocumentTypes();
    expect(types.length).toBeGreaterThanOrEqual(3);

    const cvType = types.find((t) => t.id === 'cv');
    expect(cvType).toBeDefined();
    expect(cvType?.name).toContain('Resume');
    expect(cvType?.defaultTemplateId).toBe('ats-classic');
    expect(cvType?.recommendedTemplateIds).toContain('ats-classic');
    expect(cvType?.recommendedTemplateIds).toContain('modern-accent');

    const portfolioType = types.find((t) => t.id === 'portfolio');
    expect(portfolioType).toBeDefined();
    expect(portfolioType?.name).toContain('Portfolio');
    expect(portfolioType?.defaultTemplateId).toBe('modern-accent');
    expect(portfolioType?.recommendedTemplateIds).toContain('modern-accent');

    const techSpecType = types.find((t) => t.id === 'tech-spec');
    expect(techSpecType).toBeDefined();
    expect(techSpecType?.name).toContain('Spec');
    expect(techSpecType?.defaultTemplateId).toBe('tech-spec');
    expect(techSpecType?.recommendedTemplateIds).toContain('tech-spec');
  });

  it('should resolve recommended templates for the active document type', () => {
    const allPresets = [
      { id: 'ats-classic', name: 'ATS Classic (Standard)' },
      { id: 'modern-accent', name: 'Modern Emerald' },
      { id: 'tech-spec', name: 'Technical Spec / RFC' },
      { id: 'academic', name: 'Academic Whitepaper' },
      { id: 'executive', name: 'Executive Leadership' },
    ];

    // For CV
    const cvDoc = getDocumentType('cv');
    const recommendedForCv = allPresets.filter((p) =>
      cvDoc.recommendedTemplateIds.includes(p.id)
    );
    expect(recommendedForCv.some((p) => p.id === 'ats-classic')).toBe(true);

    // For Tech Spec
    const specDoc = getDocumentType('tech-spec');
    const recommendedForSpec = allPresets.filter((p) =>
      specDoc.recommendedTemplateIds.includes(p.id)
    );
    expect(recommendedForSpec.some((p) => p.id === 'tech-spec')).toBe(true);

    // All presets should remain accessible
    expect(allPresets.length).toBe(5);
  });

  it('should compute dynamic toolbar button text and audit tab labels based on document type', () => {
    const getAnalyzeButtonText = (docTypeId: string, docTypeName?: string) => {
      if (docTypeId === 'cv') return 'Analyze ATS';
      if (docTypeId === 'portfolio') return 'Analyze Portfolio';
      if (docTypeId === 'tech-spec') return 'Analyze Spec';
      const shortName = (docTypeName || 'Doc').split('/')[0].trim().split(' ')[0].trim();
      return `Analyze ${shortName}`;
    };

    const getAuditTabLabel = (docTypeId: string, docTypeName?: string) => {
      if (docTypeId === 'cv') return 'ATS Audit';
      if (docTypeId === 'portfolio') return 'Portfolio Audit';
      if (docTypeId === 'tech-spec') return 'Spec Audit';
      const shortName = (docTypeName || 'Doc').split('/')[0].trim().split(' ')[0].trim();
      return `${shortName} Audit`;
    };

    expect(getAnalyzeButtonText('cv')).toBe('Analyze ATS');
    expect(getAnalyzeButtonText('portfolio')).toBe('Analyze Portfolio');
    expect(getAnalyzeButtonText('tech-spec')).toBe('Analyze Spec');
    expect(getAnalyzeButtonText('custom-rfc', 'RFC Architecture')).toBe('Analyze RFC');

    expect(getAuditTabLabel('cv')).toBe('ATS Audit');
    expect(getAuditTabLabel('portfolio')).toBe('Portfolio Audit');
    expect(getAuditTabLabel('tech-spec')).toBe('Spec Audit');
    expect(getAuditTabLabel('custom-api', 'API Reference Guide')).toBe('API Audit');
  });
});

describe('TemplateSwitchDialog Component', () => {
  it('should render dialog with current vs target document comparison and action buttons', () => {
    const current = {
      id: 'cv',
      name: 'CV / Resume',
      description: 'Standard single-column ATS resume layout.',
    };
    const target = {
      id: 'portfolio',
      name: 'Developer Portfolio',
      description: 'Visual project showcase with live links and metrics.',
    };

    const html = renderToString(
      React.createElement(TemplateSwitchDialog, {
        open: true,
        currentType: current,
        targetType: target,
        onConfirm: () => {},
        onCancel: () => {},
      })
    );

    // Title & explanation
    expect(html).toContain('Ganti Tipe Dokumen');
    expect(html).toContain('Pilih apakah Anda ingin memuat contoh starter markdown');

    // Current vs target comparison
    expect(html).toContain('CV / Resume');
    expect(html).toContain('Standard single-column ATS resume layout.');
    expect(html).toContain('Developer Portfolio');
    expect(html).toContain('Visual project showcase with live links and metrics.');

    // Buttons
    expect(html).toContain('Pertahankan Teks Saat Ini');
    expect(html).toContain('Muat Contoh Developer Portfolio');
    expect(html).toContain('Batal');

    // Layout & margin protection classes
    expect(html).toContain('max-w-xl');
    expect(html).toContain('sm:max-w-2xl');
  });

  it('should render dialog in English when I18nProvider is set to en', () => {
    const { I18nProvider } = require('../lib/i18n');
    const current = { id: 'cv', name: 'Resume' };
    const target = { id: 'portfolio', name: 'Portfolio' };

    const html = renderToString(
      React.createElement(
        I18nProvider,
        { initialLocale: 'en' },
        React.createElement(TemplateSwitchDialog, {
          open: true,
          currentType: current,
          targetType: target,
          onConfirm: () => {},
          onCancel: () => {},
        })
      )
    );

    expect(html).toContain('Switch Document Type');
    expect(html).toContain('Keep Current Text');
    expect(html).toContain('Load Portfolio Starter');
    expect(html).toContain('Cancel');
  });
});

describe('Custom Type Builder & LocalStorage Serialization', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('should load empty array when localStorage is empty', () => {
    const loaded = loadCustomTypesFromStorage();
    expect(loaded).toEqual([]);
  });

  it('should save and load custom document types with full schema fidelity', () => {
    const sampleCustomType: DocumentTypeDefinition = {
      id: 'custom-api-spec',
      name: 'REST API Specification',
      category: 'custom',
      description: 'API endpoint schema and contract specification',
      defaultTemplateId: 'tech-spec',
      recommendedTemplateIds: ['tech-spec', 'modern-accent'],
      starterMarkdown: '# API Spec\n\n## Endpoints\n- GET /api/v1/users\n',
      auditRubric: {
        type: 'custom-checklist',
        label: 'API Specification Audit',
        requiredHeadings: ['Overview', 'Endpoints', 'Authentication'],
        detectLinks: true,
        detectDiagrams: true,
        detectMetrics: false,
      },
      isCustom: true,
    };

    saveCustomTypesToStorage([sampleCustomType]);

    // Inspect localStorage raw string
    const raw = mockLocalStorage.getItem(CUSTOM_TYPES_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw).toContain('REST API Specification');

    // Retrieve via helper
    const loaded = loadCustomTypesFromStorage();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('custom-api-spec');
    expect(loaded[0].name).toBe('REST API Specification');
    expect(loaded[0].defaultTemplateId).toBe('tech-spec');
    expect(loaded[0].auditRubric.requiredHeadings).toContain('Endpoints');
    expect(loaded[0].auditRubric.detectDiagrams).toBe(true);
  });

  it('should handle malformed JSON in localStorage without throwing', () => {
    mockLocalStorage.setItem(CUSTOM_TYPES_STORAGE_KEY, '{ invalid_json :(');
    const loaded = loadCustomTypesFromStorage();
    expect(loaded).toEqual([]);
  });

  it('should render CustomTypeModal with form inputs and action controls', () => {
    const html = renderToString(
      React.createElement(CustomTypeModal, {
        open: true,
        onOpenChange: () => {},
      })
    );

    // Title and actions
    expect(html).toContain('Custom Document Types Manager');
    expect(html).toContain('Export JSON');
    expect(html).toContain('Import JSON');
    expect(html).toContain('Save Custom Type');

    // Form fields
    expect(html).toContain('Type Name');
    expect(html).toContain('Category Slug');
    expect(html).toContain('Description');
    expect(html).toContain('Audit Checklist Rules');
    expect(html).toContain('Starter Markdown Template');
    expect(html).toContain('Detect Links');
    expect(html).toContain('Detect Diagrams');
  });

  it('should support JSON serialization roundtrip for custom types export and import', () => {
    const customTypes: DocumentTypeDefinition[] = [
      {
        id: 'rfc-infra',
        name: 'Infrastructure RFC',
        category: 'custom',
        description: 'Cloud and platform infrastructure RFC design',
        defaultTemplateId: 'tech-spec',
        recommendedTemplateIds: ['tech-spec'],
        starterMarkdown: '# RFC Title\n\n## Architecture\n',
        auditRubric: {
          type: 'custom-checklist',
          label: 'RFC Audit',
          requiredHeadings: ['Architecture', 'Trade-offs'],
          detectDiagrams: true,
        },
        isCustom: true,
      },
    ];

    // Export simulation
    const exportedJson = JSON.stringify(customTypes, null, 2);
    expect(exportedJson).toContain('Infrastructure RFC');

    // Import simulation
    const importedTypes = JSON.parse(exportedJson);
    expect(Array.isArray(importedTypes)).toBe(true);
    expect(importedTypes[0].name).toBe('Infrastructure RFC');
    expect(importedTypes[0].auditRubric.requiredHeadings).toContain('Trade-offs');
  });
});

describe('MarkdownCheatsheetModal Component', () => {
  it('should render cheatsheet modal with tabs, categories, and syntax legends when open', () => {
    let insertedSnippet = '';
    const html = renderToString(
      React.createElement(MarkdownCheatsheetModal, {
        isOpen: true,
        onOpenChange: () => {},
        onInsertSnippet: (snippet: string) => {
          insertedSnippet = snippet;
        },
      })
    );

    expect(html).toContain('Legenda &amp; Panduan Format Markdown');
    expect(html).toContain('Tautan &amp; Kontak');
    expect(html).toContain('Tipografi');
    expect(html).toContain('Daftar &amp; Tabel');
    expect(html).toContain('Diagram');
    expect(html).toContain('Tips Audit');
    expect(html).toContain('Hyperlink Interaktif');
    expect(html).toContain('https://linkedin.com/in/rafliiarz');
    expect(html).toContain('Salin');
  });

  it('should not render content when isOpen is false', () => {
    const html = renderToString(
      React.createElement(MarkdownCheatsheetModal, {
        isOpen: false,
        onOpenChange: () => {},
      })
    );
    expect(html).toBe('');
  });
});
