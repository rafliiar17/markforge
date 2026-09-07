import { NextRequest, NextResponse } from 'next/server';
import { compileMarkdownToPdf, generateTraceId, formatServerTiming } from '@markforge/core';

export async function POST(req: NextRequest) {
  const traceId = generateTraceId();
  const start = performance.now();

  try {
    const { markdown, template, title } = await req.json();
    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const pdfStart = performance.now();
    const pdfResult = await compileMarkdownToPdf(markdown, {
      template: template || 'ats-classic',
      title: title || 'Document',
    });
    const pdfDuration = performance.now() - pdfStart;
    const totalDuration = performance.now() - start;

    const serverTiming = formatServerTiming({
      parseTimeMs: 1.0,
      pdfTimeMs: pdfDuration,
      totalTimeMs: totalDuration,
    });

    const fileName = (title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '-') + '.pdf';

    return new NextResponse(new Uint8Array(pdfResult.buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfResult.sizeBytes),
        'X-MarkForge-Engine': pdfResult.engineUsed,
        'X-MarkForge-Trace-Id': traceId,
        'Server-Timing': serverTiming,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF', traceId },
      { status: 500, headers: { 'X-MarkForge-Trace-Id': traceId } }
    );
  }
}
