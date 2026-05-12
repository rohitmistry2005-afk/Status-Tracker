# app/services/mappers/input_mapper.py

from typing import (
    Dict,
    Any,
    List,
    Optional,
)

from copy import deepcopy

# =========================================================
# 🔹 CONSTANTS
# =========================================================

DEFAULT_REQUIRED_SKILLS = {

    "Computer Science": [
        "python",
        "dsa",
        "algorithms",
    ],

    "Data Science": [
        "python",
        "ml",
        "pandas",
    ],

    "Artificial Intelligence": [
        "ml",
        "deep learning",
    ],

    "Software Development": [
        "java",
        "web dev",
    ],

    "Information Technology": [
        "networking",
        "cloud",
    ],

    "Mechanical": [
        "thermodynamics",
    ],

    "Electrical Engineering": [
        "power systems",
    ],

    "Civil Engineering": [
        "construction",
    ],

    "Business Analytics": [
        "excel",
        "sql",
    ],

    "Operations": [
        "supply chain",
    ],
}

LOCATION_SCORES = {

    "same": 10,

    "nearby": 7,

    "remote": 4,
}

# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def to_float(
    value: Any,
    default: float = 0.0
) -> float:

    try:

        if value is None:

            return default

        return float(value)

    except (
        TypeError,
        ValueError,
    ):

        return default


def to_str(
    value: Any
) -> str:

    if value is None:

        return ""

    return str(value).strip()


def normalize_string(
    value: Any
) -> str:

    return (
        to_str(value)
        .strip()
        .lower()
    )


def to_list(
    value: Any
) -> List[str]:

    if not isinstance(
        value,
        list,
    ):

        return []

    cleaned = []

    for item in value:

        normalized = normalize_string(
            item
        )

        if normalized:

            cleaned.append(
                normalized
            )

    return cleaned


def safe_get(
    data: Dict[str, Any],
    path: List[str],
    default: Any = None,
) -> Any:

    temp = data

    for key in path:

        if (
            isinstance(temp, dict)
            and key in temp
        ):

            temp = temp[key]

        else:

            return default

    return temp


# =========================================================
# 🔹 NUMERIC SAFETY
# =========================================================

def clamp(
    value: float,
    min_val: float = 0,
    max_val: float = 10,
) -> float:

    return max(
        min_val,
        min(
            max_val,
            value,
        ),
    )


def normalize_score_10(
    value: Any
) -> float:

    return round(

        clamp(
            to_float(value)
        ),

        2,
    )


def normalize_percentage(
    value: Any
) -> float:

    numeric = to_float(value)

    # -----------------------------------------------------
    # HANDLE 0–100 SCALE
    # -----------------------------------------------------

    if numeric > 10:

        numeric = numeric / 10

    return round(

        clamp(numeric),

        2,
    )


def cap_experience(
    years: Any
) -> float:

    numeric = to_float(years)

    # -----------------------------------------------------
    # EXPERIENCE MAPPING
    # -----------------------------------------------------

    # 0 years -> 0
    # 1 year  -> 3.33
    # 2 years -> 6.66
    # 3+      -> 10

    capped = min(
        numeric,
        3,
    )

    return round(
        (capped / 3) * 10,
        2,
    )


# =========================================================
# 🔹 LOCATION MAPPING
# =========================================================

def map_location(
    value: Any
) -> float:

    normalized = normalize_string(
        value
    )

    return LOCATION_SCORES.get(
        normalized,
        5,
    )


# =========================================================
# 🔹 REQUIRED SKILLS
# =========================================================

def extract_required_skills(
    domain: str
) -> List[str]:

    return DEFAULT_REQUIRED_SKILLS.get(
        domain,
        [],
    )


# =========================================================
# 🔹 ACHIEVEMENT BONUS
# =========================================================

def compute_achievement_bonus(
    achievement_count: Any
) -> float:

    count = to_float(
        achievement_count
    )

    if count >= 5:

        return 5

    elif count >= 3:

        return 3

    elif count >= 1:

        return 1

    return 0


# =========================================================
# 🔹 SKILL RELEVANCE
# =========================================================

def calculate_skill_relevance(
    skills: List[str],
    required_skills: List[str],
) -> float:

    if not required_skills:

        return 0.0

    matched = len(
        set(skills)
        &
        set(required_skills)
    )

    relevance = (
        matched
        / len(required_skills)
    )

    return round(
        relevance,
        2,
    )


# =========================================================
# 🔹 MAIN INPUT MAPPING
# =========================================================

