import React, { useEffect, useRef, useState } from "react";
import "./Footer.css";

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.81 1.91 3.58-.7-.02-1.37-.21-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07c.54 1.7 2.1 2.95 3.95 2.98-1.47 1.15-3.32 1.83-5.33 1.83-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21c7.34 0 11.35-6.08 11.35-11.35 0-.17 0-.34-.01-.51.78-.57 1.45-1.28 1.99-2.08z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m6.4 4.2c-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4-1.5-3.4-3.4-3.4M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4m4.6-2.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4" />
  </svg>
);

const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.28.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8a9.56 9.56 0 0 1 2.5-.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.57.69.48A10 10 0 0 0 22 12 10 10 0 0 0 12 2z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7.5 12.3c-.1 1.4-.7 2.4-2.1 2.8-1.2.3-2.9.4-4.4.4s-3.2-.1-4.4-.4c-1.4-.4-2-1.4-2.1-2.8-.1-1.2-.1-2.2-.1-2.3 0-.1 0-1.1.1-2.3.1-1.4.7-2.4 2.1-2.8 1.2-.3 2.9-.4 4.4-.4s3.2.1 4.4.4c1.4.4 2 1.4 2.1 2.8.1 1.2.1 2.2.1 2.3 0 .1 0 1.1-.1 2.3zM10.5 8.5v7l4.5-3.5-4.5-3.5z" />
  </svg>
);

