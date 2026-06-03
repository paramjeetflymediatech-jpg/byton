'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: '/carsoul/1.jpeg',
    title: 'Cultivating the Future of Growing',
    desc: "Explore Coventry's premier superstore for high-performance garden furniture, LED grow lights, complete tents, nutrients, and hydroponics setups.",
    buttons: true
  },
  {
    image: '/carsoul/2.png',
    title: 'Premium LED Grow Lights',
    desc: 'Maximize your yields with industry-leading LED technology. Energy-efficient, full-spectrum lighting for all stages of growth.',
    buttons: true
  },
  {
    image: '/carsoul/3.jpg',
    title: 'Expert Hydroponic Systems',
    desc: 'From simple DWC setups to advanced commercial irrigation. We have the gear to take your garden to the next level.',
    buttons: true
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
      {slides.map((slide, index) => (
        <div 
          key={index} 
          style={{ 
            position: index === currentSlide ? 'relative' : 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: index === currentSlide ? 1 : 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#090a0c', // Dark background to match the header/theme
            display: 'flex',
            alignItems: 'center',
            minHeight: '260px'
          }}
        >
          {/* Text and buttons removed as requested */}
        </div>
      ))}

      {/* Navigation Controls */}
      <button 
        onClick={prevSlide}
        style={{
          position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none',
          borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s ease', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
      >
        <ChevronLeft size={20} />
      </button>

      <button 
        onClick={nextSlide}
        style={{
          position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none',
          borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s ease', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              width: index === currentSlide ? '32px' : '10px',
              height: '10px',
              borderRadius: '5px',
              background: index === currentSlide ? '#5EB446' : 'rgba(255,255,255,0.5)',
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
