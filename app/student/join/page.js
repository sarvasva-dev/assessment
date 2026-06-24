'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Student Join Page (2-Step Wizard)
 * Step 1: Verify Join Code
 * Step 2: Fill Dynamic Form fields & Branding
 */
function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Step tracking (1: Code Entry, 2: Details Entry)
  const [step, setStep] = useState(1);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
    }
  }, [searchParams]);
  
  // Dynamic form state
  const [formData, setFormData] = useState({});
  const [testData, setTestData] = useState(null);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Verify Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanJoinCode = joinCode.trim().toUpperCase();
      const response = await fetch(`/api/test/${cleanJoinCode}/verify`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid Join Code');
      }

      if (localStorage.getItem(`submitted_${cleanJoinCode}`)) {
        throw new Error("You have already submitted this test. You cannot take it again.");
      }

      setTestData(data.test);
      
      // Initialize dynamic form data state
      const initialForm = {};
      if (data.test.studentFormFields && data.test.studentFormFields.length > 0) {
        data.test.studentFormFields.forEach(field => {
          initialForm[field.name] = '';
        });
      } else {
        // Fallback to default fields if older test
        initialForm['name'] = '';
        initialForm['rollNumber'] = '';
        initialForm['section'] = '';
      }
      setFormData(initialForm);
      setStep(2);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Dynamic Field Changes
  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Step 2: Start Test
  const handleStartTest = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Save dynamic data to session
    localStorage.setItem('studentSession', JSON.stringify({
      studentDetails: formData, // Naya dynamic map store kiya
      // Puraani legacy fields bhi bhar dete hain taaki backend crash na ho backward compatibility ke liye
      name: formData.name || 'Student',
      rollNumber: formData.rollNumber || '000',
      section: formData.section || 'A',
      joinCode: testData.joinCode,
      testId: testData._id
    }));

    router.push(`/student/test/${testData.joinCode}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '40px', borderRadius: '16px' }}>
        
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎓</div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>Access Assessment</h1>
              <p style={{ color: '#64748b', marginTop: '8px' }}>Provide your secure authorization code.</p>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <input 
                  type="text" 
                  required 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter Code (e.g. A7X9P2)"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '2px solid #3b82f6', outline: 'none', background: '#eff6ff', letterSpacing: '2px', fontWeight: 'bold', textTransform: 'uppercase', boxSizing: 'border-box', textAlign: 'center', fontSize: '20px' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || joinCode.trim().length < 3}
                style={{ background: '#4f46e5', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'background 0.2s' }}
              >
                {loading ? 'Verifying...' : 'Authenticate ➡️'}
              </button>
            </form>
          </>
        )}

        {step === 2 && testData && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              {testData.universityLogo ? (
                <img src={testData.universityLogo} alt={testData.universityName} style={{ maxHeight: '60px', marginBottom: '15px', borderRadius: '8px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏛️</div>
              )}
              <p style={{ color: '#64748b', margin: '0 0 5px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                {testData.universityName}
              </p>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>{testData.title}</h1>
              <p style={{ color: '#4f46e5', marginTop: '8px', fontWeight: '500' }}>Duration: {testData.duration} mins</p>
            </div>

            <form onSubmit={handleStartTest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {testData.studentFormFields && testData.studentFormFields.length > 0 ? (
                testData.studentFormFields.map((field, idx) => (
                  <div key={idx}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <input 
                      type={field.type || 'text'} 
                      required={field.required}
                      value={formData[field.name] || ''} 
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>
                ))
              ) : (
                <>
                  {/* Fallback for old tests without dynamic fields */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Name *</label>
                    <input type="text" required value={formData['name'] || ''} onChange={(e) => handleFieldChange('name', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Roll Number *</label>
                    <input type="text" required value={formData['rollNumber'] || ''} onChange={(e) => handleFieldChange('rollNumber', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Section *</label>
                    <input type="text" required value={formData['section'] || ''} onChange={(e) => handleFieldChange('section', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                disabled={loading}
                style={{ background: '#4f46e5', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '15px', transition: 'background 0.2s', width: '100%' }}
              >
                {loading ? 'Preparing Environment...' : 'Commence Assessment 🚀'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '10px', cursor: 'pointer', fontSize: '14px', marginTop: '5px' }}
              >
                ← Back to Code Entry
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudentJoinPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>Loading...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