export default function Footer() {
    const footerRef = useRef(null);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [isAboutClosing, setIsAboutClosing] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [isPrivacyClosing, setIsPrivacyClosing] = useState(false);

    const handleCloseAbout = () => {
      setIsAboutClosing(true);
      setTimeout(() => {
        setShowAboutModal(false);
        setIsAboutClosing(false);
      }, 300); // Animation duration
    };

    const handleClosePrivacy = () => {
      setIsPrivacyClosing(true);
      setTimeout(() => {
        setShowPrivacyModal(false);
        setIsPrivacyClosing(false);
      }, 300); // Animation duration
    };
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show-anim");
            observer.unobserve(entry.target); // animasi cuma sekali
          }
        },
        {
          threshold: 0.15,
        }
      );
  
      if (footerRef.current) {
        observer.observe(footerRef.current);
      }
  
      return () => observer.disconnect();
    }, []);
  
    return (
      <>
        <div className="footer-transition" />
  
        <footer ref={footerRef} className="site-footer hidden-anim">
          {/* WAVE TOP FOOTER */}
          <svg
            className="footer-wave"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#8fc9f9"
              d="M0,160 C240,80 480,220 720,190 960,160 1200,100 1440,140 L1440,0 L0,0 Z"
            />
          </svg>
  
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-6">
                <h6>About</h6>
                <p className="text-justify">
                  <i>SI-RAJU</i> adalah sistem rekomendasi jurusan yang membantu
                  pengguna memilih jurusan yang tepat sesuai dengan minat, bakat,
                  dan kemampuan yang dimiliki melalui proses analisis data yang
                  sederhana, cepat, dan mudah dipahami, sehingga memudahkan
                  pengguna dalam mengambil keputusan pendidikan.
                </p>
              </div>
  
              <div className="col-xs-6 col-md-3">
                <h6>REFERENSI</h6>
                <ul className="footer-links">
                  <li>
                    <a href="https://www.kemdikbud.go.id" target="_blank" rel="noopener noreferrer">Kemdikbud</a>
                  </li>
                  <li>
                    <a href="https://snpmb.bppp.kemdikbud.go.id" target="_blank" rel="noopener noreferrer">SNPMB</a>
                  </li>
                  <li>
                    <a href="https://pddikti.kemdikbud.go.id" target="_blank" rel="noopener noreferrer">PDDikti</a>
                  </li>
                </ul>
              </div>
  
              <div className="col-xs-6 col-md-3">
                <h6>Quick Links</h6>
                <ul className="footer-links">
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowAboutModal(true); }}>About Us</a>
                  </li>
                  <li>
                    <a href="https://wa.me/6282267403010" target="_blank" rel="noopener noreferrer">Contact Us</a>
                  </li>
                  <li>
                    <a href="https://github.com/SyamayDev/react-sistemrekomendasijurusan" target="_blank" rel="noopener noreferrer">Contribute</a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}>Privacy Policy</a>
                  </li>
                </ul>
              </div>
            </div>
            <hr />
          </div>
  
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-sm-6 col-xs-12">
                <p className="copyright-text">
                  Copyright &copy; {new Date().getFullYear()} All Rights Reserved
                  by
                  <a href="#"> SI-RAJU</a>.
                </p>
              </div>
  
              <div className="col-md-4 col-sm-6 col-xs-12 ">
                <ul className="social-icons">
                  <li>
                    <a className="facebook" href="https://www.facebook.com/pahlawan.senja.146" target="_blank" rel="noopener noreferrer">
                      <FacebookIcon />
                    </a>
                  </li>
                  <li>
                    <a className="youtube" href="https://www.youtube.com/@channelbelajar25" target="_blank" rel="noopener noreferrer">
                      <YoutubeIcon />
                    </a>
                  </li>
                  <li>
                    <a className="instagram" href="https://www.instagram.com/syahrilmaimubdymandai" target="_blank" rel="noopener noreferrer">
                      <InstagramIcon />
                    </a>
                  </li>
                  <li>
                    <a className="github" href="https://github.com/SyamayDev" target="_blank" rel="noopener noreferrer">
                      <GithubIcon />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
  
        {showAboutModal && (
          <div className={`modal-overlay ${isAboutClosing ? 'closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) handleCloseAbout(); }}>
            <div className="modal-content">
              <button className="modal-close-btn" onClick={handleCloseAbout}>X</button>
              <h3>About SI-RAJU</h3>
              <p>
                SI-RAJU adalah sistem rekomendasi jurusan yang inovatif, dirancang
                untuk membantu siswa dan calon mahasiswa menemukan jalur pendidikan
                yang paling sesuai dengan minat, bakat, dan potensi mereka. Dengan
                menggunakan pendekatan interaktif dan analisis data yang cerdas,
                SI-RAJU menyajikan rekomendasi jurusan yang personal dan
                komprehensif. Misi kami adalah memudahkan proses pengambilan
                keputusan pendidikan, mengurangi kebingungan, dan membuka peluang
                masa depan yang lebih cerah bagi setiap individu.
              </p>
              <p>
                Kami percaya bahwa setiap orang memiliki potensi unik. SI-RAJU
                hadir untuk menggali potensi tersebut dan membimbing Anda menuju
                pilihan jurusan yang tidak hanya relevan dengan kualifikasi Anda
                saat ini, tetapi juga selaras dengan aspirasi karir dan tujuan
                hidup Anda.
              </p>
            </div>
          </div>
        )}
  
        {showPrivacyModal && (
          <div className={`modal-overlay ${isPrivacyClosing ? 'closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) handleClosePrivacy(); }}>
            <div className="modal-content">
              <button className="modal-close-btn" onClick={handleClosePrivacy}>X</button>
              <h3>Privacy Policy</h3>
              <p>
                Kebijakan Privasi ini menjelaskan bagaimana SI-RAJU mengumpulkan,
                menggunakan, dan melindungi informasi pribadi Anda. Kami berkomitmen
                untuk menjaga privasi Anda dan menjamin keamanan data yang Anda
                berikan kepada kami.
              </p>
              <h4>Informasi yang Kami Kumpulkan</h4>
              <p>
                Kami mengumpulkan informasi yang Anda berikan secara langsung saat
                menggunakan layanan kami, seperti nama, email (jika ada), dan jawaban
                atas kuesioner minat. Kami juga dapat mengumpulkan data teknis
                otomatis seperti alamat IP, jenis browser, dan waktu akses untuk
                meningkatkan pengalaman pengguna.
              </p>
              <h4>Bagaimana Kami Menggunakan Informasi Anda</h4>
              <p>
                Informasi yang kami kumpulkan digunakan untuk:
                <ul>
                  <li>Menyediakan rekomendasi jurusan yang personal dan akurat.</li>
                  <li>Meningkatkan kualitas dan fungsionalitas layanan kami.</li>
                  <li>Menganalisis tren penggunaan untuk pengembangan fitur baru.</li>
                </ul>
                Kami tidak akan menjual, menyewakan, atau membagikan informasi
                pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali
                jika diwajibkan oleh hukum.
              </p>
              <h4>Keamanan Data</h4>
              <p>
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang
                wajar untuk melindungi informasi pribadi Anda dari akses tidak
                sah, pengungkapan, perubahan, atau penghancuran. Meskipun kami
                berusaha keras, tidak ada metode transmisi internet atau
                penyimpanan elektronik yang 100% aman.
              </p>
              <h4>Perubahan pada Kebijakan Privasi</h4>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
                Setiap perubahan akan dipublikasikan di halaman ini. Kami
                menganjurkan Anda untuk meninjau kebijakan ini secara berkala.
              </p>
              <h4>Hubungi Kami</h4>
              <p>
                Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini,
                silakan hubungi kami melalui opsi Contact Us yang tersedia.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }
