import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { readFileSync } from "fs";

// Helper to read JSON files robustly in a serverless environment
function readJSONData(filePath) {
  // Construct an absolute path relative to the project root
  const absolutePath = path.join(process.cwd(), filePath);
  const fileContent = readFileSync(absolutePath, "utf8");
  return JSON.parse(fileContent);
}

// Load data using the helper
const majors = readJSONData("src/data/majors.json");
const questions = readJSONData("src/data/questions.json");

// IMPORTANT: Set the GEMINI_API_KEY environment variable in your deployment platform.
// Do NOT hardcode the API key here.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getChatbotContext() {
  const majorList = majors
    .map((m) => `- ${m.nama_jurusan}: ${m.deskripsi}`)
    .join("\n");
  const quizInfo = `Kuis terdiri dari ${questions.length} pertanyaan pilihan ganda, skala, dan isian singkat yang akan mengukur karakter, kebiasaan, dan minat pengguna untuk merekomendasikan jurusan yang paling sesuai.`;

  const context = `
    Anda adalah 'Jurusan AI', asisten AI yang ramah dan informatif untuk website 'Sistem Rekomendasi Jurusan'.
    Tugas Anda adalah membantu pengguna memahami tentang jurusan kuliah, cara kerja kuis rekomendasi, dan memberikan informasi terkait.
    Selalu berkomunikasi dalam Bahasa Indonesia dengan gaya yang positif dan mendukung.

    Berikut adalah basis pengetahuan Anda:

    === TENTANG WEBSITE ===
    Website ini adalah sistem rekomendasi jurusan kuliah berbasis kuis. Pengguna menjawab serangkaian pertanyaan, dan sistem akan memberikan peringkat jurusan yang paling cocok berdasarkan jawaban mereka.
    
    === TENTANG KUIS ===
    ${quizInfo}
    Pengguna bisa memulai kuis dari halaman utama. Hasilnya akan menampilkan beberapa jurusan yang paling direkomendasikan beserta skornya.

    === DAFTAR JURUSAN YANG TERSEDIA ===
    Berikut adalah daftar jurusan yang ada di sistem kami. Anda bisa memberikan penjelasan singkat tentang jurusan ini jika ada yang bertanya.
    ${majorList}

    === GAYA JAWABAN ===
    - Jika Anda tidak tahu jawabannya, katakan terus terang bahwa Anda tidak memiliki informasi tersebut, jangan mengarang.
    - Jika pertanyaan tidak relevan (misalnya tentang cuaca, politik, atau di luar konteks pendidikan/jurusan), jawab dengan sopan bahwa Anda hanya bisa menjawab pertanyaan seputar rekomendasi jurusan.
    - Tetap singkat dan jelas. Gunakan daftar (bullet points) jika perlu untuk mempermudah pembacaan.
  `;
  return context;
}

// This is the entry point for Vercel Serverless Functions
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // If there is no API key, or Gemini model fails, we gracefully fallback
    // to a lightweight rule-based responder so the dev chatbot remains usable.
    const fallbackReply = (msg) => {
      const lower = msg.toLowerCase();

      // If user asks about a specific major, return its description
      for (const m of majors) {
        if (lower.includes(m.nama_jurusan.toLowerCase())) {
          return `${m.nama_jurusan}: ${m.deskripsi}`;
        }
      }

      if (lower.includes("kuis") || lower.includes("tes")) {
        return `Kuis terdiri dari ${questions.length} pertanyaan. Jawabannya digunakan untuk menilai minat dan bakat sehingga sistem merekomendasikan jurusan yang sesuai.`;
      }

      if (lower.includes("cara") || lower.includes("bagaimana")) {
        return `Kamu bisa mulai kuis dari halaman utama. Klik tombol "ISI TES SEKARANG" dan jawab pertanyaan dengan jujur untuk mendapatkan rekomendasi jurusan.`;
      }

      // Generic helpful fallback
      return `Maaf, layanan AI eksternal sedang tidak tersedia. Sementara ini saya bisa memberikan info dasar tentang jurusan. Coba tanyakan nama jurusan, atau ketik "kuis" untuk info tentang tes.`;
    };

    // Try the external Gemini API only when an API key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const systemInstruction = getChatbotContext();

        const chatHistory = [
          {
            role: "user",
            parts: [{ text: systemInstruction }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Halo! Saya Jurusan AI, asisten virtual Anda. Ada yang bisa saya bantu terkait pemilihan jurusan atau kuis di website ini?",
              },
            ],
          },
        ];

        // Add existing chat history
        if (history && history.length > 0) {
          // Start from the second message to avoid duplicating the initial greeting
          history.slice(1).forEach((msg) => {
            chatHistory.push({
              role: msg.role,
              parts: [{ text: msg.parts[0].text }],
            });
          });
        }

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 500,
          },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ reply: text });
      } catch (apiErr) {
        console.error(
          "Gemini API error, falling back to local responder:",
          apiErr
        );
        // don't expose SDK internals; give the client a useful message
        return res.status(200).json({ reply: fallbackReply(message) });
      }
    }

    // No API key -> fallback reply (keeps dev experience smooth)
    return res.status(200).json({ reply: fallbackReply(message) });
  } catch (error) {
    console.error("API handler unexpected error:", error);
    res
      .status(500)
      .json({
        error: "Internal server error",
        details: error.message || String(error),
      });
  }
}
