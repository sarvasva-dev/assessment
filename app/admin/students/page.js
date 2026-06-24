'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/admin/students');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setStudents(data.submissions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 'bold' }}>
            🎓 Student Results
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Comprehensive performance metrics and submissions for your assigned examinations.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
          Failed to load data: {error}
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
          Retrieving student records... ⏳
        </div>
      ) : students.length === 0 ? (
        // Empty State
        <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>👨‍🎓</div>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0' }}>No Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            There are currently no student submissions for your examinations.
          </p>
        </div>
      ) : (
        // Students List (Responsive Cards)
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {students.map((student) => (
            <Link href={`/admin/students/${student._id}`} key={student._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.2rem', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', flexWrap: 'wrap', gap: '15px', border: '1px solid rgba(255,255,255,0.5)', transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'pointer' }}
                   onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
                   onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                
                {/* Student Info */}
                <div style={{ flex: '1 1 250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{student.studentName}</h4>
                    <span style={{ 
                      padding: '4px 10px', 
                      background: student.status === 'Flagged (Anti-Cheat)' ? '#fef2f2' : '#ecfdf5', 
                      color: student.status === 'Flagged (Anti-Cheat)' ? '#ef4444' : '#10b981', 
                      borderRadius: '999px', 
                      fontSize: '11px', 
                      fontWeight: '700',
                      border: `1px solid ${student.status === 'Flagged (Anti-Cheat)' ? '#fca5a5' : '#a7f3d0'}`
                    }}>
                      {student.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                    {student.studentDetails && Object.keys(student.studentDetails).length > 0 ? (
                      Object.entries(student.studentDetails)
                        .filter(([k]) => k !== 'name')
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <strong style={{ color: 'var(--text-secondary)' }}>{value}</strong>
                          </div>
                        ))
                    ) : (
                      <>
                        <div>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Roll No</span>
                          <strong style={{ color: 'var(--text-secondary)' }}>{student.rollNumber}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Section</span>
                          <strong style={{ color: 'var(--text-secondary)' }}>{student.section}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Test Taken</span>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{student.testTitle}</strong> <span style={{ color: '#94a3b8', fontSize: '12px' }}>({student.testCode})</span>
                  </div>
                </div>

                {/* Score & Date */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: '120px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Score</span>
                    <strong style={{ fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: '1' }}>{student.score}</strong>
                  </div>
                  <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '12px' }}>
                    {new Date(student.date).toLocaleDateString()}<br/>
                    {new Date(student.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
