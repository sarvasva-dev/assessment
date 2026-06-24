'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function EditTestQuestions() {
  const params = useParams();
  const router = useRouter();
  const testId = params?.id;

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/admin/tests/${testId}/questions`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTest(data.test);
        setQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (testId) fetchQuestions();
  }, [testId]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddManual = () => {
    setQuestions([...questions, { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      try {
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (rawJsonData.length === 0) {
          setError('Excel file is empty.');
          return;
        }

        const jsonData = rawJsonData.map(row => {
          const normalizedRow = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '' };
          Object.keys(row).forEach(key => {
            const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (cleanKey.includes('question')) normalizedRow.question = row[key];
            if (cleanKey.includes('optiona')) normalizedRow.optionA = String(row[key]);
            if (cleanKey.includes('optionb')) normalizedRow.optionB = String(row[key]);
            if (cleanKey.includes('optionc')) normalizedRow.optionC = String(row[key]);
            if (cleanKey.includes('optiond')) normalizedRow.optionD = String(row[key]);
            if (cleanKey.includes('correct')) normalizedRow.correctAnswer = String(row[key]).trim().toUpperCase();
          });
          return normalizedRow;
        });

        if (!jsonData[0].question || !jsonData[0].optionA || !jsonData[0].correctAnswer) {
          setError('Invalid Excel format. Expected: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer.');
          return;
        }

        setQuestions(prev => [...prev, ...jsonData]);
        setError(null);
      } catch (err) {
        setError('Error parsing Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>Loading questions... ⏳</div>;
  if (error && !test) return <div style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <Link href="/admin/tests" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', display: 'inline-block' }}>
            ← Back to Tests
          </Link>
          <h2 style={{ color: '#0f172a', margin: 0 }}>Edit Assessment Questions</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>{test?.title} • {test?.subject}</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>{error}</div>}
      {success && <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #a7f3d0' }}>Questions updated successfully!</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, idx) => (
          <div key={q._id || idx} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#0f172a' }}>Question {idx + 1}</strong>
              <button 
                type="button" 
                onClick={() => handleDeleteQuestion(idx)} 
                style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Delete 🗑️
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <textarea 
                value={q.question} 
                onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                placeholder="Question Text"
                required
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Option {opt}</label>
                    <input 
                      type="text" 
                      value={q[`option${opt}`]} 
                      onChange={(e) => handleQuestionChange(idx, `option${opt}`, e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '5px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Correct Answer</label>
                <select 
                  value={q.correctAnswer} 
                  onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                  style={{ width: '100%', maxWidth: '200px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}
                  required
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        
        {questions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
            No questions found for this test.
          </div>
        )}
      </div>

      <div className="glass-card" style={{ marginTop: '30px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>➕ Add More Questions</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={handleAddManual}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Add Question Manually
          </button>
          
          <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#64748b', fontWeight: 'bold' }}>OR Append from Excel:</span>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
            />
          </div>
        </div>
      </div>
      
      {questions.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background 0.2s', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving Changes...' : '💾 Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
