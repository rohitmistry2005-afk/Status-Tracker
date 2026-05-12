// src/App.jsx

import React, {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  Component

} from "react";

import {

  BrowserRouter,

  Navigate,

  Route,

  Routes,

  useLocation

} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar.jsx";

import TopBar from "./components/layout/TopBar.jsx";

import Dashboard from "./pages/Dashboard.jsx";

import EvaluatePage from "./pages/EvaluatePage.jsx";

import BatchPage from "./pages/BatchPage.jsx";

import HealthPage from "./pages/HealthPage.jsx";


// =========================================================
// 🔹 APP CONTEXT
// =========================================================

export const AppContext =
  createContext(null);


export function useAppContext() {

  const ctx =
    useContext(AppContext);

  if (!ctx) {

    throw new Error(
      "useAppContext must be used inside AppProvider"
    );
  }

  return ctx;
}


// =========================================================
// 🔹 TOAST ICONS
// =========================================================

const TOAST_ICONS = {

  success: "✓",

  error: "⚠",

  warning: "▲",

  info: "ℹ"
};


// =========================================================
// 🔹 TOAST COLORS
// =========================================================

const TOAST_COLORS = {

  success: {

    border:
      "rgba(52,211,153,0.35)",

    icon:
      "var(--green)"
  },

  error: {

    border:
      "rgba(248,113,113,0.35)",

    icon:
      "var(--red)"
  },

  warning: {

    border:
      "rgba(245,158,11,0.35)",

    icon:
      "var(--amber)"
  },

  info: {

    border:
      "rgba(108,140,255,0.35)",

    icon:
      "var(--accent)"
  }
};


// =========================================================
// 🔹 TOAST CONTAINER
// =========================================================

function ToastContainer({

  toasts,

  onDismiss

}) {

  if (
    !toasts ||
    toasts.length === 0
  ) {

    return null;
  }

  return (

    <div
      style={{

        position: "fixed",

        bottom: 24,

        right: 24,

        zIndex: 9999,

        display: "flex",

        flexDirection:
          "column",

        gap: 12,

        width: 340,

        pointerEvents: "none"
      }}
    >

      {toasts.map(
        (toast) => {

          const style =
            TOAST_COLORS[
              toast.type
            ] ||
            TOAST_COLORS.info;

          return (

            <div
              key={toast.id}
              style={{

                pointerEvents:
                  "all",

                background:
                  "var(--bg-card)",

                border:
                  `1px solid ${style.border}`,

                borderRadius:
                  "var(--radius-lg)",

                padding:
                  "14px 16px",

                display: "flex",

                gap: 12,

                alignItems:
                  "flex-start",

                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.35)",

                animation:
                  "toastSlideIn 0.25s ease"
              }}
            >

              {/* Icon */}

              <span
                style={{

                  fontSize: 15,

                  color:
                    style.icon,

                  flexShrink: 0,

                  marginTop: 1
                }}
              >

                {TOAST_ICONS[
                  toast.type
                ] ||
                  "ℹ"}

              </span>

              {/* Content */}

              <div
                style={{
                  flex: 1
                }}
              >

                <div
                  style={{

                    fontSize: 13,

                    fontWeight: 700,

                    color:
                      "var(--text-primary)",

                    lineHeight: 1.4
                  }}
                >

                  {toast.title}

                </div>

                {toast.message && (

                  <div
                    style={{

                      fontSize: 12,

                      color:
                        "var(--text-secondary)",

                      marginTop: 4,

                      lineHeight: 1.6
                    }}
                  >

                    {toast.message}

                  </div>
                )}

              </div>

              {/* Close */}

              <button
                onClick={() =>
                  onDismiss(
                    toast.id
                  )
                }
                style={{

                  background:
                    "transparent",

                  border: "none",

                  cursor: "pointer",

                  color:
                    "var(--text-muted)",

                  fontSize: 14,

                  padding: 0
                }}
              >

                ×

              </button>

            </div>
          );
        }
      )}

      <style>

        {`

          @keyframes toastSlideIn {

            from {

              opacity: 0;

              transform:
                translateY(10px);

            }

            to {

              opacity: 1;

              transform:
                translateY(0);

            }

          }

        `}

      </style>

    </div>
  );
}


// =========================================================
// 🔹 ERROR BOUNDARY
// =========================================================

class ErrorBoundary
  extends Component {

  constructor(props) {

    super(props);

    this.state = {

      hasError: false,

      error: null
    };
  }

  static getDerivedStateFromError(
    error
  ) {

    return {

      hasError: true,

      error
    };
  }

  componentDidCatch(
    error,
    info
  ) {

    console.error(
      "Application Error:",
      error,
      info
    );
  }

  render() {

    if (
      this.state.hasError
    ) {

      return (

        <div
          style={{

            minHeight:
              "100vh",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            flexDirection:
              "column",

            gap: 20,

            padding: 40,

            textAlign:
              "center"
          }}
        >

          <div
            style={{
              fontSize: 64
            }}
          >

            ⚠

          </div>

          <div
            style={{

              fontSize: 22,

              fontWeight: 700,

              color:
                "var(--text-primary)"
            }}
          >

            Something went wrong

          </div>

          <div
            style={{

              maxWidth: 480,

              fontSize: 14,

              color:
                "var(--text-secondary)",

              lineHeight: 1.7
            }}
          >

            {this.state.error
              ?.message ||
              "Unexpected application error"}

          </div>

          <button
            className="btn btn-primary"
            onClick={() => {

              this.setState({

                hasError: false,

                error: null
              });

              window.location.href =
                "/dashboard";
            }}
          >

            Return to Dashboard

          </button>

        </div>
      );
    }

    return this.props.children;
  }
}


// =========================================================
// 🔹 PAGE TRANSITION
// =========================================================

