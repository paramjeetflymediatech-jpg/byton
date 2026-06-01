"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, Edit, Trash2, Plus, X, Search, Folder, Upload } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    image: ''
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !isEditing) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return updated;
    });
  };

  const handleOpenAdd = () => {
    setForm({
      id: '',
      name: '',
      slug: '',
      description: '',
      image: ''
    });
    setIsEditing(false);
    setMessage('');
    setShowModal(true);
  };

  const handleOpenEdit = (cat: any) => {
    setForm({
      id: cat.id,
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || ''
    });
    setIsEditing(true);
    setMessage('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        fetchCategories();
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Network error deleting category');
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
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Category saved successfully!');
        setTimeout(() => {
          setShowModal(false);
          fetchCategories();
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to save category.');
      }
    } catch (err) {
      setMessage('Network error saving category.');
    }
  };

  const filteredCategories = categories.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  // Compute pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // If current page is empty and we have items, go back
  useEffect(() => {
    if (currentPage > 1 && currentItems.length === 0 && filteredCategories.length > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCategories.length, currentItems.length, currentPage, totalPages]);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark)' }}>Categories Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage product collections and taxonomy groupings.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchCategories} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search categories by name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '40px', height: '44px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          {search ? 'No categories matches your search query.' : 'No categories found. Click "Add Category" to create one.'}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Category Details</th>
                  <th>Description</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      {c.image ? (
                        <img src={c.image} alt={c.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <Folder size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '14px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{c.slug}</div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenEdit(c)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} entries
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

      {/* Add / Edit Category Modal */}
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
            maxWidth: '550px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Garden Furniture"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. garden-furniture"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Image URL</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="image"
                    value={form.image}
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
                      onChange={(e) => handleImageUpload(e, 'image')}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Collection descriptions..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
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
                  {isEditing ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
