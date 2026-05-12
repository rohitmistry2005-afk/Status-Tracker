# app/services/domain/relevance_scorer.py

from typing import Dict, Any, List, Tuple, Set


# =========================================================
# 🔹 CONSTANTS
# =========================================================

MIN_RELEVANCE = 0.0
MAX_RELEVANCE = 1.0


# Optional: Skill synonym mapping (basic normalization)
SKILL_SYNONYMS = {
    "py": "python",
    "ml": "machine learning",
    "dl": "deep learning",
    "js": "javascript",
    "node": "nodejs",
    "reactjs": "react",
    "c++": "cpp"
}


# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_list(value: Any) -> List[str]:
    """Ensure value is a list of strings"""
    if isinstance(value, list):
        return [str(v).strip() for v in value if isinstance(v, str)]
    return []


def normalize_skill(skill: str) -> str:
    """Normalize skill string"""
    skill = skill.lower().strip()

    # Apply synonym mapping
    return SKILL_SYNONYMS.get(skill, skill)


def normalize_skills(skills: List[str]) -> List[str]:
    """Normalize list of skills"""
    return [normalize_skill(skill) for skill in skills]


def to_set(skills: List[str]) -> Set[str]:
    """Convert list to set"""
    return set(skills)


def clamp(value: float, min_val: float = MIN_RELEVANCE, max_val: float = MAX_RELEVANCE) -> float:
    """Clamp relevance score"""
    return max(min_val, min(max_val, value))


def round_score(value: float, precision: int = 2) -> float:
    """Round score"""
    return round(value, precision)


# =========================================================
# 🔹 CORE MATCHING LOGIC
# =========================================================

def calculate_basic_relevance(skills: List[str], required_skills: List[str]) -> float:
    """
    Basic formula:
    Relevance = matched / required
    """

    if not required_skills:
        return 0.0

    skills_set = to_set(skills)
    required_set = to_set(required_skills)

    matched = len(skills_set & required_set)

    return matched / len(required_set)


def calculate_weighted_relevance(
    skills: List[str],
    required_skills: List[str],
    weights: Dict[str, float]
) -> float:
    """
    Advanced weighted relevance (optional)
    """

    if not required_skills:
        return 0.0

    total_weight = 0.0
    matched_weight = 0.0

    for skill in required_skills:
        weight = weights.get(skill, 1.0)
        total_weight += weight

        if skill in skills:
            matched_weight += weight

    if total_weight == 0:
        return 0.0

    return matched_weight / total_weight


# =========================================================
# 🔹 MAIN RELEVANCE FUNCTION
# =========================================================

def calculate_relevance(data: Dict[str, Any]) -> float:
    """
    Main relevance calculation
    """

    # -----------------------------------------------------
    # Extract skills
    # -----------------------------------------------------
    skills_raw = safe_list(data.get("skills"))
    required_raw = safe_list(data.get("required_skills"))

    # -----------------------------------------------------
    # Normalize
    # -----------------------------------------------------
    skills = normalize_skills(skills_raw)
    required_skills = normalize_skills(required_raw)

    # -----------------------------------------------------
    # Compute relevance
    # -----------------------------------------------------
    relevance = calculate_basic_relevance(skills, required_skills)

    # -----------------------------------------------------
    # Clamp + round
    # -----------------------------------------------------
    relevance = clamp(relevance)
    return round_score(relevance)


# =========================================================
# 🔹 DEBUG VERSION
# =========================================================

def debug_relevance(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detailed breakdown
    """

    skills_raw = safe_list(data.get("skills"))
    required_raw = safe_list(data.get("required_skills"))

    skills = normalize_skills(skills_raw)
    required_skills = normalize_skills(required_raw)

    skills_set = to_set(skills)
    required_set = to_set(required_skills)

    matched_skills = list(skills_set & required_set)

    relevance = calculate_basic_relevance(skills, required_skills)

    return {
        "input": {
            "skills": skills_raw,
            "required_skills": required_raw
        },
        "normalized": {
            "skills": skills,
            "required_skills": required_skills
        },
        "matched_skills": matched_skills,
        "matched_count": len(matched_skills),
        "required_count": len(required_skills),
        "relevance": round_score(clamp(relevance))
    }


# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_input(data: Dict[str, Any]) -> bool:
    """Ensure required fields exist"""

    if "skills" not in data:
        return False

    if "required_skills" not in data:
        return False

    return True


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_calculate_relevance(data: Dict[str, Any]) -> Tuple[float, bool]:
    """
    Safe execution
    """

    try:
        if not validate_input(data):
            return 0.0, False

        score = calculate_relevance(data)
        return score, True

    except Exception as e:
        print(f"[Relevance Scorer Error] {e}")
        return 0.0, False


# =========================================================
# 🔹 BATCH PROCESSING
# =========================================================

def batch_calculate_relevance(data_list: List[Dict[str, Any]]) -> List[float]:
    """
    Process multiple candidates
    """

    results = []

    for item in data_list:
        score, valid = safe_calculate_relevance(item)

        if valid:
            results.append(score)
        else:
            results.append(0.0)

    return results


# =========================================================
# 🔹 INTERPRETATION
# =========================================================

def categorize_relevance(score: float) -> str:
    """
    Convert relevance score to category
    """

    if score < 0.3:
        return "Low"
    elif score < 0.6:
        return "Moderate"
    elif score < 0.8:
        return "High"
    return "Very High"


# =========================================================
# 🔹 SUMMARY FUNCTION
# =========================================================

def summarize_relevance(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quick summary
    """

    score = calculate_relevance(data)

    return {
        "score": score,
        "category": categorize_relevance(score)
    }


# =========================================================
# 🔹 ADVANCED EXTENSION (OPTIONAL)
# =========================================================

def calculate_relevance_with_weights(
    data: Dict[str, Any],
    weights: Dict[str, float]
) -> float:
    """
    Weighted relevance calculation
    """

    skills = normalize_skills(safe_list(data.get("skills")))
    required_skills = normalize_skills(safe_list(data.get("required_skills")))

    relevance = calculate_weighted_relevance(skills, required_skills, weights)

    return round_score(clamp(relevance))


# =========================================================
# 🔹 END OF FILE
# =========================================================