'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, Settings, LogOut, ChevronRight, Mail, DollarSign, FileText, Truck, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tab State: 'profile' | 'orders' | 'settings'
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');

  // Customer states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch orders when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await fetch('/api/customer/orders');
          const data = await res.json();
          if (res.ok && data.success) {
            setOrders(data.orders || []);
          }
        } catch (err) {
          console.error('Failed to load orders', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [status]);

  // Handle password change submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch('/api/customer/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Show loading indicator while session status is resolving
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading account details...
      </div>
    );
  }

  // Double guard
  if (!session) {
    return null;
  }

  // Calculate quick stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => {
    if (order.status === 'completed') {
      return sum + parseFloat(order.totalAmount || 0);
    }
    return sum;
  }, 0);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '30px' }}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text)' }}>My Account</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* Navigation Sidebar */}
        <aside style={{ backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              {session.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{session.user?.name || 'Customer'}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', wordBreak: 'break-all' }}>{session.user?.email}</p>
          </div>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`btn ${activeTab === 'profile' ? '' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '12px 16px', border: activeTab === 'profile' ? 'none' : '1px solid var(--border)' }}
          >
            <User size={18} /> Profile Overview
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`btn ${activeTab === 'orders' ? '' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '12px 16px', border: activeTab === 'orders' ? 'none' : '1px solid var(--border)' }}
          >
            <ShoppingBag size={18} /> My Orders ({totalOrders})
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`btn ${activeTab === 'settings' ? '' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '12px 16px', border: activeTab === 'settings' ? 'none' : '1px solid var(--border)' }}
          >
            <Settings size={18} /> Account Settings
          </button>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })} 
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '12px 16px', border: '1px solid #fee2e2', color: '#dc2626', backgroundColor: '#fef2f2', marginTop: '24px' }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </aside>

        {/* Dashboard Panels */}
        <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', minHeight: '400px' }}>
          
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>
                Profile Overview
              </h1>
              
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
                <div style={{ backgroundColor: 'var(--light-bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Orders</span>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--dark)' }}>{totalOrders}</div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--light-bg)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '10px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Spent</span>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--dark)' }}>£{totalSpent.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Account Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={18} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ fontSize: '15px' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Name:</span>
                    <strong>{session.user?.name || 'Customer'}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={18} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ fontSize: '15px' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Email:</span>
                    <strong>{session.user?.email}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={18} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ fontSize: '15px' }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Account Role:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{(session.user as any)?.role || 'User'}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>
                My Orders
              </h1>

              {loadingOrders ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                  <Link href="/shop/all" className="btn">Browse Products</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map((order) => (
                    <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      
                      {/* Order Header */}
                      <div style={{ backgroundColor: 'var(--light-bg)', padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>ORDER ID</span>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{order.id}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>DATE PLACED</span>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>
                            {new Date(order.created_at || order.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>TOTAL PAID</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>£{parseFloat(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>STATUS</span>
                          <span className={`badge-status ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize', fontSize: '12px', padding: '4px 10px' }}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Body (Items & Courier details) */}
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          
                          {/* Items Purchased */}
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Items</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {(order.items || []).map((item: any) => (
                                <div key={item.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                                  <div>
                                    <span style={{ fontWeight: 600, marginRight: '6px' }}>{item.quantity}x</span>
                                    {item.productTitle}
                                  </div>
                                  <div style={{ fontWeight: 500 }}>£{(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping / Courier details */}
                          <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Delivery Details</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                              <div><strong>Address:</strong> {order.shippingAddress}, {order.shippingCity}, {order.shippingPostcode}</div>
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><Truck size={14} /> APC Overnight Courier</strong>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tracking: {order.apcTrackingNumber || 'Pending'}</div>
                                {order.apcLabelUrl && (
                                  <a 
                                    href={order.apcLabelUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      alert(`Downloading APC Consignment label for order: ${order.id}`);
                                    }}
                                  >
                                    <FileText size={12} /> View Shipping Label
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>
                Account Settings
              </h1>
              
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Update Password</h3>
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                {passwordError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                    {passwordSuccess}
                  </div>
                )}

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 600 }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-control"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={updatingPassword}
                  className="btn"
                  style={{ marginTop: '10px', height: '42px', justifyContent: 'center' }}
                >
                  {updatingPassword ? 'Updating Password...' : 'Save Password'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
