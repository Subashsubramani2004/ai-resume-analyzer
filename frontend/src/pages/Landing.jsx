import { Link } from "react-router-dom";

function ResumeMock() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "420px", margin: "0 auto" }}>

      {/* Background dot-grid */}
      <div style={{
        position: "absolute", inset: "-20px",
        backgroundImage: "radial-gradient(circle, #d4d0f5 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        borderRadius: "16px",
        zIndex: 0,
      }} />

      {/* Resume card */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "#fff",
        border: "1px solid #E5E4F0",
        borderRadius: "12px",
        padding: "28px 24px",
        boxShadow: "0 4px 24px rgba(108,92,231,0.10)",
        margin: "24px 16px 40px",
      }}>
        {/* Top accent bar */}
        <div style={{
          height: "4px", borderRadius: "2px",
          background: "linear-gradient(90deg, #6C5CE7, #A78BFA)",
          marginBottom: "20px",
        }} />

        {/* Name line */}
        <div style={{
          height: "14px", width: "55%", borderRadius: "4px",
          background: "#1E1B2E", opacity: 0.85, marginBottom: "6px",
        }} />
        {/* Sub-title line */}
        <div style={{
          height: "8px", width: "38%", borderRadius: "4px",
          background: "#E5E4F0", marginBottom: "20px",
        }} />

        {/* Body lines */}
        {[100, 88, 76, 92, 68].map((w, i) => (
          <div key={i} style={{
            height: "7px", width: `${w}%`, borderRadius: "4px",
            background: "#E5E4F0", marginBottom: "9px",
          }} />
        ))}

        {/* Section gap */}
        <div style={{ marginTop: "18px", marginBottom: "10px" }}>
          <div style={{
            height: "8px", width: "25%", borderRadius: "4px",
            background: "#6C5CE7", opacity: 0.5, marginBottom: "10px",
          }} />
          {[85, 70, 90].map((w, i) => (
            <div key={i} style={{
              height: "7px", width: `${w}%`, borderRadius: "4px",
              background: "#E5E4F0", marginBottom: "9px",
            }} />
          ))}
        </div>
      </div>

      {/* ATS Score badge — top right */}
      <div style={{
        position: "absolute", top: "12px", right: "-8px", zIndex: 3,
        background: "#fff",
        border: "1px solid #E5E4F0",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(108,92,231,0.13)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        {/* Mini ring */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
          background: `conic-gradient(#6C5CE7 ${87}%, #E5E4F0 0)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
            color: "#1E1B2E",
          }}>87</div>
        </div>
        <div>
          <div style={{ fontSize: "11px", color: "#6B7280", lineHeight: 1.2 }}>ATS SCORE</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1E1B2E" }}>Excellent</div>
        </div>
      </div>

      {/* AI suggestion tooltip — bottom left */}
      <div style={{
        position: "absolute", bottom: "16px", left: "-8px", zIndex: 3,
        background: "#fff",
        border: "1px solid #E5E4F0",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(108,92,231,0.13)",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        maxWidth: "220px",
      }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
          background: "#F3F0FF",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px",
        }}>✦</div>
        <div style={{ fontSize: "12px", color: "#1E1B2E", lineHeight: 1.4 }}>
          Rephrase this bullet to highlight <strong>leadership.</strong>
        </div>
      </div>

    </div>
  );
}

function Landing() {
  return (
    <div className="page">
      <header className="landing-nav">
        <div className="brand">ResumeAI</div>
        <nav className="nav-center">
          <a href="#top">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
        </nav>
        <div className="nav-right">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-gradient">Get Started</Link>
        </div>
      </header>

      <section className="hero-split" id="top">
        <div>
          <span className="hero-eyebrow">✦ AI-Powered Resume Analysis</span>
          <h1>Land Your Dream Job with AI-Powered Resume Analysis.</h1>
          <p className="lede">
            Optimize your resume for ATS systems, identify skill gaps,
            and get actionable AI suggestions in seconds.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-gradient">Analyze My Resume →</Link>
            <a href="#features" className="btn btn-ghost">See How It Works ⊙</a>
          </div>
          <p className="hero-proof">Free to use · No credit card required · Built for students &amp; freshers</p>
        </div>

        <ResumeMock />
      </section>

      <section className="section" id="features">
        <h2>Why choose ResumeAI?</h2>
        <p className="section-sub">
          We analyze your resume the way recruiters and ATS systems actually do —
          so you fix what's holding you back before you apply.
        </p>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">◆</div>
            <h3>ATS Match Scoring</h3>
            <p>See your exact match percentage against any job description — the same way automated screening systems score your resume before a human ever reads it.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">◎</div>
            <h3>Skill Gap Analysis</h3>
            <p>Instantly see which skills the job requires that are missing from your resume, and which ones you already have covered — no guessing required.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✎</div>
            <h3>AI Suggestions</h3>
            <p>Get specific, role-targeted suggestions written by Gemini AI — not generic tips, but advice based on your actual resume and the exact job you're applying for.</p>
          </div>
        </div>
      </section>

      <section className="cta-banner" id="how-it-works">
        <h2>Ready to improve your resume?</h2>
        <p>Upload your resume and get your first ATS analysis in under a minute. Free, no sign-up friction.</p>
        <Link to="/register" className="btn btn-gradient">Get Started for Free →</Link>
      </section>

      <footer className="site-footer">
        <p>ResumeAI &copy; 2026 — Built with FastAPI, React &amp; Gemini AI</p>
      </footer>
    </div>
  );
}

export default Landing;