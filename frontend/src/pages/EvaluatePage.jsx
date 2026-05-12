// src/pages/EvaluatePage.jsx

import React, {

  useContext,

  useMemo,

  useState

} from "react";

import EvaluationForm from "../components/evaluation/EvaluationForm.jsx";

import {

  buildEmptyPayload,

  evaluateDebug,

  evaluateMinimal,

  scoreColor

} from "../api/evaluationApi.js";

import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";

import ErrorAlert from "../components/shared/ErrorAlert.jsx";

import StatusBadge, {

  ScoreRing

} from "../components/evaluation/StatusBadge.jsx";

import { AppContext } from "../App.jsx";


// =========================================================
// 🔹 SAFE HELPERS
// =========================================================

function ensureObject(value) {

  return (
    typeof value === "object" &&
    value !== null
  )
    ? value
    : {};
}


function safeNumber(
  value,
  fallback = 0
) {

  const num =
    Number(value);

  return Number.isFinite(num)
    ? num
    : fallback;
}


// =========================================================
// 🔹 TAB CONFIG
// =========================================================

const TABS = [

  {

    id: "standard",

    label: "◈ Standard",

    desc:
      "Full evaluation with breakdown & insights"
  },

  {

    id: "debug",

    label: "⎔ Debug",

    desc:
      "Complete pipeline trace"
  },

  {

    id: "minimal",

    label: "◎ Minimal",

    desc:
      "Fast score + status response"
  }
];


// =========================================================
// 🔹 TAB BAR
// =========================================================

function TabBar({

  active,

  onChange

}) {

  return (

    <div
      style={{

        display: "flex",

        gap: 4,

        padding: 4,

        marginBottom: 28,

        width: "fit-content",

        background:
          "var(--bg-card)",

        border:
          "1px solid var(--border)",

        borderRadius:
          "var(--radius-md)"
      }}
    >

      {TABS.map((tab) => (

        <button
          key={tab.id}
          title={tab.desc}
          onClick={() =>
            onChange(tab.id)
          }
          style={{

            border: "none",

            cursor: "pointer",

            whiteSpace: "nowrap",

            padding:
              "8px 18px",

            borderRadius:
              "var(--radius-sm)",

            transition:
              "all 0.18s ease",

            background:

              active === tab.id

                ? "var(--accent-dim)"

                : "transparent",

            color:

              active === tab.id

                ? "var(--accent)"

                : "var(--text-muted)",

            fontSize: 13,

            fontWeight:

              active === tab.id

                ? 600

                : 400
          }}
        >

          {tab.label}

        </button>
      ))}

    </div>
  );
}


// =========================================================
// 🔹 QUICK INPUT
// =========================================================

function QuickCandidateInputs({

  form,

  setForm

}) {

  function update(
    path,
    value
  ) {

    setForm((prev) => {

      const next = {
        ...prev
      };

      if (
        path.includes(".")
      ) {

        const [
          parent,
          child
        ] = path.split(".");

        next[parent] = {

          ...ensureObject(
            next[parent]
          ),

          [child]: value
        };

      } else {

        next[path] = value;
      }

      return next;
    });
  }


  // IMPORTANT FIX
  const communication =
    safeNumber(
      form?.communication?.score,
      7
    );

  const technical =
    safeNumber(
      form?.tech?.score,
      7
    );

  const feedback =
    safeNumber(
      form?.student_feedback?.rating,
      7
    );


  return (

    <div className="card">

      <p className="section-label">

        Candidate

      </p>

      <div
        style={{

          display: "flex",

          flexDirection: "column",

          gap: 12
        }}
      >

        {/* ID */}

        <div className="form-group">

          <label>ID</label>

          <input
            type="text"
            value={
              form.teacher_id
            }
            onChange={(e) =>
              update(
                "teacher_id",
                e.target.value
              )
            }
            placeholder="T001"
          />

        </div>

        {/* NAME */}

        <div className="form-group">

          <label>Name</label>

          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              update(
                "name",
                e.target.value
              )
            }
            placeholder="Jane Doe"
          />

        </div>

        {/* COMMUNICATION */}

        <div className="form-group">

          <label>
            Communication
          </label>

          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={
              communication
            }
            onChange={(e) =>
              update(

                "communication.score",

                parseFloat(
                  e.target.value
                )
              )
            }
          />

        </div>

        {/* TECHNICAL */}

        <div className="form-group">

          <label>
            Technical
          </label>

          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={
              technical
            }
            onChange={(e) =>
              update(

                "tech.score",

                parseFloat(
                  e.target.value
                )
              )
            }
          />

        </div>

        {/* FEEDBACK */}

        <div className="form-group">

          <label>
            Student Feedback
          </label>

          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={
              feedback
            }
            onChange={(e) =>
              update(

                "student_feedback.rating",

                parseFloat(
                  e.target.value
                )
              )
            }
          />

        </div>

        {/* EXPERIENCE */}

        <div className="form-group">

          <label>
            Experience
          </label>

          <input
            type="number"
            min={0}
            max={30}
            step={0.5}
            value={
              form.experience_years
            }
            onChange={(e) =>
              update(

                "experience_years",

                parseFloat(
                  e.target.value
                )
              )
            }
          />

        </div>

      </div>

    </div>
  );
}


