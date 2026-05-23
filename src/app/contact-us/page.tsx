'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSubmitted(true);
      if (data.adminMail && data.adminMail.previewUrl) {
        setPreviewUrl(data.adminMail.previewUrl);
      }
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <h1 className="section-title" style={{ marginTop: 0 }}>Contact Us</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', marginTop: '30px' }}>
        
        {/* Contact Info Card */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--dark)' }}>Bayton Horticulture Superstore</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Superstore Address</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Bayton Horticulture Centre,<br />
                  Bayton Road Industrial Estate,<br />
                  Coventry, West Midlands, CV7 9EL
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Phone Number</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  024 7600 0000<br />
                  <span style={{ fontSize: '12px' }}>Call us for stock checks and expert advice</span>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Email Support</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  sales@baytonhorticulture.co.uk<br />
                  support@baytonhorticulture.co.uk
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
                <Clock size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '15px' }}>Business Hours</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 5:00 PM<br />
                  Sunday: 10:00 AM - 4:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--dark)' }}>Send Us a Message</h2>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <CheckCircle size={54} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Inquiry Submitted!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Thank you. One of our horticulture specialists will email you shortly.</p>
              
              {previewUrl && (
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--primary-glow)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)', textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', margin: 0, fontWeight: 600, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🛠️</span> Development Preview Link:
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>
                    SMTP is configured to use a test account in dev mode. Click below to inspect your email:
                  </p>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: '13px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline' }}>
                    View Sent Email in Ethereal Mailer &rarr;
                  </a>
                </div>
              )}

              <button onClick={() => { setSubmitted(false); setPreviewUrl(null); }} className="btn" style={{ marginTop: '24px', padding: '8px 16px', fontSize: '13px' }}>
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div style={{ padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="form-control" 
                  disabled={loading}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="form-control" 
                  disabled={loading}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)} 
                  className="form-control" 
                  disabled={loading}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Message Details</label>
                <textarea 
                  rows={4} 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  className="form-control" 
                  disabled={loading}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
                style={{ justifyContent: 'center', height: '44px', marginTop: '10px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send size={16} style={{ marginRight: '6px' }} /> Send Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Google Map Section */}
      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Find Us on Google Maps</h3>
        <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <iframe 
            src="https://maps.google.com/maps?q=Bayton%20Horticulture%20Centre,%20Bayton%20Road,%20Coventry,%20CV7%209EL&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
