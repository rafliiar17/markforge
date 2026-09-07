import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import pc from 'picocolors';
import chokidar from 'chokidar';
import {
  compileMarkdownToDocx,
  compileMarkdownToPdf,
  compileMarkdownToHtml,
  analyzeMarkdownDocument,
  checkSystemEngines,
  BUILTIN_TEMPLATES,
  getTemplate,
  TemplateId,
  loggerRegistry,
  generateTraceId,
  extractASTStats,
  parseMarkdownToAST,
  formatServerTiming,
  CompilationTelemetry,
} from '@markforge/core';

const program = new Command();

program
  .name('markforge')
  .description('Universal Markdown to Document (PDF & DOCX) Engine with ATS Optimization & Observability')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose debug logging')
  .option('-q, --quiet', 'Suppress all non-essential output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
      loggerRegistry.setLevel('debug');
    } else if (opts.quiet) {
      loggerRegistry.setLevel('silent');
    }
  });

// ─── Build Command ──────────────────────────────────────────────────────────
program
  .command('build')
  .description('Compile a markdown document to PDF and/or DOCX')
  .argument('<file>', 'Input Markdown file (.md)')
  .option('-t, --template <name>', 'Template name (ats-classic, modern-accent, tech-spec, academic, executive)', 'ats-classic')
  .option('-f, --format <format>', 'Target format: "pdf", "docx", "html", "both", or "all"', 'both')
  .option('-o, --outdir <dir>', 'Output directory (default: same as input or ./output)', '')
  .option('-w, --watch', 'Watch input file for real-time rebuilds', false)
  .option('--open', 'Open generated document after building', false)
  .option('--json', 'Output results as machine-readable JSON with telemetry', false)
  .option('--telemetry', 'Print detailed execution timing waterfall and metrics', false)
  .action(async (filePath: string, options) => {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(pc.red(`✖ Error: Input file not found: ${resolvedPath}`));
      process.exit(1);
    }

    const runBuild = async () => {
      const traceId = generateTraceId();
      const startTime = performance.now();
      const baseName = path.basename(resolvedPath, path.extname(resolvedPath));
      const targetDir = options.outdir
        ? path.resolve(process.cwd(), options.outdir)
        : path.dirname(resolvedPath);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      if (!options.json && !program.opts().quiet) {
        console.log(pc.cyan(`\n⚡ MarkForge: Building "${pc.bold(baseName)}" using [${options.template}] template...`));
        console.log(pc.dim(`   Trace ID: ${traceId}`));
      }

      const markdown = fs.readFileSync(resolvedPath, 'utf8');
      const format = options.format.toLowerCase();

      // Measure parse phase
      const parseStart = performance.now();
      const ast = parseMarkdownToAST(markdown);
      const parseTimeMs = performance.now() - parseStart;
      const astStats = extractASTStats(ast);

      const telemetry: CompilationTelemetry = {
        traceId,
        timestamp: new Date().toISOString(),
        documentTitle: baseName,
        templateId: options.template,
        format: options.format,
        metrics: {
          parseTimeMs,
          totalTimeMs: 0,
        },
        astStats,
        outputSizeBytes: 0,
        serverTimingHeader: '',
      };

      let generatedFiles: { format: string; path: string; sizeBytes: number; engine?: string }[] = [];

      // 1. DOCX
      if (['docx', 'both', 'all'].includes(format)) {
        try {
          const docxStart = performance.now();
          const docxBuffer = await compileMarkdownToDocx(markdown, {
            template: options.template,
            title: baseName,
          });
          const docxTimeMs = performance.now() - docxStart;
          telemetry.metrics.docxTimeMs = docxTimeMs;

          const outDocx = path.join(targetDir, `${baseName}.docx`);
          fs.writeFileSync(outDocx, docxBuffer);
          telemetry.outputSizeBytes += docxBuffer.length;

          generatedFiles.push({ format: 'docx', path: outDocx, sizeBytes: docxBuffer.length });
          if (!options.json && !program.opts().quiet) {
            const sizeKb = (docxBuffer.length / 1024).toFixed(1);
            console.log(`   ${pc.green('✔ DOCX')} → ${pc.dim(outDocx)} (${sizeKb} KB, ${docxTimeMs.toFixed(0)}ms)`);
          }
        } catch (err: any) {
          if (!options.json) console.error(`   ${pc.red('✖ DOCX failed:')} ${err.message}`);
        }
      }

      // 2. PDF
      if (['pdf', 'both', 'all'].includes(format)) {
        try {
          const pdfStart = performance.now();
          const pdfResult = await compileMarkdownToPdf(markdown, {
            template: options.template,
            title: baseName,
          });
          const pdfTimeMs = performance.now() - pdfStart;
          telemetry.metrics.pdfTimeMs = pdfTimeMs;
          telemetry.engine = {
            primaryEngine: 'soffice',
            actualEngineUsed: pdfResult.engineUsed,
            fallbackOccurred: !pdfResult.engineUsed.includes('LibreOffice'),
            attemptedEngines: ['soffice'],
          };

          const outPdf = path.join(targetDir, `${baseName}.pdf`);
          fs.writeFileSync(outPdf, pdfResult.buffer);
          telemetry.outputSizeBytes += pdfResult.sizeBytes;

          generatedFiles.push({
            format: 'pdf',
            path: outPdf,
            sizeBytes: pdfResult.sizeBytes,
            engine: pdfResult.engineUsed,
          });

          if (!options.json && !program.opts().quiet) {
            const sizeKb = (pdfResult.sizeBytes / 1024).toFixed(1);
            console.log(`   ${pc.green('✔ PDF ')} → ${pc.dim(outPdf)} (${sizeKb} KB, ${pdfTimeMs.toFixed(0)}ms) [${pc.cyan(pdfResult.engineUsed)}]`);
          }
        } catch (err: any) {
          if (!options.json) console.error(`   ${pc.red('✖ PDF failed:')} ${err.message}`);
        }
      }

      // 3. HTML
      if (['html', 'all'].includes(format)) {
        try {
          const htmlStart = performance.now();
          const htmlContent = compileMarkdownToHtml(markdown, {
            template: options.template,
            title: baseName,
          });
          const htmlTimeMs = performance.now() - htmlStart;
          telemetry.metrics.htmlTimeMs = htmlTimeMs;

          const outHtml = path.join(targetDir, `${baseName}.html`);
          fs.writeFileSync(outHtml, htmlContent, 'utf8');

          generatedFiles.push({ format: 'html', path: outHtml, sizeBytes: Buffer.byteLength(htmlContent) });
          if (!options.json && !program.opts().quiet) {
            console.log(`   ${pc.green('✔ HTML')} → ${pc.dim(outHtml)} (${htmlTimeMs.toFixed(0)}ms)`);
          }
        } catch (err: any) {
          if (!options.json) console.error(`   ${pc.red('✖ HTML failed:')} ${err.message}`);
        }
      }

      telemetry.metrics.totalTimeMs = performance.now() - startTime;
      telemetry.serverTimingHeader = formatServerTiming(telemetry.metrics);

      // JSON output for CI / script automation
      if (options.json) {
        console.log(JSON.stringify({ success: true, files: generatedFiles, telemetry }, null, 2));
        return;
      }

      if (!program.opts().quiet) {
        console.log(pc.dim(`✨ Done in ${telemetry.metrics.totalTimeMs.toFixed(1)}ms`));
      }

      // Telemetry waterfall display
      if (options.telemetry) {
        console.log(pc.bold('\n📊 Compilation Observability Waterfall:'));
        console.log(`   Parse Markdown:   ${telemetry.metrics.parseTimeMs.toFixed(1).padStart(7)} ms  [${astStats.totalNodes} AST nodes]`);
        if (telemetry.metrics.docxTimeMs !== undefined) {
          console.log(`   DOCX Assemble:    ${telemetry.metrics.docxTimeMs.toFixed(1).padStart(7)} ms  [OpenXML Packer]`);
        }
        if (telemetry.metrics.pdfTimeMs !== undefined) {
          console.log(`   PDF Headless:     ${telemetry.metrics.pdfTimeMs.toFixed(1).padStart(7)} ms  [${telemetry.engine?.actualEngineUsed}]`);
        }
        console.log(`   Total Duration:   ${telemetry.metrics.totalTimeMs.toFixed(1).padStart(7)} ms`);
        console.log(`   Server-Timing:    ${pc.dim(telemetry.serverTimingHeader)}\n`);
      }

      if (options.open && generatedFiles.length > 0) {
        const fileToOpen = generatedFiles[0].path;
        const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        exec(`${cmd} "${fileToOpen}"`);
      }
    };

    await runBuild();

    if (options.watch) {
      console.log(pc.yellow(`👀 Watching for changes in ${path.basename(resolvedPath)}... (Press Ctrl+C to stop)`));
      const watcher = chokidar.watch(resolvedPath, { ignoreInitial: true });
      watcher.on('change', async () => {
        console.log(pc.dim(`\n↻ File changed, rebuilding...`));
        await runBuild();
      });
    }
  });

