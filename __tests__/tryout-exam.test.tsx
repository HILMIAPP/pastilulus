import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TryoutExam } from "@/components/tryout-exam";
import type { TryoutPaket, TryoutQuestion } from "@/lib/app-data";
import React from "react";

// Mock next/link
vi.mock("next/link", () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Dua soal dummy — cukup untuk melewati guard soalList.length === 0
const mockQuestions: TryoutQuestion[] = [
  {
    id: "q1",
    nomor: 1,
    bagian: "Matematika Dasar",
    tingkat: "SEDANG",
    pertanyaan: "Berapakah hasil 2 + 2?",
    opsi: { A: "3", B: "4", C: "5", D: "6", E: "7" },
    kunci: "B",
    pembahasan: "2 + 2 = 4, jawaban B.",
  },
  {
    id: "q2",
    nomor: 2,
    bagian: "Matematika Dasar",
    tingkat: "MUDAH",
    pertanyaan: "Berapakah hasil 3 × 3?",
    opsi: { A: "6", B: "7", C: "8", D: "9", E: "10" },
    kunci: "D",
    pembahasan: "3 × 3 = 9, jawaban D.",
  },
];

// Helper: buat mock fetch yang mengembalikan { soal: mockQuestions }
function makeFetchMock() {
  return vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ soal: mockQuestions }),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  // Pasang ulang setelah clearAllMocks (clearAllMocks menghapus state tapi mempertahankan
  // implementasi — di-set ulang di sini supaya setiap test punya instance baru yang bersih)
  global.fetch = makeFetchMock();
});

describe("TryoutExam CBT Component", () => {
  const mockPaket: TryoutPaket = {
    id: "paket-1",
    slug: "paket-1",
    title: "Materi Ujian Mandiri Paket 1",
    subtitle: "Uji kemampuan dasar mandiri",
    soalCount: 120,
    durasiMenit: 60,
    pola: "Karakter: logika.",
    akses: "gratis",
    scoring: "Benar +4, Salah -1, Kosong 0",
    scoringType: "classical",
  };

  it("should render instructions page first and disable start button by default", async () => {
    render(<TryoutExam paket={mockPaket} />);

    // Komponen menampilkan spinner saat fetch berlangsung.
    // Tunggu sampai fetch selesai dan layar persiapan muncul.
    await waitFor(() => {
      expect(screen.getByText("Ruang persiapan CBT")).toBeDefined();
    });

    expect(screen.getByText("Materi Ujian Mandiri Paket 1")).toBeDefined();
    expect(screen.getByText("Peraturan ujian")).toBeDefined();

    // Tombol mulai harus disabled sebelum checkbox dicentang
    const startButton = screen.getByRole("button", { name: /Mulai ujian/i });
    expect(startButton).toBeDefined();
    expect((startButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("should enable start button when agreement checkbox is checked", async () => {
    render(<TryoutExam paket={mockPaket} />);

    // Tunggu layar persiapan tampil
    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeDefined();
    });

    const checkbox = screen.getByRole("checkbox");
    const startButton = screen.getByRole("button", { name: /Mulai ujian/i });

    expect((startButton as HTMLButtonElement).disabled).toBe(true);

    // Centang checkbox → tombol mulai harus aktif
    fireEvent.click(checkbox);
    expect((startButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("should enter exam mode when clicking Start after agreeing", async () => {
    render(<TryoutExam paket={mockPaket} />);

    // Tunggu layar persiapan tampil
    await waitFor(() => {
      expect(screen.getByRole("checkbox")).toBeDefined();
    });

    const checkbox = screen.getByRole("checkbox");
    const startButton = screen.getByRole("button", { name: /Mulai ujian/i });

    // Setuju lalu mulai
    fireEvent.click(checkbox);
    fireEvent.click(startButton);

    // Harus masuk Mode CBT dengan timer dan navigasi soal
    expect(screen.getByText("Mode CBT")).toBeDefined();
    expect(screen.getByText(/Soal 1 \//i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Kumpulkan/i })).toBeDefined();
  });
});
