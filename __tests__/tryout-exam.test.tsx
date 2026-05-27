import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TryoutExam } from "@/components/tryout-exam";
import type { TryoutPaket } from "@/lib/app-data";
import React from "react";

// Mock next/link
vi.mock("next/link", () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Mock fetch API globally
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
);

// Mock global window alert or config defaults
beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
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

  it("should render instructions page first and disable start button by default", () => {
    render(<TryoutExam paket={mockPaket} />);

    // Verify title and subtitle are shown
    expect(screen.getByText("Ruang persiapan CBT")).toBeDefined();
    expect(screen.getByText("Materi Ujian Mandiri Paket 1")).toBeDefined();
    expect(screen.getByText("Peraturan ujian")).toBeDefined();

    // Verify start button is disabled by default
    const startButton = screen.getByRole("button", { name: /Mulai ujian/i });
    expect(startButton).toBeDefined();
    expect((startButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("should enable start button when agreement checkbox is checked", () => {
    render(<TryoutExam paket={mockPaket} />);

    const checkbox = screen.getByRole("checkbox");
    const startButton = screen.getByRole("button", { name: /Mulai ujian/i });

    expect((startButton as HTMLButtonElement).disabled).toBe(true);

    // Click checkbox
    fireEvent.click(checkbox);
    expect((startButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("should enter exam mode when clicking Start after agreeing", () => {
    render(<TryoutExam paket={mockPaket} />);

    const checkbox = screen.getByRole("checkbox");
    const startButton = screen.getByRole("button", { name: /Mulai ujian/i });

    // Agree and Start
    fireEvent.click(checkbox);
    fireEvent.click(startButton);

    // Verify we are in Exam Mode (should show timer or question section)
    expect(screen.getByText("Mode CBT")).toBeDefined();
    expect(screen.getByText(/Soal 1 \//i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Kumpulkan/i })).toBeDefined();
  });
});
