// src/components/evaluation/EvaluationForm.jsx

import React, {

  useMemo,

  useState

} from "react";

import {

  buildEmptyPayload,

  evaluateCandidate

} from "../../api/evaluationApi.js";

import LoadingSpinner from "../shared/LoadingSpinner.jsx";

import ErrorAlert from "../shared/ErrorAlert.jsx";

import InsightPanel from "./InsightPanel.jsx";

import ScoreBreakdown from "./ScoreBreakdown.jsx";

import StatusBadge from "./StatusBadge.jsx";


// =========================================================
// 🔹 SAFE ACCESS HELPERS
// =========================================================

function ensureObject(value) {

  return (
    typeof value === "object" &&
    value !== null
  )
    ? value
    : {};
}


function safeNumber(value, fallback = 0) {

  const num =
    Number(value);

  return Number.isFinite(num)
    ? num
    : fallback;
}


// =========================================================
// 🔹 SKILL INPUT
// =========================================================

function SkillInput({

  label,

  value = [],

  onChange

}) {

  const [input, setInput] =
    useState("");


  // -------------------------------------------------------
  // ADD SKILL
  // -------------------------------------------------------

  function addSkill(e) {

    e.preventDefault();

    const trimmed =
      input
        .trim()
        .toLowerCase();

    if (
      trimmed &&
      !value.includes(trimmed)
    ) {

      onChange([
        ...value,
        trimmed
      ]);
    }

    setInput("");
  }


  // -------------------------------------------------------
  // REMOVE SKILL
  // -------------------------------------------------------

  function removeSkill(skill) {

    onChange(
      value.filter(
        (s) => s !== skill
      )
    );
  }


  return (

    <div className="form-group">

      <label>
        {label}
      </label>

      {/* Skills */}

      <div
        style={{

          display: "flex",

          gap: 8,

          flexWrap: "wrap",

          marginBottom: 10
        }}
      >

        {value.map((skill) => (

          <span
            key={skill}
            style={{

              display: "inline-flex",

              alignItems: "center",

              gap: 6,

              padding:
                "4px 10px",

              background:
                "var(--accent-dim)",

              color:
                "var(--accent)",

              borderRadius: 999,

              fontSize: 12,

              fontWeight: 500
            }}
          >

            {skill}

            <button
              type="button"
              onClick={() =>
                removeSkill(skill)
              }
              style={{

                background: "none",

                border: "none",

                color:
                  "var(--accent)",

                cursor: "pointer",

                fontSize: 12,

                padding: 0
              }}
            >

              ×

            </button>

          </span>
        ))}

      </div>

      {/* Input */}

      <div
        style={{

          display: "flex",

          gap: 8
        }}
      >

        <input
          type="text"
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === "Enter"
            ) {

              addSkill(e);
            }
          }}
          placeholder="Type skill..."
        />

        <button
          type="button"
          className="btn"
          onClick={addSkill}
        >

          Add

        </button>

      </div>

    </div>
  );
}


// =========================================================
// 🔹 DEFAULT EXPORT
// =========================================================

