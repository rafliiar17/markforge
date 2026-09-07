import { NextResponse } from 'next/server';
import { BUILTIN_TEMPLATES } from '@markforge/core';

export async function GET() {
  return NextResponse.json(BUILTIN_TEMPLATES);
}
