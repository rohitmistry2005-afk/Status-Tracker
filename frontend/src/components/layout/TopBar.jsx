/**
 * TopBar.jsx
 *
 * Features:
 *  - Dynamic page title + breadcrumb based on current route
 *  - Live clock (updates every second)
 *  - Keyboard shortcut hint display (toggles with ?)
 *  - Notification bell with unread badge
 *  - API connection indicator (pings /evaluation/health every 30 s)
 *  - User avatar dropdown stub
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchHealth } from "../../api/evaluationApi.js";

// ─── Route metadata ───────────────────────────────────────────────────────────

const PAGE_META = {
  "/dashboard": {
    title: "Dashboard",
    crumbs: ["Home", "Dashboard"],
    sub: "Evaluation overview & live stats",
    shortcut: "G D",
  },
  "/evaluate": {
    title: "Evaluate",
    crumbs: ["Home", "Evaluate"],
    sub: "Single candidate evaluation pipeline",
    shortcut: "G E",
  },
  "/batch": {
    title: "Batch",
    crumbs: ["Home", "Batch"],
    sub: "Multi-candidate batch processing",
    shortcut: "G B",
  },
  "/health": {
    title: "API Health",
    crumbs: ["Home", "Health"],
    sub: "Backend connectivity & endpoint status",
    shortcut: "G H",
  },
};

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--text-muted)",
        letterSpacing: "0.04em",
        minWidth: 55,
        textAlign: "right",
      }}
    >
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

// ─── API status dot ───────────────────────────────────────────────────────────

function ApiStatusDot() {
  const [status, setStatus] = useState("unknown"); // "up" | "down" | "unknown"
  const intervalRef = useRef(null);

  const check = useCallback(async () => {
    try {
      await fetchHealth();
      setStatus("up");
    } catch {
      setStatus("down");
    }
  }, []);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [check]);

  const color =
    status === "up" ? "var(--green)" : status === "down" ? "var(--red)" : "var(--amber)";
  const label =
    status === "up" ? "API Online" : status === "down" ? "API Offline" : "Checking…";

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 7, cursor: "default" }}
      title={`Backend status: ${label}`}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          boxShadow: status === "up" ? `0 0 6px ${color}` : "none",
          transition: "background 0.4s, box-shadow 0.4s",
        }}
      />
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

// ─── Keyboard shortcuts overlay ───────────────────────────────────────────────

const SHORTCUTS = [
  { key: "G D", action: "Go to Dashboard" },
  { key: "G E", action: "Go to Evaluate" },
  { key: "G B", action: "Go to Batch" },
  { key: "G H", action: "Go to Health" },
  { key: "?",   action: "Toggle this help" },
];

function ShortcutsOverlay({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: 28,
          minWidth: 320,
          maxWidth: 400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            Keyboard Shortcuts
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        {SHORTCUTS.map(({ key, action }) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 0",
              borderBottom: "1px solid var(--border)",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>{action}</span>
            <kbd
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                letterSpacing: "0.06em",
              }}
            >
              {key}
            </kbd>
          </div>
        ))}
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 14, textAlign: "center" }}>
          Press <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = PAGE_META[pathname] || { title: "TeacherEval", crumbs: ["Home"], sub: "" };
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Global keyboard shortcut handler (G+D, G+E, etc.)
  useEffect(() => {
    let gPressed = false;
    let gTimer = null;

    function onKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "?") {
        setShowShortcuts((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setShowShortcuts(false);
        return;
      }
      if (e.key.toLowerCase() === "g") {
        gPressed = true;
        gTimer = setTimeout(() => { gPressed = false; }, 1200);
        return;
      }
      if (gPressed) {
        clearTimeout(gTimer);
        gPressed = false;
        const map = { d: "/dashboard", e: "/evaluate", b: "/batch", h: "/health" };
        const dest = map[e.key.toLowerCase()];
        if (dest) navigate(dest);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  return (
    <>
      <header
        style={{
          gridColumn: "2",
          gridRow: "1",
          height: "var(--topbar-height)",
          background: "#0b0c0f",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          position: "sticky",
          top: 0,
          zIndex: 9,
          gap: 20,
        }}
      >
        {/* Left: Breadcrumb + subtitle */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            {meta.crumbs.map((crumb, i) => (
              <React.Fragment key={crumb}>
                <span
                  style={{
                    fontSize: 12,
                    color: i === meta.crumbs.length - 1 ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: i === meta.crumbs.length - 1 ? 600 : 400,
                  }}
                >
                  {crumb}
                </span>
                {i < meta.crumbs.length - 1 && (
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>›</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1 }}>{meta.sub}</p>
        </div>

        {/* Right: status + clock + help + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <ApiStatusDot />
          <LiveClock />

          {/* Shortcut hint */}
          <button
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 11,
              padding: "3px 8px",
              fontFamily: "var(--font-mono)",
              transition: "border-color var(--transition), color var(--transition)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            ?
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--accent-dim)",
              border: "1px solid rgba(108,140,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--accent)",
              cursor: "default",
              userSelect: "none",
              flexShrink: 0,
            }}
            title="Logged in as Admin"
          >
            A
          </div>
        </div>
      </header>

      {showShortcuts && <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />}
    </>
  );
}