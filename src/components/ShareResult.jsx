import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ShareResult.css";

export default function ShareResult({ shareUrl }) {
  const [showToast, setShowToast] = useState(false);
  const url =
    shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  function triggerToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => {
      triggerToast();
    });
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hasil Tes Minat Jurusan",
          text: "Cek rekomendasi jurusan yang cocok buat aku!",
          url,
        });
      } catch (e) {
        console.log("Sharing failed", e);
        copyLink();
      }
    } else {
      copyLink();
    }
  }

  return (
    <>
      <div className="share-buttons">
        <button className="share-btn primary-blue" onClick={nativeShare}>
          <span className="icon">📤</span> Bagikan Hasil
        </button>
        <button className="share-btn secondary-outline" onClick={copyLink}>
          <span className="icon">🔗</span> Salin Link
        </button>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            className="toast-notif toast-improved"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35 }}
          >
            <strong>Berhasil!</strong>
            <div className="toast-sub">Link telah disalin ke clipboard.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
