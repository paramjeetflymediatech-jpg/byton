'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Settings, 
  Truck, 
  CheckCircle, 
  FileText, 
  ExternalLink, 
  RefreshCw,
  LayoutDashboard, 
  Users, 
  Globe, 
  FolderOpen,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  UserCheck,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import SeoPage from './seo/page';
import ProductsPage from './products/page';
import CategoriesPage from './categories/page';
import UsersPage from './users/page';
import BlogPage from './blog/page';
import OrdersPage from './orders/page';
import { useSession, signIn, signOut } from 'next-auth/react';

// Session guard – ensure only authenticated admin can view
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  if (status === 'loading') return <p style={{ padding: '80px 24px', textAlign: 'center' }}>Loading...</p>;
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    // Redirect to sign‑in page
    if (typeof window !== 'undefined') signIn();
    return <p style={{ padding: '80px 24px', textAlign: 'center' }}>Access denied – redirecting to sign‑in...</p>;
  }
  return <>{children}</>;
};

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}

function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'seo' | 'products' | 'categories' | 'users' | 'blog'>('orders');
  const [settings, setSettings] = useState<any>({});
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch admin stats on mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  const [syncingApc, setSyncingApc] = useState(false);

  const fetchAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings || {});
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch APC credentials from WordPress custom endpoint
  const handleSyncAPCCredentials = async () => {
    setSyncingApc(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/admin/sync/apc-credentials', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage(data.message || 'APC credentials successfully synced from WordPress.');
        // Refresh settings silently so they load into the input fields
        await fetchAdminData(true);
      } else {
        setSaveMessage(data.error || 'Failed to sync APC credentials.');
      }
    } catch (err) {
      setSaveMessage('Network error during APC credentials sync.');
    } finally {
      setSyncingApc(false);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--dark)' }}>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Dynamic styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar {
          width: 260px;
          background-color: #0c1b0a;
          color: #c5d9c2;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #142d11;
          flex-shrink: 0;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #142d11;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-menu {
          list-style: none;
          padding: 24px 0;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .menu-item-btn {
          width: 100%;
          padding: 12px 24px;
          background: none;
          border: none;
          color: #c5d9c2;
          text-align: left;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }
        .menu-item-btn:hover {
          background-color: rgba(94, 180, 70, 0.1);
          color: white;
        }
        .menu-item-btn.active {
          background-color: rgba(94, 180, 70, 0.15);
          color: #5EB446;
          font-weight: 600;
          border-left-color: #5EB446;
        }
        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid #142d11;
        }
        .admin-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .admin-topbar {
          height: 70px;
          background-color: white;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          flex-shrink: 0;
        }
        .admin-body {
          padding: 40px;
          flex-grow: 1;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }
        .metric-card {
          background-color: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: var(--transition);
        }
        .metric-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .metric-icon-box {
          background-color: rgba(94, 180, 70, 0.1);
          color: #5EB446;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logout-btn {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: var(--transition);
        }
        .logout-btn:hover {
          background-color: #ef4444;
          border-color: #ef4444;
        }
        .admin-table-card {
          background-color: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }
        .admin-table-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge-status {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-success {
          background-color: #ecfdf5;
          color: #059669;
        }
        .badge-pending {
          background-color: #fffbeb;
          color: #d97706;
        }

        @media (max-width: 1200px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            width: 70px;
          }
          .sidebar-header span, .menu-item-btn span, .logout-btn span {
            display: none;
          }
          .menu-item-btn {
            justify-content: center;
            padding: 14px 0;
          }
          .admin-topbar {
            padding: 0 20px;
          }
          .admin-body {
            padding: 20px;
          }
          .metric-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      ` }} />

      {/* Left Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Bayton Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'white', fontFamily: "'Outfit', sans-serif" }}>Bayton Control</span>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`menu-item-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Orders</span>
            </button>
          </li>
          
          <li>
            <button 
              onClick={() => setActiveTab('products')}
              className={`menu-item-btn ${activeTab === 'products' ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Products</span>
            </button>
          </li>
          
          <li>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`menu-item-btn ${activeTab === 'categories' ? 'active' : ''}`}
            >
              <FolderOpen size={20} />
              <span>Categories</span>
            </button>
          </li>
          
          <li>
            <button 
              onClick={() => setActiveTab('blog')}
              className={`menu-item-btn ${activeTab === 'blog' ? 'active' : ''}`}
            >
              <FileText size={20} />
              <span>Blog &amp; Pages</span>
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveTab('seo')}
              className={`menu-item-btn ${activeTab === 'seo' ? 'active' : ''}`}
            >
              <Globe size={20} />
              <span>SEO Config</span>
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveTab('users')}
              className={`menu-item-btn ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Users</span>
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`menu-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={20} />
              <span>Integrations</span>
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <span>Portal</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--dark)', fontWeight: 600, textTransform: 'capitalize' }}>
              {activeTab === 'orders' ? 'Orders' : activeTab}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
              Hello, {session?.user?.name || 'Admin'}
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="admin-body">
          
          {/* Orders / Overview Tab */}
          {activeTab === 'orders' && <OrdersPage />}

          {/* Settings / Integrations Tab */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Shipping Rates Box */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark)', width: '100%' }}>
                  <Truck size={18} style={{ color: 'var(--primary)' }} /> 
                  <span>APC Overnight Courier Rates</span>
                  <button
                    type="button"
                    onClick={handleSyncAPCCredentials}
                    disabled={syncingApc}
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      borderColor: '#7c3aed',
                      color: '#7c3aed',
                      backgroundColor: '#f5f3ff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: syncingApc ? 'not-allowed' : 'pointer',
                      marginLeft: 'auto',
                      border: '1px solid #ddd',
                    }}
                    title="Fetch APC username, password and account number from WordPress and save to settings"
                  >
                    {syncingApc ? (
                      <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Syncing...</>
                    ) : (
                      <><RefreshCw size={12} /> Sync from WordPress</>
                    )}
                  </button>
                </h2>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>APC Username</label>
                  <input 
                    type="text" 
                    value={settings['apc_username'] || ''} 
                    onChange={e => updateSettingField('apc_username', e.target.value)}
                    className="form-control" 
                    placeholder="e.g. your-email@example.com"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>APC Password</label>
                  <input 
                    type="password" 
                    value={settings['apc_password'] || ''} 
                    onChange={e => updateSettingField('apc_password', e.target.value)}
                    className="form-control" 
                    placeholder="Enter your APC password"
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>APC Account Number</label>
                  <input 
                    type="text" 
                    value={settings['apc_account_number'] || ''} 
                    onChange={e => updateSettingField('apc_account_number', e.target.value)}
                    className="form-control" 
                    placeholder="e.g. 123456"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Base Shipping Rate (£)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={settings['apc_base_shipping_rate'] || ''} 
                      onChange={e => updateSettingField('apc_base_shipping_rate', e.target.value)}
                      className="form-control" 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Per Kg Excess Rate (£)</label>
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

              {/* Opayo Payment Gateway Box */}
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginTop: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--dark)' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--primary)' }} /> Opayo Payment Gateway (SagePay)
                </h2>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Opayo Vendor Name</label>
                  <input 
                    type="text" 
                    value={settings['opayo_vendor_name'] || ''} 
                    onChange={e => updateSettingField('opayo_vendor_name', e.target.value)}
                    className="form-control" 
                    placeholder="e.g. baytonhorticulture"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Opayo Integration Key</label>
                  <input 
                    type="password" 
                    value={settings['opayo_integration_key'] || ''} 
                    onChange={e => updateSettingField('opayo_integration_key', e.target.value)}
                    className="form-control" 
                    placeholder="Enter Opayo integration password or key"
                  />
                </div>
              </div>

              {/* Marketing Plugins Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '8px', color: 'var(--dark)' }}>
                    Marketing Channels &amp; Pixels
                  </h2>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Google Merchant Center ID</label>
                    <input 
                      type="text" 
                      value={settings['google_shopping_merchant_id'] || ''} 
                      onChange={e => updateSettingField('google_shopping_merchant_id', e.target.value)}
                      className="form-control" 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>TikTok Pixel tag ID</label>
                    <input 
                      type="text" 
                      value={settings['tiktok_pixel_id'] || ''} 
                      onChange={e => updateSettingField('tiktok_pixel_id', e.target.value)}
                      className="form-control" 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Pinterest Tag account ID</label>
                    <input 
                      type="text" 
                      value={settings['pinterest_tag_id'] || ''} 
                      onChange={e => updateSettingField('pinterest_tag_id', e.target.value)}
                      className="form-control" 
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Google XML Feed URL:</span>
                      <a href="/api/google-shopping" target="_blank" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        /api/google-shopping <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Save controls */}
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

          {/* Subpages Tab components */}
          {activeTab === 'blog' && <BlogPage />}
          {activeTab === 'seo' && <SeoPage />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'categories' && <CategoriesPage />}
          {activeTab === 'users' && <UsersPage />}

        </div>
      </main>

    </div>
  );
}
