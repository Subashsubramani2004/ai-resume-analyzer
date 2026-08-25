import { useState, useEffect } from "react";
import { uploadResume, getResumes, deleteResume, createAnalysis } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UploadIcon, FileIcon } from "../components/Icons";

function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadResumes = async () => {
    try {
      const res = await getResumes();
      setResumes(res.data);
    } catch (err) {
      console.error("Failed to load resumes", err);
    }
  };

  useEffect(() => { loadResumes(); }, []);

  const doUpload = async (file) => {
    setUploadError("");
    if (!file) return;
    try {
      await uploadResume(file);
      setSelectedFile(null);
      loadResumes();
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Upload failed.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    doUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setSelectedFile(file); doUpload(file); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteResume(id);
      loadResumes();
    } catch (err) {
      console.error("Failed to delete resume", err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalysisError("");
    setAnalysisResult(null);
    if (!selectedResumeId) { setAnalysisError("Please select a resume first."); return; }
    if (!jobDescription.trim()) { setAnalysisError("Please paste a job description."); return; }
    setIsAnalyzing(true);
    try {
      const res = await createAnalysis(selectedResumeId, jobTitle, jobDescription);
      setAnalysisResult(res.data);
    } catch (err) {
      setAnalysisError(err.response?.data?.detail || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="container-wide">
        <div className="dash-grid">

          {/* ── Left column ── */}
          <div>
            {/* Upload card */}
            <div className="card" style={{ marginBottom: "24px" }}>
              <h2>Upload Your Resume</h2>
              <label
                className={`upload-zone ${isDragging ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="upload-icon"><UploadIcon /></div>
                <div className="upload-title">Drag and drop your resume here</div>
                <div className="upload-sub">Supported formats: PDF, DOCX (max 5MB)</div>
                <span className="btn btn-gradient" style={{ marginTop: "12px" }}>Browse Files</span>
               <input type="file" accept=".pdf,.docx" onChange={handleFileChange} style={{ display: "none" }} />
                {selectedFile && <div className="upload-filename">📄 {selectedFile.name}</div>}
              </label>
              {uploadError && <p className="error-text">{uploadError}</p>}
            </div>

            {/* Job details card */}
            <div className="card" style={{ marginBottom: "24px" }}>
              <h2>Target Job Details</h2>
              <form onSubmit={handleAnalyze}>
                <div className="field">
                  <label>Resume</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    <option value="">Select a resume</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.filename}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Job Description</label>
                  <textarea
                    rows="7"
                    placeholder="Paste the job description here…"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gradient"
                  style={{ width: "100%" }}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing…" : "Analyze"}
                </button>
              </form>
              {analysisError && <p className="error-text">{analysisError}</p>}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="dash-right">

            {/* Resumes sidebar */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ margin: 0 }}>Your Resumes</h2>
                {resumes.length > 0 && (
                  <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>
                    {resumes.length} file{resumes.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {resumes.length === 0 && <p className="empty-state">No resumes uploaded yet.</p>}
              <ul className="side-list">
                {resumes.map((r) => (
                  <li key={r.id} className="side-list-item">
                    <div className="side-file-icon"><FileIcon /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.filename}
                      </div>
                      <div className="meta">{r.candidate_name || "Name not detected"}</div>
                    </div>
                    <div className="side-actions">
                      <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Results panel */}
            {!analysisResult ? (
              <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  border: "1px solid var(--border)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", color: "var(--muted)", fontSize: "22px"
                }}>📄</div>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Ready to see the magic?</h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                  Select a resume and click "Analyze" to see your ATS match score, skill gaps, and AI suggestions here.
                </p>
              </div>
            ) : (
              <div className="card">
                <h2>Results</h2>

                <div className="score-ring-wrap">
                  <div className="score-ring" style={{ "--score": analysisResult.ats_score }}>
                    <div className="score-ring-inner">{Math.round(analysisResult.ats_score)}%</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px" }}>ATS Match Score</div>
                    <div className="score-label">
                      {analysisResult.ats_score >= 70 ? "✅ Strong match" :
                       analysisResult.ats_score >= 40 ? "⚠️ Moderate match" : "❌ Needs work"}
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Matched Skills</label>
                  <div className="skill-tags">
                    {analysisResult.matched_skills.length === 0 && <span className="empty-state">None</span>}
                    {analysisResult.matched_skills.map((s) => (
                      <span key={s} className="tag tag-matched">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Missing Skills</label>
                  <div className="skill-tags">
                    {analysisResult.missing_skills.length === 0 && <span className="empty-state">None</span>}
                    {analysisResult.missing_skills.map((s) => (
                      <span key={s} className="tag tag-missing">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="field">
  <label>AI Suggestions</label>
  <div className="suggestions">
    {analysisResult.ai_suggestions
      ? analysisResult.ai_suggestions
          .split("\n")
          .filter((line) => line.trim().startsWith("*"))
          .map((line, i) => {
            // Strip leading "* " and parse "**Title:** rest" pattern
            const content = line.replace(/^\*+\s*/, "");
            const boldMatch = content.match(/^\*\*(.+?)\*\*[:\s]*(.*)/s);
            return (
              <div key={i} className="suggestion-item">
                <div className="suggestion-bullet">{i + 1}</div>
                <div className="suggestion-text">
                  {boldMatch ? (
                    <>
                      <strong>{boldMatch[1]}</strong>
                      {boldMatch[2]}
                    </>
                  ) : (
                    content
                  )}
                </div>
              </div>
            );
          })
      : <span className="empty-state">No suggestions available.</span>
    }
  </div>
</div>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;