/**
 * StatusBadge.jsx
 *
 * Three exported components:
 *
 *   <StatusBadge status="SELECTED" size="md" />
 *     — Pill badge (small, inline)
 *
 *   <StatusCard status="SELECTED" score={86.8} name="Priya Sharma" />
 *     — Large summary card shown at the top of evaluation results
 *
 *   <ScoreRing score={86.8} size={120} />
 *     — Animated SVG donut ring with score in centre
 */

import React, { useEffect, useRef, useState } from "react";

// ─── Config tables ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SELECTED: {
    label: "Selected",
    icon: "✓",
    cssClass: "badge-selected",
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "rgba(52,211,153,0.25)",
    description: "Candidate meets all criteria. Recommended for hire.",
    thresholdLabel: "Score ≥ 85",
  },
  STRONG: {
    label: "Strong",
    icon: "↑",
    cssClass: "badge-strong",
    color: "var(--accent)",
    bg: "var(--accent-dim)",
    border: "rgba(108,140,255,0.25)",
    description: "Strong candidate. Consider for next round.",
    thresholdLabel: "Score 70–84",
  },
  REVIEW: {
    label: "Review",
    icon: "⌛",
    cssClass: "badge-review",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "rgba(251,191,36,0.25)",
    description: "Borderline candidate. Needs manual review.",
    thresholdLabel: "Score 55–69",
  },
  REJECTED: {
    label: "Rejected",
    icon: "✗",
    cssClass: "badge-rejected",
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "rgba(248,113,113,0.25)",
    description: "Does not meet minimum requirements.",
    thresholdLabel: "Score < 55",
  },
};

function getConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.REVIEW;
}

// ─── Pill badge ───────────────────────────────────────────────────────────────

const SIZE_STYLES = {
  xs: { fontSize: 10, padding: "1px 7px", gap: 3 },
  sm: { fontSize: 11, padding: "2px 8px", gap: 4 },
  md: { fontSize: 12, padding: "3px 11px", gap: 5 },
  lg: { fontSize: 14, padding: "5px 14px", gap: 6 },
  xl: { fontSize: 16, padding: "7px 18px", gap: 7 },
};

export default function StatusBadge({ status, size = "md", showIcon = true }) {
  const cfg = getConfig(status);
  const sz = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sz.gap,
        padding: sz.padding,
        borderRadius: "100px",
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {showIcon && <span style={{ lineHeight: 1 }}>{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}

// ─── Score Ring (animated SVG donut) ─────────────────────────────────────────

export function ScoreRing({ score = 0, size = 120, strokeWidth = 9 }) {
  const [animated, setAnimated] = useState(0);
  const rafRef = useRef(null);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetDash = (animated / 100) * circumference;

  // Determine colour from score
  let color = "var(--red)";
  if (score >= 85) color = "var(--green)";
  else if (score >= 70) color = "var(--accent)";
  else if (score >= 55) color = "var(--amber)";

  // Animate from 0 → score on mount
  useEffect(() => {
    let start = null;
    const duration = 900;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(eased * score);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
      aria-label={`Score: ${score.toFixed(1)} out of 100`}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--bg-input)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc — starts at 12 o'clock */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${targetDash} ${circumference}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke 0.4s ease" }}
      />
      {/* Score label */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize={size * 0.2}
        fontWeight="700"
        fontFamily="var(--font-mono)"
      >
        {animated.toFixed(0)}
      </text>
      <text
        x={cx}
        y={cy + size * 0.13}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize={size * 0.1}
        fontFamily="var(--font-sans)"
      >
        / 100
      </text>
    </svg>
  );
}

// ─── Status Card ──────────────────────────────────────────────────────────────
// Large card shown at the top of the single-evaluation result panel

export function StatusCard({ status, score, name, teacherId }) {
  const cfg = getConfig(status);

  return (
    <div
      style={{
        background: `linear-gradient(135deg, var(--bg-card) 55%, ${cfg.bg})`,
        border: `1px solid ${cfg.border}`,
        borderRadius: "var(--radius-lg)",
        padding: 24,
        display: "flex",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* Animated score ring */}
      <ScoreRing score={score ?? 0} size={110} />

      {/* Text info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Candidate identity */}
        {name && (
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </p>
        )}
        {teacherId && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginBottom: 12,
            }}
          >
            ID: {teacherId}
          </p>
        )}

        {/* Status badge */}
        <StatusBadge status={status} size="lg" />

        {/* Description */}
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10, lineHeight: 1.5 }}>
          {cfg.description}
        </p>

        {/* Threshold label */}
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 6,
            fontFamily: "var(--font-mono)",
          }}
        >
          Threshold: {cfg.thresholdLabel}
        </p>
      </div>
    </div>
  );
}

// ─── Status Legend ────────────────────────────────────────────────────────────
// A compact legend showing all four statuses and their thresholds.
// Useful on the dashboard or batch results.

export function StatusLegend() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
      }}
    >
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
        <div
          key={key}
          style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ color: cfg.color, fontWeight: 700, fontSize: 14 }}>{cfg.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {cfg.thresholdLabel}
          </p>
        </div>
      ))}
    </div>
  );
}