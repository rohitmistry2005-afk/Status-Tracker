# app/controllers/evaluation_controllers.py

from typing import (
    Any,
    Dict,
    List,
    Optional,
    Tuple,
)

# =========================================================
# 🔹 PIPELINE IMPORTS
# =========================================================

from app.core.evaluation_pipeline import (

    debug_pipeline,

    evaluate_batch,

    evaluate_candidate,

    evaluate_minimal,

    safe_evaluate_candidate,

    summarize_batch,
)

# =========================================================
# 🔹 SCHEMA IMPORTS
# =========================================================

from app.models.evaluation_schema import (

    BatchEvaluationInput,

    CandidateInput,
)

# =========================================================
# 🔹 CONSTANTS
# =========================================================

API_VERSION = "4.0"

SERVICE_NAME = (
    "Teacher Evaluation API"
)

# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

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


def safe_string(
    value: Any,
    default: str = ""
) -> str:

    if value is None:

        return default

    return str(value).strip()


def safe_float(
    value: Any,
    default: float = 0
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

    except Exception:

        return default

# =========================================================
# 🔹 RESPONSE HELPERS
# =========================================================

def format_success_response(

    data: Any = None,

    message: str = "Success",
) -> Dict[str, Any]:

    response = {

        "success": True,

        "message": message,
    }

    if isinstance(
        data,
        dict,
    ):

        response.update(data)

    elif data is not None:

        response["data"] = data

    return response


def format_error_response(
    error: Optional[str]
) -> Dict[str, Any]:

    return {

        "success": False,

        "error":

            safe_string(
                error,
                "Unknown error",
            ),
    }

# =========================================================
# 🔹 PAYLOAD HELPERS
# =========================================================

def normalize_score_object(
    value: Any,
    key: str = "score",
    default: float = 7,
) -> Dict[str, float]:

    # -----------------------------------------------------
    # ALREADY VALID OBJECT
    # -----------------------------------------------------

    if isinstance(
        value,
        dict,
    ):

        return {

            key:

                safe_float(
                    value.get(
                        key,
                        default,
                    ),
                    default,
                )
        }

    # -----------------------------------------------------
    # RAW NUMBER
    # -----------------------------------------------------

    if isinstance(
        value,
        (
            int,
            float,
        ),
    ):

        return {

            key:

                safe_float(
                    value,
                    default,
                )
        }

    return {
        key: default
    }


# =========================================================
# 🔹 NORMALIZE PAYLOAD
# =========================================================

def normalize_candidate_payload(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    safe = ensure_object(
        data
    )

    # =====================================================
    # FEEDBACK COMPATIBILITY
    # =====================================================

    feedback_value = (

        safe.get(
            "student_feedback"
        )

        or safe.get(
            "feedback"
        )

        or {"rating": 7}
    )

    # =====================================================
    # TECH COMPATIBILITY
    # =====================================================

    tech_value = (

        safe.get(
            "tech"
        )

        or safe.get(
            "technical"
        )

        or {"score": 7}
    )

    # =====================================================
    # COMMUNICATION
    # =====================================================

    communication_value = (

        safe.get(
            "communication"
        )

        or {"score": 7}
    )

    # =====================================================
    # SKILLS
    # =====================================================

    skills = ensure_list(

        safe.get(
            "skills"
        )
    )

    required_skills = ensure_list(

        safe.get(
            "required_skills"
        )
    )

    # =====================================================
    # FINAL PAYLOAD
    # =====================================================

    normalized = {

        "teacher_id":

            safe_string(

                safe.get(
                    "teacher_id"
                )
            ),

        "name":

            safe_string(

                safe.get(
                    "name"
                )
            ),

        "location":

            safe.get(
                "location",
                "same",
            ),

        # -------------------------------------------------
        # NESTED OBJECT CONTRACTS
        # -------------------------------------------------

        "communication":

            normalize_score_object(
                communication_value,
                "score",
                7,
            ),

        "tech":

            normalize_score_object(
                tech_value,
                "score",
                7,
            ),

        "student_feedback":

            normalize_score_object(
                feedback_value,
                "rating",
                7,
            ),

        # -------------------------------------------------
        # EXPERIENCE
        # -------------------------------------------------

        "experience_years":

            safe_float(

                safe.get(
                    "experience_years",
                    0,
                )
            ),

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

        "achievements":

            safe_float(

                safe.get(
                    "achievements",
                    0,
                )
            ),

        # -------------------------------------------------
        # EDUCATION
        # -------------------------------------------------

        "education":

            ensure_object(

                safe.get(
                    "education",
                    {}
                )
            ),

        # -------------------------------------------------
        # CERTIFICATES
        # -------------------------------------------------

        "certificate":

            ensure_object(

                safe.get(
                    "certificate",
                    {}
                )
            ),

        # -------------------------------------------------
        # FLAGS
        # -------------------------------------------------

        "skip_flags":

            ensure_object(

                safe.get(
                    "skip_flags",
                    {}
                )
            ),
    }

    return normalized

# =========================================================
# 🔹 VALIDATE SINGLE
# =========================================================

def validate_single_input(
    data: Dict[str, Any]
) -> Tuple[
    bool,
    Optional[str],
]:

    safe = ensure_object(
        data
    )

    # -----------------------------------------------------
    # BASIC REQUIRED FIELDS
    # -----------------------------------------------------

    required_fields = [

        "communication",

        "tech",

        "experience_years",
    ]

    for field in required_fields:

        if field not in safe:

            return (

                False,

                f"Missing required field: {field}",
            )

    return True, None

# =========================================================
# 🔹 VALIDATE BATCH
# =========================================================

def validate_batch_input(
    data_list: List[
        Dict[str, Any]
    ]
) -> Tuple[
    bool,
    Optional[str],
]:

    if not isinstance(
        data_list,
        list,
    ):

        return (

            False,

            "Input must be a list",
        )

    if len(data_list) == 0:

        return (

            False,

            "Candidate list is empty",
        )

    return True, None

# =========================================================
# 🔹 NORMALIZE RESULT
# =========================================================

def normalize_result(
    result: Dict[str, Any]
) -> Dict[str, Any]:

    safe = ensure_object(
        result
    )

    safe.setdefault(
        "final_score",
        0,
    )

    safe.setdefault(
        "status",
        "REVIEW",
    )

    safe.setdefault(
        "score_breakdown",
        {},
    )

    safe.setdefault(
        "domain_breakdown",
        {},
    )

    safe.setdefault(
        "adjustments",
        {},
    )

    safe.setdefault(
        "insights",
        {},
    )

    safe.setdefault(
        "metadata",
        {},
    )

    return safe

# =========================================================
# 🔹 SINGLE EVALUATION
# =========================================================

def evaluate_single_controller(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    try:

        # -------------------------------------------------
        # NORMALIZE INPUT
        # -------------------------------------------------

        normalized_data = (
            normalize_candidate_payload(
                data
            )
        )

        # -------------------------------------------------
        # VALIDATE
        # -------------------------------------------------

        is_valid, error = (
            validate_single_input(
                normalized_data
            )
        )

        if not is_valid:

            return format_error_response(
                error
            )

        # -------------------------------------------------
        # EVALUATE
        # -------------------------------------------------

        result, success = (

            safe_evaluate_candidate(
                normalized_data
            )
        )

        if not success:

            return format_error_response(
                "Candidate evaluation failed"
            )

        normalized_result = (
            normalize_result(
                result
            )
        )

        return {

            "success": True,

            "message":

                "Candidate evaluated successfully",

            **normalized_result,
        }

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 SAFE SINGLE
# =========================================================

def safe_single_controller(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    try:

        return evaluate_single_controller(
            data
        )

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 BATCH EVALUATION
# =========================================================

def evaluate_batch_controller(
    data_list: List[
        Dict[str, Any]
    ]
) -> Dict[str, Any]:

    try:

        # -------------------------------------------------
        # VALIDATE
        # -------------------------------------------------

        is_valid, error = (
            validate_batch_input(
                data_list
            )
        )

        if not is_valid:

            return format_error_response(
                error
            )

        # -------------------------------------------------
        # NORMALIZE BATCH
        # -------------------------------------------------

        normalized_batch = [

            normalize_candidate_payload(
                candidate
            )

            for candidate
            in data_list
        ]

        # -------------------------------------------------
        # EVALUATE
        # -------------------------------------------------

        results = evaluate_batch(
            normalized_batch
        )

        results = [

            normalize_result(r)

            for r in results
        ]

        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        summary = summarize_batch(
            results
        )

        total_candidates = len(
            results
        )

        selected_count = len([

            r for r in results

            if r.get("status")
            == "SELECTED"
        ])

        strong_count = len([

            r for r in results

            if r.get("status")
            == "STRONG"
        ])

        review_count = len([

            r for r in results

            if r.get("status")
            == "REVIEW"
        ])

        rejected_count = len([

            r for r in results

            if r.get("status")
            == "REJECTED"
        ])

        average_score = round(

            sum(

                safe_float(

                    r.get(
                        "final_score",
                        0,
                    )
                )

                for r in results
            )

            / total_candidates,

            2,

        ) if total_candidates > 0 else 0

        return {

            "success": True,

            "message":
                "Batch evaluation completed",

            "total_candidates":
                total_candidates,

            "selected_count":
                selected_count,

            "strong_count":
                strong_count,

            "review_count":
                review_count,

            "rejected_count":
                rejected_count,

            "average_score":
                average_score,

            "summary":
                summary,

            "results":
                results,
        }

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 SAFE BATCH
# =========================================================

def safe_batch_controller(
    data_list: List[
        Dict[str, Any]
    ]
) -> Dict[str, Any]:

    try:

        return evaluate_batch_controller(
            data_list
        )

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 DEBUG
# =========================================================

def debug_evaluation_controller(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    try:

        normalized_data = (
            normalize_candidate_payload(
                data
            )
        )

        debug_data = debug_pipeline(
            normalized_data
        )

        return {

            "success": True,

            "message":
                "Debug evaluation successful",

            "debug":
                debug_data,
        }

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 MINIMAL
# =========================================================

def minimal_evaluation_controller(
    data: Dict[str, Any]
) -> Dict[str, Any]:

    try:

        normalized_data = (
            normalize_candidate_payload(
                data
            )
        )

        result = evaluate_minimal(
            normalized_data
        )

        return {

            "success": True,

            "message":
                "Minimal evaluation completed",

            **ensure_object(
                result
            ),
        }

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 ADVANCED
# =========================================================

def advanced_evaluation_controller(

    data: Dict[str, Any],

    debug: bool = False,

    minimal: bool = False,
) -> Dict[str, Any]:

    try:

        # -------------------------------------------------
        # DEBUG MODE
        # -------------------------------------------------

        if debug:

            return debug_evaluation_controller(
                data
            )

        # -------------------------------------------------
        # MINIMAL MODE
        # -------------------------------------------------

        if minimal:

            return minimal_evaluation_controller(
                data
            )

        # -------------------------------------------------
        # STANDARD MODE
        # -------------------------------------------------

        return evaluate_single_controller(
            data
        )

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 SCHEMA SINGLE
# =========================================================

def evaluate_with_schema(
    input_data: CandidateInput
) -> Dict[str, Any]:

    try:

        return evaluate_single_controller(

            input_data.model_dump()
        )

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 SCHEMA BATCH
# =========================================================

def evaluate_batch_with_schema(
    input_data: BatchEvaluationInput
) -> Dict[str, Any]:

    try:

        data_list = [

            candidate.model_dump()

            for candidate
            in input_data.candidates
        ]

        return evaluate_batch_controller(
            data_list
        )

    except Exception as e:

        return format_error_response(
            str(e)
        )

# =========================================================
# 🔹 HEALTH
# =========================================================

def health_check_controller() -> Dict[str, Any]:

    return {

        "success": True,

        "status":
            "online",

        "service":
            SERVICE_NAME,

        "version":
            API_VERSION,

        "frontend_ready":
            True,

        "batch_processing":
            True,

        "pipeline_ready":
            True,

        "explainable_ai":
            True,

        "available_routes": [

            "/evaluation/health",

            "/evaluation/evaluate",

            "/evaluation/evaluate/batch",

            "/evaluation/evaluate/debug",

            "/evaluation/evaluate/minimal",

            "/evaluation/evaluate/advanced",
        ],
    }

# =========================================================
# 🔹 TEST CONTROLLER
# =========================================================

def test_controller() -> Dict[str, Any]:

    sample_candidate = {

        "teacher_id":
            "T100",

        "name":
            "Test Teacher",

        "location":
            "same",

        "communication": {
            "score": 8
        },

        "tech": {

            "score": 8,

            "skills": [
                "python",
                "machine learning",
            ],
        },

        "experience_years":
            2,

        "skills": [

            "python",

            "machine learning",
        ],

        "required_skills": [

            "python",

            "machine learning",

            "deep learning",
        ],

        "student_feedback": {
            "rating": 9
        },

        "achievements":
            1,
    }

    return evaluate_single_controller(
        sample_candidate
    )

# =========================================================
# 🔹 INFO
# =========================================================

def controller_info() -> Dict[str, Any]:

    return {

        "controller":
            "Evaluation Controller",

        "architecture":
            "Modular Explainable AI Pipeline",

        "frontend_compatible":
            True,

        "version":
            API_VERSION,

        "supports": [

            "Single Evaluation",

            "Batch Evaluation",

            "Debug Evaluation",

            "Minimal Evaluation",

            "Advanced Evaluation",
        ],
    }

# =========================================================
# 🔹 END
# =========================================================