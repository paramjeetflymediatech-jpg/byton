"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, Shield, ShieldAlert, Trash2, Search, UserCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    
    // Prevent self-demotion
    if (user.email === session?.user?.email) {
      alert('Security Protection: You cannot change your own role.');
      return;
    }

    if (!confirm(`Are you sure you want to change role of ${user.email} to ${newRole}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, email: user.email, role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to update user role.');
      }
    } catch (err) {
      alert('Network error updating user.');
    }
  };

  const handleDelete = async (user: any) => {
    // Prevent self-deletion
    if (user.email === session?.user?.email) {
      alert('Security Protection: You cannot delete your own account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${user.email}? This action is irreversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Network error deleting user.');
    }
  };

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--dark)' }}>Users Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>View registered portal accounts and configure administrator access levels.</p>
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}>
          <RefreshCw size={16} /> Refresh Directory
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search user profiles by email address or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '40px', height: '44px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users list...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          {search ? 'No users matched your search criteria.' : 'No users registered in the system yet.'}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Email Address</th>
                <th>Role Status</th>
                <th>Joined Date</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: u.role === 'ADMIN' ? 'rgba(94, 180, 70, 0.15)' : '#f1f5f9',
                        color: u.role === 'ADMIN' ? '#5EB446' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}>
                        {u.email[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--dark)' }}>
                        {u.email}
                        {u.email === session?.user?.email && (
                          <span style={{ fontSize: '11px', color: 'var(--primary)', marginLeft: '6px', fontWeight: 700 }}>(You)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    {u.role === 'ADMIN' ? (
                      <span className="badge-status badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} /> Administrator
                      </span>
                    ) : (
                      <span className="badge-status badge-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                        <UserCheck size={12} /> Portal User
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          borderRadius: '6px',
                          borderColor: u.role === 'ADMIN' ? '#cbd5e1' : 'var(--primary)',
                          color: u.role === 'ADMIN' ? '#334155' : 'var(--primary)'
                        }}
                        disabled={u.email === session?.user?.email}
                      >
                        {u.role === 'ADMIN' ? (
                          <>
                            <ShieldAlert size={12} /> Revoke Admin
                          </>
                        ) : (
                          <>
                            <Shield size={12} /> Promote Admin
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(u)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: u.email === session?.user?.email ? '#cbd5e1' : '#ef4444',
                          cursor: u.email === session?.user?.email ? 'not-allowed' : 'pointer',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        disabled={u.email === session?.user?.email}
                        title="Delete User"
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
      )}
    </div>
  );
}
