// src/hooks/useEvaluation.js

import {

  useCallback,

  useContext,

  useMemo,

  useRef,

  useState

} from "react";

import {

  evaluateAdvanced,

  evaluateBatch,

  evaluateCandidate,

  evaluateDebug,

  evaluateMinimal,

  scoreLabel

} from "../api/evaluationApi.js";

import {

  AppContext

} from "../App.jsx";


// =========================================================
// 🔹 SAFE HELPERS
// =========================================================

function ensureArray(value) {

  return Array.isArray(value)
    ? value
    : [];
}


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
// 🔹 NORMALIZE BREAKDOWN
// =========================================================

function normalizeBreakdown(
  breakdown = {}
) {

  const safe =
    ensureObject(
      breakdown
    );

  return {

    communication:
      safeNumber(
        safe.communication
      ),

    technical:
      safeNumber(
        safe.technical ??
        safe.tech
      ),

    domain:
      safeNumber(
        safe.domain
      ),

    experience:
      safeNumber(
        safe.experience
      ),

    location:
      safeNumber(
        safe.location
      ),

    feedback:
      safeNumber(
        safe.feedback
      ),

    achievement:
      safeNumber(
        safe.achievement ??
        safe.achievements
      )
  };
}


// =========================================================
// 🔹 NORMALIZE INSIGHTS
// =========================================================

function normalizeInsights(
  insights = {}
) {

  // -------------------------------------------------------
  // ARRAY FORMAT
  // -------------------------------------------------------

  if (
    Array.isArray(
      insights
    )
  ) {

    return {

      summary: "",

      strengths:
        insights,

      weaknesses: [],

      recommendations: [],

      flags: []
    };
  }

  const safe =
    ensureObject(
      insights
    );

  return {

    summary:
      safe.summary || "",

    strengths:
      ensureArray(
        safe.strengths
      ),

    weaknesses:
      ensureArray(
        safe.weaknesses
      ),

    recommendations:
      ensureArray(
        safe.recommendations
      ),

    flags:
      ensureArray(
        safe.flags
      )
  };
}


// =========================================================
// 🔹 NORMALIZE RESULT
// =========================================================

function normalizeResult(
  result = {}
) {

  const safe =
    ensureObject(
      result
    );

  return {

    teacher_id:
      safe.teacher_id || "",

    name:
      safe.name || "",

    final_score:
      safeNumber(
        safe.final_score
      ),

    status:
      safe.status ||
      "REVIEW",

    score_breakdown:
      normalizeBreakdown(

        safe.score_breakdown ||

        safe.breakdown
      ),

    insights:
      normalizeInsights(
        safe.insights
      ),

    adjustments:
      ensureObject(
        safe.adjustments
      ),

    score_label:
      scoreLabel(
        safe.final_score || 0
      )
  };
}


// =========================================================
// 🔹 CSV FLATTENER
// =========================================================

function flattenForCSV(
  result
) {

  const breakdown =
    normalizeBreakdown(

      result?.score_breakdown
    );

  return {

    teacher_id:
      result.teacher_id || "",

    name:
      result.name || "",

    final_score:
      result.final_score || 0,

    status:
      result.status || "",

    communication:
      breakdown.communication || 0,

    technical:
      breakdown.technical || 0,

    domain:
      breakdown.domain || 0,

    experience:
      breakdown.experience || 0,

    location:
      breakdown.location || 0,

    feedback:
      breakdown.feedback || 0,

    achievement:
      breakdown.achievement || 0
  };
}


// =========================================================
// 🔹 EXPORT CSV
// =========================================================

