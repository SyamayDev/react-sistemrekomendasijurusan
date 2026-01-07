import React from "react";
import './About.css';

export default function About() {
  return (
    <div className="about-page container animate-fade-in">
      <div className="card">
        <h2>Tentang Sistem SI-RAJU</h2>
        <p>
          SI-RAJU adalah sistem rekomendasi jurusan yang dirancang untuk
          membantu siswa SMA menentukan jurusan yang paling cocok berdasarkan
          respons kuis minat & bakat. Sistem ini menggunakan metode perbandingan
          profil dan penilaian berbasis data untuk menghasilkan rekomendasi yang
          mudah dimengerti.
        </p>
        <h3>Tujuan Kami</h3>
        <ul>
          <li>
            Membantu siswa membuat keputusan pendidikan yang lebih
            informasional.
          </li>
          <li>Mendukung guru dan konselor dengan laporan yang obyektif.</li>
          <li>Menyediakan pengalaman kuis yang cepat, modern, dan responsif.</li>
        </ul>
      </div>
    </div>
  );
}