// =========================================================
// 🔹 DEBUG MODE
// =========================================================

function DebugMode() {

  const [form, setForm] =
    useState(() => {

      const base =
        buildEmptyPayload();

      return {

        ...base,

        communication:
          ensureObject(
            base.communication
          ),

        tech:
          ensureObject(
            base.tech
          ),

        // IMPORTANT FIX
        student_feedback:
          ensureObject(
            base.student_feedback
          ),
      };
    });

  const [trace, setTrace] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  async function run(e) {

    e.preventDefault();

    setLoading(true);

    setError(null);

    setTrace(null);

    try {

      const data =
        await evaluateDebug(
          form
        );

      setTrace(data);

    } catch (err) {

      setError(
        err?.message ||
        "Debug evaluation failed"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div
      style={{

        display: "grid",

        gridTemplateColumns:
          "320px 1fr",

        gap: 28,

        alignItems: "start"
      }}
    >

      {/* LEFT */}

      <form onSubmit={run}>

        <QuickCandidateInputs
          form={form}
          setForm={setForm}
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{

            width: "100%",

            marginTop: 12
          }}
        >

          {loading
            ? "Tracing..."
            : "Run Debug Pipeline →"}

        </button>

      </form>

      {/* RIGHT */}

      <div>

        {loading && (

          <LoadingSpinner
            label="Running full pipeline trace..."
          />
        )}

        {error && (

          <ErrorAlert
            title="Debug Error"
            message={error}
            onDismiss={() =>
              setError(null)
            }
          />
        )}

        {trace &&
          !loading && (

          <div className="card">

            <div
              style={{

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                marginBottom: 16
              }}
            >

              <p className="section-label">

                Pipeline Trace

              </p>

              <span
                style={{

                  fontSize: 12,

                  color:
                    "var(--green)",

                  fontFamily:
                    "var(--font-mono)"
                }}
              >

                score:

                {" "}

                {trace.final_score?.toFixed?.(
                  1
                ) || "—"}

              </span>

            </div>

            <pre
              style={{

                overflow: "auto",

                maxHeight: 520,

                lineHeight: 1.7,

                fontSize: 12,

                padding: 16,

                whiteSpace:
                  "pre-wrap",

                wordBreak:
                  "break-word",

                borderRadius:
                  "var(--radius-md)",

                background:
                  "var(--bg-input)",

                color:
                  "var(--text-secondary)",

                fontFamily:
                  "var(--font-mono)"
              }}
            >

              {JSON.stringify(
                trace,
                null,
                2
              )}

            </pre>

          </div>
        )}

      </div>

    </div>
  );
}


// =========================================================
// 🔹 MINIMAL MODE
// =========================================================

function MinimalMode() {

  const [form, setForm] =
    useState(() => {

      const base =
        buildEmptyPayload();

      return {

        ...base,

        communication:
          ensureObject(
            base.communication
          ),

        tech:
          ensureObject(
            base.tech
          ),
      };
    });

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  async function run(e) {

    e.preventDefault();

    setLoading(true);

    setResult(null);

    setError(null);

    try {

      const data =
        await evaluateMinimal(
          form
        );

      setResult(data);

    } catch (err) {

      setError(
        err?.message ||
        "Minimal evaluation failed"
      );

    } finally {

      setLoading(false);
    }
  }


  return (

    <div
      style={{
        maxWidth: 520
      }}
    >

      <form onSubmit={run}>

        <QuickCandidateInputs
          form={form}
          setForm={setForm}
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{

            width: "100%",

            marginTop: 12
          }}
        >

          {loading
            ? "Checking..."
            : "Quick Score →"}

        </button>

      </form>

      {/* LOADING */}

      {loading && (

        <div
          style={{
            marginTop: 16
          }}
        >

          <LoadingSpinner
            label="Fetching minimal score..."
          />

        </div>
      )}

      {/* ERROR */}

      {error && (

        <div
          style={{
            marginTop: 16
          }}
        >

          <ErrorAlert
            message={error}
            onDismiss={() =>
              setError(null)
            }
          />

        </div>
      )}

      {/* RESULT */}

      {result &&
        !loading && (

        <div
          className="card"
          style={{

            marginTop: 16,

            display: "flex",

            alignItems: "center",

            gap: 24
          }}
        >

          <ScoreRing
            score={
              result.final_score || 0
            }
            size={100}
          />

          <div>

            <p
              style={{

                fontSize: 12,

                marginBottom: 8,

                color:
                  "var(--text-muted)"
              }}
            >

              Minimal Result

            </p>

            <p
              style={{

                fontSize: 28,

                lineHeight: 1,

                fontWeight: 700,

                fontFamily:
                  "var(--font-mono)",

                color:
                  scoreColor(
                    result.final_score || 0
                  )
              }}
            >

              {result.final_score?.toFixed?.(
                1
              ) || "—"}

            </p>

            <div
              style={{
                marginTop: 8
              }}
            >

              <StatusBadge
                status={
                  result.status
                }
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


// =========================================================
// 🔹 HISTORY SIDEBAR
// =========================================================

function HistorySidebar() {

  const ctx =
    useContext(
      AppContext
    );

  const history =
    ctx?.evaluationHistory || [];

  if (
    history.length === 0
  ) {

    return null;
  }


  return (

    <div
      className="card"
      style={{
        marginTop: 28
      }}
    >

      <p className="section-label">

        Session History

        {" "}

        ({history.length})

      </p>

      <div
        style={{

          display: "flex",

          flexDirection:
            "column",

          gap: 8,

          maxHeight: 280,

          overflowY: "auto"
        }}
      >

        {history.map((item, index) => (

          <div
            key={index}
            style={{

              display: "flex",

              alignItems: "center",

              justifyContent:
                "space-between",

              padding:
                "8px 10px",

              borderRadius:
                "var(--radius-sm)",

              background:
                "var(--bg-input)"
            }}
          >

            <div>

              <div
                style={{
                  fontWeight: 600
                }}
              >

                {item.name ||
                  item.teacher_id}

              </div>

              <div
                style={{

                  fontSize: 11,

                  color:
                    "var(--text-muted)",

                  fontFamily:
                    "var(--font-mono)"
                }}
              >

                {item.teacher_id}

              </div>

            </div>

            <div
              style={{
                textAlign: "right"
              }}
            >

              <div
                style={{

                  fontWeight: 700,

                  fontFamily:
                    "var(--font-mono)",

                  color:
                    scoreColor(
                      item.final_score || 0
                    )
                }}
              >

                {item.final_score?.toFixed?.(
                  1
                )}

              </div>

              <div
                style={{

                  fontSize: 11,

                  color:
                    "var(--text-muted)"
                }}
              >

                {item.status}

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}


// =========================================================
// 🔹 PAGE
// =========================================================

export default function EvaluatePage() {

  const [tab, setTab] =
    useState(
      "standard"
    );


  return (

    <div>

      <h1 className="section-title">

        Evaluate Candidate

      </h1>

      <p className="section-sub">

        Run the AI evaluation pipeline
        in standard, debug, or minimal mode.

      </p>

      <TabBar
        active={tab}
        onChange={setTab}
      />

      {tab === "standard" && (

        <EvaluationForm />
      )}

      {tab === "debug" && (

        <DebugMode />
      )}

      {tab === "minimal" && (

        <MinimalMode />
      )}

      <HistorySidebar />

    </div>
  );
}