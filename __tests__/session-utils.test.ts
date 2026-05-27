import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue(null),
}));

import {
  getRoleForEmail,
  getTierForRole,
  canAccessTier,
  type UserTier,
} from "@/lib/session";

describe("Session Pure Utils", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_ADMIN_EMAIL = "admin@pastilulus.id";
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL = "superadmin@pastilulus.id";
  });

  describe("getRoleForEmail", () => {
    it("should return 'super_admin' for the super admin email (case-insensitive)", () => {
      expect(getRoleForEmail("superadmin@pastilulus.id")).toBe("super_admin");
      expect(getRoleForEmail("SUPERADMIN@PASTILULUS.ID")).toBe("super_admin");
    });

    it("should return 'admin' for the admin email (case-insensitive)", () => {
      expect(getRoleForEmail("admin@pastilulus.id")).toBe("admin");
      expect(getRoleForEmail("Admin@Pastilulus.Id")).toBe("admin");
    });

    it("should return 'student' for any other email", () => {
      expect(getRoleForEmail("siswa@gmail.com")).toBe("student");
      expect(getRoleForEmail("random@example.com")).toBe("student");
      expect(getRoleForEmail("")).toBe("student");
    });
  });

  describe("getTierForRole", () => {
    it("should return 'free' for student role", () => {
      expect(getTierForRole("student")).toBe("free");
    });

    it("should return 'pro' for admin role", () => {
      expect(getTierForRole("admin")).toBe("pro");
    });

    it("should return 'pro' for super_admin role", () => {
      expect(getTierForRole("super_admin")).toBe("pro");
    });
  });

  describe("canAccessTier", () => {
    it.each<UserTier>(["free", "belajar", "pro"])(
      "should allow '%s' tier to access gratis content",
      (tier) => expect(canAccessTier(tier, "gratis")).toBe(true),
    );

    it("should deny 'free' tier access to 'belajar_pro' content", () => {
      expect(canAccessTier("free", "belajar_pro")).toBe(false);
    });

    it("should allow 'belajar' tier access to 'belajar_pro' content", () => {
      expect(canAccessTier("belajar", "belajar_pro")).toBe(true);
    });

    it("should allow 'pro' tier access to 'belajar_pro' content", () => {
      expect(canAccessTier("pro", "belajar_pro")).toBe(true);
    });
  });

  describe("Role → Tier → Access integration", () => {
    it("new student gets 'free' tier which cannot access belajar_pro content", () => {
      const role = getRoleForEmail("newbie@gmail.com");
      const tier = getTierForRole(role);
      expect(canAccessTier(tier, "belajar_pro")).toBe(false);
    });

    it("admin gets 'pro' tier which can access belajar_pro content", () => {
      const role = getRoleForEmail("admin@pastilulus.id");
      const tier = getTierForRole(role);
      expect(canAccessTier(tier, "belajar_pro")).toBe(true);
    });
  });
});
