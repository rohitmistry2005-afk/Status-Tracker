# app/services/insights/insights_generator.py

from typing import (
    Any,
    Dict,
    List,
)

# =========================================================
# 🔹 THRESHOLDS
# =========================================================

HIGH_THRESHOLD = 8.0

MID_THRESHOLD = 5.0

LOW_THRESHOLD = 3.0

EXCELLENT_SCORE = 85

GOOD_SCORE = 70

AVERAGE_SCORE = 55


# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_float(
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


# =========================================================
# 🔹 EXTRACT NUMERIC
# =========================================================

def extract_numeric(
    value: Any,
    default: float = 0
) -> float:

    # -----------------------------------------------------
    # NUMBER
    # -----------------------------------------------------

    if isinstance(
        value,
        (int, float),
    ):

        return safe_float(value)

    # -----------------------------------------------------
    # OBJECT
    # -----------------------------------------------------

    if isinstance(
        value,
        dict,
    ):

        return safe_float(

            value.get("score")

            or value.get("rating")

            or value.get("value")

            or default
        )

    # -----------------------------------------------------
    # STRING
    # -----------------------------------------------------

    return safe_float(
        value,
        default,
    )


# =========================================================
# 🔹 NORMALIZE INPUT
# =========================================================

def normalize_input(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    safe = ensure_object(
        data
    )

    # IMPORTANT FIX
    # feedback vs student_feedback

    feedback_value = (

        safe.get("feedback")

        or safe.get(
            "student_feedback"
        )

        or 0
    )

    return {

        "communication":
            extract_numeric(

                safe.get(
                    "communication"
                )
            ),

        "technical":
            extract_numeric(

                safe.get(
                    "technical",

                    safe.get(
                        "tech"
                    ),
                )
            ),

        "domain_score":
            extract_numeric(

                safe.get(
                    "domain_score"
                )
            ),

        "experience":
            extract_numeric(

                safe.get(
                    "experience",

                    safe.get(
                        "experience_years"
                    ),
                )
            ),

        "feedback":
            extract_numeric(
                feedback_value
            ),

        "location":
            extract_numeric(

                safe.get(
                    "location"
                )
            ),

        "achievement":
            extract_numeric(

                safe.get(
                    "achievement",

                    safe.get(
                        "achievements"
                    ),
                )
            ),

        "skill_relevance":
            extract_numeric(

                safe.get(
                    "skill_relevance"
                )
            ),

        "flags":
            ensure_object(

                safe.get(
                    "flags"
                )
            ),

        "skills":
            ensure_list(

                safe.get(
                    "skills"
                )
            ),

        "required_skills":
            ensure_list(

                safe.get(
                    "required_skills"
                )
            ),
    }


# =========================================================
# 🔹 STRENGTHS
# =========================================================

def detect_strengths(
    data: Dict[str, Any]
) -> List[str]:

    strengths = []

    safe = normalize_input(
        data
    )

    # -----------------------------------------------------
    # COMMUNICATION
    # -----------------------------------------------------

    if safe[
        "communication"
    ] >= HIGH_THRESHOLD:

        strengths.append(
            "Excellent communication skills"
        )

    # -----------------------------------------------------
    # TECHNICAL
    # -----------------------------------------------------

    if safe[
        "technical"
    ] >= HIGH_THRESHOLD:

        strengths.append(
            "Strong technical expertise"
        )

    # -----------------------------------------------------
    # DOMAIN
    # -----------------------------------------------------

    if safe[
        "domain_score"
    ] >= HIGH_THRESHOLD:

        strengths.append(
            "Deep domain knowledge"
        )

    # -----------------------------------------------------
    # EXPERIENCE
    # -----------------------------------------------------

    if safe[
        "experience"
    ] >= HIGH_THRESHOLD:

        strengths.append(
            "Highly experienced candidate"
        )

    # -----------------------------------------------------
    # FEEDBACK
    # -----------------------------------------------------

    if safe[
        "feedback"
    ] >= HIGH_THRESHOLD:

        strengths.append(
            "Outstanding student feedback"
        )

    # -----------------------------------------------------
    # LOCATION
    # -----------------------------------------------------

    if safe[
        "location"
    ] >= HIGH_THRESHOLD:

        strengths.append(
            "Strong location compatibility"
        )

    # -----------------------------------------------------
    # SKILL RELEVANCE
    # -----------------------------------------------------

    if safe[
        "skill_relevance"
    ] >= 0.8:

        strengths.append(
            "High relevance to required skills"
        )

    # -----------------------------------------------------
    # ACHIEVEMENTS
    # -----------------------------------------------------

    if safe[
        "achievement"
    ] >= MID_THRESHOLD:

        strengths.append(
            "Strong achievements profile"
        )

    # -----------------------------------------------------
    # SKILLS MATCH
    # -----------------------------------------------------

    skills = set(

        map(
            str.lower,
            safe["skills"],
        )
    )

    required = set(

        map(
            str.lower,
            safe["required_skills"],
        )
    )

    matched = skills.intersection(
        required
    )

    if (

        len(required) > 0 and

        len(matched) == len(required)
    ):

        strengths.append(
            "Complete required skill alignment"
        )

    return strengths


# =========================================================
# 🔹 WEAKNESSES
# =========================================================

def detect_weaknesses(
    data: Dict[str, Any]
) -> List[str]:

    weaknesses = []

    safe = normalize_input(
        data
    )

    # -----------------------------------------------------
    # COMMUNICATION
    # -----------------------------------------------------

    if safe[
        "communication"
    ] < MID_THRESHOLD:

        weaknesses.append(
            "Communication skills need improvement"
        )

    # -----------------------------------------------------
    # TECHNICAL
    # -----------------------------------------------------

    if safe[
        "technical"
    ] < MID_THRESHOLD:

        weaknesses.append(
            "Technical expertise is below expectations"
        )

    # -----------------------------------------------------
    # DOMAIN
    # -----------------------------------------------------

    if safe[
        "domain_score"
    ] < MID_THRESHOLD:

        weaknesses.append(
            "Limited domain understanding"
        )

    # -----------------------------------------------------
    # EXPERIENCE
    # -----------------------------------------------------

    if safe[
        "experience"
    ] < MID_THRESHOLD:

        weaknesses.append(
            "Low practical experience"
        )

    # -----------------------------------------------------
    # FEEDBACK
    # -----------------------------------------------------

    if safe[
        "feedback"
    ] < MID_THRESHOLD:

        weaknesses.append(
            "Student feedback score is low"
        )

    # -----------------------------------------------------
    # SKILL RELEVANCE
    # -----------------------------------------------------

    if safe[
        "skill_relevance"
    ] < 0.5:

        weaknesses.append(
            "Skill relevance does not match job requirements"
        )

    # -----------------------------------------------------
    # ACHIEVEMENT
    # -----------------------------------------------------

    if safe[
        "achievement"
    ] < LOW_THRESHOLD:

        weaknesses.append(
            "Limited achievement profile"
        )

    return weaknesses


# =========================================================
# 🔹 RECOMMENDATIONS
# =========================================================

def generate_recommendations(
    data: Dict[str, Any]
) -> List[str]:

    recommendations = []

    safe = normalize_input(
        data
    )

    # -----------------------------------------------------
    # COMMUNICATION
    # -----------------------------------------------------

    if safe[
        "communication"
    ] < MID_THRESHOLD:

        recommendations.append(
            "Improve communication through workshops and presentations"
        )

    # -----------------------------------------------------
    # TECHNICAL
    # -----------------------------------------------------

    if safe[
        "technical"
    ] < MID_THRESHOLD:

        recommendations.append(
            "Enhance technical skills through practical projects"
        )

    # -----------------------------------------------------
    # DOMAIN
    # -----------------------------------------------------

    if safe[
        "domain_score"
    ] < MID_THRESHOLD:

        recommendations.append(
            "Strengthen domain-specific knowledge"
        )

    # -----------------------------------------------------
    # EXPERIENCE
    # -----------------------------------------------------

    if safe[
        "experience"
    ] < MID_THRESHOLD:

        recommendations.append(
            "Gain additional teaching or industry experience"
        )

    # -----------------------------------------------------
    # FEEDBACK
    # -----------------------------------------------------

    if safe[
        "feedback"
    ] < MID_THRESHOLD:

        recommendations.append(
            "Improve classroom engagement and teaching effectiveness"
        )

    # -----------------------------------------------------
    # SKILL RELEVANCE
    # -----------------------------------------------------

    if safe[
        "skill_relevance"
    ] < 0.5:

        recommendations.append(
            "Align technical skills with job requirements"
        )

    # -----------------------------------------------------
    # ACHIEVEMENTS
    # -----------------------------------------------------

    if safe[
        "achievement"
    ] < LOW_THRESHOLD:

        recommendations.append(
            "Build a stronger achievement and certification profile"
        )

    # -----------------------------------------------------
    # GENERIC
    # -----------------------------------------------------

    if len(
        recommendations
    ) == 0:

        recommendations.append(
            "Candidate profile is well-balanced"
        )

    return recommendations


# =========================================================
# 🔹 PERFORMANCE SUMMARY
# =========================================================

def generate_performance_summary(
    score: float
) -> str:

    if score >= EXCELLENT_SCORE:

        return (
            "Excellent candidate with strong overall performance"
        )

    elif score >= GOOD_SCORE:

        return (
            "Strong candidate suitable for recruitment consideration"
        )

    elif score >= AVERAGE_SCORE:

        return (
            "Average candidate requiring manual review"
        )

    return (
        "Candidate does not meet recruitment standards"
    )


# =========================================================
# 🔹 FLAGS
# =========================================================

def generate_flag_insights(
    flags: Dict[str, bool]
) -> List[str]:

    insights = []

    safe_flags = ensure_object(
        flags
    )

    if safe_flags.get(
        "domain_mismatch"
    ):

        insights.append(
            "Domain mismatch detected"
        )

    if safe_flags.get(
        "low_communication"
    ):

        insights.append(
            "Communication flagged below threshold"
        )

    if safe_flags.get(
        "insufficient_experience"
    ):

        insights.append(
            "Experience below recommended level"
        )

    if safe_flags.get(
        "skill_gap"
    ):

        insights.append(
            "Critical skill gap detected"
        )

    return insights


# =========================================================
# 🔹 MAIN GENERATOR
# =========================================================

def generate_insights(
    data: Dict[str, Any],
    final_score: float
) -> Dict[str, Any]:

    safe_data = normalize_input(
        data
    )

    strengths = (
        detect_strengths(
            safe_data
        )
    )

    weaknesses = (
        detect_weaknesses(
            safe_data
        )
    )

    recommendations = (
        generate_recommendations(
            safe_data
        )
    )

    flags = (
        generate_flag_insights(

            safe_data.get(
                "flags",
                {},
            )
        )
    )

    summary = (
        generate_performance_summary(
            final_score
        )
    )

    return {

        "summary":
            summary,

        "strengths":
            strengths,

        "weaknesses":
            weaknesses,

        "recommendations":
            recommendations,

        "flags":
            flags,
    }


# =========================================================
# 🔹 DETAILED
# =========================================================

def generate_detailed_insights(
    data: Dict[str, Any],
    final_score: float
) -> Dict[str, Any]:

    base = generate_insights(
        data,
        final_score,
    )

    safe_data = normalize_input(
        data
    )

    base["metrics"] = {

        "communication":
            safe_data[
                "communication"
            ],

        "technical":
            safe_data[
                "technical"
            ],

        "domain":
            safe_data[
                "domain_score"
            ],

        "experience":
            safe_data[
                "experience"
            ],

        "feedback":
            safe_data[
                "feedback"
            ],

        "achievement":
            safe_data[
                "achievement"
            ],
    }

    return base


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_generate_insights(
    data: Dict[str, Any],
    final_score: float
) -> Dict[str, Any]:

    try:

        return generate_insights(

            data,

            final_score,
        )

    except Exception as e:

        print(
            f"[Insight Generator Error] {str(e)}"
        )

        return {

            "summary":
                "Insight generation failed",

            "strengths": [],

            "weaknesses": [],

            "recommendations": [],

            "flags": [],
        }


# =========================================================
# 🔹 BATCH
# =========================================================

def batch_generate_insights(
    data_list: List[
        Dict[str, Any]
    ],
    scores: List[float],
) -> List[
    Dict[str, Any]
]:

    results = []

    for index, data in enumerate(
        data_list
    ):

        score = (

            scores[index]

            if index < len(scores)

            else 0
        )

        insights = (
            safe_generate_insights(

                data,

                score,
            )
        )

        results.append(
            insights
        )

    return results


# =========================================================
# 🔹 DEBUG
# =========================================================

def debug_insights(
    data: Dict[str, Any],
    final_score: float
) -> Dict[str, Any]:

    normalized = normalize_input(
        data
    )

    generated = (
        generate_insights(

            normalized,

            final_score,
        )
    )

    return {

        "input_data":
            normalized,

        "score":
            final_score,

        "generated_insights":
            generated,
    }


# =========================================================
# 🔹 SUMMARY
# =========================================================

def summarize_insights(
    data: Dict[str, Any],
    final_score: float
) -> Dict[str, Any]:

    strengths = (
        detect_strengths(
            data
        )
    )

    weaknesses = (
        detect_weaknesses(
            data
        )
    )

    return {

        "summary":

            generate_performance_summary(
                final_score
            ),

        "strength_count":
            len(strengths),

        "weakness_count":
            len(weaknesses),

        "overall_rating":

            "Strong"

            if final_score >= GOOD_SCORE

            else "Average",
    }


# =========================================================
# 🔹 END
# =========================================================