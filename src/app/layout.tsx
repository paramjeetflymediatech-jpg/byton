import React from 'react';
import './globals.css';
import { CartProvider } from '../lib/context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { Setting } from '../lib/db/models';
import Script from 'next/script';

export const metadata = {
  title: 'Shop For Garden Products Coventry, Urban Farming & Hydroponics UK - Bayton Horticulture Centre',
  description: 'Shop Bayton Horticulture for garden products, urban farming, CEA, grow lights, tents, & hydroponics gear in Coventry. Fast UK delivery or visit our superstore.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Query Pixel configurations from database
  let tiktokId = 'CTIKTOK123456';
  let pinterestId = 'PINTAG789012';

  try {
    const ttSetting = await Setting.findByPk('tiktok_pixel_id');
    const pinSetting = await Setting.findByPk('pinterest_tag_id');
    if (ttSetting) tiktokId = ttSetting.value;
    if (pinSetting) pinterestId = pinSetting.value;
  } catch (e) {
    console.warn('Could not read pixel configuration settings from database, using defaults.', e);
  }

  // Construct tag scripts
  const tikTokScript = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=d.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=d.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
      ttq.load('${tiktokId}');
      ttq.page();
    }(window, document, 'ttq');
  `;

  const pinterestScript = `
    !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://assets.pinterest.com/js/pintrk-main.js");
    pintrk('load', '${pinterestId}');
    pintrk('page');
  `;

  return (
    <html lang="en">
      <body>
        {/* Inject TikTok Conversion Tag safely */}
        <Script id="tiktok-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: tikTokScript }} />
        
        {/* Inject Pinterest Conversion Tag safely */}
        <Script id="pinterest-tag" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: pinterestScript }} />

        <CartProvider>
          <Header />
          <CartDrawer />
          <main style={{ minHeight: '60vh', paddingBottom: '60px' }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