// ─── Watch Command (Shortcut) ───────────────────────────────────────────────
program
  .command('watch')
  .description('Watch and rebuild markdown document automatically on change')
  .argument('<file>', 'Input Markdown file')
  .option('-t, --template <name>', 'Template name', 'ats-classic')
  .option('-f, --format <format>', 'Target format: pdf, docx, html, both, all', 'both')
  .action((file: string, options) => {
    program.commands
      .find((c) => c.name() === 'build')
      ?.parse(['build', file, '-t', options.template, '-f', options.format, '-w'], { from: 'user' });
  });

// ─── Preview Command (Terminal ANSI Preview) ────────────────────────────────
program
  .command('preview')
  .alias('view')
  .description('Preview Markdown document in terminal with styling via native Bun.markdown engine')
  .argument('<file>', 'Input Markdown file')
  .action((filePath: string) => {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(pc.red(`✖ Error: File not found: ${resolvedPath}`));
      process.exit(1);
    }

    const markdown = fs.readFileSync(resolvedPath, 'utf8');
    const bun = (globalThis as any).Bun;

    console.log(pc.bold(pc.cyan(`\n⚡ MarkForge Terminal Preview: ${pc.white(path.basename(resolvedPath))}\n`)));

    if (bun?.markdown?.ansi) {
      const rendered = bun.markdown.ansi(markdown);
      console.log(rendered);
    } else {
      console.log(markdown);
    }
  });

