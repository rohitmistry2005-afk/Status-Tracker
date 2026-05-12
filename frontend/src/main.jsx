// src/main.jsx

import React, {

  StrictMode

} from "react";

import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./styles/globals.css";


// =========================================================
// 🔹 PERFORMANCE MARKS
// =========================================================

if (

  typeof performance !==
    "undefined" &&

  performance.mark

) {

  performance.mark(
    "teacher-eval-app-start"
  );
}


// =========================================================
// 🔹 GLOBAL ERROR HANDLING
// =========================================================

// ---------------------------------------------------------
// UNHANDLED PROMISE REJECTIONS
// ---------------------------------------------------------

window.addEventListener(

  "unhandledrejection",

  (event) => {

    const reason =
      event.reason;

    console.group(

      "%c[TeacherEval] Unhandled Promise Rejection",

      "color:#f87171;font-weight:bold"
    );

    console.error(reason);

    console.groupEnd();

    // -----------------------------------------------------
    // Network Error Hint
    // -----------------------------------------------------

    const isNetworkError =

      reason instanceof
        TypeError &&

      String(
        reason.message
      )
        .toLowerCase()
        .includes("fetch");

    if (isNetworkError) {

      console.warn(

        "%cFastAPI backend may not be running.",

        "color:#fbbf24;font-weight:bold"
      );

      console.info(

        "Run:\nuvicorn app:app --reload"
      );
    }

    event.preventDefault();
  }
);


// ---------------------------------------------------------
// GLOBAL WINDOW ERROR
// ---------------------------------------------------------

window.addEventListener(

  "error",

  (event) => {

    console.group(

      "%c[TeacherEval] Global Runtime Error",

      "color:#f87171;font-weight:bold"
    );

    console.error(
      event.error ||
        event.message
    );

    console.groupEnd();
  }
);


// =========================================================
// 🔹 DEV API HELPER
// =========================================================

if (import.meta.env.DEV) {

  const API_BASE =

    import.meta.env
      .VITE_API_BASE_URL ||

    "http://127.0.0.1:8000";


  // =======================================================
  // 🔹 INTERNAL FETCH
  // =======================================================

  async function devFetch(

    path,

    options = {}

  ) {

    const response =
      await fetch(

        `${API_BASE}${path}`,

        {

          headers: {

            "Content-Type":
              "application/json"
          },

          ...options
        }
      );

    if (!response.ok) {

      const body =
        await response.text();

      throw new Error(

        `${response.status} ${response.statusText}\n${body}`
      );
    }

    return response.json();
  }


  // =======================================================
  // 🔹 GLOBAL DEV OBJECT
  // =======================================================

  window.__DEV_API__ = {

    // -----------------------------------------------------
    // HEALTH
    // -----------------------------------------------------

    health: () =>
      devFetch(
        "/evaluation/health"
      ),

    // -----------------------------------------------------
    // SINGLE EVALUATION
    // -----------------------------------------------------

    evaluate: (
      candidate
    ) =>

      devFetch(
        "/evaluation/evaluate",

        {

          method: "POST",

          body:
            JSON.stringify(
              candidate
            )
        }
      ),

    // -----------------------------------------------------
    // BATCH EVALUATION
    // -----------------------------------------------------

    batch: (
      candidates
    ) =>

      devFetch(
        "/evaluation/evaluate/batch",

        {

          method: "POST",

          body:
            JSON.stringify({

              candidates
            })
        }
      ),

    // -----------------------------------------------------
    // DEBUG
    // -----------------------------------------------------

    debug: (
      candidate
    ) =>

      devFetch(
        "/evaluation/evaluate/debug",

        {

          method: "POST",

          body:
            JSON.stringify(
              candidate
            )
        }
      ),

    // -----------------------------------------------------
    // MINIMAL
    // -----------------------------------------------------

    minimal: (
      candidate
    ) =>

      devFetch(
        "/evaluation/evaluate/minimal",

        {

          method: "POST",

          body:
            JSON.stringify(
              candidate
            )
        }
      ),

    // -----------------------------------------------------
    // ADVANCED
    // -----------------------------------------------------

    advanced: (
      candidate
    ) =>

      devFetch(
        "/evaluation/evaluate/advanced",

        {

          method: "POST",

          body:
            JSON.stringify(
              candidate
            )
        }
      ),

    // -----------------------------------------------------
    // SMOKE TEST
    // -----------------------------------------------------

    smokeTest:
      async () => {

        console.group(

          "%c[TeacherEval] Smoke Test",

          "color:#6c8cff;font-weight:bold"
        );

        try {

          const result =
            await devFetch(

              "/evaluation/evaluate",

              {

                method: "POST",

                body:
                  JSON.stringify({

                    teacher_id:
                      "SMOKE_01",

                    name:
                      "Smoke Test Candidate",

                    communication:
                      {
                        score: 8
                      },

                    tech: {
                      score: 7
                    },

                    experience_years:
                      2,

                    location:
                      "same",

                    skills: [
                      "python",
                      "ml"
                    ],

                    required_skills:
                      [
                        "python",
                        "ml",
                        "dl"
                      ],

                    student_feedback:
                      {
                        rating: 8
                      },

                    achievements:
                      1
                  })
              }
            );

          console.log(
            "✓ Evaluation successful"
          );

          console.table({

            final_score:
              result.final_score,

            status:
              result.status
          });

          console.log(
            result
          );

        } catch (err) {

          console.error(
            "✗ Smoke test failed",
            err
          );
        }

        console.groupEnd();
      }
  };


  // =======================================================
  // 🔹 DEV CONSOLE INFO
  // =======================================================

  console.info(

    "%c[TeacherEval] Development API Loaded",

    "color:#6c8cff;font-weight:bold"
  );

  console.info(

    "Try:\nawait window.__DEV_API__.health()"
  );
}


