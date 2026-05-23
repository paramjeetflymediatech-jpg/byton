'use client';

import React, { useState, useEffect } from 'react';
import { Package, Settings, Truck, CheckCircle, FileText, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch admin stats on mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setSettings(data.settings || {});
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle setting updates
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage('Settings updated successfully.');
      } else {
        setSaveMessage(data.error || 'Failed to update settings.');
      }
    } catch (err) {
      setSaveMessage('Network error updating settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSettingField = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Store Administration</h1>
        <button onClick={fetchAdminData} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Tabs list */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('orders')}
          style={{ 
            padding: '12px 20px', 
            fontSize: '15px', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--primary)' : 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={18} /> Customer Orders ({orders.length})
        </button>
        
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ 
            padding: '12px 20px', 
            fontSize: '15px', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            borderBottom: activeTab === 'settings' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'settings' ? 'var(--primary)' : 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Settings size={18} /> Integration &amp; Shipping Settings
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Recent Sales</h2>
          
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No orders found in the system yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Destination</th>
                    <th>APC Tracking</th>
                    <th>Consignment Label</th>
                    <th>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600, fontSize: '14px' }}>{o.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.shippingPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{o.shippingCity}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{o.shippingPostcode}</div>
                      </td>
                      <td>
                        {o.apcTrackingNumber ? (
                          <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                            <Truck size={14} /> {o.apcTrackingNumber}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Not booked</span>
                        )}
                      </td>
                      <td>
                        {o.apcLabelUrl ? (
                          <button 
                            onClick={() => alert(`Printing consignment label PDF for Order: ${o.id}`)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', borderRadius: '6px' }}
                          >
                            <FileText size={12} /> Print Label
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>£{o.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Shipping configurations */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={18} /> APC Overnight Courier Rates
            </h2>

            <div className="form-group">
              <label>APC API Endpoint Key</label>
              <input 
                type="password" 
                value={settings['apc_api_key'] || ''} 
                onChange={e => updateSettingField('apc_api_key', e.target.value)}
                className="form-control" 
              />
            </div>
            
            <div className="form-group">
              <label>APC Account Number</label>
              <input 
                type="text" 
                value={settings['apc_account_number'] || ''} 
                onChange={e => updateSettingField('apc_account_number', e.target.value)}
                className="form-control" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Base Shipping Rate (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={settings['apc_base_shipping_rate'] || ''} 
                  onChange={e => updateSettingField('apc_base_shipping_rate', e.target.value)}
                  className="form-control" 
                />
              </div>
              <div className="form-group">
                <label>Per Kg Excess Rate (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={settings['apc_per_kg_rate'] || ''} 
                  onChange={e => updateSettingField('apc_per_kg_rate', e.target.value)}
                  className="form-control" 
                />
              </div>
            </div>
          </div>

          {/* Marketing Plugins */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px' }}>
                Marketing Integration Channels
              </h2>

              <div className="form-group">
                <label>Google Merchant Center ID</label>
                <input 
                  type="text" 
                  value={settings['google_shopping_merchant_id'] || ''} 
                  onChange={e => updateSettingField('google_shopping_merchant_id', e.target.value)}
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label>TikTok Pixel tag ID</label>
                <input 
                  type="text" 
                  value={settings['tiktok_pixel_id'] || ''} 
                  onChange={e => updateSettingField('tiktok_pixel_id', e.target.value)}
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label>Pinterest Tag account ID</label>
                <input 
                  type="text" 
                  value={settings['pinterest_tag_id'] || ''} 
                  onChange={e => updateSettingField('pinterest_tag_id', e.target.value)}
                  className="form-control" 
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <span>Google XML Feed URL:</span>
                  <a href="/api/google-shopping" target="_blank" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    /api/google-shopping <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Save buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="submit" 
                disabled={savingSettings}
                className="btn"
                style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '15px' }}
              >
                {savingSettings ? 'Saving Changes...' : 'Save Configuration Changes'}
              </button>
              {saveMessage && (
                <div style={{ textAlign: 'center', fontWeight: 600, color: saveMessage.includes('successfully') ? 'var(--primary)' : '#ef4444', fontSize: '14px' }}>
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
