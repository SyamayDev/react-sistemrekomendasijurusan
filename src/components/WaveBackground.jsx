import React from 'react';

export default function WaveBackground() {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "25vh", /* Adjusted height to be at the bottom */
        zIndex: -1 /* Ensure it's behind all other content */
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
