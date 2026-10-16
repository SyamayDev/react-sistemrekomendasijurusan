/**
 * SI-RAJU AI chat: streaming replies, multi-turn memory (sent as short
 * history), optional result context, stop/retry, and session persistence.
 * Desktop: floating panel. Mobile: full-screen sheet.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import MotionProvider from "../MotionProvider.jsx";
import { ArrowUp, RotateCcw, Square, Trash2, X } from "lucide-react";
import Markdown from "./markdown.jsx";
import OwlMascot from "../ui/OwlMascot.jsx";
import { SITE } from "../../lib/site.js";
import { KEYS } from "../../lib/storage.js";

const GREETING = {
  role: "model",
  text: "Halo! Aku **SI-RAJU AI** 🦉\nAku bisa bantu kamu memahami jurusan kuliah, prospek kerja, mata kuliah, sampai cara memilih di antara beberapa pilihan. Mau tanya apa?",
};
const SUGGESTIONS = [
  "Apa beda Teknik Informatika dan Sistem Informasi?",
  "Jurusan apa yang cocok kalau suka menggambar?",
  "Bagaimana prospek kerja lulusan Psikologi?",
  "Tips memilih jurusan untuk SNBP/SNBT",
];
const MAX_LEN = 600;

const loadSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEYS.chat)) || null;
  } catch {
    return null;
  }
};

export default function ChatPanel({ open, onClose, request }) {
  const saved = useRef(loadSession());
  const [messages, setMessages] = useState(() => saved.current?.messages || [GREETING]);
  const [context, setContext] = useState(() => saved.current?.context || null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const abort = useRef(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const handled = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEYS.chat, JSON.stringify({ messages: messages.slice(-30), context }));
    } catch {
      /* ignore */
    }
  }, [messages, context]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function send(text, ctx = context) {
    const message = text.trim().slice(0, MAX_LEN);
    if (!message || busy) return;
    setError(null);
    setInput("");
    const history = messages
      .filter((m) => m !== GREETING && !m.error)
      .slice(-10)
      .map(({ role, text: t }) => ({ role, text: t }));
    setMessages((prev) => [...prev, { role: "user", text: message }, { role: "model", text: "", pending: true }]);
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;

    const write = (fn) =>
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = fn(copy[copy.length - 1]);
        return copy;
      });

    try {
      const res = await fetch(SITE.chatApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, context: ctx || undefined, stream: true }),
        signal: controller.signal,
      });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || type.includes("application/json")) {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.reply || data.error || "Server sedang sibuk.");
        write((m) => ({ ...m, text: data.reply || "", pending: false }));
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          write((m) => ({ ...m, text: m.text + chunk, pending: false }));
        }
      }
    } catch (e) {
      if (e.name === "AbortError") {
        write((m) => ({ ...m, pending: false, text: m.text || "_(dihentikan)_" }));
      } else {
        setMessages((prev) => prev.slice(0, -1));
        setError({
          text: e.message?.startsWith("⚠") ? e.message : "Koneksi ke SI-RAJU AI terputus. Periksa internetmu lalu coba lagi.",
          retry: message,
        });
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  // Requests from elsewhere (e.g. "Tanya AI soal hasil ini").
  useEffect(() => {
    if (!request || handled.current === request.id) return;
    handled.current = request.id;
    if (request.context) setContext(request.context);
    if (request.prompt) send(request.prompt, request.context || context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const reset = () => {
    abort.current?.abort();
    setMessages([GREETING]);
    setContext(null);
    setError(null);
  };

  const userCount = messages.filter((m) => m.role === "user").length;

  return (
    <MotionProvider>
      <AnimatePresence>
        {open && (
          <m.section
            id="chat-siraju"
            role="dialog"
            aria-modal="false"
            aria-labelledby="chat-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-65 flex flex-col overflow-hidden bg-surface sm:inset-auto sm:bottom-28 sm:right-7 sm:h-[min(40rem,calc(100svh-9rem))] sm:w-[25rem] sm:rounded-[1.75rem] sm:border sm:border-line sm:shadow-lift"
          >
            <header data-theme="dark" className="flex items-center gap-3 bg-night-800 px-4 py-3 text-ink">
              <OwlMascot interactive={false} mood={busy ? "thinking" : "idle"} className="h-10 w-auto" />
              <div className="flex-1">
                <h2 id="chat-title" className="font-bold text-white">
                  SI-RAJU AI
                </h2>
                <p className="text-xs text-ink-muted">{busy ? "Sedang mengetik…" : "Asisten jurusan kuliah"}</p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="btn btn-icon text-ink-muted hover:bg-white/10 hover:text-white"
                aria-label="Mulai percakapan baru"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-icon text-ink-muted hover:bg-white/10 hover:text-white"
                aria-label="Tutup chat"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-[0.95rem] leading-relaxed ${
                      msg.role === "user" ? "rounded-br-lg bg-primary text-on-primary" : "rounded-bl-lg bg-surface-2 text-ink"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : msg.pending && !msg.text ? (
                      <span className="flex gap-1 py-1" aria-label="SI-RAJU AI sedang mengetik">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="size-2 rounded-full bg-ink-soft motion-safe:animate-bounce"
                            style={{ animationDelay: `${d * 120}ms` }}
                          />
                        ))}
                      </span>
                    ) : (
                      <Markdown text={msg.text} />
                    )}
                  </div>
                </div>
              ))}
              {error && (
                <div role="alert" className="rounded-2xl border border-[#ff7a90]/40 bg-[#ff7a90]/10 p-3 text-sm text-ink">
                  {error.text}
                  <button
                    type="button"
                    onClick={() => send(error.retry)}
                    className="ml-2 inline-flex items-center gap-1 font-semibold text-primary underline"
                  >
                    <RotateCcw size={14} aria-hidden="true" /> Coba lagi
                  </button>
                </div>
              )}
              {userCount === 0 && (
                <ul className="flex flex-wrap gap-2 pt-2" aria-label="Contoh pertanyaan">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-2xl border border-line bg-surface px-3 py-2 text-left text-sm font-medium text-ink-muted transition-colors hover:border-primary/40 hover:text-ink"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {context && (
              <p className="mx-4 mb-2 flex items-center justify-between gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                Memakai konteks hasil tesmu
                <button
                  type="button"
                  onClick={() => setContext(null)}
                  className="grid size-6 place-items-center rounded-full hover:bg-primary/10"
                  aria-label="Hapus konteks hasil tes"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-end gap-2 rounded-3xl border border-line bg-bg px-3 py-2 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                <label htmlFor="chat-input" className="sr-only">
                  Ketik pertanyaanmu
                </label>
                <textarea
                  id="chat-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_LEN}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Tanya soal jurusan…"
                  className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-[0.95rem] text-ink placeholder:text-ink-soft focus:outline-none focus-visible:outline-none"
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={() => abort.current?.abort()}
                    className="btn btn-icon btn-ghost !min-h-10 !min-w-10"
                    aria-label="Hentikan jawaban"
                  >
                    <Square size={14} aria-hidden="true" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="btn btn-icon btn-primary !min-h-10 !min-w-10"
                    aria-label="Kirim pesan"
                  >
                    <ArrowUp size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-center text-[0.7rem] text-ink-soft">AI bisa keliru. Cek ulang info penting ke sumber resmi.</p>
            </form>
          </m.section>
        )}
      </AnimatePresence>
    </MotionProvider>
  );
}
