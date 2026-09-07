import { NextRequest, NextResponse } from 'next/server';
import { compileMarkdownToPdf } from '@markforge/core';

export async function POST(req: NextRequest) {
  try {
    const { markdown, template, title } = await req.json();
    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const pdfResult = await compileMarkdownToPdf(markdown, {
      template: template || 'ats-classic',
      title: title || 'Document',
    });

    const fileName = (title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-') + '.pdf';

    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfResult.sizeBytes),
        'X-MarkForge-Engine': pdfResult.engineUsed,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
