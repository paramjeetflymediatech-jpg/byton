import React from 'react';
import { Brand } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export default async function BrandsCarousel() {
  let brands: { name: string; logo: string }[] = [];
  
  try {
    // Fetch from brands table via database model
    const dbBrands = await Brand.findAll();
    if (dbBrands && dbBrands.length > 0) {
      brands = dbBrands.map((b) => ({
        name: b.name,
        logo: b.logoUrl
      }));
    }
  } catch (err) {
    console.error('Failed to fetch brands from database:', err);
  }

  // Fallback if the database has no brands yet
  if (brands.length === 0) {
    brands = [
      { name: 'Brand Logo 1', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo01.avif' },
      { name: 'Brand Logo 2', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo02.avif' },
      { name: 'Brand Logo 3', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo03.avif' },
      { name: 'Brand Logo 4', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo04.avif' },
      { name: 'Brand Logo 5', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo05.avif' },
      { name: 'Brand Logo 6', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo06.avif' },
      { name: 'Brand Logo 7', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/LOGO07.avif' },
      { name: 'Brand Logo 8', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo08.avif' },
      { name: 'Brand Logo 9', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo09.avif' },
      { name: 'Brand Logo 10', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo10.avif' },
      { name: 'Brand Logo 11', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo11.avif' },
      { name: 'Brand Logo 12', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo12.avif' },
      { name: 'Brand Logo 13', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo13.avif' },
      { name: 'Brand Logo 15', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo15.avif' },
      { name: 'Brand Logo 15-1', logo: 'https://baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo15-1.jpg' },
      { name: 'Brand Logo 16', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo16.avif' },
      { name: 'Brand Logo 17', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo17.avif' },
      { name: 'Brand Logo 18', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo18.avif' },
      { name: 'Brand Logo 19', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo19.avif' },
      { name: 'Brand Logo 20', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo20.avif' },
      { name: 'Brand Logo 21', logo: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo21.avif' },
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
            opacity: 0.7;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .brand-logo:hover {
            opacity: 1;
            transform: scale(1.05);
          }
        `}} />

        {/* Duplicate the array to make the infinite loop seamless */}
        <div className="marquee-track">
          {[...brands, ...brands].map((brand, i) => (
            <img key={i} src={brand.logo} alt={brand.name} className="brand-logo" />
          ))}
        </div>
      </div>
    </section>
  );
}

