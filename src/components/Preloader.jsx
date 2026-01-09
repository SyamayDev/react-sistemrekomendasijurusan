import React, { useEffect, useRef, useState } from "react";
import './Preloader.css';

// Helper class for random numbers, as provided by the user
class Utils {
  static random(min = 0, max = 1) {
    const value = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    return min + (value * (max - min));
  }
}

export default function PulsatingStatPreloader() {
  const doneRef = useRef(0);
  const [isDone, setIsDone] = useState(false);
  // set up the whole graphic
  const size = 360;
  const sizePx = `${size}px`;
  const sizeHalf = size / 2;
  const centered = `translate(${sizeHalf}, ${sizeHalf})`;
  const viewBox = `0 0 ${size} ${size}`;
  const bars = [
    { order: 1 },
    { x: 15 },
    { order: 2, x: 30 }
  ];
  const decimals = 2;
  // configure the worm
  const wormRadius = 95;
  const wormDist = 2 * Math.PI * wormRadius;
  const wormStroke = (wormDist * 0.1).toFixed(decimals);
  const wormDash = (wormDist * 0.9).toFixed(decimals);
  const wormStrokeDash = `${wormStroke} ${wormDash}`;
  // populate the fireworks
  const fireworks = [];
  const fireworksCount = 60;
  const fireworksLineWidth = 3;
  const fireworksLineRadius = fireworksLineWidth / 2;

  for (let i = 0; i < fireworksCount; ++i) {
    fireworks.push({
      delay: +Utils.random(0.6, 0.9).toFixed(decimals),
      distance: Math.round(Utils.random(130, 180))
    });
  }

  useEffect(() => {
    // simulate loading with a timeout
    doneRef.current = setTimeout(() => {
      setIsDone(true);
    }, 4000); // Changed from 7000 to 4000 for a quicker demo load

    return () => {
      clearTimeout(doneRef.current);
    };
  }, []);

  return (
    <svg
      className="pl"
      viewBox={viewBox}
      width={sizePx}
      height={sizePx}
      aria-label="Circle containing a bar graph of 3 bars shifting up and down in height. The circle is surrounded by a ring with a worm traveling around it. The ring is then surrounded by a wobbly ring spinning clockwise. All shapes are pulsating while delayed from one another."
    >
      <defs>
        <linearGradient id="pl-circle-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary5)" />
          <stop offset="100%" stopColor="var(--secondary6)" />
        </linearGradient>
        <linearGradient id="pl-fireworks-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--secondary5-00)" />
          <stop offset="100%" stopColor="var(--tertiary6)" />
        </linearGradient>
        <clipPath id="pl-fireworks-path">
          <rect
            x={-fireworksLineRadius}
            width={fireworksLineWidth}
            height={sizeHalf}
          />
        </clipPath>
        {bars.map((bar, i) => {
          const pathKey = `pl-path${i}`;

          return (
            <clipPath key={pathKey} id={pathKey}>
              <rect rx="2" ry="2" width="10" height="40" x={bar.x} />
            </clipPath>
          );
        })}
      </defs>
      <g fill="none" transform={centered}>
        <g
          stroke="url(#pl-fireworks-gradient)"
          strokeLinecap="round"
          strokeWidth={fireworksLineWidth}
        >
          {/* fireworks */}
          {fireworks.map(((item, i) => {
            const { delay, distance } = item;
            const lineKey = `pl-line${i}`;
            const angle = Math.round(i / fireworks.length * 360);
            const transformG = `rotate(${angle})`;
            const translateY = -(distance + fireworksLineRadius);
            const lineStart = `translate(0, ${translateY}px)`;
            const lineStyle = {
              transform: isDone ? undefined : lineStart,
              transformOrigin: `0 ${distance}px`,
              transitionDelay: `${delay}s`,
              visibility: isDone ? "visible" : undefined
            };

            return (
              <g
                key={lineKey}
                clipPath="url(#pl-fireworks-path)"
                transform={transformG}
              >
                <line
                  className="pl__ray"
                  x2="0.01"
                  y2={distance}
                  style={lineStyle}
                />
              </g>
            );
          }))}
        </g>
        <g className={`pl__circle-group ${isDone && "pl__circle-group--shrink"}`}>
          {/* circle containing bar graph */}
          <g className="pl__circle">
            <circle fill="url(#pl-circle-gradient)" r="60" />
            <g fill="var(--white)" transform="translate(-20, -20)">
              {bars.map((bar, i) => {
                const rectKey = `pl-rect${i}`;
                const pathUrl = `url(#pl-path${i})`;
                const barOrderClass = `pl__bar--${bar.order}`;

                return (
                  <g key={rectKey} clipPath={pathUrl}>
                    <rect
                      className={`pl__bar ${bar.order ? barOrderClass : ''}`}
                      rx="2"
                      ry="2"
                      width="10"
                      height="40"
                      x={bar.x}
                    />
                  </g>
                );
              })};
            </g>
          </g>
          {/* rings */}
          <g
            stroke="var(--primary5)"
            strokeLinecap="round"
            transform="rotate(-90)"
          >
            <g className="pl__circle pl__circle--1" strokeWidth="6">
              <circle r={wormRadius} opacity="0.2"/>
              <circle
                className="pl__worm"
                r={wormRadius}
                strokeDasharray={wormStrokeDash}
              />
            </g>
            <g className="pl__circle pl__circle--2">
              {/* should follow a radius of 120 */}
              <path
                className="pl__blob"
                strokeWidth="2"
                opacity="0.1"
                d="M 67.818 -102.378 C 49.419 -114.061 34.369 -113.044 7.611 -116.019 C -16.625 -118.714 -35.382 -122.556 -57.692 -109.745 C -82.283 -95.624 -88.044 -78.405 -98.002 -60.602 C -111.49 -36.489 -128.869 -27.026 -122.3 21.827 C -118.118 52.932 -98.24 64.013 -85.203 78.8 C -69.528 96.58 -69.921 104.909 -47.292 113.903 C -25.72 122.477 -4.36 120.302 15.887 115.32 C 35.413 110.515 48.593 115.71 73.077 98.707 C 93.971 84.197 95.914 68.716 104.029 51.992 C 111.728 36.126 123.201 25.155 123.28 -3.384 C 123.363 -33.074 112.747 -38.269 100.152 -57.82 C 88.934 -75.232 89.675 -88.498 67.818 -102.378 Z"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}