import { describe, it, expect, beforeAll } from "vitest";
import { encodeSession, decodeSession, AppSession } from "@/lib/session-codec";

describe("Session Codec", () => {
  beforeAll(() => {
    // Ensure AUTH_SECRET is set for consistent test environment
    process.env.AUTH_SECRET = "test-secret-value-for-testing-only-123456789";
  });

  const mockSession: AppSession = {
    userId: "user-123",
    name: "Ahmad Fauzi",
    email: "ahmad@lolosujian.com",
    role: "student",
    tier: "belajar",
    createdAt: Date.now(),
  };

  it("should encode a session object into a signed token", () => {
    const token = encodeSession(mockSession);
    expect(token).toBeTypeOf("string");
    expect(token.split(".")).toHaveLength(2); // payload.signature
  });

  it("should decode a valid signed token back to the session object", () => {
    const token = encodeSession(mockSession);
    const decoded = decodeSession(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockSession.userId);
    expect(decoded?.name).toBe(mockSession.name);
    expect(decoded?.email).toBe(mockSession.email);
    expect(decoded?.role).toBe(mockSession.role);
    expect(decoded?.tier).toBe(mockSession.tier);
  });

  it("should return null for invalid or tampered signatures", () => {
    const token = encodeSession(mockSession);
    const [payload, signature] = token.split(".");
    
    // Modify the payload slightly (tampering)
    const tamperedPayload = payload + "a";
    const tamperedToken = `${tamperedPayload}.${signature}`;
    
    const decoded = decodeSession(tamperedToken);
    expect(decoded).toBeNull();
  });

  it("should return null if the session is expired", () => {
    const expiredSession: AppSession = {
      ...mockSession,
      // Create session 8 days ago (limit is 7 days)
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    };
    
    const token = encodeSession(expiredSession);
    const decoded = decodeSession(token);
    expect(decoded).toBeNull();
  });

  it("should return null for malformed tokens", () => {
    expect(decodeSession("invalid-token-no-dots")).toBeNull();
    expect(decodeSession("")).toBeNull();
    expect(decodeSession(undefined)).toBeNull();
  });
});
