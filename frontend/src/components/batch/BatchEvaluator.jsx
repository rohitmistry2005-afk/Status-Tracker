// src/components/batch/BatchEvaluator.jsx

import React, {

  useMemo,

  useState

} from "react";

import {

  evaluateBatch,

  scoreColor,

  statusLabel

} from "../../api/evaluationApi.js";

import LoadingSpinner from "../shared/LoadingSpinner.jsx";

import ErrorAlert from "../shared/ErrorAlert.jsx";

import StatusBadge from "../evaluation/StatusBadge.jsx";

import {

  MiniBreakdown

} from "../evaluation/ScoreBreakdown.jsx";


// =========================================================
// 🔹 SAMPLE JSON
// =========================================================

const SAMPLE = JSON.stringify(

  [

    {

      teacher_id: "T1",

      name: "Priya Sharma",

      communication: {
        score: 9
      },

      tech: {
        score: 8
      },

      experience_years: 3,

      location: "same",

      skills: [
        "python",
        "ml",
        "dl"
      ],

      required_skills: [
        "python",
        "ml",
        "dl"
      ],

      student_feedback: {
        rating: 9
      },

      achievements: 2
    },

    {

      teacher_id: "T2",

      name: "Ravi Mehta",

      communication: {
        score: 5
      },

      tech: {
        score: 6
      },

      experience_years: 0.5,

      location: "remote",

      skills: [
        "python"
      ],

      required_skills: [
        "python",
        "ml",
        "dl"
      ],

      student_feedback: {
        rating: 6
      },

      achievements: 0
    }

  ],

  null,

  2
);


// =========================================================
// 🔹 HELPERS
// =========================================================

function normalizeInsights(
  insights
) {

  if (
    Array.isArray(insights)
  ) {

    return insights;
  }

  if (
    typeof insights === "object" &&
    insights !== null
  ) {

    return [

      ...(insights.summary
        ? [insights.summary]
        : []),

      ...(insights.strengths ||
        []),

      ...(insights.weaknesses ||
        []),

      ...(insights.recommendations ||
        [])
    ];
  }

  return [];
}


