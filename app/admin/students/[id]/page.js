'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDetailedScorecard() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetailedData = async () => {
      try {
        const response = await fetch(`/api/admin/submissions/${id}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch details');
        }
        
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetailedData();
  }, [id]);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Detailed Scorecard... ⏳</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;
  if (!data) return null;

  const { submission, test, detailedAnswers } = data;
  const primaryName = submission.studentName || (submission.studentDetails && submission.studentDetails.name ? submission.studentDetails.name : 'Student');

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0, fontWeight: '600' }}>
          ← Back to Students List
        </button>
      </div>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '2.2rem', color: 'var(--text-primary)' }}>{primaryName}</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Test: <strong style={{ color: 'var(--text-primary)' }}>{test.title}</strong> ({test.joinCode})
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#4f46e5', lineHeight: '1' }}>
            {submission.score}
          </div>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)' }}>Final Score</p>
        </div>
      </header>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
          <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{submission.correct}</h3>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Correct Answers</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
          <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{submission.wrong}</h3>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Wrong Answers</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{submission.unattempted}</h3>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Unattempted</span>
        </div>
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: submission.violations?.flagged ? '#fef2f2' : '#ecfdf5', borderColor: submission.violations?.flagged ? '#fca5a5' : '#a7f3d0' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>{submission.violations?.flagged ? '🚨' : '🛡️'}</div>
          <h3 style={{ margin: '0 0 5px 0', color: submission.violations?.flagged ? '#ef4444' : '#10b981' }}>
            {submission.violations?.flagged ? 'Flagged' : 'Clean'}
          </h3>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Proctoring Status</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        
        {/* Dynamic Student Information */}
        <div className="glass-card" style={{ padding: '25px' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
            Student Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {submission.studentDetails && Object.keys(submission.studentDetails).length > 0 ? (
              Object.entries(submission.studentDetails).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{v}</strong>
                </div>
              ))
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Roll Number:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{submission.rollNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Section:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{submission.section}</strong>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '5px', marginTop: '10px' }}>
              <span style={{ color: '#64748b' }}>Submitted At:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{new Date(submission.submittedAt).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '5px' }}>
              <span style={{ color: '#64748b' }}>Auto-Submitted:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{submission.isAutoSubmitted ? 'Yes (Timer/Cheat limit)' : 'No (Manual)'}</strong>
            </div>
          </div>
        </div>

        {/* Proctoring Timeline Logs */}
        <div className="glass-card" style={{ padding: '25px', maxHeight: '400px', overflowY: 'auto' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
            Proctoring Logs Timeline
          </h3>
          {submission.violations?.logs && submission.violations.logs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {submission.violations.logs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: '70px', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: log.action.includes('Switched') ? '#fef2f2' : '#f8fafc', borderLeft: log.action.includes('Switched') ? '3px solid #ef4444' : '3px solid #3b82f6', borderRadius: '4px', fontSize: '14px', color: 'var(--text-primary)' }}>
                    {log.action}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#10b981', textAlign: 'center', padding: '20px', fontWeight: 'bold' }}>
              🛡️ No suspicious activity detected.
            </div>
          )}
        </div>
      </div>

      {/* Detailed Q&A Review */}
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Question-by-Question Review</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {detailedAnswers.map((item, idx) => (
          <div key={item.questionId} className="glass-card" style={{ padding: '25px', borderLeft: item.isAttempted ? (item.isCorrect ? '5px solid #10b981' : '5px solid #ef4444') : '5px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <strong style={{ color: '#64748b' }}>Question {idx + 1}</strong>
              <span style={{ fontWeight: 'bold', color: item.isAttempted ? (item.isCorrect ? '#10b981' : '#ef4444') : '#64748b' }}>
                {!item.isAttempted ? 'Unattempted' : (item.isCorrect ? '+1 Marks' : (test.negativeMarking ? '-0.33 Marks' : '0 Marks'))}
              </span>
            </div>
            
            <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.5' }}>
              {item.questionText}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                    {isStudentChoice && !isCorrectChoice && <span title="Student Choice">❌</span>}
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
