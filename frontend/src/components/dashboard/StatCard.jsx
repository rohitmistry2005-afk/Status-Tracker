/**
 * components/dashboard/StatCard.jsx
 *
 * Exports:
 *   default   StatCard        — KPI card with icon, value, label, optional trend
 *   named     StatCardGrid    — responsive 4-column wrapper for stat cards
 *   named     MiniStatRow     — horizontal single-line stat (for sidebars)
 *   named     ScoreStatCard   — specialised card that shows a score with a colour bar
 *   named     TrendIndicator  — up/down/flat trend badge (used inside StatCard)
 */

import React, { useEffect, useRef, useState } from "react";
import { scoreColor } from "../../api/evaluationApi.js";

// ─── Animated counter ─────────────────────────────────────────────────────────

function useAnimatedValue(target, duration = 700) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target == null || isNaN(parseFloat(target))) return;
    const end = parseFloat(target);
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * end);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

// ─── TrendIndicator ───────────────────────────────────────────────────────────

/**
 * @param {"up"|"down"|"flat"} direction
 * @param {string|number}      value     e.g. "+12%" or "3"
 */
export function TrendIndicator({ direction = "flat", value }) {
  const config = {
    up:   { icon: "↑", color: "var(--green)", bg: "var(--green-dim)"  },
    down: { icon: "↓", color: "var(--red)",   bg: "var(--red-dim)"    },
    flat: { icon: "→", color: "var(--amber)", bg: "var(--amber-dim)"  },
  };
  const c = config[direction] || config.flat;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
        padding: "2px 7px",
        borderRadius: "100px",
        fontFamily: "var(--font-mono)",
      }}
    >
      {c.icon} {value}
    </span>
  );
}

// ─── Mini sparkline (SVG) ─────────────────────────────────────────────────────

function Sparkline({ values = [], color = "var(--accent)", width = 80, height = 28 }) {
  if (!values || values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step  = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`spark-grad-${color.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-grad-${color.replace(/[^a-z]/gi, "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].split(",")[0]} cy={points[points.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── StatCard (default export) ────────────────────────────────────────────────

/**
 * @param {string}          label
 * @param {string|number}   value          Main displayed value
 * @param {string}          [icon]         Single character or emoji
 * @param {string}          [color]        CSS color for the value
 * @param {string}          [sub]          Secondary label below value
 * @param {"up"|"down"|"flat"} [trend]     Trend direction
 * @param {string}          [trendValue]   e.g. "+5%"
 * @param {number[]}        [sparkValues]  Array of numbers for sparkline
 * @param {boolean}         [animate]      Animate numeric value on mount
 */
export default function StatCard({
  label,
  value,
  icon,
  color = "var(--text-primary)",
  sub,
  trend,
  trendValue,
  sparkValues,
  animate = true,
}) {
  const numericTarget = animate && !isNaN(parseFloat(value)) ? parseFloat(value) : null;
  const animated = useAnimatedValue(numericTarget);

  // Decide what to display
  const displayValue = (() => {
    if (value == null || value === "—") return "—";
    if (numericTarget != null) {
      // Preserve format: if original has a %, add it; if has decimal, match it
      const str = String(value);
      const decimals = str.includes(".") ? (str.split(".")[1]?.replace(/[^0-9]/g, "").length || 0) : 0;
      const hasPct = str.includes("%");
      return `${animated.toFixed(decimals)}${hasPct ? "%" : ""}`;
    }
    return value;
  })();

  return (
    <div
      className="card-sm"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.18s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Top row: label + icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", lineHeight: 1 }}>
          {label}
        </p>
        {icon && (
          <span style={{ fontSize: 14, color: color === "var(--text-primary)" ? "var(--text-muted)" : color, opacity: 0.8 }}>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <p style={{ fontSize: 30, fontWeight: 700, fontFamily: "var(--font-mono)", color, lineHeight: 1, marginBottom: 6 }}>
        {displayValue}
      </p>

      {/* Sub label */}
      {sub && (
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: trend ? 10 : 0 }}>
          {sub}
        </p>
      )}

      {/* Bottom row: trend + sparkline */}
      {(trend || sparkValues) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          {trend && trendValue && <TrendIndicator direction={trend} value={trendValue} />}
          {sparkValues && (
            <div style={{ marginLeft: "auto" }}>
              <Sparkline values={sparkValues} color={color} />
            </div>
          )}
        </div>
      )}

      {/* Colour accent bar at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color,
          opacity: 0.4,
          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
        }}
      />
    </div>
  );
}

// ─── StatCardGrid ─────────────────────────────────────────────────────────────

export function StatCardGrid({ children, columns = 4 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 14,
        marginBottom: 28,
      }}
    >
      {children}
    </div>
  );
}

// ─── MiniStatRow ──────────────────────────────────────────────────────────────

export function MiniStatRow({ label, value, color }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: color || "var(--text-primary)" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─── ScoreStatCard ────────────────────────────────────────────────────────────

export function ScoreStatCard({ label, score, maxScore = 100 }) {
  const pct   = Math.min(100, ((score ?? 0) / maxScore) * 100);
  const color = scoreColor(score ?? 0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      className="card-sm"
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</p>
        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>
          {score != null ? score.toFixed(1) : "—"}
        </span>
      </div>
      <div style={{ background: "var(--bg-input)", borderRadius: 100, height: 5, overflow: "hidden" }}>
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            background: color,
            borderRadius: 100,
            transition: "width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
    </div>
  );
}