// ─── Analyze Command (ATS Scorecard) ───────────────────────────────────────
program
  .command('analyze')
  .description('Audit document for ATS compatibility, action verbs, and structure')
  .argument('<file>', 'Input Markdown file')
  .option('--json', 'Output audit report as JSON', false)
  .action((filePath: string, options) => {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(pc.red(`✖ Error: File not found: ${resolvedPath}`));
      process.exit(1);
    }

    const markdown = fs.readFileSync(resolvedPath, 'utf8');
    const report = analyzeMarkdownDocument(markdown);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log(pc.bold(pc.cyan('\n╔═════════════════════════════════════════════════════════════════════╗')));
    console.log(pc.bold(pc.cyan('║                   MARKFORGE ATS & QUALITY AUDIT                     ║')));
    console.log(pc.bold(pc.cyan('╚═════════════════════════════════════════════════════════════════════╝\n')));

    let gradeColor = pc.green;
    if (report.grade === 'B') gradeColor = pc.cyan;
    if (report.grade === 'C') gradeColor = pc.yellow;
    if (report.grade === 'D') gradeColor = pc.red;

    console.log(`  ${pc.bold('ATS Score:')}  ${gradeColor(pc.bold(`${report.score} / 100`))} [${gradeColor(report.grade)}]`);
    console.log(`  ${pc.bold('Word Count:')} ${report.wordCount} words (~${report.readingTimeMinutes} min reading time)`);
    console.log(`  ${pc.bold('Impact Verbs Found:')} ${pc.magenta(String(report.actionVerbsCount))} distinct verbs`);
    console.log(`  ${pc.bold('Quantified Accomplishments:')} ${pc.blue(String(report.quantifiedMetricsCount))} metrics/metrics found\n`);

    console.log(pc.bold('  Standard Sections Checklist:'));
    for (const sec of report.sections || []) {
      const status = sec.found ? pc.green('✔ Found') : pc.red('✖ Missing');
      console.log(`    ${status} ${pc.dim('—')} ${sec.section} ${pc.dim(`(weight: ${sec.weight}pts)`)}`);
    }

    if (report.actionVerbsFound && report.actionVerbsFound.length > 0) {
      console.log(`\n  ${pc.bold('High-Impact Verbs Detected:')}`);
      console.log(`    ${pc.dim(report.actionVerbsFound.slice(0, 15).join(', '))}${report.actionVerbsFound.length > 15 ? '...' : ''}`);
    }

    if (report.warnings.length > 0) {
      console.log(`\n  ${pc.yellow(pc.bold('⚠ Critical Warnings:'))}`);
      for (const w of report.warnings) {
        console.log(`    ${pc.yellow('•')} ${w}`);
      }
    }

    if (report.suggestions.length > 0) {
      console.log(`\n  ${pc.cyan(pc.bold('💡 Optimization Suggestions:'))}`);
      for (const s of report.suggestions) {
        console.log(`    ${pc.cyan('•')} ${s}`);
      }
    }

    console.log('\n' + pc.dim('───────────────────────────────────────────────────────────────────────') + '\n');
  });

