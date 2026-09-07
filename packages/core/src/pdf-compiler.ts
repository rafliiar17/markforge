import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CompileOptions, ConvertResult, SystemEngineCheck } from './types';
import { compileMarkdownToDocx } from './docx-compiler';
import { compileMarkdownToHtml } from './html-compiler';

const execFileAsync = promisify(execFile);

export function checkSystemEngines(): SystemEngineCheck {
  const check = (cmd: string): boolean => {
    try {
      execSync(`command -v ${cmd}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  };

  return {
    soffice: check('soffice'),
    pandoc: check('pandoc'),
    weasyprint: check('weasyprint'),
    node: check('node'),
    bun: check('bun'),
  };
}

export async function compileMarkdownToPdf(
  markdown: string,
  options: CompileOptions = {}
): Promise<ConvertResult> {
  const engines = checkSystemEngines();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markforge-'));

  try {
    // Strategy 1: LibreOffice (1:1 parity with DOCX)
    if (engines.soffice) {
      const docxBuffer = await compileMarkdownToDocx(markdown, options);
      const tempDocxPath = path.join(tempDir, 'document.docx');
      fs.writeFileSync(tempDocxPath, docxBuffer);

      await execFileAsync('soffice', [
        '--headless',
        '--convert-to',
        'pdf',
        tempDocxPath,
        '--outdir',
        tempDir,
      ]);

      const tempPdfPath = path.join(tempDir, 'document.pdf');
      if (fs.existsSync(tempPdfPath)) {
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        return {
          buffer: pdfBuffer,
          format: 'pdf',
          sizeBytes: pdfBuffer.length,
          engineUsed: 'LibreOffice (DOCX→PDF)',
        };
      }
    }

    // Strategy 2: Weasyprint from HTML
    if (engines.weasyprint) {
      const htmlContent = compileMarkdownToHtml(markdown, options);
      const tempHtmlPath = path.join(tempDir, 'document.html');
      const tempPdfPath = path.join(tempDir, 'document.pdf');
      fs.writeFileSync(tempHtmlPath, htmlContent);

      await execFileAsync('weasyprint', [tempHtmlPath, tempPdfPath]);

      if (fs.existsSync(tempPdfPath)) {
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        return {
          buffer: pdfBuffer,
          format: 'pdf',
          sizeBytes: pdfBuffer.length,
          engineUsed: 'Weasyprint (HTML→PDF)',
        };
      }
    }

    // Strategy 3: Pandoc fallback
    if (engines.pandoc) {
      const tempMdPath = path.join(tempDir, 'document.md');
      const tempPdfPath = path.join(tempDir, 'document.pdf');
      fs.writeFileSync(tempMdPath, markdown);

      await execFileAsync('pandoc', [
        tempMdPath,
        '-o',
        tempPdfPath,
        '--pdf-engine=weasyprint',
      ]).catch(async () => {
        // Fallback without engine
        await execFileAsync('pandoc', [tempMdPath, '-o', tempPdfPath]);
      });

      if (fs.existsSync(tempPdfPath)) {
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        return {
          buffer: pdfBuffer,
          format: 'pdf',
          sizeBytes: pdfBuffer.length,
          engineUsed: 'Pandoc (Markdown→PDF)',
        };
      }
    }

    throw new Error(
      'No PDF rendering engine available. Please install LibreOffice (`soffice`), Weasyprint, or Pandoc.'
    );
  } finally {
    // Cleanup temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
