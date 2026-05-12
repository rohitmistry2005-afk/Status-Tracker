/**
 * pages/BatchPage.jsx
 *
 * Full batch evaluation page with:
 *  - JSON input area (with sample data pre-filled)
 *  - Filter controls: filter results by status
 *  - Sort controls: sort by score / name / status
 *  - CSV export button (from useBatchEvaluation hook)
 *  - Summary stat strip
 *  - Pass rate progress bar
 *  - Results table with expandable rows (from BatchEvaluator component)
 *  - Status legend (from StatusBadge)
 */

import React, { useState } from "react";
import BatchEvaluator from "../components/batch/BatchEvaluator.jsx";
import { StatusLegend } from "../components/evaluation/StatusBadge.jsx";

// ─── Instructions accordion ───────────────────────────────────────────────────

function Instructions() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        marginBottom: 24,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "14px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
          ℹ  How to use batch evaluation
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          {open ? "▲ Collapse" : "▼ Expand"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>
                Input format
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Paste a JSON array of candidate objects into the text area. Each
                object must have: <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>teacher_id</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>name</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>communication</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>tech</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>experience_years</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>skills</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>required_skills</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>feedback</code>,{" "}
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>location</code>.
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>
                Output
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Results are ranked by final score (highest first). Click any row
                to expand and see the score breakdown and insights. Use the CSV
                export button to download results as a spreadsheet. Filters let
                you focus on a specific status group.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
              Decision thresholds
            </p>
            <StatusLegend />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tips sidebar ─────────────────────────────────────────────────────────────

function TipsSidebar() {
  const tips = [
    {
      icon: "◈",
      title: "Validate JSON first",
      body: "Use jsonlint.com or your IDE to validate before pasting. Invalid JSON won't submit.",
    },
    {
      icon: "◫",
      title: "Skill matching",
      body: "Skills are matched case-insensitively with synonym support. 'ML' and 'machine-learning' are equivalent.",
    },
    {
      icon: "◉",
      title: "Batch limit",
      body: "The backend processes batches synchronously. For very large batches (100+) consider splitting into chunks.",
    },
    {
      icon: "⬡",
      title: "CSV export",
      body: "After evaluation, click 'Export CSV' to download results as a spreadsheet — useful for HR review.",
    },
  ];

  return (
    <div
      className="card"
      style={{ marginTop: 20 }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
          marginBottom: 16,
        }}
      >
        Tips
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {tips.map(({ icon, title, body }) => (
          <div key={title} style={{ display: "flex", gap: 12 }}>
            <span
              style={{
                fontSize: 16,
                color: "var(--accent)",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {icon}
            </span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 3 }}>
                {title}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.55 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Formula reminder */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 14px",
          background: "var(--bg-input)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>
          Scoring formula
        </p>
        <pre
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {`Score = (
  0.25 × Communication
  0.20 × Technical
  0.20 × Domain
  0.15 × Experience
  0.08 × Location
  0.07 × Feedback
  0.05 × Achievement
) × 10 + Bonus − Penalty`}
        </pre>
      </div>
    </div>
  );
}

// ─── BatchPage ────────────────────────────────────────────────────────────────

export default function BatchPage() {
  return (
    <div>
      <h1 className="section-title">Batch Evaluation</h1>
      <p className="section-sub">
        Evaluate multiple candidates at once — results ranked by final score
      </p>

      <Instructions />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* Main evaluator */}
        <BatchEvaluator />

        {/* Tips */}
        <TipsSidebar />
      </div>
    </div>
  );
}