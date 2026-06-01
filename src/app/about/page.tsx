import React from 'react';
import type { Metadata } from 'next';
import { Leaf, Award, Users, Star, Clock, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - Bayton Horticulture Centre',
  description: 'Welcome to Bayton Horticulture Centre, your premier destination for top-quality horticultural products and expert gardening solutions in Coventry.',
};

export default function AboutUsPage() {
  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', paddingBottom: '60px' }}>
      <div 
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(22, 48, 21, 0.9) 0%, rgba(8, 20, 7, 0.9) 100%), url('https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/06/WhatsApp-Image-2023-04-04-at-12.46.12-e1683118993159.jpeg')`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          color: 'white',
          padding: '80px 0',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '6px solid var(--primary)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <span 
            style={{ 
              backgroundColor: 'var(--primary-glow)', 
              color: 'var(--primary)', 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '13px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              border: '1px solid var(--primary)',
              display: 'inline-block',
              marginBottom: '16px'
            }}
          >
            Established 2012
          </span>
          <h1 
            style={{ 
              fontSize: 'clamp(32px, 5vw, 48px)', 
              fontWeight: 700, 
              lineHeight: 1.2, 
              marginBottom: '20px',
              fontFamily: "'Outfit', sans-serif" 
            }}
          >
            About Bayton Horticulture Centre
          </h1>
          <p 
            style={{ 
              fontSize: '18px', 
              color: '#a3c29e', 
              lineHeight: 1.6,
              maxWidth: '650px',
              margin: '0 auto'
            }}
          >
            Your trusted partner in cultivating success, providing premium nutrients, cutting-edge equipment, and expert advice.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '50px', maxWidth: '1000px' }}>
        {/* Intro Section */}
        <div 
          style={{ 
            backgroundColor: 'var(--card-bg)', 
            padding: '40px', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '40px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', lineHeight: 1.8 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--dark)', fontFamily: "'Outfit', sans-serif" }}>
              Welcome to Bayton Horticulture Centre
            </h2>
            <p>
              Welcome to Bayton Horticulture Centre, your premier destination for top-quality horticultural products and expert gardening solutions. Established with a passion for nurturing green spaces and supporting the success of both amateur and professional growers, we are committed to providing the highest standards in horticultural supplies and services.
            </p>
            <p>
              At Bayton Horticulture Centre, we understand that successful gardening and cultivation require more than just the right products; they require knowledge, experience, and dedication. Our team of horticultural experts is here to offer personalized advice and innovative solutions to help you achieve your gardening goals. Whether you’re looking for premium nutrients, cutting-edge growing equipment, or expert guidance, we’ve got you covered.
            </p>
            <p>
              We pride ourselves on offering a comprehensive range of products, including advanced fertilizers, cutting-edge hydroponic systems, high-quality growing mediums, and stylish garden lights. Our commitment to excellence ensures that every product we offer meets rigorous quality standards and provides exceptional value.
            </p>
            <p>
              Our dedication to customer satisfaction goes beyond just providing great products. We believe in building lasting relationships with our clients by offering exceptional service and support. Whether you’re a home gardener looking to beautify your garden or a commercial grower seeking to maximize yields, our knowledgeable team is here to assist you every step of the way.
            </p>
            <p>
              At Bayton Horticulture Centre, we are passionate about helping you cultivate success and enjoy the rewards of beautiful, thriving plants. Explore our extensive range of products and let us be your trusted partner in achieving your horticultural dreams.
            </p>
            <p style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '10px' }}>
              Thank you for choosing Bayton Horticulture Centre. We look forward to growing with you!
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px',
            marginBottom: '60px'
          }}
        >
          {/* Column 1 */}
          <div 
            style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', height: '50px', width: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Users size={20} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Horticultural Experts</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Receive personalized advice and innovative solutions tailored to your unique growing environment from our veteran team.
            </p>
          </div>

          {/* Column 2 */}
          <div 
            style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', height: '50px', width: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Award size={20} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Comprehensive Catalog</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Explore advanced fertilizers, premium soils, high-tech LED lighting systems, and everything in between.
            </p>
          </div>

          {/* Column 3 */}
          <div 
            style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', height: '50px', width: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={20} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>Lasting Relationships</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              We build long-term trust by delivering exceptional service and support to home and commercial growers alike.
            </p>
          </div>
        </div>

        {/* Visit Superstore CTA banner */}
        <div 
          style={{ 
            background: 'linear-gradient(90deg, var(--primary) 0%, #4ea236 100%)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '50px 40px',
            color: 'white',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ flex: '1 1 500px' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
              Visit Our Coventry Store
            </h3>
            <p style={{ opacity: 0.9, lineHeight: 1.6, fontSize: '15px' }}>
              Pop down to Unit 31 Brindley Road, Exhall, Coventry to check out our products and discuss your setup in person.
            </p>
          </div>
          <div>
            <Link 
              href="/contact-us" 
              className="btn btn-secondary" 
              style={{ 
                backgroundColor: 'white', 
                color: 'var(--primary)', 
                border: 'none',
                boxShadow: 'var(--shadow-md)',
                padding: '14px 28px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Get Directions <MapPin size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
