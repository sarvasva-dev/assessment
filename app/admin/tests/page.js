'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Admin Tests List Page
 * Yeh page '/admin/tests' par render hoga jahan admin apne banaye hue saare tests dekh payega.
 */
export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom toast notification ke liye state (native alert ki jagah)
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLinkCode, setCopiedLinkCode] = useState(null);

  // Component load hone par data fetch karenge
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/admin/tests');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load tests.');
        }

        setTests(data.tests);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Join Code copy karne ka function (Bina native alert ke)
  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    // 2 second baad copied status hata denge
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyJoinLink = (code) => {
    const link = `${window.location.origin}/student/join?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLinkCode(code);
    setTimeout(() => setCopiedLinkCode(null), 2000);
  };

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 'bold' }}>
            📚 My Tests
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            A comprehensive list of all examinations you have created and published.
          </p>
        </div>
        <Link href="/admin/create-test" style={{ textDecoration: 'none' }}>
          <button className="btn btn-dark">
            ➕ Create New Test
          </button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Loading tests... ⏳
        </div>
      ) : tests.length === 0 ? (
        // Empty State
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0' }}>No Tests Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You have not created any examinations yet.
          </p>
          <Link href="/admin/create-test" style={{ textDecoration: 'none' }}>
            <button className="btn btn-dark">Create Your First Test</button>
          </Link>
        </div>
      ) : (
        // Tests List (Responsive Cards)
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tests.map((test) => (
            <div key={test._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', flexWrap: 'wrap', gap: '15px', border: '1px solid rgba(255,255,255,0.5)' }}>
              
              {/* Test Info */}
              <div style={{ flex: '1 1 250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{test.title}</h4>
                  <span style={{ 
                    padding: '4px 10px', 
                    background: test.status === 'published' ? '#ecfdf5' : '#fef2f2', 
                    color: test.status === 'published' ? '#10b981' : '#ef4444', 
                    borderRadius: '999px', 
                    fontSize: '11px', 
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {test.status}
                  </span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {test.subject} • {test.duration} mins
                </p>
                
                {/* Join Code Display */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>CODE:</span>
                  <strong style={{ letterSpacing: '1px', fontSize: '15px', color: '#0f172a' }}>{test.joinCode}</strong>
                  <button 
                    onClick={() => copyJoinCode(test.joinCode)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#4f46e5', padding: '0 4px' }}
                    title="Copy Code"
                  >
                    {copiedCode === test.joinCode ? '✅' : '📋'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link 
                  href={`/admin/tests/${test._id}/edit`}
                  className="btn btn-dark"
                  style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: '#fff', border: 'none' }}
                >
                  Edit ✏️
                </Link>
                <a 
                  href={`/api/admin/export-results?testId=${test._id}`}
                  download
                  className="btn btn-dark"
                  style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  title="Download Student Submissions as CSV"
                >
                  Export 📊
                </a>
                <button 
                  onClick={() => copyJoinLink(test.joinCode)}
                  className="btn btn-light"
                  style={{ padding: '8px 16px', fontSize: '13px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', color: '#0f172a' }}
                  title="Copy Direct Join Link"
                >
                  {copiedLinkCode === test.joinCode ? 'Copied! ✅' : 'Copy Link 🔗'}
                </button>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Hi students! Join my new test *${test.title}* on TestPlatform.\n\nJoin Code: *${test.joinCode}*\nDirect Link: http://localhost:3000/student/join?code=${test.joinCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-light"
                  style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Share 📱
                </a>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
