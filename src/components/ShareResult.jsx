import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import "./ShareResult.css";

export default function ShareResult({ shareUrl, imageExportRef }) {
  const [toastMessage, setToastMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const url =
    shareUrl || (typeof window !== "undefined" ? window.location.href : "");

  function triggerToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => {
      triggerToast("Link berhasil disalin ke clipboard!");
    });
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hasil Tes Minat Jurusan",
          text: "Cek rekomendasi jurusan yang paling cocok untukku!",
          url,
        });
      } catch (e) {
        // This can happen if the user cancels the share sheet
        console.log("Native share failed or was cancelled", e);
      }
    } else {
      // Fallback for desktop browsers
      copyLink();
    }
  }

  async function downloadImage() {
    if (!imageExportRef?.current) {
      triggerToast("Gagal memuat konten gambar. Coba lagi.");
      return;
    }

    setIsGenerating(true);

    try {
      // The element is off-screen, so we need to be explicit with dimensions
      const element = imageExportRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        // Set a default background color, useful for transparent elements
        backgroundColor: "#F0F8FF", 
        // Higher scale means better resolution
        scale: 2,
        // Since the element has a fixed width in CSS, we don't need to specify it here
      });

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'hasil-tes-jurusan-siraju.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("Gambar berhasil diunduh!");

    } catch (error) {
      console.error("Gagal membuat gambar:", error);
      triggerToast("Oops, terjadi kesalahan saat membuat gambar.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <div className="share-buttons">
        <button className="share-btn primary-blue" onClick={nativeShare}>
          <span className="icon">🔗</span> Bagikan Link
        </button>
        <button
          className="share-btn secondary-solid"
          onClick={downloadImage}
          disabled={isGenerating}
        >
          <span className="icon">🖼️</span>
          {isGenerating ? "Membuat..." : "Unduh Gambar"}
        </button>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="toast-notif toast-improved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="toast-sub">{toastMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
