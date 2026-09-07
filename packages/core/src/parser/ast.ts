import { ASTNode } from '../types';

export function parseMarkdownToAST(markdown: string): ASTNode[] {
  const lines = markdown.split(/\r?\n/);
  const nodes: ASTNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Blank line
    if (trimmed === '') {
      i++;
      continue;
    }

    // Code block ```
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      nodes.push({
        type: 'code_block',
        text: codeLines.join('\n'),
        language: language || 'text',
      });
      continue;
    }

    // Horizontal rule --- or ***
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      nodes.push({ type: 'horizontal_rule' });
      i++;
      continue;
    }

    // Table parsing
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && lines[i + 1]?.trim().includes('|--')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const rowLine = lines[i].trim();
        // Skip separator row |---|---|
        if (!/^\|[\s\-:|]+\|$/.test(rowLine)) {
          const cells = rowLine
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }
      nodes.push({
        type: 'table',
        tableRows,
      });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [trimmed.slice(2).trim()];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2).trim());
        i++;
      }
      nodes.push({
        type: 'quote',
        text: quoteLines.join(' '),
      });
      continue;
    }

    // H1
    if (trimmed.startsWith('# ')) {
      nodes.push({
        type: 'h1',
        text: trimmed.slice(2).trim(),
      });
      i++;
      continue;
    }

    // H2
    if (trimmed.startsWith('## ')) {
      nodes.push({
        type: 'h2',
        text: trimmed.slice(3).trim(),
      });
      i++;
      continue;
    }

    // H3
    if (trimmed.startsWith('### ')) {
      nodes.push({
        type: 'h3',
        text: trimmed.slice(4).trim(),
      });
      i++;
      continue;
    }

    // H4
    if (trimmed.startsWith('#### ')) {
      nodes.push({
        type: 'h4',
        text: trimmed.slice(5).trim(),
      });
      i++;
      continue;
    }

    // Bullet items
    if (/^(\s*)([-*+])\s+(.+)$/.test(rawLine)) {
      const match = rawLine.match(/^(\s*)([-*+])\s+(.+)$/);
      if (match) {
        const indent = match[1].length;
        const level = Math.min(Math.floor(indent / 2), 3);
        const content = match[3].trim();
        nodes.push({
          type: 'bullet',
          text: content,
          level,
        });
        i++;
        continue;
      }
    }

    // Contact bar heuristic (early in document, contains | or • and contact keywords/urls)
    if (
      i < 10 &&
      (trimmed.includes('|') || trimmed.includes('•')) &&
      (/@|linkedin|github|portfolio|tel:|phone|\+?[0-9]{8,}/i.test(trimmed) ||
        trimmed.split('|').length >= 3)
    ) {
      nodes.push({
        type: 'contact_bar',
        text: trimmed,
      });
      i++;
      continue;
    }

    // Subtitle heuristic (*Italic Line* right after H1)
    if (
      nodes.length > 0 &&
      nodes[nodes.length - 1].type === 'h1' &&
      /^\*[^*].*[^*]\*$/.test(trimmed)
    ) {
      nodes.push({
        type: 'subtitle',
        text: trimmed.slice(1, -1).trim(),
      });
      i++;
      continue;
    }

    // Standard paragraph
    nodes.push({
      type: 'paragraph',
      text: trimmed,
    });
    i++;
  }

  return nodes;
}
