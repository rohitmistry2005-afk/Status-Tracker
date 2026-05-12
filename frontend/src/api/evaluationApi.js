// src/api/evaluationApi.js

import axios from "axios";


// =========================================================
// 🔹 BASE CONFIG
// =========================================================

const BASE_URL = (

  import.meta.env.VITE_API_BASE_URL ||

  "http://127.0.0.1:8000"

).replace(/\/$/, "");


const API_TIMEOUT =

  Number(
    import.meta.env.VITE_API_TIMEOUT
  ) || 30000;


// =========================================================
// 🔹 AXIOS INSTANCE
// =========================================================

const api = axios.create({

  baseURL: BASE_URL,

  timeout: API_TIMEOUT,

  headers: {

    "Content-Type":
      "application/json",

    Accept:
      "application/json"
  }
});


// =========================================================
// 🔹 REQUEST LOGGER
// =========================================================

api.interceptors.request.use(

  (config) => {

    const debug =
      import.meta.env.VITE_DEBUG_MODE ===
      "true";

    if (debug) {

      console.groupCollapsed(

        `%c[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`,

        "color:#6c8cff;font-weight:bold"
      );

      console.log(
        "Base URL:",
        config.baseURL
      );

      console.log(
        "Payload:",
        config.data
      );

      console.groupEnd();
    }

    return config;
  },

  (error) => {

    return Promise.reject(error);
  }
);


// =========================================================
// 🔹 RESPONSE LOGGER
// =========================================================

api.interceptors.response.use(

  (response) => {

    const debug =
      import.meta.env.VITE_DEBUG_MODE ===
      "true";

    if (debug) {

      console.groupCollapsed(

        `%c[API RESPONSE] ${response.config.url}`,

        "color:#34d399;font-weight:bold"
      );

      console.log(
        response.data
      );

      console.groupEnd();
    }

    return response;
  },

  (error) => {

    let message =
      "Unknown API error";

    // -----------------------------------------------------
    // NETWORK FAILURE
    // -----------------------------------------------------

    if (!error.response) {

      message =
        "Backend server unreachable";

    } else {

      message =

        error.response?.data?.detail ||

        error.response?.data?.message ||

        error.message ||

        "Unknown API error";
    }

    console.group(

      "%c[API ERROR]",

      "color:#f87171;font-weight:bold"
    );

    console.error(message);

    console.error(error);

    console.groupEnd();

    return Promise.reject(
      new Error(message)
    );
  }
);


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


