import React, { useState } from "react";
import './ShareResult.css';

export default function ShareResult({ shareUrl }) {
  const [showToast, setShowToast] = useState(false);
  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  function triggerToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hilang setelah 3 detik
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

      {/* Pop up Toast Notifikasi */}
      {showToast && (
        <div className="toast-notif">
          ✨ Link berhasil disalin ke clipboard!
        </div>
      )}
    </>
  );
}