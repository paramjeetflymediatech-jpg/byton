import React from 'react';
import type { Metadata } from 'next';
import { FileText, Gavel, AlertCircle, ShoppingBag, Truck, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Bayton Horticulture Centre',
  description: 'Terms and Conditions of Service for Bayton Horticulture Centre. Read our terms regarding purchasing, payments, APC Overnight shipping, and customer eligibility.',
};

export default function TermsConditionsPage() {
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
              <FileText size={30} />
            </div>
            <h1 id="terms-title" className="section-title" style={{ marginTop: 0, fontSize: '32px', textAlign: 'center' }}>
              Terms &amp; Conditions
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>
              Last Updated: June 1, 2026
            </p>
          </div>

          {/* Intro */}
          <div style={{ lineHeight: 1.8, fontSize: '15px', color: 'var(--text)', marginBottom: '30px' }}>
            <p>
              Welcome to <strong>Bayton Horticulture Centre</strong>. These Terms &amp; Conditions govern your use of our website (<a href="https://baytonhorticulturecentre.co.uk" style={{ color: 'var(--primary)', fontWeight: 600 }}>https://baytonhorticulturecentre.co.uk</a>) and any purchases you make from our physical superstore or online catalog. By accessing or using our services, you agree to comply with and be bound by these terms.
            </p>
          </div>

          {/* Section 1 */}
          <div id="section-accounts" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Gavel size={20} style={{ color: 'var(--primary)' }} /> 1. Customer Eligibility &amp; Accounts
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              By registering an account or making purchases on this store, you certify that you are at least 18 years of age. You are responsible for keeping your account password secure. Any fraudulent, speculative, or bad-faith account creation will result in instant suspension.
            </p>
          </div>

          {/* Section 2 */}
          <div id="section-pricing" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <ShoppingBag size={20} style={{ color: 'var(--primary)' }} /> 2. Product Specifications &amp; Pricing
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              We stock advanced urban farming setups, grow lights, plant nutrients, and gardening machinery. While we endeavor to keep specifications, descriptions, and prices accurate:
            </p>
            <ul style={{ paddingLeft: '24px', lineHeight: 1.8, fontSize: '14px', color: 'var(--text)' }}>
              <li>Prices and stock status are subject to change without prior notice.</li>
              <li>In the event of a pricing or description error, we reserve the right to cancel or refuse any orders placed for that item.</li>
              <li>Images are for illustrative purposes; packaging or color styles may vary.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div id="section-shipping" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Truck size={20} style={{ color: 'var(--primary)' }} /> 3. Shipping, Rates &amp; Risk of Loss
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px' }}>
              We partner exclusively with <strong>APC Overnight</strong> for fast, reliable delivery across the UK mainland:
            </p>
            <div style={{ backgroundColor: 'var(--light-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '14px', lineHeight: 1.7 }}>
              <p><strong>Free Standard Shipping</strong> is applicable on orders exceeding £50.00 (inclusive of VAT), subject to postcode restrictions.</p>
              <p style={{ marginTop: '8px' }}><strong>Calculated Rates</strong>: For orders under £50.00, or addresses in remote postcodes (Highlands/Islands), shipping fees are calculated automatically during checkout based on the total weight of the goods.</p>
              <p style={{ marginTop: '8px' }}><strong>Dispatch Times</strong>: Orders completed before 2:00 PM on business days are generally dispatched the same day for next-day delivery via APC Overnight.</p>
            </div>
          </div>

          {/* Section 4 */}
          <div id="section-liability" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <AlertCircle size={20} style={{ color: 'var(--primary)' }} /> 4. Limitations of Liability
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              Bayton Horticulture Centre shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our grow systems, nutrients, electrical components, or website. The maximum liability for any claim shall not exceed the purchase price of the items in dispute.
            </p>
          </div>

          {/* Section 5 */}
          <div id="section-law" style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Gavel size={20} style={{ color: 'var(--primary)' }} /> 5. Governing Law &amp; Contact
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              These terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts of England.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.6, backgroundColor: 'var(--light-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <strong>Bayton Horticulture Centre</strong><br />
              Bayton Road Industrial Estate,<br />
              Coventry, West Midlands, CV7 9EL<br />
              Email: <a href="mailto:sales@baytonhorticulture.co.uk" style={{ color: 'var(--primary)', fontWeight: 600 }}>sales@baytonhorticulture.co.uk</a>
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
