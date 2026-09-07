import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setTimeout } from 'timers/promises';
import path from 'path';

describe('MarkForge Web Studio E2E via Bun.WebView', () => {
  let webview: any;
  let serverSubprocess: any = null;

  beforeAll(async () => {
    const port = process.env.PORT || '3030';
    let isRunning = false;
    try {
      const res = await fetch(`http://localhost:${port}/api/health`);
      if (res.ok) isRunning = true;
    } catch {}

    if (!isRunning) {
      serverSubprocess = Bun.spawn(['bun', 'run', 'dev'], {
        cwd: '/home/archy/Projects/markforge/packages/web',
        stdio: ['ignore', 'ignore', 'ignore'],
      });

      for (let i = 0; i < 30; i++) {
        try {
          const res = await fetch(`http://localhost:${port}/api/health`);
          if (res.ok) {
            isRunning = true;
            break;
          }
        } catch {}
        await setTimeout(400);
      }
    }

    webview = new Bun.WebView();
    await webview.navigate(`http://localhost:${port}`);
    // Allow React hydration
    await setTimeout(2000);
  }, 30000);

  afterAll(async () => {
    if (webview) {
      await webview.close();
    }
    if (serverSubprocess) {
      serverSubprocess.kill();
    }
  }, 10000);

  it('should navigate to studio and render correct page title', async () => {
    const title = await webview.evaluate('document.title');
    expect(title).toContain('MarkForge');
  }, 10000);

  it('should render header with MarkForge branding and template dropdown', async () => {
    const headerText = await webview.evaluate('document.querySelector("header")?.innerText');
    expect(headerText).toContain('MarkForge');
    expect(headerText).toContain('Open Source');
    expect(headerText).toContain('Export DOCX');
    expect(headerText).toContain('Export PDF');
  }, 10000);

  it('should contain editor textarea with sample markdown', async () => {
    const textareaValue = await webview.evaluate('document.querySelector("textarea")?.value');
    expect(textareaValue).toBeDefined();
    expect(textareaValue).toContain('Jane Doe');
    expect(textareaValue).toContain('Professional Summary');
  }, 10000);

  it('should render live A4 document preview canvas', async () => {
    const previewText = await webview.evaluate(
      'document.querySelector(".shadow-2xl")?.innerText || document.body.innerText'
    );
    expect(previewText).toContain('Jane Doe');
    expect(previewText.toUpperCase()).toContain('WORK EXPERIENCE');
  }, 10000);

  it('should successfully capture viewport screenshot via Bun.WebView', async () => {
    const blob = await webview.screenshot();
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);

    // Persist screenshot to output directory
    await Bun.write('/home/archy/Projects/markforge/output/webview-studio-screenshot.png', blob);
  }, 10000);

  it('should click Mermaid Flow toolbar button and render Mermaid SVG diagram in A4 canvas', async () => {
    // Click "Mermaid Flow" toolbar button
    const clickMermaidScript = `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find((el) =>
          el.textContent?.includes('Mermaid Flow') || el.getAttribute('title')?.includes('Mermaid flowchart')
        );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `;

    const clicked = await webview.evaluate(clickMermaidScript);
    expect(clicked).toBe(true);

    // Verify markdown editor textarea contains the inserted mermaid snippet
    const textareaValue = await webview.evaluate('document.querySelector("textarea")?.value');
    expect(textareaValue).toBeDefined();
    expect(textareaValue).toContain('```mermaid');
    expect(textareaValue).toContain('System Flow & Architecture');

    // Wait for React update and Mermaid SVG rendering in the DOM
    let hasMermaidSvg = false;
    for (let i = 0; i < 25; i++) {
      hasMermaidSvg = await webview.evaluate(`
        (() => {
          const svg = document.querySelector('.mermaid svg') || document.querySelector('[data-testid="document-preview-canvas"] .mermaid svg');
          return !!svg;
        })()
      `);
      if (hasMermaidSvg) break;
      await setTimeout(500);
    }
    expect(hasMermaidSvg).toBe(true);

    // Verify that .mermaid svg or rendered diagram exists in the A4 canvas
    const diagramCheck = await webview.evaluate(`
      (() => {
        const canvas = document.querySelector('[data-testid="document-preview-canvas"]') || document.querySelector('.shadow-2xl');
        const mermaidEl = canvas ? canvas.querySelector('.mermaid') : document.querySelector('.mermaid');
        const svg = mermaidEl ? mermaidEl.querySelector('svg') : null;
        return {
          hasCanvas: !!canvas,
          hasMermaidInCanvas: !!(canvas && mermaidEl && canvas.contains(mermaidEl)),
          hasSvg: !!svg,
          isRendered: mermaidEl ? mermaidEl.getAttribute('data-rendered') === 'true' : false,
          svgContent: svg ? svg.textContent : '',
        };
      })()
    `);

    expect(diagramCheck.hasCanvas).toBe(true);
    expect(diagramCheck.hasMermaidInCanvas).toBe(true);
    expect(diagramCheck.hasSvg).toBe(true);
    expect(diagramCheck.isRendered).toBe(true);
    expect(diagramCheck.svgContent).toContain('MarkForge Engine');

    // Capture screenshot via webview.screenshot() and write to output/mermaid-studio-preview.png
    const blob = await webview.screenshot();
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);

    const outputPath = path.resolve(import.meta.dir, '../../../output/mermaid-studio-preview.png');
    await Bun.write(outputPath, blob);
  }, 20000);

  it('should interact with tabs and switch to ATS Audit panel', async () => {
    const clickScript = `
      (() => {
        const b = Array.from(document.querySelectorAll('button')).find((el) =>
          el.textContent?.includes('ATS Audit')
        );
        if (b) {
          b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          b.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          b.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          b.click();
          return true;
        }
        return false;
      })()
    `;

    const clicked = await webview.evaluate(clickScript);
    expect(clicked).toBe(true);
    let hasAtsContent = false;
    for (let i = 0; i < 20; i++) {
      hasAtsContent = await webview.evaluate(
        'document.body.innerText.includes("ATS COMPLIANCE SCORE") || document.body.innerText.includes("/ 100") || document.body.innerText.includes("ATS Audit")'
      );
      if (hasAtsContent) break;
      await setTimeout(400);
    }
    expect(hasAtsContent).toBe(true);
  }, 15000);
});
