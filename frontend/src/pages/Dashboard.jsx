import { useState, useEffect } from "react";
import { uploadResume, getResumes, deleteResume, createAnalysis } from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");

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

  useEffect(() => {
    loadResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!selectedFile) {
      setUploadError("Please choose a PDF or DOCX file first.");
      return;
    }
    try {
      await uploadResume(selectedFile);
      setSelectedFile(null);
      e.target.reset();
      loadResumes();
    } catch (err) {
      setUploadError(err.response?.data?.detail || "Upload failed.");
    }
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

    if (!selectedResumeId) {
      setAnalysisError("Please select a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setAnalysisError("Please paste a job description.");
      return;
    }

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

  // Drives which step in the tracker looks "active" / "done"
  const step1Done = resumes.length > 0;
  const step2Done = !!analysisResult;

  return (
    <div className="page">
      <Navbar />

      <div className="hero">
        <h1>Resume Analyzer</h1>
        <p className="subtitle">Upload your resume and match it against any job description.</p>
      </div>

      <div className="steps">
        <div className={`step ${!step1Done ? "active" : "done"}`}>
          <div className="step-icon">1</div>
          <div className="step-title">Upload Resume</div>
          <div className="step-desc">PDF or DOCX, up to 5MB</div>
        </div>
        <div className={`step ${step1Done && !step2Done ? "active" : step2Done ? "done" : ""}`}>
          <div className="step-icon">2</div>
          <div className="step-title">Add Job Details</div>
          <div className="step-desc">Paste the job description</div>
        </div>
        <div className={`step ${step2Done ? "active" : ""}`}>
          <div className="step-icon">3</div>
          <div className="step-title">View Results</div>
          <div className="step-desc">Score, gaps &amp; suggestions</div>
        </div>
      </div>

      <div className="container-wide">
        <div className="split-layout">
          {/* Left column — inputs */}
          <div>
            <div className="card">
              <h2>Upload Resume</h2>
              <form onSubmit={handleUpload}>
                <div className="field">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Upload</button>
              </form>
              {uploadError && <p className="error-text">{uploadError}</p>}
            </div>

            <div className="card">
              <h2>Your Resumes</h2>
              {resumes.length === 0 && <p className="empty-state">No resumes uploaded yet.</p>}
              <ul className="resume-list">
                {resumes.map((r) => (
                  <li key={r.id} className="resume-item">
                    <div>
                      <div className="name">{r.filename}</div>
                      <div className="meta">{r.candidate_name || "Name not detected"}</div>
                    </div>
                    <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Job Details</h2>
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
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Job Description</label>
                  <textarea
                    rows="6"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing…" : "Analyze"}
                </button>
              </form>
              {analysisError && <p className="error-text">{analysisError}</p>}
            </div>
          </div>

          {/* Right column — results */}
          <div>
            {!analysisResult ? (
              <div className="results-placeholder">
                <div className="icon">?</div>
                <h3>Ready to see your score?</h3>
                <p>Upload a resume and paste a job description, then click Analyze to see your ATS match score, skill gaps, and AI suggestions here.</p>
              </div>
            ) : (
              <div className="card">
                <h2>Results</h2>

                <div className="score-ring-wrap">
                  <div className="score-ring" style={{ "--score": analysisResult.ats_score }}>
                    <div className="score-ring-inner">{Math.round(analysisResult.ats_score)}%</div>
                  </div>
                  <div className="score-label">ATS Match Score</div>
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
                  <div className="suggestions">{analysisResult.ai_suggestions}</div>
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