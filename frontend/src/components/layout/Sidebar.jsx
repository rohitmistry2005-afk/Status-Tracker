/**
 * Sidebar.jsx
 *
 * Features:
 *  - Collapsible to icon-only mini mode (toggle button at bottom)
 *  - Active route highlight with animated left border
 *  - Evaluation count badge on Evaluate nav item (from AppContext history)
 *  - Keyboard-shortcut hint on each nav item
 *  - Footer with docs link + version
 *  - Smooth width transition between full (240px) and mini (60px)
 */

import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../App.jsx";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: "⬡",
    label: "Dashboard",
    shortcut: "G D",
    description: "Overview & stats",
  },
  {
    to: "/evaluate",
    icon: "◈",
    label: "Evaluate",
    shortcut: "G E",
    description: "Single candidate",
    badgeKey: "history", // show count from evaluationHistory
  },
  {
    to: "/batch",
    icon: "◫",
    label: "Batch",
    shortcut: "G B",
    description: "Multi-candidate",
  },
  {
    to: "/health",
    icon: "◉",
    label: "API Health",
    shortcut: "G H",
    description: "Backend status",
  },
];

// ─── Single nav link ──────────────────────────────────────────────────────────

function NavItem({ item, collapsed, badge }) {
  const baseStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: collapsed ? "10px 0" : "9px 12px",
    borderRadius: collapsed ? 0 : "var(--radius-md)",
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-secondary)",
    transition: "all 0.18s ease",
    textDecoration: "none",
    border: "1px solid transparent",
    position: "relative",
    justifyContent: collapsed ? "center" : "flex-start",
    overflow: "hidden",
    whiteSpace: "nowrap",
  };

  const activeStyle = {
    background: collapsed ? "transparent" : "var(--accent-dim)",
    color: "var(--accent)",
    border: collapsed ? "1px solid transparent" : "1px solid rgba(108,140,255,0.2)",
    fontWeight: 500,
  };

  return (
    <NavLink
      to={item.to}
      title={collapsed ? `${item.label} (${item.shortcut})` : ""}
      style={({ isActive }) => ({
        ...baseStyle,
        ...(isActive ? activeStyle : {}),
      })}
    >
      {({ isActive }) => (
        <>
          {/* Active left border indicator (full mode only) */}
          {isActive && !collapsed && (
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "20%",
                height: "60%",
                width: 3,
                background: "var(--accent)",
                borderRadius: "0 3px 3px 0",
              }}
            />
          )}

          {/* Icon */}
          <span
            style={{
              fontSize: 17,
              width: 22,
              textAlign: "center",
              flexShrink: 0,
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              transition: "color 0.18s",
            }}
          >
            {item.icon}
          </span>

          {/* Label + description (hidden in mini mode) */}
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ lineHeight: 1.2 }}>{item.label}</div>
              <div style={{ fontSize: 10, color: isActive ? "var(--accent)" : "var(--text-muted)", opacity: 0.8, marginTop: 1 }}>
                {item.description}
              </div>
            </div>
          )}

          {/* Badge */}
          {!collapsed && badge != null && badge > 0 && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "var(--accent)",
                color: "#fff",
                borderRadius: "100px",
                padding: "1px 6px",
                flexShrink: 0,
                fontFamily: "var(--font-mono)",
              }}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}

          {/* Shortcut (full mode, not active) */}
          {!collapsed && !isActive && (
            <kbd
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                opacity: 0.6,
                flexShrink: 0,
              }}
            >
              {item.shortcut}
            </kbd>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed = false, onToggle }) {
  const ctx = useContext(AppContext);
  const historyCount = ctx?.evaluationHistory?.length ?? 0;
  const navigate = useNavigate();

  const width = collapsed ? 60 : 240;

  return (
    <aside
      style={{
        gridColumn: "1",
        gridRow: "1 / 3",
        width,
        minWidth: width,
        maxWidth: width,
        background: "#0b0c0f",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10,
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s, max-width 0.22s",
        overflow: "hidden",
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 16px" : "0 16px",
          borderBottom: "1px solid var(--border)",
          gap: 10,
          flexShrink: 0,
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
        onClick={() => navigate("/dashboard")}
        title="Go to Dashboard"
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          T
        </div>
        {!collapsed && (
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 17,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            TeacherEval
          </span>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "16px 8px" : "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Section label */}
        {!collapsed && (
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", padding: "4px 12px 8px", whiteSpace: "nowrap" }}>
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            badge={item.badgeKey === "history" ? historyCount : null}
          />
        ))}

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0 8px" }} />

        {/* Docs link */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "Swagger Docs" : ""}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px 0" : "9px 12px",
            borderRadius: "var(--radius-md)",
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "color 0.18s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <span style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>⎋</span>
          {!collapsed && <span>Swagger Docs ↗</span>}
        </a>
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: collapsed ? "12px 8px" : "12px 16px",
          flexShrink: 0,
        }}
      >
        {/* Collapse toggle button */}
        <button
        onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            width: "100%",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: 12,
            padding: "8px 10px",
            transition: "border-color 0.18s, color 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <span style={{ fontSize: 14 }}>{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Version (full mode only) */}
        {!collapsed && (
          <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10, fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
            TeacherEval v1.0.0
            <br />
            FastAPI · Python · React
          </p>
        )}
      </div>
    </aside>
  );
}