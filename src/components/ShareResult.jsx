import React from "react";
import './ShareResult.css';

export default function ShareResult({ shareUrl }) {
  const url =
    shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => {
        alert("Link hasil disalin ke clipboard");
    });
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hasil SI-RAJU",
          text: "Lihat rekomendasi jurusan saya",
          url,
        });
      } catch (e) {
        // Silently ignore share errors
      }
    } else {
      copyLink();
    }
  }

  const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=100x100&chl=${encodeURIComponent(
    url
  )}`;

  return (
    <div className="share-result">
      <button className="btn" onClick={nativeShare}>
        Bagikan Hasil
      </button>
      <button className="btn btn-secondary" onClick={copyLink}>
        Salin Link
      </button>
      <div className="qr-code">
        <img src={qrSrc} alt="QR Code" />
        <p>
          Scan untuk
          <br />
          lihat hasil
        </p>
      </div>
    </div>
  );
}
