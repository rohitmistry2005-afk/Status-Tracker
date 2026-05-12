# app/services/domain/domain_combiner.py

from typing import Dict, Any, Tuple, List


# =========================================================
# 🔹 CONSTANTS
# =========================================================

MIN_SCORE = 0.0
MAX_SCORE = 10.0

DEFAULT_WEIGHTS = {
    "knowledge": 0.7,
    "relevance": 0.3
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
    """Clamp value"""
    return max(min_val, min(max_val, value))


def round_score(value: float, precision: int = 2) -> float:
    """Round score"""
    return round(value, precision)


# =========================================================
# 🔹 CORE COMBINATION LOGIC
# =========================================================

def scale_relevance(relevance: float) -> float:
    """
    Convert relevance (0–1) → (0–10)
    """
    return relevance * 10


def combine_domain_score(
    knowledge: float,
    relevance: float,
    weights: Dict[str, float] = DEFAULT_WEIGHTS
) -> float:
    """
    Core formula:
    Domain = 0.7 × Knowledge + 0.3 × (Relevance × 10)
    """

    knowledge = clamp(safe_float(knowledge))
    relevance = clamp(safe_float(relevance), 0, 1)

    relevance_scaled = scale_relevance(relevance)

    domain_score = (
        weights["knowledge"] * knowledge +
        weights["relevance"] * relevance_scaled
    )

    return round_score(clamp(domain_score))


# =========================================================
# 🔹 MAIN FUNCTION
# =========================================================

def combine_domain(data: Dict[str, Any]) -> float:
    """
    Combine domain score from input data
    """

    knowledge = safe_float(data.get("knowledge_score"))
    relevance = safe_float(data.get("skill_relevance"))

    return combine_domain_score(knowledge, relevance)


# =========================================================
# 🔹 DEBUG VERSION
# =========================================================

def debug_domain_combination(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detailed breakdown of domain calculation
    """

    knowledge = safe_float(data.get("knowledge_score"))
    relevance = safe_float(data.get("skill_relevance"))

    relevance_scaled = scale_relevance(relevance)

    weighted_knowledge = DEFAULT_WEIGHTS["knowledge"] * knowledge
    weighted_relevance = DEFAULT_WEIGHTS["relevance"] * relevance_scaled

    final_score = clamp(weighted_knowledge + weighted_relevance)

    return {
        "inputs": {
            "knowledge_score": knowledge,
            "relevance": relevance
        },
        "scaled": {
            "relevance_scaled": round_score(relevance_scaled)
        },
        "weights": DEFAULT_WEIGHTS,
        "components": {
            "knowledge_component": round_score(weighted_knowledge),
            "relevance_component": round_score(weighted_relevance)
        },
        "final_score": round_score(final_score)
    }


# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_inputs(data: Dict[str, Any]) -> bool:
    """Check required fields"""

    if "knowledge_score" not in data:
        return False

    if "skill_relevance" not in data:
        return False

    return True


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_combine_domain(data: Dict[str, Any]) -> Tuple[float, bool]:
    """
    Safe execution
    """

    try:
        if not validate_inputs(data):
            return 0.0, False

        score = combine_domain(data)
        return score, True

    except Exception as e:
        print(f"[Domain Combiner Error] {e}")
        return 0.0, False


# =========================================================
# 🔹 BATCH PROCESSING
# =========================================================

def batch_combine_domain(data_list: List[Dict[str, Any]]) -> List[float]:
    """
    Process multiple candidates
    """

    results = []

    for item in data_list:
        score, valid = safe_combine_domain(item)

        if valid:
            results.append(score)
        else:
            results.append(0.0)

    return results


# =========================================================
# 🔹 CATEGORY MAPPING
# =========================================================

def categorize_domain(score: float) -> str:
    """
    Map score to category
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

def summarize_domain(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Quick summary
    """

    score = combine_domain(data)

    return {
        "score": score,
        "level": categorize_domain(score)
    }


# =========================================================
# 🔹 ADVANCED CONFIGURATION
# =========================================================

def combine_with_custom_weights(
    knowledge: float,
    relevance: float,
    knowledge_weight: float,
    relevance_weight: float
) -> float:
    """
    Custom weight combination
    """

    weights = {
        "knowledge": knowledge_weight,
        "relevance": relevance_weight
    }

    return combine_domain_score(knowledge, relevance, weights)


# =========================================================
# 🔹 EDGE CASE HANDLING
# =========================================================

def handle_missing_values(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Fill missing values safely
    """

    return {
        "knowledge_score": safe_float(data.get("knowledge_score", 0)),
        "skill_relevance": safe_float(data.get("skill_relevance", 0))
    }


# =========================================================
# 🔹 NORMALIZED PIPELINE ENTRY
# =========================================================

def prepare_domain_input(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Prepare data before combining
    """

    cleaned = handle_missing_values(data)

    return {
        "knowledge_score": clamp(cleaned["knowledge_score"]),
        "skill_relevance": clamp(cleaned["skill_relevance"], 0, 1)
    }


# =========================================================
# 🔹 FULL PIPELINE HELPER
# =========================================================

def full_domain_pipeline(data: Dict[str, Any]) -> float:
    """
    Complete domain computation pipeline
    """

    prepared = prepare_domain_input(data)
    return combine_domain(prepared)


# =========================================================
# 🔹 END OF FILE
# =========================================================