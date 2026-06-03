'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Search, 
  Truck, 
  ShoppingBag, 
  UserCheck, 
  DollarSign, 
  FileText, 
  X, 
  ExternalLink,
  ChevronRight,
  Clipboard,
  Check
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingWp, setSyncingWp] = useState(false);
  const [bookingOrderId, setBookingOrderId] = useState<string | null>(null);
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<'all' | 'website' | 'ebay' | 'tiktok'>('all');
  const [status, setStatus] = useState<'all' | 'booked' | 'unbooked'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch orders from API
  const fetchOrders = async (searchVal = search, channelVal = channel, statusVal = status) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: searchVal,
        channel: channelVal,
        status: statusVal
      });
      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Error loading orders:', e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search with 400ms debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders(search, channel, status);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Trigger filter changes immediately
  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(search, channel, status);
  }, [channel, status]);

  // Handle eBay/TikTok order synchronizations
  const handleSync = async (selectedChannel: 'ebay' | 'tiktok') => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/sync?channel=${selectedChannel}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`${selectedChannel.toUpperCase()} order successfully synced!`);
        fetchOrders();
      } else {
        alert(data.error || `Failed to sync ${selectedChannel} orders.`);
      }
    } catch (err) {
      alert(`Network error syncing ${selectedChannel} orders.`);
    } finally {
      setSyncing(false);
    }
  };

  // Handle WooCommerce (WordPress) order sync
  const handleSyncWordPress = async () => {
    setSyncingWp(true);
    try {
      const res = await fetch('/api/admin/sync/wordpress', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`WordPress sync complete!\n${data.message}`);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to sync WordPress orders.');
      }
    } catch (err) {
      alert('Network error during WordPress sync.');
    } finally {
      setSyncingWp(false);
    }
  };

  // Handle APC consignment booking
  const handleBookAPC = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent opening order details modal
    setBookingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`APC Courier booked successfully!\nTracking ID: ${data.order.apcTrackingNumber}`);
        // If modal is open, update details in modal
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
        fetchOrders();
      } else {
        alert(data.error || 'Failed to book APC Courier.');
      }
    } catch (err) {
      alert('Network error booking APC Courier.');
    } finally {
      setBookingOrderId(null);
    }
  };

  // Helper to copy Order ID to clipboard
  const copyToClipboard = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute metrics based on active loaded list
  const totalSales = orders.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
  const uniqueCustomers = new Set(orders.map(o => o.customerEmail)).size;
  const bookedOrders = orders.filter(o => !!o.apcTrackingNumber).length;

  // Pagination bounds
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);

  const getOrderSource = (order: any) => {
    const ch = order.channel || '';
    const id = order.id || '';
    const isEbay   = ch === 'ebay'   || id.startsWith('EB-');
    const isTiktok = ch === 'tiktok' || id.startsWith('TT-');
    if (isEbay)   return { name: 'eBay',    color: '#2563eb', bg: '#eff6ff' };
    if (isTiktok) return { name: 'TikTok',  color: '#db2777', bg: '#fdf2f8' };
    return           { name: 'Website', color: '#059669', bg: '#ecfdf5' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Analytics Summary Card Panel */}
      <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Metric 1: Total Sales */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Total Volume</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>£{totalSales.toFixed(2)}</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} />
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Orders Filtered</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>{orders.length}</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Metric 3: Unique Customers */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Unique Customers</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>{uniqueCustomers}</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
        </div>

        {/* Metric 4: Courier Bookings */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>APC Courier Booked</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark)' }}>{bookedOrders} / {orders.length}</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} />
          </div>
        </div>
      </div>

      {/* 2. Main Order Table Card */}
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        
        {/* Header Action Row */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--dark)' }}>Order Management</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Sync multi-channel sales and print APC Courier labels.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncWordPress}
              disabled={syncingWp}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#059669', color: '#059669', backgroundColor: '#ecfdf5', cursor: syncingWp ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: syncingWp ? 0.7 : 1 }}
            >
              {syncingWp ? (
                <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Syncing WooCommerce...</>
              ) : (
                <><RefreshCw size={13} /> Sync WooCommerce</>
              )}
            </button>
            <button
              onClick={() => handleSync('ebay')}

              disabled={syncing}
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', gap: '6px', borderColor: '#3b82f6', color: '#3b82f6', backgroundColor: '#eff6ff', cursor: syncing ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >
              {syncing ? 'Syncing...' : 'Sync eBay'}
            </button>
            <button 
              onClick={() => handleSync('tiktok')} 
              disabled={syncing}
              className="btn btn-secondary" 
              style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', gap: '6px', borderColor: '#ec4899', color: '#ec4899', backgroundColor: '#fdf2f8', cursor: syncing ? 'not-allowed' : 'pointer', fontWeight: 600 }}
            >
              {syncing ? 'Syncing...' : 'Sync TikTok'}
            </button>
            <button onClick={() => fetchOrders()} className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '13px', display: 'flex', gap: '6px', fontWeight: 600 }}>
              <RefreshCw size={14} /> Refresh List
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Search query input */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by Order ID, name, email, city, postcode, tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '40px', height: '42px', backgroundColor: 'white' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
          </div>

          {/* Channel selector */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={channel}
              onChange={(e: any) => setChannel(e.target.value)}
              className="form-control"
              style={{ height: '42px', padding: '0 12px', backgroundColor: 'white', fontWeight: 500 }}
            >
              <option value="all">All Channels</option>
              <option value="website">Website Sales</option>
              <option value="ebay">eBay Orders</option>
              <option value="tiktok">TikTok Shop</option>
            </select>
          </div>

          {/* APC status filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="form-control"
              style={{ height: '42px', padding: '0 12px', backgroundColor: 'white', fontWeight: 500 }}
            >
              <option value="all">All Shipping Statuses</option>
              <option value="booked">Booked (Tracking Issued)</option>
              <option value="unbooked">Unbooked Courier</option>
            </select>
          </div>
        </div>

        {/* 3. Table & Data Rendering */}
        {loading && orders.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', animation: 'spin 1.s linear infinite' }} />
            <span>Fetching order lists...</span>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingBag size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div style={{ fontWeight: 600, fontSize: '15px' }}>No orders found</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Try resetting filters or syncing third-party channel sales.</div>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Channel</th>
                    <th>Customer Details</th>
                    <th>Destination</th>
                    <th>Courier Booking</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((o) => {
                    const source = getOrderSource(o);
                    const isBooked = !!o.apcTrackingNumber;
                    
                    return (
                      <tr 
                        key={o.id} 
                        onClick={() => setSelectedOrder(o)}
                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        className="order-row-hover"
                      >
                        {/* Order ID */}
                        <td style={{ fontWeight: 600, fontSize: '13px', position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>#</span>
                            <span>{o.id.substring(0, 12)}</span>
                            <button 
                              onClick={(e) => copyToClipboard(e, o.id)}
                              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex' }}
                              title="Copy ID"
                            >
                              {copiedId === o.id ? <Check size={12} style={{ color: '#059669' }} /> : <Clipboard size={12} />}
                            </button>
                          </div>
                          {o.createdAt && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 400 }}>
                              {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>

                        {/* Channel Source */}
                        <td>
                          <span style={{ 
                            backgroundColor: source.bg, 
                            color: source.color, 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '10px', 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            border: `1px solid ${source.color}20`
                          }}>
                            {source.name}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '13px' }}>{o.customerName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.shippingPhone}</div>
                        </td>

                        {/* Destination */}
                        <td>
                          <div style={{ fontSize: '13px', color: 'var(--dark)' }}>{o.shippingCity}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{o.shippingPostcode}</div>
                        </td>

                        {/* Courier Status */}
                        <td>
                          {isBooked ? (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ 
                                backgroundColor: '#ecfdf5', 
                                color: '#047857', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                fontSize: '11px', 
                                fontWeight: 600, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                border: '1px solid #10b98120'
                              }}>
                                <Truck size={12} /> {o.apcTrackingNumber}
                              </span>
                            </div>
                          ) : (
                            <span style={{ 
                              backgroundColor: '#fff7ed', 
                              color: '#c2410c', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              fontSize: '11px', 
                              fontWeight: 600,
                              border: '1px solid #f9731620'
                            }}>
                              Unbooked Courier
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            {!isBooked ? (
                              <button 
                                onClick={(e) => handleBookAPC(e, o.id)}
                                disabled={bookingOrderId === o.id}
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px', borderRadius: '6px', borderColor: '#ea580c', color: '#ea580c', backgroundColor: '#fff7ed', cursor: 'pointer', fontWeight: 600 }}
                              >
                                {bookingOrderId === o.id ? 'Booking...' : (
                                  <>
                                    <Truck size={12} /> Book APC
                                  </>
                                )}
                              </button>
                            ) : o.apcLabelUrl ? (
                              <a 
                                href={o.apcLabelUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px', borderRadius: '6px', fontWeight: 600 }}
                              >
                                <FileText size={12} /> Print Label
                              </a>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Booked</span>
                            )}
                          </div>
                        </td>

                        {/* Total amount */}
                        <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>
                          £{Number(o.totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} entries
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600 }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(9, 10, 12, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => setSelectedOrder(null)}>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0c1b0a', color: 'white' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Order Detail Record</span>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '8px', 
                    backgroundColor: getOrderSource(selectedOrder).color, 
                    color: 'white', 
                    fontWeight: 700, 
                    textTransform: 'uppercase' 
                  }}>
                    {getOrderSource(selectedOrder).name}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  Internal ID: {selectedOrder.id}
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'none', border: 'none', color: '#c5d9c2', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }} className="custom-scrollbar">
              
              {/* Shipping & Contact Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* Delivery Information */}
                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dark)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} style={{ color: 'var(--primary)' }} /> Shipping Destination
                  </h4>
                  <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 600 }}>{selectedOrder.customerName}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{selectedOrder.shippingAddress}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{selectedOrder.shippingCity}</div>
                    <div style={{ fontWeight: 600, color: 'var(--dark)', marginTop: '2px' }}>{selectedOrder.shippingPostcode}</div>
                  </div>
                </div>

                {/* Customer Contact & Courier */}
                <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dark)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} style={{ color: 'var(--primary)' }} /> Contact Details
                  </h4>
                  <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
                    <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                    <div><strong>Phone:</strong> {selectedOrder.shippingPhone || 'N/A'}</div>
                    <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <strong>Courier Status:</strong>{' '}
                      {selectedOrder.apcTrackingNumber ? (
                        <span style={{ color: '#047857', fontWeight: 600 }}>
                          Booked ({selectedOrder.apcTrackingNumber})
                        </span>
                      ) : (
                        <span style={{ color: '#c2410c', fontWeight: 600 }}>
                          Unbooked (Pending dispatch)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Consignment Control Card */}
              <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid #10b98120', backgroundColor: '#ecfdf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
                    APC Overnight Shipping Label
                  </h4>
                  <p style={{ fontSize: '12px', color: '#065f46' }}>
                    {selectedOrder.apcTrackingNumber 
                      ? `Consignment is registered under tracking ID: ${selectedOrder.apcTrackingNumber}`
                      : 'Generate automated tracking numbers and dispatch slips instantly.'
                    }
                  </p>
                </div>
                <div>
                  {selectedOrder.apcTrackingNumber ? (
                    <a 
                      href={selectedOrder.apcLabelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn" 
                      style={{ padding: '10px 16px', fontSize: '12px', display: 'inline-flex', gap: '6px', fontWeight: 600 }}
                    >
                      <FileText size={14} /> Open PDF Label
                    </a>
                  ) : (
                    <button 
                      onClick={(e) => handleBookAPC(e, selectedOrder.id)}
                      disabled={bookingOrderId === selectedOrder.id}
                      className="btn" 
                      style={{ padding: '10px 16px', fontSize: '12px', display: 'inline-flex', gap: '6px', fontWeight: 600, backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                    >
                      {bookingOrderId === selectedOrder.id ? 'Booking...' : (
                        <>
                          <Truck size={14} /> Book APC Courier
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dark)', marginBottom: '10px' }}>
                  Purchased Items List
                </h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Product Title</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, width: '80px' }}>Qty</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, width: '100px' }}>Unit Price</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, width: '120px' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item: any, idx: number) => (
                          <tr key={item.id || idx} style={{ borderBottom: idx < selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <td style={{ padding: '12px 16px', color: 'var(--dark)', fontWeight: 500 }}>
                              {item.productTitle || 'Unnamed Product'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                              {item.quantity}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                              £{Number(item.price || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--dark)', fontWeight: 600 }}>
                              £{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No line items associated with this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Calculations Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', display: 'flex', gap: '40px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping Cost (APC):</span>
                  <span style={{ fontWeight: 600 }}>£{Number(selectedOrder.shippingCost || 0).toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '15px', display: 'flex', gap: '40px', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <strong style={{ color: 'var(--dark)' }}>Total Amount Paid:</strong>
                  <strong style={{ color: 'var(--primary)' }}>£{Number(selectedOrder.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
              <button 
                type="button" 
                onClick={() => setSelectedOrder(null)} 
                className="btn btn-secondary" 
                style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
              >
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS enhancements for row hovers */}
      <style jsx global>{`
        .order-row-hover:hover {
          background-color: #f1f5f9;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
}
