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
} from '../../core/src';

const program = new Command();

program
  .name('markforge')
  .description('Universal Markdown to Document (PDF & DOCX) Engine with ATS Optimization')
  .version('1.0.0');

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
  .action(async (filePath: string, options) => {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(pc.red(`✖ Error: Input file not found: ${resolvedPath}`));
      process.exit(1);
    }

    const runBuild = async () => {
      const startTime = Date.now();
      const baseName = path.basename(resolvedPath, path.extname(resolvedPath));
      const targetDir = options.outdir
        ? path.resolve(process.cwd(), options.outdir)
        : path.dirname(resolvedPath);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      console.log(pc.cyan(`\n⚡ MarkForge: Building "${pc.bold(baseName)}" using [${options.template}] template...`));
      const markdown = fs.readFileSync(resolvedPath, 'utf8');
      const format = options.format.toLowerCase();

      let generatedFiles: string[] = [];

      // 1. DOCX
      if (['docx', 'both', 'all'].includes(format)) {
        try {
          const docxBuffer = await compileMarkdownToDocx(markdown, {
            template: options.template,
            title: baseName,
          });
          const outDocx = path.join(targetDir, `${baseName}.docx`);
          fs.writeFileSync(outDocx, docxBuffer);
          const sizeKb = (docxBuffer.length / 1024).toFixed(1);
          console.log(`   ${pc.green('✔ DOCX')} → ${pc.dim(outDocx)} (${sizeKb} KB)`);
          generatedFiles.push(outDocx);
        } catch (err: any) {
          console.error(`   ${pc.red('✖ DOCX failed:')} ${err.message}`);
        }
      }

      // 2. PDF
      if (['pdf', 'both', 'all'].includes(format)) {
        try {
          const pdfResult = await compileMarkdownToPdf(markdown, {
            template: options.template,
            title: baseName,
          });
          const outPdf = path.join(targetDir, `${baseName}.pdf`);
          fs.writeFileSync(outPdf, pdfResult.buffer);
          const sizeKb = (pdfResult.sizeBytes / 1024).toFixed(1);
          console.log(`   ${pc.green('✔ PDF ')} → ${pc.dim(outPdf)} (${sizeKb} KB) [${pc.cyan(pdfResult.engineUsed)}]`);
          generatedFiles.push(outPdf);
        } catch (err: any) {
          console.error(`   ${pc.red('✖ PDF failed:')} ${err.message}`);
        }
      }

      // 3. HTML
      if (['html', 'all'].includes(format)) {
        try {
          const htmlContent = compileMarkdownToHtml(markdown, {
            template: options.template,
            title: baseName,
          });
          const outHtml = path.join(targetDir, `${baseName}.html`);
          fs.writeFileSync(outHtml, htmlContent, 'utf8');
          console.log(`   ${pc.green('✔ HTML')} → ${pc.dim(outHtml)}`);
          generatedFiles.push(outHtml);
        } catch (err: any) {
          console.error(`   ${pc.red('✖ HTML failed:')} ${err.message}`);
        }
      }

      const elapsed = Date.now() - startTime;
      console.log(pc.dim(`✨ Done in ${elapsed}ms\n`));

      if (options.open && generatedFiles.length > 0) {
        const fileToOpen = generatedFiles[0];
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
    // Re-dispatch to build with --watch
    program.commands
      .find((c) => c.name() === 'build')
      ?.parse(['build', file, '-t', options.template, '-f', options.format, '-w'], { from: 'user' });
  });

// ─── Analyze Command (ATS Scorecard) ───────────────────────────────────────
program
  .command('analyze')
  .description('Audit document for ATS compatibility, action verbs, and structure')
  .argument('<file>', 'Input Markdown file')
  .action((filePath: string) => {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(pc.red(`✖ Error: File not found: ${resolvedPath}`));
      process.exit(1);
    }

    const markdown = fs.readFileSync(resolvedPath, 'utf8');
    const report = analyzeMarkdownDocument(markdown);

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
    for (const sec of report.sections) {
      const status = sec.found ? pc.green('✔ Found') : pc.red('✖ Missing');
      console.log(`    ${status} ${pc.dim('—')} ${sec.section} ${pc.dim(`(weight: ${sec.weight}pts)`)}`);
    }

    if (report.actionVerbsFound.length > 0) {
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

      if (id === 'tech-spec') {
        content = `# RFC-104: Unified Document Compilation Pipeline\n*Author: Architecture Team | Status: Proposed | Date: 2026-09-07*\n\n## Executive Summary\nThis technical specification outlines the design of MarkForge's multi-target rendering engine capable of compiling markdown to DOCX, PDF, and HTML with sub-50ms latency.\n\n## Architecture Overview\n> The compilation pipeline processes markdown through an Abstract Syntax Tree (AST) transformer to emit native OpenXML (DOCX) elements.\n\n| Component | Technology | Responsibility |\n|---|---|---|\n| AST Parser | Custom Regex/State Machine | Fast tokenization of headings, lists, tables |\n| DOCX Generator | docx-js OpenXML | Native Word document assembly |\n| PDF Converter | LibreOffice / Weasyprint | Headless PDF compilation with font embedding |\n\n## Code Example\n\`\`\`typescript\nimport { compileMarkdownToDocx } from '@markforge/core';\n\nconst docx = await compileMarkdownToDocx('# Hello World');\n\`\`\`\n`;
      }

      fs.writeFileSync(path.resolve(process.cwd(), targetFile), content, 'utf8');
      console.log(pc.green(`✔ Scaffolded "${id}" template into: ${targetFile}`));
    }
  });

// ─── Doctor Command ─────────────────────────────────────────────────────────
program
  .command('doctor')
  .description('Check system rendering engines and dependencies')
  .action(() => {
    const engines = checkSystemEngines();
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
