import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CompileOptions, ConvertResult, SystemEngineCheck } from './types';
import { compileMarkdownToDocx } from './docx-compiler';
import { compileMarkdownToHtml } from './html-compiler';
import { createLogger } from './logger';

const execFileAsync = promisify(execFile);
const logger = createLogger('markforge:pdf');

export function checkSystemEngines(): SystemEngineCheck {
  const check = (cmd: string): boolean => {
    try {
      execSync(`command -v ${cmd}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  };

  const engines = {
    soffice: check('soffice'),
    pandoc: check('pandoc'),
    weasyprint: check('weasyprint'),
    node: check('node'),
    bun: check('bun'),
  };

  logger.debug('System engines detected', engines);
  return engines;
}

export async function compileMarkdownToPdf(
  markdown: string,
  options: CompileOptions = {}
): Promise<ConvertResult> {
  const startTime = Date.now();
  const engines = checkSystemEngines();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markforge-'));
  const attemptedEngines: string[] = [];

  logger.info('Starting PDF compilation pipeline', {
    template: options.template || 'ats-classic',
    paperSize: options.paperSize || 'A4',
    contentLength: markdown.length,
  });

  try {
    // Strategy 1: LibreOffice (1:1 parity with DOCX)
    if (engines.soffice) {
      attemptedEngines.push('soffice');
      logger.debug('Attempting Strategy 1: LibreOffice (DOCX→PDF)');

      const docxStart = Date.now();
      const docxBuffer = await compileMarkdownToDocx(markdown, options);
      logger.debug(`DOCX intermediate buffer generated in ${Date.now() - docxStart}ms (${docxBuffer.length} bytes)`);

      const tempDocxPath = path.join(tempDir, 'document.docx');
      fs.writeFileSync(tempDocxPath, docxBuffer);

      const sofficeStart = Date.now();
      await execFileAsync('soffice', [
        '--headless',
        '--convert-to',
        'pdf',
        tempDocxPath,
        '--outdir',
        tempDir,
      ]);
      logger.debug(`LibreOffice headless execution completed in ${Date.now() - sofficeStart}ms`);

      const tempPdfPath = path.join(tempDir, 'document.pdf');
      if (fs.existsSync(tempPdfPath)) {
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        const totalDuration = Date.now() - startTime;
        logger.info('PDF compiled successfully via LibreOffice', {
          sizeBytes: pdfBuffer.length,
          durationMs: totalDuration,
        });

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
      attemptedEngines.push('weasyprint');
      logger.warn('LibreOffice unavailable or failed; falling back to Weasyprint (HTML→PDF)');

      const htmlContent = compileMarkdownToHtml(markdown, options);
      const tempHtmlPath = path.join(tempDir, 'document.html');
      const tempPdfPath = path.join(tempDir, 'document.pdf');
      fs.writeFileSync(tempHtmlPath, htmlContent);

      await execFileAsync('weasyprint', [tempHtmlPath, tempPdfPath]);

      if (fs.existsSync(tempPdfPath)) {
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        logger.info('PDF compiled via Weasyprint fallback', { sizeBytes: pdfBuffer.length });
        return {
          buffer: pdfBuffer,
          format: 'pdf',
          sizeBytes: pdfBuffer.length,
          engineUsed: 'Weasyprint (HTML→PDF)',
          warnings: ['Compiled via Weasyprint fallback because LibreOffice is not available.'],
        };
      }
    }

    // Strategy 3: Pandoc fallback
    if (engines.pandoc) {
      attemptedEngines.push('pandoc');
      logger.warn('Falling back to Pandoc converter');

      const tempMdPath = path.join(tempDir, 'document.md');
      const tempPdfPath = path.join(tempDir, 'document.pdf');
      fs.writeFileSync(tempMdPath, markdown);

      await execFileAsync('pandoc', [
        tempMdPath,
        '-o',
        tempPdfPath,
        '--pdf-engine=weasyprint',
      ]).catch(async () => {
        await execFileAsync('pandoc', [tempMdPath, '-o', tempPdfPath]);
      });

      if (fs.existsSync(tempPdfPath)) {
        const pdfBuffer = fs.readFileSync(tempPdfPath);
        logger.info('PDF compiled via Pandoc fallback', { sizeBytes: pdfBuffer.length });
        return {
          buffer: pdfBuffer,
          format: 'pdf',
          sizeBytes: pdfBuffer.length,
          engineUsed: 'Pandoc (Markdown→PDF)',
          warnings: ['Compiled via Pandoc fallback.'],
        };
      }
    }

    const err = new Error(
      `No PDF rendering engine available. Attempted: [${attemptedEngines.join(', ')}]. Please install LibreOffice (soffice) or Weasyprint.`
    );
    logger.error(err.message);
    throw err;
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      logger.debug('Cleaned up temporary conversion artifacts', { tempDir });
    } catch {
      // ignore cleanup errors
    }
  }
}
