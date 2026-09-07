import { NextResponse } from 'next/server';
import { checkSystemEngines } from '@markforge/core';

export async function GET() {
  const engines = checkSystemEngines();
  const mem = process.memoryUsage();

  const isHealthy = engines.node || engines.bun;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'markforge-web-studio',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
      engines: {
        ...engines,
        primaryPdfEngine: engines.soffice ? 'LibreOffice (soffice)' : engines.weasyprint ? 'Weasyprint' : 'None',
      },
      memory: {
        rssMb: (mem.rss / 1024 / 1024).toFixed(1),
        heapUsedMb: (mem.heapUsed / 1024 / 1024).toFixed(1),
        heapTotalMb: (mem.heapTotal / 1024 / 1024).toFixed(1),
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
