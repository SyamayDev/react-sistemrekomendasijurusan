import React from 'react';
import './ResultImage.css';
import logo from '../assets/logo.webp';
import PercentageBar from './PercentageBar';

export default function ResultImage({ rankedMajors, onReady }) {
  if (!rankedMajors || rankedMajors.length === 0) {
    return null;
  }
  
  const top3 = rankedMajors.slice(0, 3);

  // Simple mapping from major name to an icon (emoji)
  const getMajorIcon = (majorName) => {
    if (majorName.toLowerCase().includes('informatika') || majorName.toLowerCase().includes('komputer')) return '💻';
    if (majorName.toLowerCase().includes('bisnis') || majorName.toLowerCase().includes('manajemen')) return '📈';
    if (majorName.toLowerCase().includes('desain')) return '🎨';
    if (majorName.toLowerCase().includes('hukum')) return '⚖️';
    if (majorName.toLowerCase().includes('kedokteran') || majorName.toLowerCase().includes('kesehatan')) return '🩺';
    if (majorName.toLowerCase().includes('psikologi')) return '🧠';
    if (majorName.toLowerCase().includes('sastra') || majorName.toLowerCase().includes('bahasa')) return '📚';
    if (majorName.toLowerCase().includes('teknik')) return '⚙️';
    return '🎓';
  };

  return (
    <div className="result-image-wrapper">
      <div className="ri-header">
        <img src={logo} alt="Logo" className="ri-logo" />
        <h1 className="ri-title">Peta Masa Depanmu!</h1>
        <p className="ri-subtitle">Berikut adalah 3 jurusan teratas yang paling cocok berdasarkan analisismu:</p>
      </div>
      <div className="ri-body">
        {top3.map((major, index) => (
          <div key={major.id} className={`ri-major-card rank-${index + 1}`}>
            <div className="ri-major-name-container">
              <span className="ri-major-icon">{getMajorIcon(major.nama_jurusan)}</span>
              <h3 className="ri-major-name">{major.nama_jurusan}</h3>
            </div>
            <div className="ri-score">
              <span className="ri-score-label">Tingkat Kecocokan</span>
              <PercentageBar percent={major.score} isImageVersion={true} />
            </div>
          </div>
        ))}
      </div>
      <div className="ri-footer">
        <p>Lihat analisis lengkap dan ikuti tes di <strong>sistemrekomendasijurusan.vercel.app</strong></p>
      </div>
    </div>
  );
}
