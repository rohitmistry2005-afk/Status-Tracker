# app/services/decision/decision_engine.py

from typing import Dict, Any, Tuple, List, Optional, Mapping


# =========================================================
# 🔹 CONSTANTS
# =========================================================

DEFAULT_THRESHOLDS: Mapping[str, float] = {
    "SELECTED": 85.0,
    "STRONG": 70.0,
    "REVIEW": 55.0,
    "REJECTED": 0.0
}

VALID_STATUSES = ["SELECTED", "STRONG", "REVIEW", "REJECTED"]


# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clamp_score(score: float) -> float:
    return max(0.0, min(100.0, score))


# =========================================================
# 🔹 CORE DECISION LOGIC
# =========================================================

def classify_score(score: float, thresholds: Mapping[str, float]) -> str:
    """
    Map score to status
    """

    if score >= thresholds["SELECTED"]:
        return "SELECTED"
    elif score >= thresholds["STRONG"]:
        return "STRONG"
    elif score >= thresholds["REVIEW"]:
        return "REVIEW"
    return "REJECTED"


# =========================================================
# 🔹 FLAG-BASED OVERRIDE
# =========================================================

def apply_flag_overrides(
    status: str,
    flags: Dict[str, bool]
) -> Tuple[str, Optional[str]]:

    if flags.get("domain_mismatch"):
        return "REJECTED", "domain_mismatch_override"

    if flags.get("low_communication") and status in ["SELECTED", "STRONG"]:
        return "REVIEW", "low_communication_override"

    return status, None


# =========================================================
# 🔹 MAIN DECISION FUNCTION
# =========================================================

def get_decision(
    final_score: float,
    data: Optional[Dict[str, Any]] = None,
    thresholds: Mapping[str, float] = DEFAULT_THRESHOLDS   # ✅ FIXED
) -> str:

    score = clamp_score(safe_float(final_score))
    status = classify_score(score, thresholds)

    if data:
        flags = data.get("flags", {})
        status, _ = apply_flag_overrides(status, flags)

    return status


# =========================================================
# 🔹 DETAILED DECISION
# =========================================================

def get_detailed_decision(
    final_score: float,
    data: Optional[Dict[str, Any]] = None,
    thresholds: Mapping[str, float] = DEFAULT_THRESHOLDS   # ✅ FIXED
) -> Dict[str, Any]:

    score = clamp_score(safe_float(final_score))

    base_status = classify_score(score, thresholds)

    override_reason = None
    final_status = base_status

    if data:
        flags = data.get("flags", {})
        final_status, override_reason = apply_flag_overrides(base_status, flags)

    return {
        "score": score,
        "base_status": base_status,
        "final_status": final_status,
        "override_reason": override_reason
    }


# =========================================================
# 🔹 VALIDATION
# =========================================================

def validate_thresholds(thresholds: Mapping[str, float]) -> bool:   # ✅ FIXED

    required_keys = set(DEFAULT_THRESHOLDS.keys())

    if set(thresholds.keys()) != required_keys:
        return False

    return True


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_get_decision(
    final_score: float,
    data: Optional[Dict[str, Any]] = None
) -> Tuple[str, bool]:

    try:
        return get_decision(final_score, data), True
    except Exception as e:
        print(f"[Decision Engine Error] {e}")
        return "REJECTED", False


# =========================================================
# 🔹 BATCH PROCESSING
# =========================================================

def batch_get_decisions(
    scores: List[float],
    data_list: Optional[List[Dict[str, Any]]] = None
) -> List[str]:

    results = []

    for i, score in enumerate(scores):

        data = data_list[i] if data_list and i < len(data_list) else None

        status, valid = safe_get_decision(score, data)
        results.append(status if valid else "REJECTED")

    return results


# =========================================================
# 🔹 INTERPRETATION
# =========================================================

def interpret_status(status: str) -> str:

    mapping = {
        "SELECTED": "Strong hire, ready to onboard",
        "STRONG": "Good candidate, minor improvements needed",
        "REVIEW": "Needs manual evaluation",
        "REJECTED": "Not suitable for the role"
    }

    return mapping.get(status, "Unknown")


# =========================================================
# 🔹 SUMMARY
# =========================================================

def summarize_decision(
    final_score: float,
    data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:

    decision = get_detailed_decision(final_score, data)

    return {
        "score": decision["score"],
        "status": decision["final_status"],
        "explanation": interpret_status(decision["final_status"])
    }


# =========================================================
# 🔹 UPDATE THRESHOLDS
# =========================================================

def update_thresholds(
    base_thresholds: Mapping[str, float],
    updates: Dict[str, float]
) -> Dict[str, float]:

    new_thresholds = dict(base_thresholds)

    for key, value in updates.items():
        if key in new_thresholds:
            new_thresholds[key] = safe_float(value)

    return new_thresholds


# =========================================================
# 🔹 DEBUG
# =========================================================

def debug_decision(
    final_score: float,
    data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:

    decision = get_detailed_decision(final_score, data)

    return {
        "input_score": final_score,
        "processed_score": decision["score"],
        "base_status": decision["base_status"],
        "final_status": decision["final_status"],
        "override": decision["override_reason"],
        "flags": data.get("flags") if data else {}
    }