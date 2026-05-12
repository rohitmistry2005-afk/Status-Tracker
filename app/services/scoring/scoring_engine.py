# app/services/scoring/scoring_engine.py

from typing import (
    Any,
    Dict,
    List,
    Optional,
    Tuple,
)

from app.services.scoring.weight_config import (
    get_weights,
)

# =========================================================
# 🔹 CONSTANTS
# =========================================================

MIN_SCORE = 0.0
MAX_SCORE = 10.0

BASE_SCALE = 10

DEFAULT_COMPONENTS = {

    "communication": 0,

    "technical": 0,

    "domain": 0,

    "experience": 0,

    "location": 0,

    "feedback": 0,

    "achievement": 0,
}

# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_float(
    value: Any,
    default: float = 0.0
) -> float:

    try:

        # -------------------------------------------------
        # BOOL PROTECTION
        # -------------------------------------------------

        if isinstance(
            value,
            bool
        ):

            return default

        if value is None:

            return default

        return float(value)

    except (
        TypeError,
        ValueError,
    ):

        return default


def ensure_object(
    value: Any
) -> Dict[str, Any]:

    return (

        value

        if isinstance(
            value,
            dict,
        )

        else {}
    )

# =========================================================
# 🔹 CLAMP
# =========================================================

def clamp(
    value: float,
    min_val: float = MIN_SCORE,
    max_val: float = MAX_SCORE,
) -> float:

    return max(

        min_val,

        min(
            max_val,
            value,
        ),
    )

# =========================================================
# 🔹 ROUND
# =========================================================

def round_score(
    value: float,
    precision: int = 2,
) -> float:

    return round(

        safe_float(value),

        precision,
    )

# =========================================================
# 🔹 EXTRACT NUMERIC
# =========================================================

def extract_numeric(
    value: Any,
    default: float = 0
) -> float:

    # -----------------------------------------------------
    # RAW NUMBER
    # -----------------------------------------------------

    if isinstance(
        value,
        (
            int,
            float,
        ),
    ):

        return clamp(
            safe_float(value)
        )

    # -----------------------------------------------------
    # OBJECT SUPPORT
    # -----------------------------------------------------

    if isinstance(
        value,
        dict,
    ):

        extracted = (

            value.get("score")

            or value.get("rating")

            or value.get("value")

            or default
        )

        return clamp(
            safe_float(
                extracted,
                default,
            )
        )

    # -----------------------------------------------------
    # STRING SUPPORT
    # -----------------------------------------------------

    return clamp(

        safe_float(
            value,
            default,
        )
    )

# =========================================================
# 🔹 SAFE COMPONENTS
# =========================================================

def normalize_component(
    value: Any,
    default: float = 0
) -> float:

    return round_score(

        clamp(
            extract_numeric(
                value,
                default,
            )
        )
    )

# =========================================================
# 🔹 COMPONENT EXTRACTION
# =========================================================

def extract_components(
    data: Dict[str, Any]
) -> Dict[str, float]:

    safe_data = ensure_object(
        data
    )

    # =====================================================
    # FEEDBACK ALIAS
    # =====================================================

    feedback_value = (

        safe_data.get(
            "feedback"
        )

        or safe_data.get(
            "student_feedback"
        )

        or 0
    )

    # =====================================================
    # TECH ALIAS
    # =====================================================

    technical_value = (

        safe_data.get(
            "technical"
        )

        or safe_data.get(
            "tech"
        )

        or 0
    )

    # =====================================================
    # ACHIEVEMENT ALIAS
    # =====================================================

    achievement_value = (

        safe_data.get(
            "achievement_bonus"
        )

        or safe_data.get(
            "achievement"
        )

        or safe_data.get(
            "achievements"
        )

        or 0
    )

    # =====================================================
    # EXPERIENCE ALIAS
    # =====================================================

    experience_value = (

        safe_data.get(
            "experience"
        )

        or safe_data.get(
            "experience_years"
        )

        or 0
    )

    # =====================================================
    # FINAL COMPONENTS
    # =====================================================

    components = {

        "communication":

            normalize_component(

                safe_data.get(
                    "communication",
                    0,
                )
            ),

        "technical":

            normalize_component(
                technical_value
            ),

        "domain":

            normalize_component(

                safe_data.get(
                    "domain_score",
                    0,
                )
            ),

        "experience":

            normalize_component(
                experience_value
            ),

        "location":

            normalize_component(

                safe_data.get(
                    "location",
                    0,
                )
            ),

        "feedback":

            normalize_component(
                feedback_value
            ),

        "achievement":

            normalize_component(
                achievement_value
            ),
    }

    # =====================================================
    # STRICT FALLBACKS
    # =====================================================

    for key in DEFAULT_COMPONENTS:

        value = components.get(
            key
        )

        if not isinstance(
            value,
            (
                int,
                float,
            ),
        ):

            components[key] = 0

    return components

# =========================================================
# 🔹 WEIGHTED SCORE
# =========================================================

