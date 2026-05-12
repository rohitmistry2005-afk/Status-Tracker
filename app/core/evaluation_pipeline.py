# app/core/evaluation_pipeline.py

from typing import (
    Any,
    Dict,
    List,
    Tuple,
)

# =========================================================
# 🔹 SERVICE IMPORTS
# =========================================================

from app.services.mappers.input_mapper import (
    map_input,
)

from app.services.normalization.normalizer import (
    normalize,
    safe_normalize,
)

from app.services.domain.knowledge_scorer import (
    calculate_knowledge,
)

from app.services.domain.relevance_scorer import (
    calculate_relevance,
)

from app.services.domain.domain_combiner import (
    combine_domain,
)

from app.services.scoring.scoring_engine import (
    calculate_base_score,
)

from app.services.rules.rule_engine import (
    apply_rules,
)

from app.services.decision.decision_engine import (
    get_decision,
)

from app.services.insights.insights_generator import (
    generate_insights,
)

# =========================================================
# 🔹 CONSTANTS
# =========================================================

PIPELINE_VERSION = "4.0"

PIPELINE_NAME = (
    "Teacher Evaluation AI Pipeline"
)

# =========================================================
# 🔹 HELPERS
# =========================================================

def round_score(
    value: Any
) -> float:

    try:

        return round(
            float(value),
            2
        )

    except Exception:

        return 0.0


def safe_value(
    value: Any,
    default: float = 0.0
) -> float:

    try:

        return float(value)

    except Exception:

        return default


def ensure_object(
    value: Any
) -> Dict[str, Any]:

    return (
        value
        if isinstance(value, dict)
        else {}
    )


def ensure_list(
    value: Any
) -> List[Any]:

    return (
        value
        if isinstance(value, list)
        else []
    )


def ensure_numeric(
    value: Any,
    default: float = 0
) -> float:

    if isinstance(
        value,
        bool
    ):

        return default

    if isinstance(
        value,
        (int, float)
    ):

        return float(value)

    return default


# =========================================================
# 🔹 SAFE NORMALIZED DEFAULTS
# =========================================================

