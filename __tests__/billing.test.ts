import { describe, it, expect } from "vitest";
import {
  formatIdr,
  calcCurrentPrice,
  calcQuotaPct,
  getBillingPlan,
  billingPlans,
} from "@/lib/billing";

describe("Billing Utils", () => {
  describe("formatIdr", () => {
    it("should format numbers to IDR currency string format", () => {
      const result = formatIdr(25000);
      // Replace any non-breaking spaces with normal spaces to ensure test consistency
      const sanitized = result.replace(/\u00a0/g, " ");
      expect(sanitized).toContain("Rp");
      expect(sanitized).toContain("25.000");
    });

    it("should format large numbers correctly", () => {
      const result = formatIdr(150000);
      const sanitized = result.replace(/\u00a0/g, " ");
      expect(sanitized).toContain("Rp");
      expect(sanitized).toContain("150.000");
    });
  });

  describe("calcCurrentPrice", () => {
    const belajarPlan = billingPlans.find((p) => p.id === "belajar")!;

    it("should return early bird price if buyer count is below quota", () => {
      const price = calcCurrentPrice(belajarPlan, 400);
      expect(price).toBe(25000);
    });

    it("should return early bird price if buyer count is exactly quota threshold", () => {
      const price = calcCurrentPrice(belajarPlan, 500);
      expect(price).toBe(25000);
    });

    it("should increase price based on step size above quota", () => {
      // 525 buyers = (525 - 500) / 25 = 1 step over.
      // price = 25000 * (1.05 ^ 1) = 26250.
      // Rounded to nearest 1000 = 26000.
      const price = calcCurrentPrice(belajarPlan, 525);
      expect(price).toBe(26000);
    });

    it("should cap the price at original price", () => {
      // Very high buyer count
      const price = calcCurrentPrice(belajarPlan, 10000);
      expect(price).toBe(150000); // capped at originalPrice
    });
  });

  describe("calcQuotaPct", () => {
    const belajarPlan = billingPlans.find((p) => p.id === "belajar")!;

    it("should return correct percentage of early bird quota used", () => {
      expect(calcQuotaPct(belajarPlan, 250)).toBe(50);
      expect(calcQuotaPct(belajarPlan, 0)).toBe(0);
    });

    it("should cap percentage at 100%", () => {
      expect(calcQuotaPct(belajarPlan, 600)).toBe(100);
    });
  });

  describe("getBillingPlan", () => {
    it("should return correct plan for valid ids", () => {
      const proPlan = getBillingPlan("pro");
      expect(proPlan.id).toBe("pro");
      
      const belajarPlan = getBillingPlan("belajar");
      expect(belajarPlan.id).toBe("belajar");
    });

    it("should fallback to default plan (belajar) for invalid/null ids", () => {
      const fallback = getBillingPlan(null);
      expect(fallback.id).toBe("belajar");

      const fallback2 = getBillingPlan("non-existent");
      expect(fallback2.id).toBe("belajar");
    });
  });
});
