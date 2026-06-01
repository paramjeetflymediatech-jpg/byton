"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Edit, Trash2, Plus, X, Upload, Search, ExternalLink, Tag, Calendar, User } from 'lucide-react';

interface BlogPost {
  id: number;
  wpId: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categories: string;
  tags: string;
  author: string;
  status: string;
  publishedAt?: string;
  canonicalUrl: string;
}

const emptyForm: Omit<BlogPost, 'id' | 'wpId'> & { id?: number; wpId?: number } = {
  slug: '',
  title: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  categories: '',
  tags: '',
  author: '',
  status: 'publish',
  publishedAt: '',
  canonicalUrl: '',
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;

  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewPost, setViewPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyForm);

  // CKEditor refs
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const [ckReady, setCkReady] = useState(false);

  // Inject CKEditor 5 CDN script once
  useEffect(() => {
    if ((window as any).ClassicEditor) { setCkReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js';
    script.async = true;
    script.onload = () => setCkReady(true);
    document.head.appendChild(script);
  }, []);

  // Init / destroy CKEditor when modal opens or closes
  useEffect(() => {
    if (!showModal) {
      // Destroy instance when modal closes
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy().catch(() => {});
        editorInstanceRef.current = null;
      }
      return;
    }
    if (!ckReady || !editorContainerRef.current) return;

    // Destroy any previous instance before creating a new one
    const prev = editorInstanceRef.current;
    const initEditor = (initialData: string) => {
      (window as any).ClassicEditor
        .create(editorContainerRef.current, {
          toolbar: [
            'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
            'link', 'blockQuote', 'insertTable', '|',
            'bulletedList', 'numberedList', '|',
            'outdent', 'indent', '|',
            'imageUpload', 'mediaEmbed', '|',
            'undo', 'redo'
          ],
          initialData,
        })
        .then((editor: any) => {
          editorInstanceRef.current = editor;
          // Sync CKEditor content back to form state on change
          editor.model.document.on('change:data', () => {
            const html = editor.getData();
            setForm(prev => ({ ...prev, content: html }));
          });
        })
        .catch(console.error);
    };

    if (prev) {
      prev.destroy().then(() => { editorInstanceRef.current = null; initEditor(form.content); }).catch(() => {});
    } else {
      // Small delay to ensure the modal DOM is mounted
      setTimeout(() => initEditor(form.content), 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, ckReady]);

  const fetchPosts = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.blogs || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => { fetchPosts(currentPage); }, [currentPage]);

  const filtered = search
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.toLowerCase().includes(search.toLowerCase()) ||
        p.categories.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  const totalPages = Math.ceil(total / limit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setMessage('');
    setShowModal(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setForm({ ...post });
    setIsEditing(true);
    setMessage('');
    setShowModal(true);
  };

  const handleOpenView = (post: BlogPost) => {
    setViewPost(post);
    setShowView(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) setForm(prev => ({ ...prev, featuredImage: data.url }));
    } catch {}
    finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchPosts(currentPage);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Saved successfully!');
        setTimeout(() => { setShowModal(false); fetchPosts(currentPage); }, 800);
      } else {
        setMessage(data.error || 'Failed to save.');
      }
    } catch { setMessage('Network error.'); }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark)' }}>Blog Posts</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {total} posts imported from WordPress
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => fetchPosts(currentPage)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleOpenAdd} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
            <Plus size={16} /> Add Post
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search title, tags, categories, author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading blog posts...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          {search ? 'No posts match your search.' : (
            <div>
              <p style={{ marginBottom: '12px' }}>No blog posts found.</p>
              <code style={{ backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>
                npm run import:blogs
              </code>
              <p style={{ marginTop: '8px', fontSize: '13px' }}>Run the above in your terminal to import from WordPress.</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Blog post cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map(p => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Featured image thumbnail */}
                {p.featuredImage ? (
                  <img src={p.featuredImage} alt={p.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                ) : (
                  <div style={{ width: '80px', height: '60px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '11px' }}>
                    No image
                  </div>
                )}

                {/* Meta */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.excerpt}</div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {p.author && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                        <User size={12} /> {p.author}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                      <Calendar size={12} /> {formatDate(p.publishedAt)}
                    </span>
                    {p.categories && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                        <Tag size={12} /> {p.categories.split(',')[0]}
                      </span>
                    )}
                    {p.tags && (
                      <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '1px 8px', borderRadius: '10px' }}>
                        {p.tags.split(',').slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleOpenView(p)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }} title="Preview content">
                    <ExternalLink size={16} />
                  </button>
                  <button onClick={() => handleOpenEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '6px' }} title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Page {currentPage} of {totalPages} ({total} posts)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Content preview modal */}
      {showView && viewPost && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '820px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{viewPost.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {formatDate(viewPost.publishedAt)} · {viewPost.author}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {viewPost.canonicalUrl && (
                  <a href={viewPost.canonicalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ExternalLink size={13} /> Open Live
                  </a>
                )}
                <button onClick={() => setShowView(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
            </div>
            {viewPost.featuredImage && (
              <img src={viewPost.featuredImage} alt={viewPost.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div dangerouslySetInnerHTML={{ __html: viewPost.content }} style={{ lineHeight: 1.8, fontSize: '14px', color: 'var(--dark)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '720px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{isEditing ? 'Edit Blog Post' : 'Add Blog Post'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Title</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} className="form-control" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Slug</label>
                  <input type="text" name="slug" value={form.slug} onChange={handleChange} className="form-control" placeholder="my-blog-post" />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="form-control">
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Excerpt</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} className="form-control" rows={2} style={{ resize: 'vertical' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Content</label>
                {/* CKEditor 5 container — editor is mounted here via CDN */}
                <div
                  ref={editorContainerRef}
                  style={{ border: '1px solid var(--border)', borderRadius: '8px', minHeight: '300px', overflow: 'hidden' }}
                />
                {!ckReady && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>Loading editor...</div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Featured Image</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" name="featuredImage" value={form.featuredImage} onChange={handleChange} className="form-control" placeholder="URL" style={{ flexGrow: 1 }} />
                  <label className="btn btn-secondary" style={{ padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', height: '42px', fontSize: '12px' }}>
                    <Upload size={13} /> Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                {form.featuredImage && <img src={form.featuredImage} alt="" style={{ marginTop: '8px', height: '70px', borderRadius: '6px', border: '1px solid var(--border)', objectFit: 'cover' }} />}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Categories <span style={{ color: '#94a3b8', fontWeight: 400 }}>(comma separated)</span></label>
                  <input type="text" name="categories" value={form.categories} onChange={handleChange} className="form-control" placeholder="Gardening, Plants" />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Tags <span style={{ color: '#94a3b8', fontWeight: 400 }}>(comma separated)</span></label>
                  <input type="text" name="tags" value={form.tags} onChange={handleChange} className="form-control" placeholder="led, grow tent" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Author</label>
                  <input type="text" name="author" value={form.author} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Publish Date</label>
                  <input type="datetime-local" name="publishedAt" value={form.publishedAt?.slice(0, 16) ?? ''} onChange={handleChange} className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Canonical URL</label>
                <input type="text" name="canonicalUrl" value={form.canonicalUrl} onChange={handleChange} className="form-control" placeholder="https://baytonhorticulturecentre.co.uk/blog/..." />
              </div>

              {message && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.includes('success') ? '#ecfdf5' : '#fef2f2', color: message.includes('success') ? '#047857' : '#b91c1c', fontWeight: 600, fontSize: '13px' }}>
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                <button type="submit" className="btn" style={{ padding: '10px 20px' }} disabled={uploading}>
                  {isEditing ? 'Update Post' : 'Save Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
