# app/services/utils/helpers.py

from typing import Any, Dict, List, Optional, Tuple, Union
import math


# =========================================================
# 🔹 BASIC TYPE HELPERS
# =========================================================

def to_float(value: Any, default: float = 0.0) -> float:
    """Safely convert to float"""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def to_int(value: Any, default: int = 0) -> int:
    """Safely convert to int"""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def to_str(value: Any, default: str = "") -> str:
    """Safely convert to string"""
    if value is None:
        return default
    return str(value)


def to_list(value: Any) -> List[Any]:
    """Ensure value is list"""
    if isinstance(value, list):
        return value
    return []


def to_dict(value: Any) -> Dict[str, Any]:
    """Ensure value is dict"""
    return value if isinstance(value, dict) else {}


# =========================================================
# 🔹 NUMERIC HELPERS
# =========================================================

def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp value within range"""
    return max(min_val, min(max_val, value))


def round_score(value: float, precision: int = 2) -> float:
    """Round number safely"""
    return round(value, precision)


def scale(value: float, old_min: float, old_max: float, new_min: float, new_max: float) -> float:
    """Scale value from one range to another"""
    if old_max == old_min:
        return new_min
    return new_min + ((value - old_min) * (new_max - new_min)) / (old_max - old_min)


def percentage_to_10(value: float) -> float:
    """Convert 0–100 → 0–10"""
    return clamp(value / 10.0, 0.0, 10.0)


# =========================================================
# 🔹 SAFE DATA ACCESS
# =========================================================

def safe_get(data: Dict[str, Any], path: List[str], default: Any = None) -> Any:
    """Safely get nested dictionary value"""
    temp = data
    for key in path:
        if isinstance(temp, dict) and key in temp:
            temp = temp[key]
        else:
            return default
    return temp


def has_keys(data: Dict[str, Any], keys: List[str]) -> bool:
    """Check if dict has required keys"""
    return all(key in data for key in keys)


# =========================================================
# 🔹 STRING HELPERS
# =========================================================

def normalize_text(text: str) -> str:
    """Lowercase and strip text"""
    return text.lower().strip()


def normalize_list(values: List[str]) -> List[str]:
    """Normalize list of strings"""
    return [normalize_text(v) for v in values if isinstance(v, str)]


def remove_duplicates(values: List[Any]) -> List[Any]:
    """Remove duplicates while preserving order"""
    seen = set()
    result = []
    for item in values:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


# =========================================================
# 🔹 SKILL HELPERS
# =========================================================

def match_skills(skills: List[str], required: List[str]) -> Tuple[int, int]:
    """Return matched count and total required"""
    skills_set = set(normalize_list(skills))
    required_set = set(normalize_list(required))

    matched = len(skills_set & required_set)
    total = len(required_set)

    return matched, total


def compute_relevance(skills: List[str], required: List[str]) -> float:
    """Compute skill relevance"""
    matched, total = match_skills(skills, required)
    if total == 0:
        return 0.0
    return round(matched / total, 2)


# =========================================================
# 🔹 LIST UTILITIES
# =========================================================

def flatten_list(nested: List[List[Any]]) -> List[Any]:
    """Flatten nested list"""
    return [item for sublist in nested for item in sublist]


def filter_none(values: List[Any]) -> List[Any]:
    """Remove None values"""
    return [v for v in values if v is not None]


# =========================================================
# 🔹 DICTIONARY UTILITIES
# =========================================================

def merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    """Merge two dictionaries"""
    result = a.copy()
    result.update(b)
    return result


def deep_merge_dicts(a: Dict[str, Any], b: Dict[str, Any]) -> Dict[str, Any]:
    """Deep merge dictionaries"""
    result = a.copy()

    for key, value in b.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value

    return result


# =========================================================
# 🔹 SCORE HELPERS
# =========================================================

def normalize_score(value: float) -> float:
    """Ensure score is between 0–10"""
    return clamp(value, 0.0, 10.0)


def normalize_percentage_score(value: float) -> float:
    """Ensure percentage is between 0–100"""
    return clamp(value, 0.0, 100.0)


def compute_weighted_sum(values: Dict[str, float], weights: Dict[str, float]) -> float:
    """Compute weighted sum"""
    total = 0.0
    for key in values:
        total += values[key] * weights.get(key, 0.0)
    return round_score(total)


# =========================================================
# 🔹 VALIDATION HELPERS
# =========================================================

def is_valid_score(value: Any) -> bool:
    """Check if value is valid numeric score"""
    try:
        v = float(value)
        return 0 <= v <= 100
    except:
        return False


def validate_required_fields(data: Dict[str, Any], fields: List[str]) -> bool:
    """Validate required fields exist"""
    for field in fields:
        if field not in data:
            return False
    return True


# =========================================================
# 🔹 MATH UTILITIES
# =========================================================

def safe_divide(a: float, b: float) -> float:
    """Safe division"""
    if b == 0:
        return 0.0
    return a / b


def sigmoid(x: float) -> float:
    """Sigmoid function"""
    return 1 / (1 + math.exp(-x))


# =========================================================
# 🔹 LOGGING / DEBUG HELPERS
# =========================================================

def log_debug(message: str) -> None:
    """Basic debug logger"""
    print(f"[DEBUG] {message}")


def log_error(message: str) -> None:
    """Basic error logger"""
    print(f"[ERROR] {message}")


# =========================================================
# 🔹 BATCH UTILITIES
# =========================================================

def chunk_list(data: List[Any], size: int) -> List[List[Any]]:
    """Split list into chunks"""
    return [data[i:i + size] for i in range(0, len(data), size)]


def map_safe(func, data_list: List[Any]) -> List[Any]:
    """Apply function safely to list"""
    results = []
    for item in data_list:
        try:
            results.append(func(item))
        except Exception:
            results.append(None)
    return results


# =========================================================
# 🔹 END OF FILE
# =========================================================