// ─── Templates Command ──────────────────────────────────────────────────────
program
  .command('templates')
  .description('List available document templates or scaffold starter documents')
  .argument('[action]', 'Action: "list" or "scaffold"', 'list')
  .argument('[name]', 'Template name for scaffold (e.g. ats-classic, tech-spec)')
  .argument('[out]', 'Target output filename')
  .action((action: string, templateName?: string, outPath?: string) => {
    if (action === 'list' || !action) {
      console.log(pc.bold('\n📋 Available MarkForge Templates:\n'));
      for (const [id, t] of Object.entries(BUILTIN_TEMPLATES)) {
        console.log(`  ${pc.cyan(pc.bold(id))} ${pc.dim(`[${t.category}]`)}`);
        console.log(`    ${pc.bold(t.name)} — ${t.description}`);
        console.log(`    ${pc.dim('Features: ' + t.features.join(' • '))}\n`);
      }
      return;
    }

    if (action === 'scaffold') {
      const id = (templateName || 'ats-classic') as TemplateId;
      const t = getTemplate(id);
      const targetFile = outPath || `${id}-example.md`;

      let content = `# John Doe\n*Senior Software Architect*\njohn.doe@example.com | +1 (555) 019-2834 | linkedin.com/in/johndoe | San Francisco, CA\n\n## Professional Summary\nAccomplished engineer with 8+ years specializing in distributed systems and cloud infrastructure. Architected microservice platforms handling 250M+ requests/month.\n\n## Work Experience\n### Principal Engineer | Global Tech Systems\n*2022 - Present | San Francisco, CA*\n- Spearheaded transition to event-driven architecture, reducing latency by 45%.\n- Automated deployment pipelines, boosting developer velocity by 3x.\n\n### Senior Software Engineer | HyperScale Inc.\n*2019 - 2022 | Austin, TX*\n- Engineered real-time distributed telemetry collector using Go and Kafka.\n- Mentored 6 engineering interns and junior engineers.\n\n## Education\n### B.S. Computer Science | University of California, Berkeley\n*2015 - 2019*\n\n## Technical Skills\n- **Languages:** TypeScript, Go, Rust, Python, SQL\n- **Infrastructure:** Kubernetes, Docker, AWS, Terraform, Cloudflare\n`;

      fs.writeFileSync(path.resolve(process.cwd(), targetFile), content, 'utf8');
      console.log(pc.green(`✔ Scaffolded "${id}" template into: ${targetFile}`));
    }
  });