def stabilize_normalized_data(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    safe = ensure_object(data)

    # -----------------------------------------------------
    # STRICT NUMERIC CONTRACTS
    # -----------------------------------------------------

    safe["communication"] = ensure_numeric(
        safe.get("communication"),
        7,
    )

    safe["technical"] = ensure_numeric(
        safe.get("technical"),
        7,
    )

    safe["domain_score"] = ensure_numeric(
        safe.get("domain_score"),
        0,
    )

    safe["experience"] = ensure_numeric(
        safe.get("experience"),
        0,
    )

    safe["feedback"] = ensure_numeric(
        safe.get("feedback"),
        7,
    )

    safe["location"] = ensure_numeric(
        safe.get("location"),
        5,
    )

    safe["achievement_bonus"] = ensure_numeric(
        safe.get("achievement_bonus"),
        0,
    )

    # -----------------------------------------------------
    # SAFE LISTS
    # -----------------------------------------------------

    safe["skills"] = ensure_list(
        safe.get("skills")
    )

    safe["required_skills"] = ensure_list(
        safe.get("required_skills")
    )

    # -----------------------------------------------------
    # SAFE FLAGS
    # -----------------------------------------------------

    if not isinstance(
        safe.get("flags"),
        dict,
    ):

        safe["flags"] = {}

    return safe


# =========================================================
# 🔹 SCORE BREAKDOWN
# =========================================================

def build_score_breakdown(
    normalized_data: Dict[str, Any],
    domain_score: float,
) -> Dict[str, float]:

    return {

        "communication":
            round_score(
                normalized_data.get(
                    "communication",
                    0,
                )
            ),

        "technical":
            round_score(
                normalized_data.get(
                    "technical",
                    0,
                )
            ),

        "domain":
            round_score(
                domain_score
            ),

        "experience":
            round_score(
                normalized_data.get(
                    "experience",
                    0,
                )
            ),

        "location":
            round_score(
                normalized_data.get(
                    "location",
                    0,
                )
            ),

        "feedback":
            round_score(
                normalized_data.get(
                    "feedback",
                    0,
                )
            ),

        "achievement":
            round_score(
                normalized_data.get(
                    "achievement_bonus",
                    0,
                )
            ),
    }


# =========================================================
# 🔹 DOMAIN BREAKDOWN
# =========================================================

def build_domain_breakdown(
    knowledge_score: float,
    relevance_score: float,
    domain_score: float,
) -> Dict[str, float]:

    return {

        "knowledge":
            round_score(
                knowledge_score
            ),

        "relevance":
            round_score(
                relevance_score
            ),

        "final":
            round_score(
                domain_score
            ),
    }


# =========================================================
# 🔹 EVALUATE SINGLE
# =========================================================

def evaluate_candidate(
    raw_data: Dict[str, Any]
) -> Dict[str, Any]:

    # =====================================================
    # STEP 1 → INPUT MAPPING
    # =====================================================

    mapped_data = map_input(
        raw_data
    )

    mapped_data = ensure_object(
        mapped_data
    )

    # =====================================================
    # STEP 2 → NORMALIZATION
    # =====================================================

    try:

        normalized_data = normalize(
            mapped_data
        )

    except Exception:

        normalized_data, valid = (
            safe_normalize(
                mapped_data
            )
        )

        if not valid:

            normalized_data = {}

    normalized_data = stabilize_normalized_data(
        normalized_data
    )

    # =====================================================
    # DEBUG TRACE
    # =====================================================

    print(
        "[PIPELINE NORMALIZED]",
        normalized_data
    )

    # =====================================================
    # STEP 3 → DOMAIN ANALYSIS
    # =====================================================

    knowledge_score = (
        calculate_knowledge(
            normalized_data
        )
    )

    relevance_score = (
        calculate_relevance(
            normalized_data
        )
    )

    domain_input = {

        "knowledge_score":
            knowledge_score,

        "skill_relevance":
            relevance_score,
    }

    domain_score = combine_domain(
        domain_input
    )

    normalized_data[
        "domain_score"
    ] = domain_score

    # =====================================================
    # STEP 4 → BASE SCORE
    # =====================================================

    base_score = (
        calculate_base_score(
            normalized_data
        )
    )

    # =====================================================
    # STEP 5 → RULE ENGINE
    # =====================================================

    final_score, adjustments = (
        apply_rules(

            base_score,

            normalized_data,

            relevance_score,
        )
    )

    final_score = round_score(
        final_score
    )

    adjustments = ensure_object(
        adjustments
    )

    adjustments.setdefault(
        "bonus",
        0,
    )

    adjustments.setdefault(
        "penalty",
        0,
    )

    adjustments.setdefault(
        "total_adjustment",
        0,
    )

    # =====================================================
    # STEP 6 → DECISION
    # =====================================================

    status = get_decision(

        final_score,

        normalized_data,
    )

    # =====================================================
    # STEP 7 → INSIGHTS
    # =====================================================

    try:

        insights = generate_insights(

            normalized_data,

            final_score,
        )

    except Exception:

        insights = {

            "summary":
                "Insight generation failed.",

            "strengths": [],

            "weaknesses": [],

            "recommendations": [],

            "flags": [],
        }

    insights = ensure_object(
        insights
    )

    insights.setdefault(
        "summary",
        "",
    )

    insights.setdefault(
        "strengths",
        [],
    )

    insights.setdefault(
        "weaknesses",
        [],
    )

    insights.setdefault(
        "recommendations",
        [],
    )

    insights.setdefault(
        "flags",
        [],
    )

    # =====================================================
    # STEP 8 → SCORE BREAKDOWN
    # =====================================================

    score_breakdown = (
        build_score_breakdown(

            normalized_data,

            domain_score,
        )
    )

    # =====================================================
    # STEP 9 → DOMAIN BREAKDOWN
    # =====================================================

    domain_breakdown = (
        build_domain_breakdown(

            knowledge_score,

            relevance_score,

            domain_score,
        )
    )

    # =====================================================
    # STEP 10 → FINAL RESPONSE
    # =====================================================

    final_response = {

        "teacher_id":

            mapped_data.get(
                "teacher_id",
                "",
            ),

        "name":

            mapped_data.get(
                "name",
                "",
            ),

        "final_score":
            final_score,

        "status":
            status,

        "score_breakdown":
            score_breakdown,

        "domain_breakdown":
            domain_breakdown,

        "adjustments":
            adjustments,

        "insights":
            insights,

        "metadata": {

            "pipeline":
                PIPELINE_NAME,

            "version":
                PIPELINE_VERSION,

            "explainable":
                True,

            "normalized":
                True,
        },
    }

    return final_response


# =========================================================
# 🔹 SAFE EVALUATION
# =========================================================

def safe_evaluate_candidate(
    raw_data: Dict[str, Any]
) -> Tuple[
    Dict[str, Any],
    bool,
]:

    try:

        result = (
            evaluate_candidate(
                raw_data
            )
        )

        return result, True

    except Exception as e:

        print(
            f"[Pipeline Error] {str(e)}"
        )

        return {

            "error":
                str(e),

            "final_score":
                0,

            "status":
                "REJECTED",
        }, False


# =========================================================
# 🔹 BATCH EVALUATION
# =========================================================

def evaluate_batch(
    data_list: List[
        Dict[str, Any]
    ]
) -> List[
    Dict[str, Any]
]:

    results = []

    safe_batch = ensure_list(
        data_list
    )

    for candidate_data in safe_batch:

        result, valid = (
            safe_evaluate_candidate(
                candidate_data
            )
        )

        if valid:

            results.append(
                result
            )

        else:

            results.append({

                "teacher_id":

                    candidate_data.get(
                        "teacher_id",
                        "UNKNOWN",
                    ),

                "name":

                    candidate_data.get(
                        "name",
                        "UNKNOWN",
                    ),

                "final_score":
                    0,

                "status":
                    "REJECTED",

                "score_breakdown":
                    {},

                "adjustments":
                    {},

                "insights":
                    {},

                "error":

                    result.get(
                        "error",
                        "Evaluation failed",
                    ),
            })

    return results


# =========================================================
# 🔹 DEBUG PIPELINE
# =========================================================

def debug_pipeline(
    raw_data: Dict[str, Any]
) -> Dict[str, Any]:

    mapped_data = map_input(
        raw_data
    )

    mapped_data = ensure_object(
        mapped_data
    )

    normalized_data = normalize(
        mapped_data
    )

    normalized_data = stabilize_normalized_data(
        normalized_data
    )

    knowledge_score = (
        calculate_knowledge(
            normalized_data
        )
    )

    relevance_score = (
        calculate_relevance(
            normalized_data
        )
    )

    domain_score = combine_domain({

        "knowledge_score":
            knowledge_score,

        "skill_relevance":
            relevance_score,
    })

    normalized_data[
        "domain_score"
    ] = domain_score

    base_score = (
        calculate_base_score(
            normalized_data
        )
    )

    final_score, adjustments = (
        apply_rules(

            base_score,

            normalized_data,

            relevance_score,
        )
    )

    status = get_decision(
        final_score,
        normalized_data,
    )

    insights = generate_insights(
        normalized_data,
        final_score,
    )

    return {

        "mapped":
            mapped_data,

        "normalized":
            normalized_data,

        "domain_analysis": {

            "knowledge_score":
                round_score(
                    knowledge_score
                ),

            "relevance_score":
                round_score(
                    relevance_score
                ),

            "combined_domain_score":
                round_score(
                    domain_score
                ),
        },

        "base_score":
            round_score(
                base_score
            ),

        "rule_engine": {

            "final_score":
                round_score(
                    final_score
                ),

            "adjustments":
                adjustments,
        },

        "decision":
            status,

        "insights":
            insights,
    }


# =========================================================
# 🔹 MINIMAL EVALUATION
# =========================================================

def evaluate_minimal(
    raw_data: Dict[str, Any]
) -> Dict[str, Any]:

    result = evaluate_candidate(
        raw_data
    )

    return {

        "final_score":

            result.get(
                "final_score",
                0,
            ),

        "status":

            result.get(
                "status",
                "REVIEW",
            ),
    }


# =========================================================
# 🔹 BATCH SUMMARY
# =========================================================

def summarize_batch(
    results: List[
        Dict[str, Any]
    ]
) -> Dict[str, Any]:

    total = len(results)

    selected = 0
    strong = 0
    review = 0
    rejected = 0

    total_score = 0

    for result in results:

        status = result.get(
            "status"
        )

        total_score += safe_value(

            result.get(
                "final_score",
                0,
            )
        )

        if status == "SELECTED":

            selected += 1

        elif status == "STRONG":

            strong += 1

        elif status == "REVIEW":

            review += 1

        elif status == "REJECTED":

            rejected += 1

    average_score = (

        round_score(
            total_score / total
        )

        if total > 0

        else 0
    )

    return {

        "total_candidates":
            total,

        "selected":
            selected,

        "strong":
            strong,

        "review":
            review,

        "rejected":
            rejected,

        "average_score":
            average_score,
    }

# =========================================================
# 🔹 END
# =========================================================