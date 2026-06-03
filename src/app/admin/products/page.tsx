"use client";
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Edit, Trash2, Plus, X, Search, Package, Upload } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    description: '',
    excerpt: '',
    price: '',
    regularPrice: '',
    salePrice: '',
    sku: '',
    stock: '',
    stockStatus: 'instock',
    weight: '',
    image: '',
    categoryIds: [] as number[]
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // CKEditor refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorInstance = useRef<any>(null);

  // Load CKEditor CDN dynamically on modal open
  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    if (showModal) {
      const initEditor = () => {
        // Small delay to ensure the modal DOM mounts the textarea element
        setTimeout(() => {
          if ((window as any).ClassicEditor && editorRef.current && !editorInstance.current) {
            (window as any).ClassicEditor.create(editorRef.current)
              .then((editor: any) => {
                editorInstance.current = editor;
                // Set initial data
                editor.setData(form.description || '');
                // Listen for changes
                editor.model.document.on('change:data', () => {
                  const data = editor.getData();
                  setForm(prev => ({ ...prev, description: data }));
                });
              })
              .catch((err: any) => {
                console.error('Failed to initialize CKEditor:', err);
              });
          }
        }, 150);
      };

      if (!(window as any).ClassicEditor) {
        script = document.createElement('script');
        script.src = 'https://cdn.ckeditor.com/ckeditor5/35.0.1/classic/ckeditor.js';
        script.async = true;
        script.onload = initEditor;
        document.body.appendChild(script);
      } else {
        initEditor();
      }
    }

    return () => {
      // Destroy editor instance when modal closes
      if (editorInstance.current) {
        editorInstance.current.destroy()
          .then(() => {
            editorInstance.current = null;
          })
          .catch((err: any) => {
            console.error('Error destroying CKEditor:', err);
          });
      }
    };
  }, [showModal]);

  const [total, setTotal] = useState(0);

  const fetchProducts = async (pageVal?: number, searchVal?: string) => {
    const pageNum = typeof pageVal === 'number' ? pageVal : currentPage;
    const searchStr = typeof searchVal === 'string' ? searchVal : search;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${pageNum}&limit=${itemsPerPage}&search=${encodeURIComponent(searchStr)}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch when page changes
  useEffect(() => {
    fetchProducts(currentPage, search);
    fetchCategories();
  }, [currentPage]);

  // Handle search query changes with a 400ms debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(1, search);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleCategoryToggle = (categoryId: number) => {
    setForm(prev => {
      const isSelected = prev.categoryIds.includes(categoryId);
      const updatedIds = isSelected
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: updatedIds };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !isEditing) {
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
      title: '',
      slug: '',
      description: '',
      excerpt: '',
      price: '',
      regularPrice: '',
      salePrice: '',
      sku: '',
      stock: '10',
      stockStatus: 'instock',
      weight: '1',
      image: '',
      categoryIds: []
    });
    setIsEditing(false);
    setMessage('');
    setShowModal(true);
  };

  const handleOpenEdit = (prod: any) => {
    setForm({
      id: prod.id,
      title: prod.title || '',
      slug: prod.slug || '',
      description: prod.description || '',
      excerpt: prod.excerpt || '',
      price: String(prod.price || ''),
      regularPrice: String(prod.regularPrice || ''),
      salePrice: String(prod.salePrice || ''),
      sku: prod.sku || '',
      stock: String(prod.stock || '0'),
      stockStatus: prod.stockStatus || 'instock',
      weight: String(prod.weight || '0'),
      image: prod.image || '',
      categoryIds: prod.categoryIds || []
    });
    setIsEditing(true);
    setMessage('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Network error deleting product');
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

  const handleCloseModal = () => {
    if (editorInstance.current) {
      editorInstance.current.destroy()
        .then(() => {
          editorInstance.current = null;
          setShowModal(false);
        })
        .catch(() => {
          setShowModal(false);
        });
    } else {
      setShowModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Product saved successfully!');
        setTimeout(() => {
          handleCloseModal();
          fetchProducts();
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to save product.');
      }
    } catch (err) {
      setMessage('Network error saving product.');
    }
  };

  // Compute pagination (done on backend, results available in total)
  const totalPages = Math.ceil(total / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = products;

  // If page out of bounds due to deletes, go back
  useEffect(() => {
    if (currentPage > 1 && currentItems.length === 0 && total > 0) {
      setCurrentPage(totalPages);
    }
  }, [total, currentItems.length, currentPage, totalPages]);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark)' }}>Products Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Create, update, and manage your inventory details.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => fetchProducts(currentPage, search)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search products by title or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '40px', height: '44px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>
      ) : total === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          {search ? 'No products matches your search query.' : 'No products found. Click "Add Product" to create one.'}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th>Price (Reg / Sale)</th>
                  <th>Stock Status</th>
                  <th>Weight</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.title} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <Package size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '14px', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ID: {p.id}</span>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--dark)', fontSize: '14px' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{p.slug}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>{p.sku || '-'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                        £{Number(p.price).toFixed(2)}
                      </div>
                      {p.salePrice && (
                        <div style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          £{Number(p.regularPrice).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.stockStatus === 'instock' ? (
                        <span className="badge-status badge-success">In Stock ({p.stock})</span>
                      ) : (
                        <span className="badge-status badge-pending">Out of Stock</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px' }}>{p.weight ? `${p.weight} kg` : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, total)} of {total} entries
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

      {/* Add / Edit Product Modal */}
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
            maxWidth: '1000px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>
                {isEditing ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '24px' }}>
                {/* Left Form Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Product Title</label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. Lavender Herb Pot"
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
                        placeholder="e.g. lavender-herb-pot"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. LAV-POT-1"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. 1.5"
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
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Current Price (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. 19.99"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Regular Price (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="regularPrice"
                        value={form.regularPrice}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. 24.99"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Sale Price (£ - Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="salePrice"
                        value={form.salePrice}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. 19.99"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Stock Qty</label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="e.g. 15"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Stock Status</label>
                      <select
                        name="stockStatus"
                        value={form.stockStatus}
                        onChange={handleChange}
                        className="form-control"
                        style={{ height: '42px' }}
                      >
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Short Excerpt</label>
                    <textarea
                      name="excerpt"
                      value={form.excerpt}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Summarize the product in 1-2 lines..."
                      rows={2}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Description using CKEditor */}
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Full Description (Rich Text Editor)</label>
                    <div style={{ color: 'black' }}>
                      <textarea
                        ref={editorRef}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Detailed product descriptions..."
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Column (aside) for categories */}
                <aside style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  height: 'fit-content'
                }}>
                  <h4 style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--dark)',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '8px',
                    margin: 0
                  }}>
                    Product Categories
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    paddingRight: '6px'
                  }}>
                    {categories.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No categories created yet.</div>
                    ) : (
                      categories.map((cat: any) => (
                        <label
                          key={cat.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            color: 'var(--text)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={form.categoryIds.includes(cat.id)}
                            onChange={() => handleCategoryToggle(cat.id)}
                            style={{
                              accentColor: 'var(--primary)',
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer'
                            }}
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </aside>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ padding: '10px 20px' }} disabled={uploading}>
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
