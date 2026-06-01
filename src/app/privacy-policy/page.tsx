import React from 'react';
import type { Metadata } from 'next';
import { Shield, Eye, Lock, RefreshCw, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Bayton Horticulture Centre',
  description: 'Privacy Policy for Bayton Horticulture Centre Coventry. Learn how we collect, store, protect, and use your personal information and browser cookies.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--light-bg)', minHeight: '100vh', padding: '50px 0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
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
              <Shield size={30} />
            </div>
            <h1 id="policy-title" className="section-title" style={{ marginTop: 0, fontSize: '32px', textAlign: 'center' }}>
              Privacy Policy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>
              Last Updated: June 1, 2026
            </p>
          </div>

          {/* Intro */}
          <div style={{ lineHeight: 1.8, fontSize: '15px', color: 'var(--text)', marginBottom: '30px' }}>
            <p>
              At <strong>Bayton Horticulture Centre</strong>, accessible from <a href="https://baytonhorticulturecentre.co.uk" style={{ color: 'var(--primary)', fontWeight: 600 }}>https://baytonhorticulturecentre.co.uk</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Bayton Horticulture Centre and how we use it.
            </p>
            <p style={{ marginTop: '12px' }}>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact our data protection representative at <a href="mailto:sales@baytonhorticulture.co.uk" style={{ color: 'var(--primary)', fontWeight: 600 }}>sales@baytonhorticulture.co.uk</a>.
            </p>
          </div>

          {/* Section 1 */}
          <div id="section-collect" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Eye size={20} style={{ color: 'var(--primary)' }} /> 1. Personal Information We Collect
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              When you purchase products from our superstore, register an account, request weight-based shipping quotes, or submit contact inquiries, we collect the personal information you give us, including:
            </p>
            <ul style={{ paddingLeft: '24px', lineHeight: 1.8, fontSize: '14px', color: 'var(--text)' }}>
              <li><strong>Contact Details</strong>: Name, email address, telephone number, billing address, and shipping address.</li>
              <li><strong>Order History</strong>: Product catalogs, transaction details, and order notes.</li>
              <li><strong>Courier Information</strong>: Postcode-specific location data for calculations on shipping rates.</li>
              <li><strong>Technical Data</strong>: IP addresses, browser specs, page views, and click pathways.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div id="section-use" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <RefreshCw size={20} style={{ color: 'var(--primary)' }} /> 2. How We Use Your Information
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              We process your data to fulfill orders, improve service reliability, and secure website communications. Specifically:
            </p>
            <ul style={{ paddingLeft: '24px', lineHeight: 1.8, fontSize: '14px', color: 'var(--text)' }}>
              <li><strong>Order Fulfillment</strong>: Book package deliveries and print shipping labels with our courier partner (APC Overnight).</li>
              <li><strong>Shipping Calculations</strong>: Fetch real-time postcode delivery fee calculations.</li>
              <li><strong>Customer Support</strong>: Reply to contact submissions, technical inquiries, and product checks.</li>
              <li><strong>Security Auditing</strong>: Detect payment fraud, block malicious bots, and audit user accesses.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div id="section-tags" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Lock size={20} style={{ color: 'var(--primary)' }} /> 3. Marketing and Analytics Tags
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '12px' }}>
              Our platform implements conversion tracking and marketing pixels to optimize ad campaigns:
            </p>
            <div style={{ backgroundColor: 'var(--light-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li>
                  <strong style={{ color: 'var(--dark)' }}>TikTok Conversion Pixel</strong>:
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tracks conversions (such as Cart Additions and Checkout completions) from TikTok ads to measure and optimize marketing performance.
                  </p>
                </li>
                <li>
                  <strong style={{ color: 'var(--dark)' }}>Pinterest Tag</strong>:
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Saves Pinterest engagement metrics to review which grow lights, tents, and gardening categories perform best.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div id="section-security" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Lock size={20} style={{ color: 'var(--primary)' }} /> 4. Data Security & Storage
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              All interactions between your browser and our store are secured via high-grade SSL/TLS encryption. We store user records securely and do not share payment/credit card details. Our database is built on security-focused systems.
            </p>
          </div>

          {/* Section 5 */}
          <div id="section-contact" style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <Mail size={20} style={{ color: 'var(--primary)' }} /> 5. Data Enquiries & Contact
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              Under GDPR and UK data laws, you have the right to request a copy of your personal data, ask for corrections, or request deletion. Contact us:
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
