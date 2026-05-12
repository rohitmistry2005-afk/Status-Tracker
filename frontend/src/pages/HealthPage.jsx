// src/pages/HealthPage.jsx

import React, {

  useCallback,

  useEffect,

  useMemo,

  useState

} from "react";

import {

  fetchHealth

} from "../api/evaluationApi.js";


// =========================================================
// 🔹 CONSTANTS
// =========================================================

const API_BASE =

  import.meta.env
    .VITE_API_BASE_URL ||

  "http://127.0.0.1:8000";


const ENDPOINTS = [

  {
    label:
      "Single Evaluation",
    method: "POST",
    path:
      "/evaluation/evaluate"
  },

  {
    label:
      "Batch Evaluation",
    method: "POST",
    path:
      "/evaluation/evaluate/batch"
  },

  {
    label:
      "Debug Evaluation",
    method: "POST",
    path:
      "/evaluation/evaluate/debug"
  },

  {
    label:
      "Minimal Evaluation",
    method: "POST",
    path:
      "/evaluation/evaluate/minimal"
  },

  {
    label:
      "Advanced Evaluation",
    method: "POST",
    path:
      "/evaluation/evaluate/advanced"
  },

  {
    label:
      "Health Check",
    method: "GET",
    path:
      "/evaluation/health"
  }
];


// =========================================================
// 🔹 STATUS DOT
// =========================================================

function StatusDot({

  ok

}) {

  return (

    <span
      style={{

        width: 12,

        height: 12,

        borderRadius: "50%",

        background:
          ok
            ? "var(--green)"
            : "var(--red)",

        display:
          "inline-block",

        boxShadow:
          ok
            ? "0 0 12px rgba(52,211,153,0.7)"
            : "0 0 12px rgba(248,113,113,0.7)"
      }}
    />
  );
}


// =========================================================
// 🔹 INFO ROW
// =========================================================

function InfoRow({

  label,

  value,

  mono = false

}) {

  return (

    <div
      style={{

        display: "flex",

        justifyContent:
          "space-between",

        alignItems:
          "center",

        padding:
          "12px 0",

        borderBottom:
          "1px solid var(--border)"
      }}
    >

      <span
        style={{

          fontSize: 13,

          color:
            "var(--text-secondary)"
        }}
      >

        {label}

      </span>

      <span
        style={{

          fontSize: 13,

          color:
            "var(--text-primary)",

          fontFamily:
            mono
              ? "var(--font-mono)"
              : "var(--font-sans)"
        }}
      >

        {value || "—"}

      </span>

    </div>
  );
}


// =========================================================
// 🔹 ENDPOINT ROW
// =========================================================

function EndpointRow({

  endpoint

}) {

  const isGet =
    endpoint.method === "GET";

  return (

    <div
      style={{

        display: "flex",

        justifyContent:
          "space-between",

        alignItems:
          "center",

        padding:
          "14px 0",

        borderBottom:
          "1px solid var(--border)"
      }}
    >

      {/* Left */}

      <div
        style={{

          display: "flex",

          alignItems:
            "center",

          gap: 12
        }}
      >

        {/* Method */}

        <span
          style={{

            padding:
              "3px 8px",

            borderRadius:
              "var(--radius-sm)",

            fontSize: 10,

            fontWeight: 700,

            letterSpacing:
              "0.06em",

            fontFamily:
              "var(--font-mono)",

            background:
              isGet
                ? "var(--green-dim)"
                : "var(--accent-dim)",

            color:
              isGet
                ? "var(--green)"
                : "var(--accent)"
          }}
        >

          {endpoint.method}

        </span>

        {/* Label */}

        <span
          style={{

            fontSize: 13,

            color:
              "var(--text-secondary)"
          }}
        >

          {endpoint.label}

        </span>

      </div>

      {/* Path */}

      <span
        style={{

          fontSize: 12,

          fontFamily:
            "var(--font-mono)",

          color:
            "var(--text-muted)"
        }}
      >

        {endpoint.path}

      </span>

    </div>
  );
}


// =========================================================
// 🔹 MAIN COMPONENT
// =========================================================

