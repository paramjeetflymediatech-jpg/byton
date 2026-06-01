import React from 'react';
import Link from 'next/link';
import BrandsGrid from '@/components/BrandsGrid';

export const metadata = {
  title: 'Our Trusted Brands - Bayton Horticulture Centre',
  description: 'Explore the trusted premium horticulture and gardening brands stocked by Bayton Horticulture Centre in Coventry.',
};

export default function BrandsPage() {
  const brandLogos = [
    { name: 'Brand Logo 1', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo01.avif' },
    { name: 'Brand Logo 2', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo02.avif' },
    { name: 'Brand Logo 3', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo03.avif' },
    { name: 'Brand Logo 4', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo04.avif' },
    { name: 'Brand Logo 5', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo05.avif' },
    { name: 'Brand Logo 6', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo06.avif' },
    { name: 'Brand Logo 7', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/LOGO07.avif' },
    { name: 'Brand Logo 8', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo08.avif' },
    { name: 'Brand Logo 9', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo09.avif' },
    { name: 'Brand Logo 10', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo10.avif' },
    { name: 'Brand Logo 11', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo11.avif' },
    { name: 'Brand Logo 12', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo12.avif' },
    { name: 'Brand Logo 13', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo13.avif' },
    { name: 'Brand Logo 15', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo15.avif' },
    { name: 'Brand Logo 15-1', url: 'https://baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo15-1.jpg' },
    { name: 'Brand Logo 16', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo16.avif' },
    { name: 'Brand Logo 17', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo17.avif' },
    { name: 'Brand Logo 18', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo18.avif' },
    { name: 'Brand Logo 19', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo19.avif' },
    { name: 'Brand Logo 20', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo20.avif' },
    { name: 'Brand Logo 21', url: 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo21.avif' },
  ];

  return (
    <div style={{ padding: '60px 0', minHeight: '80vh' }} className="fade-in">
      <div className="container">
        {/* Breadcrumbs */}
        <div style={{ marginBottom: '30px', fontSize: '14px', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text)' }}>Brands</span>
        </div>

        {/* Header section */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '16px' }}>
            Our Trusted Brands
          </h1>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--primary)', margin: '0 auto 20px', borderRadius: '2px' }} />
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
            We only stock the highest quality products from trusted and leading manufacturers in the horticulture industry.
          </p>
        </div>

        {/* Brand Logos Interactive Grid */}
        <BrandsGrid brands={brandLogos} />
      </div>
    </div>
  );
}
