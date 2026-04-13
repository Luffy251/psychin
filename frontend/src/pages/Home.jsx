import { Link } from "react-router-dom";
import NeuralFace3D from "../components/NeuralFace3D";
import "./home.css";

const FEATURES = [
  {
    icon: "🧠",
    tag: "Intelligence",
    title: "Empathetic AI",
    desc: "Conversations that understand context, emotion, and nuance — not just keywords. It listens the way a person would.",
  },
  {
    icon: "🔐",
    tag: "Security",
    title: "Radically Private",
    desc: "Your thoughts are yours alone. End-to-end encrypted at rest and in transit, with zero third-party sharing.",
  },
  {
    icon: "🌙",
    tag: "Availability",
    title: "Always Present",
    desc: "Anxiety doesn't follow a schedule. Psycin is available anytime you need a quiet space.",
  },
];

const STATS = [
  { value: "10k+", label: "Sessions completed" },
  { value: "94%", label: "Report feeling calmer" },
  { value: "24/7", label: "Always available" },
];

export default function Home() {
  return (
    <div className="hp-root">

      {/* Navbar */}
      <nav className="hp-nav">
        <Link to="/" className="hp-nav-brand">
          <span className="hp-nav-icon">🧠</span>
          <span className="hp-nav-name">Psycin</span>
        </Link>
        <div className="hp-nav-links">
          <a href="#features" className="hp-nav-link">Features</a>
          <Link to="/login" className="hp-nav-link">Sign In</Link>
          <Link to="/register" className="hp-nav-cta">Begin Journey</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hp-hero">
        <div className="hp-hero-bg">
          <NeuralFace3D />
        </div>

        <div className="hp-hero-overlay" />

        <div className="hp-hero-content">
          <div className="hp-badge">
            <span className="hp-badge-dot" />
            Now in open beta — join free
          </div>

          <h1 className="hp-h1">
            Your mind deserves
            <br />
            <span className="hp-gradient">a quiet space.</span>
          </h1>

          <p className="hp-hero-sub">
            Psycin is an AI companion trained in empathy —
            here to listen, reflect, and help you find calm in the chaos.
          </p>

          <div className="hp-hero-actions">
            <Link to="/register" className="hp-btn-primary">
              Start for free <span className="hp-arrow">→</span>
            </Link>
            <Link to="/login" className="hp-btn-ghost">Sign in</Link>
          </div>

          <div className="hp-hero-stats">
            {STATS.map((s, i) => (
              <div key={i} className="hp-stat">
                <span className="hp-stat-val">{s.value}</span>
                <span className="hp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hp-scroll-hint">
          <div className="hp-scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* Features */}
      <section className="hp-features" id="features">
        <div className="hp-features-header">
          <span className="hp-eyebrow">Why Psycin</span>
          <h2 className="hp-h2">
            Built for the moments<br />that matter most.
          </h2>
          <p className="hp-features-sub">
            Not a therapy replacement — a gentle, intelligent presence
            when you need someone to talk to.
          </p>
        </div>

        <div className="hp-cards">
          {FEATURES.map((f, i) => (
            <div className="hp-card" key={i}>
              <div className="hp-card-top">
                <span className="hp-card-icon">{f.icon}</span>
                <span className="hp-card-tag">{f.tag}</span>
              </div>
              <h3 className="hp-card-title">{f.title}</h3>
              <p className="hp-card-desc">{f.desc}</p>
              <div className="hp-card-shine" />
            </div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section className="hp-quote-section">
        <div className="hp-quote-inner">
          <p className="hp-quote">
            "Sometimes you don't need answers —<br />
            you need to feel <em>heard</em>."
          </p>
          <p className="hp-quote-attr">The philosophy behind Psycin</p>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <div className="hp-cta-glow" />
        <h2 className="hp-cta-h2">
          Your journey starts<br />with a single thought.
        </h2>
        <Link to="/register" className="hp-btn-primary hp-btn-lg">
          Begin for free →
        </Link>
        <p className="hp-cta-note">No credit card. No commitment. Just clarity.</p>
      </section>

      {/* Footer */}
      <footer className="hp-footer">
        <div className="hp-footer-inner">
          <div className="hp-footer-brand">🧠 Psycin</div>
          <nav className="hp-footer-links">
            <a href="#features">Features</a>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create account</Link>

            {/* FIXED HERE */}
            <button className="hp-link-btn">Privacy</button>
            <button className="hp-link-btn">Terms</button>
          </nav>
          <p className="hp-footer-copy">© 2026 Psycin. Crafted with care.</p>
        </div>
      </footer>

    </div>
  );
}