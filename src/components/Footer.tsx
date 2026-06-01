import React from 'react';
import Link from 'next/link';
import { Leaf, MapPin, Phone, Mail, Clock } from 'lucide-react';

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
