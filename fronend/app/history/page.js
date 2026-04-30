"use client";

import { useState, useEffect } from 'react';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/history", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to fetch database records");
        }
        const data = await res.json();
        setHistoryItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return "Unknown Date";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Invalid Date";
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render placeholder states
  const renderPlaceholder = (message) => (
    <div className="p-8 sm:p-12 text-center text-(--text-secondary)">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full">
      <div className="border-b pb-4 mb-1 sm:mb-2" style={{ borderColor: 'var(--border-color)' }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">History Database</h1>
        <p className="text-(--text-secondary) text-sm mt-1">Review past resume analysis records.</p>
      </div>

      {loading ? (
        renderPlaceholder("Loading history records...")
      ) : error ? (
        <div className="p-8 sm:p-12 text-center text-red-500">
          <p>{error}</p>
        </div>
      ) : historyItems.length === 0 ? (
        renderPlaceholder("No records found in the database.")
      ) : (
        <>
          {/* ===== Desktop Table — hidden on mobile ===== */}
          <div className="hidden md:block simple-card overflow-hidden p-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-(--text-secondary) text-sm border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="px-6 py-3 font-semibold">Candidate Name</th>
                    <th className="px-6 py-3 font-semibold">Predicted Role</th>
                    <th className="px-6 py-3 font-semibold">Skills Extracted</th>
                    <th className="px-6 py-3 font-semibold text-center">Match Score</th>
                    <th className="px-6 py-3 font-semibold text-right">Date Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  {historyItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-(--text-primary)">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        {item.job_role}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(item.skills) && item.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-(--text-secondary) px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border-color)' }}>
                              {skill}
                            </span>
                          ))}
                          {Array.isArray(item.skills) && item.skills.length > 3 && (
                            <span className="text-xs text-(--text-secondary) px-1">
                              +{item.skills.length - 3} more
                            </span>
                          )}
                          {!Array.isArray(item.skills) || item.skills.length === 0 ? (
                              <span className="text-xs text-(--text-secondary) italic">None found</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-(--primary)">
                          {item.confidence}
                      </td>
                      <td className="px-6 py-4 text-sm text-(--text-secondary) text-right whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== Mobile Card Layout — shown only on small screens ===== */}
          <div className="flex flex-col gap-3 md:hidden">
            {historyItems.map((item, idx) => (
              <div key={item.id || idx} className="history-card">
                {/* Top row: Name + Date */}
                <div className="flex justify-between items-start gap-2">
                  <span className="font-semibold text-sm text-(--text-primary) truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-(--text-secondary) whitespace-nowrap flex-shrink-0">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                {/* Role + Confidence */}
                <div className="flex justify-between items-center">
                  <span className="text-sm">{item.job_role}</span>
                  <span className="text-sm font-bold text-(--primary)">{item.confidence}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(item.skills) && item.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-(--text-secondary) px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border-color)' }}>
                      {skill}
                    </span>
                  ))}
                  {Array.isArray(item.skills) && item.skills.length > 4 && (
                    <span className="text-xs text-(--text-secondary)">
                      +{item.skills.length - 4} more
                    </span>
                  )}
                  {(!Array.isArray(item.skills) || item.skills.length === 0) && (
                    <span className="text-xs text-(--text-secondary) italic">No skills found</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
