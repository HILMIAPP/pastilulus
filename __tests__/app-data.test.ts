import { describe, it, expect } from "vitest";
import {
  tryoutPaket,
  tryoutUmptkinPaket,
  soalPaketById,
  type TryoutPaket,
  type TryoutQuestion,
} from "@/lib/app-data";

const VALID_AKSES = ["gratis", "belajar_pro"] as const;
const PILIHAN_KEYS = ["A", "B", "C", "D", "E"] as const;
const TINGKAT_LEVELS = ["MUDAH", "SEDANG", "HOTS"] as const;

function assertPaketShape(paket: TryoutPaket) {
  expect(paket.id, `id harus diisi — paket: ${paket.title}`).toBeTruthy();
  expect(paket.slug, `slug harus diisi — paket: ${paket.title}`).toBeTruthy();
  expect(paket.title, `title harus diisi — paket: ${paket.id}`).toBeTruthy();
  expect(paket.subtitle, `subtitle harus diisi — paket: ${paket.id}`).toBeTruthy();
  expect(paket.soalCount, `soalCount harus > 0 — paket: ${paket.id}`).toBeGreaterThan(0);
  expect(paket.durasiMenit, `durasiMenit harus > 0 — paket: ${paket.id}`).toBeGreaterThan(0);
  expect(paket.pola, `pola harus diisi — paket: ${paket.id}`).toBeTruthy();
  expect(VALID_AKSES).toContain(paket.akses);
  expect(paket.scoring, `scoring harus diisi — paket: ${paket.id}`).toBeTruthy();
}

function assertSoalShape(soal: TryoutQuestion, paketId: string) {
  expect(soal.id, `soal.id harus diisi — paket: ${paketId}`).toBeTruthy();
  expect(soal.nomor, `soal.nomor harus > 0 — paket: ${paketId}`).toBeGreaterThan(0);
  expect(soal.pertanyaan, `soal.pertanyaan harus diisi — paket: ${paketId}`).toBeTruthy();
  expect(soal.opsi, `soal.opsi harus ada — paket: ${paketId}`).toBeTruthy();
  expect(PILIHAN_KEYS).toContain(soal.kunci);
  expect(TINGKAT_LEVELS).toContain(soal.tingkat);
  for (const pilihan of PILIHAN_KEYS) {
    expect(soal.opsi[pilihan], `opsi ${pilihan} harus diisi — soal ${soal.nomor} paket: ${paketId}`).toBeTruthy();
  }
}

describe("tryoutPaket (UM Mandiri PTN)", () => {
  it("should have at least 2 pakets", () => {
    expect(tryoutPaket.length).toBeGreaterThanOrEqual(2);
  });

  it("should have valid shape for every paket", () => {
    for (const paket of tryoutPaket) {
      assertPaketShape(paket);
    }
  });

  it("should have unique IDs across all pakets", () => {
    const ids = tryoutPaket.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have unique slugs across all pakets", () => {
    const slugs = tryoutPaket.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("should have id matching slug for every paket", () => {
    for (const paket of tryoutPaket) {
      expect(paket.id).toBe(paket.slug);
    }
  });

  it("should include at least one 'gratis' paket", () => {
    expect(tryoutPaket.some((p) => p.akses === "gratis")).toBe(true);
  });

  it("should include at least one 'belajar_pro' paket", () => {
    expect(tryoutPaket.some((p) => p.akses === "belajar_pro")).toBe(true);
  });

  it("paket-1 should be free and have 120 soal", () => {
    const paket1 = tryoutPaket.find((p) => p.id === "paket-1");
    expect(paket1).toBeDefined();
    expect(paket1?.akses).toBe("gratis");
    expect(paket1?.soalCount).toBe(120);
  });
});

describe("tryoutUmptkinPaket (UM PTKIN)", () => {
  it("should have exactly 5 PTKIN pakets", () => {
    expect(tryoutUmptkinPaket).toHaveLength(5);
  });

  it("should have valid shape for every PTKIN paket", () => {
    for (const paket of tryoutUmptkinPaket) {
      assertPaketShape(paket);
    }
  });

  it("should have unique IDs", () => {
    const ids = tryoutUmptkinPaket.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have IDs umptkin-1 through umptkin-5 in order", () => {
    tryoutUmptkinPaket.forEach((paket, i) => {
      expect(paket.id).toBe(`umptkin-${i + 1}`);
    });
  });

  it("umptkin-1 should be free and the rest belajar_pro", () => {
    expect(tryoutUmptkinPaket[0].akses).toBe("gratis");
    for (let i = 1; i < tryoutUmptkinPaket.length; i++) {
      expect(tryoutUmptkinPaket[i].akses, `umptkin-${i + 1} should be belajar_pro`).toBe("belajar_pro");
    }
  });

  it("each PTKIN paket should have 121 soal and 120 minutes duration", () => {
    for (const paket of tryoutUmptkinPaket) {
      expect(paket.soalCount).toBe(121);
      expect(paket.durasiMenit).toBe(120);
    }
  });
});

describe("soalPaketById", () => {
  it("should have entries for paket-1 and paket-2", () => {
    expect(soalPaketById["paket-1"]).toBeInstanceOf(Array);
    expect(soalPaketById["paket-2"]).toBeInstanceOf(Array);
  });

  it("should have entries for all 5 PTKIN pakets", () => {
    for (let i = 1; i <= 5; i++) {
      const key = `umptkin-${i}`;
      expect(soalPaketById[key], `${key} not found in soalPaketById`).toBeInstanceOf(Array);
    }
  });

  it("paket-1 soal count should match its declared soalCount", () => {
    const paket1 = tryoutPaket.find((p) => p.id === "paket-1")!;
    expect(soalPaketById["paket-1"]).toHaveLength(paket1.soalCount);
  });

  it("each soal in paket-1 should have valid shape", () => {
    for (const soal of soalPaketById["paket-1"]) {
      assertSoalShape(soal, "paket-1");
    }
  });

  it("soal nomor in paket-1 should be sequential starting from 1", () => {
    soalPaketById["paket-1"].forEach((soal, index) => {
      expect(soal.nomor).toBe(index + 1);
    });
  });

  it("each soal in umptkin-1 should have valid shape", () => {
    for (const soal of soalPaketById["umptkin-1"]) {
      assertSoalShape(soal, "umptkin-1");
    }
  });
});