export function exportResultsToCSV(

  results,

  filename =
    "evaluation_results.csv"

) {

  const safeResults =
    ensureArray(results);

  if (
    safeResults.length === 0
  ) {

    return;
  }

  const rows =
    safeResults.map(
      flattenForCSV
    );

  const headers =
    Object.keys(
      rows[0]
    );

  const csv = [

    headers.join(","),

    ...rows.map((row) =>

      headers
        .map((header) =>

          JSON.stringify(
            row[header] ?? ""
          )
        )
        .join(",")
    )
  ].join("\n");

  const blob =
    new Blob(

      [csv],

      {
        type:
          "text/csv;charset=utf-8;"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );
}


// =========================================================
// 🔹 SINGLE EVALUATION
// =========================================================

export function useSingleEvaluation() {

  const [

    result,

    setResult

  ] = useState(null);

  const [

    loading,

    setLoading

  ] = useState(false);

  const [

    error,

    setError

  ] = useState(null);

  const lastPayloadRef =
    useRef(null);

  const ctx =
    useContext(
      AppContext
    );


  // =======================================================
  // 🔹 EVALUATE
  // =======================================================

  const evaluate =
    useCallback(

      async (payload) => {

        try {

          lastPayloadRef.current =
            payload;

          setLoading(true);

          setError(null);

          setResult(null);

          const raw =
            await evaluateCandidate(
              payload
            );

          const data =
            normalizeResult(
              raw
            );

          setResult(data);

          // ------------------------------------------------
          // SAFE HISTORY
          // ------------------------------------------------

          ctx?.pushHistory?.({

            teacher_id:
              data.teacher_id,

            name:
              data.name,

            final_score:
              data.final_score,

            status:
              data.status
          });

          // ------------------------------------------------
          // SAFE TOAST
          // ------------------------------------------------

          ctx?.toast?.(

            "Candidate Evaluated",

            `${data.name || data.teacher_id} → ${data.final_score.toFixed(1)}`,

            "success"
          );

          return data;

        } catch (err) {

          const message =

            err?.message ||

            "Evaluation failed";

          setError(
            message
          );

          ctx?.toast?.(

            "Evaluation Failed",

            message,

            "error"
          );

          return null;

        } finally {

          setLoading(false);
        }
      },

      [ctx]
    );


  // =======================================================
  // 🔹 RESET
  // =======================================================

  const reset =
    useCallback(() => {

      setResult(null);

      setError(null);

    }, []);


  // =======================================================
  // 🔹 RETRY
  // =======================================================

  const retry =
    useCallback(() => {

      if (
        lastPayloadRef.current
      ) {

        evaluate(
          lastPayloadRef.current
        );
      }

    }, [evaluate]);


  return {

    result,

    loading,

    error,

    evaluate,

    reset,

    retry,

    lastPayload:
      lastPayloadRef.current
  };
}


// =========================================================
// 🔹 BATCH EVALUATION
// =========================================================

export function useBatchEvaluation() {

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

  const lastCandidatesRef =
    useRef(null);

  const ctx =
    useContext(
      AppContext
    );


  // =======================================================
  // 🔹 EVALUATE
  // =======================================================

  const evaluate =
    useCallback(

      async (candidates) => {

        try {

          lastCandidatesRef.current =
            candidates;

          setLoading(true);

          setError(null);

          setResults(null);

          const raw =
            await evaluateBatch(
              candidates
            );

          const normalized =
            ensureArray(
              raw?.results
            ).map(
              normalizeResult
            );

          const sorted =
            [...normalized].sort(

              (a, b) =>

                (b.final_score || 0) -

                (a.final_score || 0)
            );

          setResults(
            sorted
          );

          ctx?.toast?.(

            "Batch Evaluation Complete",

            `${sorted.length} candidates processed`,

            "success"
          );

          return sorted;

        } catch (err) {

          const message =

            err?.message ||

            "Batch evaluation failed";

          setError(
            message
          );

          ctx?.toast?.(

            "Batch Evaluation Failed",

            message,

            "error"
          );

          return null;

        } finally {

          setLoading(false);
        }
      },

      [ctx]
    );


  // =======================================================
  // 🔹 RESET
  // =======================================================

  const reset =
    useCallback(() => {

      setResults(null);

      setError(null);

    }, []);


  // =======================================================
  // 🔹 RETRY
  // =======================================================

  const retry =
    useCallback(() => {

      if (
        lastCandidatesRef.current
      ) {

        evaluate(
          lastCandidatesRef.current
        );
      }

    }, [evaluate]);


  // =======================================================
  // 🔹 EXPORT
  // =======================================================

  const exportCSV =
    useCallback(() => {

      if (results) {

        exportResultsToCSV(
          results
        );
      }

    }, [results]);


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

      const selected =
        results.filter(

          (r) =>
            r.status ===
            "SELECTED"
        ).length;

      const strong =
        results.filter(

          (r) =>
            r.status ===
            "STRONG"
        ).length;

      const review =
        results.filter(

          (r) =>
            r.status ===
            "REVIEW"
        ).length;

      const rejected =
        results.filter(

          (r) =>
            r.status ===
            "REJECTED"
        ).length;

      const scores =
        results.map(

          (r) =>
            r.final_score || 0
        );

      const avgScore =

        total > 0

          ? scores.reduce(
              (a, b) =>
                a + b,
              0
            ) / total

          : 0;

      const topScore =

        scores.length > 0

          ? Math.max(
              ...scores
            )

          : 0;

      const passRate =

        total > 0

          ? (
              (
                selected +
                strong
              ) / total
            ) * 100

          : 0;

      return {

        total,

        selected,

        strong,

        review,

        rejected,

        avgScore,

        topScore,

        passRate
      };

    }, [results]);


  return {

    results,

    loading,

    error,

    stats,

    evaluate,

    reset,

    retry,

    exportCSV
  };
}


