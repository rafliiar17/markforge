import { NextRequest, NextResponse } from 'next/server';
import { compileMarkdownToDocx, generateTraceId, formatServerTiming } from '@markforge/core';

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();
  const start = performance.now();

  try {
    const { markdown, template, title } = await req.json();
    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const docxStart = performance.now();
    const docxBuffer = await compileMarkdownToDocx(markdown, {
      template: template || 'ats-classic',
      title: title || 'Document',
    });
    const docxDuration = performance.now() - docxStart;
    const totalDuration = performance.now() - start;

    const serverTiming = formatServerTiming({
      parseTimeMs: 1.0,
      docxTimeMs: docxDuration,
      totalTimeMs: totalDuration,
    });

    const fileName = (title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-') + '.docx';

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(docxBuffer.length),
        'X-MarkForge-Trace-Id': traceId,
        'Server-Timing': serverTiming,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate DOCX', traceId },
      { status: 500, headers: { 'X-MarkForge-Trace-Id': traceId } }
    );
  }
}
