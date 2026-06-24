'use client';
import React, { useEffect } from 'react';

export default function StudentSuccessPage() {
  
  useEffect(() => {
    // Clear student session so they can't go back or do anything else
    localStorage.removeItem('studentSession');
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a', padding: '20px' }}>
      <div style={{ background: '#1e293b', padding: '50px', borderRadius: '16px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ margin: '0 0 15px 0', color: '#10b981', fontSize: '2rem' }}>Test Submitted Successfully!</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
          Your examination has been successfully recorded and securely transmitted to the administration.
        </p>
        <div style={{ padding: '15px', background: '#0f172a', borderRadius: '8px', color: '#38bdf8', fontWeight: 'bold' }}>
          Results will be formally announced by your institution.
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '30px' }}>
          You may now safely close this window.
        </p>
      </div>
    </div>
  );
}
