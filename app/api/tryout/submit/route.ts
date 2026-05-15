import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

type TryoutSubmitRequest = {
  paket: {
    slug: string;
    title: string;
    subtitle: string;
    durasiMenit: number;
    akses: "gratis" | "belajar_pro";
  };
  result: {
    benar: number;
    salah: number;
    kosong: number;
    skor: number;
    total: number;
  };
  questions?: Array<{
    id: string;
    nomor: number;
    bagian: string;
    tingkat: "MUDAH" | "SEDANG" | "HOTS";
    pertanyaan: string;
    opsi: Record<"A" | "B" | "C" | "D" | "E", string>;
    kunci: "A" | "B" | "C" | "D" | "E";
    pembahasan: string;
  }>;
  answers?: Record<string, "A" | "B" | "C" | "D" | "E" | null>;
};

export async function POST(request: Request) {
  const session = await getCurrentSession();
  const body = (await request.json()) as TryoutSubmitRequest;
  const supabaseAdmin = createAdminClient();

  if (!session || session.userId.startsWith("dev-")) {
    return Response.json({ persisted: false, message: "Session user produksi tidak ditemukan." }, { status: 202 });
  }

  if (!supabaseAdmin) {
    return Response.json({ persisted: false, message: "Supabase service role belum tersedia." }, { status: 202 });
  }

  const requiredTier = body.paket.akses === "gratis" ? "free" : "belajar";
  const { data: paket, error: packageError } = await supabaseAdmin
    .from("tryout_packages")
    .upsert(
      {
        slug: body.paket.slug,
        title: body.paket.title,
        subtitle: body.paket.subtitle,
        required_tier: requiredTier,
        duration_minutes: body.paket.durasiMenit,
        is_published: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (packageError || !paket) {
    return Response.json({ persisted: false, message: packageError?.message ?? "Paket tryout gagal disimpan." }, { status: 500 });
  }

  const { data: examSession, error: sessionError } = await supabaseAdmin
    .from("exam_sessions")
    .insert({
      user_id: session.userId,
      package_id: paket.id,
      status: "submitted",
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      score: body.result.skor,
      correct_count: body.result.benar,
      wrong_count: body.result.salah,
      blank_count: body.result.kosong,
    })
    .select("id")
    .single();

  if (sessionError || !examSession) {
    return Response.json({ persisted: false, message: sessionError?.message ?? "Sesi tryout gagal disimpan." }, { status: 500 });
  }

  if (body.questions?.length) {
    const questionRows = body.questions.map((question) => ({
      package_id: paket.id,
      number: question.nomor,
      subject: question.bagian,
      difficulty: question.tingkat,
      prompt: question.pertanyaan,
      option_a: question.opsi.A,
      option_b: question.opsi.B,
      option_c: question.opsi.C,
      option_d: question.opsi.D,
      option_e: question.opsi.E,
      answer_key: question.kunci,
      explanation: question.pembahasan,
      source_label: question.id,
      status: "published",
      updated_at: new Date().toISOString(),
    }));

    const { data: persistedQuestions, error: questionError } = await supabaseAdmin
      .from("questions")
      .upsert(questionRows, { onConflict: "package_id,number" })
      .select("id,source_label,answer_key");

    if (questionError) {
      return Response.json({ persisted: false, message: questionError.message }, { status: 500 });
    }

    const answerRows = (persistedQuestions ?? []).map((question) => {
      const selected = body.answers?.[question.source_label ?? ""];
      return {
        session_id: examSession.id,
        question_id: question.id,
        selected_answer: selected ?? null,
        is_correct: selected ? selected === question.answer_key : null,
        updated_at: new Date().toISOString(),
      };
    });

    if (answerRows.length) {
      const { error: answerError } = await supabaseAdmin.from("exam_answers").upsert(answerRows, {
        onConflict: "session_id,question_id",
      });

      if (answerError) {
        return Response.json({ persisted: false, message: answerError.message }, { status: 500 });
      }
    }
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: session.userId,
    action: "tryout_submitted",
    entity_type: "exam_sessions",
    entity_id: examSession.id,
    metadata: {
      packageSlug: body.paket.slug,
      totalQuestions: body.result.total,
      score: body.result.skor,
    },
  });

  return Response.json({ persisted: true, examSessionId: examSession.id });
}
