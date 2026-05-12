// src/components/evaluation/ScoreBreakdown.jsx

import React, {

  useEffect,

  useMemo,

  useState

} from "react";

import {

  scoreColor,

  scoreLabel

} from "../../api/evaluationApi.js";


// =========================================================
// 🔹 DIMENSION CONFIGURATION
// =========================================================

const DIMENSIONS = [

  {
    key: "communication",
    label: "Communication",
    short: "COMM",
    weight: 0.25,
    icon: "◈"
  },

  {
    key: "technical",
    label: "Technical",
    short: "TECH",
    weight: 0.20,
    icon: "⬢"
  },

  {
    key: "domain",
    label: "Domain Intelligence",
    short: "DOMAIN",
    weight: 0.20,
    icon: "⬡"
  },

  {
    key: "experience",
    label: "Experience",
    short: "EXP",
    weight: 0.15,
    icon: "◎"
  },

  {
    key: "location",
    label: "Location",
    short: "LOC",
    weight: 0.08,
    icon: "◌"
  },

  {
    key: "feedback",
    label: "Feedback",
    short: "FDBK",
    weight: 0.07,
    icon: "✦"
  },

  {
    key: "achievement",
    label: "Achievements",
    short: "ACH",
    weight: 0.05,
    icon: "◆"
  }
];


// =========================================================
// 🔹 HELPERS
// =========================================================

