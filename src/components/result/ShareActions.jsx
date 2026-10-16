import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, m } from "motion/react";
import { Bot, Check, Download, Link2, RotateCcw, Share2 } from "lucide-react";
import { encodeAnswers } from "../../lib/answerCodec.js";
import { questions } from "../../lib/recommender.js";
import { SITE } from "../../lib/site.js";
import { openChat, resultContext } from "../../lib/chatBridge.js";

export default function ShareActions({ result, answers, shared = false, onRetake }) {
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const top = result.ranked[0];
  const shareUrl = `${SITE.url}/hasil/bagikan/?r=${encodeAnswers(answers, questions)}`;

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const share = async () => {
    const data = {
      title: "Hasil tes jurusanku — SI-RAJU",
      text: `Jurusan paling cocok untukku: ${top.nama_jurusan} (${top.score}%). Coba juga tes minat bakat gratis di SI-RAJU!`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    await copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      notify("Link hasil disalin ke clipboard");
    } catch {
      notify("Gagal menyalin link");
    }
  };

  const download = async () => {
    setBusy(true);
    try {
      const { renderShareImage } = await import("./shareImage.js");
      const blob = await renderShareImage(result, SITE.url.replace(/^https?:\/\//, ""));
      const file = new File([blob], "peta-jurusan-siraju.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }) && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ files: [file], title: "Peta jurusanku — SI-RAJU" }).catch(() => {});
      } else {
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: file.name });
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        notify("Gambar hasil berhasil diunduh");
      }
    } catch {
      notify("Oops, gambar gagal dibuat. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {shared ? (
          <Link to="/tes/" className="btn btn-sun">
            Ikuti tes untuk versimu
          </Link>
        ) : (
          <>
            <button type="button" onClick={share} className="btn btn-primary">
              <Share2 size={18} aria-hidden="true" /> Bagikan hasil
            </button>
            <button type="button" onClick={download} disabled={busy} className="btn btn-ghost" aria-busy={busy}>
              <Download size={18} aria-hidden="true" /> {busy ? "Membuat gambar…" : "Unduh gambar"}
            </button>
            <button type="button" onClick={copy} className="btn btn-ghost btn-icon" aria-label="Salin link hasil">
              <Link2 size={18} aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() =>
            openChat({
              prompt: `Aku dapat rekomendasi ${top.nama_jurusan} (${top.score}%). Jelaskan prospek kerja, mata kuliah utama, dan apa yang perlu kusiapkan.`,
              context: resultContext(result),
            })
          }
          className="btn btn-ghost"
        >
          <Bot size={18} aria-hidden="true" /> Tanya AI soal hasil ini
        </button>
        {!shared && (
          <button type="button" onClick={onRetake} className="btn btn-ghost">
            <RotateCcw size={18} aria-hidden="true" /> Ulangi tes
          </button>
        )}
      </div>
      <AnimatePresence>
        {toast && (
          <m.div
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-80 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg shadow-lift"
          >
            <Check size={16} aria-hidden="true" /> {toast}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