def calculate_weighted_score(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> float:

    components = (
        extract_components(
            data
        )
    )

    weights = get_weights(
        config or {}
    )

    total_score = 0.0

    # =====================================================
    # WEIGHTED FORMULA
    # =====================================================

    for key, value in components.items():

        weight = safe_float(

            weights.get(
                key,
                0,
            )
        )

        contribution = (
            value * weight
        )

        total_score += (
            contribution
        )

    return round_score(
        total_score
    )

# =========================================================
# 🔹 BASE SCORE
# =========================================================

def convert_to_base_score(
    weighted_score: float
) -> float:

    return round_score(

        weighted_score
        * BASE_SCALE
    )

# =========================================================
# 🔹 MAIN SCORE
# =========================================================

def calculate_base_score(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> float:

    weighted_score = (

        calculate_weighted_score(

            data,

            config,
        )
    )

    base_score = (
        convert_to_base_score(
            weighted_score
        )
    )

    return round_score(

        max(
            0,
            min(
                100,
                base_score,
            )
        )
    )

# =========================================================
# 🔹 BREAKDOWN
# =========================================================

def generate_score_breakdown(
    data: Dict[str, Any]
) -> Dict[str, float]:

    components = (
        extract_components(
            data
        )
    )

    return {

        key:
            round_score(value)

        for key, value
        in components.items()
    }

# =========================================================
# 🔹 DEBUG SCORING
# =========================================================

def debug_scoring(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:

    components = (
        extract_components(
            data
        )
    )

    weights = get_weights(
        config or {}
    )

    contributions = {}

    total = 0.0

    for key, value in components.items():

        weight = safe_float(

            weights.get(
                key,
                0,
            )
        )

        contribution = (
            value * weight
        )

        contributions[key] = {

            "value":
                round_score(value),

            "weight":
                round_score(weight),

            "contribution":
                round_score(
                    contribution
                ),
        }

        total += contribution

    weighted_score = (
        round_score(total)
    )

    base_score = (
        convert_to_base_score(
            weighted_score
        )
    )

    return {

        "components":
            components,

        "weights":
            weights,

        "contributions":
            contributions,

        "weighted_score":
            weighted_score,

        "base_score":
            base_score,
    }

# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_input(
    data: Dict[str, Any]
) -> bool:

    if not isinstance(
        data,
        dict,
    ):

        return False

    required_fields = [

        "communication",

        "technical",

        "domain_score",
    ]

    for field in required_fields:

        if field not in data:

            return False

    return True

# =========================================================
# 🔹 SAFE CALCULATE
# =========================================================

def safe_calculate_score(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> Tuple[
    float,
    bool,
]:

    try:

        if not validate_input(
            data
        ):

            return 0.0, False

        score = (
            calculate_base_score(

                data,

                config,
            )
        )

        return score, True

    except Exception as e:

        print(
            f"[Scoring Engine Error] {str(e)}"
        )

        return 0.0, False

# =========================================================
# 🔹 BATCH
# =========================================================

def batch_calculate_scores(
    data_list: List[
        Dict[str, Any]
    ],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> List[float]:

    results = []

    for item in data_list:

        score, valid = (

            safe_calculate_score(

                item,

                config,
            )
        )

        results.append(

            score
            if valid
            else 0.0
        )

    return results

# =========================================================
# 🔹 CONTRIBUTORS
# =========================================================

def get_top_contributors(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> List[
    Tuple[str, float]
]:

    debug_data = (
        debug_scoring(
            data,
            config,
        )
    )

    contributions = {}

    raw = debug_data.get(
        "contributions",
        {},
    )

    for key, value in raw.items():

        if isinstance(
            value,
            dict,
        ):

            contributions[key] = (

                value.get(
                    "contribution",
                    0,
                )
            )

        else:

            contributions[key] = (
                safe_float(value)
            )

    return sorted(

        contributions.items(),

        key=lambda x: x[1],

        reverse=True,
    )

# =========================================================
# 🔹 INTERPRET SCORE
# =========================================================

def interpret_score(
    score: float
) -> str:

    if score >= 85:

        return "Excellent"

    elif score >= 70:

        return "Good"

    elif score >= 55:

        return "Average"

    return "Poor"

# =========================================================
# 🔹 SUMMARY
# =========================================================

def summarize_scoring(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:

    score = (
        calculate_base_score(
            data,
            config,
        )
    )

    interpretation = (
        interpret_score(
            score
        )
    )

    breakdown = (
        generate_score_breakdown(
            data
        )
    )

    top_contributors = (
        get_top_contributors(
            data,
            config,
        )
    )

    return {

        "score":
            score,

        "interpretation":
            interpretation,

        "breakdown":
            breakdown,

        "top_contributors":
            top_contributors[:3],
    }

# =========================================================
# 🔹 OVERRIDE WEIGHTS
# =========================================================

def calculate_score_with_override(
    data: Dict[str, Any],
    custom_weights: Dict[
        str,
        float,
    ],
) -> float:

    components = (
        extract_components(
            data
        )
    )

    total_score = 0.0

    for key, value in components.items():

        weight = safe_float(

            custom_weights.get(
                key,
                0,
            )
        )

        contribution = (
            value * weight
        )

        total_score += contribution

    weighted_score = (
        round_score(
            total_score
        )
    )

    return convert_to_base_score(
        weighted_score
    )

# =========================================================
# 🔹 WEIGHT VALIDATION
# =========================================================

def validate_weights(
    weights: Dict[
        str,
        float,
    ]
) -> bool:

    total = sum(

        safe_float(v)

        for v in weights.values()
    )

    return round(
        total,
        2,
    ) == 1.0

# =========================================================
# 🔹 REPORT
# =========================================================

def scoring_report(
    data: Dict[str, Any],
    config: Optional[
        Dict[str, Any]
    ] = None,
) -> Dict[str, Any]:

    debug = debug_scoring(
        data,
        config,
    )

    return {

        "engine":
            "weighted-rule-engine",

        "version":
            "4.0",

        "debug":
            debug,

        "summary":
            summarize_scoring(
                data,
                config,
            ),
    }

# =========================================================
# 🔹 END
# =========================================================