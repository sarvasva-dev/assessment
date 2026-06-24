'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StudentTestEnvironment() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code;

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sync answers to sessionStorage
  const [answers, setAnswers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('testAnswers');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  
  // Timer calculation
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTime, setEndTime] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(sessionStorage.getItem('testEndTime'), 10) || null;
    }
    return null;
  });
  
  // Warning counter synced to sessionStorage so refresh doesn't bypass it
  const [warnings, setWarnings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('testWarnings');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Anti-Cheat Warning Modal State
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [customToast, setCustomToast] = useState(null);
  
  // Proctoring logs synced to sessionStorage
  const [proctoringLogs, setProctoringLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('testLogs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Sync answers and warnings to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('testWarnings', warnings.toString());
      sessionStorage.setItem('testLogs', JSON.stringify(proctoringLogs));
      sessionStorage.setItem('testAnswers', JSON.stringify(answers));
      if (endTime) sessionStorage.setItem('testEndTime', endTime.toString());
    }
  }, [warnings, proctoringLogs, answers, endTime]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/test/${code}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error);
        }

        setTest(data.test);
        setQuestions(data.questions);

        // Calculate time based on absolute end time
        const durationSec = data.test.duration * 60;
        if (!endTime) {
           const newEndTime = Date.now() + durationSec * 1000;
           setEndTime(newEndTime);
           setTimeLeft(durationSec);
        } else {
           const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
           setTimeLeft(remaining);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchTest();
  }, [code]);

  // Anti-Cheat: Visibility Change (Tab Switch)
  useEffect(() => {
    if (!started || submitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctoringLogs(prev => [...prev, { action: 'Switched Tab / Lost Focus', timestamp: new Date() }]);
        setWarnings(w => {
          const newWarnings = w + 1;
          if (newWarnings >= 3) {
            submitTest('Anti-cheat limit exceeded. You switched tabs too many times.');
          } else {
            setShowWarningModal(true);
          }
          return newWarnings;
        });
      } else {
        setProctoringLogs(prev => [...prev, { action: 'Returned to Test', timestamp: new Date() }]);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [started, submitting]);

  // Timer Countdown
  useEffect(() => {
    if (!started || timeLeft <= 0 || submitting) return;
    const timerId = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timerId);
  }, [started, endTime, submitting]);

  // Auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0 && started && !submitting) {
      submitTest('Time is up!');
    }
  }, [timeLeft, started, submitting]);

  const submitTest = (reason = null) => {
    if (!reason) {
      setShowSubmitConfirm(true);
      return;
    }
    executeSubmit(reason);
  };

  const executeSubmit = async (reason = null) => {
    setShowSubmitConfirm(false);

    setSubmitting(true);
    
    // Retrieve student session details from LocalStorage
    const sessionStr = localStorage.getItem('studentSession');
    if (!sessionStr) {
      setError('Session expired or invalid. Please join again.');
      setSubmitting(false);
      return;
    }
    const studentSession = JSON.parse(sessionStr);

    try {
      const response = await fetch('/api/submit-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentDetails: {
            studentDetailsMap: studentSession.studentDetails || {},
            name: studentSession.name,
            rollNumber: studentSession.rollNumber,
            section: studentSession.section
          },
          testId: test._id,
          answers,
          warnings,
          proctoringLogs,
          isAutoSubmitted: !!reason
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Mark this test as submitted in local storage so they can't re-enter
      localStorage.setItem(`submitted_${code.toUpperCase()}`, 'true');

      setCustomToast(reason ? `Test auto-submitted: ${reason}` : 'Test submitted successfully! Redirecting...');
      setTimeout(() => {
        router.push('/student/success'); // Redirect to success page where score is NOT shown
      }, 3000);
    } catch (err) {
      // Custom toast for error
      setCustomToast('Error submitting test: ' + err.message);
      setSubmitting(false);
    }
  };

  const startTest = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(e => console.log('Fullscreen failed:', e));
    }
    setStarted(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}><h2>Loading Test... ⏳</h2></div>;
  if (error) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#ff4d4f' }}><h2>{error}</h2></div>;
  if (!test) return null;

  if (!started) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#f8fafc', padding: '20px' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <h1 style={{ marginBottom: '10px', color: '#38bdf8' }}>{test.title}</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Subject: {test.subject}</p>
          
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '8px', marginBottom: '30px', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, color: '#f8fafc' }}>Examination Instructions:</h3>
            <ul style={{ color: '#cbd5e1', paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Total Duration: <strong>{test.duration} minutes</strong></li>
              <li>Total Questions: <strong>{questions.length}</strong></li>
              <li>Negative Marking: <strong>{test.negativeMarking ? 'Applicable (-1/3)' : 'Not Applicable'}</strong></li>
              <li style={{ color: '#fbbf24' }}><strong>Proctoring Active:</strong> Do not navigate away from this window or exit fullscreen mode. The examination will automatically submit after 3 violations.</li>
            </ul>
          </div>

          <button onClick={startTest} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}>
            Begin Examination
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Custom Toast for Submission */}
      {customToast && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '16px 32px', borderRadius: '8px', fontWeight: 'bold', zIndex: 10000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          {customToast}
        </div>
      )}

      {/* Warning Modal (Anti-Cheat) */}
      {showWarningModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>⚠️</div>
            <h2 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>Violation Warning {warnings}/3</h2>
            <p style={{ color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>You have navigated away from the active examination window. Further violations will result in automatic submission of your examination.</p>
            <button onClick={() => setShowWarningModal(false)} style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>Acknowledge</button>
          </div>
        </div>
      )}

      {/* Custom Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>❓</div>
            <h2 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>Confirm Submission</h2>
            <p style={{ color: '#475569', marginBottom: '25px', lineHeight: '1.5' }}>Are you sure you want to submit the test? You cannot undo this action.</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ background: '#e2e8f0', color: '#475569', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: 'background 0.2s' }}>Cancel</button>
              <button onClick={() => executeSubmit(null)} style={{ background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: 'background 0.2s' }}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Timer */}
      <header style={{ background: '#1e293b', color: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{test.title}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#0f172a', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', color: timeLeft < 300 ? '#ef4444' : '#38bdf8', letterSpacing: '1px' }}>
            ⏳ {formatTime(timeLeft)}
          </div>
          <button onClick={() => submitTest()} disabled={submitting} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="test-layout">
        
        {/* Question Panel */}
        <div style={{ flex: 1, background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          {currentQ ? (
            <>
              <div style={{ marginBottom: '40px' }}>
                <span style={{ color: '#64748b', fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Question {currentIndex + 1} of {questions.length}</span>
                <h3 style={{ fontSize: '1.6rem', color: '#0f172a', marginTop: '15px', lineHeight: '1.6' }}>
                  {currentQ.question}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <label 
                    key={opt} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '18px 24px', 
                      border: `2px solid ${answers[currentQ._id] === opt ? '#3b82f6' : '#e2e8f0'}`, 
                      borderRadius: '12px', 
                      cursor: 'pointer', 
                      background: answers[currentQ._id] === opt ? '#eff6ff' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`q-${currentQ._id}`} 
                      checked={answers[currentQ._id] === opt}
                      onChange={() => handleOptionSelect(currentQ._id, opt)}
                      style={{ width: '22px', height: '22px', marginRight: '20px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '1.15rem', color: '#334155' }}>
                      <strong style={{ marginRight: '12px', color: '#0f172a' }}>{opt}.</strong> {currentQ[`option${opt}`]}
                    </span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', borderTop: '2px solid #f1f5f9', paddingTop: '30px' }}>
                <button 
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  style={{ padding: '14px 28px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: currentIndex === 0 ? '#94a3b8' : '#475569', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                >
                  ⬅️ Previous
                </button>
                <button 
                  onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                  style={{ padding: '14px 28px', borderRadius: '8px', border: 'none', background: currentIndex === questions.length - 1 ? '#cbd5e1' : '#4f46e5', color: '#fff', cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: currentIndex === questions.length - 1 ? 'none' : '0 4px 6px -1px rgba(79, 70, 229, 0.3)' }}
                >
                  Next ➡️
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>No questions available in this test.</div>
          )}
        </div>

        {/* Navigation Sidebar (Question Palette) */}
        <div className="test-sidebar">
          <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', textAlign: 'center', fontSize: '1.2rem' }}>Question Palette</h3>
          <div className="palette-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q._id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: '45px',
                    borderRadius: '8px',
                    border: isCurrent ? '2px solid #0f172a' : '1px solid transparent',
                    background: isAnswered ? '#10b981' : '#f1f5f9',
                    color: isAnswered ? '#fff' : '#475569',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    fontSize: '1rem'
                  }}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '15px', color: '#64748b', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: '#10b981', borderRadius: '4px' }}></div> <strong>Answered</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #cbd5e1' }}></div> <strong>Not Answered</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '4px', border: '2px solid #0f172a' }}></div> <strong>Current</strong></div>
          </div>
        </div>

      </div>
    </div>
  );
}
