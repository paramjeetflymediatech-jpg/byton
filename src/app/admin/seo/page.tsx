"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, Edit, Trash2, Plus, X, Upload } from 'lucide-react';

export default function SeoPage() {
  const [seoData, setSeoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    pageType: 'custom',
    pageId: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: ''
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSeo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo');
      const data = await res.json();
      if (res.ok) {
        setSeoData(data.seo || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setForm({
      id: 0,
      pageType: 'custom',
      pageId: '',
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImageUrl: ''
    });
    setIsEditing(false);
    setMessage('');
    setShowModal(true);
  };

  const handleOpenEdit = (seo: any) => {
    setForm({
      id: seo.id,
      pageType: seo.pageType || 'custom',
      pageId: seo.pageId || '',
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      keywords: seo.keywords || '',
      canonicalUrl: seo.canonicalUrl || '',
      ogTitle: seo.ogTitle || '',
      ogDescription: seo.ogDescription || '',
      ogImageUrl: seo.ogImageUrl || ''
    });
    setIsEditing(true);
    setMessage('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this SEO configuration?')) return;

    try {
      const res = await fetch(`/api/admin/seo?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        fetchSeo();
      } else {
        alert(data.error || 'Failed to delete SEO config');
      }
    } catch (err) {
      alert('Network error deleting SEO config');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading image...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(prev => ({ ...prev, [fieldName]: data.url }));
        setMessage('Image uploaded successfully!');
      } else {
        setMessage(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      setMessage('Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        setMessage('SEO configuration saved successfully!');
        setTimeout(() => {
          setShowModal(false);
          fetchSeo();
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to save configuration.');
      }
    } catch (err) {
      setMessage('Network error saving configuration.');
    }
  };

  // Compute pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = seoData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(seoData.length / itemsPerPage);

  // If current page is empty and we have items, go back
  useEffect(() => {
    if (currentPage > 1 && currentItems.length === 0 && seoData.length > 0) {
      setCurrentPage(totalPages);
    }
  }, [seoData.length, currentItems.length, currentPage, totalPages]);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark)' }}>SEO Configurations</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage search engine optimization tags for products and page URLs.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchSeo} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <Plus size={16} /> Add SEO Config
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading SEO settings...</div>
      ) : seoData.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          No custom SEO configurations found. Click "Add SEO Config" to create one.
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Meta Title</th>
                  <th>Meta Description</th>
                  <th>Keywords</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((s: any) => (
                  <tr key={s.id}>
                    <td>
                      {s.pageType ? (
                        <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const,
                          backgroundColor: s.pageType === 'product' ? '#ecfdf5' : '#eff6ff',
                          color: s.pageType === 'product' ? '#059669' : '#2563eb' }}>
                          {s.pageType}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>custom</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.metaTitle || '-'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.metaDescription || '-'}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                        {s.keywords || 'none'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenEdit(s)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, seoData.length)} of {seoData.length} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>
                {isEditing ? 'Edit SEO Metadata' : 'Add New SEO Metadata'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Page Type</label>
                  <select
                    name="pageType"
                    value={(form as any).pageType}
                    onChange={(e) => setForm(prev => ({ ...prev, pageType: e.target.value }))}
                    className="form-control"
                    disabled={isEditing}
                  >
                    <option value="custom">Custom</option>
                    <option value="product">Product</option>
                    <option value="post">Blog Post</option>
                    <option value="page">Page</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Page / Product ID</label>
                  <input
                    type="text"
                    name="pageId"
                    value={(form as any).pageId}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. 1045 or about-us"
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Recommended length: 50-60 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={form.metaDescription}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Recommended length: 150-160 characters"
                  rows={3}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Keywords (Comma Separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={form.keywords}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="plants, horticulture, garden furniture"
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--dark)' }}>Social (Open Graph) Metadata</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>OG Title</label>
                    <input
                      type="text"
                      name="ogTitle"
                      value={form.ogTitle}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Title for Facebook/Twitter sharing"
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>OG Image URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        name="ogImageUrl"
                        value={form.ogImageUrl}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Image link or upload"
                        style={{ flexGrow: 1 }}
                      />
                      <label className="btn btn-secondary" style={{ padding: '0 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', whiteSpace: 'nowrap', height: '42px', gap: '4px' }}>
                        <Upload size={14} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'ogImageUrl')}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600 }}>OG Description</label>
                  <textarea
                    name="ogDescription"
                    value={form.ogDescription}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Short description for social sharing"
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {message && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: message.includes('successfully') ? '#ecfdf5' : '#fef2f2',
                  color: message.includes('successfully') ? '#047857' : '#b91c1c',
                  fontWeight: 600,
                  fontSize: '13px'
                }}>
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ padding: '10px 20px' }} disabled={uploading}>
                  {isEditing ? 'Update Configuration' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