function PageTransition({

  children

}) {

  const location =
    useLocation();

  const [

    visible,

    setVisible

  ] = useState(false);

  useEffect(() => {

    setVisible(false);

    const timer =
      setTimeout(
        () =>
          setVisible(true),
        40
      );

    return () =>
      clearTimeout(timer);

  }, [location.pathname]);

  return (

    <div
      style={{

        opacity:
          visible ? 1 : 0,

        transform:
          visible
            ? "translateY(0)"
            : "translateY(8px)",

        transition:
          "all 0.25s ease"
      }}
    >

      {children}

    </div>
  );
}


// =========================================================
// 🔹 APP PROVIDER
// =========================================================

function AppProvider({

  children

}) {

  const [

    toasts,

    setToasts

  ] = useState([]);

  const [

    history,

    setHistory

  ] = useState([]);


  // =======================================================
  // 🔹 TOAST
  // =======================================================

  const toast =
    useCallback(

      (
        title,
        message = "",
        type = "info"
      ) => {

        const id =
          Date.now() +
          Math.random();

        const item = {

          id,

          title,

          message,

          type
        };

        setToasts(
          (prev) => [

            ...prev.slice(-4),

            item
          ]
        );

        setTimeout(() => {

          setToasts(
            (prev) =>
              prev.filter(
                (t) =>
                  t.id !== id
              )
          );

        }, 4500);

      },

      []
    );


  // =======================================================
  // 🔹 DISMISS
  // =======================================================

  const dismissToast =
    useCallback(
      (id) => {

        setToasts(
          (prev) =>
            prev.filter(
              (t) =>
                t.id !== id
            )
        );

      },
      []
    );


  // =======================================================
  // 🔹 PUSH HISTORY
  // =======================================================

  const pushHistory =
    useCallback(

      (record) => {

        setHistory(
          (prev) => [

            {

              ...record,

              timestamp:
                new Date().toISOString()
            },

            ...prev.slice(0, 19)
          ]
        );
      },

      []
    );


  // =======================================================
  // 🔹 CLEAR HISTORY
  // =======================================================

  const clearHistory =
    useCallback(() => {

      setHistory([]);

    }, []);


  // =======================================================
  // 🔹 CONTEXT VALUE
  // =======================================================

  const value =
    useMemo(
      () => ({

        toast,

        history,

        pushHistory,

        clearHistory
      }),

      [

        toast,

        history,

        pushHistory,

        clearHistory
      ]
    );


  return (

    <AppContext.Provider
      value={value}
    >

      {children}

      <ToastContainer
        toasts={toasts}
        onDismiss={
          dismissToast
        }
      />

    </AppContext.Provider>
  );
}


// =========================================================
// 🔹 404 PAGE
// =========================================================

function NotFoundPage() {

  return (

    <div
      style={{

        height: "70vh",

        display: "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        flexDirection:
          "column",

        gap: 18,

        textAlign:
          "center"
      }}
    >

      <div
        style={{
          fontSize: 72
        }}
      >

        ◌

      </div>

      <div
        style={{

          fontSize: 22,

          fontWeight: 700,

          color:
            "var(--text-primary)"
        }}
      >

        404 — Page Not Found

      </div>

      <div
        style={{

          fontSize: 14,

          color:
            "var(--text-secondary)"
        }}
      >

        The requested route does not exist.

      </div>

      <Navigate
        to="/dashboard"
        replace
      />

    </div>
  );
}


// =========================================================
// 🔹 SHELL LAYOUT
// =========================================================
// The sidebar collapse state lives here so that when the
// sidebar toggles between 240px and 60px, we update the
// CSS variable --sidebar-width on the root element.
// This keeps the app-shell CSS grid column in sync —
// without this, the grid never reflows on collapse.
// =========================================================

function Shell() {

  const [

    sidebarCollapsed,

    setSidebarCollapsed

  ] = useState(false);


  // =======================================================
  // 🔹 SYNC CSS VARIABLE WITH SIDEBAR STATE
  // =======================================================
  // app-shell grid uses var(--sidebar-width) for column 1.
  // We update the CSS variable here whenever collapse
  // state changes so the grid reflows correctly.
  // =======================================================

  useEffect(() => {

    document
      .documentElement
      .style
      .setProperty(
        "--sidebar-width",
        sidebarCollapsed
          ? "60px"
          : "240px"
      );

  }, [sidebarCollapsed]);


  // =======================================================
  // 🔹 TOGGLE HANDLER
  // =======================================================

  const handleSidebarToggle =
    useCallback(() => {

      setSidebarCollapsed(
        (prev) => !prev
      );

    }, []);


  return (

    <div className="app-shell">

      {/* Sidebar — receives collapse state as props */}

      <Sidebar
        collapsed={
          sidebarCollapsed
        }
        onToggle={
          handleSidebarToggle
        }
      />

      {/* TopBar */}

      <TopBar />

      {/* Main content area */}

      <main
        className="main-content"
      >

        <PageTransition>

          <Routes>

            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={
                <Dashboard />
              }
            />

            <Route
              path="/evaluate"
              element={
                <EvaluatePage />
              }
            />

            <Route
              path="/batch"
              element={
                <BatchPage />
              }
            />

            <Route
              path="/health"
              element={
                <HealthPage />
              }
            />

            <Route
              path="*"
              element={
                <NotFoundPage />
              }
            />

          </Routes>

        </PageTransition>

      </main>

    </div>
  );
}


// =========================================================
// 🔹 ROOT APP
// =========================================================

export default function App() {

  return (

    <ErrorBoundary>

      <BrowserRouter>

        <AppProvider>

          <Shell />

        </AppProvider>

      </BrowserRouter>

    </ErrorBoundary>
  );
}