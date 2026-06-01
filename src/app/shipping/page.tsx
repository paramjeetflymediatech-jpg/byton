import React from 'react';
import type { Metadata } from 'next';
import { Truck, AlertTriangle, Info, ShieldCheck, Clock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy - Bayton Horticulture Centre',
  description: 'Shipping rates, dispatch details, regional surcharges, and APC Overnight courier policy for Bayton Horticulture Centre Coventry.',
};

export default function ShippingPage() {
  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', padding: '50px 0' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <article 
          style={{ 
            backgroundColor: 'white', 
            padding: '50px 40px', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)' 
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '30px' }}>
            <div 
              style={{ 
                backgroundColor: 'var(--primary-glow)', 
                color: 'var(--primary)', 
                height: '60px', 
                width: '60px', 
                borderRadius: '50%', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <Truck size={30} />
            </div>
            <h1 id="shipping-title" className="section-title" style={{ marginTop: 0, fontSize: '32px', textAlign: 'center' }}>
              Shipping Policy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>
              Last Updated: June 1, 2026
            </p>
          </div>

          {/* Intro */}
          <div style={{ lineHeight: 1.8, fontSize: '15px', color: 'var(--text)', marginBottom: '30px' }}>
            <p>
              At <strong>Bayton Horticulture Centre</strong>, we aim to deliver your grow gear, lights, nutrients, and garden furniture quickly and securely. We partner exclusively with <strong>APC Overnight</strong> to guarantee reliable dispatch across the UK.
            </p>
          </div>

          {/* Section 1: Shipping Costs */}
          <div id="section-costs" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} /> Shipping Costs
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px' }}>
              All standard orders are dispatched via APC Overnight courier service under the following rate structure:
            </p>
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ backgroundColor: 'var(--light-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>£7.95</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>Orders under £75.00</div>
              </div>
              <div style={{ backgroundColor: 'var(--primary-glow)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>FREE</div>
                <div style={{ fontSize: '13px', color: 'var(--dark)', marginTop: '4px', fontWeight: 600 }}>Orders over £75.00</div>
              </div>
            </div>
          </div>

          {/* Section 2: Heavy Item Surcharges */}
          <div id="section-heavy" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--primary)' }} /> Heavy Item Surcharges
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px' }}>
              Certain heavy or bulky items are subject to individual handling surcharges due to carrier weight limits:
            </p>
            <div style={{ backgroundColor: 'var(--light-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', lineHeight: 1.6 }}>
                <li><strong>Base Nutrients (10L A&amp;B sets)</strong>: Surcharge of <strong>£3.99</strong> per set.</li>
                <li><strong>Growing Media (Per bag of soil/media)</strong>: Surcharge of <strong>£3.00</strong> per bag.</li>
                <li><strong>Individual Items (20kg–30kg)</strong>: Surcharge of <strong>£7.99</strong> per item. Weight is displayed in the product information.</li>
                <li><strong>Pallet Rate (Over 30kg or oversized)</strong>: Flat pallet rate of approx. <strong>£50.00</strong>. Our team will contact you to coordinate delivery.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Regional Delivery Surcharges */}
          <div id="section-regional" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Info size={20} style={{ color: 'var(--primary)' }} /> Regional Delivery Surcharges
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              Deliveries destined for the <strong>Scottish Highlands &amp; Islands, Northern Ireland, Isle of Wight, Channel Islands, Scilly Isles, and Isle of Man</strong> are subject to additional carrier surcharges. These surcharges are calculated automatically during checkout based on your delivery postcode and apply regardless of order value or weight.
            </p>
          </div>

          {/* Section 4: Delays & Out of Stock */}
          <div id="section-delays" style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Clock size={20} style={{ color: 'var(--primary)' }} /> Delays &amp; Out of Stock Items
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px' }}>
              We strive to process and dispatch all in-stock orders within 24 hours. In case of issues:
            </p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', lineHeight: 1.6 }}>
              <li><strong>Notification</strong>: If any item is out of stock or delayed, we will notify you by phone or email.</li>
              <li><strong>Alternatives &amp; Refunds</strong>: You can choose to replace the item with a matching alternative, receive a partial refund, or wait for the whole order to ship together once replenished.</li>
              <li><strong>Processing Time</strong>: Most stock issues are resolved within 24 hours.</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}