function ensureArray(value) {

  return Array.isArray(value)
    ? value
    : [];
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
// 🔹 EXTRACT NUMERIC
// =========================================================

function extractNumeric(value) {

  // -------------------------------------------------------
  // NUMBER
  // -------------------------------------------------------

  if (
    typeof value === "number"
  ) {

    return value;
  }

  // -------------------------------------------------------
  // OBJECT
  // -------------------------------------------------------

  if (
    typeof value === "object" &&
    value !== null
  ) {

    return safeNumber(

      value.score ??

      value.value ??

      value.rating ??

      0
    );
  }

  // -------------------------------------------------------
  // STRING
  // -------------------------------------------------------

  if (
    typeof value === "string"
  ) {

    return safeNumber(value);
  }

  return 0;
}


// =========================================================
// 🔹 NORMALIZE SCORE BREAKDOWN
// =========================================================

function normalizeScoreBreakdown(
  breakdown = {}
) {

  const safe =
    ensureObject(
      breakdown
    );

  return {

    communication:
      extractNumeric(
        safe.communication
      ),

    technical:
      extractNumeric(

        safe.technical ??

        safe.tech
      ),

    domain:
      extractNumeric(
        safe.domain
      ),

    experience:
      extractNumeric(
        safe.experience
      ),

    location:
      extractNumeric(
        safe.location
      ),

    feedback:
      extractNumeric(
        safe.feedback
      ),

    achievement:
      extractNumeric(

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

function normalizeEvaluationResponse(
  response = {}
) {

  const safe =
    ensureObject(
      response
    );

  return {

    success:
      safe.success ?? true,

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
      normalizeScoreBreakdown(

        safe.score_breakdown ||

        safe.breakdown ||

        {}
      ),

    insights:
      normalizeInsights(
        safe.insights
      ),

    adjustments:
      ensureObject(
        safe.adjustments
      ),

    domain_breakdown:
      ensureObject(
        safe.domain_breakdown
      ),

    metadata:
      ensureObject(
        safe.metadata
      )
  };
}


// =========================================================
// 🔹 SANITIZE PAYLOAD
// =========================================================

function sanitizePayload(
  payload = {}
) {

  const safe =
    ensureObject(
      payload
    );

  return {

    teacher_id:
      safe.teacher_id || "",

    name:
      safe.name || "",

    location:
      safe.location || "same",

    communication: {

      score:
        extractNumeric(
          safe.communication
        )
    },

    tech: {

      score:
        extractNumeric(
          safe.tech
        ),

      skills:
        ensureArray(
          safe.tech?.skills
        )
    },

    experience_years:
      safeNumber(
        safe.experience_years,
        0
      ),

    skills:
      ensureArray(
        safe.skills
      ),

    required_skills:
      ensureArray(
        safe.required_skills
      ),

    // IMPORTANT FIX
    student_feedback: {

      rating:
        extractNumeric(

          safe.student_feedback ??

          safe.feedback
        )
    },

    achievements:
      safeNumber(
        safe.achievements,
        0
      )
  };
}


// =========================================================
// 🔹 SINGLE EVALUATION
// =========================================================

export async function evaluateCandidate(
  payload
) {

  const sanitized =
    sanitizePayload(
      payload
    );

  const response =
    await api.post(

      "/evaluation/evaluate",

      sanitized
    );

  return normalizeEvaluationResponse(
    response.data
  );
}


// =========================================================
// 🔹 BATCH EVALUATION
// =========================================================

export async function evaluateBatch(
  candidates = []
) {

  const sanitized =
    ensureArray(
      candidates
    ).map(
      sanitizePayload
    );

  const response =
    await api.post(

      "/evaluation/evaluate/batch",

      {
        candidates:
          sanitized
      }
    );

  const data =
    ensureObject(
      response.data
    );

  return {

    success:
      data.success ?? true,

    total_candidates:
      safeNumber(
        data.total_candidates
      ),

    selected_count:
      safeNumber(
        data.selected_count
      ),

    strong_count:
      safeNumber(
        data.strong_count
      ),

    review_count:
      safeNumber(
        data.review_count
      ),

    rejected_count:
      safeNumber(
        data.rejected_count
      ),

    average_score:
      safeNumber(
        data.average_score
      ),

    summary:
      ensureObject(
        data.summary
      ),

    results:
      ensureArray(
        data.results
      ).map(
        normalizeEvaluationResponse
      )
  };
}


// =========================================================
// 🔹 DEBUG EVALUATION
// =========================================================

export async function evaluateDebug(
  payload
) {

  const response =
    await api.post(

      "/evaluation/evaluate/debug",

      sanitizePayload(
        payload
      )
    );

  return response.data;
}


// =========================================================
// 🔹 MINIMAL EVALUATION
// =========================================================

export async function evaluateMinimal(
  payload
) {

  const response =
    await api.post(

      "/evaluation/evaluate/minimal",

      sanitizePayload(
        payload
      )
    );

  return response.data;
}


// =========================================================
// 🔹 ADVANCED EVALUATION
// =========================================================

export async function evaluateAdvanced(

  payload,

  options = {}
) {

  const params =
    new URLSearchParams({

      debug:
        options.debug || false,

      minimal:
        options.minimal || false
    });

  const response =
    await api.post(

      `/evaluation/evaluate/advanced?${params.toString()}`,

      sanitizePayload(
        payload
      )
    );

  return response.data;
}


// =========================================================
// 🔹 HEALTH CHECK
// =========================================================

export async function fetchHealth() {

  const response =
    await api.get(
      "/evaluation/health"
    );

  const data =
    ensureObject(
      response.data
    );

  return {

    success:
      data.success ?? true,

    status:
      data.status || "offline",

    service:
      data.service ||
      "Teacher Evaluation API",

    version:
      data.version || "1.0.0",

    environment:
      data.environment ||
      "development",

    frontend_ready:
      Boolean(
        data.frontend_ready
      ),

    batch_processing:
      Boolean(
        data.batch_processing
      ),

    pipeline_ready:
      Boolean(
        data.pipeline_ready
      ),

    available_routes:
      ensureArray(
        data.available_routes
      )
  };
}


// =========================================================
// 🔹 API ROOT
// =========================================================

export async function fetchApiInfo() {

  const response =
    await api.get(
      "/evaluation/"
    );

  return response.data;
}


// =========================================================
// 🔹 VERSION
// =========================================================

export async function fetchVersion() {

  const response =
    await api.get(
      "/evaluation/version"
    );

  return response.data;
}


// =========================================================
// 🔹 READINESS
// =========================================================

export async function fetchReadiness() {

  const response =
    await api.get(
      "/evaluation/ready"
    );

  return response.data;
}


// =========================================================
// 🔹 EMPTY PAYLOAD
// =========================================================

export function buildEmptyPayload() {

  return {

    teacher_id: "",

    name: "",

    location: "same",

    communication: {
      score: 7
    },

    tech: {

      score: 7,

      skills: []
    },

    experience_years: 1,

    skills: [],

    required_skills: [],

    // IMPORTANT FIX
    student_feedback: {
      rating: 7
    },

    achievements: 0
  };
}


// =========================================================
// 🔹 STATUS CLASS
// =========================================================

export function statusClass(
  status
) {

  const map = {

    SELECTED:
      "selected",

    STRONG:
      "strong",

    REVIEW:
      "review",

    REJECTED:
      "rejected"
  };

  return (
    map[status] ||
    "review"
  );
}


// =========================================================
// 🔹 STATUS LABEL
// =========================================================

export function statusLabel(
  status
) {

  const map = {

    SELECTED:
      "✓ Selected",

    STRONG:
      "↑ Strong",

    REVIEW:
      "⌛ Review",

    REJECTED:
      "✗ Rejected"
  };

  return (
    map[status] ||
    status
  );
}


// =========================================================
// 🔹 SCORE COLOR
// =========================================================

export function scoreColor(
  score
) {

  if (score >= 85) {

    return "var(--green)";
  }

  if (score >= 70) {

    return "var(--accent)";
  }

  if (score >= 55) {

    return "var(--amber)";
  }

  return "var(--red)";
}


// =========================================================
// 🔹 SCORE LABEL
// =========================================================

export function scoreLabel(
  score
) {

  if (score >= 85) {

    return "Excellent";
  }

  if (score >= 70) {

    return "Strong";
  }

  if (score >= 55) {

    return "Average";
  }

  return "Weak";
}


// =========================================================
// 🔹 EXPORT API
// =========================================================

export default api;