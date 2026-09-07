import { describe, it, expect } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DocumentPreview, DocumentPreviewSkeleton } from '../components/document-preview';

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
    const html = renderToString(React.createElement(DocumentPreview, { html: sampleHtml }));

    expect(html).toContain('class="mermaid');
    expect(html).toContain('graph TD');
  });
});
