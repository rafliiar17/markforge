/**
 * Simulates HTML preview for instant client-side rendering with Mermaid diagram support.
 */
export function generateLocalPreview(md: string, tmpl: string): string {
  const lines = md.split('\n');
  let outHtml = '';

  const isTeal = tmpl === 'modern-accent';
  const isTech = tmpl === 'tech-spec';
  const isAcademic = tmpl === 'academic';
  const isExecutive = tmpl === 'executive';

  const accentColor = isTeal ? '#0f766e' : isTech ? '#2563eb' : isExecutive ? '#854d0e' : '#000000';
  const font = isAcademic ? 'Georgia, serif' : isExecutive ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif';

  const formatInline = (text: string) => {
    return text
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 underline font-medium hover:text-blue-500" target="_blank" rel="noreferrer">$1</a>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(
        /`([^`]+)`/g,
        '<code style="background:#f1f5f9; padding:1px 4px; border-radius:3px; font-size:8.5pt;">$1</code>'
      );
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle Code Blocks & Mermaid Flowcharts
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim().toLowerCase();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      const rawCode = codeLines.join('\n');
      if (lang === 'mermaid') {
        const containerThemeClass = isTeal
          ? 'border-emerald-200/80 bg-emerald-50/20'
          : isTech
          ? 'border-blue-200/80 bg-blue-50/20'
          : isExecutive
          ? 'border-amber-200/80 bg-amber-50/20'
          : 'border-zinc-200/80 bg-zinc-50/40';
        outHtml += `<div class="mermaid my-6 flex flex-col items-center justify-center overflow-x-auto rounded-xl border ${containerThemeClass} p-5 shadow-sm" data-template="${tmpl}">${rawCode}</div>`;
      } else {
        const safeCode = rawCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        outHtml += `<pre style="font-family:'Courier New', monospace; font-size:9pt; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:8px 12px; margin:10px 0; overflow-x:auto;"><code>${safeCode}</code></pre>`;
      }
      continue;
    }

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      outHtml += `<h1 style="font-family:${font}; font-size:24pt; font-weight:bold; color:${accentColor}; margin:0 0 6px 0; text-align:${(tmpl === 'tech-spec' || isAcademic) ? 'left' : 'center'}">${formatInline(trimmed.slice(2))}</h1>`;
    } else if (trimmed.startsWith('## ')) {
      outHtml += `<h2 style="font-family:${font}; font-size:11pt; font-weight:bold; text-transform:${tmpl.includes('ats') ? 'uppercase' : 'none'}; color:${accentColor}; border-bottom:1.5px solid ${accentColor}; margin:16px 0 6px 0; padding-bottom:2px; letter-spacing:0.5px">${formatInline(trimmed.slice(3))}</h2>`;
    } else if (trimmed.startsWith('### ')) {
      outHtml += `<h3 style="font-family:${font}; font-size:10pt; font-weight:bold; color:#1f2937; margin:10px 0 2px 0;">${formatInline(trimmed.slice(4))}</h3>`;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      outHtml += `<li style="font-family:${font}; font-size:9.5pt; color:#374151; margin:0 0 3px 18px; list-style-type:disc">${formatInline(trimmed.slice(2))}</li>`;
    } else if (trimmed.includes('|') && i < 10) {
      outHtml += `<div style="font-family:${font}; font-size:9pt; color:#4b5563; text-align:center; padding-bottom:6px; margin-bottom:12px; border-bottom:1px solid #e5e7eb">${formatInline(trimmed)}</div>`;
    } else if (/^\*[^*].*[^*]\*$/.test(trimmed)) {
      outHtml += `<p style="font-family:${font}; font-size:10.5pt; font-style:italic; color:#6b7280; text-align:center; margin:0 0 6px 0">${formatInline(trimmed.slice(1, -1))}</p>`;
    } else {
      outHtml += `<p style="font-family:${font}; font-size:9.5pt; color:#1f2937; margin:0 0 6px 0; line-height:1.4">${formatInline(trimmed)}</p>`;
    }

    i++;
  }

  return outHtml;
}
