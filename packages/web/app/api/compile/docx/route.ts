import { NextRequest, NextResponse } from 'next/server';
import { compileMarkdownToDocx } from '@markforge/core';

export async function POST(req: NextRequest) {
  try {
    const { markdown, template, title } = await req.json();
    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const docxBuffer = await compileMarkdownToDocx(markdown, {
      template: template || 'ats-classic',
      title: title || 'Document',
    });

    const fileName = (title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-') + '.docx';

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(docxBuffer.length),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate DOCX' }, { status: 500 });
  }
}
