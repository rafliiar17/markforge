import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { setTimeout } from 'timers/promises';
import path from 'path';

describe('MarkForge Web Studio E2E via Bun.WebView', () => {
  let webview: any = null;
  let isSupported = true;
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
        cwd: path.resolve(import.meta.dir, '..'),
        stdio: ['ignore', 'ignore', 'ignore'],
      });

      for (let i = 0; i < 40; i++) {
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

    // Warm-up root page compilation before loading in WebView
    try {
      await fetch(`http://localhost:${port}`);
    } catch {}

    try {
      if (typeof (Bun as any).WebView !== 'undefined') {
        webview = new (Bun as any).WebView();
        await webview.navigate(`http://localhost:${port}`);
        // Allow React hydration
        await setTimeout(3000);
      } else {
        isSupported = false;
      }
    } catch (e) {
      console.warn('Bun.WebView is unavailable in this environment, skipping WebView tests:', e);
      isSupported = false;
      webview = null;
    }
  }, 60000);

  afterAll(async () => {
    if (webview) {
      try {
        await webview.close();
      } catch {}
    }
    if (serverSubprocess) {
      try {
        serverSubprocess.kill();
      } catch {}
    }
  }, 10000);

  const itIfSupported = (name: string, fn: () => Promise<void>, timeout?: number) => {
    it(name, async () => {
      if (!isSupported || !webview) {
        return;
      }
      await fn();
    }, timeout);
  };

  itIfSupported('should navigate to studio and render correct page title', async () => {
    const title = await webview.evaluate('document.title');
    expect(title).toContain('MarkForge');
  }, 10000);

  itIfSupported('should render header with MarkForge branding and template dropdown', async () => {
    const headerText = await webview.evaluate('document.querySelector("header")?.innerText');
    expect(headerText).toContain('MarkForge');
    expect(headerText).toContain('Open Source');
    expect(headerText.includes('DOCX')).toBe(true);
    expect(headerText.includes('PDF')).toBe(true);
  }, 10000);

  itIfSupported('should contain editor textarea with sample markdown', async () => {
    const textareaValue = await webview.evaluate('document.querySelector("textarea")?.value');
    expect(textareaValue).toBeDefined();
    expect(textareaValue.length).toBeGreaterThan(50);
  }, 10000);

  itIfSupported('should render live A4 document preview canvas', async () => {
    const previewText = await webview.evaluate(
      'document.querySelector(".shadow-2xl")?.innerText || document.body.innerText'
    );
    expect(previewText.length).toBeGreaterThan(100);
  }, 10000);

  itIfSupported('should successfully capture viewport screenshot via Bun.WebView', async () => {
    const blob = await webview.screenshot();
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);

    // Persist screenshot to output directory
    await Bun.write(path.resolve(import.meta.dir, '../../../output/webview-studio-screenshot.png'), blob);
  }, 10000);

  itIfSupported('should click Mermaid Flow toolbar button and render Mermaid SVG diagram in A4 canvas', async () => {
    // Click "Mermaid Flow" toolbar button
    const clickMermaidScript = `
      (() => {
        const btn = document.querySelector('[data-testid="mermaid-flow-btn"]') ||
                    Array.from(document.querySelectorAll('button')).find((el) =>
                      el.textContent?.includes('Mermaid') || el.getAttribute('title')?.includes('Mermaid')
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
    expect(textareaValue).toContain('graph TD');

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
    expect(diagramCheck.svgContent).toContain('Mulai Proyek');

    // Capture screenshot via webview.screenshot() and write to output/mermaid-studio-preview.png
    const blob = await webview.screenshot();
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);

    const outputPath = path.resolve(import.meta.dir, '../../../output/mermaid-studio-preview.png');
    await Bun.write(outputPath, blob);
  }, 20000);

  itIfSupported('should interact with tabs and switch to ATS Audit panel', async () => {
    const clickScript = `
      (() => {
        const b = document.querySelector('[data-testid="tab-audit"]') ||
                  Array.from(document.querySelectorAll('button')).find((el) =>
                    el.textContent?.includes('ATS') || el.textContent?.includes('Audit') || el.textContent?.includes('Skor')
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
        'document.body.innerText.includes("ATS") || document.body.innerText.includes("/ 100") || document.body.innerText.includes("Audit") || document.body.innerText.includes("Skor")'
      );
      if (hasAtsContent) break;
      await setTimeout(400);
    }
    expect(hasAtsContent).toBe(true);
  }, 15000);

  itIfSupported('should verify two-tier cascading selectors render in the header', async () => {
    const selectorsCheck = await webview.evaluate(`
      (() => {
        const header = document.querySelector('header');
        if (!header) return { found: false };
        const comboboxes = Array.from(header.querySelectorAll('[role="combobox"]'));
        const manageBtn = header.querySelector('[data-testid="manage-custom-types-btn"]') ||
                          header.querySelector('button[title*="Custom"]') ||
                          header.querySelector('button[title*="Kustom"]');
        return {
          found: true,
          comboboxCount: comboboxes.length,
          hasDocTypeSelector: comboboxes.some(b => b.textContent?.includes('CV') || b.textContent?.includes('Resume') || b.textContent?.includes('Dokumen') || b.textContent?.includes('Document')),
          hasTemplateSelector: comboboxes.some(b => b.textContent?.includes('ATS') || b.textContent?.includes('Classic') || b.textContent?.includes('Style') || b.textContent?.includes('Gaya')),
          hasManageBtn: !!manageBtn,
        };
      })()
    `);

    expect(selectorsCheck.found).toBe(true);
    expect(selectorsCheck.comboboxCount).toBeGreaterThanOrEqual(2);
    expect(selectorsCheck.hasDocTypeSelector).toBe(true);
    expect(selectorsCheck.hasTemplateSelector).toBe(true);
    expect(selectorsCheck.hasManageBtn).toBe(true);
  }, 10000);

  itIfSupported('should select Portfolio from Document Type selector, trigger switch dialog, load starter, and verify dynamic audit', async () => {
    // 1. Click Document Type combobox trigger
    const openDocTypeDropdown = `
      (() => {
        const header = document.querySelector('header');
        const comboboxes = Array.from(header ? header.querySelectorAll('[role="combobox"]') : []);
        const docTypeBtn = comboboxes.find(b => b.textContent?.includes('CV') || b.textContent?.includes('Resume') || b.textContent?.includes('Document Type')) || comboboxes[0];
        if (docTypeBtn) {
          docTypeBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          docTypeBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          docTypeBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          docTypeBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          docTypeBtn.click();
          return true;
        }
        return false;
      })()
    `;
    const dropdownOpened = await webview.evaluate(openDocTypeDropdown);
    expect(dropdownOpened).toBe(true);
    await setTimeout(600);

    // 2. Click "Portfolio" item from the open dropdown
    const selectPortfolioOption = `
      (() => {
        const options = Array.from(document.querySelectorAll('[role="option"]'));
        const portfolioOpt = options.find(o => o.textContent?.includes('Portfolio') || o.getAttribute('data-value') === 'portfolio');
        if (portfolioOpt) {
          portfolioOpt.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          portfolioOpt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          portfolioOpt.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          portfolioOpt.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          portfolioOpt.click();
          return true;
        }
        return false;
      })()
    `;
    const optionSelected = await webview.evaluate(selectPortfolioOption);
    expect(optionSelected).toBe(true);
    await setTimeout(800);

    // 3. Verify template switch dialog triggers
    let dialogTriggered = false;
    for (let i = 0; i < 20; i++) {
      dialogTriggered = await webview.evaluate(`
        (() => {
          const dialog = document.querySelector('[role="dialog"]');
          if (!dialog) return false;
          const text = dialog.textContent || '';
          return text.includes('Ganti Tipe Dokumen') || text.includes('Target Baru') || text.includes('Portfolio');
        })()
      `);
      if (dialogTriggered) break;
      await setTimeout(300);
    }
    expect(dialogTriggered).toBe(true);

    // 4. Click "Muat Contoh Portfolio" (or load starter) button in the dialog
    const clickLoadStarter = `
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return false;
        const buttons = Array.from(dialog.querySelectorAll('button'));
        const loadBtn = buttons.find(b =>
          b.textContent?.includes('Muat Contoh') ||
          b.textContent?.includes('Portfolio') ||
          b.textContent?.includes('Contoh')
        );
        if (loadBtn) {
          loadBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          loadBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          loadBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          loadBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          loadBtn.click();
          return true;
        }
        return false;
      })()
    `;
    const confirmed = await webview.evaluate(clickLoadStarter);
    expect(confirmed).toBe(true);
    await setTimeout(1000);

    // 5. Asserts editor content updates with Portfolio starter markdown
    let editorValue = '';
    for (let i = 0; i < 25; i++) {
      editorValue = await webview.evaluate('document.querySelector("textarea")?.value || ""');
      if (editorValue.includes('Alex Morgan') && editorValue.includes('Featured Projects')) break;
      await setTimeout(300);
    }
    expect(editorValue).toContain('Alex Morgan');
    expect(editorValue).toContain('Featured Projects');
    expect(editorValue).toContain('CloudPulse');
    expect(editorValue).toContain('Tech Stack');

    // 6. Ensure Document Preview tab is active and asserts preview renders project cards and links
    const switchToPreviewTab = `
      (() => {
        const tabBtn = document.querySelector('[data-testid="tab-preview"]') ||
                       Array.from(document.querySelectorAll('button')).find(b =>
                         b.textContent?.includes('Document Preview') || b.textContent?.includes('Pratinjau') || (b.getAttribute('role') === 'tab' && b.textContent?.includes('Preview'))
                       );
        if (tabBtn) {
          tabBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          tabBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          tabBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          tabBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          tabBtn.click();
          return true;
        }
        return false;
      })()
    `;
    await webview.evaluate(switchToPreviewTab);
    await setTimeout(600);

    let previewCheck = { hasProjects: false, hasLinks: false };
    for (let i = 0; i < 25; i++) {
      previewCheck = await webview.evaluate(`
        (() => {
          const canvas = document.querySelector('[data-testid="document-preview-canvas"]') || document.querySelector('.shadow-2xl');
          if (!canvas) return { hasProjects: false, hasLinks: false };
          const text = canvas.textContent || '';
          const links = Array.from(canvas.querySelectorAll('a'));
          return {
            hasProjects: text.includes('Featured Projects') && (text.includes('CloudPulse') || text.includes('MarkForge')),
            hasLinks: links.length >= 2 || text.includes('alexmorgan.dev') || text.includes('Live Demo'),
          };
        })()
      `);
      if (previewCheck.hasProjects && previewCheck.hasLinks) break;
      await setTimeout(400);
    }
    expect(previewCheck.hasProjects).toBe(true);
    expect(previewCheck.hasLinks).toBe(true);

    // 7. Clicks dynamic audit button "Analyze Portfolio" and asserts "Portfolio Audit" tab shows quality scorecard with checklist items
    const clickAnalyzePortfolio = `
      (() => {
        const btn = document.querySelector('[data-testid="analyze-btn"]') ||
                    Array.from(document.querySelectorAll('button')).find(b =>
                      b.textContent?.includes('Portfolio') || b.textContent?.includes('Portofolio') || b.textContent?.includes('Audit')
                    );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `;
    const analyzeClicked = await webview.evaluate(clickAnalyzePortfolio);
    expect(analyzeClicked).toBe(true);
    await setTimeout(800);

    // Switch to the Portfolio Audit tab
    const switchToPortfolioAudit = `
      (() => {
        const tabBtn = document.querySelector('[data-testid="tab-audit"]') ||
                       Array.from(document.querySelectorAll('button')).find(b =>
                         b.textContent?.includes('Portfolio') || b.textContent?.includes('Portofolio') || b.textContent?.includes('Audit') || (b.getAttribute('role') === 'tab' && b.textContent?.includes('Port'))
                       );
        if (tabBtn) {
          tabBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          tabBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          tabBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          tabBtn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          tabBtn.click();
          return true;
        }
        return false;
      })()
    `;
    const tabSwitched = await webview.evaluate(switchToPortfolioAudit);
    expect(tabSwitched).toBe(true);

    let auditCheck = { hasScore: false, hasChecklist: false };
    for (let i = 0; i < 25; i++) {
      auditCheck = await webview.evaluate(`
        (() => {
          const bodyText = document.body.innerText;
          const hasScore = bodyText.includes('/ 100') || bodyText.includes('SCORE') || bodyText.includes('SKOR') || bodyText.includes('Grade') || bodyText.includes('Nilai');
          const hasChecklist = bodyText.includes('Checklist') || bodyText.includes('Featured Projects') || bodyText.includes('Tech Stack') || bodyText.includes('Proyek Unggulan');
          return { hasScore, hasChecklist };
        })()
      `);
      if (auditCheck.hasScore && auditCheck.hasChecklist) break;
      await setTimeout(400);
    }
    expect(auditCheck.hasScore).toBe(true);
    expect(auditCheck.hasChecklist).toBe(true);
  }, 25000);

  itIfSupported('should verify Custom Type modal opens when triggered', async () => {
    const triggerCustomModal = `
      (() => {
        const btn = document.querySelector('[data-testid="manage-custom-types-btn"]') ||
                    document.querySelector('button[title*="Custom"]') ||
                    document.querySelector('button[title*="Kustom"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `;
    const triggered = await webview.evaluate(triggerCustomModal);
    expect(triggered).toBe(true);
    await setTimeout(600);

    let modalOpened = false;
    for (let i = 0; i < 20; i++) {
      modalOpened = await webview.evaluate(`
        (() => {
          const dialog = document.querySelector('[role="dialog"]');
          if (!dialog) return false;
          const text = dialog.textContent || '';
          return text.includes('Custom Document Types Manager') ||
                 text.includes('Pengelola Tipe Dokumen Kustom') ||
                 text.includes('Simpan Tipe Kustom') ||
                 text.includes('Save Custom Type');
        })()
      `);
      if (modalOpened) break;
      await setTimeout(300);
    }
    expect(modalOpened).toBe(true);

    // Verify modal elements
    const modalFields = await webview.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return null;
        return {
          hasTypeNameInput: !!dialog.querySelector('input[placeholder*="API Specification"]'),
          hasSaveBtn: Array.from(dialog.querySelectorAll('button')).some(b => b.textContent?.includes('Save Custom Type')),
          hasCloseBtn: Array.from(dialog.querySelectorAll('button')).some(b => b.textContent?.includes('Close')),
        };
      })()
    `);
    expect(modalFields).toBeDefined();
    expect(modalFields?.hasSaveBtn).toBe(true);

    // Close the modal
    await webview.evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        const closeBtn = dialog ? Array.from(dialog.querySelectorAll('button')).find(b => b.textContent?.includes('Close') || b.textContent?.includes('Tutup')) : null;
        if (closeBtn) closeBtn.click();
      })()
    `);
    await setTimeout(400);
  }, 15000);

  itIfSupported('should toggle language switcher between Indonesian (ID) and English (EN)', async () => {
    const toggleLanguage = `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent?.includes('ID') || b.textContent?.includes('EN')
        );
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `;

    const clicked = await webview.evaluate(toggleLanguage);
    expect(clicked).toBe(true);
    await setTimeout(600);

    // Verify language toggled
    const headerContent = await webview.evaluate('document.querySelector("header")?.innerText || ""');
    expect(headerContent.includes('ID') || headerContent.includes('EN')).toBe(true);
    expect(headerContent.includes('DOCX') && headerContent.includes('PDF')).toBe(true);
  }, 10000);

  itIfSupported('should capture E2E screenshot of dynamic types studio', async () => {
    const blob = await webview.screenshot();
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);

    const outputPath = path.resolve(import.meta.dir, '../../../output/dynamic-types-studio.png');
    await Bun.write(outputPath, blob);

    const fileExists = await Bun.file(outputPath).exists();
    expect(fileExists).toBe(true);
  }, 10000);
});
