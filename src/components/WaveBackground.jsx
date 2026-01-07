import React from 'react';

export default function WaveBackground() {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        top: "65vh",
        left: 0,
        width: "100%",
        zIndex: 0
      }}
    >
      <path
        fill="#ffffff"
        fillOpacity="0.6"
        d="M0,160 C240,220 480,80 720,110 960,140 1200,200 1440,160 L1440,320 L0,320 Z"
      />
    </svg>
  );
}
