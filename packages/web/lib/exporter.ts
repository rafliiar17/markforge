export interface ExportResult {
  success: boolean;
  engineUsed?: 'server' | 'browser-print';
  error?: string;
}

export async function exportDocument(
  type: 'docx' | 'pdf',
  markdown: string,
  template: string
): Promise<ExportResult> {
  try {
    const res = await fetch(`/api/compile/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown, template, title: 'MarkForge-Document' }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markforge-${template}.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
      return { success: true, engineUsed: 'server' };
    }

    // Serverless edge fallback: if server lacks headless engine (LibreOffice/Weasyprint),
    // trigger native high-fidelity browser print dialog
    if (type === 'pdf' && typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return { success: true, engineUsed: 'browser-print' };
    }

    throw new Error(`${type.toUpperCase()} compilation failed`);
  } catch (err: any) {
    if (type === 'pdf' && typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return { success: true, engineUsed: 'browser-print' };
    }
    throw err;
  }
}

