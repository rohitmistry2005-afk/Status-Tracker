// src/components/evaluation/InsightPanel.jsx

import React, {

  useMemo,

  useState

} from "react";


// =========================================================
// 🔹 ICONS
// =========================================================

const ICONS = {

  strength: "✦",

  weakness: "◌",

  recommendation: "→",

  summary: "◆",

  flag: "⚑"
};


// =========================================================
// 🔹 COLORS
// =========================================================

const COLORS = {

  strength: {

    bg:
      "var(--green-dim)",

    color:
      "var(--green)",

    border:
      "rgba(52,211,153,0.2)"
  },

  weakness: {

    bg:
      "var(--red-dim)",

    color:
      "var(--red)",

    border:
      "rgba(248,113,113,0.2)"
  },

  recommendation: {

    bg:
      "var(--accent-dim)",

    color:
      "var(--accent)",

    border:
      "rgba(108,140,255,0.2)"
  },

  summary: {

    bg:
      "rgba(99,102,241,0.10)",

    color:
      "var(--accent)",

    border:
      "rgba(99,102,241,0.2)"
  },

  flag: {

    bg:
      "rgba(245,158,11,0.10)",

    color:
      "var(--amber)",

    border:
      "rgba(245,158,11,0.2)"
  }
};


// =========================================================
// 🔹 HELPERS
// =========================================================

function normalizeArray(
  value
) {

  if (
    Array.isArray(value)
  ) {

    return value.filter(Boolean);
  }

  return [];
}


function formatAdjustmentLabel(
  label
) {

  return label
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (c) =>
        c.toUpperCase()
    );
}


// =========================================================
// 🔹 INSIGHT CHIP
// =========================================================

function InsightChip({

  text,

  type = "recommendation"

}) {

  const style =
    COLORS[type] ||
    COLORS.recommendation;

  return (

    <div
      style={{

        display: "flex",

        alignItems:
          "flex-start",

        gap: 12,

        padding:
          "12px 14px",

        background:
          style.bg,

        border:
          `1px solid ${style.border}`,

        borderRadius:
          "var(--radius-md)",

        lineHeight: 1.6
      }}
    >

      {/* Icon */}

      <span
        style={{

          color:
            style.color,

          fontWeight: 700,

          flexShrink: 0,

          marginTop: 1
        }}
      >

        {ICONS[type]}

      </span>

      {/* Text */}

      <span
        style={{

          color:
            "var(--text-secondary)",

          fontSize: 13
        }}
      >

        {text}

      </span>

    </div>
  );
}


// =========================================================
// 🔹 SECTION
// =========================================================

function Section({

  title,

  items = [],

  type,

  defaultOpen = true

}) {

  const [

    open,

    setOpen

  ] = useState(defaultOpen);

  if (
    !items ||
    items.length === 0
  ) {

    return null;
  }

  const style =
    COLORS[type] ||
    COLORS.recommendation;

  return (

    <div
      style={{
        marginBottom: 24
      }}
    >

      {/* Header */}

      <button
        onClick={() =>
          setOpen((p) => !p)
        }
        style={{

          width: "100%",

          display: "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          background:
            "transparent",

          border: "none",

          cursor: "pointer",

          padding: 0,

          marginBottom: 14
        }}
      >

        {/* Left */}

        <div
          style={{

            display: "flex",

            alignItems:
              "center",

            gap: 10
          }}
        >

          <span
            style={{

              fontSize: 12,

              fontWeight: 700,

              letterSpacing:
                "0.06em",

              textTransform:
                "uppercase",

              color:
                style.color
            }}
          >

            {title}

          </span>

          <span
            style={{

              background:
                style.bg,

              border:
                `1px solid ${style.border}`,

              color:
                style.color,

              padding:
                "2px 8px",

              borderRadius: 100,

              fontSize: 10,

              fontWeight: 700
            }}
          >

            {items.length}

          </span>

        </div>

        {/* Right */}

        <span
          style={{

            color:
              "var(--text-muted)",

            fontSize: 12
          }}
        >

          {open ? "▲" : "▼"}

        </span>

      </button>

      {/* Content */}

      {open && (

        <div
          style={{

            display: "flex",

            flexDirection:
              "column",

            gap: 10
          }}
        >

          {items.map(
            (item, index) => (

              <InsightChip
                key={index}
                text={item}
                type={type}
              />
            )
          )}

        </div>
      )}

    </div>
  );
}


// =========================================================
// 🔹 ADJUSTMENT PANEL
// =========================================================

