"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function SeoPage() {
  const [seoData, setSeoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    productId: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: ''
  });
  const [message, setMessage] = useState('');

  const fetchSeo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo');
      const data = await res.json();
      if (res.ok) setSeoData(data.seo || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('SEO entry saved');
        fetchSeo();
      } else {
        setMessage(data.error || 'Failed');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>SEO Management</h2>
      <button onClick={fetchSeo} className="btn btn-secondary" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <RefreshCw size={14} /> Refresh
      </button>
      {loading ? <p>Loading...</p> : (
        <table className="admin-table" style={{ width: '100%', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product ID</th>
              <th>Meta Title</th>
              <th>Meta Description</th>
            </tr>
          </thead>
          <tbody>
            {seoData.map((s: any) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.productId}</td>
                <td>{s.metaTitle}</td>
                <td>{s.metaDescription}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <input name="productId" placeholder="Product ID" value={form.productId} onChange={handleChange} className="form-control" />
        <input name="metaTitle" placeholder="Meta Title" value={form.metaTitle} onChange={handleChange} className="form-control" />
        <input name="metaDescription" placeholder="Meta Description" value={form.metaDescription} onChange={handleChange} className="form-control" />
        <input name="keywords" placeholder="Keywords" value={form.keywords} onChange={handleChange} className="form-control" />
        <input name="canonicalUrl" placeholder="Canonical URL" value={form.canonicalUrl} onChange={handleChange} className="form-control" />
        <input name="ogTitle" placeholder="OG Title" value={form.ogTitle} onChange={handleChange} className="form-control" />
        <input name="ogDescription" placeholder="OG Description" value={form.ogDescription} onChange={handleChange} className="form-control" />
        <input name="ogImageUrl" placeholder="OG Image URL" value={form.ogImageUrl} onChange={handleChange} className="form-control" />
        <button type="submit" className="btn" style={{ gridColumn: 'span 2', padding: '10px' }}>Save SEO</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('saved') ? 'var(--primary)' : '#ef4444' }}>{message}</p>}
    </div>
  );
}
