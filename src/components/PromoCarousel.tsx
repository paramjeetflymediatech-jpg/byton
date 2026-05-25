'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  '/oil1.png',
  '/2.png'
];

export default function PromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: 0, width: '100%', backgroundColor: '#000' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Placeholder to dynamically set the container height to the image's natural aspect ratio */}
        <img src={slides[0]} alt="placeholder" style={{ width: '100%', height: 'auto', display: 'block', visibility: 'hidden' }} />
        
        {slides.map((src, index) => (
          <img 
            key={index}
            src={src}
            alt={`Promotional Slide ${index + 1}`}
            style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: index === currentSlide ? 1 : 0,
              objectFit: 'contain',
              display: 'block'
            }}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={prevSlide}
        style={{
          position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s ease', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={nextSlide}
        style={{
          position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s ease', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: index === currentSlide ? '32px' : '10px',
              height: '10px',
              borderRadius: '5px',
              background: index === currentSlide ? '#5EB446' : 'rgba(255,255,255,0.7)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </section>
  );
}
