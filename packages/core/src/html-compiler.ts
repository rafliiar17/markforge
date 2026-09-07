import { CompileOptions, TemplateStyleConfig } from './types';
import { getTemplate } from './templates';
import { parseMarkdownToAST, parseInlineSpans, InlineSpan } from './parser';

function spansToHtml(spans: InlineSpan[]): string {
  return spans
    .map((s) => {
      let text = s.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (s.type === 'bold') return `<strong>${text}</strong>`;
      if (s.type === 'italic') return `<em>${text}</em>`;
      if (s.type === 'code') return `<code>${text}</code>`;
      if (s.type === 'link' && s.url) {
        return `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
      return text;
    })
    .join('');
}

export function compileMarkdownToHtml(
  markdown: string,
  options: CompileOptions = {}
): string {
  const templateDef = getTemplate(options.template);
  const style: TemplateStyleConfig = {
    ...templateDef.style,
    ...(options.customStyle || {}),
  };

  const nodes = parseMarkdownToAST(markdown);
  const bodyHtml: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'h1': {
        const align = templateDef.category === 'resume' ? 'text-center' : 'text-left';
        bodyHtml.push(`<h1 class="doc-h1 ${align}">${node.text}</h1>`);
        break;
      }
      case 'subtitle': {
        const align = templateDef.category === 'resume' ? 'text-center' : 'text-left';
        bodyHtml.push(`<p class="doc-subtitle ${align}"><em>${node.text}</em></p>`);
        break;
      }
      case 'contact_bar': {
        const spans = parseInlineSpans(node.text || '');
        bodyHtml.push(`<div class="doc-contact-bar text-center">${spansToHtml(spans)}</div>`);
        break;
      }
      case 'h2': {
        const isResume = templateDef.category === 'resume';
        const titleText = isResume ? (node.text || '').toUpperCase() : node.text || '';
        bodyHtml.push(`<h2 class="doc-h2">${titleText}</h2>`);
        break;
      }
      case 'h3': {
        const spans = parseInlineSpans(node.text || '');
        bodyHtml.push(`<h3 class="doc-h3">${spansToHtml(spans)}</h3>`);
        break;
      }
      case 'h4': {
        const spans = parseInlineSpans(node.text || '');
        bodyHtml.push(`<h4 class="doc-h4">${spansToHtml(spans)}</h4>`);
        break;
      }
      case 'bullet': {
        const spans = parseInlineSpans(node.text || '');
        const indentClass = node.level ? `ml-${node.level * 4}` : '';
        bodyHtml.push(`<li class="doc-bullet ${indentClass}">${spansToHtml(spans)}</li>`);
        break;
      }
      case 'code_block': {
        const safeCode = (node.text || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        bodyHtml.push(`<pre class="doc-code-block"><code>${safeCode}</code></pre>`);
        break;
      }
      case 'quote': {
        const spans = parseInlineSpans(node.text || '');
        bodyHtml.push(`<blockquote class="doc-quote">${spansToHtml(spans)}</blockquote>`);
        break;
      }
      case 'table': {
        if (node.tableRows && node.tableRows.length > 0) {
          let tableHtml = '<div class="doc-table-wrapper"><table class="doc-table">';
          node.tableRows.forEach((row, rIdx) => {
            tableHtml += '<tr>';
            row.forEach((cell) => {
              const tag = rIdx === 0 ? 'th' : 'td';
              const spans = parseInlineSpans(cell);
              tableHtml += `<${tag}>${spansToHtml(spans)}</${tag}>`;
            });
            tableHtml += '</tr>';
          });
          tableHtml += '</table></div>';
          bodyHtml.push(tableHtml);
        }
        break;
      }
      case 'horizontal_rule': {
        bodyHtml.push('<hr class="doc-hr" />');
        break;
      }
      case 'paragraph':
      default: {
        const spans = parseInlineSpans(node.text || '');
        bodyHtml.push(`<p class="doc-p">${spansToHtml(spans)}</p>`);
        break;
      }
    }
  }

  // Convert dxa margins to pt (1 dxa = 1/20 pt)
  const marginTopPt = style.margins.top / 20;
  const marginRightPt = style.margins.right / 20;
  const marginBottomPt = style.margins.bottom / 20;
  const marginLeftPt = style.margins.left / 20;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${options.title || 'Document'}</title>
  <style>
    @page {
      size: ${options.paperSize === 'LETTER' ? 'letter' : 'A4'};
      margin: ${marginTopPt}pt ${marginRightPt}pt ${marginBottomPt}pt ${marginLeftPt}pt;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: ${marginTopPt}pt ${marginRightPt}pt ${marginBottomPt}pt ${marginLeftPt}pt;
      background-color: #FFFFFF;
      color: #${style.textColor};
      font-family: '${style.fontPrimary}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
    }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .doc-h1 {
      font-family: '${style.fontHeading || style.fontPrimary}', sans-serif;
      font-size: 24pt;
      font-weight: 700;
      color: #${style.headingColor};
      margin: 0 0 6pt 0;
      line-height: 1.1;
    }
    .doc-subtitle {
      font-size: 11pt;
      color: #4B5563;
      margin: 0 0 8pt 0;
    }
    .doc-contact-bar {
      font-size: 9.5pt;
      color: #374151;
      padding-bottom: 6pt;
      margin-bottom: 12pt;
      border-bottom: 1px solid #${style.borderColor};
    }
    .doc-contact-bar a {
      color: #${style.accentColor};
      text-decoration: underline;
    }
    .doc-h2 {
      font-family: '${style.fontHeading || style.fontPrimary}', sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: #${style.headingColor};
      margin: 14pt 0 4pt 0;
      padding-bottom: 2pt;
      border-bottom: 1.5px solid #${style.borderColor};
      letter-spacing: 0.5px;
    }
    .doc-h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #${style.textColor};
      margin: 8pt 0 2pt 0;
    }
    .doc-h4 {
      font-size: 9.5pt;
      font-weight: 600;
      color: #${style.textColor};
      margin: 6pt 0 2pt 0;
    }
    .doc-p {
      font-size: 10pt;
      margin: 0 0 4pt 0;
    }
    .doc-bullet {
      font-size: 10pt;
      margin: 0 0 2.5pt 16pt;
      list-style-type: disc;
    }
    .doc-quote {
      border-left: 3px solid #${style.accentColor};
      padding-left: 8pt;
      margin: 8pt 0;
      color: #475569;
      font-style: italic;
    }
    .doc-code-block {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 4px;
      padding: 6pt 8pt;
      font-family: '${style.fontCode || 'monospace'}';
      font-size: 9pt;
      overflow-x: auto;
      margin: 6pt 0;
    }
    code {
      font-family: '${style.fontCode || 'monospace'}';
      font-size: 8.5pt;
      background: #F1F5F9;
      color: #334155;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
    }
    .doc-table th, .doc-table td {
      border: 1px solid #CBD5E1;
      padding: 4pt 6pt;
      text-align: left;
      font-size: 9.5pt;
    }
    .doc-table th {
      background-color: #${style.headingColor};
      color: #FFFFFF;
      font-weight: 600;
    }
    .doc-hr {
      border: none;
      border-top: 1px solid #${style.borderColor};
      margin: 10pt 0;
    }
    a {
      color: #${style.accentColor};
      text-decoration: underline;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${bodyHtml.join('\n  ')}
</body>
</html>`;
}
