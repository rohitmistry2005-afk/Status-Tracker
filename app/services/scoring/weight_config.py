# app/services/scoring/weight_config.py

from typing import Dict, Any, Optional
from copy import deepcopy


# =========================================================
# 🔹 DEFAULT WEIGHT CONFIGURATION
# =========================================================

DEFAULT_WEIGHTS: Dict[str, float] = {
    "communication": 0.25,
    "technical": 0.20,
    "domain": 0.20,
    "experience": 0.15,
    "location": 0.08,
    "feedback": 0.07,
    "achievement": 0.05
}


# =========================================================
# 🔹 ROLE-BASED CONFIGURATION
# =========================================================

ROLE_BASED_WEIGHTS: Dict[str, Dict[str, float]] = {

    "teacher": {
        "communication": 0.30,
        "technical": 0.15,
        "domain": 0.20,
        "experience": 0.15,
        "location": 0.05,
        "feedback": 0.10,
        "achievement": 0.05
    },

    "developer": {
        "communication": 0.15,
        "technical": 0.30,
        "domain": 0.25,
        "experience": 0.15,
        "location": 0.05,
        "feedback": 0.05,
        "achievement": 0.05
    },

    "data_scientist": {
        "communication": 0.15,
        "technical": 0.25,
        "domain": 0.30,
        "experience": 0.15,
        "location": 0.05,
        "feedback": 0.05,
        "achievement": 0.05
    },

    "manager": {
        "communication": 0.30,
        "technical": 0.10,
        "domain": 0.20,
        "experience": 0.20,
        "location": 0.05,
        "feedback": 0.10,
        "achievement": 0.05
    }
}


# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """
    Ensure weights sum to 1
    """
    total = sum(weights.values())

    if total == 0:
        return DEFAULT_WEIGHTS

    return {k: round(v / total, 4) for k, v in weights.items()}


def validate_weights(weights: Dict[str, float]) -> bool:
    """
    Validate weight structure
    """
    required_keys = set(DEFAULT_WEIGHTS.keys())

    if set(weights.keys()) != required_keys:
        return False

    total = sum(weights.values())

    # Allow small floating error tolerance
    return 0.99 <= total <= 1.01


# =========================================================
# 🔹 GETTERS
# =========================================================

def get_default_weights() -> Dict[str, float]:
    return deepcopy(DEFAULT_WEIGHTS)


def get_role_weights(role: str) -> Dict[str, float]:
    """
    Fetch weights based on role
    """
    role = (role or "").lower()

    if role in ROLE_BASED_WEIGHTS:
        return normalize_weights(deepcopy(ROLE_BASED_WEIGHTS[role]))

    return get_default_weights()


def get_weights(config: Optional[Dict[str, Any]] = None) -> Dict[str, float]:
    """
    Main entry for fetching weights
    """

    if not config:
        return get_default_weights()

    # Role-based
    role = config.get("role")
    if role:
        return get_role_weights(role)

    # Custom override
    custom = config.get("weights")
    if custom and isinstance(custom, dict):
        normalized = normalize_weights(custom)
        if validate_weights(normalized):
            return normalized

    return get_default_weights()


# =========================================================
# 🔹 UPDATE / OVERRIDE FUNCTIONS
# =========================================================

def update_weight(
    weights: Dict[str, float],
    key: str,
    value: float
) -> Dict[str, float]:
    """
    Update a single weight and normalize
    """

    if key not in weights:
        return weights

    weights[key] = safe_float(value)
    return normalize_weights(weights)


def bulk_update_weights(
    base_weights: Dict[str, float],
    updates: Dict[str, float]
) -> Dict[str, float]:
    """
    Update multiple weights
    """

    weights = deepcopy(base_weights)

    for key, value in updates.items():
        if key in weights:
            weights[key] = safe_float(value)

    return normalize_weights(weights)


# =========================================================
# 🔹 DEBUG / TRACE
# =========================================================

def debug_weights(weights: Dict[str, float]) -> Dict[str, Any]:
    """
    Provide detailed weight info
    """

    return {
        "weights": weights,
        "sum": round(sum(weights.values()), 4),
        "valid": validate_weights(weights)
    }


# =========================================================
# 🔹 COMPARISON UTILITIES
# =========================================================

def compare_weights(
    w1: Dict[str, float],
    w2: Dict[str, float]
) -> Dict[str, float]:
    """
    Compare two weight configs
    """

    comparison = {}

    for key in DEFAULT_WEIGHTS.keys():
        comparison[key] = round(w1.get(key, 0) - w2.get(key, 0), 4)

    return comparison


# =========================================================
# 🔹 ROLE DETECTION (OPTIONAL)
# =========================================================

def detect_role_from_domain(domain: str) -> str:
    """
    Auto-detect role from domain
    """

    domain = (domain or "").lower()

    if "science" in domain or "ai" in domain:
        return "data_scientist"

    if "software" in domain or "computer" in domain:
        return "developer"

    if "management" in domain:
        return "manager"

    return "teacher"


# =========================================================
# 🔹 SMART WEIGHT FETCHER
# =========================================================

def get_smart_weights(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Auto-select weights based on data
    """

    domain = data.get("domain") or data.get("education", {}).get("domain")

    role = detect_role_from_domain(domain)

    return get_role_weights(role)


# =========================================================
# 🔹 EXPORT / SERIALIZATION
# =========================================================

def export_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """
    Prepare weights for storage/logging
    """
    return {k: round(v, 4) for k, v in weights.items()}


# =========================================================
# 🔹 RESET FUNCTION
# =========================================================

def reset_weights() -> Dict[str, float]:
    """
    Reset to default
    """
    return get_default_weights()


# =========================================================
# 🔹 TEST FUNCTION
# =========================================================

def test_weight_system() -> Dict[str, Any]:
    """
    Simple test for validation
    """

    default = get_default_weights()
    teacher = get_role_weights("teacher")
    dev = get_role_weights("developer")

    return {
        "default_valid": validate_weights(default),
        "teacher_valid": validate_weights(teacher),
        "developer_valid": validate_weights(dev),
        "comparison_teacher_vs_default": compare_weights(teacher, default)
    }


# =========================================================
# 🔹 END OF FILE
# =========================================================