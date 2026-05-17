import { getCurrentSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

// Accept both legacy format (paket.slug from frontend) and future format (paketSlug).
type TryoutSubmitRequest = {
  paketSlug?: string;
  paket?: {
    slug: string;
    title: string;
    subtitle: string;
    durasiMenit: number;
    akses: "gratis" | "belajar_pro";
  };
  // Client sends questions from static bank — used for scoring only when
  // the package has not yet been migrated to the questions table in DB.
  questions?: Array<{
    id: string;
    kunci: "A" | "B" | "C" | "D" | "E";
  }>;
  answers: Record<string, "A" | "B" | "C" | "D" | "E" | null>;
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

  // Support both legacy and new request shapes.
  const slug = body.paketSlug ?? body.paket?.slug;
  if (!slug || typeof slug !== "string") {
    return Response.json({ persisted: false, message: "Slug paket tidak valid." }, { status: 400 });
  }

  const answers = body.answers ?? {};

  // Try to resolve package from DB first.
  const { data: paket } = await supabaseAdmin
    .from("tryout_packages")
    .select("id,required_tier")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<{ id: string; required_tier: string }>();

  // Enforce tier access server-side when package is known.
  if (paket) {
    const tierRequired = paket.required_tier === "free" ? "gratis" : "belajar_pro";
    if (tierRequired === "belajar_pro" && session.tier === "free") {
      return Response.json({ persisted: false, message: "Akses paket ini membutuhkan langganan." }, { status: 403 });
    }
  } else {
    // Package not yet migrated to DB — fall back to client-sent tier from
    // the static question bank. Tier enforcement relies on frontend guard only.
    const akses = body.paket?.akses ?? "gratis";
    if (akses === "belajar_pro" && session.tier === "free") {
      return Response.json({ persisted: false, message: "Akses paket ini membutuhkan langganan." }, { status: 403 });
    }
  }

  let correct = 0;
  let wrong = 0;
  let blank = 0;
  let total = 0;
  let dbQuestions: Array<{ id: string; answer_key: string; source_label: string | null }> = [];

  if (paket) {
    // Authoritative path: score from DB answer keys, not client data.
    const { data: qs, error } = await supabaseAdmin
      .from("questions")
      .select("id,answer_key,source_label")
      .eq("package_id", paket.id)
      .eq("status", "published");

    if (error) {
      return Response.json({ persisted: false, message: error.message }, { status: 500 });
    }

    dbQuestions = qs ?? [];
    total = dbQuestions.length;

    for (const q of dbQuestions) {
      const selected = answers[q.source_label ?? q.id];
      if (!selected) blank++;
      else if (selected === q.answer_key) correct++;
      else wrong++;
    }
  } else if (body.questions?.length) {
    // Fallback path: questions not in DB yet, score from client-sent question list.
    // client sends answer keys from the static bank — not from user input.
    total = body.questions.length;
    for (const q of body.questions) {
      const selected = answers[q.id];
      if (!selected) blank++;
      else if (selected === q.kunci) correct++;
      else wrong++;
    }
  }

  // UM scoring: +4 correct, -1 wrong, 0 blank.
  const score = total > 0 ? Math.max(0, correct * 4 - wrong) : 0;

  // Upsert package record so the DB catches up when questions are seeded later.
  let packageId: string | null = paket?.id ?? null;
  if (!paket && body.paket) {
    const requiredTier = body.paket.akses === "gratis" ? "free" : "belajar";
    const { data: upserted } = await supabaseAdmin
      .from("tryout_packages")
      .upsert(
        {
          slug,
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
      .maybeSingle<{ id: string }>();
    packageId = upserted?.id ?? null;
  }

  if (!packageId) {
    return Response.json({ persisted: false, message: "Paket tryout tidak dapat diidentifikasi." }, { status: 500 });
  }

  const { data: examSession, error: sessionError } = await supabaseAdmin
    .from("exam_sessions")
    .insert({
      user_id: session.userId,
      package_id: packageId,
      status: "submitted",
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      score,
      correct_count: correct,
      wrong_count: wrong,
      blank_count: blank,
    })
    .select("id")
    .single();

  if (sessionError || !examSession) {
    return Response.json({ persisted: false, message: sessionError?.message ?? "Sesi tryout gagal disimpan." }, { status: 500 });
  }

  // Persist per-question answers only when DB questions exist.
  if (dbQuestions.length) {
    const answerRows = dbQuestions.map((q) => {
      const selected = answers[q.source_label ?? q.id] ?? null;
      return {
        session_id: examSession.id,
        question_id: q.id,
        selected_answer: selected,
        is_correct: selected ? selected === q.answer_key : null,
        updated_at: new Date().toISOString(),
      };
    });

    const { error: answerError } = await supabaseAdmin
      .from("exam_answers")
      .upsert(answerRows, { onConflict: "session_id,question_id" });

    if (answerError) {
      return Response.json({ persisted: false, message: answerError.message }, { status: 500 });
    }
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: session.userId,
    action: "tryout_submitted",
    entity_type: "exam_sessions",
    entity_id: examSession.id,
    metadata: { packageSlug: slug, totalQuestions: total, score },
  });

  return Response.json({ persisted: true, examSessionId: examSession.id, score, correct, wrong, blank });
}
