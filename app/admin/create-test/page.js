// React ko import kar rahe hain kyunki ye ek frontend component hai
// Next.js app router mein client-side features use karne ke liye 'use client' likhna zaroori hai
'use client';
import React, { useState } from 'react';
// SheetJS (xlsx) import kar rahe hain taaki excel file ko read karke JSON mein convert kar sakein
import * as XLSX from 'xlsx';

/**
 * CreateTest Component
 * Ye admin dashboard ka page hai jahan naya test create hoga.
 * Yahan test settings aur Excel se questions upload karne ka form hai.
 */
export default function CreateTest() {
  // Test ki base details track karne ke liye state banaya hai
  // Isme title, subject, aur duration include kiye hain
  const [testDetails, setTestDetails] = useState({
    title: '',
    subject: '',
    duration: 60, // Default duration 60 minutes
  });

  // Test ki settings jaise negative marking aur sections ka state
  const [settings, setSettings] = useState({
    negativeMarking: false,
    hasSections: false,
  });

  // University Branding State
  const [branding, setBranding] = useState({ universityName: 'TestPlatform', universityLogo: '' });
  
  // Dynamic Student Form Fields State
  const [studentFormFields, setStudentFormFields] = useState([
    { label: 'Full Name', name: 'name', type: 'text', required: true },
    { label: 'Roll No.', name: 'rollNumber', type: 'text', required: true },
    { label: 'Section', name: 'section', type: 'text', required: true }
  ]);

  const addFormField = () => {
    setStudentFormFields([...studentFormFields, { label: '', name: `field_${Date.now()}`, type: 'text', required: true }]);
  };
  
  const updateFormField = (index, key, value) => {
    const updated = [...studentFormFields];
    updated[index][key] = value;
    setStudentFormFields(updated);
  };

  const removeFormField = (index) => {
    setStudentFormFields(studentFormFields.filter((_, i) => i !== index));
  };

  // Jo questions excel se parse honge unko is array mein store karenge
  const [questions, setQuestions] = useState([]);
  
  // Input method (excel ya manual) ke liye state
  const [inputMethod, setInputMethod] = useState('excel');
  
  // Manual question entry ke liye state
  const [manualQuestion, setManualQuestion] = useState({
    Question: '', OptionA: '', OptionB: '', OptionC: '', OptionD: '', CorrectAnswer: ''
  });

  // Success modal dikhane ke liye state
  const [successData, setSuccessData] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Koi error message dikhana ho uske liye state
  const [error, setError] = useState(null);

  // Download Sample Excel Handler
  const downloadSampleExcel = () => {
    // Sample data banayenge (ek array of object jisme columns honge)
    const sampleData = [{
      Question: 'What is the powerhouse of the cell?',
      OptionA: 'Nucleus',
      OptionB: 'Mitochondria',
      OptionC: 'Ribosome',
      OptionD: 'Endoplasmic Reticulum',
      CorrectAnswer: 'B'
    }];
    // JSON se worksheet banayenge
    const ws = XLSX.utils.json_to_sheet(sampleData);
    // Workbook banayenge
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    // File download karwayenge
    XLSX.writeFile(wb, "Sample_Questions.xlsx");
  };

  // Manual Question input change handler
  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualQuestion(prev => ({ ...prev, [name]: value }));
  };

  // Naya manual question list me add karne ka function
  const addManualQuestion = () => {
    // Basic validation
    if(!manualQuestion.Question || !manualQuestion.OptionA || !manualQuestion.OptionB || !manualQuestion.OptionC || !manualQuestion.OptionD || !manualQuestion.CorrectAnswer) {
      setError("Please sabhi manual fields bharein aur correct answer chunein.");
      return;
    }
    // Add to questions array
    setQuestions(prev => [...prev, manualQuestion]);
    // Reset manual fields and error
    setManualQuestion({ Question: '', OptionA: '', OptionB: '', OptionC: '', OptionD: '', CorrectAnswer: '' });
    setError(null);
  };

  // Jab user input fields mein kuch type karega, ye function chalta hai
  const handleInputChange = (e) => {
    // Input element ka naam (name) aur value nikal rahe hain
    const { name, value } = e.target;
    // testDetails state ko update kar rahe hain, purana state spread karke naya value daal rahe hain
    setTestDetails(prev => ({ ...prev, [name]: value }));
  };

  // Checkbox inputs (settings) ko handle karne ka function
  const handleSettingsChange = (e) => {
    // Checkbox ka naam aur checked status (true/false) nikal rahe hain
    const { name, checked } = e.target;
    // Settings state ko naye checkbox status ke sath update kar rahe hain
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  // Jab admin Excel file upload/select karega tab ye function chalega
  const handleFileUpload = (e) => {
    // Event se pehli select ki hui file le rahe hain
    const file = e.target.files[0];
    
    // Agar koi file select nahi hui toh return (kuch mat karo)
    if (!file) return;

    // FileReader API ka use karke file ko memory mein padhenge
    const reader = new FileReader();

    // Jab file puri padh li jayegi tab onload function trigger hoga
    reader.onload = (evt) => {
      // FileReader ka binary result data variable mein liya
      const data = evt.target.result;
      try {
        // SheetJS ka read function use karke binary data ko workbook object mein parse kar rahe hain
        const workbook = XLSX.read(data, { type: 'binary' });
        // Workbook ki pehli sheet ka naam nikal rahe hain
        const firstSheetName = workbook.SheetNames[0];
        // Pehli sheet ka data le rahe hain
        const worksheet = workbook.Sheets[firstSheetName];
        // Sheet ke data ko JSON format mein convert kar rahe hain (1st row ko header maan kar)
        const rawJsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (rawJsonData.length === 0) {
          setError('Excel file empty hai. Please questions add karein.');
          return;
        }

        // Normalize keys (remove spaces, convert to PascalCase basically)
        const jsonData = rawJsonData.map(row => {
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (cleanKey.includes('question')) normalizedRow.Question = row[key];
            if (cleanKey.includes('optiona')) normalizedRow.OptionA = String(row[key]);
            if (cleanKey.includes('optionb')) normalizedRow.OptionB = String(row[key]);
            if (cleanKey.includes('optionc')) normalizedRow.OptionC = String(row[key]);
            if (cleanKey.includes('optiond')) normalizedRow.OptionD = String(row[key]);
            if (cleanKey.includes('correct')) normalizedRow.CorrectAnswer = String(row[key]).trim().toUpperCase();
          });
          return normalizedRow;
        });

        // Validate first row
        const firstRow = jsonData[0];
        if (!firstRow.Question || !firstRow.OptionA || !firstRow.CorrectAnswer) {
          setError('Excel format galat hai. Columns hone chahiye: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer.');
          return;
        }

        // JSON data ko questions state me save kar rahe hain
        setQuestions(jsonData);
        // Agar koi purana error tha toh clear kar diya
        setError(null);
      } catch (err) {
        // Agar parsing mein koi galti hui, toh error message state me daal diya
        setError('Excel file parse karne me error aaya. Please format check karein.');
        // Console me bhi error log kar diya debugging ke liye
        console.error(err);
      }
    };

    // FileReader ko bol rahe hain ki file ko binary string ke roop mein padho
    reader.readAsBinaryString(file);
  };

  // Form submit (Create Test) handle karne ka function
  const handleSubmit = async (e) => {
    // Page reload hone se rokne ke liye preventDefault
    e.preventDefault();
    
    // Agar questions upload nahi hue hain toh error dikhayenge
    if (questions.length === 0) {
      setError('Please test save karne se pehle Excel file me questions upload karein.');
      return;
    }

    try {
      // Backend API ko POST request bhej rahe hain naya test save karne ke liye
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // State data ko JSON string banakar bhej rahe hain
        body: JSON.stringify({
          testDetails,
          settings,
          questions,
          branding,
          studentFormFields
        })
      });

      const data = await response.json();

      // Agar response theek nahi aaya toh error throw karenge
      if (!response.ok) {
        throw new Error(data.error || 'Test save karne mein error aayi.');
      }

      // Success hone par alert ki jagah custom state update karenge
      setSuccessData({ title: testDetails.title, joinCode: data.joinCode });
    } catch (err) {
      // Catch block mein error state set kar rahe hain taaki screen par laal alert dikhe
      setError(err.message);
      console.error(err);
    }
  };

  // Component ka main HTML (JSX) UI return kar rahe hain
  return (
    // Main container div, jisme thodi padding di hai
    <div style={{ padding: '20px' }}>
      
      {/* Custom Success Modal */}
      {successData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1e1b4b' }}>Test Created!</h2>
            <p style={{ color: '#4f46e5', marginBottom: '20px' }}>"{successData.title}" has been published successfully.</p>
            
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '2px dashed #cbd5e1' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#64748b' }}>Student Join Code</p>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', letterSpacing: '2px' }}>{successData.joinCode}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexDirection: 'column' }}>
              <button 
                type="button"
                onClick={() => {
                  const link = `${window.location.origin}/student/join?code=${successData.joinCode}`;
                  navigator.clipboard.writeText(link);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {linkCopied ? 'Copied! ✅' : '🔗 Copy Direct Join Link'}
              </button>
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Hi students! Join my new test *${successData.title}* on TestPlatform.\n\nJoin Code: *${successData.joinCode}*\nDirect Link: http://localhost:3000/student/join?code=${successData.joinCode}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: '#25D366', color: '#fff', textDecoration: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📱 Share on WhatsApp
              </a>
              <button 
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  window.location.href = '/admin/tests'; // Dashboard/tests pe le jayenge
                }}
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Go to Tests List
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Page ka heading */}
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px', fontSize: '1.8rem', fontWeight: 'bold' }}>
        ➕ Create New Test
      </h2>

      {/* Agar error state me kuch hai, toh ek laal rang ka error alert dikhayenge */}
      {error && (
        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Main Form jispe submit listener laga hai */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Step 1: Test Details Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>1. Basic Details</h3>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Title ka Input Container */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Test Title</label>
              <input 
                type="text" 
                name="title" 
                required 
                value={testDetails.title} 
                onChange={handleInputChange}
                placeholder="e.g. NEET Grand Mock 1"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            
            {/* Subject ka Input Container */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Subject</label>
              <input 
                type="text" 
                name="subject" 
                required 
                value={testDetails.subject} 
                onChange={handleInputChange}
                placeholder="e.g. Physics, Full Syllabus"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            
            {/* Duration ka Input Container */}
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Duration (Mins)</label>
              <input 
                type="number" 
                name="duration" 
                required 
                min="10"
                value={testDetails.duration} 
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Branding & Student Details Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>2. Branding & Student Form</h3>
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '25px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Institute / University Name</label>
              <input 
                type="text" 
                value={branding.universityName} 
                onChange={(e) => setBranding({...branding, universityName: e.target.value})}
                placeholder="e.g. Allen Career Institute"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Logo URL (Optional)</label>
              <input 
                type="text" 
                value={branding.universityLogo} 
                onChange={(e) => setBranding({...branding, universityLogo: e.target.value})}
                placeholder="https://example.com/logo.png"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
          </div>

          <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>Information to collect from student:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {studentFormFields.map((field, index) => (
              <div key={index} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.5)', padding: '10px 15px', borderRadius: '8px', flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: '150px' }}>
                  <input 
                    type="text" 
                    value={field.label} 
                    onChange={(e) => updateFormField(index, 'label', e.target.value)}
                    placeholder="Field Label (e.g. Email Address)"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <select 
                    value={field.type}
                    onChange={(e) => updateFormField(index, 'type', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#475569', minWidth: '80px' }}>
                  <input 
                    type="checkbox" 
                    checked={field.required} 
                    onChange={(e) => updateFormField(index, 'required', e.target.checked)}
                  /> Required
                </label>
                <button 
                  type="button" 
                  onClick={() => removeFormField(index)}
                  style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                  title="Remove Field"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addFormField}
            style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '15px' }}
          >
            ➕ Add Another Field
          </button>
        </div>

        {/* Step 3: Settings Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>3. Rules & Settings</h3>
          
          <div style={{ display: 'flex', gap: '30px' }}>
            {/* Negative Marking ka Toggle/Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }}>
              <input 
                type="checkbox" 
                name="negativeMarking" 
                checked={settings.negativeMarking} 
                onChange={handleSettingsChange}
                style={{ width: '18px', height: '18px' }}
              />
              Enable Negative Marking (-1/3)
            </label>

            {/* Sections ka Toggle/Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }}>
              <input 
                type="checkbox" 
                name="hasSections" 
                checked={settings.hasSections} 
                onChange={handleSettingsChange}
                style={{ width: '18px', height: '18px' }}
              />
              Has Multiple Sections (Phy, Chem, Math)
            </label>
          </div>
        </div>

        {/* Step 4: Questions Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>4. Add Questions</h3>
            <button 
              type="button" 
              onClick={downloadSampleExcel}
              style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              📥 Download Sample Excel
            </button>
          </div>

          {/* Input Method Toggle */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="inputMethod" value="excel" checked={inputMethod === 'excel'} onChange={() => setInputMethod('excel')} />
              Upload Excel
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="radio" name="inputMethod" value="manual" checked={inputMethod === 'manual'} onChange={() => setInputMethod('manual')} />
              Manual Entry
            </label>
          </div>

          {inputMethod === 'excel' ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px' }}>
                Please ensure Excel file has these exact columns: <strong style={{ color: '#000' }}>Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer</strong>
              </p>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
                style={{ marginBottom: '10px' }}
              />
            </div>
          ) : (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Question</label>
                <input type="text" name="Question" value={manualQuestion.Question} onChange={handleManualChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Option A</label>
                  <input type="text" name="OptionA" value={manualQuestion.OptionA} onChange={handleManualChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Option B</label>
                  <input type="text" name="OptionB" value={manualQuestion.OptionB} onChange={handleManualChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Option C</label>
                  <input type="text" name="OptionC" value={manualQuestion.OptionC} onChange={handleManualChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Option D</label>
                  <input type="text" name="OptionD" value={manualQuestion.OptionD} onChange={handleManualChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Correct Answer (A, B, C, or D)</label>
                <select name="CorrectAnswer" value={manualQuestion.CorrectAnswer} onChange={handleManualChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">Select Option</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <button type="button" onClick={addManualQuestion} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ Add Question
              </button>
            </div>
          )}

          {/* Agar questions add hue, toh ek success badge/count dikhayenge */}
          {questions.length > 0 && (
            <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: '600', display: 'inline-block', marginTop: '20px' }}>
              ✅ Total {questions.length} questions added.
            </div>
          )}
        </div>

        {/* Submit Button Area */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="submit" className="btn btn-dark" style={{ padding: '16px 40px', fontSize: '16px' }}>
            🚀 Create & Publish Test
          </button>
        </div>

      </form>
    </div>
  );
}
