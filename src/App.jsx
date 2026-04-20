import { useState, useEffect, useRef, useMemo } from "react";
import { getGoogleCalendarUrl, getGoogleMapsUrl, getPlacesSuggestions, formatDateForCalendar } from "./utils/googleServices";
import { registerUser, signInUser, oauthSignIn, logoutUser, getCurrentUser, updateUserProfile } from "./utils/auth";

const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&family=Syne:wght@400;600;700;800&display=swap');
  `}</style>
);

const THEMES = {
  home: {
    bg: "#0d0e12",
    surface: "#13141a",
    accent: "#8b85c1",
    accentGlow: "rgba(139,133,193,0.15)",
    text: "#d4d4e0",
    muted: "#5c5c72",
    particle: "#8b85c1",
    gradient: "linear-gradient(135deg, #0d0e12 0%, #111218 100%)",
    name: "Cosmic",
  },
  movies: {
    bg: "#0e0c0d",
    surface: "#141112",
    accent: "#a86b72",
    accentGlow: "rgba(168,107,114,0.15)",
    text: "#d8cfd0",
    muted: "#6a5558",
    particle: "#a86b72",
    gradient: "linear-gradient(135deg, #0e0c0d 0%, #130f10 100%)",
    name: "Cinema",
  },
  concerts: {
    bg: "#0c0c10",
    surface: "#111118",
    accent: "#8a7abf",
    accentGlow: "rgba(138,122,191,0.15)",
    text: "#d0cee8",
    muted: "#585570",
    particle: "#8a7abf",
    gradient: "linear-gradient(135deg, #0c0c10 0%, #10101a 100%)",
    name: "Neon",
  },
  sports: {
    bg: "#0b0e0c",
    surface: "#101410",
    accent: "#5a9e82",
    accentGlow: "rgba(90,158,130,0.15)",
    text: "#c8d8d0",
    muted: "#4a6658",
    particle: "#5a9e82",
    gradient: "linear-gradient(135deg, #0b0e0c 0%, #0e1210 100%)",
    name: "Field",
  },
  tech: {
    bg: "#0b0d10",
    surface: "#101318",
    accent: "#5a9ab5",
    accentGlow: "rgba(90,154,181,0.15)",
    text: "#c8d8e4",
    muted: "#486070",
    particle: "#5a9ab5",
    gradient: "linear-gradient(135deg, #0b0d10 0%, #0e1218 100%)",
    name: "Matrix",
  },
  food: {
    bg: "#0e0c0a",
    surface: "#151210",
    accent: "#b8895a",
    accentGlow: "rgba(184,137,90,0.15)",
    text: "#ddd0c0",
    muted: "#6a5a48",
    particle: "#b8895a",
    gradient: "linear-gradient(135deg, #0e0c0a 0%, #141008 100%)",
    name: "Warm",
  },
};

function ThreeBackground({ theme }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const COUNT = 90;
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    const color = theme.particle;
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(color);

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += (dx / dist) * 1.5;
          p.y += (dy / dist) * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.alpha})`;
        ctx.fill();

        particles.slice(i + 1).forEach((q) => {
          const ex = p.x - q.x;
          const ey = p.y - q.y;
          const ed = Math.sqrt(ex * ex + ey * ey);
          if (ed < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${rgb},${0.15 * (1 - ed / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        });
      });
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}

