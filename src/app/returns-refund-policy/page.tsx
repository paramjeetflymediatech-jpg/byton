import React from 'react';
import type { Metadata } from 'next';
import { RefreshCw, CheckCircle, HelpCircle, PackageOpen, AlertTriangle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns & Refund Policy - Bayton Horticulture Centre',
  description: 'Returns and Refund Policy for Bayton Horticulture Centre Coventry. Learn about our 14-day return window, item condition requirements, and how to request a refund.',
};

export default function ReturnsRefundPolicyPage() {
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
              <RefreshCw size={30} />
            </div>
            <h1 id="returns-title" className="section-title" style={{ marginTop: 0, fontSize: '32px', textAlign: 'center' }}>
              Returns &amp; Refund Policy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '10px' }}>
              Last Updated: June 1, 2026
            </p>
          </div>

          {/* Intro */}
          <div style={{ lineHeight: 1.8, fontSize: '15px', color: 'var(--text)', marginBottom: '30px' }}>
            <p>
              At <strong>Bayton Horticulture Centre</strong>, customer satisfaction is our top priority. If you are not completely satisfied with your purchase, we are here to help. This policy outlines how and when you can return items purchased from our Coventry superstore or online catalog.
            </p>
          </div>

          {/* Section 1 */}
          <div id="section-window" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <PackageOpen size={20} style={{ color: 'var(--primary)' }} /> 1. Return Window &amp; Eligibility
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              You have <strong>14 calendar days</strong> from the date of receipt/delivery to return an item. To be eligible for a return, the item must fulfill the following:
            </p>
            <ul style={{ paddingLeft: '24px', lineHeight: 1.8, fontSize: '14px', color: 'var(--text)' }}>
              <li>The item must be unused, clean, and in the same brand-new condition that you received it.</li>
              <li>It must be in its original, unopened packaging, complete with all manuals, accessories, and components.</li>
              <li>You must present the original receipt, invoice, or online order confirmation as proof of purchase.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div id="section-exemptions" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--primary)' }} /> 2. Exceptions &amp; Non-Returnable Items
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              Certain categories of horticultural products cannot be returned due to safety, hygiene, and chemical integrity regulations:
            </p>
            <div style={{ backgroundColor: 'var(--light-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '14px', lineHeight: 1.7 }}>
              <p>🧪 <strong>Opened Liquid Nutrients &amp; Additives</strong>: For biosecurity and product purity compliance, liquid nutrients, root stimulants, or pest control liquids cannot be returned if the safety seal is broken.</p>
              <p style={{ marginTop: '8px' }}>🌱 <strong>Growing Media &amp; Soils</strong>: Open bags of soil, coco coir, clay pebbles, or rockwool cannot be returned.</p>
              <p style={{ marginTop: '8px' }}>💡 <strong>Special Order Gear</strong>: Custom-designed hydroponic setups or commercial CEA systems ordered directly from manufacturers may carry custom restocking fees or restricted return rights.</p>
            </div>
          </div>

          {/* Section 3 */}
          <div id="section-how-to" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <HelpCircle size={20} style={{ color: 'var(--primary)' }} /> 3. How to Initiate a Return
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              To initiate an online return, please follow these steps:
            </p>
            <ol style={{ paddingLeft: '24px', lineHeight: 1.8, fontSize: '14px', color: 'var(--text)' }}>
              <li>Email us at <a href="mailto:sales@baytonhorticulture.co.uk" style={{ color: 'var(--primary)', fontWeight: 600 }}>sales@baytonhorticulture.co.uk</a> stating your Order ID, product name, and the reason for the return.</li>
              <li>Wait for our support team to verify the details and reply with a **Return Authorization Number (RAN)** and shipping instructions.</li>
              <li>Package the goods securely. Write the RAN clearly on the outer shipping carton (not on the product packaging).</li>
              <li>Post the goods to our Coventry warehouse or drop them off directly at our superstore.</li>
            </ol>
          </div>

          {/* Section 4 */}
          <div id="section-shipping-costs" style={{ marginBottom: '35px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <CheckCircle size={20} style={{ color: 'var(--primary)' }} /> 4. Return Shipping Costs &amp; Refunds
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '10px' }}>
              Unless the returned items are verified as defective, damaged upon arrival, or incorrect, you are responsible for paying the courier cost of returning the goods.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              Once we receive and inspect your items at our warehouse, we will notify you of the status. If approved, we will issue a full refund (excluding original shipping costs unless product was faulty) to your original payment method within **5 to 7 working days**.
            </p>
          </div>

          {/* Section 5 */}
          <div id="section-damaged" style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--dark)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--primary)' }} /> 5. Damaged &amp; Faulty Deliveries
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
              If your shipment arrives damaged (e.g. broken bulbs, split nutrient bottles), please report it to us within **48 hours of receipt** with photographic proof of both the package box and the damaged product. We will coordinate a swift courier replacement or full refund.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.6, backgroundColor: 'var(--light-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <strong>Bayton Horticulture Centre - Returns</strong><br />
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
