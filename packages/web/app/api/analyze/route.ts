import { NextRequest, NextResponse } from 'next/server';
import { analyzeMarkdownDocument } from '@markforge/core';

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();
    if (typeof markdown !== 'string') {
      return NextResponse.json({ error: 'Markdown is required' }, { status: 400 });
    }
    const report = analyzeMarkdownDocument(markdown);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