export default function EvaluationForm() {

  // =======================================================
  // 🔹 STATE
  // =======================================================

  const [form, setForm] =
    useState(() => {

      const base =
        buildEmptyPayload();

      // ---------------------------------------------------
      // GUARANTEE REQUIRED OBJECTS
      // ---------------------------------------------------

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

        skills:
          Array.isArray(
            base.skills
          )
            ? base.skills
            : [],

        required_skills:
          Array.isArray(
            base.required_skills
          )
            ? base.required_skills
            : [],
      };
    });

  const [loading, setLoading] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState(null);


  // =======================================================
  // 🔹 UPDATE HELPER
  // =======================================================

  function update(path, value) {

    setForm((prev) => {

      const next = {
        ...prev
      };

      // ---------------------------------------------------
      // NESTED
      // ---------------------------------------------------

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


  // =======================================================
  // 🔹 NORMALIZED VALUES
  // =======================================================

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


  // =======================================================
  // 🔹 SUBMIT
  // =======================================================

  async function handleSubmit(e) {

    e.preventDefault();

    setLoading(true);

    setError(null);

    setResult(null);

    try {

      // ---------------------------------------------------
      // CLEAN PAYLOAD
      // ---------------------------------------------------

      const payload = {

        ...form,

        communication: {
          score: communication
        },

        tech: {
          ...ensureObject(
            form.tech
          ),

          score: technical
        },

        // IMPORTANT FIX
        student_feedback: {
          rating: feedback
        },

        achievements:
          safeNumber(
            form.achievements,
            0
          ),

        experience_years:
          safeNumber(
            form.experience_years,
            0
          ),
      };

      const data =
        await evaluateCandidate(
          payload
        );

      setResult(data);

    } catch (err) {

      setError(
        err?.message ||
        "Evaluation failed"
      );

    } finally {

      setLoading(false);
    }
  }


  // =======================================================
  // 🔹 RESET
  // =======================================================

  function handleReset() {

    setForm(
      buildEmptyPayload()
    );

    setResult(null);

    setError(null);
  }


  // =======================================================
  // 🔹 HEADER LABEL
  // =======================================================

  const resultLabel =
    useMemo(() => {

      if (!result) {

        return "";
      }

      return `${result.name || form.name} · ${result.teacher_id || form.teacher_id}`;

    }, [

      result,

      form.name,

      form.teacher_id
    ]);


  // =======================================================
  // 🔹 RENDER
  // =======================================================

  return (

    <div>

      <div
        style={{

          display: "grid",

          gridTemplateColumns:
            "1fr 1fr",

          gap: 32,

          alignItems: "start"
        }}
      >

        {/* ================================================= */}
        {/* LEFT COLUMN */}
        {/* ================================================= */}

        <div>

          <form
            onSubmit={handleSubmit}
          >

            {/* --------------------------------------------- */}
            {/* IDENTITY */}
            {/* --------------------------------------------- */}

            <div
              className="card"
              style={{
                marginBottom: 16
              }}
            >

              <p className="section-label">

                Candidate Identity

              </p>

              <div
                className="grid-2"
                style={{
                  gap: 14
                }}
              >

                <div className="form-group">

                  <label>
                    Teacher ID
                  </label>

                  <input
                    type="text"
                    required
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

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
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

              </div>

            </div>

            {/* --------------------------------------------- */}
            {/* SCORES */}
            {/* --------------------------------------------- */}

            <div
              className="card"
              style={{
                marginBottom: 16
              }}
            >

              <p className="section-label">

                Evaluation Scores

              </p>

              <div
                className="grid-2"
                style={{
                  gap: 14
                }}
              >

                {/* Communication */}

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

                {/* Technical */}

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

                {/* Experience */}

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

                {/* Feedback */}

                <div className="form-group">

                  <label>
                    Student Feedback
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={feedback}
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

              </div>

            </div>

            {/* --------------------------------------------- */}
            {/* CONTEXT */}
            {/* --------------------------------------------- */}

            <div
              className="card"
              style={{
                marginBottom: 16
              }}
            >

              <p className="section-label">

                Context

              </p>

              <div
                className="grid-2"
                style={{
                  gap: 14
                }}
              >

                <div className="form-group">

                  <label>
                    Location
                  </label>

                  <select
                    value={
                      form.location
                    }
                    onChange={(e) =>
                      update(
                        "location",
                        e.target.value
                      )
                    }
                  >

                    <option value="same">
                      Same City
                    </option>

                    <option value="nearby">
                      Nearby
                    </option>

                    <option value="remote">
                      Remote
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Achievements
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={
                      form.achievements
                    }
                    onChange={(e) =>
                      update(

                        "achievements",

                        parseInt(
                          e.target.value
                        )
                      )
                    }
                  />

                </div>

              </div>

            </div>

            {/* --------------------------------------------- */}
            {/* SKILLS */}
            {/* --------------------------------------------- */}

            <div
              className="card"
              style={{
                marginBottom: 16
              }}
            >

              <p className="section-label">

                Skills

              </p>

              <div
                style={{

                  display: "flex",

                  flexDirection:
                    "column",

                  gap: 16
                }}
              >

                <SkillInput
                  label="Candidate Skills"
                  value={form.skills}
                  onChange={(v) =>
                    update(
                      "skills",
                      v
                    )
                  }
                />

                <SkillInput
                  label="Required Skills"
                  value={
                    form.required_skills
                  }
                  onChange={(v) =>
                    update(
                      "required_skills",
                      v
                    )
                  }
                />

              </div>

            </div>

            {/* --------------------------------------------- */}
            {/* ACTIONS */}
            {/* --------------------------------------------- */}

            <div
              style={{

                display: "flex",

                gap: 10
              }}
            >

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  flex: 1
                }}
              >

                {loading
                  ? "Evaluating..."
                  : "Run Evaluation →"}

              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReset}
              >

                Reset

              </button>

            </div>

          </form>

        </div>

        {/* ================================================= */}
        {/* RIGHT COLUMN */}
        {/* ================================================= */}

        <div>

          {/* LOADING */}

          {loading && (

            <div
              style={{

                display: "flex",

                justifyContent:
                  "center",

                paddingTop: 80
              }}
            >

              <LoadingSpinner
                label="Running evaluation pipeline..."
              />

            </div>
          )}

          {/* ERROR */}

          {error && (

            <ErrorAlert
              message={error}
              onDismiss={() =>
                setError(null)
              }
            />
          )}

          {/* RESULT */}

          {result &&
            !loading && (

            <div>

              {/* HEADER */}

              <div
                className="card"
                style={{

                  display: "flex",

                  alignItems: "center",

                  justifyContent:
                    "space-between",

                  marginBottom: 16
                }}
              >

                <div>

                  <p
                    style={{

                      fontSize: 13,

                      color:
                        "var(--text-muted)",

                      marginBottom: 8
                    }}
                  >

                    {resultLabel}

                  </p>

                  <div
                    style={{

                      display: "flex",

                      alignItems:
                        "center",

                      gap: 14
                    }}
                  >

                    <span
                      style={{

                        fontSize: 52,

                        fontWeight: 700,

                        fontFamily:
                          "var(--font-mono)"
                      }}
                    >

                      {result.final_score?.toFixed(
                        1
                      ) || "—"}

                    </span>

                    <div>

                      <div
                        style={{

                          fontSize: 12,

                          color:
                            "var(--text-muted)"
                        }}
                      >

                        / 100

                      </div>

                      <StatusBadge
                        status={
                          result.status
                        }
                        size="lg"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* BREAKDOWN */}

              <ScoreBreakdown
                breakdown={
                  result.score_breakdown
                }
                finalScore={
                  result.final_score
                }
              />

              {/* INSIGHTS */}

              <InsightPanel
                insights={
                  result.insights
                }
                adjustments={
                  result.adjustments
                }
              />

            </div>
          )}

        </div>

      </div>

    </div>
  );
}