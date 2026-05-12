/**
 * shared/ErrorAlert.jsx  (standalone file — re-exports + extends LoadingSpinner's ErrorAlert)
 *
 * This file provides:
 *   default export  — CategorisedErrorAlert (richer variant with error-type detection)
 *   named   export  — ErrorAlert (same as LoadingSpinner's export, for clean imports)
 *
 * Error categories detected automatically from the message string:
 *   network   — fetch / CORS / connection refused
 *   timeout   — request timed out
 *   validation— 422 / schema / field errors
 *   server    — 500 / internal server error
 *   auth      — 401 / 403
 *   notfound  — 404
 *   unknown   — everything else
 */

import React, { useState, useCallback } from "react";
export { ErrorAlert } from "./LoadingSpinner.jsx";

// ─── Error type detection ─────────────────────────────────────────────────────

const ERROR_TYPES = {
  network: {
    pattern: /fetch|cors|network|econnrefused|connection refused|failed to fetch/i,
    title: "Network Error",
    icon: "⊗",
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "rgba(248,113,113,0.28)",
    advice:
      "Cannot reach the backend. Make sure FastAPI is running: uvicorn app:app --reload",
  },
  timeout: {
    pattern: /timeout|timed out|408/i,
    title: "Request Timeout",
    icon: "⌛",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "rgba(251,191,36,0.25)",
    advice: "The server took too long. Try again or check server load.",
  },
  validation: {
    pattern: /422|validation|field|schema|unprocessable|pydantic/i,
    title: "Validation Error",
    icon: "◌",
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "rgba(251,191,36,0.25)",
    advice:
      "The data sent to the server did not match the expected schema. Check required fields.",
  },
  server: {
    pattern: /500|internal server|traceback|exception/i,
    title: "Server Error",
    icon: "⚠",
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "rgba(248,113,113,0.28)",
    advice: "The backend threw an unhandled exception. Check the FastAPI terminal for the traceback.",
  },
  auth: {
    pattern: /401|403|unauthorized|forbidden/i,
    title: "Authentication Error",
    icon: "⊘",
    color: "var(--red)",
    bg: "var(--red-dim)",
    border: "rgba(248,113,113,0.28)",
    advice: "Access denied. Check API keys or authentication configuration.",
  },
  notfound: {
    pattern: /404|not found/i,
    title: "Endpoint Not Found",
    icon: "◎",
    color: "var(--text-muted)",
    bg: "var(--bg-input)",
    border: "var(--border)",
    advice:
      "The API route does not exist. Verify your backend routes and the VITE_API_BASE_URL in .env.",
  },
};

function detectErrorType(message) {
  if (!message) return null;
  for (const [key, cfg] of Object.entries(ERROR_TYPES)) {
    if (cfg.pattern.test(message)) return { key, ...cfg };
  }
  return null;
}

// ─── Copy to clipboard helper ─────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      /* clipboard API unavailable */
    }
  }, [text]);

  return (
    <button
      onClick={copy}
      style={{
        background: "none",
        border: "none",
        color: copied ? "var(--green)" : "var(--text-muted)",
        cursor: "pointer",
        fontSize: 11,
        padding: 0,
        fontFamily: "var(--font-mono)",
        transition: "color 0.2s",
      }}
    >
      {copied ? "✓ Copied" : "⎘ Copy"}
    </button>
  );
}

// ─── CategorisedErrorAlert (default export) ───────────────────────────────────

/**
 * @param {object}   props
 * @param {string}   props.message      The error message string
 * @param {string}   [props.detail]     Raw technical detail (stack, JSON, etc.)
 * @param {function} [props.onDismiss]  Called when × is clicked
 * @param {function} [props.onRetry]    If provided, shows a Retry button
 * @param {boolean}  [props.compact]    Minimal single-line variant
 */
export default function CategorisedErrorAlert({
  message,
  detail,
  onDismiss,
  onRetry,
  compact = false,
}) {
  const [showDetail, setShowDetail] = useState(false);
  const detected = detectErrorType(message);

  const color  = detected?.color  ?? "var(--red)";
  const bg     = detected?.bg     ?? "var(--red-dim)";
  const border = detected?.border ?? "rgba(248,113,113,0.28)";
  const icon   = detected?.icon   ?? "⚠";
  const title  = detected?.title  ?? "Error";
  const advice = detected?.advice ?? null;

  if (compact) {
    return (
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: "var(--radius-sm)",
          fontSize: 12,
          color,
        }}
      >
        <span>{icon}</span>
        <span style={{ flex: 1, color: "var(--text-secondary)" }}>{message}</span>
        {onRetry && (
          <button onClick={onRetry} style={{ background: "none", border: "none", color, cursor: "pointer", fontSize: 12, padding: 0, fontWeight: 600 }}>
            Retry
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0 }}>
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ color, fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{message}</p>
          {advice && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>
              {advice}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Action row */}
      {(onRetry || detail || message) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${border}`,
            flexWrap: "wrap",
          }}
        >
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn"
              style={{ fontSize: 12, padding: "6px 14px", borderColor: border, color }}
            >
              ↺ Retry
            </button>
          )}
          {detail && (
            <button
              onClick={() => setShowDetail((v) => !v)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, padding: 0 }}
            >
              {showDetail ? "▲ Hide detail" : "▼ Show detail"}
            </button>
          )}
          <div style={{ marginLeft: "auto" }}>
            <CopyButton text={`${title}: ${message}\n\n${detail || ""}`} />
          </div>
        </div>
      )}

      {/* Technical detail collapsible */}
      {showDetail && detail && (
        <pre
          style={{
            marginTop: 10,
            padding: "10px 12px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "var(--radius-sm)",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            maxHeight: 200,
            overflow: "auto",
            lineHeight: 1.7,
          }}
        >
          {detail}
        </pre>
      )}
    </div>
  );
}