// ─── Doctor Command ─────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Check system rendering engines and dependencies')
  .option('--json', 'Output diagnostics as JSON', false)
  .action((options) => {
    const engines = checkSystemEngines();
    const templates = Object.keys(BUILTIN_TEMPLATES);
    const bun = (globalThis as any).Bun;
    const hasBunMarkdown = Boolean(bun?.markdown?.html && bun?.markdown?.ansi);

    if (options.json) {
      console.log(JSON.stringify({ engines: { ...engines, bunMarkdown: hasBunMarkdown }, templates }, null, 2));
      return;
    }

    console.log(pc.bold(pc.cyan('\n🩺 MarkForge Environment Doctor:\n')));

    const printItem = (name: string, ok: boolean, purpose: string, hint: string) => {
      const badge = ok ? pc.green('✔ INSTALLED') : pc.red('✖ NOT FOUND');
      console.log(`  ${badge} ${pc.bold(name)} — ${pc.dim(purpose)}`);
      if (!ok) {
        console.log(`    ${pc.yellow('➜ Install via:')} ${hint}`);
      }
    };

    printItem('LibreOffice (soffice)', engines.soffice, 'Native DOCX→PDF 1:1 parity rendering', 'sudo pacman -S libreoffice-still  OR  apt install libreoffice');
    printItem('Weasyprint', engines.weasyprint, 'Fast CSS-paged HTML→PDF rendering fallback', 'pip install weasyprint');
    printItem('Pandoc', engines.pandoc, 'Universal document converter fallback', 'sudo pacman -S pandoc  OR  apt install pandoc');
    printItem('Node.js runtime', engines.node, 'JavaScript runtime environment', 'https://nodejs.org');
    printItem('Bun runtime', engines.bun, 'Fast all-in-one JavaScript runtime & package manager', 'curl -fsSL https://bun.sh/install | bash');
    printItem('Native Bun Markdown (Bun.markdown)', hasBunMarkdown, 'Native Zig CommonMark/GFM & ANSI terminal engine', 'Upgrade Bun to >= 1.3.8');

    console.log(pc.bold('\n  Document Templates Detected:'));
    for (const [id, t] of Object.entries(BUILTIN_TEMPLATES)) {
      console.log(`    ${pc.green('✔')} ${pc.cyan(id)} ${pc.dim(`(${t.name})`)}`);
    }

    console.log('\n' + pc.dim('───────────────────────────────────────────────────────────────────────'));
    if (engines.soffice) {
      console.log(pc.green('🎉 Ideal setup: LibreOffice detected! You have 100% DOCX and PDF parity.'));
    } else if (engines.weasyprint) {
      console.log(pc.cyan('ℹ Weasyprint detected. PDF rendering via HTML print engine is active.'));
    } else {
      console.log(pc.yellow('⚠ No PDF rendering engine installed. DOCX and HTML will work, but PDF requires LibreOffice or Weasyprint.'));
    }
    console.log();
  });

// ─── Init Command ───────────────────────────────────────────────────────────
program
  .command('init')
  .description('Initialize MarkForge configuration in current workspace')
  .action(() => {
    const configPath = path.resolve(process.cwd(), 'markforge.config.json');
    if (fs.existsSync(configPath)) {
      console.log(pc.yellow('⚠ markforge.config.json already exists.'));
      return;
    }

    const config = {
      defaultTemplate: 'ats-classic',
      defaultFormat: 'both',
      paperSize: 'A4',
      outputDir: './output',
      atsOptimization: {
        warnMissingSections: true,
        enforceQuantifiedMetrics: true,
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(pc.green(`✔ Created configuration: ${pc.bold('markforge.config.json')}`));
  });

program.parse(process.argv);
