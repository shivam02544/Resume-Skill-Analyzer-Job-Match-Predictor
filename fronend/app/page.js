"use client";

import { useState, useRef } from 'react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Home() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);
  const reportRef = useRef(null);

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

  const downloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Analysis_Report_${name || 'Resume'}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          AI Resume Intelligence
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Next-generation skill gap analysis and role prediction for modern careers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Upload Form Section */}
        <div className="md:col-span-5 simple-card h-fit sticky top-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Upload & Analyze
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Resume File (PDF/TXT) *</label>
              <div 
                className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.txt" 
                  className="hidden" 
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <span className="text-blue-600 font-medium truncate w-full px-4">{file.name}</span>
                    <span className="text-xs text-slate-400">Click to change</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <span className="text-sm">Click or Drag & Drop</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Candidate Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-700">Job Description (for Gap Analysis)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="input-field min-h-[120px] resize-none"
              ></textarea>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !file}
              className="btn-primary py-3 text-base shadow-lg shadow-blue-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing AI Insights...
                </span>
              ) : "Unlock Analysis"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="md:col-span-7 space-y-6" ref={reportRef}>
          {!result && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-7.364l-.707-.707M6.364 18.636l-.707.707M12 21v-1m0-18a9 9 0 100 18 9 9 0 000-18z"></path></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Ready for Insights</h3>
              <p className="max-w-xs text-sm">Upload your resume to see your professional profile distribution and job matching score.</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in-up space-y-6">
              {/* Primary Profile Card */}
              <div className="simple-card overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Top Predicted Role</h2>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-800">{result.job_role}</h3>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {result.confidence} Confidence
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Experience: <span className="font-semibold text-slate-600">{result.experience}</span></p>
                  </div>
                </div>

                {/* Radar Chart for Skill Distribution */}
                {result.gap_analysis && result.gap_analysis.radar_data && (
                  <div className="h-[250px] w-full mb-6 bg-slate-50 rounded-2xl p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.gap_analysis.radar_data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} />
                        <Radar
                          name="Skills"
                          dataKey="value"
                          stroke="#2563eb"
                          fill="#3b82f6"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                   <button 
                    onClick={downloadPDF}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tight"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                     Export Analysis (PDF)
                   </button>
                   <div className="text-xs text-slate-400 italic">Analyzed on {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Match Score & Gap Analysis */}
              {result.gap_analysis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="simple-card border-l-4 border-l-green-500">
                    <h4 className="text-sm font-bold text-slate-500 mb-2">Match Score</h4>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-green-600">{result.gap_analysis.match_score}%</span>
                      <span className="text-xs text-slate-400 mb-1">fit for requirement</span>
                    </div>
                  </div>
                  <div className="simple-card border-l-4 border-l-blue-500">
                    <h4 className="text-sm font-bold text-slate-500 mb-2">Total Skills Found</h4>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-blue-600">{result.skills.length}</span>
                      <span className="text-xs text-slate-400 mb-1">technical proficiencies</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Feedback: Career Roadmap */}
              {result.gap_analysis && result.gap_analysis.missing.length > 0 && (
                <div className="simple-card">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </span>
                    Next Steps: Bridge the Gap
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.gap_analysis.missing.map((skill, idx) => (
                      <a 
                        key={idx} 
                        href={result.gap_analysis.resources[skill]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex justify-between items-center group"
                      >
                        <span className="text-sm font-semibold text-slate-700">{skill}</span>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-400 text-center">Click on a skill to explore curated learning resources.</p>
                </div>
              )}

              {/* Alternative Recommendations */}
              {result.top_roles && result.top_roles.length > 1 && (
                <div className="simple-card">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Secondary Career Options</h3>
                  <div className="space-y-3">
                    {result.top_roles.slice(1).map((role, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-bold text-slate-700">{role.role}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400" style={{ width: `${role.confidence * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-blue-600">{(role.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
