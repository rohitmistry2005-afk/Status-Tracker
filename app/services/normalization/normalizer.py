# app/services/normalization/normalizer.py

from typing import (
    Dict,
    Any,
    List,
    Tuple,
)

# =========================================================
# 🔹 CONSTANTS
# =========================================================

MIN_SCORE = 0.0
MAX_SCORE = 10.0

LOCATION_MAP = {

    "same": 10,

    "nearby": 7,

    "remote": 4,
}

# =========================================================
# 🔹 SAFE TYPE HELPERS
# =========================================================

def safe_float(
    value: Any,
    default: float = 0.0
) -> float:

    try:

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


def safe_str(
    value: Any
) -> str:

    if value is None:

        return ""

    return str(value).strip()


def normalize_string(
    value: Any
) -> str:

    return (
        safe_str(value)
        .lower()
    )


def safe_list(
    value: Any
) -> List[str]:

    if not isinstance(
        value,
        list,
    ):

        return []

    cleaned = []

    for item in value:

        if isinstance(
            item,
            str,
        ):

            normalized = (
                item
                .strip()
                .lower()
            )

            if normalized:

                cleaned.append(
                    normalized
                )

    return cleaned


def safe_dict(
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
# 🔹 BASIC UTILITIES
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


def round_score(
    value: float,
    precision: int = 2
) -> float:

    return round(
        value,
        precision,
    )


# =========================================================
# 🔹 CORE NUMERIC NORMALIZATION
# =========================================================

def normalize_numeric_score(
    value: Any,
    default: float = 0,
) -> float:

    numeric = safe_float(
        value,
        default,
    )

    numeric = clamp(
        numeric
    )

    return round_score(
        numeric
    )


# =========================================================
# 🔹 FIELD NORMALIZATION
# =========================================================

def normalize_communication(
    value: Any
) -> float:

    return normalize_numeric_score(
        value,
        7,
    )


def normalize_technical(
    value: Any
) -> float:

    return normalize_numeric_score(
        value,
        7,
    )


def normalize_domain_score(
    value: Any
) -> float:

    return normalize_numeric_score(
        value,
        0,
    )


def normalize_experience(
    value: Any
) -> float:

    return normalize_numeric_score(
        value,
        0,
    )


def normalize_feedback(
    value: Any
) -> float:

    return normalize_numeric_score(
        value,
        7,
    )


def normalize_location(
    value: Any
) -> float:

    # -----------------------------------------------------
    # STRING LOCATION SUPPORT
    # -----------------------------------------------------

    if isinstance(
        value,
        str,
    ):

        return LOCATION_MAP.get(

            normalize_string(
                value
            ),

            5,
        )

    return normalize_numeric_score(
        value,
        5,
    )


def normalize_relevance(
    value: Any
) -> float:

    relevance = safe_float(
        value,
        0,
    )

    relevance = max(
        0,
        min(
            1,
            relevance,
        ),
    )

    return round(
        relevance,
        2,
    )


# =========================================================
# 🔹 FLAGS
# =========================================================

def normalize_flags(
    flags: Any
) -> Dict[str, bool]:

    safe_flags = safe_dict(
        flags
    )

    return {

        "low_communication":

            bool(
                safe_flags.get(
                    "low_communication",
                    False,
                )
            ),

        "domain_mismatch":

            bool(
                safe_flags.get(
                    "domain_mismatch",
                    False,
                )
            ),
    }


# =========================================================
# 🔹 MAIN NORMALIZATION
# =========================================================

def normalize(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    safe_data = safe_dict(
        data
    )

    # =====================================================
    # FIELD EXTRACTION
    # =====================================================

    communication_raw = (

        safe_data.get(
            "communication"
        )

        or safe_data.get(
            "communication_score"
        )
    )

    technical_raw = (

        safe_data.get(
            "technical"
        )

        or safe_data.get(
            "tech"
        )
    )

    feedback_raw = (

        safe_data.get(
            "feedback"
        )

        or safe_data.get(
            "student_feedback"
        )
    )

    # =====================================================
    # NUMERIC NORMALIZATION
    # =====================================================

    communication = (
        normalize_communication(
            communication_raw
        )
    )

    technical = (
        normalize_technical(
            technical_raw
        )
    )

    domain_score = (
        normalize_domain_score(

            safe_data.get(
                "domain_score"
            )
        )
    )

    experience = (
        normalize_experience(

            safe_data.get(
                "experience"
            )
        )
    )

    feedback = (
        normalize_feedback(
            feedback_raw
        )
    )

    location = (
        normalize_location(

            safe_data.get(
                "location"
            )
        )
    )

    relevance = (
        normalize_relevance(

            safe_data.get(
                "skill_relevance"
            )
        )
    )

    # =====================================================
    # SAFE COLLECTIONS
    # =====================================================

    skills = safe_list(

        safe_data.get(
            "skills"
        )
    )

    required_skills = safe_list(

        safe_data.get(
            "required_skills"
        )
    )

    flags = normalize_flags(

        safe_data.get(
            "flags"
        )
    )

    # =====================================================
    # ACHIEVEMENTS
    # =====================================================

    achievement_bonus = (
        normalize_numeric_score(

            safe_data.get(
                "achievement_bonus"
            ),

            0,
        )
    )

    # =====================================================
    # FINAL NORMALIZED CONTRACT
    # =====================================================

    normalized = {

        "teacher_id":

            safe_str(
                safe_data.get(
                    "teacher_id"
                )
            ),

        "name":

            safe_str(
                safe_data.get(
                    "name"
                )
            ),

        # -------------------------------------------------
        # CORE NUMERIC VALUES
        # -------------------------------------------------

        "communication":
            communication,

        "technical":
            technical,

        "domain_score":
            domain_score,

        "experience":
            experience,

        "feedback":
            feedback,

        "location":
            location,

        # -------------------------------------------------
        # DOMAIN
        # -------------------------------------------------

        "skill_relevance":
            relevance,

        # -------------------------------------------------
        # SKILLS
        # -------------------------------------------------

        "skills":
            skills,

        "required_skills":
            required_skills,

        # -------------------------------------------------
        # FLAGS
        # -------------------------------------------------

        "flags":
            flags,

        # -------------------------------------------------
        # BONUS
        # -------------------------------------------------

        "achievement_bonus":
            achievement_bonus,
    }

    return normalized


# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_normalized(
    data: Dict[str, Any]
) -> bool:

    required_numeric_fields = [

        "communication",

        "technical",

        "domain_score",

        "experience",

        "feedback",

        "location",
    ]

    for field in required_numeric_fields:

        if field not in data:

            return False

        if not isinstance(

            data[field],

            (
                int,
                float,
            ),
        ):

            return False

    return True


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_normalize(
    data: Dict[str, Any]
) -> Tuple[
    Dict[str, Any],
    bool,
]:

    try:

        normalized = normalize(
            data
        )

        valid = validate_normalized(
            normalized
        )

        return normalized, valid

    except Exception as e:

        print(
            f"[Normalizer Error] {str(e)}"
        )

        return {}, False


# =========================================================
# 🔹 BATCH NORMALIZATION
# =========================================================

def normalize_batch(
    data_list: List[
        Dict[str, Any]
    ]
) -> List[
    Dict[str, Any]
]:

    results = []

    for item in data_list:

        normalized, valid = (
            safe_normalize(
                item
            )
        )

        if valid:

            results.append(
                normalized
            )

    return results


# =========================================================
# 🔹 DEBUG
# =========================================================

def debug_normalization(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    normalized, valid = (
        safe_normalize(
            data
        )
    )

    return {

        "input":
            data,

        "normalized":
            normalized,

        "valid":
            valid,
    }


# =========================================================
# 🔹 SUMMARY
# =========================================================

def summarize_scores(
    data: Dict[str, Any]
) -> Dict[str, float]:

    safe_data = safe_dict(
        data
    )

    return {

        "communication":

            normalize_numeric_score(

                safe_data.get(
                    "communication"
                )
            ),

        "technical":

            normalize_numeric_score(

                safe_data.get(
                    "technical"
                )
            ),

        "domain":

            normalize_numeric_score(

                safe_data.get(
                    "domain_score"
                )
            ),

        "experience":

            normalize_numeric_score(

                safe_data.get(
                    "experience"
                )
            ),

        "feedback":

            normalize_numeric_score(

                safe_data.get(
                    "feedback"
                )
            ),

        "location":

            normalize_numeric_score(

                safe_data.get(
                    "location"
                )
            ),
    }


# =========================================================
# 🔹 END
# =========================================================