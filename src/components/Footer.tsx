import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div>
            <div className="logo" style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <img src="/footerlogo.png" alt="Bayton Horticulture Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p style={{ lineHeight: 1.7, marginBottom: '20px' }}>
           We pride ourselves on offering a comprehensive range of products, including quality plant nutrients, cutting-edge hydroponic systems, high-quality growing mediums, and reliable indoor lighting. </p>

            {/* Social Media Links */}
            <div className="footer-social">
              <a href="https://www.facebook.com/people/Bayton-Horticulture-Centre/61563132004156/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/baytonhorticulture/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@baytonhorticulture" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="footer-social-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/channel/UCTeXnVQ3EiTSFVWlgocyZCw" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-social-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0f172a"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Categories Links Column */}
          <div>
            <h3 className="footer-title">Departments</h3>
            <ul className="footer-links">
              <li><Link href="/shop/garden-furniture">Garden Furniture</Link></li>
              <li><Link href="/shop/led-lighting">LED Grow Lights</Link></li>
              <li><Link href="/shop/grow-systems-pots">Grow Systems & Pots</Link></li>
              <li><Link href="/shop/soil">Soils & Growing Media</Link></li>
              <li><Link href="/shop/lawnmowers">Lawnmowers & Power Tools</Link></li>
            </ul>
          </div>

          {/* Useful Links Column */}
          <div>
            <h3 className="footer-title">Company Info</h3>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/brands">Brands</Link></li>
              <li><Link href="/shipping">Shipping Information</Link></li>
              <li><Link href="/returns-refund-policy">Returns & Refund Policy</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions">Terms & Conditions</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="footer-title">Visit Our Superstore</h3>
            <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>Bayton Horticulture Centre, Coventry, West Midlands, CV1 1AA</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>024 7600 0000</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>sales@baytonhorticulture.co.uk</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Clock size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: '13px' }}>Opening Hours:</div>
                  <div style={{ fontSize: '12px', marginTop: '2px', color: '#94a3b8' }}>
                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                    Sat: 9:00 AM - 5:00 PM<br />
                    Sun: 10:00 AM - 4:00 PM
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Bayton Horticulture Centre. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Verified APC Overnight Courier Partner</span>
            <span>Google Shopping Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
