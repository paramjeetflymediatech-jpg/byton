'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, TrendingUp } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
      } else {
        // Automatically redirect to login after successful registration
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#f8f9fa'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        minHeight: '550px'
      }}>
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div style={{
          flex: '1',
          background: 'linear-gradient(135deg, #1b3a1a 0%, #0c1b0a 100%)',
          color: 'white',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Decorative shapes */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%235eb446\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.5, zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px', color: '#5EB446' }}>
              Bayton Horticulture
            </h2>
            <p style={{ fontSize: '16px', color: '#c5d9c2', marginBottom: '40px', lineHeight: 1.6 }}>
              Join the platform to manage your store efficiently. Setup your account to access the powerful dashboard.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(94, 180, 70, 0.2)', padding: '10px', borderRadius: '10px', color: '#5EB446' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Grow Sales</h4>
                  <p style={{ fontSize: '13px', color: '#c5d9c2' }}>Advanced tools to track performance.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(94, 180, 70, 0.2)', padding: '10px', borderRadius: '10px', color: '#5EB446' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Secure Platform</h4>
                  <p style={{ fontSize: '13px', color: '#c5d9c2' }}>Enterprise-grade security for your store data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div style={{
          flex: '1',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#090a0c', marginBottom: '8px' }}>
                Create Account
              </h1>
              <p style={{ color: '#6c757d', fontSize: '15px' }}>
                Fill in the details below to register
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#1d1e20', fontSize: '14px', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#090a0c',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#5EB446';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(94, 180, 70, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#1d1e20', fontSize: '14px', fontWeight: 600 }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#090a0c',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#5EB446';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(94, 180, 70, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#1d1e20', fontSize: '14px', fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    color: '#090a0c',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#5EB446';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 4px rgba(94, 180, 70, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#4ea236' : '#5EB446',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#4ea236' }}
                onMouseOut={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#5EB446' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Creating account...
                  </>
                ) : 'Register'}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6c757d' }}>
              Already have an account?{' '}
              <a 
                href="/login" 
                style={{ 
                  color: '#5EB446', 
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#4ea236'}
                onMouseOut={(e) => e.currentTarget.style.color = '#5EB446'}
              >
                Sign in here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
