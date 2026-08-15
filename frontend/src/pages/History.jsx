import { useState, useEffect } from "react";
import { getAnalyses, deleteAnalysis } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalyses = async () => {
    try {
      const res = await getAnalyses();
      setAnalyses(res.data);
    } catch (err) {
      setLoadError("Failed to load analysis history.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAnalysis(id);
      loadAnalyses();
    } catch (err) {
      console.error("Failed to delete analysis", err);
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="container">
        <h1 className="page-heading">Analysis History</h1>

        {isLoading && <p className="empty-state">Loading…</p>}
        {loadError && <p className="error-text">{loadError}</p>}
        {!isLoading && analyses.length === 0 && (
          <p className="empty-state">No past analyses yet.</p>
        )}

        {analyses.map((a) => (
          <div key={a.id} className="card">
            <div className="card-header-row">
              <div>
                <div className="card-title">{a.job_title || "Untitled Job"}</div>
                <p className="card-meta">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>
                Delete
              </button>
            </div>

            <div className="score-ring-wrap">
              <div className="score-ring" style={{ "--score": a.ats_score }}>
                <div className="score-ring-inner">{Math.round(a.ats_score)}%</div>
              </div>
              <div className="score-label">ATS Match Score</div>
            </div>

            <div className="field">
              <label>Matched Skills</label>
              <div className="skill-tags">
                {a.matched_skills.length === 0 && <span className="empty-state">None</span>}
                {a.matched_skills.map((s) => (
                  <span key={s} className="tag tag-matched">{s}</span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Missing Skills</label>
              <div className="skill-tags">
                {a.missing_skills.length === 0 && <span className="empty-state">None</span>}
                {a.missing_skills.map((s) => (
                  <span key={s} className="tag tag-missing">{s}</span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>AI Suggestions</label>
              <div className="suggestions">{a.ai_suggestions}</div>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default History;