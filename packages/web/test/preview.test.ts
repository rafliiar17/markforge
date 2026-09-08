import { describe, it, expect } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  DocumentPreview,
  DocumentPreviewSkeleton,
  getMermaidThemeConfig,
  getTemplateContainerClass,
  createMermaidWarningHtml,
  validateMermaidSyntax,
  escapeHtml,
} from '../components/document-preview';
import { StudioHeader } from '../components/studio/studio-header';
import { BUILTIN_DOCUMENT_TYPES, listMermaidTemplates } from '@markforge/core';


describe('DocumentPreview & DocumentPreviewSkeleton', () => {
  it('should render DocumentPreviewSkeleton with high-fidelity shimmer elements', () => {
    const html = renderToString(React.createElement(DocumentPreviewSkeleton));

    // Must match A4 layout card
    expect(html).toContain('bg-white');
    expect(html).toContain('shadow-2xl');

    // Must contain high-fidelity animate-shimmer elements
    expect(html).toContain('animate-shimmer');

    // Must include structural skeleton elements (header, sections, lines)
    expect(html).toContain('data-testid="preview-skeleton"');
  });

  it('should render DocumentPreview without layout jitter transition-all duration-200', () => {
    const sampleHtml = '<h1>Jane Doe</h1><p>Software Engineer</p>';
    const html = renderToString(React.createElement(DocumentPreview, { html: sampleHtml }));

    // Must render container and content
    expect(html).toContain('data-testid="document-preview-canvas"');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Software Engineer');

    // Must NOT contain transition-all duration-200 which caused visual flicker during typing
    expect(html).not.toContain('transition-all duration-200');
  });

  it('should render updating indicator smoothly if isUpdating is true without replacing canvas', () => {
    const sampleHtml = '<h1>Jane Doe</h1>';
    const html = renderToString(React.createElement(DocumentPreview, { html: sampleHtml, isUpdating: true }));

    // Canvas must still be present even when updating (no flip-flop)
    expect(html).toContain('data-testid="document-preview-canvas"');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('data-testid="preview-syncing-indicator"');
  });

  it('should render mermaid diagram container in DocumentPreview', () => {
    const sampleHtml = '<div class="mermaid">graph TD\n  A --> B</div>';
    const html = renderToString(React.createElement(DocumentPreview, { html: sampleHtml, template: 'ats-classic' }));

    expect(html).toContain('class="mermaid');
    expect(html).toContain('graph TD');
  });

  it('should synchronize Mermaid theme config with MarkForge templates', () => {
    // 1. Modern Accent: Emerald theme
    const modernConfig = getMermaidThemeConfig('modern-accent');
    expect(modernConfig.theme).toBe('base');
    expect(modernConfig.themeVariables.primaryColor).toBe('#ecfdf5');
    expect(modernConfig.themeVariables.primaryTextColor).toBe('#065f46');
    expect(modernConfig.themeVariables.primaryBorderColor).toBe('#059669');
    expect(modernConfig.themeVariables.lineColor).toBe('#0d9488');

    // 2. Tech Spec: Blue theme
    const techConfig = getMermaidThemeConfig('tech-spec');
    expect(techConfig.theme).toBe('base');
    expect(techConfig.themeVariables.primaryColor).toBe('#eff6ff');
    expect(techConfig.themeVariables.primaryBorderColor).toBe('#2563eb');
    expect(techConfig.themeVariables.lineColor).toBe('#3b82f6');

    // 3. Academic: Serif typography & formal navy
    const academicConfig = getMermaidThemeConfig('academic');
    expect(academicConfig.theme).toBe('base');
    expect(academicConfig.fontFamily).toContain('Georgia');
    expect(academicConfig.themeVariables.primaryTextColor).toBe('#1e3a8a');

    // 4. Executive: Bronze / warm amber styling
    const executiveConfig = getMermaidThemeConfig('executive');
    expect(executiveConfig.theme).toBe('base');
    expect(executiveConfig.fontFamily).toContain('Georgia');
    expect(executiveConfig.themeVariables.primaryBorderColor).toBe('#92400e');
    expect(executiveConfig.themeVariables.primaryColor).toBe('#fffbeb');

    // 5. ATS Classic: Neutral clean styling
    const atsConfig = getMermaidThemeConfig('ats-classic');
    expect(atsConfig.theme).toBe('neutral');
  });

  it('should match container styling with template presets', () => {
    expect(getTemplateContainerClass('modern-accent')).toContain('border-emerald-200/80');
    expect(getTemplateContainerClass('modern-accent')).toContain('bg-emerald-50/20');
    expect(getTemplateContainerClass('tech-spec')).toContain('border-blue-200/80');
    expect(getTemplateContainerClass('executive')).toContain('border-amber-200/80');
    expect(getTemplateContainerClass('ats-classic')).toContain('border-zinc-200/80');
  });

  it('should validate Mermaid syntax and handle incomplete typing without throwing', async () => {
    // Valid syntax
    const validResult = await validateMermaidSyntax('graph TD\n  A --> B');
    expect(validResult.valid).toBe(true);
    expect(validResult.error).toBeUndefined();

    // Incomplete / syntax error actively being typed
    const invalidResult = await validateMermaidSyntax('graph TD\n  A -->');
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.error).toBeDefined();

    // Empty source
    const emptyResult = await validateMermaidSyntax('');
    expect(emptyResult.valid).toBe(false);
  });

  it('should validate all built-in production architecture Mermaid templates without syntax errors', async () => {
    const templates = listMermaidTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(6);

    for (const tmpl of templates) {
      const result = await validateMermaidSyntax(tmpl.diagram);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    }
  });


  it('should generate graceful syntax warning HTML when typing incomplete diagram', () => {
    const rawSource = 'graph TD\n  A -->';
    const warningHtml = createMermaidWarningHtml(rawSource, 'Parse error on line 2: Expecting EOF');

    // Must show syntax warning hint without throwing or crashing
    expect(warningHtml).toContain('data-testid="mermaid-syntax-warning"');
    expect(warningHtml).toContain('Mermaid Syntax Warning: Incomplete Diagram');
    expect(warningHtml).toContain('Continue typing valid Mermaid syntax to render the diagram.');
    // Must escape raw user input safely
    expect(warningHtml).toContain('graph TD');
    expect(warningHtml).toContain('border-dashed');
  });

  it('should retain previous valid SVG with non-intrusive warning when typing is temporarily incomplete', () => {
    const rawSource = 'graph TD\n  A --> B\n  B -->';
    const previousSvg = '<svg id="previous-valid-diagram"><g><text>Node A</text></g></svg>';
    const warningHtml = createMermaidWarningHtml(rawSource, 'Parse error on line 3', previousSvg);

    // Must include non-intrusive warning banner
    expect(warningHtml).toContain('data-testid="mermaid-syntax-warning"');
    expect(warningHtml).toContain('Incomplete Mermaid syntax (editing...)');
    expect(warningHtml).toContain('Retaining last valid render');
    // Must preserve the previous SVG so canvas does not break or jump
    expect(warningHtml).toContain(previousSvg);
    expect(warningHtml).toContain('opacity-85');
  });

  it('should safely escape HTML entities in error outputs', () => {
    const dangerous = '<script>alert("xss")</script> & "test"';
    const escaped = escapeHtml(dangerous);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&quot;');
  });

  it('should render DocumentPreview with template prop without throwing', () => {
    const styledHtml = '<div class="mermaid my-6 flex flex-col items-center justify-center overflow-x-auto rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-5 shadow-sm" data-template="modern-accent">graph TD\n  A --> B</div>';
    const html = renderToString(React.createElement(DocumentPreview, {
      html: styledHtml,
      template: 'modern-accent',
    }));

    expect(html).toContain('class="mermaid');
    expect(html).toContain('rounded-xl');
    expect(html).toContain('shadow-sm');
    expect(html).toContain('border-emerald-200/80');
    expect(html).toContain('data-template="modern-accent"');
  });

  it('should render visual A4 page-break dashed guide line in DocumentPreview', () => {
    const sampleHtml = '<h1>Curriculum Vitae</h1>';
    const html = renderToString(React.createElement(DocumentPreview, { html: sampleHtml }));

    // Must render page break container and guide line
    expect(html).toContain('data-testid="page-break-container"');
    expect(html).toContain('data-testid="page-break-guide"');
    expect(html).toContain('border-dashed');
    expect(html).toContain('print:hidden');
    expect(html).toContain('1050px');
    expect(html).toContain('doc-canvas');
  });

  it('should render browser print button with Printer icon in StudioHeader', () => {
    const headerHtml = renderToString(
      React.createElement(StudioHeader, {
        docTypeId: 'cv',
        onDocTypeSelect: () => {},
        allDocumentTypes: [BUILTIN_DOCUMENT_TYPES['cv']],
        customTypes: [],
        onOpenCustomModal: () => {},
        template: 'ats-classic',
        onTemplateSelect: () => {},
        recommendedTemplates: [],
        activeDocType: BUILTIN_DOCUMENT_TYPES['cv'],
        onExportDocx: () => {},
        isGeneratingDocx: false,
        onExportPdf: () => {},
        isGeneratingPdf: false,
        onOpenCheatsheet: () => {},
      })
    );

    // Must render Print / Browser PDF button with title and printer icon
    expect(headerHtml).toContain('title="Cetak / PDF Browser"');
    expect(headerHtml).toContain('Cetak / PDF Browser');
    expect(headerHtml).toContain('lucide-printer');
  });
});


