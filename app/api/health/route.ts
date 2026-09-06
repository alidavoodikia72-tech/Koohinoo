import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

function resolveVersion(): string {
  const envVersion = process.env.APP_VERSION;
  if (envVersion && envVersion.trim().length > 0) {
    return envVersion.trim();
  }

  const npmVersion = process.env.npm_package_version;
  if (npmVersion && npmVersion.trim().length > 0) {
    return npmVersion.trim();
  }

  return '0.1.0';
}

export async function GET() {
  const started = Date.now();

  try {
    // lightweight DB probe
    await prisma.$queryRaw`SELECT 1`;

    const responseTimeMs = Date.now() - started;

    return NextResponse.json(
      {
        ok: true,
        service: 'koohinoo',
        status: 'healthy',
        version: resolveVersion(),
        db: 'up',
        timestamp: new Date().toISOString(),
        uptimeSec: Math.floor(process.uptime()),
        responseTimeMs
      },
      { status: 200 }
    );
  } catch {
    const responseTimeMs = Date.now() - started;

    return NextResponse.json(
      {
        ok: false,
        service: 'koohinoo',
        status: 'unhealthy',
        version: resolveVersion(),
        db: 'down',
        timestamp: new Date().toISOString(),
        uptimeSec: Math.floor(process.uptime()),
        responseTimeMs
      },
      { status: 503 }
    );
  }
}
