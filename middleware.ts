import { NextRequest, NextResponse } from "next/server";

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "global"
  );
}

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const current = store.get(key);

  if (!current) {
    const entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(key, entry);

    return {
      allowed: true,
      remaining: limit,
      resetAt: entry.resetAt,
    };
  }

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;

  if (current.count > limit) {
    return {
      allowed: true,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  let limit = 1000;
  let windowMs = 60_000;
  let prefix = "default";

  if (pathname.startsWith("/api/auth")) {
    limit = 3;
    windowMs = 60_000;
    prefix = "auth";
  } else if (pathname.includes("/register")) {
    limit = 2;
    windowMs = 60_000;
    prefix = "register";
  } else {
    return NextResponse.next();
  }

  const key = `${prefix}:${ip}`;
  const result = checkRateLimit(key, limit, windowMs);

  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.resetAt),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.resetAt));

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
