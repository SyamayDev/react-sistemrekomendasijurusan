import React from 'react';
import './Features.css';

const FeatureCard = ({ number, title, description, imageUrl }) => {
  return (
    <div
      className="col-xs-12 col-sm-6 col-md-4 listar-feature-item-wrapper listar-feature-with-image listar-height-changed"
      data-aos="fade-zoom-in"
      data-aos-group="features"
      data-line-height="25.2px"
    >
      <div className="listar-feature-item listar-feature-has-link">
        <div className="listar-feature-item-inner">
          <div className="listar-feature-right-border"></div>
          <div className="listar-feature-block-content-wrapper">
            <div className="listar-feature-icon-wrapper">
              <div className="listar-feature-icon-inner">
                <div>
                  <img
                    alt={title}
                    className="listar-image-icon"
                    src={imageUrl}
                  />
                </div>
              </div>
            </div>

            <div className="listar-feature-content-wrapper" style={{ paddingTop: '0px' }}>
              <div className="listar-feature-item-title listar-feature-counter-added">
                <span>
                  <span>{number}</span> {title}
                </span>
              </div>
              <div className="listar-feature-item-excerpt">
                {description}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="listar-feature-fix-bottom-padding listar-fix-feature-arrow-button-height"></div>
    </div>
  );
};

const Features = () => {
  const featuresData = [
    {
      number: '01',
      title: 'Jawab Pertanyaan',
      description: 'Jawab beberapa pertanyaan singkat untuk mengetahui minat dan potensi akademik Anda.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/128/921/921591.png',
    },
    {
      number: '02',
      title: 'Proses Analisis',
      description: 'Sistem menganalisis jawaban Anda secara objektif menggunakan pendekatan berbasis data.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3414/3414151.png',
    },
    {
      number: '03',
      title: 'Ringkasan Hasil',
      description: 'Dapatkan rekomendasi jurusan yang cocok untuk Anda, dengan persentase kemungkinan tinggi.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3412/3412953.png',
    },
  ];

  return (
    <div className="pset">
      <div className="container">
        {/* Penambahan Judul Cara Kerja */}
        <div className="row">
          <div className="col-12 text-center mb-5">
            <h2 className="cara-kerja-title">Cara Kerja Si-Raju</h2>
            <div className="cara-kerja-separator"></div>
          </div>
        </div>

        <div className="row listar-feature-items">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;