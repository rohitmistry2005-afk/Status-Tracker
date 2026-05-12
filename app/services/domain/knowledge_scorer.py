# app/services/domain/knowledge_scorer.py

from typing import Dict, Any, Tuple


# =========================================================
# 🔹 CONSTANTS
# =========================================================

MIN_SCORE = 0.0
MAX_SCORE = 10.0

# Weight distribution for knowledge calculation
KNOWLEDGE_WEIGHTS = {
    "domain_score": 0.40,     # certification/domain understanding
    "technical": 0.25,        # practical skills
    "experience": 0.20,       # real-world exposure
    "resume": 0.15            # resume strength
}


# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert to float"""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clamp(value: float, min_val: float = MIN_SCORE, max_val: float = MAX_SCORE) -> float:
    """Clamp value within range"""
    return max(min_val, min(max_val, value))


def round_score(value: float, precision: int = 2) -> float:
    """Round score"""
    return round(value, precision)


# =========================================================
# 🔹 CORE KNOWLEDGE COMPONENTS
# =========================================================

def score_domain_knowledge(domain_score: Any) -> float:
    """Base domain understanding"""
    value = clamp(safe_float(domain_score))
    return value


def score_technical_strength(technical: Any) -> float:
    """Technical skill depth"""
    value = clamp(safe_float(technical))
    return value


def score_experience_depth(experience: Any) -> float:
    """Experience contribution"""
    value = clamp(safe_float(experience))
    return value


def score_resume_strength(resume_score: Any) -> float:
    """Resume contribution (optional if available)"""
    value = safe_float(resume_score)

    # Resume usually comes as 0–100 → convert to 0–10
    value = value / 10 if value > 10 else value

    return clamp(value)


# =========================================================
# 🔹 CONSISTENCY CHECKS (ADVANCED)
# =========================================================

def consistency_bonus(domain_score: float, technical: float) -> float:
    """
    If domain + technical are both strong → bonus
    """
    if domain_score >= 7 and technical >= 7:
        return 1.0
    if domain_score >= 5 and technical >= 5:
        return 0.5
    return 0.0


def experience_alignment_bonus(experience: float, domain_score: float) -> float:
    """
    Bonus if experience aligns with strong domain
    """
    if experience >= 7 and domain_score >= 7:
        return 0.8
    if experience >= 5 and domain_score >= 5:
        return 0.4
    return 0.0


# =========================================================
# 🔹 MAIN KNOWLEDGE CALCULATION
# =========================================================

def calculate_knowledge(data: Dict[str, Any]) -> float:
    """
    Calculate final knowledge score (0–10)
    """

    # -----------------------------------------------------
    # Extract values
    # -----------------------------------------------------
    domain_score = score_domain_knowledge(data.get("domain_score"))
    technical = score_technical_strength(data.get("technical"))
    experience = score_experience_depth(data.get("experience"))
    resume_score = score_resume_strength(data.get("resume_score", 0))

    # -----------------------------------------------------
    # Weighted base score
    # -----------------------------------------------------
    base_score = (
        KNOWLEDGE_WEIGHTS["domain_score"] * domain_score +
        KNOWLEDGE_WEIGHTS["technical"] * technical +
        KNOWLEDGE_WEIGHTS["experience"] * experience +
        KNOWLEDGE_WEIGHTS["resume"] * resume_score
    )

    # -----------------------------------------------------
    # Bonuses
    # -----------------------------------------------------
    bonus = 0.0
    bonus += consistency_bonus(domain_score, technical)
    bonus += experience_alignment_bonus(experience, domain_score)

    # -----------------------------------------------------
    # Final score
    # -----------------------------------------------------
    final_score = clamp(base_score + bonus)

    return round_score(final_score)


# =========================================================
# 🔹 DEBUG VERSION
# =========================================================

def debug_knowledge(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detailed breakdown of knowledge scoring
    """

    domain_score = score_domain_knowledge(data.get("domain_score"))
    technical = score_technical_strength(data.get("technical"))
    experience = score_experience_depth(data.get("experience"))
    resume_score = score_resume_strength(data.get("resume_score", 0))

    base_score = (
        KNOWLEDGE_WEIGHTS["domain_score"] * domain_score +
        KNOWLEDGE_WEIGHTS["technical"] * technical +
        KNOWLEDGE_WEIGHTS["experience"] * experience +
        KNOWLEDGE_WEIGHTS["resume"] * resume_score
    )

    consistency = consistency_bonus(domain_score, technical)
    exp_bonus = experience_alignment_bonus(experience, domain_score)

    final = clamp(base_score + consistency + exp_bonus)

    return {
        "inputs": {
            "domain_score": domain_score,
            "technical": technical,
            "experience": experience,
            "resume_score": resume_score
        },
        "weights": KNOWLEDGE_WEIGHTS,
        "base_score": round_score(base_score),
        "bonuses": {
            "consistency": consistency,
            "experience_alignment": exp_bonus
        },
        "final_score": round_score(final)
    }


# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_input(data: Dict[str, Any]) -> bool:
    """
    Ensure required fields exist
    """

    required_fields = ["domain_score", "technical", "experience"]

    for field in required_fields:
        if field not in data:
            return False

    return True


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_calculate_knowledge(data: Dict[str, Any]) -> Tuple[float, bool]:
    """
    Safe execution with validation
    """

    try:
        if not validate_input(data):
            return 0.0, False

        score = calculate_knowledge(data)
        return score, True

    except Exception as e:
        print(f"[Knowledge Scorer Error] {e}")
        return 0.0, False


# =========================================================
# 🔹 BATCH PROCESSING
# =========================================================

def batch_calculate_knowledge(data_list: list) -> list:
    """
    Process multiple candidates
    """

    results = []

    for item in data_list:
        score, valid = safe_calculate_knowledge(item)

        if valid:
            results.append(score)
        else:
            results.append(0.0)

    return results


# =========================================================
# 🔹 SCORE CATEGORY (INTERPRETATION)
# =========================================================

def categorize_knowledge(score: float) -> str:
    """
    Convert score → level
    """

    if score <= 3:
        return "Beginner"
    elif score <= 6:
        return "Intermediate"
    elif score <= 8:
        return "Strong"
    return "Expert"


# =========================================================
# 🔹 SUMMARY FUNCTION
# =========================================================

def summarize_knowledge(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quick summary for reporting
    """

    score = calculate_knowledge(data)

    return {
        "score": score,
        "level": categorize_knowledge(score)
    }


# =========================================================
# 🔹 END OF FILE
# =========================================================