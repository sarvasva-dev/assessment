'use client';
import React, { useState } from 'react';

export default function StudentResultPortal() {
  const [credentials, setCredentials] = useState({ joinCode: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  const fetchResult = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      const response = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch result');
      }

      setResultData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (resultData) {
    const { submission, test, detailedAnswers } = resultData;
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        <button onClick={() => setResultData(null)} style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0, fontWeight: '600', marginBottom: '20px' }}>
          ← Back to Search
        </button>

        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '30px' }}>
          {test.universityLogo ? (
            <img src={test.universityLogo} alt="Logo" style={{ maxHeight: '80px', marginBottom: '15px', borderRadius: '8px' }} />
          ) : (
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎓</div>
          )}
          <h1 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>{test.title}</h1>
          <p style={{ color: '#64748b', margin: '0 0 20px 0', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>{test.universityName}</p>
          
          <div style={{ background: '#f8fafc', display: 'inline-block', padding: '20px 40px', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Cumulative Score</span>
            <div style={{ fontSize: '4rem', fontWeight: '800', color: '#4f46e5', lineHeight: '1' }}>{submission.score}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
            <h3 style={{ margin: '0 0 5px 0', color: '#065f46' }}>{submission.correct}</h3>
            <span style={{ color: '#047857', fontSize: '14px', fontWeight: '600' }}>Correct</span>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: '#fef2f2', borderColor: '#fca5a5' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
            <h3 style={{ margin: '0 0 5px 0', color: '#991b1b' }}>{submission.wrong}</h3>
            <span style={{ color: '#b91c1c', fontSize: '14px', fontWeight: '600' }}>Wrong</span>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{submission.unattempted}</h3>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Unattempted</span>
          </div>
        </div>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Comprehensive Analysis</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {detailedAnswers.map((item, idx) => (
            <div key={item.questionId} className="glass-card" style={{ padding: '25px', borderLeft: item.isAttempted ? (item.isCorrect ? '5px solid #10b981' : '5px solid #ef4444') : '5px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <strong style={{ color: '#64748b' }}>Question {idx + 1}</strong>
                <span style={{ fontWeight: 'bold', color: item.isAttempted ? (item.isCorrect ? '#10b981' : '#ef4444') : '#64748b' }}>
                  {!item.isAttempted ? 'Unattempted' : (item.isCorrect ? `+${item.marks} Marks` : (test.negativeMarking ? `-${(item.marks/3).toFixed(2)} Marks` : '0 Marks'))}
                </span>
              </div>
              
              <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.5' }}>
                {item.questionText}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const isStudentChoice = item.studentAnswer === opt;
                  const isCorrectChoice = item.correctAnswer === opt;
                  
                  let bgColor = '#f8fafc';
                  let borderColor = '#e2e8f0';
                  let textColor = '#475569';

                  if (isCorrectChoice) {
                    bgColor = '#ecfdf5';
                    borderColor = '#10b981';
                    textColor = '#065f46';
                  } else if (isStudentChoice && !isCorrectChoice) {
                    bgColor = '#fef2f2';
                    borderColor = '#ef4444';
                    textColor = '#991b1b';
                  }

                  return (
                    <div key={opt} style={{ padding: '12px 15px', borderRadius: '8px', border: `2px solid ${borderColor}`, background: bgColor, color: textColor, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ minWidth: '20px' }}>{opt}.</strong>
                      <span style={{ flex: 1 }}>{item.options[opt]}</span>
                      {isCorrectChoice && <span title="Correct Answer">✅</span>}
                      {isStudentChoice && !isCorrectChoice && <span title="Your Choice">❌</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // Search Form
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>Evaluation Portal</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Provide credentials to access your performance report</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={fetchResult} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Test Join Code</label>
            <input 
              type="text" 
              required 
              value={credentials.joinCode} 
              onChange={(e) => setCredentials({...credentials, joinCode: e.target.value})}
              placeholder="e.g. A7X9P2"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '2px solid #3b82f6', outline: 'none', background: '#eff6ff', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name</label>
            <input 
              type="text" 
              required 
              value={credentials.name} 
              onChange={(e) => setCredentials({...credentials, name: e.target.value})}
              placeholder="Exact name used during test"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#4f46e5', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background 0.2s' }}
          >
            {loading ? 'Retrieving...' : 'Retrieve Report ➡️'}
          </button>
        </form>
      </div>
    </div>
  );
}
