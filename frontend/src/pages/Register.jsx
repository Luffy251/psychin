import { useState } from "react";
import { registerUser } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

/* Password strength helper */
function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
}

const STRENGTH_MAP = ["", "weak", "fair", "good", "strong"];
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong 🔒"];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (strength < 2) {
      setError("Please choose a stronger password (min 8 chars, mix of letters & numbers).");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });
      setSuccess("Account created! Redirecting you to login…");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">

      <div className="auth-card">
        {/* Brand */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🧠</div>
          <span className="auth-logo-text">Psycin</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your mental wellness journey today</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Banners */}
          {error && (
            <div className="auth-error" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-success" role="status">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">
              Full Name
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                id="reg-name"
                className="auth-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              Email
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="reg-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password + strength */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">
              Password
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="reg-password"
                className="auth-input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Strength meter */}
            {password.length > 0 && (
              <>
                <div className="pw-strength-bar" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`pw-strength-segment ${i <= strength ? STRENGTH_MAP[strength] : ""
                        }`}
                    />
                  ))}
                </div>
                <span className="pw-strength-label">
                  {STRENGTH_LABEL[strength]}
                </span>
              </>
            )}
          </div>

          {/* Submit */}
          <button className="auth-btn" type="submit" disabled={loading || !!success}>
            {loading && <span className="auth-btn-spinner" />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: "20px" }}>
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <p className="auth-footer" style={{ marginTop: "16px" }}>
          Already have an account?{" "}
          <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
