import { createHmac, timingSafeEqual } from "crypto";
import { whiteLabel } from "@/lib/site-config";

export const SESSION_COOKIE_NAME = whiteLabel.auth.sessionCookieName;

export type UserRole = "student" | "admin" | "super_admin";
export type UserTier = "free" | "belajar" | "pro";

export type AppSession = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  tier: UserTier;
  createdAt: number;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? "dev-only-change-me-before-production";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function encodeSession(session: AppSession) {
  const payload = toBase64Url(JSON.stringify(session));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function decodeSession(cookieValue?: string): AppSession | null {
  if (!cookieValue) return null;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload)) as AppSession;
    if (Date.now() - session.createdAt > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return session;
  } catch {
    return null;
  }
}
