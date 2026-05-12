/**
 * shared/LoadingSpinner.jsx
 *
 * Exports:
 *   default  LoadingSpinner   — spinning arc with optional label
 *   named    PulseLoader      — three dot pulse animation
 *   named    SkeletonBlock    — rectangular shimmer placeholder
 *   named    SkeletonCard     — full card shimmer (score breakdown shape)
 *   named    ErrorAlert       — rich error display with retry + detail
 *   named    EmptyState       — "no results yet" placeholder
 */

import React, { useState, useEffect, useRef } from "react";

// ─── CSS keyframes injected once ─────────────────────────────────────────────

const KEYFRAMES = `
@keyframes te-spin  { to { transform: rotate(360deg); } }
@keyframes te-pulse { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
@keyframes te-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
`;

let keyframesInjected = false;
function ensureKeyframes() {
  if (keyframesInjected) return;
  const style = document.createElement("style");
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  keyframesInjected = true;
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {string}  [props.label]      Text shown below the spinner
 * @param {number}  [props.size=36]    Diameter in px
 * @param {string}  [props.color]      CSS color (defaults to --accent)
 * @param {boolean} [props.inline]     If true, renders inline without centre padding
 */
export function LoadingSpinner({
  label = "Loading…",
  size = 36,
  color = "var(--accent)",
  inline = false,
}) {
  useEffect(() => ensureKeyframes(), []);

  const strokeWidth = size * 0.13;
  const radius = (size - strokeWidth * 2) / 2;

  const wrapper = inline
    ? { display: "inline-flex", alignItems: "center", gap: 10 }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "40px 0",
      };

  return (
    <div style={wrapper} role="status" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ animation: "te-spin 0.85s linear infinite", flexShrink: 0 }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Arc */}
        <path
          d={`
            M ${size / 2} ${strokeWidth}
            A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size / 2}
          `}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <p
          style={{
            fontSize: inline ? 13 : 13,
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;

// ─── PulseLoader ──────────────────────────────────────────────────────────────

export function PulseLoader({ color = "var(--accent)", size = 8, gap = 6 }) {
  useEffect(() => ensureKeyframes(), []);
  return (
    <div
      style={{ display: "inline-flex", alignItems: "center", gap }}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            animation: `te-pulse 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── SkeletonBlock ────────────────────────────────────────────────────────────

export function SkeletonBlock({ width = "100%", height = 16, radius = 6, style = {} }) {
  useEffect(() => ensureKeyframes(), []);
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, var(--bg-input) 25%, var(--border) 50%, var(--bg-input) 75%)",
        backgroundSize: "800px 100%",
        animation: "te-shimmer 1.4s linear infinite",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
// Mimics the shape of the ScoreBreakdown card during loading

export function SkeletonCard() {
  const rows = [100, 85, 70, 90, 60, 75, 55]; // different bar widths %
  return (
    <div
      className="card"
      aria-hidden="true"
      style={{ display: "flex", flexDirection: "column", gap: 0 }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonBlock width={120} height={13} />
          <SkeletonBlock width={200} height={11} />
        </div>
        <SkeletonBlock width={60} height={44} radius={8} />
      </div>
      {/* Score rows */}
      {rows.map((w, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <SkeletonBlock width={`${30 + i * 8}%`} height={12} />
            <SkeletonBlock width={30} height={12} />
          </div>
          <div style={{ background: "var(--bg-input)", borderRadius: 100, height: 6, overflow: "hidden" }}>
            <SkeletonBlock width={`${w}%`} height={6} radius={100} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ErrorAlert ───────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {string}   props.message      Primary error message
 * @param {string}   [props.title]      Title (defaults to "Evaluation Error")
 * @param {string}   [props.detail]     Technical detail (shown in collapsible)
 * @param {function} [props.onDismiss]  Called when × is clicked
 * @param {function} [props.onRetry]    If provided, shows a Retry button
 */
export function ErrorAlert({ message, title = "Error", detail, onDismiss, onRetry }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div
      role="alert"
      style={{
        background: "var(--red-dim)",
        border: "1px solid rgba(248,113,113,0.28)",
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ color: "var(--red)", fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", marginBottom: 3 }}>
            {title}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Actions row */}
      {(onRetry || detail) && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(248,113,113,0.2)" }}>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn"
              style={{
                fontSize: 12,
                padding: "6px 14px",
                borderColor: "rgba(248,113,113,0.4)",
                color: "var(--red)",
              }}
            >
              ↺ Retry
            </button>
          )}
          {detail && (
            <button
              onClick={() => setShowDetail((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 12,
                padding: 0,
              }}
            >
              {showDetail ? "▲ Hide detail" : "▼ Show detail"}
            </button>
          )}
        </div>
      )}

      {/* Technical detail */}
      {showDetail && detail && (
        <pre
          style={{
            marginTop: 10,
            padding: "10px 12px",
            background: "rgba(0,0,0,0.25)",
            borderRadius: "var(--radius-sm)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: 180,
            overflow: "auto",
          }}
        >
          {detail}
        </pre>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ icon = "◈", title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 360,
        gap: 14,
        textAlign: "center",
        padding: "40px 24px",
        color: "var(--text-muted)",
      }}
    >
      <div style={{ fontSize: 48, lineHeight: 1, opacity: 0.5 }}>{icon}</div>
      {title && (
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>{title}</p>
      )}
      {subtitle && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.6 }}>
          {subtitle}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}