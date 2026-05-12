import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { evaluateBatch, scoreColor } from "../api/evaluationApi.js";

// Sample candidates for dashboard demo
const DEMO_CANDIDATES = [
  { teacher_id: "T1", name: "Priya Sharma", communication: { score: 9 }, tech: { score: 8 }, experience_years: 3, location: "same", skills: ["python","ml","dl"], required_skills: ["python","ml","dl"], feedback: { rating: 9 }, achievements: 2 },
  { teacher_id: "T2", name: "Ravi Mehta", communication: { score: 5 }, tech: { score: 6 }, experience_years: 0.5, location: "remote", skills: ["python"], required_skills: ["python","ml","dl"], feedback: { rating: 6 }, achievements: 0 },
  { teacher_id: "T3", name: "Anita Roy", communication: { score: 8 }, tech: { score: 7 }, experience_years: 2, location: "nearby", skills: ["python","ml"], required_skills: ["python","ml","dl"], feedback: { rating: 8 }, achievements: 1 },
  { teacher_id: "T4", name: "Dev Kapoor", communication: { score: 7 }, tech: { score: 9 }, experience_years: 4, location: "same", skills: ["python","ml","dl","nlp"], required_skills: ["python","ml","dl"], feedback: { rating: 7 }, achievements: 3 },
  { teacher_id: "T5", name: "Nisha Gupta", communication: { score: 4 }, tech: { score: 5 }, experience_years: 0, location: "remote", skills: [], required_skills: ["python","ml"], feedback: { rating: 4 }, achievements: 0 },
];

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card-sm" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: color || "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: 13 }}>
        <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{label}</p>
        <p style={{ color: scoreColor(payload[0].value), fontFamily: "var(--font-mono)" }}>
          {payload[0].value.toFixed(1)} / 100
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluateBatch(DEMO_CANDIDATES)
      .then((data) => {
        const sorted = [...(data.results || data)].sort(
          (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
        );
        setResults(sorted);
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = results
    ? {
        total: results.length,
        selected: results.filter((r) => r.status === "SELECTED").length,
        avgScore: (results.reduce((s, r) => s + (r.final_score ?? 0), 0) / results.length).toFixed(1),
        topScore: Math.max(...results.map((r) => r.final_score ?? 0)).toFixed(1),
      }
    : { total: "—", selected: "—", avgScore: "—", topScore: "—" };

  const chartData = results?.map((r) => ({
    name: (r.name || r.teacher_id || "").split(" ")[0],
    score: r.final_score ?? 0,
    status: r.status,
  }));

  return (
    <div>
      <h1 className="section-title">Overview</h1>
      <p className="section-sub">
        Live evaluation dashboard — {loading ? "loading demo data…" : `${stats.total} candidates evaluated`}
      </p>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard label="Total Evaluated" value={stats.total} />
        <StatCard label="Selected" value={stats.selected} color="var(--green)" sub="passed threshold ≥85" />
        <StatCard label="Avg Score" value={stats.avgScore} color="var(--accent)" />
        <StatCard label="Top Score" value={stats.topScore} color="var(--amber)" />
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 20 }}>
          Candidate Score Comparison
        </p>
        {loading ? (
          <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
            Loading chart data…
          </div>
        ) : chartData ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-input)" }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={scoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
            Could not load chart — is the backend running?
          </div>
        )}
      </div>

      {/* Recent evaluations table */}
      {results && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              Ranked Results
            </p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Rank", "Name", "Score", "Status", "Comm", "Tech", "Domain"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.teacher_id || i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)" }}>#{i + 1}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 500, fontSize: 14 }}>{r.name || r.teacher_id}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: scoreColor(r.final_score ?? 0) }}>
                    {(r.final_score ?? 0).toFixed(1)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={`badge badge-${r.status?.toLowerCase() === "selected" ? "selected" : r.status?.toLowerCase() === "strong" ? "strong" : r.status?.toLowerCase() === "review" ? "review" : "rejected"}`}>
                      {r.status}
                    </span>
                  </td>
                  {["communication", "technical", "domain"].map((k) => {
                    const val = r.score_breakdown?.[k];
                    const num = typeof val === "object" ? val?.score ?? val : val;
                    return (
                      <td key={k} style={{ padding: "12px 16px", fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                        {num != null ? parseFloat(num).toFixed(1) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}