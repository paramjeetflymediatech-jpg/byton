'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Brand {
  name: string;
  url: string;
}

interface BrandsGridProps {
  brands: Brand[];
}

export default function BrandsGrid({ brands }: BrandsGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev === 0 ? brands.length - 1 : prev - 1) : null));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev === brands.length - 1 ? 0 : prev + 1) : null));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft' && selectedIndex !== null) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && selectedIndex !== null) {
        handleNext();
      }
    };
    if (selectedIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  return (
    <>
      {/* Styles for premium effects and lightbox */}
      <style dangerouslySetInnerHTML={{ __html: `
        .brands-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-top: 40px;
        }
        .brand-card {
          background-color: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 180px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          cursor: pointer;
        }
        .brand-card:hover {
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
          transform: translateY(-4px);
        }
        .brand-img {
          max-height: 140px;
          max-width: 100%;
          height: auto;
          width: auto;
          object-fit: contain;
          opacity: 0.95;
          transition: var(--transition);
        }
        .brand-card:hover .brand-img {
          opacity: 1;
          transform: scale(1.05);
        }

        /* Lightbox Styling */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999 !important;
          animation: fadeIn 0.25s ease-out;
        }
        .lightbox-close {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(9, 10, 12, 0.05);
          border: 1px solid rgba(9, 10, 12, 0.1);
          color: var(--dark);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          z-index: 1010;
        }
        .lightbox-close:hover {
          background-color: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: scale(1.1);
        }
        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(9, 10, 12, 0.05);
          border: 1px solid rgba(9, 10, 12, 0.1);
          color: var(--dark);
          border-radius: 50%;
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          z-index: 1010;
        }
        .lightbox-nav-btn:hover {
          background-color: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: translateY(-50%) scale(1.1);
        }
        .prev-btn {
          left: 40px;
        }
        .next-btn {
          right: 40px;
        }
        .lightbox-img {
          width: 100%;
          height: 100%;
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 1024px) {
          .brands-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .brand-card {
            height: 160px;
          }
          .brand-img {
            max-height: 120px;
          }
          .prev-btn {
            left: 20px;
          }
          .next-btn {
            right: 20px;
          }
        }

        @media (max-width: 768px) {
          .brands-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .brand-card {
            height: 140px;
            padding: 16px;
          }
          .brand-img {
            max-height: 100px;
          }
          .lightbox-nav-btn {
            width: 44px;
            height: 44px;
          }
          .prev-btn {
            left: 10px;
          }
          .next-btn {
            right: 10px;
          }
        }

        @media (max-width: 480px) {
          .brands-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .brand-card {
            height: 110px;
            padding: 12px;
          }
          .brand-img {
            max-height: 50px;
          }
        }
      ` }} />

      {/* Brands Grid */}
      <div className="brands-grid">
        {brands.map((brand, index) => (
          <div key={index} className="brand-card" onClick={() => setSelectedIndex(index)}>
            <img 
              src={brand.url} 
              alt={brand.name} 
              className="brand-img"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Viewer Modal rendered as Portal */}
      {selectedIndex !== null && mounted && createPortal(
        <div 
          className="lightbox-overlay" 
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close Button */}
          <button 
            className="lightbox-close" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
            aria-label="Close image viewer"
          >
            <X size={28} />
          </button>

          {/* Prev Button */}
          <button 
            className="lightbox-nav-btn prev-btn" 
            onClick={handlePrev}
            aria-label="Previous brand logo"
          >
            <ChevronLeft size={28} />
          </button>
          
          {/* Image */}
          <img 
            src={brands[selectedIndex].url} 
            alt={brands[selectedIndex].name} 
            className="lightbox-img" 
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
          <button 
            className="lightbox-nav-btn next-btn" 
            onClick={handleNext}
            aria-label="Next brand logo"
          >
            <ChevronRight size={28} />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