function GlassCard({ children, style = {}, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function TypeWriter({ words, speed = 80 }) {
  const [displayed, setDisplayed] = useState("");
  const [wIdx, setWIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wIdx];
    if (!deleting && charIdx < word.length) {
      const t = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx === word.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, speed / 2);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setWIdx((i) => (i + 1) % words.length);
    }
  }, [charIdx, deleting, wIdx, words, speed]);

  return (
    <span>
      {displayed}
      <span
        style={{
          borderRight: "2px solid currentColor",
          animation: "blink 1s step-end infinite",
        }}
      />
    </span>
  );
}

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Navbar({ theme, onSignIn, onSignUp, onNav, user, onLogout, onProfile }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = ["Events", "Pricing", "About"];

  return (
    <>
      <style>{`
        .nav-link { transition: color 0.2s; cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif; font-weight: 500; }
        .nav-link:hover { color: ${theme.accent} !important; }
        .btn-primary { background: ${theme.accent}; color: #fff; border: none; cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif; font-weight: 700; transition: all 0.25s; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 8px 24px ${theme.accentGlow}; }
        .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: ${theme.text}; cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif; font-weight: 500; transition: all 0.25s; }
        .btn-ghost:hover { border-color: ${theme.accent}; color: ${theme.accent}; }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 ${theme.accentGlow}; } 50% { box-shadow: 0 0 0 12px transparent; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .card-hover { transition: transform 0.3s, box-shadow 0.3s; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 24px 60px ${theme.accentGlow}; }
        .theme-tag { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: ${theme.accentGlow}; color: ${theme.accent}; border: 1px solid ${theme.accent}44; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${theme.bg}; } ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }
        /* ── Mobile Responsive ── */
        .nav-links-desktop { display: flex; gap: 32px; align-items: center; }
        .nav-auth-desktop { display: flex; gap: 12px; align-items: center; }
        .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 8px; color: ${theme.text}; }
        .mobile-menu { display: none; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-auth-desktop { display: none !important; }
          .hamburger { display: flex !important; flex-direction: column; gap: 5px; }
          .hamburger span { display: block; width: 22px; height: 2px; background: ${theme.text}; border-radius: 2px; transition: all 0.3s; }
          .mobile-menu { display: flex; flex-direction: column; position: fixed; top: 70px; left: 0; right: 0; background: ${theme.surface}f0; backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 20px 24px; gap: 16px; z-index: 999; animation: slideDown 0.25s ease; }
          .mobile-menu .nav-link { font-size: 17px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .mobile-menu .btn-primary, .mobile-menu .btn-ghost { width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; text-align: center; }
        }
        @media (max-width: 480px) {
          .theme-tag { display: none; }
        }
      `}</style>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "0 32px",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.3s",
          background: scrolled ? `${theme.surface}ee` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid rgba(255,255,255,0.06)` : "none",
        }}
      >

        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => onNav("home")}
          role="button"
          tabIndex={0}
          aria-label="Go to homepage"
          onKeyDown={(e) => e.key === "Enter" && onNav("home")}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff",
              boxShadow: `0 4px 16px ${theme.accentGlow}`,
            }}
            aria-hidden="true"
          >N</div>
          <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 20, color: theme.text }}>
            Nex<span style={{ color: theme.accent }}>Event</span>
          </span>
          <span style={{ fontSize: 10, fontFamily: "'Cabinet Grotesk', sans-serif", color: theme.accent, fontWeight: 700, letterSpacing: "0.1em", border: `1px solid ${theme.accent}`, borderRadius: 4, padding: "1px 5px" }} aria-label="AI powered">AI</span>
        </div>


        <div className="nav-links-desktop" role="menubar" aria-label="Site navigation">
          {navLinks.map((l) => (
            <span key={l} className="nav-link" style={{ color: theme.muted, fontSize: 15 }}
              role="menuitem"
              tabIndex={0}
              aria-label={`Navigate to ${l}`}
              onClick={() => onNav(l.toLowerCase().replace(" ", "-"))}
              onKeyDown={(e) => e.key === "Enter" && onNav(l.toLowerCase().replace(" ", "-"))}>
              {l}
            </span>
          ))}
        </div>


        <div className="nav-auth-desktop">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div onClick={onProfile}
                style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, color: "#fff", fontSize: 14, cursor: "pointer", boxShadow: `0 2px 12px ${theme.accentGlow}` }}
                aria-label={`View profile for ${user.name}`}
                role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onProfile()}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <button className="btn-ghost" style={{ padding: "8px 18px", borderRadius: 10, fontSize: 14 }} onClick={onLogout} aria-label="Logout">Logout</button>
            </div>
          ) : (
            <>
              <button className="btn-ghost" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 14 }} onClick={onSignIn} aria-label="Sign in to your account">Sign In</button>
              <button className="btn-primary" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 14 }} onClick={onSignUp} aria-label="Get started with NexEvent AI">Get Started</button>
            </>
          )}
        </div>


        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu">
          <span /><span /><span />
        </button>
      </nav>


      {menuOpen && (
        <div id="mobile-menu" className="mobile-menu" role="menu" aria-label="Mobile navigation">
          {navLinks.map((l) => (
            <span key={l} className="nav-link" style={{ color: theme.muted }}
              role="menuitem"
              tabIndex={0}
              onClick={() => { onNav(l.toLowerCase().replace(" ", "-")); setMenuOpen(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { onNav(l.toLowerCase().replace(" ", "-")); setMenuOpen(false); } }}>
              {l}
            </span>
          ))}
          {user ? (
            <button className="btn-ghost" style={{ padding: "12px", borderRadius: 12, fontSize: 15 }} onClick={() => { onLogout(); setMenuOpen(false); }} aria-label="Logout">Logout</button>
          ) : (
            <>
              <button className="btn-ghost" style={{ padding: "12px", borderRadius: 12, fontSize: 15 }} onClick={() => { onSignIn(); setMenuOpen(false); }} aria-label="Sign in">Sign In</button>
              <button className="btn-primary" style={{ padding: "12px", borderRadius: 12, fontSize: 15 }} onClick={() => { onSignUp(); setMenuOpen(false); }} aria-label="Get started">Get Started</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function AuthModal({ theme, mode, onClose, onAuth, setMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState("");

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    if (mode === "signup" && !form.name) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 600));
      const user = mode === "signup"
        ? registerUser({ name: form.name, email: form.email, password: form.password })
        : signInUser({ email: form.email, password: form.password });
      onAuth(user);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    setOauthLoading(provider);
    await new Promise((r) => setTimeout(r, 900));
    setOauthLoading("");
    const mockData = {
      google: { name: "Google User", email: "googleuser@gmail.com" },
      github: { name: "GitHub User", email: "githubuser@github.com" },
      discord: { name: "Discord User", email: "discorduser@discord.com" },
    };
    try {
      const user = oauthSignIn(provider, mockData[provider]);
      onAuth(user);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s", padding: "20px" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <GlassCard style={{ width: "min(440px, 100%)", padding: "clamp(24px, 5vw, 40px)", position: "relative", animation: "slideDown 0.3s cubic-bezier(0.16,1,0.3,1)", border: `1px solid ${theme.accent}33`, maxHeight: "90vh", overflowY: "auto" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: theme.muted, fontSize: 18 }}>×</button>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", boxShadow: `0 8px 24px ${theme.accentGlow}` }}>N</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 26, color: theme.text, margin: 0 }}>
            {mode === "signin" ? "Welcome back" : "Join NexEvent"}
          </h2>
          <p style={{ color: theme.muted, fontSize: 14, marginTop: 6, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            {mode === "signin" ? "Sign in to your account" : "Create your free account today"}
          </p>
        </div>


        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { id: "google", label: "Google", icon: "G", color: "#ea4335" },
            { id: "github", label: "GitHub", icon: "⌥", color: "#888" },
            { id: "discord", label: "Discord", icon: "D", color: "#5865f2" },
          ].map((p) => (
            <button key={p.id} onClick={() => handleOAuth(p.id)} aria-label={`Sign in with ${p.label}`}
              style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: theme.text, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = p.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {oauthLoading === p.id
                ? <div style={{ width: 14, height: 14, border: `2px solid ${p.color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : <span style={{ fontWeight: 800, color: p.color }}>{p.icon}</span>}
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: theme.muted, fontSize: 12, fontFamily: "'Cabinet Grotesk', sans-serif" }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-label="Full name"
              style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${error && !form.name ? theme.accent : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "14px 16px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, outline: "none" }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          )}
          <input placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-label="Email address"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = theme.accent}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            aria-label="Password"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = theme.accent}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          {error && <p role="alert" style={{ color: "#e63946", fontSize: 13, margin: 0, fontFamily: "'Cabinet Grotesk', sans-serif" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading} aria-label={mode === "signin" ? "Sign in" : "Create account"}
            style={{ padding: "15px", borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, border: "none", color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", boxShadow: `0 8px 24px ${theme.accentGlow}`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : (mode === "signin" ? "Sign In" : "Create Account")}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 18, color: theme.muted, fontSize: 14, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: theme.accent, cursor: "pointer", fontWeight: 700 }} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setForm({ name: "", email: "", password: "" }); }}>
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </GlassCard>
    </div>
  );
}

function ProfileModal({ theme, user, onClose, onUpdate, onLogout }) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    location: user.preferences?.location || "",
    favoriteCategories: user.preferences?.favoriteCategories || [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const categories = ["Movies", "Concerts", "Sports", "Tech", "Food"];

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      favoriteCategories: f.favoriteCategories.includes(cat)
        ? f.favoriteCategories.filter((c) => c !== cat)
        : [...f.favoriteCategories, cat],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const updated = updateUserProfile(user.id, {
      name: form.name,
      preferences: { ...user.preferences, location: form.location, favoriteCategories: form.favoriteCategories },
    });
    onUpdate(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <GlassCard style={{ width: "min(480px, 100%)", padding: "clamp(24px, 5vw, 36px)", position: "relative", border: `1px solid ${theme.accent}33`, maxHeight: "90vh", overflowY: "auto", animation: "slideDown 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
        <button onClick={onClose} aria-label="Close profile" style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: theme.muted, fontSize: 18 }}>×</button>


        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 26, color: "#fff", boxShadow: `0 4px 20px ${theme.accentGlow}`, flexShrink: 0 }}>
            {form.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 22, color: theme.text, margin: 0 }}>{form.name}</h2>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, color: theme.muted, margin: "4px 0 0" }}>{user.email}</p>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, color: theme.accent, background: `${theme.accent}18`, border: `1px solid ${theme.accent}33`, borderRadius: 6, padding: "2px 8px" }}>
              {user.provider === "email" ? "Email Account" : `${user.provider.charAt(0).toUpperCase() + user.provider.slice(1)} Account`}
            </span>
          </div>
        </div>


        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.muted, display: "block", marginBottom: 6 }}>Display Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-label="Display name"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div>
            <label style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.muted, display: "block", marginBottom: 6 }}>Email</label>
            <input value={user.email} disabled aria-label="Email (read only)"
              style={{ width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", color: theme.muted, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box", cursor: "not-allowed" }}
            />
          </div>

          <div>
            <label style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.muted, display: "block", marginBottom: 6 }}>Your City</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Delhi, Mumbai, Bangalore"
              aria-label="Your city"
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div>
            <label style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.muted, display: "block", marginBottom: 10 }}>Favourite Categories</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const active = form.favoriteCategories.includes(cat);
                return (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    aria-pressed={active}
                    style={{ padding: "7px 16px", borderRadius: 999, border: `1px solid ${active ? theme.accent : "rgba(255,255,255,0.12)"}`, background: active ? `${theme.accent}22` : "transparent", color: active ? theme.accent : theme.muted, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: "13px", borderRadius: 12, background: saved ? "#00d68f" : `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, border: "none", color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {saving ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : saved ? "✓ Saved!" : "Save Changes"}
            </button>
            <button onClick={() => { onLogout(); onClose(); }}
              style={{ padding: "13px 20px", borderRadius: 12, background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.3)", color: "#e63946", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.2s" }}>
              Logout
            </button>
          </div>
        </div>

        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, color: theme.muted, textAlign: "center", marginTop: 16 }}>
          Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </GlassCard>
    </div>
  );
}

function LandingPage({ theme, onExplore, onSignUp }) {
  const stats = [
    { value: "2.4M+", label: "Events Discovered" },
    { value: "180+", label: "Cities Covered" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(80px, 10vw, 100px) clamp(16px, 4vw, 32px) 60px", position: "relative", zIndex: 1 }}>

      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", maxWidth: 900 }}>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${theme.accentGlow}`, border: `1px solid ${theme.accent}44`, borderRadius: 999, padding: "8px 18px", marginBottom: 32, animation: "fadeIn 0.6s 0.2s both" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.accent, animation: "pulse 2s infinite" }} />
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: theme.accent, letterSpacing: "0.06em" }}>AI-POWERED EVENT DISCOVERY</span>
        </div>


        <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(44px, 7vw, 88px)", lineHeight: 1.05, color: theme.text, margin: "0 0 24px", animation: "fadeUp 0.8s 0.3s both" }}>
          Find Events That<br />
          <span style={{ color: theme.accent, position: "relative" }}>
            <TypeWriter words={["Move You", "Matter", "Inspire", "Connect You", "Transform You"]} />
          </span>
        </h1>

        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, color: theme.muted, maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.7, animation: "fadeUp 0.8s 0.5s both" }}>
          NexEvent AI learns your preferences to surface the perfect movies, concerts, sports events, and experiences — all in one intelligent platform.
        </p>


        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s 0.7s both" }}>
          <button onClick={onExplore}
            style={{ padding: "16px 36px", borderRadius: 14, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, border: "none", color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 17, cursor: "pointer", boxShadow: `0 8px 32px ${theme.accentGlow}`, transition: "all 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${theme.accentGlow}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 8px 32px ${theme.accentGlow}`; }}
          >
            Explore Events →
          </button>
          <button onClick={onSignUp}
            style={{ padding: "16px 36px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.15)`, color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 600, fontSize: 17, cursor: "pointer", transition: "all 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = theme.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
          >
            Watch Demo ▶
          </button>
        </div>


        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 72, flexWrap: "wrap", animation: "fadeUp 0.8s 0.9s both" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 36, color: theme.text }}>{s.value}</div>
              <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, color: theme.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}

function AboutSection({ theme }) {
  const [ref, visible] = useScrollReveal();
  const features = [
    { icon: "🧠", title: "AI-Powered Curation", desc: "Our AI learns your taste across 50+ data points to surface events you'll love, not just ones near you." },
    { icon: "🗺️", title: "Hyper-Local Discovery", desc: "Integrated with Google Maps & Places API for precise venue navigation and neighborhood insights." },
    { icon: "📅", title: "Smart Calendar Sync", desc: "One-click sync with Google Calendar, with travel time auto-calculated and reminders built-in." },
    { icon: "🎫", title: "Unified Ticketing", desc: "Book tickets from multiple platforms in one place. Compare prices, view seat maps, get alerts." },
    { icon: "👥", title: "Social Planning", desc: "Invite friends, see who's going, and coordinate meetups at events with real-time chat." },
    { icon: "⚡", title: "Instant Alerts", desc: "AI monitors price drops, cancellations, and similar events so you never miss what matters." },
  ];

  return (
    <section ref={ref} style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="theme-tag" style={{ marginBottom: 16 }}>Why NexEvent AI</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(32px, 4vw, 54px)", color: theme.text, margin: "0 0 16px" }}>
            Not just an event app.<br />Your <span style={{ color: theme.accent }}>experience intelligence</span>.
          </h2>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 18, color: theme.muted, maxWidth: 600, margin: "0 auto" }}>
            Built for people who care deeply about how they spend their time.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <GlassCard key={f.title} className={`card-hover reveal ${visible ? "visible" : ""}`}
              style={{ padding: 28, transitionDelay: `${i * 0.08}s` }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600, fontSize: 20, color: theme.text, margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, color: theme.muted, margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

const EVENTS_DATA = {
  movies: [
    { id: 1, title: "Dune: Messiah", date: "Apr 25, 2026", venue: "PVR IMAX, Connaught Place", price: "₹450", rating: 9.1, img: "🎬", tag: "Sci-Fi Epic" },
    { id: 2, title: "Phantom Hearts", date: "Apr 28, 2026", venue: "Cinepolis, Ambience", price: "₹380", rating: 8.4, img: "🎭", tag: "Thriller" },
    { id: 3, title: "The Last Horizon", date: "May 2, 2026", venue: "INOX, Saket", price: "₹420", rating: 8.7, img: "🚀", tag: "Adventure" },
    { id: 4, title: "Neon Requiem", date: "May 5, 2026", venue: "DT Cinemas, Vasant Kunj", price: "₹350", rating: 8.0, img: "🌆", tag: "Noir" },
  ],
  concerts: [
    { id: 5, title: "Arijit Singh Live", date: "May 10, 2026", venue: "Jawaharlal Nehru Stadium", price: "₹2,500", rating: 9.8, img: "🎤", tag: "Bollywood" },
    { id: 6, title: "Nucleya Bass Camp", date: "Apr 30, 2026", venue: "Pragati Maidan", price: "₹1,800", rating: 9.4, img: "🎧", tag: "EDM" },
    { id: 7, title: "When Chai Met Toast", date: "May 15, 2026", venue: "Siri Fort Auditorium", price: "₹1,200", rating: 8.9, img: "🎵", tag: "Indie Folk" },
    { id: 8, title: "Prateek Kuhad", date: "May 20, 2026", venue: "Hard Rock Café, Saket", price: "₹1,500", rating: 9.2, img: "🎸", tag: "Folk Rock" },
  ],
  sports: [
    { id: 9, title: "IPL: CSK vs MI", date: "Apr 24, 2026", venue: "Wankhede Stadium", price: "₹800", rating: 9.5, img: "🏏", tag: "Cricket" },
    { id: 10, title: "Pro Kabaddi Finals", date: "May 8, 2026", venue: "NSCI Dome, Mumbai", price: "₹500", rating: 8.8, img: "🏅", tag: "Kabaddi" },
    { id: 11, title: "ISL Derby: ATK vs FC", date: "Apr 27, 2026", venue: "Vivekananda Yuba Bharati", price: "₹600", rating: 8.6, img: "⚽", tag: "Football" },
    { id: 12, title: "BWF India Open", date: "May 12, 2026", venue: "Siri Fort Sports Complex", price: "₹700", rating: 9.0, img: "🏸", tag: "Badminton" },
  ],
  tech: [
    { id: 13, title: "Google I/O India", date: "May 14, 2026", venue: "HITEX Exhibition Centre", price: "Free", rating: 9.7, img: "🔬", tag: "AI Summit" },
    { id: 14, title: "Startup India 2026", date: "May 22, 2026", venue: "Bharat Mandapam", price: "₹500", rating: 9.3, img: "🚀", tag: "Startup" },
    { id: 15, title: "DevFest 2026", date: "May 18, 2026", venue: "Infosys Campus, Pune", price: "Free", rating: 8.9, img: "💻", tag: "Dev Conf" },
    { id: 16, title: "AI for India Summit", date: "Jun 1, 2026", venue: "India Expo Centre", price: "₹1,000", rating: 9.5, img: "🤖", tag: "Machine Learning" },
  ],
  food: [
    { id: 17, title: "Delhi Food Carnival", date: "Apr 26, 2026", venue: "Jawaharlal Nehru Park", price: "₹299", rating: 9.0, img: "🍛", tag: "Street Food" },
    { id: 18, title: "Wine & Cheese Evening", date: "May 3, 2026", venue: "The Leela Palace", price: "₹3,500", rating: 9.4, img: "🍷", tag: "Fine Dining" },
    { id: 19, title: "Vegan Fest India", date: "May 9, 2026", venue: "Hauz Khas Village", price: "Free", rating: 8.7, img: "🥗", tag: "Vegan" },
    { id: 20, title: "The Great BBQ Fest", date: "May 17, 2026", venue: "Kingdom of Dreams", price: "₹799", rating: 9.1, img: "🍖", tag: "BBQ" },
  ],
};

function EventCard({ event, theme, onClick }) {
  const [hovered, setHovered] = useState(false);

  const calendarUrl = () => getGoogleCalendarUrl({ title: event.title, date: formatDateForCalendar(event.date) || event.date, venue: event.venue, description: `${event.tag} at ${event.venue}` });

  const mapsUrl = getGoogleMapsUrl(event.venue);

  return (
    <GlassCard className="card-hover"
      style={{ padding: 0, overflow: "hidden", cursor: "pointer", border: hovered ? `1px solid ${theme.accent}55` : "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >

      <div style={{ height: 120, background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative" }}>
        {event.img}
        <div style={{ position: "absolute", top: 12, right: 12, background: `${theme.accent}22`, border: `1px solid ${theme.accent}44`, borderRadius: 999, padding: "3px 10px", fontSize: 11, color: theme.accent, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700 }}>{event.tag}</div>
      </div>
      <div style={{ padding: "16px 18px" }}>
        <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600, fontSize: 18, color: theme.text, margin: "0 0 6px" }}>{event.title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.muted }}>📅 {event.date}</div>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: "none" }}
            aria-label={`View ${event.venue} on Google Maps`}>
            📍 {event.venue} ↗
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 18, color: theme.accent }}>{event.price}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#f59e0b", fontSize: 13 }}>★</span>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: theme.text }}>{event.rating}</span>
          </div>
        </div>

        <a href={calendarUrl()} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ display: "block", width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 10, background: "rgba(66,133,244,0.12)", border: "1px solid rgba(66,133,244,0.3)", color: "#4285f4", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.25s", textAlign: "center", textDecoration: "none" }}
          aria-label={`Add ${event.title} to Google Calendar`}>
          + Add to Google Calendar
        </a>
        <button style={{ width: "100%", marginTop: 8, padding: "10px 0", borderRadius: 10, background: hovered ? theme.accent : "rgba(255,255,255,0.06)", border: `1px solid ${hovered ? theme.accent : "rgba(255,255,255,0.1)"}`, color: hovered ? "#fff" : theme.muted, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.25s" }}>
          Book Now →
        </button>
      </div>
    </GlassCard>
  );
}

function EventsSection({ theme, activeTheme, setActiveTheme, instant, apiEvents }) {
  const [ref, visible] = useScrollReveal();
  const show = instant || visible;
  const categories = [
    { key: "movies", label: "🎬 Movies", theme: "movies" },
    { key: "concerts", label: "🎵 Concerts", theme: "concerts" },
    { key: "sports", label: "⚽ Sports", theme: "sports" },
    { key: "tech", label: "💻 Tech", theme: "tech" },
    { key: "food", label: "🍜 Food", theme: "food" },
  ];
  const events = apiEvents?.[activeTheme] || EVENTS_DATA[activeTheme] || EVENTS_DATA.movies;

  return (
    <section ref={ref} style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className={`reveal ${show ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="theme-tag" style={{ marginBottom: 16 }}>Discover</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 4vw, 50px)", color: theme.text, margin: 0 }}>
            Events For Every <span style={{ color: theme.accent }}>Passion</span>
          </h2>
        </div>


        <div className={`reveal ${show ? "visible" : ""}`} style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map((c) => (
            <button key={c.key}
              onClick={() => setActiveTheme(c.theme)}
              style={{
                padding: "10px 22px", borderRadius: 999,
                background: activeTheme === c.theme ? theme.accent : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeTheme === c.theme ? theme.accent : "rgba(255,255,255,0.1)"}`,
                color: activeTheme === c.theme ? "#fff" : theme.muted,
                fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 600, fontSize: 14,
                cursor: "pointer", transition: "all 0.25s",
              }}>
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
          {events.map((e, i) => (
            <div key={e.id} className={`reveal ${show ? "visible" : ""}`} style={{ transitionDelay: instant ? "0s" : `${i * 0.07}s` }}>
              <EventCard event={e} theme={theme} onClick={() => { }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SubscriptionSection({ theme, onSignUp }) {
  const [ref, visible] = useScrollReveal();
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      price: annual ? "₹0" : "₹0",
      period: "forever",
      desc: "Discover events, bookmark favorites",
      features: ["Up to 10 event bookmarks", "Basic AI recommendations", "Email digest", "Community access"],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Pro",
      price: annual ? "₹599" : "₹79",
      period: annual ? "/year" : "/month",
      desc: "For the true experience seeker",
      features: ["Unlimited bookmarks", "Advanced AI curation", "Priority booking alerts", "Calendar sync", "Seat map view", "No ads"],
      cta: "Start Pro Trial",
      highlight: true,
    },
    {
      name: "Elite",
      price: annual ? "₹1,499" : "₹179",
      period: annual ? "/year" : "/month",
      desc: "For power users & event planners",
      features: ["Everything in Pro", "Group planning tools", "Exclusive pre-sale access", "Concierge support", "API access", "White-label reports"],
      cta: "Go Elite",
      highlight: false,
    },
  ];

  return (
    <section ref={ref} style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className={`reveal ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="theme-tag" style={{ marginBottom: 16 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 4vw, 50px)", color: theme.text, margin: "0 0 16px" }}>
            Invest in <span style={{ color: theme.accent }}>Experiences</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, color: annual ? theme.muted : theme.text }}>Monthly</span>
            <div onClick={() => setAnnual(!annual)}
              style={{ width: 52, height: 28, borderRadius: 14, background: annual ? theme.accent : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ position: "absolute", top: 4, left: annual ? 28 : 4, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.3s" }} />
            </div>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, color: annual ? theme.text : theme.muted }}>Annual <span style={{ color: theme.accent, fontSize: 12, fontWeight: 700 }}>Save 30%</span></span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {plans.map((p, i) => (
            <GlassCard key={p.name}
              className={`reveal ${visible ? "visible" : ""}`}
              style={{
                padding: "32px 28px",
                transitionDelay: `${i * 0.1}s`,
                border: p.highlight ? `1px solid ${theme.accent}` : "1px solid rgba(255,255,255,0.07)",
                position: "relative",
                overflow: "hidden",
              }}>
              {p.highlight && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}88)` }} />
              )}
              {p.highlight && (
                <div style={{ position: "absolute", top: 16, right: 16, background: theme.accent, color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 999, letterSpacing: "0.06em" }}>POPULAR</div>
              )}
              <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 22, color: theme.text, marginBottom: 4 }}>{p.name}</div>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, color: theme.muted, margin: "0 0 20px" }}>{p.desc}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 44, color: p.highlight ? theme.accent : theme.text }}>{p.price}</span>
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, color: theme.muted }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, color: theme.text, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: theme.accent, fontWeight: 700, fontSize: 16 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onSignUp}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: p.highlight ? theme.accent : "rgba(255,255,255,0.07)", border: `1px solid ${p.highlight ? theme.accent : "rgba(255,255,255,0.1)"}`, color: p.highlight ? "#fff" : theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={(e) => { if (!p.highlight) { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; } else { e.currentTarget.style.opacity = "0.88"; } }}
                onMouseLeave={(e) => { if (!p.highlight) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; } else { e.currentTarget.style.opacity = "1"; } }}>
                {p.cta}
              </button>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function AISection({ theme, user }) {
  const [ref, visible] = useScrollReveal();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm NexEvent AI 👋 Tell me what kind of events you love and I'll find the perfect match for you!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const SUGGESTIONS = [
    "Find concerts this weekend",
    "Best movies near me",
    "Sports events in Delhi",
    "Tech conferences in May",
    "Food festivals nearby",
    "Upcoming IPL matches",
  ];

  const getSmartReply = (text) => {
    const t = text.toLowerCase();
    const name = user?.name ? `, ${user.name}` : "";
    if (t.includes("movie") || t.includes("film") || t.includes("cinema"))
      return `Great choice${name}! Right now Dune: Messiah at PVR IMAX and Phantom Hearts at Cinepolis are trending. Dune is getting a 9.1 rating — highly recommended for sci-fi fans. Want me to check showtimes near you?`;
    if (t.includes("concert") || t.includes("music") || t.includes("live"))
      return `There are some amazing shows coming up${name}! Arijit Singh Live at JLN Stadium on May 10 is nearly sold out (rated 9.8), and Nucleya Bass Camp at Pragati Maidan on Apr 30 is perfect for EDM lovers. Grab tickets soon!`;
    if (t.includes("sport") || t.includes("cricket") || t.includes("ipl") || t.includes("football") || t.includes("match"))
      return `Big matches ahead${name}! IPL: CSK vs MI at Wankhede Stadium on Apr 24 is the hottest ticket in town. BWF India Open at Siri Fort on May 12 is also a great pick for badminton fans. Which sport are you into?`;
    if (t.includes("tech") || t.includes("conference") || t.includes("startup") || t.includes("ai"))
      return `Exciting tech events this season${name}! Google I/O India at HITEX on May 14 is free and rated 9.7 — a must-attend for developers. Startup India 2026 at Bharat Mandapam on May 22 is great for founders. Interested in any specific tech domain?`;
    if (t.includes("food") || t.includes("eat") || t.includes("restaurant") || t.includes("festival"))
      return `Foodies rejoice${name}! Delhi Food Carnival at JN Park on Apr 26 is free entry and packed with street food. Wine & Cheese Evening at The Leela Palace on May 3 is perfect for a premium experience. What's your vibe — casual or fine dining?`;
    if (t.includes("free") || t.includes("budget") || t.includes("cheap"))
      return `Plenty of free events${name}! Google I/O India (May 14), Delhi Food Carnival (Apr 26), and Vegan Fest India (May 9) are all free entry. Great way to explore without spending a rupee!`;
    if (t.includes("weekend") || t.includes("this week") || t.includes("nearby"))
      return `This weekend looks packed${name}! IPL CSK vs MI on Apr 24, Delhi Food Carnival on Apr 26, and Nucleya Bass Camp on Apr 30 are all happening soon. Which category interests you most?`;
    if (t.includes("venue") || t.includes("where") || t.includes("location")) {
      const suggestions = getPlacesSuggestions(text.split(" ").find(w => w.length > 3) || "Delhi");
      const venueList = suggestions.slice(0, 3).join(", ") || "PVR IMAX, Wankhede Stadium, Pragati Maidan";
      return `Here are some popular venues${name}: ${venueList}. Click any event card to get directions via Google Maps!`;
    }
    if (t.includes("calendar") || t.includes("remind") || t.includes("schedule"))
      return `You can add any event to Google Calendar directly from the event cards${name}! Just click the "+ Add to Google Calendar" button on any event.`;
    if (t.includes("hello") || t.includes("hi") || t.includes("hey"))
      return `Hey${name}! I'm your NexEvent AI assistant. I can help you find movies, concerts, sports events, tech conferences, and food festivals across India. What are you in the mood for today?`;
    return `I'd love to help you find the perfect event${name}! I cover movies, concerts, sports, tech conferences, and food festivals across India. Try asking something like "concerts this weekend" or "free events near me" to get started.`;
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setMessages((m) => [...m, { role: "assistant", text: getSmartReply(text) }]);
    setLoading(false);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <section ref={ref} style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className={`reveal ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="theme-tag" style={{ marginBottom: 16 }}>AI Assistant</div>
          <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(30px, 4vw, 50px)", color: theme.text, margin: "0 0 14px" }}>
            Your Smart <span style={{ color: theme.accent }}>Event Companion</span>
          </h2>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 17, color: theme.muted, maxWidth: 520, margin: "0 auto" }}>
            Ask anything — get instant, personalised event recommendations powered by AI.
          </p>
        </div>

        <div className={`reveal ${visible ? "visible" : ""}`}>
          <GlassCard style={{ maxWidth: 780, margin: "0 auto", overflow: "hidden", border: `1px solid ${theme.accent}33` }}>

            <div style={{ padding: "18px 24px", background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}06)`, borderBottom: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
              <div>
                <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: theme.text, fontSize: 16 }}>NexEvent AI</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#5a9e82", animation: "pulse 2s infinite" }} />
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, color: "#5a9e82" }}>Online — ready to help</span>
                </div>
              </div>
            </div>


            <div style={{ height: 340, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${theme.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "72%", padding: "12px 16px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: m.role === "user" ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : "rgba(255,255,255,0.06)",
                    color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, lineHeight: 1.6,
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.06)", borderRadius: "18px 18px 18px 4px", width: "fit-content", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: theme.accent, animation: `pulse 1s ${d * 0.2}s infinite` }} />
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>


            {messages.length <= 2 && (
              <div style={{ padding: "0 24px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{ padding: "7px 14px", borderRadius: 999, border: `1px solid ${theme.accent}44`, background: `${theme.accent}0e`, color: theme.accent, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${theme.accent}22`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${theme.accent}0e`; }}
                  >{s}</button>
                ))}
              </div>
            )}


            <div style={{ padding: "14px 20px", borderTop: `1px solid rgba(255,255,255,0.06)`, display: "flex", gap: 10 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask me anything about events..."
                aria-label="Ask AI assistant about events"
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: "12px 16px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, outline: "none" }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <button onClick={() => sendMessage(input)} disabled={loading}
                style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                ↑
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function AIAssistant({ theme, user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm NexEvent AI 👋 Tell me what kind of events you love and I'll find the perfect match for you!", ts: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const SUGGESTIONS = [
    "Find concerts this weekend",
    "Best movies near me",
    "Sports events in Delhi",
    "Tech conferences in May",
  ];

  const getSmartReply = (text) => {
    const t = text.toLowerCase();
    const name = user?.name ? `, ${user.name}` : "";
    if (t.includes("movie") || t.includes("film") || t.includes("cinema"))
      return `Great choice${name}! Right now Dune: Messiah at PVR IMAX and Phantom Hearts at Cinepolis are trending. Dune is getting a 9.1 rating — highly recommended for sci-fi fans. Want me to check showtimes near you?`;
    if (t.includes("concert") || t.includes("music") || t.includes("live"))
      return `There are some amazing shows coming up${name}! Arijit Singh Live at JLN Stadium on May 10 is nearly sold out (rated 9.8), and Nucleya Bass Camp at Pragati Maidan on Apr 30 is perfect for EDM lovers. Grab tickets soon!`;
    if (t.includes("sport") || t.includes("cricket") || t.includes("ipl") || t.includes("football") || t.includes("match"))
      return `Big matches ahead${name}! IPL: CSK vs MI at Wankhede Stadium on Apr 24 is the hottest ticket in town. BWF India Open at Siri Fort on May 12 is also a great pick for badminton fans. Which sport are you into?`;
    if (t.includes("tech") || t.includes("conference") || t.includes("startup") || t.includes("ai"))
      return `Exciting tech events this season${name}! Google I/O India at HITEX on May 14 is free and rated 9.7 — a must-attend for developers. Startup India 2026 at Bharat Mandapam on May 22 is great for founders. Interested in any specific tech domain?`;
    if (t.includes("food") || t.includes("eat") || t.includes("restaurant") || t.includes("festival"))
      return `Foodies rejoice${name}! Delhi Food Carnival at JN Park on Apr 26 is free entry and packed with street food. Wine & Cheese Evening at The Leela Palace on May 3 is perfect for a premium experience. What's your vibe — casual or fine dining?`;
    if (t.includes("free") || t.includes("budget") || t.includes("cheap"))
      return `Plenty of free events${name}! Google I/O India (May 14), Delhi Food Carnival (Apr 26), and Vegan Fest India (May 9) are all free entry. Great way to explore without spending a rupee!`;
    if (t.includes("weekend") || t.includes("this week") || t.includes("nearby"))
      return `This weekend looks packed${name}! IPL CSK vs MI on Apr 24, Delhi Food Carnival on Apr 26, and Nucleya Bass Camp on Apr 30 are all happening soon. Which category interests you most?`;
    if (t.includes("venue") || t.includes("where") || t.includes("location")) {
      const suggestions = getPlacesSuggestions(text.split(" ").find(w => w.length > 3) || "Delhi");
      const venueList = suggestions.slice(0, 3).join(", ") || "PVR IMAX, Wankhede Stadium, Pragati Maidan";
      return `Here are some popular venues${name}: ${venueList}. Click any event card to get directions via Google Maps!`;
    }
    if (t.includes("calendar") || t.includes("remind") || t.includes("schedule"))
      return `You can add any event to Google Calendar directly from the event cards${name}! Just click the "+ Add to Google Calendar" button on any event.`;
    if (t.includes("hello") || t.includes("hi") || t.includes("hey"))
      return `Hey${name}! I'm your NexEvent AI assistant. I can help you find movies, concerts, sports events, tech conferences, and food festivals across India. What are you in the mood for today?`;
    return `I'd love to help you find the perfect event${name}! I cover movies, concerts, sports, tech conferences, and food festivals across India. Try asking something like "concerts this weekend" or "free events near me" to get started.`;
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setMessages((m) => [...m, { role: "assistant", text: getSmartReply(text), ts: new Date() }]);
    setLoading(false);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <>

      {open && (
        <div style={{ position: "fixed", bottom: 28, right: 28, left: "auto", zIndex: 900, width: "min(380px, calc(100vw - 32px))", height: "min(540px, calc(100vh - 100px))", display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", border: `1px solid ${theme.accent}44`, boxShadow: `0 24px 80px rgba(0,0,0,0.6)`, animation: "slideDown 0.3s cubic-bezier(0.16,1,0.3,1)" }}>

          <div style={{ padding: "16px 20px", background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}08)`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${theme.accent}22`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: theme.text, fontSize: 15 }}>NexEvent AI</div>
                <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, color: theme.accent }}>● Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: theme.muted, fontSize: 16 }}>×</button>
          </div>


          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12, background: `${theme.bg}ee`, backdropFilter: "blur(20px)" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? theme.accent : "rgba(255,255,255,0.07)",
                  color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.07)", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent, animation: `pulse 1s ${d * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>


          {messages.length <= 2 && (
            <div style={{ padding: "8px 12px", background: `${theme.bg}ee`, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${theme.accent}44`, background: `${theme.accent}11`, color: theme.accent, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          )}


          <div style={{ padding: "12px 16px", background: `${theme.surface}ee`, backdropFilter: "blur(20px)", borderTop: `1px solid rgba(255,255,255,0.06)`, display: "flex", gap: 8 }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask me anything about events..."
              style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", color: theme.text, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, outline: "none" }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading}
              style={{ width: 42, height: 42, borderRadius: 12, background: theme.accent, border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ↑
            </button>
          </div>
        </div>
      )}


      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 901,
          width: 56, height: 56, borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
          border: "none", cursor: "pointer",
          boxShadow: `0 8px 32px ${theme.accentGlow}, 0 0 0 4px ${theme.accent}22`,
          display: open ? "none" : "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 24, transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        🤖
      </button>
    </>
  );
}

const CROWD_VENUES = {
  movie: {
    label: "Movie", icon: "🎬", sub: "Cinema",
    zones: [
      { icon: "🎟️", name: "Ticket Counter" },
      { icon: "🚪", name: "Main Entry Gate" },
      { icon: "🚻", name: "Washroom (Screen 1-2)" },
      { icon: "🚻", name: "Washroom (Screen 3-4)" },
      { icon: "🍔", name: "Food Court" },
      { icon: "🍿", name: "Snack Bar" },
      { icon: "🛍️", name: "Merchandise" },
      { icon: "🅿️", name: "Parking Entry" },
    ],
  },
  stadium: {
    label: "Stadium", icon: "🏟️", sub: "Sports",
    zones: [
      { icon: "🎟️", name: "Gate A Entry" },
      { icon: "🎟️", name: "Gate B Entry" },
      { icon: "🚻", name: "Washroom (North)" },
      { icon: "🚻", name: "Washroom (South)" },
      { icon: "🍔", name: "Food Stall 1" },
      { icon: "🍔", name: "Food Stall 2" },
      { icon: "🛍️", name: "Fan Store" },
      { icon: "🅿️", name: "Parking Lot" },
    ],
  },
  concert: {
    label: "Concert", icon: "🎵", sub: "Music",
    zones: [
      { icon: "🚪", name: "Main Entry" },
      { icon: "🎟️", name: "Ticket Verification" },
      { icon: "🚻", name: "Washroom (Left Wing)" },
      { icon: "🚻", name: "Washroom (Right Wing)" },
      { icon: "🍺", name: "Bar Counter" },
      { icon: "🍔", name: "Food Zone" },
      { icon: "🛍️", name: "Merch Booth" },
      { icon: "🅿️", name: "Parking Entry" },
    ],
  },
};

function useLiveCrowd(zones) {
  const [data, setData] = useState(() =>
    zones.map(() => ({ pct: Math.floor(Math.random() * 30) + 2 }))
  );
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) =>
        prev.map((d) => {
          const delta = (Math.random() - 0.48) * 6;
          const next = Math.min(95, Math.max(1, d.pct + delta));
          return { pct: Math.round(next) };
        })
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);
  return data;
}

function CrowdBar({ pct, accent }) {
  const color = pct < 35 ? "#00d68f" : pct < 65 ? "#ff9f43" : "#e63946";
  const label = pct < 35 ? "LOW" : pct < 65 ? "MED" : "HIGH";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: "min(120px, 30vw)", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 1.8s ease" }} />
      </div>
      <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{pct}%</span>
      <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color, background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 4, padding: "1px 7px" }}>{label}</span>
    </div>
  );
}

function CircleGauge({ pct, label, accent }) {
  const color = pct < 35 ? "#00d68f" : pct < 65 ? "#ff9f43" : "#e63946";
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={70} height={70} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={35} cy={35} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
        <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.8s ease" }} />
      </svg>
      <div style={{ marginTop: -52, fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 14, color, textAlign: "center" }}>{pct}%</div>
      <div style={{ marginTop: 18, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>{label}</div>
    </div>
  );
}

function CrowdIntelligence({ theme, activeThemeKey }) {
  const [ref, visible] = useScrollReveal();
  const [aiTab, setAiTab] = useState(0);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const venueKey = useMemo(() => {
    if (["concerts"].includes(activeThemeKey)) return "concert";
    if (["sports"].includes(activeThemeKey)) return "stadium";
    return "movie"; // movies, tech, food, home all default to movie layout
  }, [activeThemeKey]);

  const venue = CROWD_VENUES[venueKey];
  const crowdData = useLiveCrowd(venue.zones);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setAiResult(""); setAiTab(0); }, [venueKey]);

  const aiZones = venue.zones.map((z) => z.name);

  const handleAISuggestion = async () => {
    setAiLoading(true);
    setAiResult("");
    const zone = aiZones[aiTab];
    const zoneData = crowdData[aiTab];
    await new Promise((r) => setTimeout(r, 900));
    const pct = zoneData?.pct ?? 10;
    const msg =
      pct < 35
        ? `Conditions are great — head over now!`
        : pct < 65
          ? `Moderate crowd at ${zone}. Best to wait 5–10 mins.`
          : `High crowd at ${zone}. Consider waiting 15–20 mins or use alternate entry.`;
    setAiResult(msg);
    setAiLoading(false);
  };

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <section ref={ref} style={{ padding: "clamp(60px, 8vw, 80px) clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>


        <div className={`reveal ${visible ? "visible" : ""}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="theme-tag" style={{ marginBottom: 10, letterSpacing: "0.1em" }}>Smart Crowd Intelligence</div>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 48px)", color: theme.text, margin: 0, lineHeight: 1.1 }}>
              Know Before<br /><span style={{ color: theme.accent }}>You Go</span>
            </h2>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, color: theme.muted, marginTop: 10, maxWidth: 340 }}>
              Real-time venue analytics — skip the queues, enjoy the moment.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(230,57,70,0.12)", border: "1px solid rgba(230,57,70,0.3)", borderRadius: 999, padding: "8px 16px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e63946", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: "#e63946" }}>LIVE UPDATES</span>
            </div>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, color: theme.muted }}>{timeStr}</span>
          </div>
        </div>


        <div className={`reveal ${visible ? "visible" : ""}`}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>


          <GlassCard style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>📊</span>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 18, color: theme.text }}>Live Wait Times</span>
              </div>
              <div style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}44`, borderRadius: 8, padding: "4px 12px", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: theme.accent }}>
                🎬 Active Scene
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {venue.zones.map((z, i) => {
                const pct = crowdData[i]?.pct ?? 5;
                const wait = Math.max(1, Math.round(pct / 10));
                return (
                  <div key={z.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{z.icon}</span>
                        <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: theme.text }}>{z.name}</span>
                      </div>
                      <CrowdBar pct={pct} accent={theme.accent} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 28, color: pct < 35 ? "#00d68f" : pct < 65 ? "#ff9f43" : "#e63946" }}>{wait}</div>
                      <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: theme.muted }}>MIN WAIT</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>


          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>


            <GlassCard style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 18, color: theme.text }}>AI Recommendation</span>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {aiZones.map((z, i) => (
                  <button key={z} onClick={() => { setAiTab(i); setAiResult(""); }}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${aiTab === i ? theme.accent : "rgba(255,255,255,0.1)"}`, background: aiTab === i ? `${theme.accent}22` : "transparent", color: aiTab === i ? theme.accent : theme.muted, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{venue.zones[i]?.icon}</span>{z}
                  </button>
                ))}
              </div>
              <button onClick={handleAISuggestion} disabled={aiLoading}
                style={{ width: "100%", padding: "13px", borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, border: "none", color: "#fff", fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
                {aiLoading
                  ? <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : "✦ Get AI Suggestion"}
              </button>
              {aiResult && (
                <div style={{ padding: "12px 16px", background: "rgba(0,214,143,0.08)", border: "1px solid rgba(0,214,143,0.25)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "#00d68f", fontSize: 18, marginTop: 1 }}>✓</span>
                  <div>
                    <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: "#00d68f", letterSpacing: "0.08em", marginBottom: 4 }}>GO NOW</div>
                    <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, color: theme.text }}>{aiResult}</div>
                  </div>
                </div>
              )}
            </GlassCard>


            <GlassCard style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 20 }}>⏱️</span>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 18, color: theme.text }}>Crowd Overview</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {["Entry", "Food Court", "Washroom"].map((label, i) => (
                  <CircleGauge key={label} pct={crowdData[i]?.pct ?? 6} label={label} accent={theme.accent} />
                ))}
              </div>

              <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, color: theme.muted }}>Overall Venue Capacity</span>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: theme.text }}>
                    {Math.round(crowdData.reduce((a, d) => a + d.pct, 0) / crowdData.length)}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, transition: "width 1.8s ease",
                    width: `${Math.round(crowdData.reduce((a, d) => a + d.pct, 0) / crowdData.length)}%`,
                    background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}88)`
                  }} />
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ theme }) {
  return (
    <footer style={{ padding: "60px 60px 40px", position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: "#fff", fontSize: 14 }}>N</div>
              <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: theme.text, fontSize: 18 }}>NexEvent <span style={{ color: theme.accent }}>AI</span></span>
            </div>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: theme.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>Your AI-powered companion for discovering, booking, and experiencing the best events around you.</p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy", "Terms", "Cookies", "GDPR"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 600, color: theme.text, fontSize: 15, margin: "0 0 16px" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l} style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: theme.muted, fontSize: 14, cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={(e) => e.target.style.color = theme.accent}
                    onMouseLeave={(e) => e.target.style.color = theme.muted}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: theme.muted, fontSize: 13 }}>© 2026 NexEvent AI</p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <span key={s} style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: theme.muted, fontSize: 13, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.target.style.color = theme.accent}
                onMouseLeave={(e) => e.target.style.color = theme.muted}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [activeThemeKey, setActiveThemeKey] = useState("home");
  const [authModal, setAuthModal] = useState(null);
  const [user, setUser] = useState(() => getCurrentUser());
  const [explored, setExplored] = useState(false);
  const [instantReveal, setInstantReveal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [apiEvents, setApiEvents] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/events')
      .then(res => res.json())
      .then(data => setApiEvents(data))
      .catch(err => console.error("API Fetch Error:", err));
  }, []);

  const theme = useMemo(() => THEMES[activeThemeKey] || THEMES.home, [activeThemeKey]);

  const eventsRef = useRef(null);
  const pricingRef = useRef(null);
  const aboutRef = useRef(null);

  const handleThemeChange = (tk) => setActiveThemeKey(tk);

  const handleAuth = (userData) => {
    setUser(userData);
    setAuthModal(null);
    if (!explored) setExplored(true);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setProfileOpen(false);
  };

  const handleNav = (v) => {
    if (v === "home") {
      setExplored(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (v === "events") {
      setInstantReveal(true);
      setExplored(true);
      setTimeout(() => {
        eventsRef.current?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => setInstantReveal(false), 600);
      }, 50);
      return;
    }
    if (!explored) setExplored(true);
    setTimeout(() => {
      const map = { pricing: pricingRef, about: aboutRef };
      map[v]?.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.gradient, color: theme.text, transition: "background 0.6s ease, color 0.3s" }}>
      <FontLink />
      <ThreeBackground theme={theme} />

      <Navbar
        theme={theme}
        onSignIn={() => setAuthModal("signin")}
        onSignUp={() => setAuthModal("signup")}
        onNav={handleNav}
        user={user}
        onLogout={handleLogout}
        onProfile={() => setProfileOpen(true)}
      />

      <main style={{ position: "relative", zIndex: 1 }}>
        {!explored ? (
          <>
            <LandingPage theme={theme} onExplore={() => handleNav("events")} onSignUp={() => setAuthModal("signup")} />
            <div ref={aboutRef}><AboutSection theme={theme} /></div>

            <section style={{ padding: "clamp(40px, 6vw, 60px) clamp(20px, 5vw, 60px)", position: "relative", zIndex: 1 }}>
              <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <GlassCard style={{ padding: "clamp(24px, 4vw, 40px) clamp(20px, 4vw, 48px)", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", border: `1px solid ${theme.accent}33` }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div className="theme-tag" style={{ marginBottom: 12 }}>Google Services</div>
                    <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3vw, 28px)", color: theme.text, margin: "0 0 10px" }}>Powered by Google's Ecosystem</h3>
                    <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", color: theme.muted, fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                      NexEvent AI integrates with Google Maps, Calendar, OAuth, Vertex AI, Places API, and Gemini.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["Maps API", "Calendar API", "OAuth 2.0", "Vertex AI", "Places API", "Gemini"].map((svc) => (
                      <div key={svc} style={{ padding: "7px 14px", borderRadius: 999, background: `${theme.accent}15`, border: `1px solid ${theme.accent}33`, color: theme.accent, fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700 }}>{svc}</div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </section>

            <div ref={pricingRef}><SubscriptionSection theme={theme} onSignUp={() => setAuthModal("signup")} /></div>
          </>
        ) : (
          <>
            <div style={{ height: 80 }} />
            <div ref={eventsRef}>
              <EventsSection
                theme={theme}
                activeTheme={activeThemeKey === "home" ? "movies" : activeThemeKey}
                setActiveTheme={(t) => handleThemeChange(t)}
                instant={instantReveal}
                apiEvents={apiEvents}
              />
            </div>
            <CrowdIntelligence data={apiEvents?.movies || EVENTS_DATA.movies} theme={theme} />
            <div ref={pricingRef}><SubscriptionSection theme={theme} onSignUp={() => setAuthModal("signup")} /></div>
            <div ref={aboutRef}><AboutSection theme={theme} /></div>
          </>
        )}
      </main>

      <Footer theme={theme} />

      {authModal && (
        <AuthModal
          theme={theme}
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onAuth={handleAuth}
          setMode={setAuthModal}
        />
      )}

      {profileOpen && user && (
        <ProfileModal
          theme={theme}
          user={user}
          onClose={() => setProfileOpen(false)}
          onUpdate={(updated) => setUser(updated)}
          onLogout={handleLogout}
        />
      )}

      <AIAssistant theme={theme} user={user} />
    </div>
  );
}




