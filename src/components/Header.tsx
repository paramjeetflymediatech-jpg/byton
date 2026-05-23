'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../lib/context/CartContext';
import { ShoppingBag, Search, Menu, X, Leaf, User, LogIn } from 'lucide-react';
import { isAuthenticated } from '../lib/auth/client';

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop/all?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="header">
      <div className="top-bar">
        <div className="container">
          FREE UK Delivery on Orders over £50! Fast Dispatch with APC Overnight Shipping.
        </div>
      </div>

      <div className="container">
        <nav className="navbar">
          {/* Top Row: Logo, Search Bar, Action Icons */}
          <div className="nav-top">
            {/* Logo */}
            <Link href="/" className="logo">
              <Leaf fill="var(--primary)" size={26} />
              Bayton <span>Horticulture</span>
            </Link>

            {/* Centered Search Bar */}
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control search-input"
              />
              <button type="submit" className="icon-btn search-btn">
                <Search size={18} />
              </button>
            </form>

            {/* Actions (User Profile, Shopping Cart, Mobile Menu button) */}
            <div className="nav-actions">
              {/* User button with auth check */}
              <button
                onClick={() => {
                  if (isAuthenticated()) {
                    router.push('/admin');
                  } else {
                    router.push('/login');
                  }
                }}
                className="icon-btn"
                title={isAuthenticated() ? 'Dashboard' : 'Login'}
                type="button"
              >
                {isAuthenticated() ? <User size={22} /> : <LogIn size={22} />}
              </button>

              {/* Shopping Cart button */}
              <button onClick={() => setIsCartOpen(true)} className="icon-btn" title="Shopping Cart">
                <ShoppingBag size={22} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </button>

              {/* Mobile Menu toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="icon-btn mobile-menu-btn">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Bottom Row: Navigation Links */}
          <div className={`nav-bottom ${mobileMenuOpen ? 'mobile-active' : ''}`}>
            {/* Mobile Search: visible only in the mobile dropdown */}
            <div className="mobile-search-wrapper">
              <form onSubmit={handleSearch} className="search-form-mobile">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                />
                <button type="submit" className="icon-btn search-mobile-btn">
                  <Search size={18} />
                </button>
              </form>
            </div>

            <ul className="nav-links">
              <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
              <li><Link href="/shop/garden-furniture" onClick={() => setMobileMenuOpen(false)}>Garden Furniture</Link></li>
              <li><Link href="/shop/led-lighting" onClick={() => setMobileMenuOpen(false)}>LED Lighting</Link></li>
              <li><Link href="/shop/hps-lighting" onClick={() => setMobileMenuOpen(false)}>HPS Lighting</Link></li>
              <li><Link href="/shop/grow-systems-pots" onClick={() => setMobileMenuOpen(false)}>Grow Systems & Pots</Link></li>
              <li><Link href="/contact-us" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
