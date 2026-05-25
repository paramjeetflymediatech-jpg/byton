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
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            minHeight: '500px'
          }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <div style={{ maxWidth: '600px', transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentSlide ? 1 : 0, transition: 'all 0.8s ease 0.3s' }}>
              <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
                {slide.title}
              </h1>
              <p style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.6 }}>
                {slide.desc}
              </p>
              {slide.buttons && (
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Link href="/shop/all" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#5EB446', color: 'white', textDecoration: 'none' }}>
                    Shop Catalog <ArrowRight size={18} />
                  </Link>
                  <Link href="/shop/garden-furniture" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', textDecoration: 'none' }}>
                    Garden Furniture
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <button 
        onClick={prevSlide}
        style={{
          position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none',
          borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s ease', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
      >
        <ChevronLeft size={28} />
      </button>

      <button 
        onClick={nextSlide}
        style={{
          position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
          zIndex: 10, background: 'rgba(0,0,0,0.3)', color: 'white', border: 'none',
          borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.3s ease', backdropFilter: 'blur(4px)'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
      >
        <ChevronRight size={28} />
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
