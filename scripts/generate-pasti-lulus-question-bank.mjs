import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "lib", "pasti-lulus-data.ts");
const OUT_FILE = path.join(ROOT, "lib", "pasti-lulus-question-bank.ts");
const CHOICES = ["A", "B", "C", "D", "E"];
const FOLDERS = {
  main: "tryout_univ_jurusan_pastilulus_pdf",
  additional: "tryout_tambahan_univ_jurusan_pastilulus_pdf",
  batch2: "tryout_tambahan_batch2_univ_jurusan_pastilulus_pdf",
};

function getFolder(nomor) {
  const n = Number(nomor);
  if (n <= 27) return FOLDERS.main;
  if (n <= 36) return FOLDERS.additional;
  return FOLDERS.batch2;
}

function cleanLine(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .trim();
}

function isNoiseLine(line) {
  return (
    !line ||
    /^-- \d+ of \d+ --$/.test(line) ||
    /^Pastilulus by Nuka\b/i.test(line) ||
    /^PAKET TRYOUT\b/i.test(line) ||
    /^Identitas Paket$/i.test(line) ||
    /^Kampus\b/i.test(line) ||
    /^Program Studi\/Jurusan\b/i.test(line) ||
    /^Jumlah Soal\b/i.test(line) ||
    /^Estimasi Waktu\b/i.test(line) ||
    /^Catatan\b/i.test(line) ||
    /^Struktur Tes\b/i.test(line) ||
    /^Subtes Jumlah Soal\b/i.test(line) ||
    /^Sumber acuan\b/i.test(line) ||
    /^Petunjuk\b/i.test(line) ||
    /^SOAL TRYOUT$/i.test(line) ||
    /^Waktu saran:/i.test(line) ||
    /^Rekomendasi follow-up:/i.test(line)
  );
}

function isSectionLine(line) {
  if (isNoiseLine(line)) return false;
  if (/^\d+\./.test(line) || /^[A-E]\./.test(line)) return false;
  if (line.length > 90 || line.includes("...")) return false;
  return /^(TPS|Penalaran|Pengetahuan|Kemampuan|Pemahaman|Literasi|Pengayaan)/i.test(line);
}

function normalizeSection(line) {
  return line.replace(/\s+-\s+\d+\s+soal.*$/i, "").trim();
}

function parseItems() {
  const source = fs.readFileSync(DATA_FILE, "utf8");
  const matches = [...source.matchAll(/\{\s*nomor:\s*"(\d{2})",\s*universitas:\s*"([^"]+)",\s*jurusan:\s*"([^"]+)",\s*defaultSoalFilename:\s*"([^"]+)"/g)];
  return matches.map((m) => ({
    nomor: m[1],
    universitas: m[2],
    jurusan: m[3],
    filename: m[4],
    slug: `pasti-lulus-${m[1]}`,
  }));
}

async function extractText(file) {
  const parser = new PDFParse({ data: fs.readFileSync(file) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

function parseAnswerKey(text) {
  const keyStart = text.search(/KUNCI JAWABAN|Kunci Jawaban/i);
  if (keyStart < 0) return new Map();
  const keyText = text.slice(keyStart);
  const key = new Map();
  for (const match of keyText.matchAll(/\b(\d{1,3})[\.\s]+([A-E])\b/g)) {
    key.set(Number(match[1]), match[2]);
  }
  return key;
}

function parseQuestions(text, item) {
  const keyStart = text.search(/KUNCI JAWABAN|Kunci Jawaban/i);
  const questionText = keyStart >= 0 ? text.slice(0, keyStart) : text;
  const lines = questionText.split(/\r?\n/).map(cleanLine).filter((line) => !isNoiseLine(line));
  const answers = parseAnswerKey(text);
  const questions = [];
  let currentSection = "Umum";
  let current = null;
  let currentChoice = null;

  const finalize = () => {
    if (!current) return;
    const kunci = answers.get(current.nomor);
    if (!kunci) {
      current = null;
      currentChoice = null;
      return;
    }
    for (const choice of CHOICES) {
      current.opsi[choice] = current.opsi[choice].join(" ").trim();
    }
    const complete = CHOICES.every((choice) => current.opsi[choice]);
    const questionText = current.pertanyaan.join(" ").trim();
    if (complete && questionText) {
      questions.push({
        id: `${item.slug}-${String(current.nomor).padStart(3, "0")}`,
        nomor: current.nomor,
        bagian: current.bagian,
        tingkat: current.nomor % 5 === 0 ? "HOTS" : current.nomor % 2 === 0 ? "SEDANG" : "MUDAH",
        pertanyaan: questionText,
        opsi: current.opsi,
        kunci,
        pembahasan: `Kunci jawaban: ${kunci}. Review kembali konsep pada subtes ${current.bagian}.`,
      });
    }
    current = null;
    currentChoice = null;
  };

  for (const line of lines) {
    if (isSectionLine(line)) {
      if (current && currentChoice === "E") finalize();
      currentSection = normalizeSection(line);
      continue;
    }

    const qMatch = line.match(/^(\d{1,3})\.\s*(.+)$/);
    if (qMatch) {
      finalize();
      current = {
        nomor: Number(qMatch[1]),
        bagian: currentSection,
        pertanyaan: [qMatch[2]],
        opsi: Object.fromEntries(CHOICES.map((choice) => [choice, []])),
      };
      currentChoice = null;
      continue;
    }

    if (!current) continue;
    const choiceMatch = line.match(/^([A-E])\.\s*(.*)$/);
    if (choiceMatch) {
      currentChoice = choiceMatch[1];
      current.opsi[currentChoice].push(choiceMatch[2]);
      continue;
    }

    if (currentChoice) {
      current.opsi[currentChoice].push(line);
    } else {
      current.pertanyaan.push(line);
    }
  }
  finalize();

  return questions.sort((a, b) => a.nomor - b.nomor);
}

function tsString(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderQuestion(q) {
  return `    {
      id: ${tsString(q.id)},
      nomor: ${q.nomor},
      bagian: ${tsString(q.bagian)},
      tingkat: ${tsString(q.tingkat)},
      pertanyaan: ${tsString(q.pertanyaan)},
      opsi: ${tsString(q.opsi)},
      kunci: ${tsString(q.kunci)},
      pembahasan: ${tsString(q.pembahasan)},
    }`;
}

const items = parseItems();
const output = [];
const counts = {};

for (const item of items) {
  const file = path.join(ROOT, getFolder(item.nomor), item.filename);
  const text = await extractText(file);
  const questions = parseQuestions(text, item);
  counts[item.slug] = questions.length;
  if (questions.length === 0) {
    throw new Error(`Tidak ada soal terbaca untuk ${item.slug} (${item.filename})`);
  }
  output.push(`  ${tsString(item.slug)}: [\n${questions.map(renderQuestion).join(",\n")}\n  ]`);
  console.log(`${item.slug.padEnd(15)} ${String(questions.length).padStart(3)} soal  ${item.filename}`);
}

const source = `import type { TryoutQuestion } from "@/lib/app-data";

/**
 * Bank soal PASTI LULUS 1 hasil ekstraksi dari PDF lokal.
 * Generated by scripts/generate-pasti-lulus-question-bank.mjs.
 */

export const pastiLulusQuestionCounts = ${tsString(counts)} as const;

export const soalPastiLulusPaketById = {
${output.join(",\n")}
} satisfies Record<string, TryoutQuestion[]>;
`;

fs.writeFileSync(OUT_FILE, source);
console.log(`\nGenerated ${OUT_FILE}`);
