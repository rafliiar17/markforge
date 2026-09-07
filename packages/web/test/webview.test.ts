import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setTimeout } from 'timers/promises';

describe('MarkForge Web Studio E2E via Bun.WebView', () => {
  let webview: any;

  beforeAll(async () => {
    webview = new Bun.WebView();
    await webview.navigate('http://localhost:3040');
    // Allow React hydration
    await setTimeout(2000);
  }, 20000);

  afterAll(async () => {
    if (webview) {
      await webview.close();
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
    await setTimeout(1000);

    // Verify ATS Score is rendered in active tab
    const hasAtsContent = await webview.evaluate(
      'document.body.innerText.includes("ATS COMPLIANCE SCORE") || document.body.innerText.includes("/ 100")'
    );
    expect(hasAtsContent).toBe(true);
  }, 15000);
});