export default function HealthPage() {

  const [

    health,

    setHealth

  ] = useState(null);

  const [

    loading,

    setLoading

  ] = useState(true);

  const [

    error,

    setError

  ] = useState(null);

  const [

    lastChecked,

    setLastChecked

  ] = useState(null);


  // =======================================================
  // 🔹 FETCH HEALTH
  // =======================================================

  const checkHealth =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError(null);

          const data =
            await fetchHealth();

          setHealth(data);

          setLastChecked(
            new Date()
          );

        } catch (err) {

          setHealth(null);

          setError(
            err.message
          );

        } finally {

          setLoading(false);
        }
      },

      []
    );


  // =======================================================
  // 🔹 INITIAL LOAD
  // =======================================================

  useEffect(() => {

    checkHealth();

  }, [checkHealth]);


  // =======================================================
  // 🔹 STATUS
  // =======================================================

  const isOnline =
    !loading &&
    !error &&
    health;


  // =======================================================
  // 🔹 SYSTEM STATS
  // =======================================================

  const stats =
    useMemo(() => {

      return [

        {
          label:
            "Environment",

          value:
            health?.environment ||
            "development"
        },

        {
          label:
            "Version",

          value:
            health?.version ||
            "1.0.0"
        },

        {
          label:
            "Status",

          value:
            health?.status ||
            "offline"
        },

        {
          label:
            "Backend",

          value:
            API_BASE
        }
      ];

    }, [health]);


  return (

    <div>

      {/* Header */}

      <div
        style={{
          marginBottom: 28
        }}
      >

        <h1
          className="section-title"
        >

          API Health Dashboard

        </h1>

        <p
          className="section-sub"
        >

          Monitor FastAPI connectivity,
          endpoint availability,
          and backend runtime status.

        </p>

      </div>

      {/* Layout */}

      <div
        className="grid-2"
        style={{

          gap: 24,

          alignItems:
            "start"
        }}
      >

        {/* LEFT */}

        <div>

          {/* STATUS CARD */}

          <div
            className="card"
            style={{

              marginBottom: 22,

              border:
                `1px solid ${
                  isOnline
                    ? "rgba(52,211,153,0.3)"
                    : "rgba(248,113,113,0.3)"
                }`
            }}
          >

            {/* Top */}

            <div
              style={{

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                marginBottom: 24
              }}
            >

              {/* Left */}

              <div
                style={{

                  display: "flex",

                  alignItems:
                    "center",

                  gap: 12
                }}
              >

                <StatusDot
                  ok={isOnline}
                />

                <div>

                  <div
                    style={{

                      fontWeight: 700,

                      fontSize: 16,

                      color:
                        isOnline
                          ? "var(--green)"
                          : "var(--red)"
                    }}
                  >

                    {loading
                      ? "Checking..."
                      : isOnline
                        ? "Backend Online"
                        : "Backend Offline"}

                  </div>

                  <div
                    style={{

                      fontSize: 12,

                      color:
                        "var(--text-muted)"
                    }}
                  >

                    AI Evaluation API

                  </div>

                </div>

              </div>

              {/* Button */}

              <button
                className="btn"
                onClick={
                  checkHealth
                }
                disabled={loading}
              >

                {loading
                  ? "..."
                  : "↻ Refresh"}

              </button>

            </div>

            {/* Stats */}

            {stats.map(
              (item) => (

                <InfoRow
                  key={item.label}
                  label={
                    item.label
                  }
                  value={
                    item.value
                  }
                  mono
                />
              )
            )}

            {/* Error */}

            {error && (

              <div
                style={{

                  marginTop: 18,

                  padding: 16,

                  background:
                    "var(--red-dim)",

                  border:
                    "1px solid rgba(248,113,113,0.2)",

                  borderRadius:
                    "var(--radius-md)"
                }}
              >

                <div
                  style={{

                    fontSize: 13,

                    color:
                      "var(--red)",

                    fontWeight: 700,

                    marginBottom: 8
                  }}
                >

                  Connection Failed

                </div>

                <div
                  style={{

                    fontSize: 12,

                    color:
                      "var(--text-secondary)",

                    fontFamily:
                      "var(--font-mono)"
                  }}
                >

                  {error}

                </div>

                <div
                  style={{

                    marginTop: 10,

                    fontSize: 11,

                    color:
                      "var(--text-muted)"
                  }}
                >

                  Start FastAPI using:

                  <br />

                  <code
                    style={{

                      color:
                        "var(--accent)",

                      fontFamily:
                        "var(--font-mono)"
                    }}
                  >

                    uvicorn app:app --reload

                  </code>

                </div>

              </div>
            )}

            {/* Last Checked */}

            {lastChecked && (

              <div
                style={{

                  marginTop: 18,

                  fontSize: 11,

                  color:
                    "var(--text-muted)"
                }}
              >

                Last checked:
                {" "}
                {lastChecked.toLocaleTimeString()}

              </div>
            )}

          </div>

          {/* RAW RESPONSE */}

          {health && (

            <div className="card">

              <div
                style={{

                  fontSize: 12,

                  textTransform:
                    "uppercase",

                  letterSpacing:
                    "0.06em",

                  color:
                    "var(--text-muted)",

                  marginBottom: 14
                }}
              >

                Raw Response

              </div>

              <pre
                style={{

                  padding: 16,

                  borderRadius:
                    "var(--radius-md)",

                  background:
                    "var(--bg-input)",

                  overflow: "auto",

                  maxHeight: 280,

                  fontSize: 12,

                  lineHeight: 1.7,

                  fontFamily:
                    "var(--font-mono)",

                  color:
                    "var(--text-secondary)"
                }}
              >

                {JSON.stringify(
                  health,
                  null,
                  2
                )}

              </pre>

            </div>
          )}

        </div>

        {/* RIGHT */}

        <div>

          {/* ENDPOINTS */}

          <div className="card">

            <div
              style={{
                marginBottom: 20
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

                API Endpoints

              </div>

              <div
                style={{

                  fontSize: 13,

                  color:
                    "var(--text-secondary)"
                }}
              >

                Registered backend routes

              </div>

            </div>

            {ENDPOINTS.map(
              (endpoint) => (

                <EndpointRow
                  key={
                    endpoint.path
                  }
                  endpoint={
                    endpoint
                  }
                />
              )
            )}

            {/* Swagger */}

            <div
              style={{

                marginTop: 24,

                padding: 16,

                borderRadius:
                  "var(--radius-md)",

                background:
                  "var(--bg-input)"
              }}
            >

              <div
                style={{

                  fontSize: 12,

                  color:
                    "var(--text-muted)",

                  marginBottom: 8
                }}
              >

                Swagger Documentation

              </div>

              <a
                href={`${API_BASE}/docs`}
                target="_blank"
                rel="noreferrer"
                style={{

                  color:
                    "var(--accent)",

                  fontSize: 13,

                  fontFamily:
                    "var(--font-mono)"
                }}
              >

                {API_BASE}/docs ↗

              </a>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}