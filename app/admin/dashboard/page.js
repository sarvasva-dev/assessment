'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard data');
        }
        
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            System Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Real-time telemetry and assessment overview.</p>
        </div>
        
        {/* Profile Avatar */}
        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
          {user?.firstName ? user.firstName[0].toUpperCase() : 'A'}
        </div>
      </header>

      {error ? (
        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '2rem' }}>
          Error loading dashboard: {error}
        </div>
      ) : loading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Retrieving system telemetry...
        </div>
      ) : (
        <>
          {/* Stats Cards Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👨‍🎓</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Total Submissions</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {stats.totalSubmissions}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Active Assessments</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {stats.activeTestsCount}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Pending Evaluations</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {stats.pendingResultsCount}
              </p>
            </div>
            
          </div>

          {/* Analytics Section */}
          {stats.analytics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>Pass vs Fail Ratio</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.analytics.passFail} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {stats.analytics.passFail.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Passed' ? '#10b981' : '#ef4444'} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>Score Distribution</h3>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.analytics.distribution}>
                      <XAxis dataKey="range" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                      <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Recent Tests Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Recent Assessments</h2>
              <Link href="/admin/tests" style={{ color: 'var(--text-secondary)', fontWeight: '600', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>
            
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {stats.recentTests?.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                  No tests created yet.
                </div>
              ) : (
                stats.recentTests.map((test) => (
                  <div key={test._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{test.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {test.subject} • {test.duration} mins • Join Code: <strong>{test.joinCode}</strong>
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: test.status === 'published' ? '#ecfdf5' : '#fef2f2', 
                        color: test.status === 'published' ? '#10b981' : '#ef4444', 
                        borderRadius: '999px', 
                        fontSize: '0.85rem', 
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}
