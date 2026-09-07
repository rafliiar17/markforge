export async function exportDocument(
  type: 'docx' | 'pdf',
  markdown: string,
  template: string
): Promise<void> {
  const res = await fetch(`/api/compile/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown, template, title: 'MarkForge-Document' }),
  });
  if (!res.ok) throw new Error(`${type.toUpperCase()} compilation failed`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `markforge-${template}.${type}`;
  a.click();
  window.URL.revokeObjectURL(url);
}
