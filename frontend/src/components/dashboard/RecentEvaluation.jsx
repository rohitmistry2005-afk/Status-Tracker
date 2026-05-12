/**
 * components/dashboard/RecentEvaluations.jsx
 *
 * Ranked results table for the Dashboard page.
 *
 * Features:
 *  - Sort by score, name, or status (clickable column headers)
 *  - Filter by status (All / Selected / Strong / Review / Rejected)
 *  - Expandable rows showing mini score breakdown
 *  - Highlight top-ranked row with a gold crown
 *  - Empty state when filter returns no results
 */

import React, { useState, useMemo } from "react";
import { scoreColor, statusClass } from "../../api/evaluationApi.js";

// ─── Filter tab bar ───────────────────────────────────────────────────────────

const FILTERS = ["All", "SELECTED", "STRONG", "REVIEW", "REJECTED"];

function FilterBar({ active, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {FILTERS.map((f) => {
        const count = f === "All" ? counts.total : (counts[f] ?? 0);
        const isActive = active === f;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            style={{
              padding: "5px 12px",
              borderRadius: "100px",
              border: "1px solid",
              borderColor: isActive ? "var(--accent)" : "var(--border)",
              background: isActive ? "var(--accent-dim)" : "transparent",
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontFamily: "var(--font-sans)",
            }}
          >
            {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            <span
              style={{
                background: isActive ? "var(--accent)" : "var(--bg-input)",
                color: isActive ? "#fff" : "var(--text-muted)",
                borderRadius: "100px",
                padding: "0 5px",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Sort button ──────────────────────────────────────────────────────────────

function SortHeader({ label, field, current, onSort }) {
  const isActive = current.field === field;
  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: "10px 16px",
        textAlign: "left",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: isActive ? "var(--accent)" : "var(--text-muted)",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <span style={{ marginLeft: 4, opacity: 0.7 }}>
        {isActive ? (current.dir === "asc" ? "↑" : "↓") : "⇅"}
      </span>
    </th>
  );
}

// ─── Expandable table row ─────────────────────────────────────────────────────

function ResultRow({ result, rank, isTop }) {
  const [expanded, setExpanded] = useState(false);
  const score  = result.final_score ?? 0;
  const color  = scoreColor(score);
  const cls    = statusClass(result.status);

  const KEYS = ["communication", "technical", "domain", "experience", "feedback"];

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        style={{
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          background: expanded ? "var(--bg-input)" : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
        onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Rank */}
        <td style={{ padding: "12px 16px", width: 48 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: isTop ? "var(--amber)" : "var(--text-muted)" }}>
            {isTop ? "👑" : `#${rank}`}
          </span>
        </td>

        {/* Name + ID */}
        <td style={{ padding: "12px 16px" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.2 }}>
            {result.name || result.teacher_id}
          </p>
          {result.name && (
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {result.teacher_id}
            </p>
          )}
        </td>

        {/* Score */}
        <td style={{ padding: "12px 16px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>
            {score.toFixed(1)}
          </span>
        </td>

        {/* Score bar */}
        <td style={{ padding: "12px 16px", width: 120 }}>
          <div style={{ background: "var(--bg-input)", borderRadius: 100, height: 5, overflow: "hidden", width: 100 }}>
            <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 100 }} />
          </div>
        </td>

        {/* Status badge */}
        <td style={{ padding: "12px 16px" }}>
          <span className={`badge badge-${cls}`} style={{ fontSize: 11 }}>
            {result.status}
          </span>
        </td>

        {/* Expand toggle */}
        <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 11, textAlign: "right" }}>
          {expanded ? "▲" : "▼"}
        </td>
      </tr>

      {/* Expanded breakdown row */}
      {expanded && (
        <tr style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border)" }}>
          <td colSpan={6} style={{ padding: "16px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Score breakdown mini bars */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 10 }}>
                  Score Breakdown
                </p>
                {KEYS.map((k) => {
                  const val = result.score_breakdown?.[k];
                  const num = typeof val === "object" ? val?.score ?? val : parseFloat(val) || 0;
                  const c   = scoreColor((num / 10) * 100);
                  return (
                    <div key={k} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>
                        <span style={{ textTransform: "capitalize" }}>{k}</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: c }}>{num.toFixed(1)}</span>
                      </div>
                      <div style={{ background: "var(--bg-card)", borderRadius: 100, height: 4, overflow: "hidden" }}>
                        <div style={{ width: `${(num / 10) * 100}%`, height: "100%", background: c, borderRadius: 100 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insights */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 10 }}>
                  Insights
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Array.isArray(result.insights) && result.insights.length > 0
                    ? result.insights.map((ins, i) => (
                        <p key={i} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          · {ins}
                        </p>
                      ))
                    : <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No insights available</p>
                  }
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── RecentEvaluations ────────────────────────────────────────────────────────

export default function RecentEvaluations({ results = [] }) {
  const [filter, setFilter]   = useState("All");
  const [sort,   setSort]     = useState({ field: "score", dir: "desc" });

  // Counts for filter badges
  const counts = useMemo(() => ({
    total:    results.length,
    SELECTED: results.filter((r) => r.status === "SELECTED").length,
    STRONG:   results.filter((r) => r.status === "STRONG").length,
    REVIEW:   results.filter((r) => r.status === "REVIEW").length,
    REJECTED: results.filter((r) => r.status === "REJECTED").length,
  }), [results]);

  // Filtered + sorted results
  const displayed = useMemo(() => {
    let arr = filter === "All" ? results : results.filter((r) => r.status === filter);
    arr = [...arr].sort((a, b) => {
      let av, bv;
      if (sort.field === "score")  { av = a.final_score ?? 0; bv = b.final_score ?? 0; }
      if (sort.field === "name")   { av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase(); }
      if (sort.field === "status") { av = a.status || ""; bv = b.status || ""; }
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [results, filter, sort]);

  function handleSort(field) {
    setSort((prev) => ({
      field,
      dir: prev.field === field && prev.dir === "desc" ? "asc" : "desc",
    }));
  }

  if (!results || results.length === 0) return null;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
          Ranked Results · {displayed.length} shown
        </p>
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* Table */}
      {displayed.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", textAlign: "left", width: 48 }}>
                #
              </th>
              <SortHeader label="Name"   field="name"   current={sort} onSort={handleSort} />
              <SortHeader label="Score"  field="score"  current={sort} onSort={handleSort} />
              <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", textAlign: "left" }}>Bar</th>
              <SortHeader label="Status" field="status" current={sort} onSort={handleSort} />
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {displayed.map((r, i) => (
              <ResultRow
                key={r.teacher_id || i}
                result={r}
                rank={i + 1}
                isTop={i === 0 && filter === "All" && sort.field === "score" && sort.dir === "desc"}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          No candidates with status "{filter}" in this dataset.
        </div>
      )}
    </div>
  );
}