function AdjustmentPanel({

  adjustments = {}

}) {

  const entries =
    Object.entries(
      adjustments
    );

  if (
    entries.length === 0
  ) {

    return null;
  }

  const bonuses =
    entries.filter(
      ([_, value]) =>
        Number(value) > 0
    );

  const penalties =
    entries.filter(
      ([_, value]) =>
        Number(value) < 0
    );

  return (

    <div
      style={{
        marginTop: 8
      }}
    >

      {/* Title */}

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

        Score Adjustments

      </div>

      {/* Bonus */}

      {bonuses.length > 0 && (

        <div
          style={{
            marginBottom: 14
          }}
        >

          {bonuses.map(
            ([label, value]) => (

              <div
                key={label}
                style={{

                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  padding:
                    "8px 0",

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

                  {formatAdjustmentLabel(
                    label
                  )}

                </span>

                <span
                  style={{

                    color:
                      "var(--green)",

                    fontWeight: 700,

                    fontFamily:
                      "var(--font-mono)"
                  }}
                >

                  +{value}

                </span>

              </div>
            )
          )}

        </div>
      )}

      {/* Penalty */}

      {penalties.length > 0 && (

        <div>

          {penalties.map(
            ([label, value]) => (

              <div
                key={label}
                style={{

                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  padding:
                    "8px 0",

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

                  {formatAdjustmentLabel(
                    label
                  )}

                </span>

                <span
                  style={{

                    color:
                      "var(--red)",

                    fontWeight: 700,

                    fontFamily:
                      "var(--font-mono)"
                  }}
                >

                  {value}

                </span>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}


// =========================================================
// 🔹 MAIN COMPONENT
// =========================================================

export default function InsightPanel({

  insights = {},

  adjustments = {},

  compact = false

}) {

  // =======================================================
  // 🔹 NORMALIZATION
  // =======================================================

  const normalized =
    useMemo(() => {

      // ---------------------------------------------------
      // Array Mode
      // ---------------------------------------------------

      if (
        Array.isArray(insights)
      ) {

        const strengths = [];
        const weaknesses = [];
        const recommendations = [];

        insights.forEach(
          (item) => {

            const text =
              String(item)
                .toLowerCase();

            if (

              text.includes(
                "excellent"
              ) ||

              text.includes(
                "strong"
              ) ||

              text.includes(
                "outstanding"
              ) ||

              text.includes(
                "high"
              )

            ) {

              strengths.push(item);

            } else if (

              text.includes(
                "weak"
              ) ||

              text.includes(
                "poor"
              ) ||

              text.includes(
                "limited"
              ) ||

              text.includes(
                "low"
              )

            ) {

              weaknesses.push(item);

            } else {

              recommendations.push(
                item
              );
            }
          }
        );

        return {

          summary: "",

          strengths,

          weaknesses,

          recommendations,

          flags: []
        };
      }

      // ---------------------------------------------------
      // Object Mode
      // ---------------------------------------------------

      return {

        summary:
          insights.summary || "",

        strengths:
          normalizeArray(
            insights.strengths
          ),

        weaknesses:
          normalizeArray(
            insights.weaknesses
          ),

        recommendations:
          normalizeArray(
            insights.recommendations
          ),

        flags:
          normalizeArray(
            insights.flags
          )
      };

    }, [insights]);


  const hasContent =

    normalized.summary ||

    normalized.strengths.length ||

    normalized.weaknesses.length ||

    normalized.recommendations
      .length ||

    normalized.flags.length ||

    Object.keys(adjustments)
      .length > 0;


  if (!hasContent) {

    return null;
  }

  return (

    <div
      className="card"
      style={{
        marginTop: 20
      }}
    >

      {/* Header */}

      <div
        style={{
          marginBottom: 24
        }}
      >

        <div
          style={{

            fontSize: 14,

            fontWeight: 700,

            letterSpacing:
              "0.06em",

            textTransform:
              "uppercase",

            color:
              "var(--text-primary)",

            marginBottom: 6
          }}
        >

          Evaluation Insights

        </div>

        <div
          style={{

            fontSize: 12,

            color:
              "var(--text-muted)"
          }}
        >

          Explainable AI Analysis

        </div>

      </div>

      {/* Summary */}

      {normalized.summary && (

        <div
          style={{
            marginBottom: 24
          }}
        >

          <InsightChip
            text={normalized.summary}
            type="summary"
          />

        </div>
      )}

      {/* Strengths */}

      <Section

        title="Strengths"

        items={
          normalized.strengths
        }

        type="strength"

        defaultOpen
      />

      {/* Weaknesses */}

      <Section

        title="Weaknesses"

        items={
          normalized.weaknesses
        }

        type="weakness"

        defaultOpen
      />

      {/* Recommendations */}

      <Section

        title="Recommendations"

        items={
          normalized.recommendations
        }

        type="recommendation"

        defaultOpen={!compact}
      />

      {/* Flags */}

      <Section

        title="Flags"

        items={
          normalized.flags
        }

        type="flag"

        defaultOpen={false}
      />

      {/* Adjustments */}

      <AdjustmentPanel
        adjustments={adjustments}
      />

    </div>
  );
}