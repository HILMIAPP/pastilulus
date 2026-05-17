type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPayload = {
  message: string;
  history?: ChatMessage[];
};

const SYSTEM_PROMPT = `Kamu adalah AI asisten resmi Pastilulus, platform persiapan Ujian Mandiri PTN terpercaya di Indonesia.

Tugas kamu:
- Menjawab pertanyaan seputar platform, paket, tryout, Info PTN, dan persiapan ujian mandiri.
- Selalu ramah, singkat, dan langsung ke intinya.
- Gunakan bahasa Indonesia santai tapi sopan. Panggil user "kak".

Informasi platform:
- Nama: Pastilulus by Nukaedu
- Kontak: halo@pastilulus.id | WA: 085155072188

Paket yang tersedia:
- Free (Rp 0/bulan): tryout terbatas, info PTN dasar, contoh materi.
- Belajar (Rp 29.000/bulan): soal & simulasi lengkap, info PTN + deadline tracker, jadwal belajar personal, tryout paket UM produksi.
- Pro (Rp 49.000/bulan): semua fitur Belajar + rasionalisasi nilai, analitik kelemahan mendalam, prioritas support, AI tutor.

Fitur tersedia di platform:
- Tryout CBT simulasi UM (SIMAK UI, UM UGM, SM ITB, SMUA UNAIR, UTM IPB, SM ITS, SMUP UNPAD, UM UNDIP, SMUB UB, Mandiri UNHAS) — total 1.240+ soal.
- Info 20 PTN Ujian Mandiri: jadwal, biaya, dokumen, strategi.
- Jadwal belajar personal berbasis onboarding target kampus.
- Rasionalisasi nilai: estimasi peluang berdasarkan skor tryout.
- Materi belajar PDF + logbook rangkuman UM PTN 2026.

Aturan penting:
- Jangan membuat janji spesifik tentang kelulusan atau jaminan PTN.
- Jika pertanyaan di luar topik platform atau pendidikan PTN, arahkan balik dengan sopan.
- Untuk masalah teknis atau pembayaran yang tidak bisa diselesaikan, sarankan kontak langsung: halo@pastilulus.id atau WA 085155072188.
- Jawaban maksimal 3-4 kalimat, kecuali penjelasan teknis yang membutuhkan lebih.`;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ChatPayload;
  const message = String(payload.message ?? "").trim();

  if (!message) {
    return Response.json({ ok: false, message: "Pesan wajib diisi." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { ok: false, reply: "Maaf, AI sedang tidak tersedia. Hubungi kami via WA 085155072188 atau halo@pastilulus.id." },
      { status: 503 },
    );
  }

  // Build conversation history for multi-turn context.
  const history: ChatMessage[] = (payload.history ?? []).slice(-10); // keep last 10 turns max

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.5,
    }),
  }).catch(() => null);

  if (!response?.ok) {
    return Response.json(
      { ok: false, reply: "AI sedang sibuk, coba lagi sebentar. Atau hubungi langsung via WA 085155072188." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const reply = data.choices?.[0]?.message?.content?.trim() ?? "Maaf, tidak ada jawaban dari AI.";

  return Response.json({ ok: true, reply });
}
