// React components import kar rahe hain
import React from 'react';
import Link from 'next/link';

/**
 * AdminLayout Component
 * Yeh layout sirf '/admin' se start hone wale routes ke liye hai.
 * Isme ek fixed Sidebar aur main content area hoga.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      
      {/* Sidebar - Glassmorphism effect ke saath */}
      <aside className="admin-sidebar">
        
        {/* Brand Logo / Title */}
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '3rem', fontStyle: 'italic' }}>
          TestPlatform <span style={{ color: 'var(--accent-color)', fontSize: '14px', fontStyle: 'normal' }}>ADMIN</span>
        </div>

        {/* Navigation Links */}
        <nav className="admin-sidebar-nav">
          
          <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.6)', color: 'var(--text-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              📊 Dashboard
            </div>
          </Link>

          <Link href="/admin/create-test" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'background 0.2s' }}>
              ➕ Create Assessment
            </div>
          </Link>

          <Link href="/admin/tests" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
              📚 Manage Assessments
            </div>
          </Link>

          <Link href="/admin/students" style={{ textDecoration: 'none' }}>
            <div style={{ padding: '12px 16px', borderRadius: '12px', color: 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
              👨‍🎓 Candidate Profiles
            </div>
          </Link>

        </nav>

        {/* Logout section at bottom (Mock for now until Clerk is ready) */}
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderRadius: '12px', color: '#ef4444', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          🚪 Logout
        </div>

      </aside>

      {/* Main Content Area jahan children render honge */}
      <main className="admin-main">
        {children}
      </main>

    </div>
  );
}
