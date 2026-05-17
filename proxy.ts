import { NextResponse, type NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE_NAME } from "@/lib/session-codec";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const STUDENT_PREFIX = "/siswa";
const ADMIN_PREFIX = "/admin";

// Rate limit windows per route group (requests / window_seconds).
const RATE_LIMITS: Record<string, { requests: number; windowSeconds: number }> = {
  "/api/payments/": { requests: 10, windowSeconds: 60 },
  "/api/tryout/":   { requests: 30, windowSeconds: 60 },
  "/api/crm/":      { requests: 20, windowSeconds: 60 },
  "/api/":          { requests: 60, windowSeconds: 60 },
};

function matchRateLimit(pathname: string) {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return { prefix, ...limit };
  }
  return null;
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Sliding window rate limiter backed by Upstash Redis REST API.
// Fails open (allows the request) when env vars are absent.
async function checkRateLimit(key: string, requests: number, windowSeconds: number): Promise<boolean> {
  const url   = process.env.KV_REST_API_URL  ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return true;

  const now      = Date.now();
  const windowMs = windowSeconds * 1000;
  const redisKey = `rl:${key}`;

  try {
    const pipeline = [
      ["ZREMRANGEBYSCORE", redisKey, "0", String(now - windowMs)],
      ["ZADD", redisKey, String(now), String(now)],
      ["ZCARD", redisKey],
      ["EXPIRE", redisKey, String(windowSeconds)],
    ];

    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(pipeline),
    });

    if (!response.ok) return true;
    const results = (await response.json()) as Array<{ result: unknown }>;
    const count = Number(results[2]?.result ?? 0);
    return count <= requests;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes.
  const rateLimit = matchRateLimit(pathname);
  if (rateLimit) {
    const ip = getClientIp(request);
    const allowed = await checkRateLimit(`${ip}:${rateLimit.prefix}`, rateLimit.requests, rateLimit.windowSeconds);
    if (!allowed) {
      return NextResponse.json(
        { message: `Terlalu banyak permintaan. Coba lagi dalam ${rateLimit.windowSeconds} detik.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.windowSeconds),
            "X-RateLimit-Limit": String(rateLimit.requests),
          },
        },
      );
    }
  }

  const supabaseResponse = await refreshSupabaseSession(request);
  const session = decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith(STUDENT_PREFIX) && !session) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!session) {
      return NextResponse.redirect(new URL("/masuk", request.url));
    }
    if (session.role !== "admin" && session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/siswa", request.url));
    }
  }

  if ((pathname === "/masuk" || pathname === "/daftar") && session) {
    return NextResponse.redirect(new URL(session.role === "student" ? "/siswa" : "/admin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/siswa/:path*", "/admin/:path*", "/masuk", "/daftar", "/api/:path*"],
};
