import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "../components/AnimateOnScroll";
import AnimatedButton from "../components/AnimatedButton";
import Features from "./Features";
import "./Home.css";

import logo from "../assets/logo.webp";
import heroesIllustration from "../assets/bottom-main-image.webp";
import owlAsk from "../assets/owl-ask.webp";
import kurangPuas from "../assets/kurang-puas.webp";

export default function Home() {
  const [percent, setPercent] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Added useLocation

  useEffect(() => {
    let start = 0;
    const end = 87;
    const interval = setInterval(() => {
      start += 1;
      setPercent(start);
      if (start === end) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]); // Re-run effect when location changes

  const goToTest = () => navigate("/quiz");

  const faqs = [
    {
      question: "Apa itu SI-RAJU?",
      answer:
        "SI-RAJU adalah sistem rekomendasi jurusan kuliah berbasis tes minat bakat yang membantu siswa menentukan jurusan yang paling sesuai dengan karakter dan potensinya.",
    },
    {
      question: "Berapa lama waktu mengerjakan tes?",
      answer:
        "Tes hanya membutuhkan waktu sekitar 10–15 menit dengan pertanyaan sederhana dan mudah dipahami.",
    },
    {
      question: "Apakah hasilnya bisa dipercaya?",
      answer:
        "Hasil bersifat objektif berdasarkan sistem rekomendasi, namun tetap disarankan sebagai panduan awal sebelum mengambil keputusan akhir.",
    },
    {
      question: "Apakah tes bisa diulang?",
      answer:
        "Bisa. Kamu dapat mengulang tes kapan saja untuk mendapatkan rekomendasi terbaru.",
    },
  ];

  return (
    <>
      {/* HERO */}
      <motion.main
        className="landing-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="logo">
          <img src={logo} alt="SI-RAJU Logo" />
        </div>

        <motion.h1 className="percentage">{percent}%</motion.h1>
        <h2 className="headline">Orang Salah Pilih Jurusan Kuliah !!</h2>
        <p className="subtitle">Ikuti Tes Minat Bakat Online</p>
        <p className="free">GRATIS!!</p>

        <p className="description">
          Agar kamu tahu jurusan kuliah dan pekerjaan yang sesuai dengan bakatmu
        </p>

        <AnimatedButton className="cta" onClick={goToTest}>
          ISI TES SEKARANG
        </AnimatedButton>

        <div className="illustration">
          <img src={heroesIllustration} alt="Ilustrasi Profesi" />
        </div>
      </motion.main>

      {/* FEATURES */}
      <AnimateOnScroll animationClass="slideInUp">
        <section id="features-section" className="content-section">
          <div className="container">
            <Features />
          </div>
        </section>
      </AnimateOnScroll>

      {/* FAQ */}
      <AnimateOnScroll animationClass="slideInUp" delay={150}>
        <section className="faq-section content-section">
          <div className="container">
            <h2>Pertanyaan Umum (FAQ)</h2>

            <div className="faq-layout">
              {/* OWL */}
              <div className="faq-image">
                <img src={owlAsk} alt="Burung hantu bertanya" />
              </div>

              {/* ACCORDION */}
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${
                      activeFaq === index ? "active" : ""
                    }`}
                  >
                    <button
                      className="faq-question"
                      onClick={() =>
                        setActiveFaq(activeFaq === index ? null : index)
                      }
                    >
                      {faq.question}
                      <span className="arrow">
                        {activeFaq === index ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {activeFaq === index && (
                        <motion.div
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                        >
                          <p>{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* GUIDE */}
      <AnimateOnScroll animationClass="slideInUp" delay={150}>
        <section className="content-section">
          <div className="container">
            <div className="guide-layout">
              {/* TEKS */}
              <div className="guide-content">
                <h2>Kurang Puas?</h2>
                <p>
                  Hasil yang kamu dapatkan merupakan rekomendasi berdasarkan tes
                  minat dan bakat yang kamu isi, sehingga tidak bersifat sebagai
                  keputusan mutlak. Rekomendasi ini dapat digunakan sebagai bahan
                  pertimbangan dan diskusi bersama guru, konselor, atau orang tua
                  sebelum menentukan pilihan akhir.
                </p>
              </div>

              {/* GAMBAR */}
              <div className="guide-image">
                <img src={kurangPuas} alt="Burung hantu kurang puas" />
              </div>
            </div>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}