'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/context/CartContext';
import { CheckCircle, Truck, Package, ShieldCheck, FileText } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostcode, setShippingPostcode] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  
  // Shipping & loading states
  const [loadingRate, setLoadingRate] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<{ cost: number; serviceName: string } | null>(null);
  const [shippingError, setShippingError] = useState('');
  
  // Success state
  const [orderReceipt, setOrderReceipt] = useState<{
    id: string;
    totalAmount: number;
    shippingCost: number;
    apcTrackingNumber: string;
    apcLabelUrl: string;
  } | null>(null);

  // Trigger TikTok and Pinterest InitiateCheckout tags when loading checkout
  useEffect(() => {
    if (cart.length > 0) {
      // Lazy load conversion tracking to prevent SSR mismatch
      import('../../lib/integrations/tracking').then(({ ConversionTracking }) => {
        ConversionTracking.trackTikTok('InitiateCheckout', {
          value: cartTotal,
          currency: 'GBP',
          contents: cart.map(item => ({
            id: item.id,
            name: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        });
        ConversionTracking.trackPinterest('initiatecheckout', {
          value: cartTotal,
          currency: 'GBP',
          contents: cart.map(item => ({
            id: item.id,
            name: item.title,
            quantity: item.quantity,
            price: item.price
          }))
        });
      });
    }
  }, [cart, cartTotal]);

  // Calculate live APC Overnight rates when postcode is entered
  const handleCalculateShipping = async () => {
    if (!shippingPostcode) {
      setShippingError('Please enter a postcode first.');
      return;
    }
    
    setLoadingRate(true);
    setShippingError('');
    setShippingQuote(null);

    // Calculate total weight of basket
    // (mock product weights: default to 1kg if not loaded)
    const totalWeight = cart.reduce((sum, item) => sum + 1.0 * item.quantity, 0);

    try {
      const res = await fetch('/api/apc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: totalWeight, postcode: shippingPostcode })
      });
      const data = await res.json();
      
      if (res.ok) {
        setShippingQuote({
          cost: data.cost,
          serviceName: data.serviceName
        });
      } else {
        setShippingError(data.error || 'Failed to fetch shipping rate.');
      }
    } catch (e) {
      setShippingError('Error connecting to courier pricing service.');
    } finally {
      setLoadingRate(false);
    }
  };

  // Submit order transaction
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingQuote) {
      setShippingError('Please calculate shipping rate with APC Courier first.');
      return;
    }

    setSubmittingOrder(true);
    setShippingError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress,
          shippingCity,
          shippingPostcode,
          shippingPhone,
          cartItems: cart.map(item => ({ id: item.id, quantity: item.quantity }))
        })
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        const order = data.order;
        setOrderReceipt({
          id: order.id,
          totalAmount: order.totalAmount,
          shippingCost: order.shippingCost,
          apcTrackingNumber: order.apcTrackingNumber,
          apcLabelUrl: order.apcLabelUrl
        });

        // Trigger conversions Tag triggers for TikTok and Pinterest
        const { ConversionTracking } = await import('../../lib/integrations/tracking');
        ConversionTracking.purchase({
          id: order.id,
          totalAmount: order.totalAmount,
          items: cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          }))
        });

        // Clear cart
        clearCart();
      } else {
        setShippingError(data.error || 'Failed to process checkout transaction.');
      }
    } catch (err) {
      setShippingError('Network error processing transaction.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Success Receipt Screen
  if (orderReceipt) {
    return (
      <div className="container" style={{ padding: '60px 24px', maxWidth: '650px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
          <CheckCircle size={64} style={{ color: 'var(--primary)', marginBottom: '24px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Thank you for shopping at Bayton Horticulture Centre. Your order is processed.</p>

          <div style={{ backgroundColor: 'var(--light-bg)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Order ID:</span>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>{orderReceipt.id}</div>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Amount Paid:</span>
              <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>£{orderReceipt.totalAmount.toFixed(2)}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={14} /> APC Overnight Courier Details:
              </span>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>Tracking: {orderReceipt.apcTrackingNumber}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consignment booked. APC courier dispatch scheduled next day.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/" className="btn">Continue Shopping</Link>
            <a 
              href={orderReceipt.apcLabelUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={(e) => {
                e.preventDefault();
                alert(`Downloading Mock APC Overnight Consignment PDF Label for order: ${orderReceipt.id}`);
              }}
            >
              <FileText size={16} /> Print APC Label
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Cart Empty Screen
  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '16px' }}>Checkout</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Your shopping basket is empty. Add products to proceed.</p>
        <Link href="/" className="btn">Browse Shop Catalog</Link>
      </div>
    );
  }

  const finalTotal = cartTotal + (shippingQuote ? shippingQuote.cost : 0);

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '30px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* Checkout Billing & Shipping Form */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} style={{ color: 'var(--primary)' }} /> Customer &amp; Delivery Details
          </h2>

          <form onSubmit={handlePlaceOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={customerEmail} 
                  onChange={e => setCustomerEmail(e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address</label>
              <textarea 
                rows={3}
                value={shippingAddress} 
                onChange={e => setShippingAddress(e.target.value)} 
                className="form-control" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  value={shippingCity} 
                  onChange={e => setShippingCity(e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Postcode</label>
                <input 
                  type="text" 
                  value={shippingPostcode} 
                  onChange={e => setShippingPostcode(e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={shippingPhone} 
                  onChange={e => setShippingPhone(e.target.value)} 
                  className="form-control" 
                  required 
                />
              </div>
            </div>

            {/* Courier Section */}
            <div style={{ marginTop: '24px', backgroundColor: 'var(--light-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={18} style={{ color: 'var(--primary)' }} /> APC Overnight Shipping Rate
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Delivery pricing is calculated dynamically based on total consignment weight and postcode routing.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  type="button" 
                  onClick={handleCalculateShipping}
                  disabled={loadingRate}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {loadingRate ? 'Calculating...' : 'Calculate Shipping Cost'}
                </button>
                {shippingQuote && (
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
                    {shippingQuote.serviceName} (+£{shippingQuote.cost.toFixed(2)})
                  </span>
                )}
              </div>
            </div>

            {shippingError && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '16px', fontWeight: 500 }}>{shippingError}</p>
            )}

            <button 
              type="submit" 
              disabled={submittingOrder || !shippingQuote}
              className="btn"
              style={{ width: '100%', justifyContent: 'center', height: '50px', marginTop: '30px', fontSize: '16px', opacity: (!shippingQuote || submittingOrder) ? 0.6 : 1 }}
            >
              {submittingOrder ? 'Processing Transaction...' : `Place Order (Pay £${finalTotal.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Cart Summary */}
        <aside style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={18} /> Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                <div style={{ maxWidth: '75%' }}>
                  <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.title}
                </div>
                <div style={{ fontWeight: 500 }}>£{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
              <span style={{ fontWeight: 500 }}>£{cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>APC Shipping Charge:</span>
              <span style={{ fontWeight: 500 }}>
                {shippingQuote ? `£${shippingQuote.cost.toFixed(2)}` : 'Calculated at checkout'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
              <span>Total amount:</span>
              <span style={{ color: 'var(--primary)' }}>£{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
