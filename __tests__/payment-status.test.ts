import { describe, it, expect } from "vitest";
import {
  normalizePaymentStatus,
  paymentStatusCopy,
} from "@/lib/payment-status";

const VALID_STATUSES = Object.keys(paymentStatusCopy) as (keyof typeof paymentStatusCopy)[];

describe("Payment Status Utils", () => {
  describe("normalizePaymentStatus", () => {
    it.each(VALID_STATUSES)("should pass through valid status '%s' unchanged", (status) => {
      expect(normalizePaymentStatus(status)).toBe(status);
    });

    it.each(["unknown", "SUKSES", "berhasil", "error", ""])(
      "should fallback to 'pending' for invalid value '%s'",
      (value) => expect(normalizePaymentStatus(value)).toBe("pending"),
    );

    it("should fallback to 'pending' for null", () => {
      expect(normalizePaymentStatus(null)).toBe("pending");
    });
  });

  describe("paymentStatusCopy", () => {
    it("should have correct tone for each status", () => {
      expect(paymentStatusCopy.success.tone).toBe("emerald");
      expect(paymentStatusCopy.pending.tone).toBe("amber");
      expect(paymentStatusCopy.failed.tone).toBe("rose");
    });

    it("should have non-empty title and desc for every status", () => {
      for (const status of VALID_STATUSES) {
        expect(paymentStatusCopy[status].title).toBeTruthy();
        expect(paymentStatusCopy[status].desc).toBeTruthy();
      }
    });

    it("should have distinct titles across all statuses", () => {
      const titles = VALID_STATUSES.map((s) => paymentStatusCopy[s].title);
      expect(new Set(titles).size).toBe(VALID_STATUSES.length);
    });
  });
});