// =========================================================
// 🔹 ENVIRONMENT VALIDATION
// =========================================================

if (import.meta.env.DEV) {

  const REQUIRED_ENV = [

    "VITE_API_BASE_URL"
  ];

  REQUIRED_ENV.forEach(
    (key) => {

      if (
        !import.meta.env[key]
      ) {

        console.warn(

          `%c[TeacherEval] Missing environment variable: ${key}`,

          "color:#fbbf24;font-weight:bold"
        );

        console.info(

          `Add to .env:\n${key}=http://127.0.0.1:8000`
        );
      }
    }
  );


  console.info(

    "%c[TeacherEval] API Base URL:",

    "color:#34d399;font-weight:bold",

    import.meta.env
      .VITE_API_BASE_URL ||

      "http://127.0.0.1:8000"
  );
}


// =========================================================
// 🔹 ROOT CONTAINER
// =========================================================

const container =
  document.getElementById(
    "root"
  );

if (!container) {

  throw new Error(

    '[TeacherEval] Missing root element: <div id="root"></div>'
  );
}


// =========================================================
// 🔹 CREATE ROOT
// =========================================================

const root =
  ReactDOM.createRoot(
    container
  );


// =========================================================
// 🔹 RENDER APPLICATION
// =========================================================

root.render(

  <StrictMode>

    <App />

  </StrictMode>
);


// =========================================================
// 🔹 PERFORMANCE MEASURE
// =========================================================

if (

  typeof performance !==
    "undefined" &&

  performance.measure

) {

  setTimeout(() => {

    try {

      performance.mark(
        "teacher-eval-mounted"
      );

      performance.measure(

        "teacher-eval-boot-time",

        "teacher-eval-app-start",

        "teacher-eval-mounted"
      );

      const [

        entry

      ] = performance.getEntriesByName(

        "teacher-eval-boot-time"
      );

      if (

        entry &&
        import.meta.env.DEV

      ) {

        console.debug(

          `%c[TeacherEval] Boot completed in ${entry.duration.toFixed(1)}ms`,

          "color:#34d399;font-weight:bold"
        );
      }

    } catch (_) {

      // ignore performance measure errors
    }

  }, 0);
}


// =========================================================
// 🔹 HOT MODULE REPLACEMENT
// =========================================================

if (import.meta.hot) {

  // -------------------------------------------------------
  // ACCEPT
  // -------------------------------------------------------

  import.meta.hot.accept(
    () => {

      console.info(

        "%c[TeacherEval] HMR update accepted",

        "color:#34d399;font-weight:bold"
      );
    }
  );


  // -------------------------------------------------------
  // BEFORE UPDATE
  // -------------------------------------------------------

  import.meta.hot.on(

    "vite:beforeUpdate",

    (payload) => {

      console.groupCollapsed(

        `%c[HMR] ${payload.updates.length} update(s)`,

        "color:#6c8cff"
      );

      payload.updates.forEach(
        (update) => {

          console.log(

            `${update.type} → ${update.path}`
          );
        }
      );

      console.groupEnd();
    }
  );


  // -------------------------------------------------------
  // FULL RELOAD
  // -------------------------------------------------------

  import.meta.hot.on(

    "vite:beforeFullReload",

    (payload) => {

      console.warn(

        "%c[HMR] Full reload triggered",

        "color:#fbbf24;font-weight:bold",

        payload?.path || ""
      );
    }
  );
}