function normalizeValue(
  value
) {

  if (
    typeof value === "number"
  ) {

    return value;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {

    return (
      value.score ||
      value.value ||
      0
    );
  }

  return (
    parseFloat(value) || 0
  );
}


function calculatePercentage(
  value,
  max = 10
) {

  return Math.min(
    100,
    (value / max) * 100
  );
}


// =========================================================
// 🔹 ANIMATED BAR
// =========================================================

function AnimatedBar({

  value,

  max = 10,

  color,

  delay = 0

}) {

  const [

    width,

    setWidth

  ] = useState(0);

  useEffect(() => {

    const timer =
      setTimeout(() => {

        setWidth(
          calculatePercentage(
            value,
            max
          )
        );

      }, delay);

    return () =>
      clearTimeout(timer);

  }, [value, max, delay]);

  return (

    <div
      style={{

        width: "100%",

        height: 8,

        background:
          "var(--bg-input)",

        borderRadius: 100,

        overflow: "hidden",

        border:
          "1px solid var(--border)"
      }}
    >

      <div
        style={{

          width: `${width}%`,

          height: "100%",

          borderRadius: 100,

          background:
            `linear-gradient(90deg, ${color}88, ${color})`,

          transition:
            "width 0.8s cubic-bezier(0.34,1.56,0.64,1)"
        }}
      />

    </div>
  );
}


// =========================================================
// 🔹 DIMENSION ROW
// =========================================================

function DimensionRow({

  dimension,

  value,

  index

}) {

  const numeric =
    normalizeValue(value);

  const percentage =
    calculatePercentage(
      numeric
    );

  const color =
    scoreColor(
      percentage
    );

  return (

    <div
      style={{
        marginBottom: 18
      }}
    >

      {/* Header */}

      <div
        style={{

          display: "flex",

          justifyContent:
            "space-between",

          alignItems: "center",

          marginBottom: 8
        }}
      >

        {/* Left */}

        <div
          style={{

            display: "flex",

            alignItems: "center",

            gap: 10
          }}
        >

          <span
            style={{

              color:
                "var(--text-muted)",

              fontSize: 13,

              width: 18,

              textAlign:
                "center"
            }}
          >

            {dimension.icon}

          </span>

          <div>

            <div
              style={{

                fontSize: 13,

                color:
                  "var(--text-primary)",

                fontWeight: 500
              }}
            >

              {dimension.label}

            </div>

            <div
              style={{

                fontSize: 10,

                color:
                  "var(--text-muted)",

                fontFamily:
                  "var(--font-mono)"
              }}
            >

              Weight ×
              {dimension.weight.toFixed(2)}

            </div>

          </div>

        </div>

        {/* Right */}

        <div
          style={{

            display: "flex",

            alignItems: "baseline",

            gap: 6
          }}
        >

          <span
            style={{

              fontSize: 16,

              fontWeight: 700,

              color,

              fontFamily:
                "var(--font-mono)"
            }}
          >

            {numeric.toFixed(1)}

          </span>

          <span
            style={{

              fontSize: 10,

              color:
                "var(--text-muted)"
            }}
          >

            /10

          </span>

          <span
            style={{

              fontSize: 10,

              color,

              minWidth: 36,

              textAlign: "right",

              fontFamily:
                "var(--font-mono)"
            }}
          >

            {percentage.toFixed(0)}%

          </span>

        </div>

      </div>

      {/* Bar */}

      <AnimatedBar

        value={numeric}

        max={10}

        color={color}

        delay={index * 70}
      />

    </div>
  );
}


// =========================================================
// 🔹 RADAR CHART
// =========================================================

export function RadarBreakdown({

  breakdown = {},

  size = 240

}) {

  const center =
    size / 2;

  const radius =
    size * 0.35;

  const angleStep =
    (Math.PI * 2) /
    DIMENSIONS.length;

  const levels = 5;


  function point(
    angle,
    distance
  ) {

    return {

      x:
        center +
        Math.cos(angle) *
          distance,

      y:
        center +
        Math.sin(angle) *
          distance
    };
  }


  const polygonPoints =
    DIMENSIONS.map(

      (d, i) => {

        const val =
          normalizeValue(
            breakdown[d.key]
          );

        const r =
          (val / 10) *
          radius;

        const p =
          point(
            i * angleStep -
              Math.PI / 2,
            r
          );

        return `${p.x},${p.y}`;
      }
    ).join(" ");


  return (

    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        display: "block",
        margin: "0 auto"
      }}
    >

      {/* Rings */}

      {Array.from({
        length: levels
      }).map((_, level) => {

        const r =
          ((level + 1) /
            levels) *
          radius;

        const pts =
          DIMENSIONS.map(
            (_, i) => {

              const p =
                point(
                  i *
                    angleStep -
                    Math.PI / 2,
                  r
                );

              return `${p.x},${p.y}`;
            }
          ).join(" ");

        return (

          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="var(--border)"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Lines */}

      {DIMENSIONS.map(
        (_, i) => {

          const p =
            point(
              i * angleStep -
                Math.PI / 2,
              radius
            );

          return (

            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="var(--border)"
              strokeWidth={0.8}
            />
          );
        }
      )}

      {/* Data */}

      <polygon
        points={polygonPoints}
        fill="rgba(99,102,241,0.18)"
        stroke="var(--accent)"
        strokeWidth={2}
      />

      {/* Labels */}

      {DIMENSIONS.map(
        (d, i) => {

          const p =
            point(
              i * angleStep -
                Math.PI / 2,
              radius + 18
            );

          return (

            <text
              key={d.key}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-muted)"
              fontSize={8}
            >

              {d.short}

            </text>
          );
        }
      )}

    </svg>
  );
}


// =========================================================
// 🔹 MINI BREAKDOWN
// =========================================================

export function MiniBreakdown({

  breakdown = {}

}) {

  return (

    <div
      style={{

        display: "flex",

        flexDirection:
          "column",

        gap: 8
      }}
    >

      {DIMENSIONS.map(
        (d) => {

          const value =
            normalizeValue(
              breakdown[d.key]
            );

          const color =
            scoreColor(
              value * 10
            );

          return (

            <div
              key={d.key}
              style={{

                display: "flex",

                alignItems:
                  "center",

                gap: 8
              }}
            >

              <span
                style={{

                  width: 110,

                  fontSize: 11,

                  color:
                    "var(--text-muted)"
                }}
              >

                {d.label}

              </span>

              <div
                style={{

                  flex: 1,

                  height: 4,

                  borderRadius: 100,

                  overflow: "hidden",

                  background:
                    "var(--bg-input)"
                }}
              >

                <div
                  style={{

                    width:
                      `${value * 10}%`,

                    height: "100%",

                    background:
                      color,

                    transition:
                      "width 0.5s ease"
                  }}
                />

              </div>

              <span
                style={{

                  width: 30,

                  textAlign:
                    "right",

                  fontSize: 11,

                  fontFamily:
                    "var(--font-mono)",

                  color
                }}
              >

                {value.toFixed(1)}

              </span>

            </div>
          );
        }
      )}

    </div>
  );
}


// =========================================================
// 🔹 MAIN COMPONENT
// =========================================================

export default function ScoreBreakdown({

  breakdown = {},

  finalScore = 0,

  showRadar = false

}) {

  if (
    !breakdown ||
    Object.keys(breakdown)
      .length === 0
  ) {

    return null;
  }

  const normalized =
    useMemo(() => {

      const obj = {};

      DIMENSIONS.forEach(
        (d) => {

          obj[d.key] =
            normalizeValue(
              breakdown[d.key]
            );
        }
      );

      return obj;

    }, [breakdown]);


  const overallColor =
    scoreColor(finalScore);

  const label =
    scoreLabel(finalScore);


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

          display: "flex",

          justifyContent:
            "space-between",

          alignItems:
            "flex-start",

          marginBottom: 24
        }}
      >

        {/* Left */}

        <div>

          <div
            style={{

              fontSize: 12,

              color:
                "var(--text-muted)",

              textTransform:
                "uppercase",

              letterSpacing:
                "0.08em",

              marginBottom: 4
            }}
          >

            Score Breakdown

          </div>

          <div
            style={{

              fontSize: 13,

              color:
                "var(--text-secondary)"
            }}
          >

            Weighted AI Evaluation

          </div>

        </div>

        {/* Right */}

        <div
          style={{
            textAlign: "right"
          }}
        >

          <div
            style={{

              fontSize: 42,

              lineHeight: 1,

              fontWeight: 700,

              color:
                overallColor,

              fontFamily:
                "var(--font-mono)"
            }}
          >

            {finalScore.toFixed(1)}

          </div>

          <div
            style={{

              fontSize: 11,

              color:
                overallColor
            }}
          >

            {label}

          </div>

        </div>

      </div>

      {/* Radar */}

      {showRadar && (

        <div
          style={{
            marginBottom: 28
          }}
        >

          <RadarBreakdown
            breakdown={normalized}
            size={220}
          />

        </div>
      )}

      {/* Rows */}

      {DIMENSIONS.map(
        (dimension, index) => (

          <DimensionRow
            key={dimension.key}
            dimension={dimension}
            value={
              normalized[
                dimension.key
              ]
            }
            index={index}
          />
        )
      )}

      {/* Formula */}

      <div
        style={{

          marginTop: 20,

          padding: 14,

          borderRadius:
            "var(--radius-md)",

          background:
            "var(--bg-input)",

          border:
            "1px solid var(--border)"
        }}
      >

        <div
          style={{

            fontSize: 10,

            color:
              "var(--text-muted)",

            fontFamily:
              "var(--font-mono)",

            lineHeight: 1.8
          }}
        >

          WeightedScore =
          0.25C +
          0.20T +
          0.20D +
          0.15E +
          0.08L +
          0.07F +
          0.05A

          <br />

          FinalScore =
          WeightedScore × 10
          + Bonus − Penalty

          <br />

          Range:
          0 → 100
          [AI-normalized]

        </div>

      </div>

    </div>
  );
}