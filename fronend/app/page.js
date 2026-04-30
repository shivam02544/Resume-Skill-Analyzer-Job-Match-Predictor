"use client";

import { useState, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name || file.name);
    if (jobDescription) {
      formData.append("job_description", jobDescription);
    }

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      {/* Header */}
      <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Resume Analyzer</h1>
        <p className="text-(--text-secondary) text-sm sm:text-base">
          Upload a resume to predict fit, extract skills, and perform gap analysis.
        </p>
      </div>

      <div className="flex flex-col max-w-2xl mx-auto gap-6 sm:gap-8 items-center w-full">
        {/* Upload Form Section */}
        <div className="simple-card w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1">Resume File (PDF/TXT) *</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.txt" 
                className="input-field cursor-pointer text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Candidate Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Job Description (Optional for Gap Analysis)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste Job Description here..."
                className="input-field min-h-[100px] sm:min-h-[120px] resize-y"
              ></textarea>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !file}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : "Analyze Resume"}
            </button>
            
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="flex flex-col gap-4 sm:gap-6 w-full animate-fade-in-up">
            {/* Predicted Fit Card */}
            <div className="simple-card">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-(--text-secondary) mb-1">
                Predicted Fit
              </h2>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-4 border-b pb-4 gap-1" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-xl sm:text-2xl font-bold">{result.job_role}</h3>
                <span className="text-lg sm:text-xl font-bold text-(--primary)">{result.confidence}</span>
              </div>
              
              <div className="mb-2">
                <h4 className="text-sm font-semibold mb-2">Extracted Skills</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {result.skills.map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 border border-gray-200 px-2 py-1 rounded-md text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {result.skills.length === 0 && <span className="text-sm text-(--text-secondary)">No skills extracted.</span>}
                </div>
              </div>
            </div>

            {/* Skill Gap Analysis Card */}
            {result.gap_analysis && (
              <div className="simple-card">
                <h3 className="text-base sm:text-lg font-bold mb-3 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
                  Skill Gap Analysis
                </h3>
                
                <div className="mb-4 text-sm">
                  <span className="font-semibold">Match Score: </span>
                  <span className="text-green-600 font-bold">{result.gap_analysis.match_score}%</span>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-600 mb-2">✅ Matched Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.gap_analysis.matched || []).map((s, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs border border-green-200 font-medium">
                          {s}
                        </span>
                      ))}
                      {(!result.gap_analysis.matched || result.gap_analysis.matched.length === 0) && <span className="text-xs text-(--text-secondary)">None</span>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-red-600 mb-2">❌ Missing Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.gap_analysis.missing || []).map((s, i) => (
                        <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs border border-red-200 font-medium">
                          {s}
                        </span>
                      ))}
                      {(!result.gap_analysis.missing || result.gap_analysis.missing.length === 0) && <span className="text-xs text-(--text-secondary)">None</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alternative Roles Card */}
            {result.top_roles && result.top_roles.length > 1 && (
              <div className="simple-card">
                <h3 className="text-base sm:text-lg font-bold mb-3 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>Alternative Roles</h3>
                <div className="space-y-2 text-sm text-(--text-secondary)">
                  {result.top_roles.slice(1).map((role, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0 gap-2" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="truncate">{role.role}</span>
                      <span className="text-xs font-medium text-(--primary) flex-shrink-0">
                        {(role.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