def map_input(
    raw: Dict[str, Any]
) -> Dict[str, Any]:

    data = deepcopy(raw)

    # =====================================================
    # BASIC FIELDS
    # =====================================================

    teacher_id = to_str(
        data.get(
            "teacher_id"
        )
    )

    name = to_str(
        data.get(
            "name"
        )
    )

    location_raw = data.get(
        "location",
        "same",
    )

    # =====================================================
    # DOMAIN
    # =====================================================

    domain = normalize_string(

        safe_get(
            data,
            [
                "education",
                "domain",
            ],
            "",
        )
    )

    required_skills = (
        extract_required_skills(
            domain
        )
    )

    # =====================================================
    # COMMUNICATION
    # =====================================================

    communication_raw = (

        safe_get(
            data,
            [
                "communication",
                "score",
            ],
        )

        or data.get(
            "communication"
        )
    )

    communication = (
        normalize_score_10(
            communication_raw
        )
    )

    # =====================================================
    # TECHNICAL
    # =====================================================

    technical_raw = (

        safe_get(
            data,
            [
                "tech",
                "score",
            ],
        )

        or safe_get(
            data,
            [
                "technical",
                "score",
            ],
        )

        or data.get(
            "technical"
        )
    )

    technical = (
        normalize_score_10(
            technical_raw
        )
    )

    # =====================================================
    # FEEDBACK
    # =====================================================

    feedback_raw = (

        safe_get(
            data,
            [
                "student_feedback",
                "rating",
            ],
        )

        or safe_get(
            data,
            [
                "feedback",
                "rating",
            ],
        )

        or data.get(
            "feedback"
        )
    )

    feedback = (
        normalize_score_10(
            feedback_raw
        )
    )

    # =====================================================
    # EXPERIENCE
    # =====================================================

    experience_years = (
        to_float(
            data.get(
                "experience_years",
                0,
            )
        )
    )

    experience = (
        cap_experience(
            experience_years
        )
    )

    # =====================================================
    # CERTIFICATION / DOMAIN
    # =====================================================

    certificate_score = (

        safe_get(
            data,
            [
                "certificate",
                "score",
            ],
            0,
        )
    )

    domain_score = (
        normalize_percentage(
            certificate_score
        )
    )

    # =====================================================
    # SKILLS
    # =====================================================

    skills = to_list(

        data.get(
            "skills"
        )

        or safe_get(
            data,
            [
                "tech",
                "skills",
            ],
            [],
        )
    )

    # =====================================================
    # LOCATION
    # =====================================================

    location_score = (
        map_location(
            location_raw
        )
    )

    # =====================================================
    # RELEVANCE
    # =====================================================

    relevance = (
        calculate_skill_relevance(

            skills,

            required_skills,
        )
    )

    # =====================================================
    # ACHIEVEMENTS
    # =====================================================

    achievement_bonus = (
        compute_achievement_bonus(

            data.get(
                "achievements",
                0,
            )
        )
    )

    # =====================================================
    # FLAGS
    # =====================================================

    skip_flags = (

        data.get(
            "skip_flags",
            {}
        )

        or {}
    )

    flags = {

        "low_communication":

            bool(
                skip_flags.get(
                    "low_communication",
                    False,
                )
            ),

        "domain_mismatch":

            bool(
                skip_flags.get(
                    "domain_mismatch",
                    False,
                )
            ),
    }

    # =====================================================
    # FINAL MAPPED CONTRACT
    # =====================================================

    return {

        "teacher_id":
            teacher_id,

        "name":
            name,

        # -------------------------------------------------
        # CORE NUMERIC CONTRACTS
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
            location_score,

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
        # ACHIEVEMENTS
        # -------------------------------------------------

        "achievement_bonus":
            achievement_bonus,

        # -------------------------------------------------
        # FLAGS
        # -------------------------------------------------

        "flags":
            flags,
    }


# =========================================================
# 🔹 BATCH
# =========================================================

def map_batch(
    data_list: List[
        Dict[str, Any]
    ]
) -> List[
    Dict[str, Any]
]:

    results = []

    for item in data_list:

        mapped = safe_map(
            item
        )

        if mapped:

            results.append(
                mapped
            )

    return results


# =========================================================
# 🔹 DEBUG
# =========================================================

def debug_mapping(
    raw: Dict[str, Any]
) -> Dict[str, Any]:

    return {

        "raw":
            raw,

        "mapped":
            map_input(raw),
    }


# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_mapped(
    mapped: Dict[str, Any]
) -> bool:

    required_keys = [

        "communication",

        "technical",

        "domain_score",

        "experience",

        "feedback",

        "location",
    ]

    for key in required_keys:

        if key not in mapped:

            return False

        if not isinstance(
            mapped[key],
            (int, float),
        ):

            return False

    return True


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_map(
    raw: Dict[str, Any]
) -> Optional[
    Dict[str, Any]
]:

    try:

        mapped = map_input(
            raw
        )

        if validate_mapped(
            mapped
        ):

            return mapped

        return None

    except Exception as e:

        print(
            f"[Mapper Error] {str(e)}"
        )

        return None


# =========================================================
# 🔹 END
# =========================================================