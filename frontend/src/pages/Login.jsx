import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { MailIcon, LockIcon } from "../components/Icons";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="auth-page">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Enter your credentials to access your ResumeAI account.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <MailIcon />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-icon-wrap">
                <LockIcon />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-row">
              <label><input type="checkbox" /> Remember Me</label>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              className="btn btn-gradient"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login →"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;