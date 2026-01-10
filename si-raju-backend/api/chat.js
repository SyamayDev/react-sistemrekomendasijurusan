import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { readFileSync } from "fs";

/* =======================
   CORS HELPER (WAJIB)
======================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/* =======================
   JSON LOADER
======================= */
function readJSONData(filePath) {
  const absolutePath = path.join(process.cwd(), filePath);
  const fileContent = readFileSync(absolutePath, "utf8");
  return JSON.parse(fileContent);
}

const majors = readJSONData("src/data/majors.json");
const questions = readJSONData("src/data/questions.json");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =======================
   SYSTEM CONTEXT
======================= */
function getChatbotContext() {
  const majorList = majors
    .map((m) => `- ${m.nama_jurusan}: ${m.deskripsi}`)
    .join("\n");

  const quizInfo = `Kuis terdiri dari ${questions.length} pertanyaan pilihan ganda, skala, dan isian singkat yang akan mengukur karakter, kebiasaan, dan minat pengguna.`;

  return `
Anda adalah "Jurusan AI", asisten AI untuk website "Sistem Rekomendasi Jurusan".

TUGAS ANDA:
- Membantu pengguna memahami jurusan kuliah
- Menjelaskan cara kerja kuis rekomendasi
- Memberikan jawaban singkat, jelas, dan relevan

ATURAN:
- Selalu gunakan Bahasa Indonesia
- Jangan mengarang jika tidak tahu
- Tolak dengan sopan jika pertanyaan di luar konteks pendidikan

=== INFO WEBSITE ===
Website ini merekomendasikan jurusan kuliah berdasarkan hasil kuis.

=== INFO KUIS ===
${quizInfo}

=== DAFTAR JURUSAN ===
${majorList}
`;
}

/* =======================
   API HANDLER (VERCEL)
======================= */
export default async function handler(req, res) {
  // 🔥 CORS PALING ATAS
  setCors(res);

  // 🔥 HANDLE PREFLIGHT
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    /* =======================
       FALLBACK AI
    ======================= */
    const fallbackReply = (msg) => {
      const lower = msg.toLowerCase();

      for (const m of majors) {
        if (lower.includes(m.nama_jurusan.toLowerCase())) {
          return `${m.nama_jurusan}: ${m.deskripsi}`;
        }
      }

      if (lower.includes("kuis") || lower.includes("tes")) {
        return `Kuis terdiri dari ${questions.length} pertanyaan untuk menilai minat dan bakat kamu.`;
      }

      if (lower.includes("cara") || lower.includes("bagaimana")) {
        return `Klik tombol "ISI TES SEKARANG" di halaman utama dan jawab pertanyaan dengan jujur.`;
      }

      return `Saya bisa membantu seputar jurusan dan kuis rekomendasi. Silakan tanyakan nama jurusan atau ketik "kuis".`;
    };

    /* =======================
       GEMINI AI
    ======================= */
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const chatHistory = [
          {
            role: "user",
            parts: [{ text: getChatbotContext() }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Halo! Saya Jurusan AI. Ada yang bisa saya bantu?",
              },
            ],
          },
        ];

        if (history && history.length > 1) {
          history.slice(1).forEach((msg) => {
            chatHistory.push({
              role: msg.role,
              parts: [{ text: msg.parts[0].text }],
            });
          });
        }

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: { maxOutputTokens: 500 },
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        return res.status(200).json({ reply: text });
      } catch (err) {
        console.error("Gemini error → fallback:", err);
        return res.status(200).json({ reply: fallbackReply(message) });
      }
    }

    // 🔁 TANPA API KEY
    return res.status(200).json({ reply: fallbackReply(message) });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
