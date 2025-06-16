import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './GlobeAnimation.css';

const GlobeAnimation = () => {
  const { theme } = useSelector((state) => state.theme);
  const [glowStyle, setGlowStyle] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      const glowColor = theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
      const bgColor = theme === 'dark' ? '#000000' : '#f9fafb'; // Corresponds to bg-black and bg-gray-50
      setGlowStyle({
        background: `radial-gradient(circle at ${x}px ${y}px, ${glowColor} 0%, transparent 40%)`,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme]);

  return (
    <div className="globe-animation-container" data-theme={theme}>
      <div className="mouse-glow" style={glowStyle}></div>
      <div className="animation-wrapper">
        <div className="globe-container">
          {/* Vertical Wires */}
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          {/* Horizontal Wires */}
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          <div className="globe-wire"></div>
          {/* Sparkles inside the globe */}
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
        </div>
        <div className="orbit-ring">
          <div className="orbit-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default GlobeAnimation; 