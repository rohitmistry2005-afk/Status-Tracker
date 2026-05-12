# app/routes/evaluation_routes.py

from typing import (
    Any,
    Dict,
    List,
)

from fastapi import (
    APIRouter,
    Body,
    HTTPException,
    Query,
)

# =========================================================
# 🔹 CONTROLLERS
# =========================================================

from app.controllers.evaluation_controllers import (

    advanced_evaluation_controller,

    debug_evaluation_controller,

    health_check_controller,

    minimal_evaluation_controller,

    safe_batch_controller,

    safe_single_controller,
)

# =========================================================
# 🔹 SCHEMAS
# =========================================================

from app.models.evaluation_schema import (

    BatchEvaluationInput,

    CandidateInput,
)

# =========================================================
# 🔹 ROUTER
# =========================================================

router = APIRouter(

    prefix="/evaluation",

    tags=["Evaluation API"],
)

# =========================================================
# 🔹 SAFE HELPERS
# =========================================================

def safe_response(
    result: Any,
    default_message: str,
) -> Dict[str, Any]:

    # -----------------------------------------------------
    # ALWAYS RETURN JSON OBJECT
    # -----------------------------------------------------

    if isinstance(
        result,
        dict,
    ):

        result.setdefault(
            "success",
            True,
        )

        return result

    return {

        "success": True,

        "message":
            default_message,

        "data":
            result,
    }


def raise_api_error(
    result: Dict[str, Any],
    default_message: str,
):

    if not result.get(
        "success",
        False,
    ):

        raise HTTPException(

            status_code=400,

            detail=result.get(
                "error",
                default_message,
            ),
        )

# =========================================================
# 🔹 HEALTH CHECK
# =========================================================

@router.get("/health")
def health_check():

    result = health_check_controller()

    if isinstance(
        result,
        str,
    ):

        return {

            "success": True,

            "status":
                result,

            "version":
                "3.0",

            "environment":
                "development",

            "service":
                "Teacher Evaluation API",
        }

    if isinstance(
        result,
        dict,
    ):

        result.setdefault(
            "success",
            True,
        )

        result.setdefault(
            "status",
            "online",
        )

        result.setdefault(
            "version",
            "3.0",
        )

        result.setdefault(
            "environment",
            "development",
        )

        result.setdefault(
            "service",
            "Teacher Evaluation API",
        )

        return result

    return {

        "success": True,

        "status":
            "online",

        "version":
            "3.0",

        "environment":
            "development",

        "service":
            "Teacher Evaluation API",
    }

# =========================================================
# 🔹 SINGLE EVALUATION
# =========================================================

@router.post("/evaluate")
def evaluate_candidate_api(
    data: Dict[str, Any] = Body(...)
):

    try:

        result = safe_single_controller(
            data
        )

        raise_api_error(

            result,

            "Evaluation failed",
        )

        return safe_response(

            result,

            "Candidate evaluated successfully",
        )

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Internal evaluation error: {str(e)}",
        )

# =========================================================
# 🔹 SCHEMA SINGLE
# =========================================================

@router.post("/evaluate/schema")
def evaluate_candidate_schema_api(
    data: CandidateInput
):

    try:

        result = safe_single_controller(

            data.model_dump()
        )

        raise_api_error(

            result,

            "Schema evaluation failed",
        )

        return safe_response(

            result,

            "Schema evaluation successful",
        )

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Schema evaluation error: {str(e)}",
        )

# =========================================================
# 🔹 BATCH EVALUATION
# =========================================================

@router.post("/evaluate/batch")
def evaluate_batch_api(
    data: BatchEvaluationInput
):

    try:

        candidate_list = [

            item.model_dump()

            for item in data.candidates
        ]

        result = safe_batch_controller(
            candidate_list
        )

        raise_api_error(

            result,

            "Batch evaluation failed",
        )

        return safe_response(

            result,

            "Batch evaluation successful",
        )

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Batch evaluation error: {str(e)}",
        )

# =========================================================
# 🔹 BATCH SCHEMA
# =========================================================

@router.post("/evaluate/batch/schema")
def evaluate_batch_schema_api(
    data: BatchEvaluationInput
):

    try:

        candidate_list = [

            item.model_dump()

            for item in data.candidates
        ]

        result = safe_batch_controller(
            candidate_list
        )

        raise_api_error(

            result,

            "Batch schema evaluation failed",
        )

        return safe_response(

            result,

            "Batch schema evaluation successful",
        )

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Batch schema error: {str(e)}",
        )

