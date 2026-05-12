# app/services/rules/rule_engine.py

from typing import Dict, Any, Tuple, List, Optional


# =========================================================
# 🔹 CONSTANTS
# =========================================================

MIN_SCORE = 0.0
MAX_SCORE = 100.0


# Penalty Config
PENALTY_CONFIG = {
    "low_communication_cap": 60,
    "low_experience_penalty": 15,
    "low_relevance_penalty": 10
}


# Bonus Config
BONUS_CONFIG = {
    "strong_feedback_bonus": 5,
    "achievement_bonus": 3
}


# Thresholds
THRESHOLDS = {
    "communication_min": 5,
    "experience_min": 1,
    "relevance_min": 0.5,
    "feedback_strong": 8
}


# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def clamp(value: float, min_val: float = MIN_SCORE, max_val: float = MAX_SCORE) -> float:
    return max(min_val, min(max_val, value))


# =========================================================
# 🔹 PENALTY RULES
# =========================================================

def apply_communication_cap(score: float, communication: float) -> Tuple[float, Optional[str]]:
    """Cap score if communication is too low"""

    if communication < THRESHOLDS["communication_min"]:
        return min(score, PENALTY_CONFIG["low_communication_cap"]), "low_communication_cap"

    return score, None


def apply_experience_penalty(experience: float) -> Tuple[float, Optional[str]]:
    """Penalty for low experience"""

    if experience < THRESHOLDS["experience_min"]:
        return PENALTY_CONFIG["low_experience_penalty"], "low_experience"

    return 0.0, None


def apply_relevance_penalty(relevance: float) -> Tuple[float, Optional[str]]:
    """Penalty for low domain relevance"""

    if relevance < THRESHOLDS["relevance_min"]:
        return PENALTY_CONFIG["low_relevance_penalty"], "low_relevance"

    return 0.0, None


def apply_flag_penalties(flags: Dict[str, bool]) -> Tuple[float, List[str]]:
    """Penalty from flags"""

    penalty = 0.0
    reasons = []

    if flags.get("domain_mismatch"):
        penalty += 20
        reasons.append("domain_mismatch")

    if flags.get("low_communication"):
        penalty += 10
        reasons.append("flag_low_communication")

    return penalty, reasons


# =========================================================
# 🔹 BONUS RULES
# =========================================================

def apply_feedback_bonus(feedback: float) -> Tuple[float, Optional[str]]:
    """Bonus for strong feedback"""

    if feedback > THRESHOLDS["feedback_strong"]:
        return BONUS_CONFIG["strong_feedback_bonus"], "strong_feedback"

    return 0.0, None


def apply_achievement_bonus(value: float) -> Tuple[float, Optional[str]]:
    """Bonus for achievements"""

    if value > 0:
        return BONUS_CONFIG["achievement_bonus"], "achievement"

    return 0.0, None


# =========================================================
# 🔹 MAIN RULE ENGINE
# =========================================================

def apply_rules(
    base_score: float,
    data: Dict[str, Any],
    relevance: float
) -> Tuple[float, Dict[str, Any]]:
    """
    Apply all penalties and bonuses
    """

    score = safe_float(base_score)

    # Extract values
    communication = safe_float(data.get("communication"))
    experience = safe_float(data.get("experience"))
    feedback = safe_float(data.get("feedback"))
    achievement = safe_float(data.get("achievement_bonus"))
    flags = data.get("flags", {})

    total_penalty = 0.0
    total_bonus = 0.0

    penalty_reasons = []
    bonus_reasons = []

    # -----------------------------------------------------
    # Apply CAP (communication)
    # -----------------------------------------------------
    score, cap_reason = apply_communication_cap(score, communication)
    if cap_reason:
        penalty_reasons.append(cap_reason)

    # -----------------------------------------------------
    # Penalties
    # -----------------------------------------------------
    exp_penalty, reason = apply_experience_penalty(experience)
    if reason:
        penalty_reasons.append(reason)
    total_penalty += exp_penalty

    rel_penalty, reason = apply_relevance_penalty(relevance)
    if reason:
        penalty_reasons.append(reason)
    total_penalty += rel_penalty

    flag_penalty, flag_reasons = apply_flag_penalties(flags)
    total_penalty += flag_penalty
    penalty_reasons.extend(flag_reasons)

    # -----------------------------------------------------
    # Bonuses
    # -----------------------------------------------------
    fb_bonus, reason = apply_feedback_bonus(feedback)
    if reason:
        bonus_reasons.append(reason)
    total_bonus += fb_bonus

    ach_bonus, reason = apply_achievement_bonus(achievement)
    if reason:
        bonus_reasons.append(reason)
    total_bonus += ach_bonus

    # -----------------------------------------------------
    # Final Score
    # -----------------------------------------------------
    final_score = score + total_bonus - total_penalty
    final_score = clamp(final_score)

    return final_score, {
        "bonus": total_bonus,
        "penalty": total_penalty,
        "bonus_reasons": bonus_reasons,
        "penalty_reasons": penalty_reasons
    }


# =========================================================
# 🔹 DEBUG MODE
# =========================================================

def debug_rules(
    base_score: float,
    data: Dict[str, Any],
    relevance: float
) -> Dict[str, Any]:
    """
    Detailed rule breakdown
    """

    final_score, adjustments = apply_rules(base_score, data, relevance)

    return {
        "base_score": base_score,
        "final_score": final_score,
        "adjustments": adjustments,
        "input_data": data,
        "relevance": relevance
    }


# =========================================================
# 🔹 SAFE WRAPPER
# =========================================================

def safe_apply_rules(
    base_score: float,
    data: Dict[str, Any],
    relevance: float
) -> Tuple[float, Dict[str, Any], bool]:
    """
    Safe execution
    """

    try:
        final_score, adjustments = apply_rules(base_score, data, relevance)
        return final_score, adjustments, True

    except Exception as e:
        print(f"[Rule Engine Error] {e}")
        return 0.0, {}, False


# =========================================================
# 🔹 BATCH PROCESSING
# =========================================================

def batch_apply_rules(
    base_scores: List[float],
    data_list: List[Dict[str, Any]],
    relevance_list: List[float]
) -> List[float]:
    """
    Apply rules for multiple candidates
    """

    results = []

    for base, data, rel in zip(base_scores, data_list, relevance_list):
        final, _, valid = safe_apply_rules(base, data, rel)

        if valid:
            results.append(final)
        else:
            results.append(0.0)

    return results


# =========================================================
# 🔹 SUMMARY
# =========================================================

def summarize_rules(
    base_score: float,
    data: Dict[str, Any],
    relevance: float
) -> Dict[str, Any]:
    """
    Quick summary for reporting
    """

    final_score, adjustments = apply_rules(base_score, data, relevance)

    return {
        "base_score": base_score,
        "final_score": final_score,
        "bonus": adjustments["bonus"],
        "penalty": adjustments["penalty"]
    }


# =========================================================
# 🔹 END OF FILE
# =========================================================