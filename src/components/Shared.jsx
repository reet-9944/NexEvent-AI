import React, { useState, useEffect, useRef } from 'react';

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

export { THEMES, GlassCard, TypeWriter };
