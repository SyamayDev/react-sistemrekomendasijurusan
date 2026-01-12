import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import "./ShareResult.css";

export default function ShareResult({ imageExportRef }) {
  const [toastMessage, setToastMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // The user explicitly requested to share the homepage URL.
  const homepageUrl = "https://syamaydev.github.io/react-sistemrekomendasijurusan/";

  function triggerToast(message) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function copyHomepageLink() {
    navigator.clipboard?.writeText(homepageUrl).then(() => {
      triggerToast("Link laman utama telah disalin!");
    });
  }

  async function nativeShareHomepage() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SI-RAJU: Sistem Rekomendasi Jurusan",
          text: "Temukan jurusan kuliah yang paling cocok untukmu dengan tes berbasis data ini!",
          url: homepageUrl,
        });
      } catch (e) {
        console.log("Native share failed or was cancelled", e);
      }
    } else {
      // Fallback for desktop browsers that don't support native share
      copyHomepageLink();
    }
  }

  async function downloadImage() {
    if (!imageExportRef?.current) {
      triggerToast("Gagal memuat konten gambar. Coba lagi.");
      return;
    }

    setIsGenerating(true);

    try {
      const element = imageExportRef.current;
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: "#F0F8FF",
        scale: 2,
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
      
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
        <button className="share-btn primary-blue" onClick={nativeShareHomepage}>
          <span className="icon">🔗</span> Bagikan Web
        </button>
        <button
          className="share-btn secondary-solid"
          onClick={downloadImage}
          disabled={isGenerating}
        >
          <span className="icon">🖼️</span>
          {isGenerating ? "Membuat..." : "Unduh Hasil"}
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
