export interface InlineSpan {
  type: 'text' | 'bold' | 'italic' | 'code' | 'link';
  text: string;
  url?: string;
}

export function parseInlineSpans(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      spans.push({ type: 'text', text: text.slice(last, match.index) });
    }
    if (match[2]) {
      spans.push({ type: 'bold', text: match[2] });
    } else if (match[3]) {
      spans.push({ type: 'italic', text: match[3] });
    } else if (match[4]) {
      spans.push({ type: 'code', text: match[4] });
    } else if (match[5] && match[6]) {
      spans.push({ type: 'link', text: match[5], url: match[6] });
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    spans.push({ type: 'text', text: text.slice(last) });
  }

  return spans.length ? spans : [{ type: 'text', text }];
}