# =========================================================
# 🔹 DEBUG
# =========================================================

@router.post("/evaluate/debug")
def debug_api(
    data: Dict[str, Any] = Body(...)
):

    try:

        result = debug_evaluation_controller(
            data
        )

        return {

            "success": True,

            "debug":
                result,
        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Debug pipeline error: {str(e)}",
        )

# =========================================================
# 🔹 MINIMAL
# =========================================================

@router.post("/evaluate/minimal")
def minimal_api(
    data: Dict[str, Any] = Body(...)
):

    try:

        result = minimal_evaluation_controller(
            data
        )

        raise_api_error(

            result,

            "Minimal evaluation failed",
        )

        return safe_response(

            result,

            "Minimal evaluation successful",
        )

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Minimal evaluation error: {str(e)}",
        )

# =========================================================
# 🔹 ADVANCED
# =========================================================

@router.post("/evaluate/advanced")
def advanced_api(

    data: Dict[str, Any] = Body(...),

    debug: bool = Query(False),

    minimal: bool = Query(False),
):

    try:

        result = advanced_evaluation_controller(

            data,

            debug=bool(debug),

            minimal=bool(minimal),
        )

        raise_api_error(

            result,

            "Advanced evaluation failed",
        )

        return safe_response(

            result,

            "Advanced evaluation successful",
        )

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"Advanced evaluation error: {str(e)}",
        )

# =========================================================
# 🔹 BATCH DEBUG
# =========================================================

@router.post("/evaluate/batch/debug")
def batch_debug_api(
    data: List[Dict[str, Any]] = Body(...)
):

    results = []

    for item in data:

        try:

            results.append({

                "success": True,

                "result":

                    debug_evaluation_controller(
                        item
                    ),
            })

        except Exception as e:

            results.append({

                "success": False,

                "error":
                    str(e),
            })

    return {

        "success": True,

        "count":
            len(results),

        "results":
            results,
    }

# =========================================================
# 🔹 BATCH MINIMAL
# =========================================================

@router.post("/evaluate/batch/minimal")
def batch_minimal_api(
    data: List[Dict[str, Any]] = Body(...)
):

    results = []

    for item in data:

        try:

            results.append({

                "success": True,

                "result":

                    minimal_evaluation_controller(
                        item
                    ),
            })

        except Exception as e:

            results.append({

                "success": False,

                "error":
                    str(e),
            })

    return {

        "success": True,

        "count":
            len(results),

        "results":
            results,
    }

# =========================================================
# 🔹 ROOT INFO
# =========================================================

@router.get("/")
def root_info():

    return {

        "success": True,

        "message":
            "Evaluation API Running",

        "version":
            "3.0",

        "available_endpoints": [

            "/evaluation/health",

            "/evaluation/evaluate",

            "/evaluation/evaluate/schema",

            "/evaluation/evaluate/batch",

            "/evaluation/evaluate/batch/schema",

            "/evaluation/evaluate/debug",

            "/evaluation/evaluate/minimal",

            "/evaluation/evaluate/advanced",

            "/evaluation/evaluate/batch/debug",

            "/evaluation/evaluate/batch/minimal",
        ],
    }

# =========================================================
# 🔹 TEST ROUTE
# =========================================================

@router.get("/test")
def test_route():

    sample = {

        "teacher_id":
            "T1",

        "name":
            "Test User",

        "communication": {
            "score": 8
        },

        "tech": {

            "score": 7,

            "skills": [
                "python",
                "ml",
            ],
        },

        "experience_years":
            2,

        "location":
            "same",

        "skills": [
            "python",
            "ml",
        ],

        "required_skills": [
            "python",
            "ml",
            "dl",
        ],

        "student_feedback": {
            "rating": 8
        },

        "achievements":
            2,
    }

    return safe_single_controller(
        sample
    )

# =========================================================
# 🔹 VERSION
# =========================================================

@router.get("/version")
def version_info():

    return {

        "name":
            "Teacher Evaluation API",

        "version":
            "3.0",

        "environment":
            "development",
    }

# =========================================================
# 🔹 READY CHECK
# =========================================================

@router.get("/ready")
def readiness_check():

    return {

        "ready": True,

        "status":
            "online",
    }

# =========================================================
# 🔹 ERROR DEMO
# =========================================================

@router.get("/error-demo")
def error_demo():

    raise HTTPException(

        status_code=500,

        detail="Demo error triggered",
    )

# =========================================================
# 🔹 END
# =========================================================