'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Check if current route is for admin, login, or register
  const isAuthOrAdmin = pathname?.startsWith('/login') || pathname?.startsWith('/admin') || pathname?.startsWith('/register');

  return (
    <>
      {<Header />}
      {<CartDrawer />}
      <main style={{ minHeight: isAuthOrAdmin ? '100vh' : '60vh', paddingBottom: isAuthOrAdmin ? '0' : '60px' }}>
        {children}
      </main>
      {<Footer />}
    </>
  );
}