function downloadJSON(
  data,
  filename
) {

  const blob = new Blob(

    [
      JSON.stringify(
        data,
        null,
        2
      )
    ],

    {
      type:
        "application/json"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = filename;

  link.click();

  URL.revokeObjectURL(url);
}


// =========================================================
// 🔹 RESULT ROW
// =========================================================

function ResultRow({

  candidate,

  rank

}) {

  const [

    expanded,

    setExpanded

  ] = useState(false);

  const score =
    candidate.final_score || 0;

  const insights =
    normalizeInsights(
      candidate.insights
    );

  return (

    <>

      {/* Main Row */}

      <tr
        onClick={() =>
          setExpanded((p) => !p)
        }
        style={{

          cursor: "pointer",

          borderBottom:
            "1px solid var(--border)",

          transition:
            "background 0.2s ease"
        }}
      >

        {/* Rank */}

        <td
          style={{
            padding: "14px 16px"
          }}
        >

          <span
            style={{

              fontFamily:
                "var(--font-mono)",

              color:
                "var(--text-muted)",

              fontSize: 13
            }}
          >

            #{rank}

          </span>

        </td>

        {/* Name */}

        <td
          style={{
            padding: "14px 16px"
          }}
        >

          <div
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >

            <span
              style={{

                fontWeight: 600,

                color:
                  "var(--text-primary)"
              }}
            >

              {candidate.name}

            </span>

            <span
              style={{

                fontSize: 11,

                color:
                  "var(--text-muted)",

                fontFamily:
                  "var(--font-mono)"
              }}
            >

              {candidate.teacher_id}

            </span>

          </div>

        </td>

        {/* Score */}

        <td
          style={{
            padding: "14px 16px"
          }}
        >

          <span
            style={{

              fontSize: 18,

              fontWeight: 700,

              color:
                scoreColor(score),

              fontFamily:
                "var(--font-mono)"
            }}
          >

            {score.toFixed(1)}

          </span>

        </td>

        {/* Status */}

        <td
          style={{
            padding: "14px 16px"
          }}
        >

          <StatusBadge
            status={
              candidate.status
            }
            size="sm"
          />

        </td>

        {/* Progress */}

        <td
          style={{
            padding: "14px 16px"
          }}
        >

          <div
            style={{
              width: 120
            }}
          >

            <div
              className="score-bar-track"
            >

              <div
                className="score-bar-fill"
                style={{

                  width:
                    `${score}%`,

                  background:
                    scoreColor(score)
                }}
              />

            </div>

          </div>

        </td>

        {/* Toggle */}

        <td
          style={{
            padding: "14px 16px"
          }}
        >

          <span
            style={{

              color:
                "var(--text-muted)",

              fontSize: 12
            }}
          >

            {expanded
              ? "▲"
              : "▼"}

          </span>

        </td>

      </tr>

      {/* Expanded */}

      {expanded && (

        <tr
          style={{
            background:
              "var(--bg-input)"
          }}
        >

          <td
            colSpan={6}
            style={{
              padding: 24
            }}
          >

            <div
              style={{

                display: "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap: 24
              }}
            >

              {/* Breakdown */}

              <div>

                <div
                  style={{

                    fontSize: 12,

                    fontWeight: 700,

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      "0.06em",

                    color:
                      "var(--text-muted)",

                    marginBottom: 14
                  }}
                >

                  Score Breakdown

                </div>

                <MiniBreakdown
                  breakdown={
                    candidate.score_breakdown
                  }
                />

              </div>

              {/* Insights */}

              <div>

                <div
                  style={{

                    fontSize: 12,

                    fontWeight: 700,

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      "0.06em",

                    color:
                      "var(--text-muted)",

                    marginBottom: 14
                  }}
                >

                  AI Insights

                </div>

                <div
                  style={{

                    display: "flex",

                    flexDirection:
                      "column",

                    gap: 10
                  }}
                >

                  {insights.length >
                  0 ? (

                    insights.map(
                      (
                        insight,
                        index
                      ) => (

                        <div
                          key={index}
                          style={{

                            padding:
                              "10px 12px",

                            background:
                              "var(--bg-card)",

                            border:
                              "1px solid var(--border)",

                            borderRadius:
                              "var(--radius-md)",

                            fontSize: 13,

                            color:
                              "var(--text-secondary)",

                            lineHeight: 1.6
                          }}
                        >

                          • {insight}

                        </div>
                      )
                    )

                  ) : (

                    <div
                      style={{

                        color:
                          "var(--text-muted)",

                        fontSize: 12
                      }}
                    >

                      No insights available

                    </div>
                  )}

                </div>

              </div>

            </div>

          </td>

        </tr>
      )}

    </>
  );
}


// =========================================================
// 🔹 MAIN COMPONENT
// =========================================================

export default function BatchEvaluator() {

  const [

    json,

    setJson

  ] = useState(SAMPLE);

  const [

    results,

    setResults

  ] = useState(null);

  const [

    loading,

    setLoading

  ] = useState(false);

  const [

    error,

    setError

  ] = useState(null);

  const [

    jsonError,

    setJsonError

  ] = useState(null);


  // =======================================================
  // 🔹 VALIDATION
  // =======================================================

  function validateJSON(
    text
  ) {

    try {

      const parsed =
        JSON.parse(text);

      if (
        !Array.isArray(
          parsed
        )
      ) {

        throw new Error(
          "JSON must be an array"
        );
      }

      setJsonError(null);

      return parsed;

    } catch (err) {

      setJsonError(
        err.message
      );

      return null;
    }
  }


  // =======================================================
  // 🔹 RUN
  // =======================================================

  async function handleRun() {

    const candidates =
      validateJSON(json);

    if (!candidates) {

      return;
    }

    try {

      setLoading(true);

      setError(null);

      setResults(null);

      const data =
        await evaluateBatch(
          candidates
        );

      const sorted =
        [...(
          data.results || []
        )].sort(

          (a, b) =>

            (b.final_score || 0) -

            (a.final_score || 0)
        );

      setResults(sorted);

    } catch (err) {

      setError(
        err.message
      );

    } finally {

      setLoading(false);
    }
  }


  // =======================================================
  // 🔹 STATS
  // =======================================================

  const stats =
    useMemo(() => {

      if (!results) {

        return null;
      }

      const total =
        results.length;

      const avg =
        results.reduce(
          (sum, r) =>
            sum +
            (r.final_score || 0),
          0
        ) / total;

      return {

        total,

        avg,

        selected:
          results.filter(
            (r) =>
              r.status ===
              "SELECTED"
          ).length,

        strong:
          results.filter(
            (r) =>
              r.status ===
              "STRONG"
          ).length,

        review:
          results.filter(
            (r) =>
              r.status ===
              "REVIEW"
          ).length,

        rejected:
          results.filter(
            (r) =>
              r.status ===
              "REJECTED"
          ).length
      };

    }, [results]);


  return (

    <div>

      <div
        style={{

          display: "grid",

          gridTemplateColumns:
            "1fr 1.5fr",

          gap: 32,

          alignItems:
            "start"
        }}
      >

        {/* Input */}

        <div>

          <div className="card">

            <div
              style={{
                marginBottom: 14
              }}
            >

              <div
                style={{

                  fontSize: 12,

                  textTransform:
                    "uppercase",

                  letterSpacing:
                    "0.06em",

                  color:
                    "var(--text-muted)",

                  marginBottom: 6
                }}
              >

                Candidates JSON

              </div>

              <div
                style={{

                  fontSize: 13,

                  color:
                    "var(--text-secondary)"
                }}
              >

                Batch evaluation input

              </div>

            </div>

            <textarea

              value={json}

              onChange={(e) => {

                setJson(
                  e.target.value
                );

                validateJSON(
                  e.target.value
                );
              }}

              style={{

                minHeight: 480,

                fontFamily:
                  "var(--font-mono)",

                fontSize: 12
              }}
            />

            {jsonError && (

              <div
                style={{

                  marginTop: 10,

                  fontSize: 12,

                  color:
                    "var(--red)"
                }}
              >

                ⚠ {jsonError}

              </div>
            )}

            <div
              style={{

                display: "flex",

                gap: 10,

                marginTop: 16
              }}
            >

              <button
                className="btn btn-primary"
                onClick={handleRun}
                disabled={
                  loading ||
                  !!jsonError
                }
                style={{
                  flex: 1
                }}
              >

                {loading
                  ? "Processing..."
                  : "Run Batch Evaluation"}

              </button>

              <button
                className="btn"
                onClick={() =>
                  downloadJSON(
                    JSON.parse(json),
                    "batch_candidates.json"
                  )
                }
              >

                Export

              </button>

            </div>

          </div>

        </div>

        {/* Results */}

        <div>

          {loading && (

            <div
              style={{

                display: "flex",

                justifyContent:
                  "center",

                paddingTop: 100
              }}
            >

              <LoadingSpinner
                label="Running AI Evaluation..."
              />

            </div>
          )}

          {error && (

            <ErrorAlert
              message={error}
              onDismiss={() =>
                setError(null)
              }
            />
          )}

          {stats && !loading && (

            <>

              {/* Stats */}

              <div
                style={{

                  display: "grid",

                  gridTemplateColumns:
                    "repeat(5,1fr)",

                  gap: 12,

                  marginBottom: 20
                }}
              >

                {[

                  {
                    label:
                      "Selected",

                    value:
                      stats.selected,

                    color:
                      "var(--green)"
                  },

                  {
                    label:
                      "Strong",

                    value:
                      stats.strong,

                    color:
                      "var(--accent)"
                  },

                  {
                    label:
                      "Review",

                    value:
                      stats.review,

                    color:
                      "var(--amber)"
                  },

                  {
                    label:
                      "Rejected",

                    value:
                      stats.rejected,

                    color:
                      "var(--red)"
                  },

                  {
                    label:
                      "Avg Score",

                    value:
                      stats.avg.toFixed(
                        1
                      ),

                    color:
                      scoreColor(
                        stats.avg
                      )
                  }

                ].map(
                  (card) => (

                    <div
                      key={card.label}
                      className="card-sm"
                      style={{
                        textAlign:
                          "center"
                      }}
                    >

                      <div
                        style={{

                          fontSize: 26,

                          fontWeight: 700,

                          fontFamily:
                            "var(--font-mono)",

                          color:
                            card.color
                        }}
                      >

                        {card.value}

                      </div>

                      <div
                        style={{

                          fontSize: 11,

                          color:
                            "var(--text-muted)"
                        }}
                      >

                        {card.label}

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* Table */}

              <div
                className="card"
                style={{
                  padding: 0,
                  overflow: "hidden"
                }}
              >

                <table
                  style={{

                    width: "100%",

                    borderCollapse:
                      "collapse"
                  }}
                >

                  <thead>

                    <tr
                      style={{

                        borderBottom:
                          "1px solid var(--border)"
                      }}
                    >

                      {[
                        "Rank",
                        "Candidate",
                        "Score",
                        "Status",
                        "Progress",
                        ""
                      ].map((h) => (

                        <th
                          key={h}
                          style={{

                            padding:
                              "12px 16px",

                            textAlign:
                              "left",

                            fontSize: 11,

                            textTransform:
                              "uppercase",

                            color:
                              "var(--text-muted)"
                          }}
                        >

                          {h}

                        </th>
                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    {results.map(
                      (
                        result,
                        index
                      ) => (

                        <ResultRow
                          key={
                            result.teacher_id ||
                            index
                          }
                          candidate={
                            result
                          }
                          rank={
                            index + 1
                          }
                        />
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}