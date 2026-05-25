import React from 'react';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function BrandsCarousel() {
  let brands: { name: string; logo: string }[] = [];
  
  try {
    // Attempt to fetch from a 'brands' table in Supabase
    const { data, error } = await supabase.from('brands').select('*');
    if (data && !error && data.length > 0) {
      brands = data.map((b: any) => ({
        name: b.name || 'Brand',
        logo: b.image || b.logo_url || b.logo || '/globe.svg'
      }));
    }
  } catch (err) {
    console.error('Failed to fetch brands from database:', err);
  }

  // Fallback if the database has no brands yet
  if (brands.length === 0) {
    brands = [
      { name: 'Vercel', logo: '/vercel.svg' },
      { name: 'NextJS', logo: '/next.svg' },
      { name: 'Global', logo: '/globe.svg' },
      { name: 'Windows', logo: '/window.svg' },
      { name: 'Files', logo: '/file.svg' },
    ];
  }

  return (
    <section style={{ padding: '40px 0', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#000', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Our Trusted Brands
        </h3>
      </div>
      
      {/* Marquee container */}
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            align-items: center;
            width: fit-content;
            animation: marquee 25s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          .brand-logo {
            height: 48px;
            width: auto;
            margin: 0 50px;
            filter: grayscale(100%) opacity(50%);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .brand-logo:hover {
            filter: grayscale(0%) opacity(100%);
            transform: scale(1.05);
          }
        `}} />

        {/* Duplicate the array a few times to make the infinite loop seamless regardless of screen size */}
        <div className="marquee-track">
          {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
            <img key={i} src={brand.logo} alt={brand.name} className="brand-logo" />
          ))}
        </div>
      </div>
    </section>
  );
}