// =========================================================
// 🔹 DEBUG
// =========================================================

export function useDebugEvaluation() {

  const [

    trace,

    setTrace

  ] = useState(null);

  const [

    loading,

    setLoading

  ] = useState(false);

  const [

    error,

    setError

  ] = useState(null);


  const run =
    useCallback(

      async (payload) => {

        try {

          setLoading(true);

          setError(null);

          setTrace(null);

          const data =
            await evaluateDebug(
              payload
            );

          setTrace(data);

          return data;

        } catch (err) {

          setError(

            err?.message ||

            "Debug evaluation failed"
          );

          return null;

        } finally {

          setLoading(false);
        }
      },

      []
    );


  const reset =
    useCallback(() => {

      setTrace(null);

      setError(null);

    }, []);


  return {

    trace,

    loading,

    error,

    run,

    reset
  };
}


// =========================================================
// 🔹 MINIMAL
// =========================================================

export function useMinimalEvaluation() {

  const [

    result,

    setResult

  ] = useState(null);

  const [

    loading,

    setLoading

  ] = useState(false);

  const [

    error,

    setError

  ] = useState(null);


  const run =
    useCallback(

      async (payload) => {

        try {

          setLoading(true);

          setError(null);

          setResult(null);

          const data =
            await evaluateMinimal(
              payload
            );

          setResult(data);

          return data;

        } catch (err) {

          setError(

            err?.message ||

            "Minimal evaluation failed"
          );

          return null;

        } finally {

          setLoading(false);
        }
      },

      []
    );


  const reset =
    useCallback(() => {

      setResult(null);

      setError(null);

    }, []);


  return {

    result,

    loading,

    error,

    run,

    reset
  };
}


// =========================================================
// 🔹 ADVANCED
// =========================================================

export function useAdvancedEvaluation() {

  const [

    result,

    setResult

  ] = useState(null);

  const [

    loading,

    setLoading

  ] = useState(false);

  const [

    error,

    setError

  ] = useState(null);


  const run =
    useCallback(

      async (
        payload,
        options = {}
      ) => {

        try {

          setLoading(true);

          setError(null);

          setResult(null);

          const data =
            await evaluateAdvanced(
              payload,
              options
            );

          setResult(data);

          return data;

        } catch (err) {

          setError(

            err?.message ||

            "Advanced evaluation failed"
          );

          return null;

        } finally {

          setLoading(false);
        }
      },

      []
    );


  const reset =
    useCallback(() => {

      setResult(null);

      setError(null);

    }, []);


  return {

    result,

    loading,

    error,

    run,

    reset
  };
}


// =========================================================
// 🔹 HISTORY
// =========================================================

export function useEvaluationHistory() {

  const ctx =
    useContext(
      AppContext
    );

  return {

    history:

      ctx?.evaluationHistory ||

      ctx?.history ||

      [],

    clearHistory:
      ctx?.clearHistory
  };
}


// =========================================================
// 🔹 DEFAULT
// =========================================================

export default useSingleEvaluation;